import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Volume2, VolumeX } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

export const TestimonialsSlide = () => {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const checkoutUrl =
    (import.meta.env.VITE_CHECKOUT_URL as string | undefined) ?? "https://go.perfectpay.com.br/PPU38CQ4TG2";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTimeRef = useRef(0);
  const lastAdvanceAtRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [ctaUnlocked, setCtaUnlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [safetyUnlocked, setSafetyUnlocked] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || ctaUnlocked) return;
      if (video.paused) return;
      if (video.readyState < 2) return;
      if (video.currentTime <= 0.25) return;

      const now = Date.now();
      const lastAdvanceAt = lastAdvanceAtRef.current;
      if (lastAdvanceAt === null) {
        lastAdvanceAtRef.current = now;
        lastTimeRef.current = video.currentTime;
        return;
      }

      const stuck = Math.abs(video.currentTime - lastTimeRef.current) < 0.01;
      if (!stuck) {
        lastTimeRef.current = video.currentTime;
        lastAdvanceAtRef.current = now;
        return;
      }

      if (now - lastAdvanceAt > 12000) {
        setSafetyUnlocked(true);
        setCtaUnlocked(true);
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [ctaUnlocked]);

  const toggleAudio = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    if (!nextMuted) {
      videoRef.current.play().catch(() => undefined);
    }
    setIsMuted(nextMuted);
  };

  const handleEnded = () => setCtaUnlocked(true);
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const currentTime = videoRef.current.currentTime;
    setProgress(Math.min(1, Math.max(0, currentTime / duration)));

    const remaining = Math.max(0, duration - currentTime);
    setSecondsRemaining(Math.ceil(remaining));

    if (!ctaUnlocked && remaining <= 30) {
      setCtaUnlocked(true);
    }

    lastTimeRef.current = currentTime;
    lastAdvanceAtRef.current = Date.now();
  };

  const handleVideoError = () => {
    setSafetyUnlocked(true);
    setCtaUnlocked(true);
  };

  const handleContinue = () => {
    if (!ctaUnlocked) return;
    trackPixelEvent("CheckoutClick", { source: "TestimonialsSlide" });
    window.location.assign(checkoutUrl);
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <img
            src={`${baseUrl}img/logo-256.png`}
            srcSet={`${baseUrl}img/logo-256.png 1x, ${baseUrl}img/logo-512.png 2x`}
            width={168}
            height={112}
            alt="LOTER.IA"
            loading="lazy"
            decoding="async"
            className="mx-auto w-24 drop-shadow-[0_0_20px_rgba(255,215,0,0.35)]"
          />
          <h1 className="heading-1 text-glow text-center">Assista o Vídeo Completo para Liberar o Seu Acesso</h1>
          <p className="body-lead">Validação final do acesso ao Sistema LOTER.IA.</p>
        </div>

        <Card className="border-0 bg-gradient-to-r from-primary/10 to-gold/10 p-0 overflow-hidden relative">
          <video
            ref={videoRef}
            className="w-full h-full rounded-2xl"
            src={`${baseUrl}video/testimonials.mp4`}
            autoPlay
            muted={isMuted}
            playsInline
            preload="metadata"
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
            onError={handleVideoError}
            poster={`${baseUrl}img/offer/t-3.jpg`}
          />
          <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between gap-3 bg-background/70 backdrop-blur-sm border-t border-border/60">
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold text-left">
              {isMuted ? "Ative o som" : "Som ativado"}
            </p>
            <Button size="icon" variant="secondary" onClick={toggleAudio} className="sound-pill">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 border border-primary/30 bg-card/90 text-left space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-extrabold text-foreground text-lg sm:text-xl">
                {ctaUnlocked ? "Acesso liberado" : "Quase lá…"}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground font-semibold">
                {ctaUnlocked
                  ? safetyUnlocked
                    ? "Se o vídeo travou, liberamos o botão."
                    : "Clique para liberar o acesso."
                  : secondsRemaining === null
                    ? "Aguarde… carregando o vídeo."
                    : secondsRemaining > 30
                      ? "Continue assistindo para liberar o botão."
                      : "Liberado. Clique agora."}
              </p>
            </div>
            {!ctaUnlocked && <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" aria-hidden="true" />}
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={!ctaUnlocked}
            className={`w-full text-lg sm:text-xl py-6 font-extrabold ${
              ctaUnlocked
                ? "bg-primary hover:bg-primary-glow text-primary-foreground pulse-glow animate-pulse"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {ctaUnlocked ? "LIBERAR ACESSO" : "Continue ao fim do vídeo"}
          </Button>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
        <Button
          onClick={handleContinue}
          size="lg"
          disabled={!ctaUnlocked}
          className={`w-full text-lg py-6 font-extrabold ${
            ctaUnlocked ? "bg-primary hover:bg-primary-glow text-primary-foreground pulse-glow animate-pulse" : "bg-muted text-muted-foreground"
          }`}
        >
          {ctaUnlocked ? "LIBERAR ACESSO" : "Continue ao fim do vídeo"}
        </Button>
      </div>
    </div>
  );
};
