/**
 * Credits Service
 *
 * ServiÃ§o para gerenciar crÃ©ditos de regeneraÃ§Ã£o
 * FASE 1: Sistema de RegeneraÃ§Ã£o
 *
 * Sistema duplo de limites:
 * - 20 crÃ©ditos/mÃªs (limite principal)
 * - Cooldown de 10s (anti-spam)
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_MONTHLY_CREDITS, CREDIT_COOLDOWN_SECONDS } from '@/config/credits';

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
 * Buscar crÃ©ditos do usuÃ¡rio
 * Se nÃ£o existir registro, cria automaticamente com os crÃ©ditos padrÃ£o
 *
 * @param userId - ID do usuÃ¡rio
 * @returns CrÃ©ditos do usuÃ¡rio
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('âŒ Erro ao buscar crÃ©ditos:', error);
    throw error;
  }

  // Se nÃ£o existe, criar
  if (!data) {
    const { data: newCredits, error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_remaining: DEFAULT_MONTHLY_CREDITS,
        credits_total: DEFAULT_MONTHLY_CREDITS,
        last_reset_at: new Date().toISOString(),
        last_generation_at: null
      })
      .select()
      .single();

    if (insertError) {
      console.error('âŒ Erro ao criar crÃ©ditos:', insertError);
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
 * Consumir crÃ©dito (valida cooldown + limite)
 * Usa funÃ§Ã£o SQL consume_credit que garante atomicidade
 *
 * @param userId - ID do usuÃ¡rio
 * @returns Resultado do consumo (success, credits_remaining, message)
 */
export async function consumeCredit(userId: string): Promise<ConsumeResult> {
  const { data, error } = await supabase.rpc('consume_credit', {
    p_user_id: userId
  });

  if (error) {
    console.error('âŒ Erro ao consumir crÃ©dito:', error);
    throw error;
  }

  // A funÃ§Ã£o SQL retorna um array com 1 elemento
  const result = Array.isArray(data) ? data[0] : data;

  if (!result) {
    throw new Error('Resposta invÃ¡lida da funÃ§Ã£o consume_credit');
  }

  if (!result.success) {
    console.warn('âš ï¸ CrÃ©dito nÃ£o consumido:', result.message);
  } else {
    console.log('âœ… CrÃ©dito consumido. Restantes:', result.credits_remaining);
  }

  return {
    success: result.success,
    credits_remaining: result.credits_remaining,
    message: result.message
  };
}

/**
 * Verificar se pode regenerar (sem consumir crÃ©dito)
 * ValidaÃ§Ã£o client-side antes de abrir modal
 *
 * @param userId - ID do usuÃ¡rio
 * @returns Status de permissÃ£o para regenerar
 */
export async function canRegenerate(userId: string): Promise<{
  canRegenerate: boolean;
  reason?: string;
  creditsRemaining: number;
  cooldownSeconds?: number;
}> {
  const credits = await getUserCredits(userId);

  // Verificar crÃ©ditos
  if (credits.credits_remaining <= 0) {
    return {
      canRegenerate: false,
      reason: `Você atingiu o limite de ${DEFAULT_MONTHLY_CREDITS} gerações mensais. Seus créditos serão renovados no próximo ciclo.`,
      creditsRemaining: 0
    };
  }

  // Verificar cooldown
  if (credits.last_generation_at) {
    const lastGen = new Date(credits.last_generation_at);
    const secondsSince = (Date.now() - lastGen.getTime()) / 1000;

    if (secondsSince < CREDIT_COOLDOWN_SECONDS) {
      const remainingCooldown = CREDIT_COOLDOWN_SECONDS - secondsSince;
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
 * Calcula quantos dias faltam para o próximo reset (sempre no dia 1 de cada mês).
 *
 * @param lastResetAt - Data do último reset
 * @returns Dias até o próximo reset
 */
export function getDaysUntilReset(lastResetAt: string): number {
  const lastReset = new Date(lastResetAt);
  const now = new Date();

  // Próximo dia 1
  const nextReset = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );

  // Se já passou do dia 1 deste mês
  if (now.getDate() === 1 && now.getHours() === 0) {
    // É exatamente dia 1 à meia-noite, reset acontece agora
    return 0;
  }

  const diffMs = nextReset.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Formata mensagens de erro para o usuário
 *
 * @param message - Mensagem técnica
 * @param creditsRemaining - Créditos restantes
 * @returns Mensagem formatada
 */
export function formatCreditError(message: string, creditsRemaining: number): string {
  if (creditsRemaining <= 0) {
    return `Você atingiu o limite de ${DEFAULT_MONTHLY_CREDITS} gerações mensais. Seus créditos serão renovados no próximo mês.`;
  }

  if (message.includes('Aguarde')) {
    return message; // JÃ¡ estÃ¡ formatado
  }

  return 'Não foi possível gerar novas combinações. Tente novamente.';
}
