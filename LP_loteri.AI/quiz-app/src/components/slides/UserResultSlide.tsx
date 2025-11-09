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
    const timer = setTimeout(() => setShowResult(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    manualResultSoundRef.current = new Audio("/sounds/manual-result.mp3");
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-[clamp(2rem,6vw,3.2rem)] font-bold text-foreground">
            {showResult ? "Seu resultado saiu!" : "A IA está auditando seu jogo"}
          </h1>
          <p className="text-muted-foreground">
            {showResult ? "Este foi o placar da sua intuição antes da IA entrar em campo." : "Veja o veredito antes de liberar a jogada da máquina."}
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 border-2 border-border">
          {!showResult ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                A IA está conferindo seus números e calculando quantos pontos você fez…
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase">Resultado da sua intuição</p>
                <p className="text-[clamp(2.5rem,8vw,4rem)] font-black text-primary">{userScore} pontos</p>
                <p className="text-sm text-muted-foreground">Sem ajuda da IA, esse seria o cenário de hoje.</p>
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
                  <p className="text-sm text-muted-foreground text-center">
                    Seus números serão exibidos aqui assim que a rodada for concluída.
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Agora ligue a IA para ver como ela transforma o mesmo jogo em 14 pontos.
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


