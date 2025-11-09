import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

export const FinalOfferSlide = () => {
  const checkoutUrl = "https://pay.kirvano.com/723e60dd-cf83-47c6-8084-f31f88475689";
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [tickSpeedUp, setTickSpeedUp] = useState(false);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  const handleCheckoutClick = () => trackPixelEvent("CheckoutClick");

  useEffect(() => {
    tickSoundRef.current = new Audio("/sounds/timer-tick.mp3");
    tickSoundRef.current.volume = 0.06;
    tickSoundRef.current.loop = true;
    tickSoundRef.current.play().catch(() => undefined);

    return () => {
      tickSoundRef.current?.pause();
      tickSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 20) {
      setTickSpeedUp(true);
    }
    if (timeLeft === 0) {
      tickSoundRef.current?.pause();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!tickSoundRef.current) return;
    tickSoundRef.current.playbackRate = tickSpeedUp ? 1.4 : 1;
  }, [tickSpeedUp]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const benefits = [
    { icon: "🎯", text: "Recomendações personalizadas com IA em tempo real" },
    { icon: "🔒", text: "Painel de combinações calibradas diárias" },
    { icon: "📲", text: "Suporte direto no WhatsApp" },
    { icon: "🎁", text: "Acesso antecipado ao Bolão da Mega da Virada" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-20">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-3">
          <img
            src="https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png"
            alt="LOTER.IA"
            className="mx-auto w-28 sm:w-40 drop-shadow-[0_0_25px_rgba(16,185,129,0.45)] pulse-glow"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-foreground text-glow">
            🥳 Parabéns! Desconto Máximo Ativado
          </h1>
          <p className="text-xl md:text-2xl text-foreground font-semibold">
            Você acabou de desbloquear o prêmio máximo:
          </p>
          <p className="text-2xl md:text-3xl text-primary font-bold glow-primary-strong">
            Acesso completo à Loter.IA por apenas R$37 — de R$500!
          </p>
        </div>

        <Card className={`p-6 border-2 ${timeLeft <= 60 ? "border-destructive animate-pulse pulse-glow" : "border-primary glow-primary"}`}>
          <div className="flex items-center justify-center gap-4">
            <Clock className={`w-10 h-10 ${timeLeft <= 60 ? "text-destructive animate-bounce" : "text-primary"}`} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-[0.5em]">⏳ Oferta válida pelos próximos</p>
              <p className={`text-5xl font-bold ${timeLeft <= 60 ? "text-destructive text-glow" : "text-primary"}`}>
                {minutes}:{seconds}
              </p>
              {timeLeft <= 60 && (
                <p className="text-xs text-destructive mt-2 animate-pulse">
                  Depois disso, volta para R$500.
                </p>
              )}
            </div>
          </div>
          <div className="timer-shell mt-4">
            <div
              className={`timer-bar ${tickSpeedUp ? "timer-bar--fast" : ""}`}
              style={{ width: `${(timeLeft / (3 * 60)) * 100}%` }}
            />
          </div>
        </Card>

        <Card className="p-6 bg-destructive/10 border-2 border-destructive/50 glow-primary">
          <p className="text-lg font-bold text-center mb-4 text-foreground">
            ⚠️ Mas atenção: esse valor é exclusivo e só aparece uma vez.
          </p>
          <p className="text-center text-muted-foreground">
            Se sair dessa página, o sistema entende que você desistiu da sua vaga.
          </p>
        </Card>

        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            ✅ O que você vai acessar agora:
          </h2>
        </div>

        <Card className="p-6 bg-primary/5 border-2 border-primary/30">
          <div className="space-y-4 text-left">
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-start gap-3 text-foreground text-lg">
                <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
                <p className="font-semibold">{benefit.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-gold/20 border-2 border-primary text-center glow-primary-strong pulse-glow">
          <p className="text-2xl font-bold text-foreground mb-2">💰 Desconto desbloqueado:</p>
          <p className="text-lg text-muted-foreground line-through">De R$500</p>
          <p className="text-6xl md:text-7xl font-bold text-primary text-glow my-4">R$37</p>
          <p className="text-lg text-foreground font-semibold">
            Garantia total de 7 dias — testou, não gostou, cancela sem risco.
          </p>
        </Card>

        <Button
          asChild
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full text-2xl md:text-3xl py-12 bg-primary hover:bg-primary-glow text-primary-foreground font-bold glow-primary-strong pulse-glow shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            👉 Quero Meu Acesso Agora – R$37 com Garantia
          </a>
        </Button>

        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <img
            src="https://i.ibb.co/gMtnsTjW/Posts-HQ.png"
            alt="Compra segura"
            className="w-40 sm:w-52 mx-auto"
          />
          <p>+84 pessoas ativaram só hoje</p>
        </div>

        <Card className="p-6 bg-primary/10 border border-primary/30 text-center">
          <p className="text-lg font-bold text-foreground">
            Mesmo sistema usado por quem fez 13 ou 14 pontos nas últimas semanas.
          </p>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
        <Button
          asChild
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full text-xl py-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold glow-primary-strong pulse-glow shadow-2xl"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            👉 Quero Meu Acesso – R$37
          </a>
        </Button>
      </div>
    </div>
  );
};
