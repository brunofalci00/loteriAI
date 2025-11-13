/**
 * Component: RegenerateButton
 *
 * Botão de regeneração com:
 * - Validação de créditos client-side
 * - Dialog de confirmação
 * - Estados de loading/erro
 * - Toast notifications
 *
 * Sistema simplificado: sempre usa user_credits unificado
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from 'react';
import { RefreshCw, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreditsStatus } from '@/hooks/useUserCredits';
import { useRegenerateCombinations } from '@/hooks/useRegenerateCombinations';
import type { LotteryStatistics } from '@/types/analysis';

export interface RegenerateButtonProps {
  userId: string;
  lotteryType: string;
  contestNumber: number;
  statistics: LotteryStatistics;
  numbersPerGame: number;
  maxNumber: number;
  numberOfGames?: number;
  onSuccess?: (combinations: number[][]) => void;
  disabled?: boolean;
  variant?: 'default' | 'hero' | 'gold' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showCreditsCount?: boolean;
}

/**
 * Botão de Regeneração
 * Valida créditos antes de abrir modal de confirmação
 */
export function RegenerateButton({
  userId,
  lotteryType,
  contestNumber,
  statistics,
  numbersPerGame,
  maxNumber,
  numberOfGames = 10,
  onSuccess,
  disabled = false,
  variant = 'hero',
  size = 'default',
  showCreditsCount = false,
}: RegenerateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Credits validation
  const {
    canRegenerate,
    cannotRegenerateReason,
    creditsRemaining,
    cooldownSeconds,
    isLoading: isLoadingCredits
  } = useCreditsStatus(userId);

  // Regeneration mutation
  const {
    regenerateAsync,
    isGenerating,
    reset
  } = useRegenerateCombinations();

  // Handle button click (validation)
  const handleClick = () => {
    if (!canRegenerate) {
      toast({
        variant: 'destructive',
        title: 'Não é possível regenerar',
        description: cannotRegenerateReason || 'Verifique seus créditos e tente novamente.'
      });
      return;
    }

    // Open confirmation dialog
    setDialogOpen(true);
  };

  // Handle confirmed regeneration
  const handleConfirm = async () => {
    setDialogOpen(false);

    try {
      const result = await regenerateAsync({
        userId,
        lotteryType,
        contestNumber,
        statistics,
        numbersPerGame,
        maxNumber,
        numberOfGames,
      });

      toast({
        title: 'Sucesso!',
        description: `${result.combinations.length} novas combinações geradas. Créditos restantes: ${result.creditsRemaining}`,
        duration: 5000
      });

      // Callback
      if (onSuccess) {
        onSuccess(result.combinations);
      }

    } catch (error: unknown) {
      console.error('❌ Erro ao regenerar:', error);

      // Error toast
      toast({
        variant: 'destructive',
        title: 'Erro ao regenerar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível gerar novas combinações. Tente novamente.',
        duration: 7000
      });

      reset();
    }
  };

  const isDisabled =
    disabled ||
    isGenerating ||
    (!canRegenerate || isLoadingCredits);

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Gerar Novamente
            {showCreditsCount && (
              <span className="ml-1 text-xs opacity-80">
                ({isLoadingCredits ? '...' : creditsRemaining})
              </span>
            )}
          </>
        )}
      </Button>

      {/* Cooldown countdown visual */}
      {cooldownSeconds && cooldownSeconds > 0 && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded-md">
          <Progress
            value={((10 - cooldownSeconds) / 10) * 100}
            className="flex-1 h-2"
          />
          <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            Aguarde {cooldownSeconds.toFixed(0)}s
          </span>
        </div>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar novas combinações?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Esta ação irá gerar {numberOfGames} novas combinações baseadas nas mesmas estatísticas.
              </p>
              <p className="font-semibold text-foreground">
                Isso consumirá 1 crédito. Você tem {creditsRemaining} créditos restantes.
              </p>
              <p className="text-sm text-muted-foreground">
                A geração anterior será preservada no histórico e você poderá alternar entre elas.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-primary">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
