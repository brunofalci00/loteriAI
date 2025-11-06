/**
 * Saved Games Service
 *
 * Serviço para gerenciar jogos salvos:
 * - Salvar/dessalvar jogos (limite 50)
 * - Editar nome do jogo
 * - Marcar como jogado
 * - Listar com filtros
 * - Verificar se jogo está salvo
 * - Estatísticas agregadas
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SavedGame = Database['public']['Tables']['saved_games']['Row'];
type SavedGameInsert = Database['public']['Tables']['saved_games']['Insert'];
type SavedGameUpdate = Database['public']['Tables']['saved_games']['Update'];

export interface SaveGameParams {
  generationId?: string | null; // NULL para jogos manuais (Fase 3)
  lotteryType: string;
  contestNumber: number;
  numbers: number[];
  analysisResult: {
    hotCount: number;
    coldCount: number;
    balancedCount: number;
    score?: number;
    accuracy?: number;
    [key: string]: any;
  };
  source: 'ai_generated' | 'manual_created';
  strategyType?: string | null;
  name?: string | null;
}

export interface UpdateGameNameParams {
  gameId: string;
  name: string | null;
}

export interface MarkAsPlayedParams {
  gameId: string;
}

/**
 * Salva um jogo (gerado ou manual)
 * Valida limite de 50 jogos antes de salvar
 */
export async function saveGame(params: SaveGameParams): Promise<{
  success: boolean;
  data?: SavedGame;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Validar limite de 50 jogos
    const { count, error: countError } = await supabase
      .from('saved_games')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('❌ Erro ao verificar limite:', countError);
      return { success: false, error: 'Erro ao verificar limite de jogos' };
    }

    if (count !== null && count >= 50) {
      return {
        success: false,
        error: 'Limite de 50 jogos salvos atingido. Exclua alguns para salvar novos.'
      };
    }

    // Validar nome (max 50 chars)
    if (params.name && params.name.length > 50) {
      return {
        success: false,
        error: 'Nome do jogo deve ter no máximo 50 caracteres'
      };
    }

    // Inserir jogo salvo
    const insertData: SavedGameInsert = {
      user_id: user.id,
      generation_id: params.generationId || null,
      lottery_type: params.lotteryType,
      contest_number: params.contestNumber,
      numbers: params.numbers,
      analysis_result: params.analysisResult as any,
      source: params.source,
      strategy_type: params.strategyType || null,
      name: params.name || null,
      play_count: 0,
      last_played_at: null,
    };

    const { data, error } = await supabase
      .from('saved_games')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar jogo:', error);

      // Tratamento especial para erro de constraint unique
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Você já salvou este jogo para este concurso'
        };
      }

      return { success: false, error: error.message };
    }

    console.log('✅ Jogo salvo:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao salvar jogo:', error);
    return {
      success: false,
      error: 'Erro inesperado ao salvar jogo'
    };
  }
}

/**
 * Remove jogo dos salvos (hard delete)
 */
export async function unsaveGame(gameId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { error } = await supabase
      .from('saved_games')
      .delete()
      .eq('id', gameId)
      .eq('user_id', user.id); // RLS garante, mas boa prática validar

    if (error) {
      console.error('❌ Erro ao remover jogo:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Jogo removido:', gameId);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro inesperado ao remover jogo:', error);
    return {
      success: false,
      error: 'Erro inesperado ao remover jogo'
    };
  }
}

/**
 * Lista todos os jogos salvos do usuário
 * @param filters - Filtros opcionais (lotteryType, source)
 */
