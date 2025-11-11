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
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { DiagnosticSection } from '@/components/DiagnosticSection';
import { Star, Flame, Snowflake, Scale, TrendingUp, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
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
   * Callback para editar o jogo
   */
  onEdit?: () => void;
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
  onEdit,
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

  const sharePayload = {
    lotteryName,
    numbers: selectedNumbers,
    hotCount,
    coldCount,
    balancedCount,
    source: 'manual' as const,
  };

  const coldShareMessage =
    coldCount > 0
      ? `Incluímos ${coldCount} número${coldCount > 1 ? 's' : ''} frio${coldCount > 1 ? 's' : ''} para caçar padrões que estão voltando.`
      : 'Mesmo quando não há números frios ideais, a IA monitora padrões para adicionar esses números quando fizer sentido.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative sm:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 space-y-6">
        <DialogClose
          className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </DialogClose>
        <DialogHeader className="space-y-1 pr-8">
          <DialogTitle className="text-2xl">Análise Detalhada</DialogTitle>
          <DialogDescription>
            Análise completa do seu jogo de {lotteryName}
          </DialogDescription>
        </DialogHeader>

        {/* Score Section */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70 mb-1">Pontuação Geral</p>
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

          <p className="text-sm text-white/75 leading-relaxed">
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
                <p className="text-sm font-semibold text-white/90">
                  Números Quentes ({hotCount})
                </p>
                <Badge variant="outline" className="text-xs border-orange-400/40 bg-orange-500/10 text-orange-100">
                  Mais frequentes
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {hotNumbers.map((num) => (
                  <div
                    key={num}
                    className="relative px-3 py-2 rounded-lg text-sm font-semibold bg-orange-500/20 border border-orange-400/40 text-orange-100 shadow-sm"
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
                ? `Considere adicionar mais ${Math.max(3 - hotCount, 1)} número(s) quente(s). Números quentes têm maior probabilidade estatística de aparecer.`
                : `Você tem muitos números quentes. Considere substituir ${hotCount - 5} por números balanceados para melhor diversificação.`
            }
            idealRange="3-5 números (20-30%)"
            highlightNumbers={detailedAnalysis.allHotNumbers ?? []}
            highlightLabel="Números quentes do histórico recente"
          />

          {/* Números Balanceados */}
          {balancedNumbers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-green-500" />
                <p className="text-sm font-semibold text-white/90">
                  Números Balanceados ({balancedCount})
                </p>
                <Badge variant="outline" className="text-xs border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
                  Frequência média
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {balancedNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 shadow-sm"
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
                <p className="text-sm font-semibold text-white/90">
                  Números Frios ({coldCount})
                </p>
                <Badge variant="outline" className="text-xs border-sky-400/40 bg-sky-500/10 text-sky-100">
                  Menos frequentes
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {coldNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-sky-500/15 border border-sky-400/30 text-sky-100 shadow-sm"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Distribuição Par/Ímpar */}
        <div className="rounded-2xl p-4 space-y-3 bg-slate-900/60 border border-slate-800">
          <h4 className="font-semibold text-sm">Distribuição Par / Ímpar</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Pares</p>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">{evenOddDistribution.even}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {evenNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/15 border border-emerald-400/40 text-emerald-100"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Ímpares</p>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">{evenOddDistribution.odd}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {oddNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/15 border border-emerald-400/40 text-emerald-100"
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

        {/* Números Quentes Disponíveis */}
        {detailedAnalysis.allHotNumbers && detailedAnalysis.allHotNumbers.length > 0 && (
          <div className="bg-orange-900/45 border border-orange-500/40 rounded-2xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-foreground">Números Quentes Disponíveis</h3>
            </div>
            <p className="text-sm text-foreground opacity-80">
              Estes são os números mais frequentes nos últimos concursos. Use-os para melhorar suas chances:
            </p>
            <div className="flex flex-wrap gap-2">
              {detailedAnalysis.allHotNumbers.map((num: number) => {
                const isSelected = selectedNumbers.includes(num);
                return (
                  <div
                    key={num}
                    className={`
                      relative px-3 py-2 rounded-lg text-sm font-semibold border-2
                      ${isSelected
                        ? 'bg-orange-600 text-white border-orange-700 opacity-50'
                        : 'bg-orange-500 text-white border-orange-600'
                      }
                    `}
                    title={isSelected ? 'Já selecionado' : 'Número quente disponível'}
                  >
                    {num.toString().padStart(2, '0')}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 text-xs">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recomendações Inteligentes */}
        {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recomendações Personalizadas</h3>

            {analysisResult.recommendations.map((rec: Recommendation, index: number) => {
              const severityConfig = {
                success: {
                  bgColor: 'bg-emerald-900/45',
                  borderColor: 'border border-emerald-500/40',
                  icon: CheckCircle,
                  iconColor: 'text-emerald-300',
                  textColor: 'text-white',
                  accent: 'bg-emerald-500/20 border border-emerald-400/40'
                },
                warning: {
                  bgColor: 'bg-amber-900/45',
                  borderColor: 'border border-amber-500/35',
                  icon: AlertCircle,
                  iconColor: 'text-amber-300',
                  textColor: 'text-white',
                  accent: 'bg-amber-500/20 border border-amber-400/40'
                },
                info: {
                  bgColor: 'bg-sky-900/45',
                  borderColor: 'border border-sky-500/40',
                  icon: Info,
                  iconColor: 'text-sky-300',
                  textColor: 'text-white',
                  accent: 'bg-sky-500/20 border border-sky-400/40'
                }
              };

              const config = severityConfig[rec.severity];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className={`${config.bgColor} ${config.borderColor} rounded-2xl p-4 space-y-3 shadow-inner`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className={`font-semibold text-sm mb-1 ${config.textColor}`}>{rec.title}</h4>
                        <p className={`text-xs mb-1 ${config.textColor} opacity-80`}>{rec.diagnosis}</p>
                      </div>

                      <div className={`${config.accent} rounded-lg p-3`}>
                        <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${config.textColor} opacity-80`}>💡 Recomendação:</p>
                        <p className={`text-sm font-semibold ${config.textColor}`}>{rec.recommendation}</p>
                      </div>

                      {rec.actionable && rec.numbersToAdd && rec.numbersToRemove && (
                        <div className="flex flex-col gap-2 text-xs">
                          {rec.numbersToRemove.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-red-600 dark:text-red-400 font-medium whitespace-nowrap">❌ Remover:</span>
                              <div className="flex flex-wrap gap-1">
                                {rec.numbersToRemove.map(n => (
                                  <span key={n} className="px-2 py-0.5 rounded bg-red-500/20 text-red-100 font-semibold border border-red-400/40">
                                    {n.toString().padStart(2, '0')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {rec.numbersToAdd.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-emerald-200 font-semibold whitespace-nowrap uppercase tracking-wide">✅ Adicionar:</span>
                              <div className="flex flex-wrap gap-1">
                                {rec.numbersToAdd.map(n => (
                                  <span key={n} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-100 font-semibold border border-emerald-400/40">
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
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800 shadow-inner text-center space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Gostou da análise detalhada?
            </p>
            <p className="text-xs text-white/70">
              Compartilhe e ganhe créditos extras
            </p>
          </div>
          <p className="text-xs text-white/60">
            {coldShareMessage}
          </p>

          <ShareButton
            context="detailed"
            data={{ score }}
            payload={sharePayload}
            variant="secondary"
            size="default"
            label="Compartilhar Análise"
            showCredits={true}
            userId={userId}
            className="w-full"
          />
        </div>

        {/* Botão Editar Jogo */}
        {onEdit && (
          <Button
            onClick={() => {
              onEdit();
              onOpenChange(false);
            }}
            className="w-full"
            variant="outline"
            size="lg"
          >
            Editar Jogo
          </Button>
        )}

        {/* Footer Info */}
        <div className="text-xs text-center text-white/60 pt-2 border-t border-white/10">
          <p>
            Análise baseada em padrões históricos de {lotteryName}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
