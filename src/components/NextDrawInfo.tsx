import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, RefreshCw, TrendingUp } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { formatCurrency, formatLongDate, isToday } from "@/utils/formatters";
import { useLotteryDrawInfo } from "@/hooks/useLotteryDrawInfo";

interface NextDrawInfoProps {
  lotteryType: string;
  lotteryName: string;
}

export const NextDrawInfo = ({ lotteryType, lotteryName }: NextDrawInfoProps) => {
  const { data, isLoading, error, refetch, isRefetching } = useLotteryDrawInfo(lotteryType);

  if (isLoading) {
    return (
      <Card className="border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-card shadow-card">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar as informações do próximo sorteio.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const drawIsToday = isToday(data.nextDrawDate);

  return (
    <Card className="border-border bg-card shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-primary" />
          Próximo Sorteio
          {drawIsToday && (
            <Badge variant="default" className="ml-2 animate-pulse">
              HOJE
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Data do Sorteio</p>
          <p className="text-lg font-semibold capitalize text-foreground">
            {formatLongDate(data.nextDrawDate)} às 20h
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Concurso</p>
            <p className="text-lg font-semibold text-foreground">
              Nº {data.nextDrawNumber}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Prêmio Estimado</p>
            <p className="flex items-center gap-1 text-lg font-bold text-primary">
              <TrendingUp className="h-4 w-4" />
              {formatCurrency(data.estimatedPrize)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
