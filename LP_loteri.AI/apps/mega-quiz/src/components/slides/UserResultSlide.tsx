import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface UserResultSlideProps {
  onNext: () => void;
  userScore: number;
  selectedNumbers: number[];
}

export const UserResultSlide = ({ onNext, userScore, selectedNumbers }: UserResultSlideProps) => {
  const hasSelection = selectedNumbers.length > 0;
  const [showResult, setShowResult] = useState(false);
  const manualResultSoundRef = useRef<HTMLAudioElement | null>(null);

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

        <Card className="p-5 sm:p-6 space-y-6 border border-border">
          {!showResult ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground text-center">Comparando seus 6 números com 2.500 resultados anteriores.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase">Placar sem IA</p>
                <p className="text-[clamp(2.5rem,8vw,4rem)] font-black text-primary">{userScore} pontos</p>
                <p className="text-sm text-muted-foreground">É aqui que você ficaria se entrasse com este jogo agora.</p>
              </div>

              <div className="bg-secondary rounded-2xl p-4 text-left">
                <p className="text-xs text-muted-foreground uppercase mb-2">Seus números</p>
                {hasSelection ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedNumbers.map((num) => (
                      <span key={num} className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {num}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">Seus números aparecerão aqui ao fim da rodada.</p>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Toque no botão abaixo para ver a mesma aposta com a IA trabalhando a seu favor.
              </p>

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
