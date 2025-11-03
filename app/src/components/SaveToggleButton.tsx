/**
 * Component: SaveToggleButton
 *
 * Toggle instantâneo para salvar/dessalvar jogos:
 * - Ícone de coração preenchido/vazio
 * - Loading state durante mutação
 * - Validação de limite de 50 jogos
 * - Toast notifications
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSaveGame, useUnsaveGame, useIsGameSaved } from '@/hooks/useSavedGames';
import type { SaveGameParams } from '@/services/savedGamesService';

export interface SaveToggleButtonProps {
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
  generationId?: string | null;
  source: 'ai_generated' | 'manual_created';
  strategyType?: string | null;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  onSaveSuccess?: () => void;
  onUnsaveSuccess?: () => void;
  className?: string;
}

/**
 * Toggle Button para Salvar Jogos
 * Fluxo D: Salvamento instantâneo
 */
export function SaveToggleButton({
  lotteryType,
  contestNumber,
  numbers,
  analysisResult,
  generationId = null,
  source,
  strategyType = null,
  variant = 'outline',
  size = 'default',
  showLabel = false,
  onSaveSuccess,
  onUnsaveSuccess,
  className
}: SaveToggleButtonProps) {
  const [isOptimisticSaved, setIsOptimisticSaved] = useState(false);

  // Verificar se jogo está salvo
  const { data: saveStatus, isLoading: isCheckingStatus } = useIsGameSaved(
    lotteryType,
    contestNumber,
    numbers,
    true
  );

  const saveGameMutation = useSaveGame();
  const unsaveGameMutation = useUnsaveGame();

  const isSaved = saveStatus?.isSaved || isOptimisticSaved;
  const gameId = saveStatus?.gameId;
  const isMutating = saveGameMutation.isPending || unsaveGameMutation.isPending;

  // Sync optimistic state with server state
  useEffect(() => {
    if (saveStatus?.isSaved !== undefined) {
      setIsOptimisticSaved(saveStatus.isSaved);
    }
  }, [saveStatus]);

  const handleToggle = async () => {
    if (isMutating) return;

    if (isSaved && gameId) {
      // Dessalvar
      setIsOptimisticSaved(false); // Optimistic update

      const result = await unsaveGameMutation.mutateAsync(gameId);

      if (result.success) {
        if (onUnsaveSuccess) onUnsaveSuccess();
      } else {
        setIsOptimisticSaved(true); // Revert optimistic update
      }
    } else {
      // Salvar
      setIsOptimisticSaved(true); // Optimistic update

      const params: SaveGameParams = {
        generationId,
        lotteryType,
        contestNumber,
        numbers,
        analysisResult,
        source,
        strategyType,
        name: null, // Nome será adicionado depois opcionalmente
      };

      const result = await saveGameMutation.mutateAsync(params);

      if (result.success) {
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setIsOptimisticSaved(false); // Revert optimistic update
      }
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isCheckingStatus || isMutating}
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all',
          isSaved && 'fill-red-500 text-red-500'
        )}
      />
      {showLabel && (
        <span>
          {isMutating ? 'Salvando...' : isSaved ? 'Salvo' : 'Salvar'}
        </span>
      )}
    </Button>
  );
}
