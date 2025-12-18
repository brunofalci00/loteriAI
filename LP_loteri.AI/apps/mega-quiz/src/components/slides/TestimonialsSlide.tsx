import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Volume2, VolumeX } from "lucide-react";

interface TestimonialsSlideProps {
  onNext: () => void;
}

export const TestimonialsSlide = ({ onNext }: TestimonialsSlideProps) => {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [ctaUnlocked, setCtaUnlocked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    videoRef.current?.play().catch(() => undefined);
  }, []);

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
    setProgress(Math.min(1, Math.max(0, videoRef.current.currentTime / duration)));
  };

  const handleContinue = () => {
    if (!ctaUnlocked) return;
    onNext();
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
            poster="https://i.ibb.co/ZpGzh5st/Whats-App-Image-2025-10-27-at-16-29-26.jpg"
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
                {ctaUnlocked ? "Clique para continuar." : "O botão libera quando o vídeo terminar."}
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
                ? "bg-primary hover:bg-primary-glow text-primary-foreground pulse-glow"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {ctaUnlocked ? "Continuar" : "Continuar (bloqueado)"}
          </Button>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
        <Button
          onClick={handleContinue}
          size="lg"
          disabled={!ctaUnlocked}
          className={`w-full text-lg py-6 font-extrabold ${
            ctaUnlocked ? "bg-primary hover:bg-primary-glow text-primary-foreground pulse-glow" : "bg-muted text-muted-foreground"
          }`}
        >
          {ctaUnlocked ? "Continuar" : "Continue ao fim do vídeo"}
        </Button>
      </div>
    </div>
  );
};
