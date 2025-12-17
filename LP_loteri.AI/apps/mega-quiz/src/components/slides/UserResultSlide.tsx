import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";
import { megaQuizConfig, currencyFormatter } from "@/config/mega";

interface UserResultSlideProps {
  onNext: () => void;
  userScore: number;
  selectedNumbers: number[];
}

const { manualPrize, manualMaxNumbers } = megaQuizConfig;

export const UserResultSlide = ({ onNext, userScore, selectedNumbers }: UserResultSlideProps) => {
  const [showResult, setShowResult] = useState(false);
  const [prizeDisplay, setPrizeDisplay] = useState(0);
  const manualResultSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowResult(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    manualResultSoundRef.current = new Audio("/sounds/manual-result.mp3");
    manualResultSoundRef.current.volume = 0.18;
    return () => {
      manualResultSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!showResult) {
      setPrizeDisplay(0);
      return;
    }
    manualResultSoundRef.current?.play().catch(() => undefined);
    trackPixelEvent("ManualResult", { userScore });

    let raf = 0;
    const duration = 900;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setPrizeDisplay(Number((manualPrize * progress).toFixed(2)));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [showResult, userScore]);

  const manualHitsLabel = userScore === 1 ? "1 ponto" : `${userScore} pontos`;

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 text-center relative z-10">
        <div className="space-y-2">
          <p className="meta-label flex items-center justify-center gap-2 text-primary">Etapa 2</p>
          <h1 className="heading-1">{showResult ? "Resultado sem sistema" : "Conferindo sua aposta"}</h1>
        </div>

        <Card className="p-5 sm:p-6 space-y-6 border border-border">
          {!showResult ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground text-center">
                Conferindo {manualMaxNumbers} dezenas.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground uppercase">Placar</p>
                <p className="text-[clamp(2.5rem,8vw,4rem)] font-black text-primary">{manualHitsLabel}</p>
              </div>

              <div className="bg-secondary/60 border border-primary/20 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground uppercase mb-1">Valor estimado</p>
                <p className="text-3xl font-bold text-primary">{currencyFormatter.format(prizeDisplay)}</p>
              </div>

              <div className="bg-secondary rounded-2xl p-4">
                <p className="text-xs text-muted-foreground uppercase mb-2">Suas dezenas</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedNumbers.length > 0 ? (
                    selectedNumbers.map((num) => (
                      <span key={num} className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {num}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Nenhuma seleção.</span>
                  )}
                </div>
              </div>

              <Button onClick={onNext} size="lg" className="w-full text-base sm:text-xl py-5 sm:py-6">
                Ver a IA
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
