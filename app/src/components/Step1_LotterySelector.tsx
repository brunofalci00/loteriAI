import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LotteryType, getAllSupportedLotteries, LotteryConfig } from "@/config/lotteryConfig";

interface Step1_LoterySelectorProps {
  selected: LotteryType | null;
  onSelect: (type: LotteryType) => void;
  onNext: () => void;
}

const colorClasses: Record<string, string> = {
  emerald: "border-emerald-500 bg-emerald-500/5",
  blue: "border-blue-500 bg-blue-500/5",
  purple: "border-purple-500 bg-purple-500/5",
  pink: "border-pink-500 bg-pink-500/5",
  red: "border-red-500 bg-red-500/5",
  green: "border-green-500 bg-green-500/5",
};

export function Step1_LotterySelector({ selected, onSelect, onNext }: Step1_LoterySelectorProps) {
  const lotteries = getAllSupportedLotteries();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Escolha a Loteria</h2>
        <p className="text-muted-foreground">
          Selecione o tipo de loteria que deseja jogar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotteries.map((lottery: LotteryConfig) => {
          const isSelected = selected === lottery.id;
          const colorClass = colorClasses[lottery.color] || "border-border";

          return (
            <Card
              key={lottery.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-lg",
                "border-2",
                isSelected ? colorClass : "border-border"
              )}
              onClick={() => onSelect(lottery.id)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{lottery.icon}</div>
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      isSelected
                        ? `bg-${lottery.color}-500 border-${lottery.color}-500`
                        : "border-muted-foreground"
                    )}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">{lottery.displayName}</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li>• {lottery.description}</li>
                    <li>• Sorteios: {lottery.drawDays}</li>
                  </ul>
                  {lottery.id === 'megasena' && (
                    <Badge variant="default" className="mt-2 text-xs">
                      Mais Popular
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selected}
          size="lg"
          className="min-w-[150px]"
        >
          Próximo →
        </Button>
      </div>
    </div>
  );
}
