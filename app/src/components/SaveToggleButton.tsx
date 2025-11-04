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
  const [localStatus, setLocalStatus] = useState<{
    isSaved: boolean;
    gameId: string | null;
  }>({
    isSaved: false,
    gameId: null,
  });

  // Verificar se jogo está salvo
  const { data: saveStatus, isLoading: isCheckingStatus } = useIsGameSaved(
    lotteryType,
    contestNumber,
    numbers,
    true
  );

  const saveGameMutation = useSaveGame();
  const unsaveGameMutation = useUnsaveGame();

  const isSaved = saveStatus?.isSaved ?? localStatus.isSaved;
  const gameId = saveStatus?.gameId ?? localStatus.gameId ?? undefined;
  const isMutating = saveGameMutation.isPending || unsaveGameMutation.isPending;

  // Sincronizar estado local com retorno do servidor
  useEffect(() => {
    if (saveStatus?.isSaved !== undefined) {
      setLocalStatus({
        isSaved: saveStatus.isSaved,
        gameId: saveStatus.gameId ?? null,
      });
    }
  }, [saveStatus]);

  const handleToggle = async () => {
    if (isMutating) return;

    if (isSaved) {
      // Dessalvar - usuário quer remover o jogo salvo
      // Se não tem gameId ainda, não faz nada (botão ficará desabilitado)
      if (!gameId) {
        console.warn('⚠️ Tentando dessalvar mas gameId ainda não disponível');
        return;
      }

      const previousStatus = { ...localStatus };
      setLocalStatus({
        isSaved: false,
        gameId,
      });

      const result = await unsaveGameMutation.mutateAsync(gameId);

      if (result.success) {
        setLocalStatus({
          isSaved: false,
          gameId: null,
        });
        if (onUnsaveSuccess) onUnsaveSuccess();
      } else {
        setLocalStatus(previousStatus);
      }
    } else {
      // Salvar - jogo ainda não está salvo
      const previousStatus = { ...localStatus };
      setLocalStatus({
        isSaved: true,
        gameId: previousStatus.gameId,
      });

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
        setLocalStatus({
          isSaved: true,
          gameId: result.data?.id ?? null,
        });
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setLocalStatus(previousStatus);
      }
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isCheckingStatus || isMutating || (isSaved && !gameId)}
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
