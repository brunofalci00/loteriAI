import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface EntrySlideProps {
  onNext: () => void;
}

const journeySteps = [
  "Responda as 5 perguntas para garantir seu bônus inicial.",
  "Receba o “Mapa dos Números Quentes” com os números com maior chance de sorteio.",
  "Teste sua Intuição contra a Inteligência Artificial.",
  "Gire a roleta e concorra a R$500,00 em prêmios.",
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
    slotSoundRef.current.volume = 0.04;
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
    }, 3200);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="casino-orb orb-one" />
        <div className="casino-orb orb-two" />
        <div className="casino-orb orb-three" />
      </div>

      <div className="w-full max-w-4xl text-center space-y-8 relative z-10">
        <div className="space-y-6 animate-fade-in px-2">
          <img
            src="https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png"
            alt="LOTER.IA"
            className="mx-auto w-32 sm:w-40 drop-shadow-[0_0_20px_rgba(16,185,129,0.45)]"
          />
          <h1 className="text-[clamp(2rem,7vw,4rem)] font-bold text-foreground leading-tight text-glow">
            Tem gente ganhando na Lotofácil sem depender da sorte.
          </h1>
          <p className="text-[clamp(1.1rem,4vw,1.8rem)] text-muted-foreground">
            E o segredo deles acabou de ser liberado pra você.
          </p>
          <div className="space-y-2">
            <p className="text-lg text-foreground flex justify-center gap-2">
              <span role="img" aria-hidden="true">
                🎯
              </span>
              Eles acertam porque jogam com inteligência e estatística.
            </p>
            <p className="text-sm text-muted-foreground">
              Hoje você vai descobrir o mesmo sistema e ainda testar de graça.
            </p>
          </div>
        </div>

        <div className="bg-card border-2 border-primary/50 rounded-2xl p-4 sm:p-8 glow-primary-strong relative overflow-hidden">
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-lg sm:text-xl font-bold text-foreground">
                    Carregando sistema de prêmios{dots}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Carregando painel da IA... aguarde alguns segundos e jogue como os insiders.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="journey-list text-left space-y-2 px-2">
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
                className={`relative overflow-hidden w-full text-xl sm:text-2xl py-6 sm:py-10 font-bold shadow-2xl transition-all rounded-2xl ${
                  ctaReady ? "bg-primary hover:bg-primary-glow text-primary-foreground" : "bg-muted text-muted-foreground"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
