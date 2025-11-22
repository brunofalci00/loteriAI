import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackPixelEvent } from "@/lib/analytics";

interface RouletteBonusSlideProps {
  onNext: () => void;
  userSpins: number;
  onSpinComplete?: () => void;
}

const SLOT_PRIZES = ["R$ 10 OFF", "R$ 20 OFF", "R$ 50 OFF", "R$ 100 OFF", "R$ 200 OFF", "MAX WIN"];
const WEIGHTED_SPIN_POOL = ["Nao ganhou nada", "Nao ganhou nada", "Nao ganhou nada", "Nao ganhou nada", ...SLOT_PRIZES, "Nao ganhou nada"];
const TARGET_PRIZE = "MAX WIN";

export const RouletteBonusSlide = ({ onNext, userSpins, onSpinComplete }: RouletteBonusSlideProps) => {
  const [reels, setReels] = useState<string[]>(() => Array(3).fill(TARGET_PRIZE));
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const spinLoopRef = useRef<HTMLAudioElement | null>(null);
  type TimerHandle = ReturnType<typeof setTimeout>;
  const timersRef = useRef<TimerHandle[]>([]);

  const spinsLeft = useMemo(() => Math.max(userSpins - (hasSpun ? 1 : 0), 0), [userSpins, hasSpun]);

  useEffect(() => {
    if (!result) return;
    const rain = new Audio("/sounds/coin-rain.mp3");
    rain.volume = 0.2;
    rain.play().catch(() => undefined);
    trackPixelEvent("SlotMaxWin");
    const timer = setTimeout(() => onNext(), 2200);
    return () => clearTimeout(timer);
  }, [result, onNext]);

  const playSound = (file: string, volume: number) => {
    const sound = new Audio(file);
    sound.volume = volume;
    sound.play().catch(() => undefined);
  };

  const randomSpinValue = () => WEIGHTED_SPIN_POOL[Math.floor(Math.random() * WEIGHTED_SPIN_POOL.length)];

  const startSpinLoop = () => {
    spinLoopRef.current = new Audio("/sounds/you-win-sequence-2-183949-1.mp3");
    spinLoopRef.current.loop = true;
    spinLoopRef.current.volume = 0.2;
    spinLoopRef.current.play().catch(() => undefined);
  };

  const stopSpinLoop = () => {
    spinLoopRef.current?.pause();
    spinLoopRef.current = null;
  };

  const registerTimer = (timer: TimerHandle) => {
    timersRef.current.push(timer);
    return timer;
  };

  const clearRegisteredTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const revealFinalReels = () => {
    const finalValues = Array(3).fill(TARGET_PRIZE);
    finalValues.forEach((value, index) => {
      registerTimer(
        setTimeout(() => {
          setReels((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
          });
          playSound("/sounds/roulette-stop.mp3", 0.2 + index * 0.05);
          if (index === finalValues.length - 1) {
            stopSpinLoop();
            setIsSpinning(false);
            setResult(TARGET_PRIZE);
            onSpinComplete?.();
            playSound("/sounds/jackpot-fanfare.mp3", 0.3);
            clearRegisteredTimers();
          }
        }, index * 450),
      );
    });
  };

  useEffect(
    () => () => {
      clearRegisteredTimers();
      stopSpinLoop();
    },
    [],
  );

  const handleSpin = () => {
    if (isSpinning || hasSpun || userSpins <= 0) return;
    setIsSpinning(true);
    setResult(null);
    setHasSpun(true);

    playSound("/sounds/roulette-spin.mp3", 0.25);
    startSpinLoop();
    trackPixelEvent("SlotSpinStart");

    const fastPhaseDuration = 4000;
    const slowPhaseDuration = 2200;

    const fastInterval = registerTimer(
      setInterval(() => {
        setReels((prev) => prev.map(() => randomSpinValue()));
      }, 130),
    );

    registerTimer(
      setTimeout(() => {
        clearInterval(fastInterval);
        const slowInterval = registerTimer(
          setInterval(() => {
            setReels((prev) => prev.map(() => randomSpinValue()));
          }, 220),
        );

        registerTimer(
          setTimeout(() => {
            clearInterval(slowInterval);
            revealFinalReels();
          }, slowPhaseDuration),
        );
      }, fastPhaseDuration),
    );
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 relative z-10">
        <div className="space-y-3 text-center">
          <p className="meta-label text-primary">Bonus 2 · Roleta da IA</p>
          <h2 className="heading-1">Giro pago pela IA</h2>
          <p className="body-lead">
            Ela deixou 1 rodada para voce. Voce pode ganhar ate R$500,00 de desconto na LOTER.IA.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-primary font-semibold inline-flex flex-col sm:flex-row gap-2 justify-center">
            <span>A IA deixou 1 chance ativa exclusivamente pra voce.</span>
            <span>Spins disponiveis: {spinsLeft}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          <Card className="p-6 border border-primary/40 glow-primary-strong w-full lg:w-1/2 space-y-4">
            <div className="bg-background/80 rounded-2xl border border-primary/30 shadow-inner p-6">
              <div className={`grid grid-cols-3 gap-3 ${isSpinning ? "animate-pulse" : ""}`}>
                {reels.map((value, index) => (
                  <div
                    key={index}
                    className={`h-28 sm:h-32 rounded-xl flex items-center justify-center text-center text-xl sm:text-2xl font-black tracking-tight ${
                      value === TARGET_PRIZE ? "bg-gold/20 text-gold border border-gold" : "bg-secondary text-foreground border border-border"
                    }`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">Aperte uma vez.</p>
          </Card>

          <div className="flex-1 space-y-4 text-center lg:text-left">
            <Button
              onClick={handleSpin}
              size="lg"
              disabled={userSpins <= 0 || hasSpun}
              className="w-full lg:w-auto text-base sm:text-xl py-5 sm:py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
            >
              {isSpinning ? "Girando..." : "Girar agora"}
            </Button>
            <p className="text-sm text-muted-foreground font-semibold">Premios possiveis:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>💰 R$10 OFF</li>
              <li>💰 R$20 OFF</li>
              <li>💰 R$50 OFF</li>
              <li>💰 R$100 OFF</li>
              <li>💰 R$200 OFF</li>
              <li>🏆 MAX WIN: R$500 OFF (desconto maximo)</li>
              <li>🔕 Nao ganhou nada (aparece mais durante o giro)</li>
            </ul>

            {result && (
              <Card className="p-4 border border-primary/40 space-y-2">
                <p className="meta-label text-primary">Resultado</p>
                <h3 className="heading-3 text-primary">MAX WIN desbloqueado!</h3>
                <p className="text-sm sm:text-base text-foreground font-semibold">
                  Voce ganhou R$500 de desconto para ativar a LOTER.IA agora.
                </p>
                <p className="text-sm text-muted-foreground">Aproveite enquanto o painel esta aberto.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
