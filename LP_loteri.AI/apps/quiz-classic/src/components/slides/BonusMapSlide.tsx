import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BonusMapSlideProps {
  onNext: () => void;
  playMapSound?: boolean;
}

export const BonusMapSlide = ({ onNext, playMapSound }: BonusMapSlideProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [coinStage, setCoinStage] = useState<"stack" | "travel" | "spent">("stack");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const confettiTimer = setTimeout(() => setShowConfetti(true), 300);

    if (playMapSound) {
      audioRef.current = new Audio("/sounds/you-win-sequence-2-183949.mp3");
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => undefined);
    }

    return () => {
      clearTimeout(confettiTimer);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [playMapSound]);

  useEffect(() => {
    const timers = [setTimeout(() => setCoinStage("travel"), 600), setTimeout(() => setCoinStage("spent"), 2200)];
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const handleOpenModal = () => setShowNextStepModal(true);
  const handleProceed = () => {
    setShowNextStepModal(false);
    onNext();
  };

  return (
    <div className="slide-shell relative">
      <ConfettiEffect trigger={showConfetti} variant="emoji-rain" />
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <p className="meta-label text-primary flex items-center justify-center gap-2">🗺️ Bônus 1 liberado</p>
          <h1 className="heading-1 text-glow">Mapa dos números quentes na sua tela</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Moedas convertidas em acesso imediato. Se fechar a página, a IA bloqueia o mapa.
          </p>
        </div>

        <div className="coin-flow-panel">
          <p className="text-sm text-muted-foreground text-center">Veja suas moedas pagando o bônus:</p>
          <div className={`coin-flow ${coinStage !== "stack" ? "coin-flow--active" : ""}`}>
            <div className={`coin-stack ${coinStage !== "stack" ? "coin-stack--light" : ""}`}>
              <span className="coin-stack__label">Moedas</span>
              <span className="coin-stack__value">50</span>
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
            <div className={`coin-target ${coinStage === "spent" ? "coin-target--active" : ""}`}>Bônus liberado</div>
          </div>
          <p className="coin-flow-panel__hint sr-only">Moedas viram mapa sempre que você completa.</p>
        </div>

        <Card className="p-5 sm:p-6 space-y-6 border border-primary glow-primary-strong animate-scale-in">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-background">
            <img
              src="https://i.ibb.co/NnGNzdvj/Chat-GPT-Image-29-de-out-de-2025-18-15-44.png"
              alt="Mapa dos números quentes"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="map-scan" aria-hidden="true" />
          </div>

          <div className="space-y-4 text-center">
            <p className="text-sm sm:text-base text-foreground">
              500 sorteios auditados com IA. Nada de chute: só probabilidade para quem trava nos 11.
            </p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm sm:text-base">
              Use enquanto o painel estiver aberto. Fechou ou atualizou, o acesso se perde.
            </div>
            <p className="text-sm text-muted-foreground">Próximo passo: duelo direto contra a IA.</p>
          </div>

          <Button onClick={handleOpenModal} size="lg" className="w-full text-lg sm:text-xl py-5 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow">
            Enfrentar a IA agora
          </Button>
        </Card>
      </div>

      <Dialog open={showNextStepModal} onOpenChange={setShowNextStepModal}>
        <DialogContent className="max-w-md text-center space-y-4">
          <DialogHeader>
            <DialogTitle>Agora é você contra a IA</DialogTitle>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleProceed} className="w-full sm:w-auto">
              Partiu enfrentar a IA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
