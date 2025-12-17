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

const WHEEL_SEGMENTS: WheelResult[] = [];
for (let i = 0; i < 7; i += 1) WHEEL_SEGMENTS.push("NAO_LIBERA");
for (let i = 0; i < 2; i += 1) WHEEL_SEGMENTS.push("EM_ANALISE");
WHEEL_SEGMENTS.push("LIBERADO");

const WHEEL_LABEL: Record<WheelResult, string> = {
  NAO_LIBERA: "NÃO LIBERA",
  EM_ANALISE: "EM ANÁLISE",
  LIBERADO: "LIBERADO",
};

const WHEEL_COLOR: Record<WheelResult, string> = {
  NAO_LIBERA: "#111827",
  EM_ANALISE: "#4b5563",
  LIBERADO: "#fbbf24",
};

const WHEEL_TEXT: Record<WheelResult, string> = {
  NAO_LIBERA: "#f8fafc",
  EM_ANALISE: "#f8fafc",
  LIBERADO: "#111827",
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = (Math.PI / 180) * angleDeg;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
};

const segmentPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
};

export const AccessChanceSlide = ({ onNext }: AccessChanceSlideProps) => {
  const [stage, setStage] = useState<Stage>("ready");
  const [rotationDeg, setRotationDeg] = useState(0);
  const [spinDurationMs, setSpinDurationMs] = useState(3200);
  const dragStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const timersRef = useRef<number[]>([]);

  const segmentAngle = useMemo(() => 360 / WHEEL_SEGMENTS.length, []);
  const liberatedIndex = useMemo(() => WHEEL_SEGMENTS.findIndex((value) => value === "LIBERADO"), []);

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
    const minSpins = 6;
    const extraSpins = Math.floor(clamp(strength, 0, 1) * 3);
    const spins = minSpins + extraSpins;
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.42;
    const targetAngleAtPointer = segmentIndex * segmentAngle + segmentAngle / 2 + jitter;
    const desiredMod = (360 - targetAngleAtPointer) % 360;
    setRotationDeg((prev) => prev + spins * 360 + desiredMod);
  };

  const beginSpin = (strength: number) => {
    if (stage !== "ready") return;
    clearTimers();

    setStage("spinning");
    trackPixelEvent("SlotSpinStart");
    playSound("/sounds/roulette-spin.mp3", 0.25);

    const duration = Math.round(2600 + clamp(strength, 0, 1) * 1500);
    setSpinDurationMs(duration);
    spinToSegmentIndex(liberatedIndex, strength);

    schedule(() => playSound("/sounds/roulette-stop.mp3", 0.22), Math.max(250, duration - 430));
    schedule(() => setStage("processing"), duration + 80);
    schedule(() => {
      setStage("unlocked");
      trackPixelEvent("SlotMaxWin");
      playSound("/sounds/jackpot-fanfare.mp3", 0.28);
      playSound("/sounds/coin-rain.mp3", 0.14);
    }, duration + 780);
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
      beginSpin(0.65);
      return;
    }

    const dt = Math.max(1, performance.now() - start.t);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = distance / dt;
    const strength = clamp((distance / 280) * 0.75 + velocity * 0.95, 0.25, 1);
    beginSpin(strength);
  };

  const handleContinue = () => {
    trackPixelEvent("MaxWinCTA");
    onNext();
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 text-center relative z-10">
        <div className="space-y-2">
          <p className="meta-label text-primary">Etapa 2</p>
          <h1 className="heading-1">{stage === "unlocked" ? "Acesso liberado" : "Roleta do Sistema"}</h1>
          <p className="body-lead">
            {stage === "unlocked"
              ? "Seu acesso ao Sistema LOTER.IA foi liberado. Continue."
              : "Arraste e solte para girar. O sistema decide."}
          </p>
        </div>

        <Card className="p-6 border border-primary/30 glow-primary space-y-5">
          <div className="relative mx-auto w-[290px] h-[290px] sm:w-[340px] sm:h-[340px] select-none">
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
              style={{
                width: 0,
                height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderBottom: "18px solid rgba(255,215,0,0.95)",
                filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.45))",
              }}
            />

            <div
              role="button"
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute inset-0 rounded-full ${
                stage === "ready" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              }`}
              style={{
                border: "2px solid rgba(255,215,0,0.25)",
                boxShadow: "0 0 0 12px rgba(0,0,0,0.25), 0 0 60px rgba(255,215,0,0.18)",
              }}
            >
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotationDeg}deg)`,
                  transformOrigin: "50% 50%",
                  transition: stage === "spinning" ? `transform ${spinDurationMs}ms cubic-bezier(0.12, 0.78, 0.18, 0.99)` : undefined,
                  filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.45))",
                }}
              >
                <defs>
                  <radialGradient id="wheelGloss" cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                    <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                  <radialGradient id="wheelVignette" cx="50%" cy="55%">
                    <stop offset="60%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                  </radialGradient>
                </defs>

                <g>
                  {WHEEL_SEGMENTS.map((segment, index) => {
                    const start = -90 + index * segmentAngle;
                    const end = start + segmentAngle;
                    return (
                      <path
                        key={`${segment}-${index}`}
                        d={segmentPath(100, 100, 96, start, end)}
                        fill={WHEEL_COLOR[segment]}
                        stroke="rgba(255,255,255,0.10)"
                        strokeWidth={0.6}
                      />
                    );
                  })}
                </g>

                <circle cx="100" cy="100" r="96" fill="url(#wheelGloss)" />
                <circle cx="100" cy="100" r="96" fill="url(#wheelVignette)" />

                <g>
                  {WHEEL_SEGMENTS.map((segment, index) => {
                    const mid = -90 + index * segmentAngle + segmentAngle / 2;
                    const pos = polarToCartesian(100, 100, 62, mid);
                    const rotate = mid + 90;
                    return (
                      <text
                        key={`label-${index}`}
                        x={pos.x}
                        y={pos.y}
                        fill={WHEEL_TEXT[segment]}
                        fontSize="10"
                        fontWeight={900}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${rotate} ${pos.x} ${pos.y})`}
                        style={{ letterSpacing: "0.14em" }}
                      >
                        {WHEEL_LABEL[segment]}
                      </text>
                    );
                  })}
                </g>

                <circle cx="100" cy="100" r="46" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <circle cx="100" cy="100" r="38" fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.20)" strokeWidth="1" />
              </svg>

              <button
                type="button"
                onClick={() => beginSpin(0.75)}
                disabled={stage !== "ready"}
                className="absolute inset-0 grid place-items-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gold/80 to-amber-500 border border-gold shadow-[0_12px_30px_rgba(0,0,0,0.35)] grid place-items-center">
                  <div className="w-[86px] h-[86px] rounded-full bg-background/90 border border-black/20 grid place-items-center">
                    <p className="text-xs font-extrabold tracking-[0.35em] text-primary">GIRAR</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {stage === "spinning" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Girando...</p>
            </div>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Confirmando...</p>
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

