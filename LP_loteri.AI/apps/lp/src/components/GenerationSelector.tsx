/**
 * Component: GenerationSelector
 *
 * Seletor de gerações com:
 * - Navegação entre últimas 3 gerações
 * - Fade-in/out animations
 * - Timestamps formatados
 * - Link para histórico completo
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGenerationHistoryWithActions } from '@/hooks/useGenerationHistory';
import type { GenerationHistoryItem } from '@/services/generationService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface GenerationSelectorProps {
  userId: string;
  lotteryType: string;
  contestNumber: number;
  onGenerationChange?: (generation: GenerationHistoryItem) => void;
  onOpenHistory?: () => void;
  className?: string;
}

/**
 * Seletor de Gerações
 * Mostra últimas 3 gerações com navegação
 */
export function GenerationSelector({
  userId,
  lotteryType,
  contestNumber,
  onGenerationChange,
  onOpenHistory,
  className
}: GenerationSelectorProps) {
  const [isFading, setIsFading] = useState(false);

  const {
    history,
    activeGeneration,
    isLoading,
    setActiveGeneration: setActive,
    isSettingActive
  } = useGenerationHistoryWithActions(userId, lotteryType, contestNumber, true);

  // Últimas 3 gerações
  const recentGenerations = history.slice(0, 3);
  const hasHistory = recentGenerations.length > 1;

  // Index da geração ativa
  const activeIndex = activeGeneration
    ? recentGenerations.findIndex(g => g.id === activeGeneration.id)
    : 0;

  // Navegação
  const canGoPrevious = activeIndex < recentGenerations.length - 1;
  const canGoNext = activeIndex > 0;

  const handlePrevious = () => {
    if (!canGoPrevious) return;
    navigateToGeneration(recentGenerations[activeIndex + 1]);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    navigateToGeneration(recentGenerations[activeIndex - 1]);
  };

  const navigateToGeneration = (generation: GenerationHistoryItem) => {
    // Fade out
    setIsFading(true);

    // Wait for fade out
    setTimeout(() => {
      setActive(generation.id);

      // Callback
      if (onGenerationChange) {
        onGenerationChange(generation);
      }

      // Fade in
      setTimeout(() => {
        setIsFading(false);
      }, 50);
    }, 150);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'Recentemente';
    }
  };

  // Se não há histórico, não exibir
  if (isLoading || !hasHistory) {
    return null;
  }

  const currentGeneration = recentGenerations[activeIndex];
  const totalGenerations = history.length;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={!canGoPrevious || isSettingActive}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!canGoNext || isSettingActive}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div
            className={cn(
              'flex items-center gap-2 transition-opacity duration-150',
              isFading ? 'opacity-0' : 'opacity-100'
            )}
          >
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {currentGeneration && formatTimestamp(currentGeneration.generated_at)}
            </Badge>

            <span className="text-sm text-muted-foreground">
              Geração {activeIndex + 1} de {recentGenerations.length}
            </span>
          </div>
        </div>

        {/* Link to full history */}
        {totalGenerations > 3 && onOpenHistory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <History className="h-4 w-4" />
            Ver todas ({totalGenerations})
          </Button>
        )}
      </div>

      {/* Generation Info */}
      <div
        className={cn(
          'rounded-lg border bg-card p-4 transition-opacity duration-150',
          isFading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {currentGeneration && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">
                  Geração #{history.length - activeIndex}
                </h4>
                {currentGeneration.is_active && (
                  <Badge variant="default" className="text-xs">
                    Ativa
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {currentGeneration.generated_numbers.length} jogos
              </div>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <div>
                Taxa: {currentGeneration.accuracy_rate.toFixed(1)}%
              </div>
              <div>
                Análises: {currentGeneration.draws_analyzed}
              </div>
              <div>
                Quentes: {currentGeneration.hot_numbers.slice(0, 3).join(', ')}...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
