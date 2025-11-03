import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Sparkles, RefreshCw, CalendarClock, Info } from "lucide-react";

interface CreditsInfoPopoverProps {
  creditsRemaining: number;
  creditsTotal: number;
  lastResetDate?: Date;
  children?: React.ReactNode;
}

export function CreditsInfoPopover({
  creditsRemaining,
  creditsTotal,
  lastResetDate,
  children
}: CreditsInfoPopoverProps) {
  const resetDate = lastResetDate || new Date();
  const nextResetDate = new Date(resetDate);
  nextResetDate.setMonth(nextResetDate.getMonth() + 1);
  nextResetDate.setDate(1);

  const daysUntilReset = Math.ceil(
    (nextResetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const usagePercentage = ((creditsTotal - creditsRemaining) / creditsTotal) * 100;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Coins className="h-4 w-4" />
            <span>{creditsRemaining}</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Seus Créditos</h3>
                <p className="text-xs text-muted-foreground">Sistema mensal</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-primary">{creditsRemaining}</span>
              <Badge variant="secondary" className="text-xs">
                de {creditsTotal}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(creditsRemaining / creditsTotal) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(0)}% utilizados este mês
            </p>
          </Card>

          {/* Next Reset */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs font-medium">Próximo Reset</p>
              <p className="text-xs text-muted-foreground">
                {nextResetDate.toLocaleDateString('pt-BR')} ({daysUntilReset} dias)
              </p>
            </div>
          </div>

          {/* What are credits */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">O que são créditos?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cada crédito permite usar uma função da plataforma. Você recebe <strong>50 créditos gratuitos</strong> todo mês.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Como usar seus créditos:</p>

              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium">Gerar Análise (1 crédito)</p>
                  <p className="text-xs text-muted-foreground">
                    Analise qualquer loteria e receba 10 jogos otimizados
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium">Regenerar Jogos (1 crédito)</p>
                  <p className="text-xs text-muted-foreground">
                    Gere novas combinações baseadas na mesma análise
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium">Gerar Variações (1 crédito)</p>
                  <p className="text-xs text-muted-foreground">
                    Crie 5 variações otimizadas do seu jogo manual
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                    Gratuito: Salvar, exportar e criar jogos manualmente
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Algumas funções não consomem créditos!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
