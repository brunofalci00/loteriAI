import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface UserResultSlideProps {
  onNext: () => void;
  userScore: number;
  selectedNumbers: number[];
  drawnNumbers: number[];
}

export const UserResultSlide = ({ onNext, userScore, selectedNumbers, drawnNumbers }: UserResultSlideProps) => {
  const hasSelection = selectedNumbers.length > 0;
  const [showResult, setShowResult] = useState(false);
  const manualResultSoundRef = useRef<HTMLAudioElement | null>(null);

  // Calculate real hits and misses from user's actual selection
  const userHits = selectedNumbers.filter((num) => drawnNumbers.includes(num));
  const userMisses = selectedNumbers.filter((num) => !drawnNumbers.includes(num));

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    manualResultSoundRef.current = new Audio("/sounds/manual-result.mp3");
    manualResultSoundRef.current.volume = 0.18;
    return () => {
      manualResultSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!showResult) return;
    manualResultSoundRef.current?.play().catch(() => undefined);
    trackPixelEvent("ManualResult", { userScore });
  }, [showResult, userScore]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 text-center relative z-10">
        <div className="space-y-2">
          <p className="meta-label flex items-center justify-center gap-2 text-primary">🧮 IA analisando seu jogo</p>
          <h1 className="heading-1">{showResult ? "Seu resultado saiu" : "Estamos conferindo sua aposta"}</h1>
          <p className="body-lead">
            {showResult ? "Veja quantos pontos faria sozinho antes de ligar a IA." : "Segure alguns segundos. Conferimos tudo antes de mostrar."}
          </p>
        </div>

        <Card className="p-5 sm:p-6 space-y-6 border border-emerald-400/60 bg-emerald-950/50">
          {!showResult ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground text-center">Comparando seus 15 números com 2.500 resultados anteriores.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground uppercase">Placar sem IA</p>
                  <p className="text-[clamp(2.5rem,8vw,4rem)] font-black text-primary">{userScore} pontos</p>
                  <p className="text-sm text-muted-foreground">É aqui que você ficaria se entrasse com este jogo agora.</p>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                  <p className="text-base sm:text-lg text-foreground font-semibold">
                    Você acertou {userScore} números neste cenário
                  </p>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Toque no botão abaixo para ver a mesma aposta com a IA trabalhando a seu favor.
                </p>
              </div>

              <Button onClick={onNext} size="lg" className="w-full text-base sm:text-xl py-5 sm:py-6">
                Ver a IA jogando agora
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
