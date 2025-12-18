import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusMapSlideProps {
  onNext: () => void;
  pointsUsed: number;
}

export const BonusMapSlide = ({ onNext, pointsUsed }: BonusMapSlideProps) => {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const [showConfetti, setShowConfetti] = useState(false);
  const [coinStage, setCoinStage] = useState<"stack" | "travel" | "spent">("stack");
  const fanfareRef = useSoundEffect("/sounds/winning-unlock.mp3", { autoplay: false, volume: 0.3 });

  useEffect(() => {
    setShowConfetti(true);
    fanfareRef.current?.play().catch(() => undefined);
  }, [fanfareRef]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setCoinStage("travel"), 500),
      window.setTimeout(() => setCoinStage("spent"), 1700),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className="slide-shell relative">
      <ConfettiEffect trigger={showConfetti} variant="emoji-rain" />
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <p className="meta-label text-primary">Perfil: VENCEDOR</p>
          <h1 className="heading-1 text-glow">Mapa dos números quentes liberado</h1>
          <p className="body-lead">Por isso você desbloqueou o acesso ao mapa.</p>
        </div>

        <div className="coin-flow-panel">
          <p className="text-sm text-muted-foreground text-center">Pontos usados:</p>
          <div className={`coin-flow ${coinStage !== "stack" ? "coin-flow--active" : ""}`}>
            <div className={`coin-stack ${coinStage !== "stack" ? "coin-stack--light" : ""}`}>
              <span className="coin-stack__label">Pontos</span>
              <span className="coin-stack__value">{pointsUsed}</span>
            </div>
            <div className="coin-path">
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className={`coin-path__coin ${coinStage === "travel" ? `coin-path__coin--move coin-path__coin--delay-${index}` : ""} ${
                    coinStage === "spent" ? "coin-path__coin--hidden" : ""
                  }`}
                />
              ))}
            </div>
            <div className={`coin-target ${coinStage === "spent" ? "coin-target--active" : ""}`}>Liberado</div>
          </div>
        </div>

        <Card className="p-5 sm:p-6 space-y-5 border border-primary glow-primary-strong animate-scale-in">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-background">
            <img
              src={`${baseUrl}img/bonus-map.jpg`}
              width={900}
              height={600}
              alt="Mapa dos números quentes"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          <Button
            onClick={onNext}
            size="lg"
            className="w-full text-lg sm:text-xl py-5 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow"
          >
            Continuar
          </Button>
        </Card>
      </div>
    </div>
  );
};
