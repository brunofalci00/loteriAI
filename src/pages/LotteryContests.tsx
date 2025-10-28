import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ContestCard } from "@/components/ContestCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUpcomingDraws } from "@/hooks/useUpcomingDraws";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  const lottery = type ? lotteryData[type] : null;
  const { data: upcomingDraws, isLoading, error } = useUpcomingDraws(type || "", 7);

  if (!lottery || !type) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24">
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
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{lottery.icon}</span>
            <h1 className="text-4xl font-bold">{lottery.name}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Escolha o concurso que deseja analisar
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <p className="text-destructive">
              Erro ao carregar concursos. Por favor, tente novamente.
            </p>
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
