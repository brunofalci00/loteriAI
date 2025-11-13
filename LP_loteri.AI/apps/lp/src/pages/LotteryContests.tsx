import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ContestCard } from "@/components/ContestCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info } from "lucide-react";
import { useUpcomingDraws } from "@/hooks/useUpcomingDraws";
import { Skeleton } from "@/components/ui/skeleton";
import { LotteryGuideDialog } from "@/components/LotteryGuideDialog";

const lotteryData: Record<string, { name: string; icon: string }> = {
  "mega-sena": { name: "Mega-Sena", icon: "🎱" },
  "quina": { name: "Quina", icon: "⭐" },
  "lotofacil": { name: "Lotofácil", icon: "🎯" },
  "lotomania": { name: "Lotomania", icon: "🔮" },
  "dupla-sena": { name: "Dupla Sena", icon: "🎲" },
  "timemania": { name: "Timemania", icon: "⚽" },
  "mais-milionaria": { name: "+Milionária", icon: "💰" },
  "federal": { name: "Federal", icon: "🎟️" },
  "dia-de-sorte": { name: "Dia de Sorte", icon: "🍀" },
  "super-sete": { name: "Super Sete", icon: "🎰" },
};

const LotteryContests = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  const lottery = type ? lotteryData[type] : null;
  const { data: upcomingDraws, isLoading, error } = useUpcomingDraws(type || "", 7);

  if (!lottery || !type) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 pt-8">
          <p className="text-center text-muted-foreground">Loteria não encontrada</p>
        </div>
      </div>
    );
  }

  const handleContestClick = (contestNumber: number) => {
    window.scrollTo(0, 0);
    navigate(`/lottery/${type}/analysis/${contestNumber}`);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-8 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-8">
          {/* Logo e Nome do Concurso */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{lottery.icon}</span>
            <h1 className="text-2xl font-bold">{lottery.name}</h1>
          </div>

          {/* Banner Informativo */}
          <Alert className="mb-6 bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-sm text-foreground">
                Quer entender melhor como funciona a {lottery.name}? 
                Veja as regras, chances de premiação e dicas!
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsGuideOpen(true)}
                className="sm:ml-4 whitespace-nowrap"
              >
                Ver Guia Completo
              </Button>
            </AlertDescription>
          </Alert>

          <p className="text-lg text-muted-foreground">
            Escolha o concurso que deseja analisar
          </p>

          {/* Dialog do Guia */}
          <LotteryGuideDialog
            lotteryId={type}
            open={isGuideOpen}
            onOpenChange={setIsGuideOpen}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center space-y-3">
            <p className="text-destructive font-semibold">
              Erro ao carregar concursos
            </p>
            <p className="text-sm text-muted-foreground">
              {error.message || 'A API da Caixa pode estar temporariamente indisponível. Por favor, tente novamente em alguns minutos.'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-3"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : upcomingDraws && upcomingDraws.length > 0 ? (
          <div className="space-y-4">
            {upcomingDraws.map((draw) => (
              <ContestCard
                key={draw.contestNumber}
                contestNumber={draw.contestNumber}
                drawDate={draw.drawDate}
                estimatedPrize={draw.estimatedPrize}
                status={draw.status}
                dayOfWeek={draw.dayOfWeek}
                onClick={() => handleContestClick(draw.contestNumber)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">
              Nenhum concurso disponível no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LotteryContests;
