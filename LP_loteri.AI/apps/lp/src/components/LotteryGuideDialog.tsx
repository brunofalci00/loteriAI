import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { lotteryGuides } from "@/data/lotteryGuides";
import { Info } from "lucide-react";

interface LotteryGuideDialogProps {
  lotteryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LotteryGuideDialog = ({
  lotteryId,
  open,
  onOpenChange,
}: LotteryGuideDialogProps) => {
  const guide = lotteryGuides[lotteryId];

  if (!guide) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{guide.icon}</span>
            <div>
              <DialogTitle className="text-3xl">{guide.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{guide.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Como Jogar */}
          <section>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              📋 Como Jogar
            </h3>
            <p className="text-foreground leading-relaxed">{guide.howToPlay}</p>
          </section>

          {/* Regra Especial */}
          {guide.specialRules && (
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                {guide.specialRules}
              </AlertDescription>
            </Alert>
          )}

          {/* Informações da Aposta */}
          <section>
            <h3 className="text-xl font-bold mb-3">💰 Informações da Aposta</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-card">
                <p className="text-xs text-muted-foreground mb-1">
                  Números disponíveis
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {guide.totalNumbers}
                </p>
              </Card>
              <Card className="p-4 bg-card">
                <p className="text-xs text-muted-foreground mb-1">
                  Números por jogo
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {guide.minBet}
                  {guide.minBet !== guide.maxBet && ` - ${guide.maxBet}`}
                </p>
              </Card>
              <Card className="p-4 bg-card">
                <p className="text-xs text-muted-foreground mb-1">
                  Valor da aposta
                </p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {guide.betPrice.toFixed(2)}
                </p>
              </Card>
              <Card className="p-4 bg-card">
                <p className="text-xs text-muted-foreground mb-1">
                  Horário do sorteio
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {guide.drawTime}
                </p>
              </Card>
            </div>
          </section>

          {/* Dias de Sorteio */}
          <section>
            <h3 className="text-xl font-bold mb-3">📅 Dias de Sorteio</h3>
            <div className="flex flex-wrap gap-2">
              {guide.drawDays.map((day) => (
                <Badge
                  key={day}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  {day}
                </Badge>
              ))}
            </div>
          </section>

          {/* Faixas de Premiação */}
          <section>
            <h3 className="text-xl font-bold mb-3">
              🏆 Faixas de Premiação e Probabilidades
            </h3>
            <div className="space-y-3">
              {guide.prizes.map((prize, idx) => (
                <Card key={idx} className="p-4 bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-foreground">
                        {prize.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Probabilidade: <span className="font-medium">{prize.probability}</span>
                      </p>
                    </div>
                    <Badge variant="outline" className="self-start whitespace-nowrap">
                      {prize.prizePercentage}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Dicas */}
          <section>
            <h3 className="text-xl font-bold mb-3">💡 Dicas Importantes</h3>
            <ul className="space-y-2">
              {guide.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="text-primary text-lg mt-0.5">•</span>
                  <span className="text-foreground leading-relaxed flex-1">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Aviso Legal */}
          <Alert className="bg-muted/50 border-muted">
            <AlertDescription className="text-xs text-muted-foreground">
              ⚠️ As informações apresentadas são baseadas nos regulamentos oficiais da Caixa Econômica Federal. 
              Os valores de apostas e percentuais de premiação podem sofrer alterações. 
              Consulte sempre o site oficial das Loterias Caixa para informações atualizadas.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};
