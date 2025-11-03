import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, RefreshCw, Edit, PlusCircle, Eye } from "lucide-react";
import type { AnalysisResult } from "@/services/manualGameAnalysisService";
import { SaveToggleButton } from "@/components/SaveToggleButton";

interface Step4_AnalysisResultProps {
  lotteryType: 'lotofacil' | 'lotomania';
  contestNumber: number;
  selectedNumbers: number[];
  analysisResult: AnalysisResult;
  userId: string | null;
  onViewDetails: () => void;
  onGenerateVariations: () => void;
  onEdit: () => void;
  onReset: () => void;
  isGeneratingVariations?: boolean;
}

export function Step4_AnalysisResult({
  lotteryType,
  contestNumber,
  selectedNumbers,
  analysisResult,
  userId,
  onViewDetails,
  onGenerateVariations,
  onEdit,
  onReset,
  isGeneratingVariations = false
}: Step4_AnalysisResultProps) {
  const { score, summary, hotCount, coldCount, balancedCount, evenOddDistribution, comparisonWithAverage } = analysisResult;

  // Convert score (0-10) to stars (0-5)
  const stars = Math.round(score / 2);
  const halfStar = score % 2 >= 1;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Análise da IA</h2>
        <p className="text-muted-foreground">
          Veja como seu jogo se compara com padrões históricos
        </p>
      </div>

      {/* Main Analysis Card */}
      <Card className="p-8 space-y-6">
        {/* Numbers Display */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Números selecionados:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedNumbers.map((num) => (
              <span
                key={num}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-base font-semibold"
              >
                {num.toString().padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          {/* Score with Stars */}
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">{score.toFixed(1)}/10</span>
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
              <Badge variant={score >= 7 ? 'default' : score >= 5 ? 'secondary' : 'destructive'}>
                {comparisonWithAverage}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold mb-2">Resumo:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </div>

          <Button
            onClick={onViewDetails}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes da Análise
          </Button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Números Quentes</p>
            <p className="text-2xl font-bold text-orange-500">{hotCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Números Frios</p>
            <p className="text-2xl font-bold text-blue-500">{coldCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Balanceados</p>
            <p className="text-2xl font-bold text-green-500">{balancedCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Par / Ímpar</p>
            <p className="text-2xl font-bold">
              {evenOddDistribution.even} / {evenOddDistribution.odd}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {userId && (
            <SaveToggleButton
              lotteryType={lotteryType}
              contestNumber={contestNumber}
              numbers={selectedNumbers}
              analysisResult={{
                hotCount,
                coldCount,
                balancedCount: balancedCount
              }}
              source="manual_created"
              userId={userId}
              generationId={null}
              variant="default"
              className="w-full"
            />
          )}

          <Button
            onClick={onGenerateVariations}
            disabled={isGeneratingVariations}
            variant="default"
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingVariations ? 'animate-spin' : ''}`} />
            Gerar 5 Variações
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onEdit}
            variant="outline"
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Números
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Novo Jogo
          </Button>
        </div>
      </div>
    </div>
  );
}
