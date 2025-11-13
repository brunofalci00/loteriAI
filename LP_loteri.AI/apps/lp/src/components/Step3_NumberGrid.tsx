import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trash2, Shuffle, Check } from "lucide-react";
import { LotteryType, getLotteryConfig } from "@/config/lotteryConfig";
import { useClickSound } from "@/hooks/useClickSound";

interface Step3_NumberGridProps {
  lotteryType: LotteryType;
  selectedNumbers: number[];
  onToggleNumber: (number: number) => void;
  onClear: () => void;
  onRandom: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3_NumberGrid({
  lotteryType,
  selectedNumbers,
  onToggleNumber,
  onClear,
  onRandom,
  onNext,
  onBack
}: Step3_NumberGridProps) {
  const config = getLotteryConfig(lotteryType);
  const { minNumber, maxNumber, numbersToSelect } = config;
  const numbers = Array.from({ length: maxNumber - minNumber + 1 }, (_, i) => i + minNumber);

  const isComplete = selectedNumbers.length === numbersToSelect;
  const progress = (selectedNumbers.length / numbersToSelect) * 100;

  // Hook para som de clique
  const { playClick } = useClickSound();

  // Handler para click com som
  const handleNumberClick = (number: number) => {
    const isSelected = selectedNumbers.includes(number);

    // Tocar som apenas ao SELECIONAR (não ao desselecionar)
    if (!isSelected) {
      playClick();
    }

    onToggleNumber(number);
  };

  // Grid columns baseado no total de números
  const getGridCols = () => {
    if (maxNumber <= 25) return "grid-cols-5 sm:grid-cols-7 md:grid-cols-10"; // Lotofácil
    if (maxNumber <= 60) return "grid-cols-5 sm:grid-cols-8 md:grid-cols-10"; // Mega-Sena, Dupla-Sena
    if (maxNumber <= 80) return "grid-cols-5 sm:grid-cols-10 md:grid-cols-12"; // Quina, Timemania
    return "grid-cols-5 sm:grid-cols-10 md:grid-cols-12"; // Lotomania
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Selecione os Números</h2>
        <p className="text-muted-foreground">
          {config.description}
        </p>
      </div>

      {/* Progress Bar and Actions */}
      <Card className="p-6">
        <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Botões - Mobile: acima | Desktop: ao lado */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={onClear}
              variant="outline"
              size="sm"
              disabled={selectedNumbers.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button
              onClick={onRandom}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Aleatório
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 flex-1 w-full">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Selecionados: {selectedNumbers.length}/{numbersToSelect}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isComplete ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Numbers Grid */}
      <div className={cn("grid gap-2", getGridCols())}>
        {numbers.map((number) => {
          const isSelected = selectedNumbers.includes(number);

          return (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              className={cn(
                "relative aspect-square rounded-lg font-semibold text-base sm:text-lg",
                "transition-all duration-200 hover:scale-110",
                "border-2",
                isSelected
                  ? "bg-green-500 border-green-600 text-white shadow-lg"
                  : "bg-background border-border hover:border-primary hover:bg-accent"
              )}
            >
              {number.toString().padStart(2, '0')}
              {isSelected && (
                <div className="absolute top-0.5 right-0.5">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Numbers Display */}
      {selectedNumbers.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Números selecionados:</p>
          <div className="flex flex-wrap gap-2">
            {selectedNumbers.map((num) => (
              <span
                key={num}
                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm font-medium"
              >
                {num.toString().padStart(2, '0')}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="min-w-[150px]"
        >
          ← Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={!isComplete}
          size="lg"
          className="min-w-[150px]"
        >
          {isComplete ? 'Analisar Jogo →' : `Selecione ${numbersToSelect - selectedNumbers.length} números`}
        </Button>
      </div>
    </div>
  );
}
