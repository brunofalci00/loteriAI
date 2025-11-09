import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { useEffect, useState } from "react";
import { trackPixelEvent } from "@/lib/analytics";

interface MaxWinCelebrationSlideProps {
  onNext: () => void;
}

export const MaxWinCelebrationSlide = ({ onNext }: MaxWinCelebrationSlideProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const jackpot = new Audio("/sounds/winning-alt.mp3");
    jackpot.volume = 0.3;
    jackpot.play().catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <ConfettiEffect trigger={showConfetti} />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-transparent to-amber-900/60 blur-3xl" />
      <div className="w-full max-w-3xl space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <p className="text-sm text-gold tracking-[0.4em] uppercase">Prêmio máximo</p>
          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-black text-gold text-shadow flex items-center justify-center gap-2">
            <span role="img" aria-hidden="true">
              🎉
            </span>
            Você recebeu R$500,00!
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Essa sensação é de quem acabou de economizar alto: a oferta completa da LOTER.IA de R$500 saiu por apenas R$37.
          </p>
        </div>

        <Card className="p-6 sm:p-8 border-2 border-gold bg-gradient-to-br from-black/80 via-background/80 to-amber-900/30 backdrop-blur-lg space-y-6 shadow-[0_0_50px_rgba(250,204,21,0.3)]">
          <div className="space-y-4">
            <p className="text-sm text-gold uppercase flex items-center gap-2 justify-center">
              <span role="img" aria-hidden="true">
                💎
              </span>
              Economia desbloqueada
            </p>
            <div className="flex items-center justify-center gap-4 text-[clamp(2rem,6vw,3.5rem)] font-black text-primary">
              <span className="line-through text-muted-foreground text-2xl sm:text-3xl">R$ 500</span>
              <span className="text-foreground text-2xl">➡</span>
              <span className="text-gold">R$ 37</span>
            </div>
              <p className="text-sm text-muted-foreground">
                Você travou o desconto máximo da IA. Prepare o checkout e finalize enquanto o painel ainda está aberto.
              </p>
            </div>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/30">
              <p className="text-primary font-semibold">Suporte no WhatsApp</p>
              <p className="text-sm text-muted-foreground">Equipe responde a cada passo da ativação.</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/30">
              <p className="text-primary font-semibold">Jogos diários</p>
              <p className="text-sm text-muted-foreground">Receba combinações calibradas todos os dias.</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/30 sm:col-span-2">
              <p className="text-primary font-semibold">Bolão Mega da Virada</p>
              <p className="text-sm text-muted-foreground">Acesso antecipado ao bolão VIP antes de abrir ao público.</p>
            </div>
          </div>

          <Button
            onClick={() => {
              trackPixelEvent("MaxWinCTA");
              onNext();
            }}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-gold to-amber-400 text-background font-bold pulse-glow flex items-center justify-center gap-2"
          >
            <span role="img" aria-hidden="true">
              🔥
            </span>
            Resgatar meu acesso por R$37
          </Button>
        </Card>
      </div>
    </div>
  );
};
