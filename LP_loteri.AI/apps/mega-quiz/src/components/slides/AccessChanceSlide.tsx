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

type Segment = {
  result: WheelResult;
  weight: number;
  fill: string;
  textColor: string;
  lines: string[];
};

const SEGMENTS: Segment[] = [
  { result: "NAO_LIBERA", weight: 7, fill: "#111827", textColor: "#f8fafc", lines: ["NÃO", "LIBERA"] },
  { result: "EM_ANALISE", weight: 2, fill: "#4b5563", textColor: "#f8fafc", lines: ["EM", "ANÁLISE"] },
  { result: "LIBERADO", weight: 1, fill: "#fbbf24", textColor: "#111827", lines: ["LIBERADO"] },
];

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
  const [spinDurationMs, setSpinDurationMs] = useState(4200);
  const dragStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const timersRef = useRef<number[]>([]);

  const segmentsWithAngles = useMemo(() => {
    const total = SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
    let startFromTop = 0;
    return SEGMENTS.map((seg) => {
      const angle = (seg.weight / total) * 360;
      const midFromTop = startFromTop + angle / 2;
      const next = {
        ...seg,
        startFromTop,
        angle,
        midFromTop,
      };
      startFromTop += angle;
      return next;
    });
  }, []);

  const liberatedSegment = useMemo(() => segmentsWithAngles.find((seg) => seg.result === "LIBERADO")!, [segmentsWithAngles]);

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

  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const playSound = (file: string, volume: number) => {
    const sound = new Audio(file);
    sound.volume = volume;
    sound.play().catch(() => undefined);
  };

  const beginSpin = (strength: number) => {
    if (stage !== "ready") return;
    clearTimers();
    setStage("spinning");
    trackPixelEvent("SlotSpinStart");
    playSound("/sounds/roulette-spin.mp3", 0.25);

    const minSpins = 7;
    const extraSpins = Math.floor(clamp(strength, 0, 1) * 3);
    const spins = minSpins + extraSpins;

    const jitter = (Math.random() - 0.5) * liberatedSegment.angle * 0.55;
    const targetFromTop = liberatedSegment.midFromTop + jitter;
    const desiredMod = (360 - (targetFromTop % 360)) % 360;

    const duration = Math.round(3600 + clamp(strength, 0, 1) * 2200);
    setSpinDurationMs(duration);

    setRotationDeg((prev) => prev + spins * 360 + desiredMod);

    schedule(() => playSound("/sounds/roulette-stop.mp3", 0.22), Math.max(250, duration - 520));
    schedule(() => setStage("processing"), duration + 120);
    schedule(() => {
      setStage("unlocked");
      trackPixelEvent("SlotMaxWin");
      playSound("/sounds/jackpot-fanfare.mp3", 0.28);
      playSound("/sounds/coin-rain.mp3", 0.14);
    }, duration + 950);
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
      beginSpin(0.75);
      return;
    }

    const dt = Math.max(1, performance.now() - start.t);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = distance / dt;
    const strength = clamp((distance / 300) * 0.75 + velocity * 1.05, 0.25, 1);
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
          <p className="body-lead">{stage === "unlocked" ? "Continue para finalizar." : "Arraste e solte para girar."}</p>
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
              className={`absolute inset-0 rounded-full ${stage === "ready" ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
              style={{
                border: "2px solid rgba(255,215,0,0.25)",
                boxShadow: "0 0 0 12px rgba(0,0,0,0.25), 0 0 70px rgba(255,215,0,0.16)",
              }}
            >
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotationDeg}deg)`,
                  transformOrigin: "50% 50%",
                  transition:
                    stage === "spinning" ? `transform ${spinDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1)` : undefined,
                  filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.45))",
                }}
              >
                <defs>
                  <radialGradient id="wheelGloss" cx="30%" cy="25%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                    <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                  <radialGradient id="wheelVignette" cx="50%" cy="55%">
                    <stop offset="62%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                  </radialGradient>
                </defs>

                <g>
                  {segmentsWithAngles.map((seg) => {
                    const startAbs = -90 + seg.startFromTop;
                    const endAbs = startAbs + seg.angle;
                    return (
                      <path
                        key={seg.result}
                        d={segmentPath(100, 100, 96, startAbs, endAbs)}
                        fill={seg.fill}
                        stroke="rgba(255,255,255,0.10)"
                        strokeWidth={0.6}
                      />
                    );
                  })}
                </g>

                <circle cx="100" cy="100" r="96" fill="url(#wheelGloss)" />
                <circle cx="100" cy="100" r="96" fill="url(#wheelVignette)" />

                <g>
                  {segmentsWithAngles.map((seg) => {
                    const midAbs = -90 + seg.midFromTop;
                    const pos = polarToCartesian(100, 100, 64, midAbs);
                    const rotate = midAbs + 90;
                    const lineHeight = 10.5;
                    const totalHeight = (seg.lines.length - 1) * lineHeight;
                    return (
                      <text
                        key={`label-${seg.result}`}
                        x={pos.x}
                        y={pos.y}
                        fill={seg.textColor}
                        fontSize="10"
                        fontWeight={900}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${rotate} ${pos.x} ${pos.y})`}
                        style={{ letterSpacing: "0.14em" }}
                      >
                        {seg.lines.map((line, index) => (
                          <tspan key={line} x={pos.x} dy={index === 0 ? -totalHeight / 2 : lineHeight}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    );
                  })}
                </g>

                <circle cx="100" cy="100" r="46" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <circle cx="100" cy="100" r="38" fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.20)" strokeWidth="1" />
              </svg>

              <button
                type="button"
                onClick={() => beginSpin(0.82)}
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

