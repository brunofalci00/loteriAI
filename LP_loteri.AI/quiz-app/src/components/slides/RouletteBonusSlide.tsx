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
const TARGET_PRIZE = "MAX WIN";

export const RouletteBonusSlide = ({ onNext, userSpins, onSpinComplete }: RouletteBonusSlideProps) => {
  const [reels, setReels] = useState<string[]>(() => Array(3).fill(TARGET_PRIZE));
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const spinsLeft = useMemo(() => Math.max(userSpins - (hasSpun ? 1 : 0), 0), [userSpins, hasSpun]);

  useEffect(() => {
    if (!result) return;
    const rain = new Audio("/sounds/coin-rain.mp3");
    rain.volume = 0.2;
    rain.play().catch(() => undefined);
    trackPixelEvent("SlotMaxWin");
    const timer = setTimeout(() => onNext(), 2000);
    return () => clearTimeout(timer);
  }, [result, onNext]);

  const playSound = (file: string, volume: number) => {
    const sound = new Audio(file);
    sound.volume = volume;
    sound.play().catch(() => undefined);
  };

  const registerTimer = (timer: NodeJS.Timeout) => {
    timersRef.current.push(timer);
    return timer;
  };

  const clearRegisteredTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  useEffect(
    () => () => {
      clearRegisteredTimers();
    },
    [],
  );

  const handleSpin = () => {
    if (isSpinning || hasSpun || userSpins <= 0) return;
    setIsSpinning(true);
    setResult(null);
    setHasSpun(true);

    playSound("/sounds/roulette-spin.mp3", 0.25);
    trackPixelEvent("SlotSpinStart");

    const fastInterval = registerTimer(
      setInterval(() => {
        setReels((prev) => prev.map(() => SLOT_PRIZES[Math.floor(Math.random() * SLOT_PRIZES.length)]));
      }, 120),
    );

    registerTimer(
      setTimeout(() => {
        clearInterval(fastInterval);
        const slowInterval = registerTimer(
          setInterval(() => {
            setReels((prev) => prev.map(() => SLOT_PRIZES[Math.floor(Math.random() * SLOT_PRIZES.length)]));
          }, 220),
        );

        registerTimer(
          setTimeout(() => {
            clearInterval(slowInterval);
            playSound("/sounds/roulette-stop.mp3", 0.2);
            const finalResult = Array(3).fill(TARGET_PRIZE);
            setReels(finalResult);
            setIsSpinning(false);
            setResult(TARGET_PRIZE);
            onSpinComplete?.();
            playSound("/sounds/jackpot-fanfare.mp3", 0.3);
            clearRegisteredTimers();
          }, 2600),
        );
      }, 5000),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">Bônus 2</p>
          <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-bold text-foreground">Seu giro de bônus virou máquina de slots</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            A IA acertou 14 pontos, usou os três giros dela e liberou um slot especial para você. Quando os três rolos param no MAX WIN, você garante R$500,00 de desconto instantâneo.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-primary font-semibold inline-flex flex-col sm:flex-row gap-2 justify-center">
            <span>A IA deixou 1 chance ativa exclusivamente pra você.</span>
            <span>Spins disponíveis: {spinsLeft}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          <Card className="p-6 border-2 border-primary/40 glow-primary-strong w-full lg:w-1/2 space-y-4">
            <div className="bg-background/80 rounded-2xl border-2 border-primary/30 shadow-inner p-6">
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
            <p className="text-center text-sm text-muted-foreground">
              Clique abaixo para fazer os rolos girarem. O resultado final já está carregado pela IA.
            </p>
          </Card>

          <div className="flex-1 space-y-4 text-center lg:text-left">
            <p className="text-sm text-muted-foreground font-semibold">Prêmios possíveis:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• R$10 OFF</li>
              <li>• R$20 OFF</li>
              <li>• R$50 OFF</li>
              <li>• R$100 OFF</li>
              <li>• R$200 OFF</li>
              <li>• MAX WIN: R$500 OFF (desconto máximo)</li>
            </ul>
            <Button
              onClick={handleSpin}
              size="lg"
              disabled={userSpins <= 0 || hasSpun}
              className="w-full lg:w-auto text-base sm:text-xl py-5 sm:py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
            >
              {isSpinning ? "Girando..." : "Acionar slots agora"}
            </Button>

            {result && (
              <Card className="p-4 border border-primary/40 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Resultado</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-primary">MAX WIN desbloqueado!</h3>
                <p className="text-sm sm:text-base text-foreground font-semibold">
                  Você ganhou R$500,00 de desconto para ativar a LOTER.IA agora.
                </p>
                <p className="text-sm text-muted-foreground">
                  Aproveite enquanto o painel ainda está aberto. Vamos abrir a comemoração automaticamente.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
