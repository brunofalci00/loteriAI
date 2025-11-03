/**
 * Hook: useRegenerateCombinations
 *
 * Gerencia regeneração de combinações com:
 * - Validação de créditos + cooldown
 * - Geração de novas combinações
 * - Salvamento no histórico
 * - Invalidação de cache
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { consumeCredit } from '@/services/creditsService';
import { saveGeneration } from '@/services/generationService';
import { generateIntelligentCombinations } from '@/services/lotteryAnalysis';
import type { LotteryStatistics } from '@/types/analysis';
import { supabase } from '@/integrations/supabase/client';

export interface RegenerateParams {
  userId: string;
  lotteryType: string;
  contestNumber: number;
  statistics: LotteryStatistics;
  numbersPerGame: number;
  maxNumber: number;
  numberOfGames?: number;
}

export interface RegenerateResult {
  success: boolean;
  generationId: string;
  combinations: number[][];
  creditsRemaining: number;
  message: string;
}

/**
 * Hook para regenerar combinações
 * Usa React Query mutation + invalidação de cache
 */
export function useRegenerateCombinations() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const regenerateMutation = useMutation({
    mutationFn: async (params: RegenerateParams): Promise<RegenerateResult> => {
      setIsGenerating(true);

      try {
        console.log('🔄 Iniciando regeneração...', {
          userId: params.userId,
          lotteryType: params.lotteryType,
          contestNumber: params.contestNumber
        });

        // 1. Consumir crédito (valida cooldown + limite)
        const creditResult = await consumeCredit(params.userId);

        if (!creditResult.success) {
          console.warn('⚠️ Crédito não consumido:', creditResult.message);
          throw new Error(creditResult.message);
        }

        console.log('✅ Crédito consumido. Restantes:', creditResult.credits_remaining);

        // 2. Gerar novas combinações
        const newCombinations = generateIntelligentCombinations(
          params.statistics,
          params.numbersPerGame,
          params.maxNumber,
          params.numberOfGames || 10
        );

        if (newCombinations.length === 0) {
          throw new Error('Não foi possível gerar combinações válidas');
        }

        console.log(`✅ ${newCombinations.length} combinações geradas`);

        // 3. Salvar no histórico (marca como ativa)
        const generationId = await saveGeneration(
          params.userId,
          params.lotteryType,
          params.contestNumber,
          {
            generated_numbers: newCombinations,
            hot_numbers: params.statistics.hotNumbers,
            cold_numbers: params.statistics.coldNumbers,
            accuracy_rate: params.statistics.accuracy || 0,
            draws_analyzed: params.statistics.totalDrawsAnalyzed
          }
        );

        console.log('✅ Geração salva no histórico:', generationId);

        // 4. Atualizar lottery_analyses (backward compatibility)
        // Apenas atualizar, não inserir se não existir
        const { error: updateError } = await supabase
          .from('lottery_analyses')
          .update({
            generated_combinations: newCombinations,
            last_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', params.userId)
          .eq('lottery_type', params.lotteryType)
          .eq('contest_number', params.contestNumber);

        if (updateError) {
          console.warn('⚠️ Aviso ao atualizar lottery_analyses:', updateError);
          // Não é fatal, continua
        } else {
          console.log('✅ lottery_analyses atualizado (backward compatibility)');
        }

        return {
          success: true,
          generationId,
          combinations: newCombinations,
          creditsRemaining: creditResult.credits_remaining,
          message: `${newCombinations.length} novas combinações geradas!`
        };

      } catch (error: any) {
        console.error('❌ Erro na regeneração:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },

    onSuccess: (result, params) => {
      console.log('🎉 Regeneração concluída com sucesso!');

      // Invalidar queries relevantes
      queryClient.invalidateQueries({
        queryKey: ['generationHistory', params.userId, params.lotteryType, params.contestNumber]
      });

      queryClient.invalidateQueries({
        queryKey: ['userCredits', params.userId]
      });

      queryClient.invalidateQueries({
        queryKey: ['lotteryAnalysis', params.lotteryType, params.contestNumber]
      });
    },

    onError: (error: Error) => {
      console.error('❌ Mutation error:', error.message);
    }
  });

  return {
    regenerate: regenerateMutation.mutate,
    regenerateAsync: regenerateMutation.mutateAsync,
    isGenerating: isGenerating || regenerateMutation.isPending,
    isSuccess: regenerateMutation.isSuccess,
    isError: regenerateMutation.isError,
    error: regenerateMutation.error,
    data: regenerateMutation.data,
    reset: regenerateMutation.reset
  };
}
