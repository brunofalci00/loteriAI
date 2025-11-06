/**
 * Component: CreditsDisplay
 *
 * Display de créditos com:
 * - Contador de créditos restantes
 * - Barra de progresso
 * - Dias até reset
 * - Cores dinâmicas (verde/amarelo/vermelho)
 * - Tooltip com detalhes
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { Zap, Calendar, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCreditsStatus } from '@/hooks/useUserCredits';
import { CreditsInfoPopover } from '@/components/CreditsInfoPopover';

export interface CreditsDisplayProps {
  userId: string;
  variant?: 'default' | 'compact' | 'badge';
  showProgress?: boolean;
  showResetInfo?: boolean;
  className?: string;
}

/**
 * Display de Créditos
 * Variantes: default (completo), compact (resumido), badge (apenas número)
 */
export function CreditsDisplay({
  userId,
  variant = 'default',
  showProgress = true,
  showResetInfo = true,
  className
}: CreditsDisplayProps) {
  const {
    creditsRemaining,
    creditsTotal,
    daysUntilReset,
    isLoading,
    getCreditsPercentage,
    getCreditsColor,
    formatResetMessage
  } = useCreditsStatus(userId, true);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  const percentage = getCreditsPercentage();
  const color = getCreditsColor();

  // Color classes
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400'
  };

  // Badge variant with interactive popover
  if (variant === 'badge') {
    return (
      <CreditsInfoPopover
        creditsRemaining={creditsRemaining}
        creditsTotal={creditsTotal}
        lastResetDate={undefined}
      >
        <Badge
          variant={creditsRemaining > 0 ? 'default' : 'destructive'}
          className={cn('gap-1 cursor-pointer hover:opacity-80 transition-opacity', className)}
        >
          <Zap className="h-3 w-3" />
          {creditsRemaining}
        </Badge>
      </CreditsInfoPopover>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-2">
          <Zap className={cn('h-4 w-4', colorClasses[color])} />
          <div className="space-y-0.5">
            <div className="text-sm font-semibold">
              <span className={colorClasses[color]}>{creditsRemaining}</span>
              <span className="text-muted-foreground"> / {creditsTotal}</span>
            </div>
            {showResetInfo && daysUntilReset !== null && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatResetMessage()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant (full)
  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={cn('h-5 w-5', colorClasses[color])} />
            <h3 className="font-semibold">Créditos de Regeneração</h3>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <p>Você tem {creditsTotal} créditos por mês para regenerar combinações.</p>
                  <p>Cada regeneração consome 1 crédito e tem um cooldown de 10 segundos.</p>
                  <p>Os créditos são renovados automaticamente no dia 1º de cada mês.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Credits Counter */}
        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-bold', colorClasses[color])}>
            {creditsRemaining}
          </span>
          <span className="text-lg text-muted-foreground">
            / {creditsTotal}
          </span>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-1">
            <Progress
              value={percentage}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentage.toFixed(0)}% disponível</span>
              {creditsRemaining === 0 && (
                <span className="text-destructive font-medium">
                  Créditos esgotados
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reset Info */}
        {showResetInfo && daysUntilReset !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Calendar className="h-4 w-4" />
            <span>{formatResetMessage()}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