export async function listSavedGames(filters?: {
  lotteryType?: string;
  source?: 'ai_generated' | 'manual_created';
}): Promise<{
  success: boolean;
  data?: SavedGame[];
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    let query = supabase
      .from('saved_games')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (filters?.lotteryType) {
      query = query.eq('lottery_type', filters.lotteryType);
    }

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao listar jogos:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${data.length} jogos carregados`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao listar jogos:', error);
    return {
      success: false,
      error: 'Erro inesperado ao listar jogos'
    };
  }
}

/**
 * Busca um jogo salvo específico
 */
export async function getSavedGame(gameId: string): Promise<{
  success: boolean;
  data?: SavedGame;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('saved_games')
      .select('*')
      .eq('id', gameId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar jogo:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar jogo:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar jogo'
    };
  }
}

/**
 * Atualiza o nome de um jogo salvo
 * @param params - gameId e novo nome (max 50 caracteres ou null)
 */
export async function updateGameName(params: UpdateGameNameParams): Promise<{
  success: boolean;
  data?: SavedGame;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Validar nome (max 50 chars)
    if (params.name && params.name.length > 50) {
      return {
        success: false,
        error: 'Nome do jogo deve ter no máximo 50 caracteres'
      };
    }

    const updateData: SavedGameUpdate = {
      name: params.name || null,
    };

    const { data, error } = await supabase
      .from('saved_games')
      .update(updateData)
      .eq('id', params.gameId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar nome:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Nome atualizado:', params.gameId);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao atualizar nome:', error);
    return {
      success: false,
      error: 'Erro inesperado ao atualizar nome'
    };
  }
}

/**
 * Marca um jogo como jogado
 * Incrementa play_count e atualiza last_played_at
 */
export async function markAsPlayed(params: MarkAsPlayedParams): Promise<{
  success: boolean;
  data?: SavedGame;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Buscar jogo atual para incrementar play_count
    const { data: currentGame, error: fetchError } = await supabase
      .from('saved_games')
      .select('play_count')
      .eq('id', params.gameId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar jogo:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const newPlayCount = (currentGame.play_count || 0) + 1;

    const updateData: SavedGameUpdate = {
      play_count: newPlayCount,
      last_played_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('saved_games')
      .update(updateData)
      .eq('id', params.gameId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao marcar como jogado:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Jogo marcado como jogado (${newPlayCount}x):`, params.gameId);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao marcar como jogado:', error);
    return {
      success: false,
      error: 'Erro inesperado ao marcar como jogado'
    };
  }
}

/**
 * Desmarca um jogo como jogado
 * Decrementa play_count (mínimo 0) e limpa last_played_at se chegar a 0
 */
export async function unmarkAsPlayed(params: MarkAsPlayedParams): Promise<{
  success: boolean;
  data?: SavedGame;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Buscar jogo atual para decrementar play_count
    const { data: currentGame, error: fetchError } = await supabase
      .from('saved_games')
      .select('play_count')
      .eq('id', params.gameId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar jogo:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Decrementar play_count (mínimo 0)
    const newPlayCount = Math.max((currentGame.play_count || 0) - 1, 0);

    const updateData: SavedGameUpdate = {
      play_count: newPlayCount,
      // Se chegou a 0, limpar last_played_at
      last_played_at: newPlayCount === 0 ? null : new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('saved_games')
      .update(updateData)
      .eq('id', params.gameId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao desmarcar como jogado:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Jogo desmarcado como jogado (${newPlayCount}x):`, params.gameId);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao desmarcar como jogado:', error);
    return {
      success: false,
      error: 'Erro inesperado ao desmarcar como jogado'
    };
  }
}

/**
 * Verifica se um jogo específico já está salvo
 * Útil para exibir estado correto do toggle
 */
export async function isGameSaved(
  lotteryType: string,
  contestNumber: number,
  numbers: number[]
): Promise<{
  success: boolean;
  isSaved: boolean;
  gameId?: string;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, isSaved: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('saved_games')
      .select('id')
      .eq('user_id', user.id)
      .eq('lottery_type', lotteryType)
      .eq('contest_number', contestNumber)
      .contains('numbers', numbers)
      .containedBy('numbers', numbers)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao verificar jogo salvo:', error);
      return { success: false, isSaved: false, error: error.message };
    }

    return {
      success: true,
      isSaved: !!data,
      gameId: data?.id,
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao verificar jogo salvo:', error);
    return {
      success: false,
      isSaved: false,
      error: 'Erro inesperado'
    };
  }
}

/**
 * Obtém estatísticas de jogos salvos do usuário
 * Busca da materialized view saved_games_stats
 */
export async function getStats(): Promise<{
  success: boolean;
  data?: {
    totalSaved: number;
    aiGeneratedCount: number;
    manualCreatedCount: number;
    totalPlays: number;
    gamesByLottery: Record<string, number>;
  };
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('saved_games_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      // Usuário ainda não tem jogos salvos
      return {
        success: true,
        data: {
          totalSaved: 0,
          aiGeneratedCount: 0,
          manualCreatedCount: 0,
          totalPlays: 0,
          gamesByLottery: {},
        }
      };
    }

    return {
      success: true,
      data: {
        totalSaved: data.total_saved || 0,
        aiGeneratedCount: data.ai_generated_count || 0,
        manualCreatedCount: data.manual_created_count || 0,
        totalPlays: data.total_plays || 0,
        gamesByLottery: (data.games_by_lottery as any) || {},
      }
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar estatísticas:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar estatísticas'
    };
  }
}

// Exportar tipo para uso nos componentes
export type { SavedGame };
