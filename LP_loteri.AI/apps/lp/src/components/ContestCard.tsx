import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ContestCardProps {
  contestNumber: number;
  drawDate: Date;
  estimatedPrize: number;
  status: "HOJE" | "AMANHÃ" | "ESPECIAL" | null;
  dayOfWeek: string;
  onClick: () => void;
}

export const ContestCard = ({
  contestNumber,
  drawDate,
  estimatedPrize,
  status,
  dayOfWeek,
  onClick,
}: ContestCardProps) => {
  const formatDrawDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatDrawTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case "HOJE":
        return "default";
      case "AMANHÃ":
        return "secondary";
      case "ESPECIAL":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "HOJE":
        return "bg-primary text-primary-foreground";
      case "AMANHÃ":
        return "bg-secondary text-secondary-foreground";
      case "ESPECIAL":
        return "bg-accent text-accent-foreground";
      default:
        return "";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group cursor-pointer border-border bg-card transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-glow",
        "animate-fade-in"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-2xl font-bold text-foreground">
                Concurso {contestNumber}
              </h3>
              {status && (
                <Badge
                  variant={getStatusVariant(status)}
                  className={cn("text-xs font-semibold", getStatusColor(status))}
                >
                  {status}
                </Badge>
              )}
            </div>

            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {dayOfWeek}, {formatDrawDate(drawDate)} às {formatDrawTime(drawDate)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-primary">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {formatCurrency(estimatedPrize)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Prêmio Estimado
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground group-hover:text-white transition-colors">
              Clique para analisar este concurso →
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
