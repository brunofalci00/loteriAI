/**
 * Hook: useSavedGames
 *
 * Hooks do React Query para gerenciar jogos salvos:
 * - Listar jogos com filtros
 * - Buscar jogo específico
 * - Salvar jogo
 * - Remover jogo
 * - Atualizar nome
 * - Marcar como jogado
 * - Verificar se está salvo
 * - Buscar estatísticas
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  saveGame,
  unsaveGame,
  listSavedGames,
  getSavedGame,
  updateGameName,
  markAsPlayed,
  isGameSaved,
  getStats,
  type SaveGameParams,
  type UpdateGameNameParams,
  type MarkAsPlayedParams,
} from '@/services/savedGamesService';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para listar jogos salvos com filtros opcionais
 */
export function useSavedGames(filters?: {
  lotteryType?: string;
  source?: 'ai_generated' | 'manual_created';
}) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['saved-games', filters],
    queryFn: async () => {
      const result = await listSavedGames(filters);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar jogos',
          description: result.error || 'Erro desconhecido',
        });
        throw new Error(result.error);
      }

      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar um jogo salvo específico
 */
export function useSavedGame(gameId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['saved-game', gameId],
    queryFn: async () => {
      if (!gameId) return null;

      const result = await getSavedGame(gameId);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar jogo',
          description: result.error || 'Erro desconhecido',
        });
        throw new Error(result.error);
      }

      return result.data || null;
    },
    enabled: !!gameId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para salvar jogo
 */
export function useSaveGame() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: SaveGameParams) => saveGame(params),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar queries para atualizar listagens
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-games-stats'] });
        queryClient.invalidateQueries({ queryKey: ['is-game-saved'] });

        toast({
          title: '❤️ Jogo salvo com sucesso!',
          description: 'Acesse "Meus Jogos" para visualizar.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Não foi possível salvar',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar jogo',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para remover jogo dos salvos
 */
export function useUnsaveGame() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gameId: string) => unsaveGame(gameId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-games-stats'] });
        queryClient.invalidateQueries({ queryKey: ['is-game-saved'] });

        toast({
          title: 'Jogo removido dos salvos',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao remover jogo',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover jogo',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para atualizar nome do jogo
 */
export function useUpdateGameName() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: UpdateGameNameParams) => updateGameName(params),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-game', result.data?.id] });

        toast({
          title: '✏️ Nome atualizado!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar nome',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar nome',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para marcar jogo como jogado
 */
export function useMarkAsPlayed() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: MarkAsPlayedParams) => markAsPlayed(params),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-game', result.data?.id] });
        queryClient.invalidateQueries({ queryKey: ['saved-games-stats'] });

        toast({
          title: '✅ Marcado como jogado!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao marcar como jogado',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao marcar como jogado',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para verificar se um jogo está salvo
 * Usado para exibir estado correto do toggle
 */
export function useIsGameSaved(
  lotteryType: string,
  contestNumber: number,
  numbers: number[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['is-game-saved', lotteryType, contestNumber, numbers],
    queryFn: async () => {
      const result = await isGameSaved(lotteryType, contestNumber, numbers);

      if (!result.success) {
        return { isSaved: false, gameId: undefined };
      }

      return { isSaved: result.isSaved, gameId: result.gameId };
    },
    enabled,
    staleTime: 1000 * 30, // 30 segundos
  });
}

/**
 * Hook para buscar estatísticas de jogos salvos
 */
export function useSavedGamesStats() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['saved-games-stats'],
    queryFn: async () => {
      const result = await getStats();

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar estatísticas',
          description: result.error || 'Erro desconhecido',
        });
        throw new Error(result.error);
      }

      return result.data || {
        totalSaved: 0,
        aiGeneratedCount: 0,
        manualCreatedCount: 0,
        totalPlays: 0,
        gamesByLottery: {},
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
