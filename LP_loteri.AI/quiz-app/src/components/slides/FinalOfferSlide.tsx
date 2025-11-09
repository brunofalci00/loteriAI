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
    "IA treinada com +500 sorteios reais",
    "Mapa dos números mais quentes incluso",
    "Acesso imediato via e-mail",
    "Garantia total de 7 dias — testou, não gostou, cancela",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-20">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-3">
          <img
            src="https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png"
            alt="LOTER.IA"
            className="mx-auto w-28 sm:w-40 drop-shadow-[0_0_25px_rgba(16,185,129,0.45)]"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Resgate Agora: Acesso Completo à LOTER.IA por R$37
          </h1>
          <p className="text-xl text-muted-foreground">
            ⏳ Enquanto você lê isso, outros já ativaram. O seu acesso especial fecha em breve...
          </p>
        </div>

        <Card className={`p-6 border-2 ${timeLeft <= 60 ? "border-destructive animate-pulse" : "border-primary"}`}>
          <div className="flex items-center justify-center gap-4">
            <Clock className={`w-10 h-10 ${timeLeft <= 60 ? "text-destructive animate-bounce" : "text-primary"}`} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-[0.5em]">Oferta expira em</p>
              <p className={`text-5xl font-bold ${timeLeft <= 60 ? "text-destructive" : "text-primary"}`}>
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

        <Card className="p-6 bg-primary/5 border-2 border-primary/30">
          <div className="space-y-3 text-left">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 text-foreground">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-gold/20 border-2 border-primary text-center">
          <p className="text-sm text-muted-foreground line-through">Valor original: R$500</p>
          <p className="text-5xl font-bold text-primary">Agora: R$37</p>
          <p className="text-lg text-muted-foreground">Desconto destravado. Se sair agora, ele some pra sempre.</p>
        </Card>

        <Button
          asChild
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full text-2xl py-10 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            Ativar Loter.IA Agora – R$37
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
          className="w-full text-xl py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            Ativar agora com segurança
          </a>
        </Button>
      </div>
    </div>
  );
};
