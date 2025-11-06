/**
 * Generation Service
 *
 * Serviço para gerenciar histórico de gerações de combinações
 * FASE 1: Sistema de Regeneração
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type GenerationHistory = Database['public']['Tables']['generation_history']['Row'];
type GenerationInsert = Database['public']['Tables']['generation_history']['Insert'];

export interface GenerationHistoryItem {
  id: string;
  contest_number: number;
  accuracy_rate: number;
  generated_at: string;
  is_active: boolean;
  generated_numbers: number[][];
  hot_numbers: number[];
  cold_numbers: number[];
  draws_analyzed: number;
}

/**
 * Buscar histórico de gerações de um concurso
 *
 * @param userId - ID do usuário
 * @param lotteryType - Tipo da loteria (lotofacil, lotomania, etc)
 * @param contestNumber - Número do concurso
 * @returns Array de gerações ordenadas por data (mais recente primeiro)
 */
export async function getGenerationHistory(
  userId: string,
  lotteryType: string,
  contestNumber: number
): Promise<GenerationHistoryItem[]> {
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .eq('lottery_type', lotteryType)
    .eq('contest_number', contestNumber)
    .order('generated_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    throw error;
  }

  return data.map(row => ({
    id: row.id,
    contest_number: row.contest_number,
    accuracy_rate: Number(row.accuracy_rate),
    generated_at: row.generated_at || new Date().toISOString(),
    is_active: row.is_active,
    generated_numbers: row.generated_numbers as number[][],
    hot_numbers: row.hot_numbers,
    cold_numbers: row.cold_numbers,
    draws_analyzed: row.draws_analyzed
  }));
}

/**
 * Buscar geração ativa de um concurso
 *
 * @param userId - ID do usuário
 * @param lotteryType - Tipo da loteria
 * @param contestNumber - Número do concurso
 * @returns Geração ativa ou null se não existir
 */
export async function getActiveGeneration(
  userId: string,
  lotteryType: string,
  contestNumber: number
): Promise<GenerationHistoryItem | null> {
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .eq('lottery_type', lotteryType)
    .eq('contest_number', contestNumber)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar geração ativa:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    contest_number: data.contest_number,
    accuracy_rate: Number(data.accuracy_rate),
    generated_at: data.generated_at || new Date().toISOString(),
    is_active: data.is_active,
    generated_numbers: data.generated_numbers as number[][],
    hot_numbers: data.hot_numbers,
    cold_numbers: data.cold_numbers,
    draws_analyzed: data.draws_analyzed
  };
}

/**
 * Salvar nova geração
 * Automaticamente desmarca gerações anteriores e marca a nova como ativa
 *
 * @param userId - ID do usuário
 * @param lotteryType - Tipo da loteria
 * @param contestNumber - Número do concurso
 * @param data - Dados da geração
 * @returns ID da nova geração
 */
export async function saveGeneration(
  userId: string,
  lotteryType: string,
  contestNumber: number,
  data: {
    generated_numbers: number[][];
    hot_numbers: number[];
    cold_numbers: number[];
    accuracy_rate: number;
    draws_analyzed: number;
  }
): Promise<string> {
  // 1. Desmarcar todas as gerações do concurso
  const { error: updateError } = await supabase
    .from('generation_history')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('lottery_type', lotteryType)
    .eq('contest_number', contestNumber);

  if (updateError) {
    console.warn('⚠️ Aviso ao desmarcar gerações antigas:', updateError);
    // Não é fatal, continua
  }

  // 2. Inserir nova geração (ativa)
  const { data: newGen, error } = await supabase
    .from('generation_history')
    .insert({
      user_id: userId,
      lottery_type: lotteryType,
      contest_number: contestNumber,
      strategy_type: 'balanced',
      generated_numbers: data.generated_numbers as any,
      hot_numbers: data.hot_numbers,
      cold_numbers: data.cold_numbers,
      accuracy_rate: data.accuracy_rate,
      draws_analyzed: data.draws_analyzed,
      is_active: true
    } as GenerationInsert)
    .select('id')
    .single();

  if (error) {
    console.error('❌ Erro ao salvar geração:', error);
    throw error;
  }

  console.log('✅ Nova geração salva:', newGen.id);
  return newGen.id;
}

/**
 * Definir geração como ativa
 * Usa a função SQL set_active_generation para garantir atomicidade
 *
 * @param userId - ID do usuário
 * @param lotteryType - Tipo da loteria
 * @param contestNumber - Número do concurso
 * @param generationId - ID da geração a ser ativada
 */
export async function setActiveGeneration(
  userId: string,
  lotteryType: string,
  contestNumber: number,
  generationId: string
): Promise<void> {
  const { error } = await supabase.rpc('set_active_generation', {
    p_user_id: userId,
    p_lottery_type: lotteryType,
    p_contest_number: contestNumber,
    p_generation_id: generationId
  });

  if (error) {
    console.error('❌ Erro ao definir geração ativa:', error);
    throw error;
  }

  console.log('✅ Geração ativa alterada:', generationId);
}

/**
 * Deletar geração
 * Não permite deletar geração ativa
 *
 * @param generationId - ID da geração
 * @param userId - ID do usuário (para validação)
 */
export async function deleteGeneration(
  generationId: string,
  userId: string
): Promise<void> {
  // Verificar se não é a geração ativa
  const { data: generation, error: fetchError } = await supabase
    .from('generation_history')
    .select('is_active')
    .eq('id', generationId)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error('❌ Erro ao verificar geração:', fetchError);
    throw fetchError;
  }

  if (generation.is_active) {
    throw new Error('Não é possível deletar a geração ativa');
  }

  const { error } = await supabase
    .from('generation_history')
    .delete()
    .eq('id', generationId)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Erro ao deletar geração:', error);
    throw error;
  }

  console.log('✅ Geração deletada:', generationId);
}
