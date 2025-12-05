import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { trackPixelEvent } from "@/lib/analytics";

interface MaxWinCelebrationSlideProps {
  onNext: () => void;
  playWinSound?: boolean;
}

export const MaxWinCelebrationSlide = ({ onNext, playWinSound }: MaxWinCelebrationSlideProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [dangerCountdown, setDangerCountdown] = useState(18);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const confettiTimer = setTimeout(() => setShowConfetti(true), 1500);

    if (playWinSound) {
      audioRef.current = new Audio("/sounds/you-win-sequence-2-183949.mp3");
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => undefined);
    }

    return () => {
      clearTimeout(confettiTimer);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [playWinSound]);

  useEffect(() => {
    const timer = setInterval(() => setDangerCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="slide-shell relative overflow-hidden">
      <ConfettiEffect trigger={showConfetti} variant="emoji-rain" intensity="big" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-transparent to-amber-900/60 blur-3xl" />
      <div className="slide-frame space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <p className="meta-label text-gold flex items-center justify-center gap-2 uppercase">
            <span role="img" aria-hidden="true">
              🏆
            </span>
            MAX WIN liberado
          </p>
          <h1 className="heading-1 text-shadow text-gold">R$500 liberados pelo seu desempenho.</h1>
          <p className="body-lead">A IA abriu o cofre porque você passou em todas as etapas. Se sair agora, perde tudo.</p>
          <p className="body-lead text-gold/80">Bônus para menos de 8% dos jogadores. Fecha sem aviso.</p>
        </div>

        <Card className="p-6 sm:p-8 border border-gold bg-gradient-to-br from-black/80 via-background/80 to-amber-900/30 backdrop-blur-lg space-y-6 shadow-[0_0_50px_rgba(250,204,21,0.3)]">
          <div className="space-y-2 text-left">
            <p className="text-sm text-gold uppercase flex items-center gap-2">
              <span role="img" aria-hidden="true">
                ⏳
              </span>
              Válido por tempo limitado
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Só aparece para quem chegou até aqui.</li>
              <li>Desconto ativado pela IA, sem pegadinha.</li>
              <li>Reservado enquanto o painel estiver aberto.</li>
            </ul>
          </div>

          <div className="bg-primary/10 rounded-2xl p-5 border border-primary/40 text-left">
            <p className="text-primary font-semibold text-lg flex items-center gap-2">
              <span role="img" aria-hidden="true">
                ⚠️
              </span>
              Atenção
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Se você sair ou fechar esta página, o sistema zera o desconto e bloqueia o painel. Confirme seu acesso anual por R$37 agora.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-center">
            <div className="text-5xl font-black text-gold prize-shadow">R$500</div>
            <div className="flex flex-col items-start">
              <span className="text-xs uppercase tracking-[0.3em] text-destructive">Tempo crítico</span>
              <span className="text-2xl font-bold text-destructive danger-blink">{dangerCountdown}s</span>
            </div>
          </div>

          <Button
            onClick={() => {
              trackPixelEvent("MaxWinCTA");
              onNext();
            }}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-gold to-amber-400 text-background font-bold pulse-glow flex items-center justify-center gap-2 tap-intent"
          >
            <span role="img" aria-hidden="true">
              🚀
            </span>
            Garantir meu prêmio agora
          </Button>
        </Card>
      </div>
    </div>
  );
};
