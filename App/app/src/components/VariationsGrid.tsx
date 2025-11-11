import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Variation } from "@/services/gameVariationsService";
import { SaveToggleButton } from "@/components/SaveToggleButton";
import { ShareButton } from "@/components/ShareButton";

interface VariationsGridProps {
  variations: Variation[];
  originalNumbers: number[];
  lotteryType: 'lotofacil' | 'lotomania';
  contestNumber: number;
  userId: string | null;
}

const lotteryNames: Record<string, string> = {
  'lotofacil': 'Lotofácil',
  'lotomania': 'Lotomania',
  'mega-sena': 'Mega-Sena',
  'quina': 'Quina',
  'dupla-sena': 'Dupla Sena',
  'timemania': 'Timemania',
};

export function VariationsGrid({
  variations,
  originalNumbers,
  lotteryType,
  contestNumber,
  userId
}: VariationsGridProps) {
  if (variations.length === 0) {
    return null;
  }

  const featuredVariation = [...variations].sort(
    (a, b) => b.analysisResult.score - a.analysisResult.score
  )[0];

  const featuredPayload = featuredVariation
    ? {
        lotteryType,
        lotteryName: lotteryNames[lotteryType] || lotteryType,
        contestNumber,
        numbers: featuredVariation.numbers,
        hotCount: featuredVariation.analysisResult.hotCount,
        coldCount: featuredVariation.analysisResult.coldCount,
        balancedCount: featuredVariation.analysisResult.balancedCount,
        strategyLabel: featuredVariation.strategyLabel,
        source: 'ai' as const,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">5 Variações Otimizadas</h2>
        <p className="text-muted-foreground">
          A IA gerou estas variações mantendo parte dos seus números originais
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {variations.map((variation, index) => {
          const keptCount = variation.numbers.filter(n => originalNumbers.includes(n)).length;
          const addedCount = variation.changedNumbers.added.length;
          const removedCount = variation.changedNumbers.removed.length;

          return (
            <Card key={variation.id} className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    Variação {index + 1}: {variation.strategyLabel}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Score: {variation.score.toFixed(1)}/10
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {keptCount} mantidos, {addedCount} novos
                    </span>
                  </div>
                </div>
              </div>

              {/* Numbers Grid */}
              <div className="flex flex-wrap gap-2">
                {variation.numbers.map((num) => {
                  const isKept = originalNumbers.includes(num);
                  const isAdded = variation.changedNumbers.added.includes(num);
                  const isHot = variation.analysisResult.detailedAnalysis?.hotNumbers?.includes(num);

                  return (
                    <span
                      key={num}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-semibold",
                        isHot && "bg-orange-500 text-white border-2 border-orange-600",
                        !isHot && isKept && "bg-primary text-primary-foreground border-2 border-primary",
                        !isHot && isAdded && "bg-green-500 text-white border-2 border-green-600"
                      )}
                      title={isHot ? "Número quente" : isKept ? "Mantido do original" : "Número novo"}
                    >
                      {num.toString().padStart(2, '0')}
                    </span>
                  );
                })}
              </div>

              {/* Changes Summary */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span>Quentes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Mantidos ({keptCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Novos ({addedCount})</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Quentes</p>
                  <p className="text-lg font-bold text-orange-500">
                    {variation.analysisResult.hotCount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Outros</p>
                  <p className="text-lg font-bold text-blue-500">
                    {variation.analysisResult.coldCount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Balanceados</p>
                  <p className="text-lg font-bold text-green-500">
                    {variation.analysisResult.balancedCount}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {userId && (
                <div className="flex gap-2 pt-3">
                  <SaveToggleButton
                    lotteryType={lotteryType}
                    contestNumber={contestNumber}
                    numbers={variation.numbers}
                    analysisResult={{
                      hotCount: variation.analysisResult.hotCount,
                      coldCount: variation.analysisResult.coldCount,
                      balancedCount: variation.analysisResult.balancedCount,
                      score: variation.analysisResult.score,
                      detailedAnalysis: variation.analysisResult.detailedAnalysis
                    }}
                    source="manual_created"
                    userId={userId}
                    generationId={null}
                    variant="default"
                    className="flex-1"
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Share Button - Tier S moment (5 variations generated) */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 space-y-3 text-center">
        <p className="text-sm font-medium text-emerald-900">
          A IA criou 5 variações personalizadas para você!
        </p>
        {featuredPayload && (
          <p className="text-xs text-emerald-700">
            Variação destaque: {featuredVariation?.strategyLabel} equilibra {featuredPayload.hotCount}{' '}
            quentes e {featuredPayload.coldCount} frios para tentar padrões que estão voltando.
          </p>
        )}
        <p className="text-xs text-emerald-700">
          Compartilhe e ganhe créditos extras
        </p>
        <ShareButton
          context="variations"
          payload={featuredPayload}
          variant="primary"
          size="lg"
          celebratory={true}
          label="Compartilhar Variação em Destaque"
          showCredits={true}
          userId={userId}
          className="w-full max-w-md mx-auto"
        />
      </Card>

      {/* Legend */}
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Como funcionam as variações?</strong> A IA mantém 60-70% dos seus números originais
          e substitui o restante com números otimizados para cada estratégia (balanceada, focada em padrões históricos, etc).
        </p>
      </Card>
    </div>
  );
}
