import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

type SlideImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

const benefits = [
  { icon: "✅", text: "Jogos prontos com IA todos os dias" },
  { icon: "✅", text: "Até 3 combinações inteligentes por dia" },
  { icon: "✅", text: "Acesso VIP ao painel Mega da Virada" },
  { icon: "✅", text: "Atualizações em tempo real antes dos sorteios" },
  { icon: "✅", text: "Suporte no WhatsApp com resposta rápida" },
  { icon: "✅", text: "Garantia total de 7 dias: testou, não gostou, cancela" },
];

const offerTestimonialImages: SlideImage[] = [
  { src: "img/offer/t-1.jpg", width: 720, height: 1257, alt: "Depoimento" },
  { src: "img/offer/t-2.jpg", width: 720, height: 1262, alt: "Depoimento" },
  { src: "img/offer/t-3.jpg", width: 720, height: 1129, alt: "Depoimento" },
];

const officialPlatformImages: SlideImage[] = [
  { src: "img/offer/p-1.jpg", width: 720, height: 989, alt: "Plataforma oficial" },
  { src: "img/offer/p-2.jpg", width: 720, height: 1146, alt: "Plataforma oficial" },
  { src: "img/offer/p-3.jpg", width: 720, height: 982, alt: "Plataforma oficial" },
];

const officialSealImage: SlideImage = { src: "img/offer/seal.png", width: 320, height: 320, alt: "Selo" };
const secureBadgeImage: SlideImage = { src: "img/offer/secure.png", width: 384, height: 480, alt: "Compra segura" };

export const FinalOfferSlide = () => {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const checkoutUrl =
    (import.meta.env.VITE_CHECKOUT_URL as string | undefined) ?? "https://go.perfectpay.com.br/PPU38CQ4TG2";
  const whatsappUrl = "https://wa.me/5511993371766";
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [tickSpeedUp, setTickSpeedUp] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleCheckoutClick = () => trackPixelEvent("CheckoutClick");
  const handleWhatsAppClick = () => trackPixelEvent("WhatsAppSupportClick");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
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

  return (
    <div className="slide-shell relative py-14">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <img
            src={`${baseUrl}img/logo-256.png`}
            srcSet={`${baseUrl}img/logo-256.png 1x, ${baseUrl}img/logo-512.png 2x`}
            width={168}
            height={112}
            alt="LOTER.IA"
            loading="lazy"
            decoding="async"
            className="mx-auto w-28 sm:w-40 drop-shadow-[0_0_25px_rgba(255,215,0,0.35)] pulse-glow"
          />
          <h1 className="heading-1 text-glow">Acesso ao Sistema LOTER.IA</h1>
          <p className="heading-3 text-primary">Sua vaga foi liberada. Restam 5 acessos antes do sistema bloquear.</p>
        </div>

        <Card className={`p-6 border ${timeLeft <= 60 ? "border-destructive animate-pulse pulse-glow" : "border-primary glow-primary"}`}>
          <div className="flex items-center justify-center gap-4">
            <Clock className={`w-10 h-10 ${timeLeft <= 60 ? "text-destructive animate-bounce" : "text-primary"}`} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-[0.5em]">5 acessos restantes</p>
              <p className={`text-5xl font-bold ${timeLeft <= 60 ? "text-destructive text-glow" : "text-primary"}`}>
                {minutes}:{seconds}
              </p>
              {timeLeft <= 60 && (
                <p className="text-xs text-destructive mt-2 animate-pulse">Se você sair, a vaga vai para o próximo visitante.</p>
              )}
            </div>
          </div>
          <div className="timer-shell mt-4">
            <div className={`timer-bar ${tickSpeedUp ? "timer-bar--fast" : ""}`} style={{ width: `${(timeLeft / (3 * 60)) * 100}%` }} />
          </div>
        </Card>

        <div className="text-center space-y-3">
          <h2 className="heading-2 text-glow">Veja Como o Sistema Funciona</h2>
        </div>

        <div className="video-shell">
          <video
            ref={videoRef}
            src={`${baseUrl}video/demo.mp4`}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
            poster={`${baseUrl}img/offer/t-3.jpg`}
          />
          <Button size="icon" variant="secondary" onClick={toggleAudio} className="sound-pill">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        <div className="text-center space-y-3">
          <h2 className="heading-2 text-glow">Pessoas como você estão ganhando todos os dias! Veja só</h2>
        </div>

        <Card className="p-4 sm:p-6 bg-primary/5 border border-primary/20">
          <div className="space-y-4">
            {offerTestimonialImages.map((image) => (
              <img
                key={image.src}
                src={`${baseUrl}${image.src}`}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                width={image.width}
                height={image.height}
                className="w-full h-auto rounded-2xl border border-border/60 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
              />
            ))}
          </div>
        </Card>

        <div className="text-center space-y-4">
          <h2 className="heading-2">💡 Você vai receber:</h2>
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

        <Card className="p-6 bg-primary/10 border border-primary/30 text-center space-y-3 glow-primary">
          <h3 className="heading-3 text-glow">EMPRESA OFICIAL, QUEM COMPRA RECEBE NA HORA!</h3>
          <p className="body-lead">Não caia em golpes.</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-primary/5 border border-primary/20">
          <div className="space-y-4">
            {officialPlatformImages.map((image) => (
              <img
                key={image.src}
                src={`${baseUrl}${image.src}`}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                width={image.width}
                height={image.height}
                className="w-full h-auto rounded-2xl border border-border/60 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
              />
            ))}
            <img
              src={`${baseUrl}${officialSealImage.src}`}
              alt={officialSealImage.alt}
              loading="lazy"
              decoding="async"
              width={officialSealImage.width}
              height={officialSealImage.height}
              className="mx-auto w-48 sm:w-56 h-auto"
            />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-secondary/90 via-background to-gold/20 border border-primary text-center glow-primary-strong space-y-3">
          <p className="text-2xl font-bold text-foreground">🔥 R$147,00 vitalício</p>
          <div>
            <p className="text-lg text-muted-foreground line-through">Valor cheio: R$297</p>
            <p className="text-6xl md:text-7xl font-bold text-primary text-glow my-4">R$147,00</p>
            <p className="text-base text-foreground font-semibold">Pagamento único (acesso vitalício)</p>
          </div>
          <p className="text-lg text-foreground font-semibold">
            Sem mensalidade escondida e sem renovação automática sem aviso. Você garante acesso vitalício e ainda tem 7 dias para testar sem risco.
          </p>
        </Card>

        <Button
          asChild
          size="lg"
          onClick={handleCheckoutClick}
          className="w-full text-xl md:text-2xl py-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-center glow-primary-strong pulse-glow shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <a href={checkoutUrl} target="_blank" rel="noreferrer">
            ⚡ Garantir Acesso
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
          <img
            src={`${baseUrl}${secureBadgeImage.src}`}
            alt={secureBadgeImage.alt}
            loading="lazy"
            decoding="async"
            width={secureBadgeImage.width}
            height={secureBadgeImage.height}
            className="w-40 sm:w-52 h-auto mx-auto"
          />
          <p>✅ Restam 5 acessos para liberar.</p>
          <p>Se você sair da tela ou não concluir o pagamento, não existe outra chance: a vaga vai para o próximo visitante.</p>
        </div>

        <Card className="p-6 bg-primary/10 border border-primary/30 text-center">
          <p className="text-lg font-bold text-foreground">
            Mesmo sistema usado por quem fez 13 ou 14 pontos nos últimos concursos.
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
            ⚡ Garantir Acesso
          </a>
        </Button>
      </div>
    </div>
  );
};
