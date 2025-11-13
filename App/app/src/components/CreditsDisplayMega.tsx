/**
 * Component: CreditsDisplayMega
 *
 * Exibe saldo de créditos do usuário com tema dourado
 * Adaptado para o evento Mega da Virada
 *
 * Props:
 * - creditsRemaining: número de créditos disponíveis
 * - creditsTotal: limite total de créditos
 * - isLoading: estado de carregamento
 * - lastResetAt: data do último reset (para calcular próximo)
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Calendar } from "lucide-react";
import { getDaysUntilReset } from "@/services/creditsService";

interface CreditsDisplayMegaProps {
  creditsRemaining: number;
  creditsTotal: number;
  isLoading?: boolean;
  lastResetAt?: string;
}

export const CreditsDisplayMega = ({
  creditsRemaining,
  creditsTotal,
  isLoading = false,
  lastResetAt,
}: CreditsDisplayMegaProps) => {
  const percentage = (creditsRemaining / creditsTotal) * 100;
  const daysUntilReset = lastResetAt ? getDaysUntilReset(lastResetAt) : null;

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-amber-500/20 shadow-lg">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-amber-500/20 shadow-glow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-200">
              Seus Créditos
            </span>
          </div>
          <Badge className="bg-amber-500/20 text-amber-200 border border-amber-500/40">
            Mega da Virada
          </Badge>
        </div>

        {/* Balance and Expiry */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-5xl font-black text-white">
              {creditsRemaining}
              <span className="text-2xl text-white/60">/{creditsTotal}</span>
            </p>
            <p className="text-sm text-white/60 mt-1">
              créditos disponíveis este mês
            </p>
          </div>

          {daysUntilReset !== null && (
            <div className="flex items-center gap-2 text-sm text-amber-200 font-medium">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                Reset em{" "}
                {daysUntilReset === 0
                  ? "hoje à meia-noite"
                  : `${daysUntilReset} dia${daysUntilReset !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={percentage}
            className="h-2 bg-zinc-800"
          />
          <p className="text-xs text-white/50">
            {percentage.toFixed(0)}% de créditos disponíveis
          </p>
        </div>

        {/* Info */}
        <p className="text-xs text-white/50 border-t border-white/10 pt-3">
          1 crédito por ação: gerar jogos IA, analisar manual, regenerar ou criar variações. Use em qualquer loteria do app.
        </p>
      </div>
    </Card>
  );
};

export default CreditsDisplayMega;
