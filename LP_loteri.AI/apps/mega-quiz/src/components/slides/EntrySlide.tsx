import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface EntrySlideProps {
  onNext: () => void;
}

export const EntrySlide = ({ onNext }: EntrySlideProps) => {
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  const [loading, setLoading] = useState(true);
  const [ctaReady, setCtaReady] = useState(false);
  const slotSoundRef = useRef<HTMLAudioElement | null>(null);
  const introSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  const ensureHoverSound = () => {
    if (!slotSoundRef.current) {
      const sound = new Audio("/sounds/slot-loop.mp3");
      sound.loop = true;
      sound.volume = 0.05;
      slotSoundRef.current = sound;
    }
    return slotSoundRef.current;
  };

  const ensureIntroSound = () => {
    if (!introSoundRef.current) {
      const sound = new Audio("/sounds/intro-chime.mp3");
      sound.volume = 0.08;
      introSoundRef.current = sound;
    }
    return introSoundRef.current;
  };

  const ensureClickSound = () => {
    if (!clickSoundRef.current) {
      clickSoundRef.current = new Audio("/sounds/game-start.mp3");
    }
    return clickSoundRef.current;
  };

  useEffect(
    () => () => {
      slotSoundRef.current?.pause();
      slotSoundRef.current = null;
      introSoundRef.current = null;
      clickSoundRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
      window.setTimeout(() => setCtaReady(true), 250);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  const handleHover = (isHovering: boolean) => {
    if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
    const sound = ensureHoverSound();
    if (isHovering) {
      sound.currentTime = 0;
      sound.play().catch(() => undefined);
    } else {
      sound.pause();
    }
  };

  const handleStart = () => {
    ensureIntroSound()?.play().catch(() => undefined);
    ensureClickSound()?.play().catch(() => undefined);
    slotSoundRef.current?.pause();
    trackPixelEvent("QuizEntryStart");
    onNext();
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="casino-orb orb-one" />
        <div className="casino-orb orb-two" />
        <div className="casino-orb orb-three" />
      </div>

      <div className="slide-frame relative z-10 space-y-8 pb-4">
        <section className="bg-card/80 border border-primary/30 rounded-3xl p-5 sm:p-8 space-y-4 landing-hero">
          <div className="space-y-3 text-left sm:text-center">
            <img
              src={`${baseUrl}img/logo-256.png`}
              srcSet={`${baseUrl}img/logo-256.png 1x, ${baseUrl}img/logo-512.png 2x`}
              width={168}
              height={112}
              alt="LOTER.IA"
              loading="eager"
              decoding="async"
              className="mx-auto w-24 sm:w-28 drop-shadow-[0_0_20px_rgba(255,215,0,0.35)]"
            />
            <h1 className="heading-hero text-glow">DESCUBRA SE VOCÊ PODE ACESSAR O SISTEMA DA MEGA DA VIRADA</h1>
            <p className="body-lead max-w-2xl">
              Responda 11 perguntas rápidas para ver se você está qualificado para desbloquear o acesso ao Sistema.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-primary/30 bg-card/90 p-5 sm:p-6 space-y-5">
          {loading ? (
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="font-semibold text-lg">Preparando o painel...</span>
              </div>
              <p className="text-sm text-muted-foreground">Um instante.</p>
            </div>
          ) : (
            <Button
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
              onClick={handleStart}
              size="lg"
              disabled={!ctaReady}
              className={`relative overflow-hidden w-full text-base sm:text-xl py-4 sm:py-6 font-bold rounded-2xl ${
                ctaReady
                  ? "bg-primary hover:bg-primary-glow text-primary-foreground shadow-[0_10px_40px_rgba(255,215,0,0.35)]"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {ctaReady ? (
                <span className="flex items-center justify-center">Começar Agora</span>
              ) : (
                <span className="flex items-center justify-center gap-2 text-sm font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ajustando painel...
                </span>
              )}
            </Button>
          )}
        </section>
      </div>
    </div>
  );
};
