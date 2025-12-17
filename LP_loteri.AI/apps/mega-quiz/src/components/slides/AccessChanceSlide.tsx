import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface AccessChanceSlideProps {
  onNext: () => void;
}

type UnlockStage = "intro" | "processing" | "unlocked";

export const AccessChanceSlide = ({ onNext }: AccessChanceSlideProps) => {
  const [stage, setStage] = useState<UnlockStage>("intro");
  const loopRef = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      loopRef.current?.pause();
      loopRef.current = null;
    },
    [],
  );

  const startLoop = () => {
    loopRef.current?.pause();
    loopRef.current = new Audio("/sounds/slot-loop.mp3");
    loopRef.current.loop = true;
    loopRef.current.volume = 0.06;
    loopRef.current.play().catch(() => undefined);
  };

  const stopLoop = () => {
    loopRef.current?.pause();
    loopRef.current = null;
  };

  const playSound = (file: string, volume: number) => {
    const sound = new Audio(file);
    sound.volume = volume;
    sound.play().catch(() => undefined);
  };

  const handleTryUnlock = () => {
    if (stage !== "intro") return;
    setStage("processing");
    trackPixelEvent("SlotSpinStart");
    playSound("/sounds/roulette-spin.mp3", 0.25);
    startLoop();

    window.setTimeout(() => {
      stopLoop();
      setStage("unlocked");
      trackPixelEvent("SlotMaxWin");
      playSound("/sounds/jackpot-fanfare.mp3", 0.28);
      playSound("/sounds/coin-rain.mp3", 0.18);
    }, 2200);
  };

  const handleContinue = () => {
    trackPixelEvent("MaxWinCTA");
    onNext();
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 text-center relative z-10">
        <div className="space-y-2">
          <p className="meta-label text-primary">Etapa 2</p>
          <h1 className="heading-1">{stage === "unlocked" ? "Acesso liberado" : "Você perdeu para a IA"}</h1>
          <p className="body-lead">
            {stage === "unlocked"
              ? "Seu acesso foi liberado. Continue para finalizar."
              : "Mas você ganhou 1 chance de liberar o acesso ao Sistema."}
          </p>
        </div>

        <Card className="p-6 border border-primary/30 glow-primary space-y-4">
          {stage === "intro" && (
            <Button onClick={handleTryUnlock} size="lg" className="w-full text-base sm:text-xl py-6 font-bold">
              Tentar liberar acesso
            </Button>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Validando...</p>
            </div>
          )}

          {stage === "unlocked" && (
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full text-base sm:text-xl py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow"
            >
              Continuar
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

