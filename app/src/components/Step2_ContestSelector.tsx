import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Step2_ContestSelectorProps {
  lotteryType: 'lotofacil' | 'lotomania';
  selectedContest: number | null;
  onSelect: (contestNumber: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2_ContestSelector({
  lotteryType,
  selectedContest,
  onSelect,
  onNext,
  onBack
}: Step2_ContestSelectorProps) {
  const [selectionType, setSelectionType] = useState<'next' | 'specific'>('next');
  const [specificNumber, setSpecificNumber] = useState<string>('');

  // Próximo concurso estimado (simulado - seria dinâmico em produção)
  const nextContest = lotteryType === 'lotofacil' ? 3206 : 2885;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 1);

  const handleNext = () => {
    if (selectionType === 'next') {
      onSelect(nextContest);
      onNext();
    } else if (specificNumber && parseInt(specificNumber) > 0) {
      onSelect(parseInt(specificNumber));
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Escolha o Concurso</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <span>A IA usa o histórico do concurso para análise mais precisa</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  A análise contextual usa dados históricos do concurso selecionado
                  para identificar números quentes, frios e padrões.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card className="p-6">
        <RadioGroup value={selectionType} onValueChange={(val) => setSelectionType(val as 'next' | 'specific')}>
          <div className="space-y-6">
            {/* Próximo Concurso */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="next" id="next" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="next" className="text-base font-medium cursor-pointer">
                  Próximo Concurso
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {lotteryType === 'lotofacil' ? 'Lotofácil' : 'Lotomania'} #{nextContest} - Estimado:{' '}
                  {estimatedDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Número Específico */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="specific" id="specific" className="mt-1" />
              <div className="flex-1 space-y-3">
                <Label htmlFor="specific" className="text-base font-medium cursor-pointer">
                  Número Específico
                </Label>
                <Input
                  type="number"
                  placeholder="Digite o número do concurso"
                  value={specificNumber}
                  onChange={(e) => {
                    setSpecificNumber(e.target.value);
                    setSelectionType('specific');
                  }}
                  onFocus={() => setSelectionType('specific')}
                  min="1"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Concursos recentes: {nextContest - 50} até {nextContest - 1}
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </Card>

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
          onClick={handleNext}
          disabled={
            selectionType === 'specific' && (!specificNumber || parseInt(specificNumber) <= 0)
          }
          size="lg"
          className="min-w-[150px]"
        >
          Próximo →
        </Button>
      </div>
    </div>
  );
}
