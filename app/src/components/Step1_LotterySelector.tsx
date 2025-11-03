import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step1_LoterySelectorProps {
  selected: 'lotofacil' | 'lotomania' | null;
  onSelect: (type: 'lotofacil' | 'lotomania') => void;
  onNext: () => void;
}

export function Step1_LotterySelector({ selected, onSelect, onNext }: Step1_LoterySelectorProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8" data-tour="lottery-selector">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Escolha a Loteria</h2>
        <p className="text-muted-foreground">
          Selecione o tipo de loteria que deseja jogar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lotofácil Card */}
        <Card
          className={cn(
            "p-8 cursor-pointer transition-all hover:shadow-lg",
            "border-2",
            selected === 'lotofacil' ? "border-primary bg-primary/5" : "border-border"
          )}
          onClick={() => onSelect('lotofacil')}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-5xl">🎱</div>
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  selected === 'lotofacil'
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                )}
              >
                {selected === 'lotofacil' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Lotofácil</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Selecione 15 números</li>
                <li>• Range: 1 a 25</li>
                <li>• Sorteios: Segunda a Sábado</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Lotomania Card */}
        <Card
          className={cn(
            "p-8 cursor-pointer transition-all hover:shadow-lg",
            "border-2",
            selected === 'lotomania' ? "border-primary bg-primary/5" : "border-border"
          )}
          onClick={() => onSelect('lotomania')}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-5xl">🎰</div>
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  selected === 'lotomania'
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                )}
              >
                {selected === 'lotomania' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Lotomania</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Selecione 50 números</li>
                <li>• Range: 1 a 100</li>
                <li>• Sorteios: Terça, Quinta e Sábado</li>
              </ul>
            </div>
          </div>
        </Card>
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
