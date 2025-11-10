import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface EntrySlideProps {
  onNext: () => void;
}

const journeySteps = [
  "Responda 5 perguntas rápidas para garantir seu bônus inicial.",
  'Receba o "Mapa dos Números Quentes" com as maiores probabilidades.',
  "Teste sua intuição contra a Inteligência Artificial.",
  "Gire a roleta e concorra a R$500 em prêmios.",
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

      <div className="slide-frame text-center space-y-8 relative z-10">
        <div className="space-y-5 animate-fade-in">
          <img
            src="https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png"
            alt="LOTER.IA"
            className="mx-auto w-28 drop-shadow-[0_0_20px_rgba(16,185,129,0.45)] pulse-glow"
          />
          <h1 className="heading-hero text-glow">
            Lotofácil com +11 pontos não é sorte. É método.
          </h1>
          <p className="body-lead">
            Você está prestes a ver como insiders deixam os 11 pontos para trás com IA, sem depender de sorte.
          </p>
        </div>

        <div className="bg-card border border-primary/40 rounded-2xl p-4 sm:p-6 glow-primary relative overflow-hidden">
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  <span className="heading-3">Carregando sistema de prêmios{dots}</span>
                </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                O painel da IA está calibrando probabilidades em tempo real. Segure um pouco — cada dado precisa encaixar.
              </p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">Jornada do insider</p>
                <div className="journey-list text-left space-y-2 px-1">
                  {journeySteps.map((item, idx) => (
                    <div key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span role="img" aria-hidden="true">
                        🔸
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}
                onClick={handleStart}
                size="lg"
                disabled={!ctaReady}
                className={`relative overflow-hidden w-full text-lg sm:text-xl py-5 sm:py-6 font-bold shadow-2xl transition-all rounded-2xl ${
                  ctaReady ? "bg-primary hover:bg-primary-glow text-primary-foreground glow-primary-strong pulse-glow transform hover:scale-105" : "bg-muted text-muted-foreground"
                }`}
              >
                <span className={`transition-opacity flex items-center gap-2 ${ctaReady ? "opacity-100" : "opacity-0"}`}>
                  <span role="img" aria-hidden="true">
                    🚀
                  </span>
                  Começar agora
                </span>
                {!ctaReady && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando sistema de prêmios...
                  </span>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Experiência guiada: responda rápido e o sistema libera os bônus na sequência certa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
