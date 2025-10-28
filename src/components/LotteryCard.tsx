import { Card } from "./ui/card";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { formatShortDate, isToday, formatCurrency } from "@/utils/formatters";

interface LotteryCardProps {
  name: string;
  description: string;
  icon: string;
  numbersCount: number;
  onClick: () => void;
  nextDrawDate?: Date;
  isLoading?: boolean;
  estimatedPrize?: number;
}

export const LotteryCard = ({ name, description, icon, numbersCount, onClick, nextDrawDate, isLoading, estimatedPrize }: LotteryCardProps) => {
  const drawIsToday = nextDrawDate ? isToday(nextDrawDate) : false;
  return (
    <Card className="group relative overflow-hidden border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-glow hover:scale-105 cursor-pointer" onClick={onClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary text-2xl shadow-glow">
            {icon}
          </div>
          {isLoading && (
            <Skeleton className="h-6 w-24" />
          )}
          {!isLoading && estimatedPrize !== undefined && (
            <Badge variant="secondary" className="text-xs font-semibold">
              {formatCurrency(estimatedPrize)}
            </Badge>
          )}
        </div>

        <h3 className="mb-2 text-xl font-bold text-foreground">{name}</h3>
        <p className="mb-2 text-sm text-muted-foreground">{description}</p>

        {isLoading && (
          <Skeleton className="mb-4 h-4 w-32" />
        )}

        {!isLoading && nextDrawDate && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Próximo: {formatShortDate(nextDrawDate)}</span>
            {drawIsToday && (
              <Badge variant="default" className="ml-1 text-xs">HOJE</Badge>
            )}
          </div>
        )}

        <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-primary/10">
          Analisar
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};
