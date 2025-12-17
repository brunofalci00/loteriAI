import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface AccessChanceSlideProps {
  onNext: () => void;
}

type WheelResult = "NAO_LIBERA" | "EM_ANALISE" | "LIBERADO";
type Stage = "ready" | "spinning" | "processing" | "unlocked";

const WHEEL_SEGMENTS: WheelResult[] = [
  "NAO_LIBERA",
  "NAO_LIBERA",
  "NAO_LIBERA",
  "NAO_LIBERA",
  "NAO_LIBERA",
  "NAO_LIBERA",
  "NAO_LIBERA",
  "EM_ANALISE",
  "EM_ANALISE",
  "LIBERADO",
];

const WHEEL_LABEL: Record<WheelResult, string> = {
  NAO_LIBERA: "NÃO LIBERA",
  EM_ANALISE: "EM ANÁLISE",
  LIBERADO: "LIBERADO",
};

const WHEEL_COLOR: Record<WheelResult, string> = {
  NAO_LIBERA: "#1f2937",
  EM_ANALISE: "#6b7280",
  LIBERADO: "#fbbf24",
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const pickWeightedResult = () => {
  const roll = Math.random();
  if (roll < 0.7) return "NAO_LIBERA" as const;
  if (roll < 0.9) return "EM_ANALISE" as const;
  return "LIBERADO" as const;
};

const buildConicGradient = () => {
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const stops: string[] = [];
  for (let index = 0; index < WHEEL_SEGMENTS.length; index += 1) {
    const start = index * segmentAngle;
    const end = (index + 1) * segmentAngle;
    const color = WHEEL_COLOR[WHEEL_SEGMENTS[index]];
    stops.push(`${color} ${start}deg ${end}deg`);
  }
  return `conic-gradient(from -90deg, ${stops.join(", ")})`;
};

export const AccessChanceSlide = ({ onNext }: AccessChanceSlideProps) => {
  const [stage, setStage] = useState<Stage>("ready");
  const [rotationDeg, setRotationDeg] = useState(0);
  const [result, setResult] = useState<WheelResult | null>(null);
  const [spinDurationMs, setSpinDurationMs] = useState(3200);
  const dragStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const timersRef = useRef<number[]>([]);
  const gradient = useMemo(() => buildConicGradient(), []);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(
    () => () => {
      clearTimers();
    },
    [],
  );

  const playSound = (file: string, volume: number) => {
    const sound = new Audio(file);
    sound.volume = volume;
    sound.play().catch(() => undefined);
  };

  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const spinToSegmentIndex = (segmentIndex: number, strength: number) => {
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const minSpins = 5;
    const extraSpins = Math.floor(clamp(strength, 0, 1) * 3);
    const spins = minSpins + extraSpins;

    const jitter = (Math.random() - 0.5) * segmentAngle * 0.6;
    const targetAngleAtPointer = segmentIndex * segmentAngle + segmentAngle / 2 + jitter;
    const desiredMod = (360 - targetAngleAtPointer) % 360;

    const nextRotation = rotationDeg + spins * 360 + desiredMod;
    setRotationDeg(nextRotation);
  };

  const beginSpin = (strength: number) => {
    if (stage !== "ready") return;
    clearTimers();

    setStage("spinning");
    setResult(null);
    trackPixelEvent("SlotSpinStart");
    playSound("/sounds/roulette-spin.mp3", 0.25);

    const outcome = pickWeightedResult();
    setResult(outcome);

    const candidateIndexes = WHEEL_SEGMENTS.map((seg, idx) => (seg === outcome ? idx : -1)).filter((idx) => idx >= 0);
    const segmentIndex = candidateIndexes[Math.floor(Math.random() * candidateIndexes.length)];

    const duration = Math.round(2600 + clamp(strength, 0, 1) * 1400);
    setSpinDurationMs(duration);
    spinToSegmentIndex(segmentIndex, strength);

    schedule(() => playSound("/sounds/roulette-stop.mp3", 0.22), Math.max(250, duration - 500));
    schedule(() => {
      setStage("processing");
      playSound("/sounds/timer-tick.mp3", 0.06);
    }, duration + 50);

    schedule(() => {
      setStage("unlocked");
      trackPixelEvent("SlotMaxWin");
      playSound("/sounds/jackpot-fanfare.mp3", 0.28);
      playSound("/sounds/coin-rain.mp3", 0.16);
    }, duration + 1300);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== "ready") return;
    dragStartRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== "ready") return;
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) {
      beginSpin(0.5);
      return;
    }

    const dt = Math.max(1, performance.now() - start.t);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = distance / dt;
    const strength = clamp((distance / 260) * 0.7 + velocity * 0.9, 0.25, 1);
    beginSpin(strength);
  };

  const handleContinue = () => {
    trackPixelEvent("MaxWinCTA");
    onNext();
  };

  const showResultLabel = stage !== "ready" && result;

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 text-center relative z-10">
        <div className="space-y-2">
          <p className="meta-label text-primary">Etapa 2</p>
          <h1 className="heading-1">{stage === "unlocked" ? "Acesso liberado" : "Tentar liberar o acesso"}</h1>
          <p className="body-lead">
            {stage === "unlocked"
              ? "Seu acesso ao Sistema LOTER.IA foi liberado. Continue."
              : "O sistema não libera automaticamente, mas seu perfil pode destravar por mérito."}
          </p>
        </div>

        <Card className="p-6 border border-primary/30 glow-primary space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Arraste e solte para girar</p>
            <p className="text-xs text-muted-foreground">70% não libera • 20% em análise • 10% libera</p>
          </div>

          <div className="relative mx-auto w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] select-none">
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
              style={{
                width: 0,
                height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderBottom: "18px solid rgba(255,215,0,0.9)",
                filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))",
              }}
            />

            <div
              role="button"
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute inset-0 rounded-full border border-primary/30 shadow-[0_0_40px_rgba(255,215,0,0.15)] ${
                stage === "ready" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              }`}
              style={{
                backgroundImage: gradient,
                transform: `rotate(${rotationDeg}deg)`,
                transition: stage === "spinning" ? `transform ${spinDurationMs}ms cubic-bezier(0.12, 0.78, 0.18, 0.99)` : undefined,
              }}
            >
              <div className="absolute inset-3 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-20 h-20 rounded-full bg-background/90 border border-border shadow-inner grid place-items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>

          {showResultLabel && (
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Resultado</p>
              <p className="text-2xl font-black text-foreground">{result ? WHEEL_LABEL[result] : ""}</p>
            </div>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Validando mérito...</p>
            </div>
          )}

          {stage === "unlocked" && (
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full text-base sm:text-xl py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow"
            >
              Continuar
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

