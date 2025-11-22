import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { trackPixelEvent } from "@/lib/analytics";

interface MaxWinCelebrationSlideProps {
  onNext: () => void;
}

export const MaxWinCelebrationSlide = ({ onNext }: MaxWinCelebrationSlideProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const jackpot = new Audio("/sounds/you-win-sequence-2-183949.mp3");
    jackpot.volume = 0.35;
    jackpot.currentTime = 0;
    jackpot.play().catch(() => undefined);
  }, []);

  return (
    <div className="slide-shell relative overflow-hidden">
      <ConfettiEffect trigger={showConfetti} variant="emoji-rain" intensity="big" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-transparent to-amber-900/60 blur-3xl" />
      <div className="slide-frame space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <p className="meta-label text-gold flex items-center justify-center gap-2 uppercase">
            <span role="img" aria-hidden="true">🎉</span>
            Você destravou o prêmio máximo da IA!
          </p>
          <h1 className="heading-1 text-shadow text-gold">
            🎁 Seu prêmio: R$500 OFF na ativação completa da LOTER.IA
          </h1>
          <p className="body-lead">
            A IA acabou de liberar R$500 de desconto exclusivo com base na sua performance. Isso derruba o acesso completo
            para apenas R$37 por ano.
          </p>
          <p className="body-lead text-gold/80">
            Esse bônus fica reservado somente enquanto o painel estiver aberto.
          </p>
        </div>

        <Card className="p-6 sm:p-8 border border-gold bg-gradient-to-br from-black/80 via-background/80 to-amber-900/30 backdrop-blur-lg space-y-6 shadow-[0_0_50px_rgba(250,204,21,0.3)]">
          <div className="space-y-2 text-left">
            <p className="text-sm text-gold uppercase flex items-center gap-2">
              <span role="img" aria-hidden="true">🪙</span>
              Válido por tempo limitado
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Só aparece pra quem chegou até aqui.</li>
              <li>Desconto ativado pela IA, sem pegadinha.</li>
              <li>Reservado enquanto o painel estiver aberto.</li>
            </ul>
          </div>

          <div className="bg-primary/10 rounded-2xl p-5 border border-primary/40 text-left">
            <p className="text-primary font-semibold text-lg flex items-center gap-2">
              <span role="img" aria-hidden="true">⚠️</span>
              Atenção
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Se você sair ou fechar esta página, o sistema zera o desconto e bloqueia o painel. Aproveite agora para
              confirmar seu acesso anual por R$37.
            </p>
          </div>

          <Button
            onClick={() => {
              trackPixelEvent("MaxWinCTA");
              onNext();
            }}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-gold to-amber-400 text-background font-bold pulse-glow flex items-center justify-center gap-2"
          >
            <span role="img" aria-hidden="true">🚀</span>
            Resgatar meu prêmio agora
          </Button>
        </Card>
      </div>
    </div>
  );
};
