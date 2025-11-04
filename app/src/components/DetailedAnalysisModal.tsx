/**
 * Component: DetailedAnalysisModal
 *
 * Modal de análise detalhada de jogo manual
 * Tier B moment (5-10% conversion)
 *
 * Features:
 * - Análise completa de números
 * - Categorização (quentes, frios, balanceados)
 * - Distribuição par/ímpar
 * - Score detalhado
 * - ShareButton integrado
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ShareButton';
import { Star, Flame, Snowflake, Scale, TrendingUp } from 'lucide-react';
import type { AnalysisResult } from '@/services/manualGameAnalysisService';

export interface DetailedAnalysisModalProps {
  /**
   * Controle de abertura (externo)
   */
  open: boolean;

  /**
   * Callback ao fechar
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Resultado da análise
   */
  analysisResult: AnalysisResult;

  /**
   * Números selecionados
   */
  selectedNumbers: number[];

  /**
   * Nome da loteria
   */
  lotteryName: string;
}

/**
 * Modal de Análise Detalhada
 */
export function DetailedAnalysisModal({
  open,
  onOpenChange,
  analysisResult,
  selectedNumbers,
  lotteryName,
}: DetailedAnalysisModalProps) {
  const { score, detailedAnalysis, hotCount, coldCount, balancedCount, evenOddDistribution, comparisonWithAverage } = analysisResult;

  // Score com estrelas
  const stars = Math.floor(score);
  const halfStar = (score % 1) >= 0.5;

  // Categorizar números
  const hotNumbers = selectedNumbers.filter(n => detailedAnalysis.hotNumbers.includes(n));
  const coldNumbers = selectedNumbers.filter(n => detailedAnalysis.coldNumbers.includes(n));
  const balancedNumbers = selectedNumbers.filter(
    n => !detailedAnalysis.hotNumbers.includes(n) && !detailedAnalysis.coldNumbers.includes(n)
  );

  // Números pares e ímpares
  const evenNumbers = selectedNumbers.filter(n => n % 2 === 0);
  const oddNumbers = selectedNumbers.filter(n => n % 2 !== 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Análise Detalhada</DialogTitle>
          <DialogDescription>
            Análise completa do seu jogo de {lotteryName}
          </DialogDescription>
        </DialogHeader>

        {/* Score Section */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pontuação Geral</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">{score.toFixed(1)}/5</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < stars
                          ? 'fill-yellow-400 text-yellow-400'
                          : i === stars && halfStar
                          ? 'fill-yellow-200 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Badge variant={score >= 3.5 ? 'default' : score >= 2.5 ? 'secondary' : 'destructive'} className="text-sm">
              {comparisonWithAverage}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysisResult.summary}
          </p>
        </div>

        {/* Categorias de Números */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Distribuição por Categoria
          </h3>

          {/* Números Quentes */}
          {hotNumbers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-medium">
                  Números Quentes ({hotCount})
                </p>
                <Badge variant="outline" className="text-xs border-orange-500/30 bg-orange-500/10 text-orange-600">
                  Mais frequentes
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {hotNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Números Balanceados */}
          {balancedNumbers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">
                  Números Balanceados ({balancedCount})
                </p>
                <Badge variant="outline" className="text-xs border-green-500/30 bg-green-500/10 text-green-600">
                  Frequência média
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {balancedNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-green-500 text-white"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Números Frios */}
          {coldNumbers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Snowflake className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">
                  Outros Números ({coldCount})
                </p>
                <Badge variant="outline" className="text-xs border-blue-500/30 bg-blue-500/10 text-blue-600">
                  Menos frequentes
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {coldNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Distribuição Par/Ímpar */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm">Distribuição Par / Ímpar</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Pares</p>
                <Badge variant="outline">{evenOddDistribution.even}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {evenNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Ímpares</p>
                <Badge variant="outline">{evenOddDistribution.odd}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {oddNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Share CTA */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 space-y-3">
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-900">
              Gostou da análise detalhada?
            </p>
            <p className="text-xs text-emerald-700">
              Compartilhe e ganhe créditos extras
            </p>
          </div>

          <ShareButton
            context="detailed"
            variant="secondary"
            size="default"
            label="Compartilhar Análise"
            showCredits={true}
            className="w-full"
          />
        </div>

        {/* Footer Info */}
        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          <p>
            Análise baseada em padrões históricos de {lotteryName}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
