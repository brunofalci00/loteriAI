/**
 * Hook: useGenerationHistory
 *
 * Gerencia histórico de gerações:
 * - Busca histórico completo
 * - Busca geração ativa
 * - Definir geração ativa
 * - Deletar geração
 * - Cache com React Query
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGenerationHistory,
  getActiveGeneration,
  setActiveGeneration,
  deleteGeneration,
  type GenerationHistoryItem
} from '@/services/generationService';

/**
 * Hook para buscar histórico completo de gerações
 */
export function useGenerationHistory(
  userId: string | undefined,
  lotteryType: string,
  contestNumber: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['generationHistory', userId, lotteryType, contestNumber],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await getGenerationHistory(userId, lotteryType, contestNumber);
    },
    enabled: enabled && !!userId,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos (anteriormente cacheTime)
  });
}

/**
 * Hook para buscar apenas a geração ativa
 */
export function useActiveGeneration(
  userId: string | undefined,
  lotteryType: string,
  contestNumber: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['activeGeneration', userId, lotteryType, contestNumber],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await getActiveGeneration(userId, lotteryType, contestNumber);
    },
    enabled: enabled && !!userId,
    staleTime: 10000, // 10 segundos (atualização frequente)
    gcTime: 60000, // 1 minuto
  });
}

/**
 * Hook para definir uma geração como ativa
 */
export function useSetActiveGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      lotteryType: string;
      contestNumber: number;
      generationId: string;
    }) => {
      await setActiveGeneration(
        params.userId,
        params.lotteryType,
        params.contestNumber,
        params.generationId
      );

      // Retornar params para usar em onSuccess
      return params;
    },

    onSuccess: (params) => {
      console.log('✅ Geração ativa alterada:', params.generationId);

      // Invalidar queries relevantes
      queryClient.invalidateQueries({
        queryKey: ['activeGeneration', params.userId, params.lotteryType, params.contestNumber]
      });

      queryClient.invalidateQueries({
        queryKey: ['generationHistory', params.userId, params.lotteryType, params.contestNumber]
      });

      queryClient.invalidateQueries({
        queryKey: ['lotteryAnalysis', params.lotteryType, params.contestNumber]
      });
    },

    onError: (error: Error) => {
      console.error('❌ Erro ao definir geração ativa:', error.message);
    }
  });
}

/**
 * Hook para deletar uma geração
 */
export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      generationId: string;
      userId: string;
      lotteryType: string;
      contestNumber: number;
    }) => {
      await deleteGeneration(params.generationId, params.userId);
      return params;
    },

    onSuccess: (params) => {
      console.log('✅ Geração deletada:', params.generationId);

      // Invalidar histórico
      queryClient.invalidateQueries({
        queryKey: ['generationHistory', params.userId, params.lotteryType, params.contestNumber]
      });
    },

    onError: (error: Error) => {
      console.error('❌ Erro ao deletar geração:', error.message);
    }
  });
}

/**
 * Hook combinado para facilitar uso nos componentes
 * Retorna histórico + ações em um único hook
 */
export function useGenerationHistoryWithActions(
  userId: string | undefined,
  lotteryType: string,
  contestNumber: number,
  enabled: boolean = true
) {
  const history = useGenerationHistory(userId, lotteryType, contestNumber, enabled);
  const activeGeneration = useActiveGeneration(userId, lotteryType, contestNumber, enabled);
  const setActive = useSetActiveGeneration();
  const deleteGen = useDeleteGeneration();

  return {
    // Data
    history: history.data || [],
    activeGeneration: activeGeneration.data,

    // Loading states
    isLoadingHistory: history.isLoading,
    isLoadingActive: activeGeneration.isLoading,
    isLoading: history.isLoading || activeGeneration.isLoading,

    // Error states
    historyError: history.error,
    activeError: activeGeneration.error,

    // Actions
    setActiveGeneration: (generationId: string) => {
      if (!userId) {
        console.error('❌ User ID is required');
        return;
      }

      setActive.mutate({
        userId,
        lotteryType,
        contestNumber,
        generationId
      });
    },

    deleteGeneration: (generationId: string) => {
      if (!userId) {
        console.error('❌ User ID is required');
        return;
      }

      deleteGen.mutate({
        generationId,
        userId,
        lotteryType,
        contestNumber
      });
    },

    // Mutation states
    isSettingActive: setActive.isPending,
    isDeleting: deleteGen.isPending,

    // Refetch
    refetch: () => {
      history.refetch();
      activeGeneration.refetch();
    }
  };
}
