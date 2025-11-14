import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

export const FinalOfferSlide = () => {
  const checkoutUrl = "https://pay.kirvano.com/8ae58c85-0868-4f7a-ae5c-ab2eb114517a";
  const whatsappUrl = "https://wa.me/5511993371766";
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [tickSpeedUp, setTickSpeedUp] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleCheckoutClick = () => trackPixelEvent("CheckoutClick");
  const handleWhatsAppClick = () => trackPixelEvent("WhatsAppSupportClick");

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
  }, [timeLeft]);

  useEffect(() => {
    videoRef.current?.play().catch(() => undefined);
  }, []);

  const toggleAudio = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    if (!nextMuted) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
    setIsMuted(nextMuted);
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const benefits = [
    { icon: "✅", text: "5 jogos com maiores probabilidades enviados todo dia" },
    { icon: "✅", text: "Alertas extras quando o prêmio acumula ou muda" },
    { icon: "✅", text: "Painel com histórico e leitura dos números quentes" },
    { icon: "✅", text: "Recomendações recalculadas com base nos últimos 500 concursos" },
    { icon: "✅", text: "Envio direto no seu WhatsApp ou e-mail diariamente" },
    { icon: "✅", text: "Suporte no WhatsApp com resposta em minutos" },
    { icon: "✅", text: "Garantia total de 7 dias: testou, não gostou, cancela" },
  ];

  return (
    <div className="slide-shell relative py-14">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <img
            src="https://i.ibb.co/3YvJFgHm/Logo-Lumen-4.png"
            alt="LotoZap"
            className="mx-auto w-28 sm:w-40 drop-shadow-[0_0_25px_rgba(16,185,129,0.45)] pulse-glow"
          />
          <h1 className="heading-1 text-glow">🎁 Prêmio resgatado com sucesso!</h1>
          <p className="heading-3 text-primary">
            Você liberou o acesso completo à LotoZap — a IA que envia os 5 jogos com maiores probabilidades todos os dias direto pra você.
          </p>
        </div>

        <Card className="p-6 flex flex-col gap-4 border border-primary/40 bg-card/80">
          <div className="flex items-center gap-3 justify-center">
            <Volume2 className="w-6 h-6 text-primary" />
            <p className="text-lg font-semibold text-primary">Aviso do painel</p>
          </div>
          <p className="text-base text-muted-foreground text-center">
            A IA acompanhou todo o seu teste e separou os envios diários mais quentes para você. Use o cronômetro abaixo e finalize enquanto o painel estiver aberto.
          </p>
        </Card>
        <Card className={`p-6 border ${timeLeft <= 60 ? "border-destructive animate-pulse pulse-glow" : "border-primary glow-primary"}`}>
          <div className="flex items-center justify-center gap-4">
            <Clock className={`w-10 h-10 ${timeLeft <= 60 ? "text-destructive animate-bounce" : "text-primary"}`} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-[0.5em]">Oferta válida enquanto o painel estiver aberto</p>
              <p className={`text-5xl font-bold ${timeLeft <= 60 ? "text-destructive text-glow" : "text-primary"}`}>
                {minutes}:{seconds}
              </p>
              {timeLeft <= 60 && (
                <p className="text-xs text-destructive mt-2 animate-pulse">
                  Quando o tempo zera, o painel fecha e os envios diários são pausados.
                </p>
              )}
            </div>
          </div>
          <div className="timer-shell mt-4">
            <div className={`timer-bar ${tickSpeedUp ? "timer-bar--fast" : ""}`} style={{ width: `${(timeLeft / (3 * 60)) * 100}%` }} />
          </div>
        </Card>

        <div className="text-center space-y-4">
          <h2 className="heading-2">📦 Você vai receber:</h2>
        </div>

        <Card className="p-6 bg-primary/5 border border-primary/30">
          <div className="space-y-4 text-left">
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-start gap-3 text-foreground text-lg">
                <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
                <p className="font-semibold">{benefit.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-gold/20 border border-primary text-center glow-primary-strong pulse-glow space-y-3">
          <p className="text-2xl font-bold text-foreground">💸 Condição exclusiva</p>
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">Plano anual sem mensalidade escondida.</p>
            <p className="text-4xl md:text-5xl font-bold text-primary text-glow my-2 leading-tight">R$19,90/ano</p>
            <p className="text-sm sm:text-base text-muted-foreground">ou 4x de R$5,51 no cartão</p>
          </div>
          <p className="text-lg text-foreground font-semibold">
            Não é aplicativo: é a IA que dispara 5 jogos calibrados todos os dias, com garantia de 7 dias para testar sem risco.
          </p>
        </Card>

        <Button
          asChild
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full text-lg md:text-xl py-7 bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-center glow-primary-strong pulse-glow shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            🔐 Ativar minha LotoZap agora
          </a>
        </Button>

        <Button
          asChild
          size="lg"
          className="w-full text-base md:text-xl py-6 px-4 bg-emerald-500 hover:bg-emerald-400 text-background font-bold shadow-2xl flex items-center justify-center gap-2 text-center leading-snug"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 whitespace-normal"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <span>💬 Falar com especialista no WhatsApp</span>
          </a>
        </Button>

        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground text-center">
          <img src="https://i.ibb.co/gMtnsTjW/Posts-HQ.png" alt="Compra segura" className="w-40 sm:w-52 mx-auto" />
          <p>⏳ Oferta ativa enquanto o painel estiver aberto.</p>
          <p>Já são +84 pessoas ativadas hoje. Depois disso, o acesso volta para o valor original.</p>
        </div>

        <Card className="p-6 bg-primary/10 border border-primary/30 text-center">
          <p className="text-lg font-bold text-foreground">
            Mesmo sistema usado por quem fez 13 ou 14 pontos nas últimas semanas.
          </p>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
        <Button
          asChild
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full text-base py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-center glow-primary-strong pulse-glow shadow-2xl"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            🔐 Ativar minha LotoZap agora
          </a>
        </Button>
      </div>
    </div>
  );
};
