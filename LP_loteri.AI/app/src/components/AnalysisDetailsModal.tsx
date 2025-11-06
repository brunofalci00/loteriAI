import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/services/manualGameAnalysisService";

interface AnalysisDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisResult: AnalysisResult;
  onOptimize?: () => void; // Callback para otimizar jogo com IA
  isOptimizing?: boolean; // Estado de loading
}

export function AnalysisDetailsModal({
  open,
  onOpenChange,
  analysisResult,
  onOptimize,
  isOptimizing = false
}: AnalysisDetailsModalProps) {
  const { score, hotCount, coldCount, balancedCount, evenOddDistribution, dezenaDistribution, patterns, suggestions, comparisonWithAverage, detailedAnalysis } = analysisResult;

  // Score agora é 0-5
  const stars = Math.floor(score);
  const totalNumbers = hotCount + coldCount + balancedCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Análise Detalhada</DialogTitle>
          <DialogDescription>
            Análise completa do seu jogo com insights da IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-bold">{score.toFixed(1)}/5</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Badge variant={score >= 3.5 ? 'default' : score >= 2.5 ? 'secondary' : 'destructive'}>
                  {comparisonWithAverage}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Distribuição Hot/Cold/Balanced */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição Hot/Cold/Balanced</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Números Quentes</span>
                  <span className="text-sm text-muted-foreground">
                    {hotCount} ({((hotCount / totalNumbers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full"
                    style={{ width: `${(hotCount / totalNumbers) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedAnalysis.hotNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Outros Números</span>
                  <span className="text-sm text-muted-foreground">
                    {coldCount} ({((coldCount / totalNumbers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(coldCount / totalNumbers) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedAnalysis.coldNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Números Balanceados</span>
                  <span className="text-sm text-muted-foreground">
                    {balancedCount} ({((balancedCount / totalNumbers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${(balancedCount / totalNumbers) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {detailedAnalysis.balancedNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}
                </p>
              </div>
            </div>
          </Card>

          {/* Distribuição Par/Ímpar */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição Par/Ímpar</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pares</span>
                  <span className="text-sm text-muted-foreground">
                    {evenOddDistribution.even} ({((evenOddDistribution.even / totalNumbers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{ width: `${(evenOddDistribution.even / totalNumbers) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ímpares</span>
                  <span className="text-sm text-muted-foreground">
                    {evenOddDistribution.odd} ({((evenOddDistribution.odd / totalNumbers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-pink-500 h-3 rounded-full"
                    style={{ width: `${(evenOddDistribution.odd / totalNumbers) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Distribuição por Dezenas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Dezenas</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(dezenaDistribution).map(([dezena, count]) => (
                <div key={dezena} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm font-medium">{dezena}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Padrões Identificados */}
          {patterns.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Padrões Identificados</h3>
              <ul className="space-y-2">
                {patterns.map((pattern, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{pattern}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Sugestões da IA */}
          <Card className="p-6 bg-primary/5">
            <h3 className="text-lg font-semibold mb-4">Sugestões de Melhoria</h3>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">💡</span>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Footer com botão de otimização */}
        {onOptimize && (
          <DialogFooter className="border-t pt-4">
            <Button
              onClick={onOptimize}
              disabled={isOptimizing}
              className="w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Otimizando...' : 'Otimizar com IA'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
