import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trash2, Shuffle, Check } from "lucide-react";

interface Step3_NumberGridProps {
  lotteryType: 'lotofacil' | 'lotomania';
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
  const maxNumber = lotteryType === 'lotofacil' ? 25 : 100;
  const expectedCount = lotteryType === 'lotofacil' ? 15 : 50;
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

  const isComplete = selectedNumbers.length === expectedCount;
  const progress = (selectedNumbers.length / expectedCount) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8" data-tour="number-grid">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Selecione os Números</h2>
        <p className="text-muted-foreground">
          Clique nos números para montar seu jogo
        </p>
      </div>

      {/* Progress Bar and Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Selecionados: {selectedNumbers.length}/{expectedCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {isComplete ? '✓ Completo!' : `Faltam ${expectedCount - selectedNumbers.length}`}
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

          <div className="flex gap-2 ml-6">
            <Button
              onClick={onClear}
              variant="outline"
              size="sm"
              disabled={selectedNumbers.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button
              onClick={onRandom}
              variant="outline"
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Aleatório
            </Button>
          </div>
        </div>
      </Card>

      {/* Numbers Grid */}
      <div
        className={cn(
          "grid gap-2",
          lotteryType === 'lotofacil'
            ? "grid-cols-5 sm:grid-cols-7 md:grid-cols-10"
            : "grid-cols-5 sm:grid-cols-10 md:grid-cols-12"
        )}
      >
        {numbers.map((number) => {
          const isSelected = selectedNumbers.includes(number);

          return (
            <button
              key={number}
              onClick={() => onToggleNumber(number)}
              className={cn(
                "relative aspect-square rounded-lg font-semibold text-lg",
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
          {isComplete ? 'Analisar Jogo →' : `Selecione ${expectedCount - selectedNumbers.length} números`}
        </Button>
      </div>
    </div>
  );
}
