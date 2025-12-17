import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface AccessChanceSlideProps {
  onNext: () => void;
}

type UnlockStage = "scratch" | "processing" | "unlocked";

const SCRATCH_GRID_SIZE = 34;
const SCRATCH_COMPLETE_THRESHOLD = 0.42;
const SCRATCH_RADIUS_PX = 22;

const ScratchCard = ({ onStart, onComplete }: { onStart: () => void; onComplete: () => void }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPointerDownRef = useRef(false);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const gridRef = useRef<boolean[]>(Array.from({ length: SCRATCH_GRID_SIZE * SCRATCH_GRID_SIZE }, () => false));
  const scratchedCountRef = useRef(0);
  const totalCells = useMemo(() => SCRATCH_GRID_SIZE * SCRATCH_GRID_SIZE, []);

  const setupCanvas = () => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const rect = wrapper.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#d1a22a");
    gradient.addColorStop(0.5, "#f3d37a");
    gradient.addColorStop(1, "#b37b14");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 0; i < 140; i += 1) {
      const x = (i * 97) % canvas.width;
      const y = (i * 131) % canvas.height;
      ctx.fillRect(x, y, 10 * dpr, 2 * dpr);
    }

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = `${18 * dpr}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RASPE AQUI", canvas.width / 2, canvas.height / 2 - 10 * dpr);
    ctx.font = `${12 * dpr}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.fillText("70% NÃO LIBERA", canvas.width / 2, canvas.height / 2 + 18 * dpr);
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, []);

  const markGridAndCheck = (x: number, y: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const cellW = rect.width / SCRATCH_GRID_SIZE;
    const cellH = rect.height / SCRATCH_GRID_SIZE;
    const cx = Math.max(0, Math.min(SCRATCH_GRID_SIZE - 1, Math.floor(x / cellW)));
    const cy = Math.max(0, Math.min(SCRATCH_GRID_SIZE - 1, Math.floor(y / cellH)));

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= SCRATCH_GRID_SIZE || ny >= SCRATCH_GRID_SIZE) continue;
        const idx = ny * SCRATCH_GRID_SIZE + nx;
        if (!gridRef.current[idx]) {
          gridRef.current[idx] = true;
          scratchedCountRef.current += 1;
        }
      }
    }

    const progress = scratchedCountRef.current / totalCells;
    if (!completedRef.current && progress >= SCRATCH_COMPLETE_THRESHOLD) {
      completedRef.current = true;
      onComplete();
    }
  };

  const scratchAt = (clientX: number, clientY: number) => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const rect = wrapper.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (!startedRef.current) {
      startedRef.current = true;
      onStart();
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = canvas.width / Math.max(1, Math.floor(rect.width));

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x * dpr, y * dpr, SCRATCH_RADIUS_PX * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    markGridAndCheck(x, y);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-secondary/40"
      style={{ touchAction: "none", height: 180 }}
    >
      <div className="absolute inset-0 grid place-items-center p-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Resultado</p>
          <p className="text-3xl sm:text-4xl font-black text-foreground">NÃO LIBERADO</p>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
};

export const AccessChanceSlide = ({ onNext }: AccessChanceSlideProps) => {
  const [stage, setStage] = useState<UnlockStage>("scratch");
  const startedRef = useRef(false);
  const unlockedRef = useRef(false);

  const playSound = (file: string, volume: number) => {
    const sound = new Audio(file);
    sound.volume = volume;
    sound.play().catch(() => undefined);
  };

  const handleScratchStart = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackPixelEvent("SlotSpinStart");
    playSound("/sounds/tap-confirm.mp3", 0.22);
  };

  const handleScratchComplete = () => {
    if (stage !== "scratch") return;
    setStage("processing");

    window.setTimeout(() => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      setStage("unlocked");
      trackPixelEvent("SlotMaxWin");
      playSound("/sounds/jackpot-fanfare.mp3", 0.28);
    }, 1400);
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
          <h1 className="heading-1">{stage === "unlocked" ? "Acesso liberado" : "Você perdeu para o Sistema LOTER.IA"}</h1>
          <p className="body-lead">
            {stage === "unlocked"
              ? "Seu acesso ao Sistema LOTER.IA foi liberado. Continue."
              : "Mas, por mérito, você ganhou 1 chance de tentar liberar o acesso."}
          </p>
        </div>

        <Card className="p-6 border border-primary/30 glow-primary space-y-4">
          {stage === "scratch" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Raspe o cartão para tentar liberar o acesso.</p>
              <ScratchCard onStart={handleScratchStart} onComplete={handleScratchComplete} />
              <p className="text-xs text-muted-foreground">O sistema não libera automaticamente. Seu perfil pode destravar por mérito.</p>
            </div>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center gap-3 py-6">
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

