import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackPixelEvent } from "@/lib/analytics";
import { megaQuizConfig, currencyFormatter } from "@/config/mega";

interface RouletteBonusSlideProps {
  onNext: () => void;
  userSpins: number;
  onSpinComplete?: () => void;
}

const SLOT_PRIZES = ["Sem Desconto", "R$ 20 de desconto", "R$ 50 de desconto", "R$ 1.000 de desconto"];
const TARGET_PRIZE = "R$ 1.000 de desconto";
const { slotMaxDiscount } = megaQuizConfig;

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
    const timer = window.setTimeout(() => onNext(), 2200);
    return () => window.clearTimeout(timer);
  }, [result, onNext]);

  const playSound = (file: string, volume: number) => {
    const sound = new Audio(file);
    sound.volume = volume;
    sound.play().catch(() => undefined);
  };

  const startSpinLoop = () => {
    spinLoopRef.current = new Audio("/sounds/slot-loop.mp3");
    spinLoopRef.current.loop = true;
    spinLoopRef.current.volume = 0.08;
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
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const revealFinalReels = () => {
    const finalValues = Array(3).fill(TARGET_PRIZE);
    finalValues.forEach((value, index) => {
      registerTimer(
        window.setTimeout(() => {
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

    const fastInterval = registerTimer(
      window.setInterval(() => {
        setReels((prev) => prev.map(() => SLOT_PRIZES[Math.floor(Math.random() * SLOT_PRIZES.length)]));
      }, 120),
    );

    registerTimer(
      window.setTimeout(() => {
        window.clearInterval(fastInterval);
        const slowInterval = registerTimer(
          window.setInterval(() => {
            setReels((prev) => prev.map(() => SLOT_PRIZES[Math.floor(Math.random() * SLOT_PRIZES.length)]));
          }, 220),
        );

        registerTimer(
          window.setTimeout(() => {
            window.clearInterval(slowInterval);
            revealFinalReels();
          }, 2600),
        );
      }, 4000),
    );
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 relative z-10">
        <div className="space-y-3 text-center">
          <p className="meta-label text-primary">BÔNUS 2 • CONDIÇÃO ESPECIAL DO SISTEMA</p>
          <h2 className="heading-1">Giro reservado pelo sistema</h2>
          <p className="body-lead">
            O sistema manteve uma única rodada ativa para você. Essa etapa pode liberar até {currencyFormatter.format(slotMaxDiscount)} de desconto no acesso.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-primary font-semibold inline-flex flex-col gap-1 justify-center">
            <span className="uppercase tracking-[0.3em] text-[0.7rem] text-muted-foreground">Status da condição</span>
            <span>1 chance ativa • uso único</span>
            <span className="text-muted-foreground">Essa liberação não se repete.</span>
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
            <p className="text-center text-sm text-muted-foreground font-semibold">
              Execute a rodada para confirmar a condição liberada para você.
            </p>
          </Card>

          <div className="flex-1 space-y-4 text-center lg:text-left">
            <Button
              onClick={handleSpin}
              size="lg"
              disabled={userSpins <= 0 || hasSpun}
              className="w-full lg:w-auto text-base sm:text-xl py-5 sm:py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
            >
              {isSpinning ? "Confirmando..." : "CONFIRMAR RODADA AGORA"}
            </Button>
            <p className="text-sm text-muted-foreground font-semibold">Valores possíveis</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {SLOT_PRIZES.map((prize) => (
                <li key={prize}>✨ {prize}</li>
              ))}
            </ul>

            {result && (
              <Card className="p-4 border border-primary/40 space-y-2">
                <p className="meta-label text-primary">CONDIÇÃO CONFIRMADA</p>
                <h3 className="heading-3 text-primary">Liberação registrada</h3>
                <p className="text-sm sm:text-base text-foreground font-semibold">
                  Desconto reservado: {currencyFormatter.format(slotMaxDiscount)} para continuar o processo com vantagem adicional.
                </p>
                <p className="text-sm text-muted-foreground">Acesso válido enquanto o painel estiver aberto.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
