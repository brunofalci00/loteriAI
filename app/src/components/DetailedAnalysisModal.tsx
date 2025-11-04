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
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { DiagnosticSection } from '@/components/DiagnosticSection';
import { Star, Flame, Snowflake, Scale, TrendingUp, Sparkles, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { AnalysisResult, Recommendation } from '@/services/manualGameAnalysisService';

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

  /**
   * ID do usuário (para mostrar saldo atualizado no toast)
   */
  userId?: string | null;

  /**
   * Callback para otimizar jogo com IA
   */
  onOptimize?: () => void;

  /**
   * Estado de loading durante otimização
   */
  isOptimizing?: boolean;
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
  userId = null,
  onOptimize,
  isOptimizing = false,
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
                  <div
                    key={num}
                    className="relative px-3 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white ring-2 ring-orange-500/50"
                  >
                    {num.toString().padStart(2, '0')}
                    <Flame className="absolute -top-1 -right-1 h-3 w-3 text-orange-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnóstico de Números Quentes */}
          <DiagnosticSection
            title="Análise de Números Quentes"
            status={hotCount >= 3 && hotCount <= 5 ? 'success' : 'warning'}
            diagnosis={`Seu jogo tem ${hotCount} números quentes (${((hotCount / selectedNumbers.length) * 100).toFixed(0)}%). Números quentes são aqueles que aparecem com maior frequência nos últimos concursos analisados.`}
            recommendation={
              hotCount >= 3 && hotCount <= 5
                ? 'Excelente! Você está usando a quantidade ideal de números quentes. Isso aumenta suas chances baseado em padrões históricos.'
                : hotCount < 3
                ? `Considere adicionar mais ${3 - hotCount} número(s) quente(s). Números quentes têm maior probabilidade estatística de aparecer.`
                : `Você tem muitos números quentes. Considere substituir ${hotCount - 5} por números balanceados para melhor diversificação.`
            }
            idealRange="3-5 números (20-30%)"
          />

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

          {/* Diagnóstico Par/Ímpar */}
          <DiagnosticSection
            title="Diagnóstico de Distribuição Par/Ímpar"
            status={
              evenOddDistribution.even >= Math.floor(selectedNumbers.length / 2) - 1 &&
              evenOddDistribution.even <= Math.ceil(selectedNumbers.length / 2) + 1
                ? 'success'
                : 'warning'
            }
            diagnosis={`Seu jogo tem ${evenOddDistribution.even} pares e ${evenOddDistribution.odd} ímpares (${((evenOddDistribution.even / selectedNumbers.length) * 100).toFixed(0)}% / ${((evenOddDistribution.odd / selectedNumbers.length) * 100).toFixed(0)}%).`}
            recommendation={
              evenOddDistribution.even >= Math.floor(selectedNumbers.length / 2) - 1 &&
              evenOddDistribution.even <= Math.ceil(selectedNumbers.length / 2) + 1
                ? 'Perfeito! Sua distribuição está no intervalo ideal. Jogos balanceados entre pares e ímpares têm melhor desempenho estatístico.'
                : evenOddDistribution.even < Math.floor(selectedNumbers.length / 2) - 1
                ? `Adicione mais número(s) par(es) para equilibrar a distribuição. O ideal é ter aproximadamente 50% de cada tipo.`
                : `Adicione mais número(s) ímpar(es) para equilibrar a distribuição. O ideal é ter aproximadamente 50% de cada tipo.`
            }
            idealRange={`${Math.floor(selectedNumbers.length / 2) - 1}-${Math.ceil(selectedNumbers.length / 2) + 1} pares / ${Math.floor(selectedNumbers.length / 2) - 1}-${Math.ceil(selectedNumbers.length / 2) + 1} ímpares`}
          />
        </div>

        {/* Recomendações Inteligentes */}
        {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recomendações Personalizadas</h3>

            {analysisResult.recommendations.map((rec: Recommendation, index: number) => {
              const severityConfig = {
                success: {
                  bgColor: 'bg-green-50',
                  borderColor: 'border-green-200',
                  icon: CheckCircle,
                  iconColor: 'text-green-600'
                },
                warning: {
                  bgColor: 'bg-yellow-50',
                  borderColor: 'border-yellow-200',
                  icon: AlertCircle,
                  iconColor: 'text-yellow-600'
                },
                info: {
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-200',
                  icon: Info,
                  iconColor: 'text-blue-600'
                }
              };

              const config = severityConfig[rec.severity];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 space-y-3`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground">{rec.diagnosis}</p>
                      </div>

                      <div className="bg-white/50 rounded p-2">
                        <p className="text-xs text-muted-foreground mb-1">💡 Recomendação:</p>
                        <p className="text-sm font-medium">{rec.recommendation}</p>
                      </div>

                      {rec.actionable && rec.numbersToAdd && rec.numbersToRemove && (
                        <div className="flex flex-col gap-2 text-xs">
                          {rec.numbersToRemove.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 font-medium">❌ Remover:</span>
                              <div className="flex flex-wrap gap-1">
                                {rec.numbersToRemove.map(n => (
                                  <span key={n} className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                                    {n.toString().padStart(2, '0')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {rec.numbersToAdd.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-medium">✅ Adicionar:</span>
                              <div className="flex flex-wrap gap-1">
                                {rec.numbersToAdd.map(n => (
                                  <span key={n} className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                                    {n.toString().padStart(2, '0')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
            userId={userId}
            className="w-full"
          />
        </div>

        {/* Botão Otimizar com IA */}
        {onOptimize && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="text-center">
              <p className="text-sm font-medium">
                Quer melhorar seu jogo?
              </p>
              <p className="text-xs text-muted-foreground">
                A IA pode otimizar seus números aplicando as recomendações acima
              </p>
            </div>

            <Button
              onClick={onOptimize}
              disabled={isOptimizing}
              className="w-full"
              variant="default"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Otimizar com IA
                </>
              )}
            </Button>
          </div>
        )}

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
