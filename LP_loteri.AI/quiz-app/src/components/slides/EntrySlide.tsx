import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface EntrySlideProps {
  onNext: () => void;
}

const timelineSteps = [
  {
    icon: "📝",
    title: "Perguntas rápidas",
    description: "Responda 5 perguntas simples e ganhe 10 moedas em cada uma.",
  },
  {
    icon: "🪙",
    title: "Moedas viram mapa",
    description: "As 50 moedas liberam o Mapa dos Números Quentes automático.",
  },
  {
    icon: "🤝",
    title: "Teste sua aposta",
    description: "Compare seus 15 números com a IA sem termos difíceis.",
  },
  {
    icon: "🎰",
    title: "Giro bônus",
    description: "As moedas pagam o primeiro giro da máquina e destravam descontos.",
  },
];

export const EntrySlide = ({ onNext }: EntrySlideProps) => {
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState("...");
  const [ctaReady, setCtaReady] = useState(false);
  const slotSoundRef = useRef<HTMLAudioElement | null>(null);
  const introSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    introSoundRef.current = new Audio("/sounds/intro-chime.mp3");
    introSoundRef.current.volume = 0.08;
    slotSoundRef.current = new Audio("/sounds/slot-loop.mp3");
    slotSoundRef.current.loop = true;
    slotSoundRef.current.volume = 0.05;
    clickSoundRef.current = new Audio("/sounds/game-start.mp3");

    return () => {
      slotSoundRef.current?.pause();
      slotSoundRef.current = null;
      introSoundRef.current = null;
      clickSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setCtaReady(true), 600);
    }, 3600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 450);
    return () => clearInterval(dotsInterval);
  }, []);

  const handleHover = (isHovering: boolean) => {
    if (!slotSoundRef.current) return;
    if (isHovering) {
      slotSoundRef.current.currentTime = 0;
      slotSoundRef.current.play().catch(() => undefined);
    } else {
      slotSoundRef.current.pause();
    }
  };

  const handleStart = () => {
    introSoundRef.current?.play().catch(() => undefined);
    clickSoundRef.current?.play().catch(() => undefined);
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
              src="https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png"
              alt="LOTER.IA"
              className="mx-auto w-24 sm:w-28 drop-shadow-[0_0_20px_rgba(16,185,129,0.45)]"
            />
            <p className="meta-label text-primary">Passo a passo guiado</p>
            <h1 className="heading-hero text-glow">Chega de travar nos 11 pontos</h1>
            <p className="body-lead max-w-2xl">
              Responda as perguntas, junte moedas e veja a IA e troque por prêmios exclusivos.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-primary/30 bg-card/90 p-5 sm:p-6 space-y-5">
          {loading ? (
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="font-semibold text-lg">Preparando o painel{dots}</span>
              </div>
              <p className="text-sm text-muted-foreground">Deixamos tudo alinhado.</p>
            </div>
          ) : (
            <>
              <div className="timeline-visual">
                <div className="timeline-visual__grid">
                  {timelineSteps.map((step, index) => (
                    <div key={step.title} className="timeline-visual__step">
                      <div className="timeline-visual__icon" aria-hidden="true">
                        {step.icon}
                      </div>
                      <div>
                        <p className="timeline-card__title">{step.title}</p>
                        <p className="timeline-card__description">{step.description}</p>
                      </div>
                      {index < timelineSteps.length - 1 && <span className="timeline-visual__connector" aria-hidden="true" />}
                    </div>
                  ))}
                </div>
                <div className="timeline-visual__badges">
                  <span>🚀 Rápido</span>
                  <span>🛡️ Seguro</span>
                  <span>🎯 Guiado</span>
                </div>
              </div>
              <Button
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
                onClick={handleStart}
                size="lg"
                disabled={!ctaReady}
                className={`relative overflow-hidden w-full text-base sm:text-xl py-4 sm:py-6 font-bold rounded-2xl ${
                  ctaReady ? "bg-primary hover:bg-primary-glow text-primary-foreground shadow-[0_10px_40px_rgba(16,185,129,0.35)]" : "bg-muted text-muted-foreground"
                }`}
              >
                {ctaReady ? (
                  <span className="flex items-center gap-2">
                    <span role="img" aria-hidden="true">▶️</span>
                    Começar agora
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 text-sm font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ajustando painel...
                  </span>
                )}
              </Button>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 p-5 bg-secondary/40">
          <p className="text-sm text-muted-foreground mb-2 font-semibold uppercase tracking-[0.3em]">Como funciona</p>
          <p className="text-base text-foreground">
            Cada resposta vale 10 moedas. Ao conquistar 50, você poderá trocar pelo primeiro bônus secreto
          </p>
        </section>
      </div>
    </div>
  );
};
