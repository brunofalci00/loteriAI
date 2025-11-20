import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

export const FinalOfferSlide = () => {
  const checkoutUrl = "https://pay.kirvano.com/723e60dd-cf83-47c6-8084-f31f88475689";
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

  const totalValue = "R$781,00";
  const discountValue = "R$744,00";
  const finalValue = "R$37,00";

  const bonuses = [
    {
      title: "Suporte 24/7 no WhatsApp",
      subtitle: "Respostas em minutos, a qualquer hora.",
      body: "Tire dúvidas, peça conferência de jogos e receba ajustes de estratégia direto no WhatsApp, todo dia e toda hora.",
      image: "https://i.ibb.co/VWPQP3dP/cadastro-bersi.png",
    },
    {
      title: "Apostador Consistente – O Método 3x3",
      subtitle: "Um mini-método usado por jogadores que sempre ganham faixas.",
      body: "Simples, rápido e feito pra você acertar mais vezes sem gastar mais.",
      priceFrom: "R$97,00",
      priceTo: "R$0,00",
      image: "https://i.ibb.co/TqHxhKyf/Chat-GPT-Image-19-de-nov-de-2025-19-45-22.png",
    },
    {
      title: "Estratégia de R$ 10 por Semana",
      subtitle: "A forma mais barata e inteligente de lucrar com loteria.",
      body: "Com apenas R$10, você já joga com vantagem e deixa de perder dinheiro à toa.",
      priceFrom: "R$147,00",
      priceTo: "R$0,00",
      image: "https://i.ibb.co/67hHkCzb/Chat-GPT-Image-19-de-nov-de-2025-19-42-54.png",
    },
  ];

  const benefits = [
    { icon: "✅", text: "Jogos prontos com IA todos os dias" },
    { icon: "✅", text: "Até 3 combinações inteligentes por dia" },
    { icon: "✅", text: "Acesso VIP ao Bolão da Mega da Virada" },
    { icon: "✅", text: "Painel atualizado em tempo real" },
    { icon: "✅", text: "Suporte no WhatsApp com resposta em minutos" },
    { icon: "✅", text: "Garantia total de 7 dias: testou, não gostou, cancela" },
  ];

  return (
    <div className="slide-shell relative py-14">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <img
            src="https://i.ibb.co/Dfy1rwfr/Logo-Lumen-2.png"
            alt="LOTER.IA"
            className="mx-auto w-28 sm:w-40 drop-shadow-[0_0_25px_rgba(16,185,129,0.45)] pulse-glow"
          />
          <h1 className="heading-1 text-glow">🎁 Prêmio resgatado com sucesso!</h1>
          <p className="heading-3 text-primary">
            Você liberou o acesso completo à LOTER.IA com R$744,00 de desconto garantido. Agora veja tudo que está incluso.
          </p>
        </div>

        <div className="video-shell">
          <video
            ref={videoRef}
            src="/video/demo.mp4"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://i.ibb.co/ZpGzh5st/Whats-App-Image-2025-10-27-at-16-29-26.jpg"
          />
          <Button size="icon" variant="secondary" onClick={toggleAudio} className="sound-pill">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
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
                  Depois disso, volta para {totalValue}.
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

        <div className="grid gap-4 md:grid-cols-3">
          {bonuses.map((bonus) => (
            <Card key={bonus.title} className="h-full bg-background border border-primary/30 overflow-hidden flex flex-col">
              {bonus.image && (
                <div className="relative aspect-[4/3] overflow-hidden border-b border-primary/20 bg-black/50">
                  <img src={bonus.image} alt={bonus.title} className="w-full h-full object-contain bg-black/60 p-3" loading="lazy" />
                </div>
              )}
              <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">{bonus.title}</p>
                  <p className="text-sm sm:text-base text-foreground font-semibold">{bonus.subtitle}</p>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground flex-1">{bonus.body}</p>
                {bonus.priceFrom && bonus.priceTo && (
                  <div className="text-sm font-semibold text-primary">
                    De {bonus.priceFrom} por <span className="text-foreground">{bonus.priceTo}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
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
          <p className="text-2xl font-bold text-foreground">💸 Oferta completa da LOTER.IA</p>
          <div className="space-y-2 text-left text-sm sm:text-base">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor total (oferta + bônus)</span>
              <span className="font-semibold text-foreground">{totalValue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Desconto aplicado</span>
              <span className="font-semibold text-emerald-400">-{discountValue}</span>
            </div>
          </div>
          <div>
            <p className="text-lg text-muted-foreground line-through">De {totalValue}</p>
            <p className="text-6xl md:text-7xl font-bold text-primary text-glow my-4">{finalValue}</p>
            <p className="text-sm text-muted-foreground">Pagamento único, acesso por 12 meses.</p>
          </div>
          <p className="text-lg text-foreground font-semibold">
            Sem mensalidade e sem renovação automática sem aviso. Você garante 12 meses completos e ainda tem 7 dias para testar sem risco.
          </p>
        </Card>

        <Button
          asChild
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full text-xl md:text-2xl py-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-center glow-primary-strong pulse-glow shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            🔐 Garantir acesso por R$37,00
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

        <Card className="p-4 sm:p-5 bg-amber-500/10 border border-amber-400/60 text-center space-y-2">
          <p className="text-base sm:text-lg font-semibold text-amber-100">
            🛡️ Atenção: somos a única página oficial do Loter.IA. Evite golpes! Você está comprando com segurança nesta página verificada.
          </p>
          <p className="text-sm sm:text-base text-amber-100/90">📲 Suporte exclusivo via WhatsApp após a compra.</p>
        </Card>

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
          className="w-full text-lg py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-center glow-primary-strong pulse-glow shadow-2xl"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            🔐 Garantir acesso por R$37,00
          </a>
        </Button>
      </div>
    </div>
  );
};
