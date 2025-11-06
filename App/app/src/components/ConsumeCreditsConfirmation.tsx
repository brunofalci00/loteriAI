/**
 * Component: ConsumeCreditsConfirmation
 *
 * Modal de confirmação REUTILIZÁVEL para ações que consomem créditos.
 *
 * Usado em:
 * - Regeneração de jogos
 * - Geração de variações
 * - Qualquer feature futura que consuma créditos
 *
 * Features:
 * - Preview de saldo (antes → depois)
 * - Validação de créditos suficientes
 * - Loading state
 * - Mensagens customizáveis
 * - Design consistente
 *
 * @author Claude Code
 * @date 2025-01-03
 */

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
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Zap } from 'lucide-react';

export interface ConsumeCreditsConfirmationProps {
  /**
   * Controle de abertura do modal
   */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /**
   * Título do modal
   * @example "Gerar Novamente?"
   * @example "Gerar 5 Variações?"
   */
  title: string;

  /**
   * Descrição adicional (opcional)
   * @example "Esta ação gerará 10 novas combinações inteligentes."
   */
  description?: string;

  /**
   * Quantidade de créditos necessários para a ação
   * @default 1
   */
  creditsRequired?: number;

  /**
   * Créditos disponíveis no momento
   */
  creditsRemaining: number;

  /**
   * Callback ao confirmar
   */
  onConfirm: () => void;

  /**
   * Label do botão de confirmação
   * @default "Confirmar"
   */
  confirmLabel?: string;

  /**
   * Estado de loading
   */
  isLoading?: boolean;
}

export function ConsumeCreditsConfirmation({
  open,
  onOpenChange,
  title,
  description,
  creditsRequired = 1,
  creditsRemaining,
  onConfirm,
  confirmLabel = 'Confirmar',
  isLoading = false,
}: ConsumeCreditsConfirmationProps) {
  const hasEnoughCredits = creditsRemaining >= creditsRequired;
  const newBalance = creditsRemaining - creditsRequired;

  const handleConfirm = () => {
    if (!hasEnoughCredits || isLoading) return;
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-base">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {/* Preview de Créditos */}
        <div className="space-y-4 py-4">
          {hasEnoughCredits ? (
            <>
              {/* Custo da ação */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Esta ação consumirá:
                </span>
                <Badge variant="default" className="text-base">
                  {creditsRequired} {creditsRequired === 1 ? 'crédito' : 'créditos'}
                </Badge>
              </div>

              {/* Saldo antes e depois */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Saldo atual</span>
                  <span className="text-lg font-semibold">
                    {creditsRemaining} {creditsRemaining === 1 ? 'crédito' : 'créditos'}
                  </span>
                </div>

                <div className="text-2xl text-muted-foreground">→</div>

                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Após ação</span>
                  <span className="text-lg font-semibold text-primary">
                    {newBalance} {newBalance === 1 ? 'crédito' : 'créditos'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Sem créditos suficientes */
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">
                  Créditos insuficientes
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Você precisa de {creditsRequired} {creditsRequired === 1 ? 'crédito' : 'créditos'}
                  {' '}mas possui apenas {creditsRemaining}.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Compartilhe suas análises para ganhar mais créditos!
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!hasEnoughCredits || isLoading}
            className={!hasEnoughCredits ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
