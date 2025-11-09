import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfettiEffect } from "@/components/ConfettiEffect";

interface BonusMapSlideProps {
  onNext: () => void;
}

export const BonusMapSlide = ({ onNext }: BonusMapSlideProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <ConfettiEffect trigger={showConfetti} />
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-bold text-foreground text-glow">
            Parabéns! Você desbloqueou o Bônus 1: Mapa de Números Quentes da LOTER.IA
          </h1>
        </div>

        <Card className="p-5 sm:p-8 space-y-6 border-2 border-primary glow-primary-strong animate-scale-in">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-background">
            <img
              src="https://i.ibb.co/NnGNzdvj/Chat-GPT-Image-29-de-out-de-2025-18-15-44.png"
              alt="Mapa dos números quentes"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="space-y-4 text-center">
            <p className="text-base sm:text-lg text-foreground">
              Agora você tem nas mãos o que muitos tentam adivinhar na sorte.
              <br className="hidden sm:block" />
              Use antes do próximo sorteio pra aumentar suas chances de verdade.
            </p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm sm:text-base">
              Acesso exclusivo enquanto o sistema estiver aberto. Se sair agora, o mapa some junto.
            </div>
            <p className="text-sm text-muted-foreground">
              Você está a 1 giro de liberar o Bônus 2: Roleta de Prêmios da IA.
            </p>
          </div>

          <Button
            onClick={onNext}
            size="lg"
            className="w-full text-lg sm:text-xl py-5 sm:py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow"
          >
            Ir para o Desafio: Você vs IA
          </Button>
        </Card>
      </div>
    </div>
  );
};
