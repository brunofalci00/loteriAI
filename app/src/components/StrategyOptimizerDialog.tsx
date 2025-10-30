import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calculator, TrendingUp, DollarSign, Target, Award } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { getBetCost, getAvailableNumberOptions, getMinNumbers } from "@/utils/lotteryCosts";
import {
  calculateProbabilitiesWithTickets,
  calculateProbabilityIncrease,
  formatProbability
} from "@/utils/probabilityCalculator";

interface StrategyOptimizerDialogProps {
  lotteryType: string;
  lotteryName: string;
}

const getRecommendedNumbers = (lotteryType: string): number => {
  const recommendations: Record<string, number> = {
    "lotofacil": 17,
    "mega-sena": 8,
    "quina": 7,
    "dupla-sena": 7,
  };
  return recommendations[lotteryType] || getMinNumbers(lotteryType);
};

export const StrategyOptimizerDialog = ({ lotteryType, lotteryName }: StrategyOptimizerDialogProps) => {
  const availableOptions = getAvailableNumberOptions(lotteryType);
  const recommendedNumbers = getRecommendedNumbers(lotteryType);

  const [selectedNumbers, setSelectedNumbers] = useState(recommendedNumbers);
  const [selectedTickets, setSelectedTickets] = useState(1);

  const singleTicketCost = getBetCost(lotteryType, selectedNumbers);
  const totalCost = singleTicketCost * selectedTickets;
  const probabilities = calculateProbabilitiesWithTickets(lotteryType, selectedNumbers, selectedTickets);
  const isRecommended = selectedNumbers === recommendedNumbers;

  // Calcula aumento de probabilidade com mais cartelas
  const probabilityBoost = selectedTickets > 1
    ? calculateProbabilityIncrease(lotteryType, selectedNumbers, 1, selectedTickets)
    : 0;

  const ticketOptions = [1, 3, 5, 10];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Calculator className="mr-2 h-4 w-4" />
          Calcular Estratégia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-primary" />
            Otimize sua Estratégia
          </DialogTitle>
          <DialogDescription>
            Calcule o custo e as probabilidades da sua aposta antes de jogar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                    <span className="text-sm font-bold min-w-[3.5rem] text-right">
                      {formatProbability(probability)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Probability Boost Card */}
          {selectedTickets > 1 && probabilityBoost > 0 && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <p className="text-sm text-green-600 dark:text-green-400">
                <strong>📈 Aumento de Probabilidade:</strong> Com {selectedTickets} cartelas, suas chances aumentam em <strong>+{probabilityBoost.toFixed(2)}%</strong> comparado a 1 cartela!
              </p>
            </div>
          )}

          {/* Info Card */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <strong>💡 Dica:</strong> {isRecommended
                ? `A estratégia de ${selectedNumbers} números oferece o melhor equilíbrio entre custo e probabilidade de acerto.`
                : `Teste a estratégia recomendada de ${recommendedNumbers} números para um melhor custo-benefício.`
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
