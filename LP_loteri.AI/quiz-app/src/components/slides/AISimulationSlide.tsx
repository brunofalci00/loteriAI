import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface AISimulationSlideProps {
  onNext: () => void;
  userScore: number;
  aiScore: number;
  userSpins: number;
  aiSpins: number;
}

type Phase = "scan" | "selection" | "verdict";

const AI_NUMBERS = [3, 5, 7, 9, 11, 13, 15, 17, 18, 19, 20, 21, 23, 24, 25];

export const AISimulationSlide = ({ onNext, userScore, aiScore, userSpins, aiSpins }: AISimulationSlideProps) => {
  const [phase, setPhase] = useState<Phase>("scan");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [verdictReady, setVerdictReady] = useState(false);
  const processingRef = useRef<HTMLAudioElement | null>(null);
  const aiSelectSoundRef = useRef<HTMLAudioElement | null>(null);
  const aiResultSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    processingRef.current = new Audio("/sounds/processing-loop.mp3");
    processingRef.current.loop = true;
    processingRef.current.volume = 0.05;
    processingRef.current.play().catch(() => undefined);
    return () => {
      processingRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    aiSelectSoundRef.current = new Audio("/sounds/ai-select.mp3");
    aiSelectSoundRef.current.volume = 0.2;
    aiResultSoundRef.current = new Audio("/sounds/ai-result.mp3");
    aiResultSoundRef.current.volume = 0.3;
    return () => {
      aiSelectSoundRef.current = null;
      aiResultSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("selection"), 2600),
      setTimeout(() => setPhase("verdict"), 2600 + AI_NUMBERS.length * 260 + 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "selection") return;
    setSelectedNumbers([]);
    let index = 0;
    const timer = setInterval(() => {
      setSelectedNumbers((prev) => [...prev, AI_NUMBERS[index]]);
      if (aiSelectSoundRef.current) {
        aiSelectSoundRef.current.currentTime = 0;
        aiSelectSoundRef.current.play().catch(() => undefined);
      }
      index += 1;
      if (index >= AI_NUMBERS.length) {
        clearInterval(timer);
      }
    }, 260);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "verdict") return;
    processingRef.current?.pause();
    processingRef.current = null;
    setVerdictReady(false);
    const timer = setTimeout(() => setVerdictReady(true), 1800);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!verdictReady) return;
    aiResultSoundRef.current?.play().catch(() => undefined);
    trackPixelEvent("AISimulationVerdict", { userScore, aiScore });
  }, [verdictReady, userScore, aiScore]);

  const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="p-6 border-2 border-primary/30">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="text-primary font-bold uppercase tracking-[0.3em]">Modo IA ativo</p>
              <p className="text-muted-foreground">
                {phase === "scan"
                  ? "A IA está auditando seu jogo agora..."
                  : phase === "selection"
                  ? "Selecionando combinações com maior chance..."
                  : "Comparando resultados para liberar seu giro"}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              IA usou {aiSpins} giros hoje • Seu giro bônus: {userSpins}
            </div>
          </div>
        </Card>

        {phase === "scan" && (
          <Card className="p-8 flex flex-col items-center gap-4 border-2 border-border">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-center text-sm text-muted-foreground">
              IA conectando na sua aposta, auditando 2.500 sorteios anteriores e calculando probabilidades...
            </p>
          </Card>
        )}

        {phase === "selection" && (
          <Card className="p-6 space-y-4 border-2 border-border">
            <p className="text-center text-sm text-muted-foreground">
              IA escolhendo 15 números com maior probabilidade neste momento
            </p>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {allNumbers.map((num) => (
                <div
                  key={num}
                  className={`number-cell ${selectedNumbers.includes(num) ? "number-cell--active" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </Card>
        )}

        {phase === "verdict" && (
          <Card className="p-6 space-y-6 border-2 border-border">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground uppercase">Comparativo final</p>
              <p className="text-xl font-bold text-foreground">A IA está jogando por você agora.</p>
            </div>
            {verdictReady ? (
              <>
                <div className="scoreboard">
                  <div className="scoreboard__side">
                    <p className="text-xs text-muted-foreground uppercase">Você</p>
                    <p className="scoreboard__value scoreboard__value--fail">{userScore}</p>
                  </div>
                  <div className="scoreboard__separator" />
                  <div className="scoreboard__side">
                    <p className="text-xs text-muted-foreground uppercase">IA</p>
                    <p className="scoreboard__value scoreboard__value--win">{aiScore}</p>
                  </div>
                </div>
                <div className="space-y-2 text-center text-sm text-muted-foreground">
                  <p>A IA cravou {aiScore} pontos. Comparando seu jogo com o dela… a diferença ficou clara.</p>
                  <p>Você não ganhou os 3 giros, mas ela separou um giro de bônus exclusivo pra você concorrer a até R$500,00.</p>
                  <p>Enquanto você jogava com intuição, ela já rodava estatística real. Agora é sua vez de usar esse giro.</p>
                </div>
                <Button onClick={onNext} size="lg" className="w-full text-base sm:text-xl py-5 sm:py-6 flex items-center justify-center gap-2">
                  <span role="img" aria-hidden="true">
                    🎰
                  </span>
                  Resgatar bônus
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground text-center">
                  IA consolidando os pontos e auditando o painel para liberar seu relatório final...
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
