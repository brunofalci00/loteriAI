/**
 * Hook: useUserCredits
 *
 * Gerencia créditos do usuário:
 * - Busca créditos restantes
 * - Valida se pode regenerar (client-side)
 * - Calcula dias até reset
 * - Auto-refresh a cada 30s
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useQuery } from '@tanstack/react-query';
import { DEFAULT_MONTHLY_CREDITS } from '@/config/credits';
import {
  getUserCredits,
  canRegenerate,
  getDaysUntilReset,
  type UserCredits
} from '@/services/creditsService';

/**
 * Hook para buscar créditos do usuário
 */
export function useUserCredits(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['userCredits', userId],
    queryFn: async (): Promise<UserCredits> => {
      if (!userId) throw new Error('User ID is required');
      return await getUserCredits(userId);
    },
    enabled: enabled && !!userId,
    staleTime: 10000, // 10 segundos
    gcTime: 60000, // 1 minuto
    refetchInterval: 30000, // Auto-refresh a cada 30s
  });
}

/**
 * Hook para validar se pode regenerar (sem consumir crédito)
 * Validação client-side antes de abrir modal
 */
export function useCanRegenerate(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['canRegenerate', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await canRegenerate(userId);
    },
    enabled: enabled && !!userId,
    staleTime: 5000, // 5 segundos (validação frequente)
    gcTime: 30000,
    refetchInterval: 10000, // Auto-refresh a cada 10s para cooldown
  });
}

/**
 * Hook combinado que retorna créditos + validação + dias até reset
 * Uso recomendado nos componentes
 */
export function useCreditsStatus(userId: string | undefined, enabled: boolean = true) {
  const creditsQuery = useUserCredits(userId, enabled);
  const canRegenerateQuery = useCanRegenerate(userId, enabled);

  const daysUntilReset = creditsQuery.data?.last_reset_at
    ? getDaysUntilReset(creditsQuery.data.last_reset_at)
    : null;

  return {
    // Credits data
    credits: creditsQuery.data,
    creditsRemaining: creditsQuery.data?.credits_remaining ?? 0,
    creditsTotal: creditsQuery.data?.credits_total ?? DEFAULT_MONTHLY_CREDITS,
    lastResetAt: creditsQuery.data?.last_reset_at,
    lastGenerationAt: creditsQuery.data?.last_generation_at,

    // Validation
    canRegenerate: canRegenerateQuery.data?.canRegenerate ?? false,
    cannotRegenerateReason: canRegenerateQuery.data?.reason,
    cooldownSeconds: canRegenerateQuery.data?.cooldownSeconds,

    // Reset info
    daysUntilReset,

    // Loading states
    isLoadingCredits: creditsQuery.isLoading,
    isLoadingValidation: canRegenerateQuery.isLoading,
    isLoading: creditsQuery.isLoading || canRegenerateQuery.isLoading,

    // Error states
    creditsError: creditsQuery.error,
    validationError: canRegenerateQuery.error,
    hasError: !!creditsQuery.error || !!canRegenerateQuery.error,

    // Refetch
    refetch: () => {
      creditsQuery.refetch();
      canRegenerateQuery.refetch();
    },

    // Helper functions
    getCreditsPercentage: (): number => {
      if (!creditsQuery.data) return 0;
      return (creditsQuery.data.credits_remaining / creditsQuery.data.credits_total) * 100;
    },

    getCreditsColor: (): 'green' | 'yellow' | 'red' => {
      const percentage = creditsQuery.data
        ? (creditsQuery.data.credits_remaining / creditsQuery.data.credits_total) * 100
        : 0;

      if (percentage > 50) return 'green';
      if (percentage > 20) return 'yellow';
      return 'red';
    },

    formatResetMessage: (): string => {
      if (daysUntilReset === null) return '';
      if (daysUntilReset === 0) return 'Reset hoje à meia-noite';
      if (daysUntilReset === 1) return 'Reset amanhã';
      return `Reset em ${daysUntilReset} dias`;
    }
  };
}
