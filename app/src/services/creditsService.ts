/**
 * Credits Service
 *
 * Serviço para gerenciar créditos de regeneração
 * FASE 1: Sistema de Regeneração
 *
 * Sistema duplo de limites:
 * - 50 créditos/mês (limite principal)
 * - Cooldown de 10s (anti-spam)
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserCredits {
  credits_remaining: number;
  credits_total: number;
  last_reset_at: string;
  last_generation_at: string | null;
}

export interface ConsumeResult {
  success: boolean;
  credits_remaining: number;
  message: string;
}

/**
 * Buscar créditos do usuário
 * Se não existir registro, cria automaticamente com 50 créditos
 *
 * @param userId - ID do usuário
 * @returns Créditos do usuário
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar créditos:', error);
    throw error;
  }

  // Se não existe, criar
  if (!data) {
    const { data: newCredits, error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_remaining: 50,
        credits_total: 50,
        last_reset_at: new Date().toISOString(),
        last_generation_at: null
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar créditos:', insertError);
      throw insertError;
    }

    return {
      credits_remaining: newCredits.credits_remaining,
      credits_total: newCredits.credits_total,
      last_reset_at: newCredits.last_reset_at || new Date().toISOString(),
      last_generation_at: newCredits.last_generation_at
    };
  }

  return {
    credits_remaining: data.credits_remaining,
    credits_total: data.credits_total,
    last_reset_at: data.last_reset_at || new Date().toISOString(),
    last_generation_at: data.last_generation_at
  };
}

/**
 * Consumir crédito (valida cooldown + limite)
 * Usa função SQL consume_credit que garante atomicidade
 *
 * @param userId - ID do usuário
 * @returns Resultado do consumo (success, credits_remaining, message)
 */
export async function consumeCredit(userId: string): Promise<ConsumeResult> {
  const { data, error } = await supabase.rpc('consume_credit', {
    p_user_id: userId
  });

  if (error) {
    console.error('❌ Erro ao consumir crédito:', error);
    throw error;
  }

  // A função SQL retorna um array com 1 elemento
  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error('Resposta inválida da função consume_credit');
  }

  if (!result.success) {
    console.warn('⚠️ Crédito não consumido:', result.message);
  } else {
    console.log('✅ Crédito consumido. Restantes:', result.credits_remaining);
  }

  return {
    success: result.success,
    credits_remaining: result.credits_remaining,
    message: result.message
  };
}

/**
 * Verificar se pode regenerar (sem consumir crédito)
 * Validação client-side antes de abrir modal
 *
 * @param userId - ID do usuário
 * @returns Status de permissão para regenerar
 */
export async function canRegenerate(userId: string): Promise<{
  canRegenerate: boolean;
  reason?: string;
  creditsRemaining: number;
  cooldownSeconds?: number;
}> {
  const credits = await getUserCredits(userId);

  // Verificar créditos
  if (credits.credits_remaining <= 0) {
    return {
      canRegenerate: false,
      reason: 'Você atingiu o limite de 50 gerações mensais. Seus créditos serão renovados no próximo ciclo.',
      creditsRemaining: 0
    };
  }

  // Verificar cooldown
  if (credits.last_generation_at) {
    const lastGen = new Date(credits.last_generation_at);
    const secondsSince = (Date.now() - lastGen.getTime()) / 1000;

    if (secondsSince < 10) {
      const remainingCooldown = 10 - secondsSince;
      return {
        canRegenerate: false,
        reason: `Aguarde ${Math.ceil(remainingCooldown)} segundos para gerar novamente.`,
        creditsRemaining: credits.credits_remaining,
        cooldownSeconds: remainingCooldown
      };
    }
  }

  return {
    canRegenerate: true,
    creditsRemaining: credits.credits_remaining
  };
}

/**
 * Calcular dias até o próximo reset
 * Reset acontece todo dia 1º do mês
 *
 * @param lastResetAt - Data do último reset
 * @returns Dias até o próximo reset
 */
export function getDaysUntilReset(lastResetAt: string): number {
  const lastReset = new Date(lastResetAt);
  const now = new Date();

  // Próximo dia 1º
  const nextReset = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );

  // Se já passou do dia 1º deste mês
  if (now.getDate() === 1 && now.getHours() === 0) {
    // É exatamente dia 1º à meia-noite, reset acontece agora
    return 0;
  }

  const diffMs = nextReset.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Formatar mensagem de erro de forma user-friendly
 *
 * @param message - Mensagem técnica
 * @param creditsRemaining - Créditos restantes
 * @returns Mensagem formatada
 */
export function formatCreditError(message: string, creditsRemaining: number): string {
  if (creditsRemaining <= 0) {
    return 'Você atingiu o limite de 50 gerações mensais. Seus créditos serão renovados no próximo mês.';
  }

  if (message.includes('Aguarde')) {
    return message; // Já está formatado
  }

  return 'Não foi possível gerar novas combinações. Tente novamente.';
}
