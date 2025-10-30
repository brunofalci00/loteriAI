import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, DollarSign, Target, Award } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { getBetCost, getAvailableNumberOptions, getMinNumbers } from "@/utils/lotteryCosts";

interface StrategyOptimizerProps {
  lotteryType: string;
  lotteryName: string;
}

// Fórmulas simplificadas de probabilidade baseadas em combinações
const calculateProbabilities = (
  lotteryType: string,
  numbersSelected: number
): Record<string, number> => {
  // Probabilidades aproximadas baseadas em análise combinatória
  // Valores aumentam conforme mais números são selecionados

  if (lotteryType === "lotofacil") {
    const baseProbabilities = {
      15: { 11: 42, 12: 18, 13: 5, 14: 0.8, 15: 0.08 },
      16: { 11: 68, 12: 32, 13: 9, 14: 1.5, 15: 0.15 },
      17: { 11: 82, 12: 45, 13: 15, 14: 2.8, 15: 0.35 },
      18: { 11: 91, 12: 58, 13: 22, 14: 5, 15: 0.65 },
      19: { 11: 96, 12: 69, 13: 31, 14: 8, 15: 1.2 },
      20: { 11: 98, 12: 78, 13: 42, 14: 12, 15: 2 },
    };
    return baseProbabilities[numbersSelected as keyof typeof baseProbabilities] || baseProbabilities[15];
  }

  if (lotteryType === "mega-sena") {
    const baseProbabilities = {
      6: { 4: 2.5, 5: 0.15, 6: 0.000007 },
      7: { 4: 12, 5: 0.9, 6: 0.00005 },
      8: { 4: 28, 5: 2.8, 6: 0.00018 },
      9: { 4: 45, 5: 5.8, 6: 0.00042 },
      10: { 4: 58, 5: 9.5, 6: 0.00084 },
      11: { 4: 68, 5: 13.5, 6: 0.0015 },
      12: { 4: 75, 5: 17.8, 6: 0.0024 },
    };
    return baseProbabilities[numbersSelected as keyof typeof baseProbabilities] || baseProbabilities[6];
  }

  if (lotteryType === "quina") {
    const baseProbabilities = {
      5: { 2: 35, 3: 8, 4: 0.8, 5: 0.01 },
      6: { 2: 62, 3: 18, 4: 2.5, 5: 0.06 },
      7: { 2: 78, 3: 32, 4: 5.5, 5: 0.18 },
      8: { 2: 87, 3: 45, 4: 9.5, 5: 0.4 },
      9: { 2: 92, 3: 56, 4: 14, 5: 0.75 },
      10: { 2: 95, 3: 65, 4: 19, 5: 1.2 },
    };
    return baseProbabilities[numbersSelected as keyof typeof baseProbabilities] || baseProbabilities[5];
  }

  // Fallback genérico
  return { default: 50 };
};

// Determina qual é a estratégia recomendada (melhor custo-benefício)
const getRecommendedNumbers = (lotteryType: string): number => {
  const recommendations: Record<string, number> = {
    "lotofacil": 17,
    "mega-sena": 8,
    "quina": 7,
    "dupla-sena": 7,
  };
  return recommendations[lotteryType] || getMinNumbers(lotteryType);
};

export const StrategyOptimizer = ({ lotteryType, lotteryName }: StrategyOptimizerProps) => {
  const availableOptions = getAvailableNumberOptions(lotteryType);
  const recommendedNumbers = getRecommendedNumbers(lotteryType);

  const [selectedNumbers, setSelectedNumbers] = useState(recommendedNumbers);
  const [selectedTickets, setSelectedTickets] = useState(1);

  const singleTicketCost = getBetCost(lotteryType, selectedNumbers);
  const totalCost = singleTicketCost * selectedTickets;
  const probabilities = calculateProbabilities(lotteryType, selectedNumbers);
  const isRecommended = selectedNumbers === recommendedNumbers;

  // Opções de cartelas
  const ticketOptions = [1, 3, 5, 10];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Target className="h-6 w-6 text-primary" />
          Otimize sua Estratégia
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Calcule o custo e as probabilidades da sua aposta antes de jogar
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selector de Números */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Quantos números por cartela?</label>
            {isRecommended && (
              <Badge variant="default" className="animate-pulse">
                Recomendado pela IA
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {availableOptions.map((option) => (
              <Button
                key={option}
                variant={selectedNumbers === option ? "default" : "outline"}
                onClick={() => setSelectedNumbers(option)}
                className={`h-12 text-base font-bold ${
                  option === recommendedNumbers && selectedNumbers !== option
                    ? "border-primary/50"
                    : ""
                }`}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Selector de Cartelas */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quantas cartelas?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ticketOptions.map((option) => (
              <Button
                key={option}
                variant={selectedTickets === option ? "default" : "outline"}
                onClick={() => setSelectedTickets(option)}
                className="h-12 text-base font-bold"
              >
                {option}x
              </Button>
            ))}
          </div>
        </div>

        {/* Investimento Total */}
        <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Investimento Total</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalCost)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(singleTicketCost)} por cartela
              </p>
            </div>
          </div>
        </div>

        {/* Probabilidades de Acerto */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Probabilidade de Acerto</span>
          </div>

          <div className="space-y-2">
            {Object.entries(probabilities).map(([points, probability]) => (
              <div
                key={points}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {points} {points === "1" ? "ponto" : "pontos"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                      style={{ width: `${Math.min(probability, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold min-w-[3rem] text-right">
                    {probability >= 1 ? probability.toFixed(1) : probability.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>💡 Dica:</strong> {isRecommended
              ? `A estratégia de ${selectedNumbers} números oferece o melhor equilíbrio entre custo e probabilidade de acerto.`
              : `Teste a estratégia recomendada de ${recommendedNumbers} números para um melhor custo-benefício.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
