import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusUnlockLoadingSlideProps {
  onNext: () => void;
  onComplete?: () => void;
}

const steps = [
  { icon: "🔍", text: "Conferindo suas respostas" },
  { icon: "💰", text: "Convertendo moedas em mapa" },
  { icon: "🛡️", text: "Liberando visualização protegida" },
];

const visualBadges = [
  { icon: "🟢", label: "Painel estável" },
  { icon: "🛡️", label: "Dados protegidos" },
  { icon: "⚡", label: "Liberação em segundos" },
];

export const BonusUnlockLoadingSlide = ({ onNext, onComplete }: BonusUnlockLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/game-loading-sound-effect-380367.mp3", { loop: true, volume: 0.35 });
  const [, forceRender] = useState(0);
  const progressRef = useRef<number[]>(Array(steps.length).fill(0));
  const stuckRef = useRef(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [finalUnlock, setFinalUnlock] = useState(false);

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = setTimeout(() => {
      onComplete?.();
      onNext();
    }, 6200);
    return () => clearTimeout(timer);
  }, [ambientRef, onNext, onComplete]);

  useEffect(() => {
    const stepDuration = 1500;
    const tick = 120;
    let activeStep = 0;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += tick;
      const pct = Math.min(100, Math.round((elapsed / stepDuration) * 100));
      progressRef.current = progressRef.current.map((value, index) => {
        if (index < activeStep) return 100;
        if (index === activeStep) {
          const currentPct = stuckRef.current ? Math.min(pct, 97) : pct;
          return currentPct;
        }
        return value;
      });
      forceRender((v) => v + 1);
      if (pct >= 100 && !stuckRef.current) {
        activeStep += 1;
        elapsed = 0;
        if (activeStep >= steps.length) {
          clearInterval(interval);
        }
      }
    }, tick);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let recoverTimer: ReturnType<typeof setTimeout> | undefined;
    const glitchTimer = setTimeout(() => {
      stuckRef.current = true;
      setAlertMessage("⚠️ Bloqueio temporário...");
      progressRef.current = progressRef.current.map((value, index) => {
        if (index < steps.length - 1) return 100;
        return value > 97 ? value : 97;
      });
      forceRender((v) => v + 1);
      retryTimer = setTimeout(() => setAlertMessage("Reabrindo acesso..."), 650);
      recoverTimer = setTimeout(() => {
        stuckRef.current = false;
        setAlertMessage("Acesso quase expirou...");
        forceRender((v) => v + 1);
      }, 1400);
    }, 2300);

    const finalTimer = setTimeout(() => {
      setFinalUnlock(true);
      setAlertMessage("✅ Acesso liberado. Menos de 8% chegam aqui.");
    }, 5200);

    return () => {
      clearTimeout(glitchTimer);
      clearTimeout(finalTimer);
      if (retryTimer) clearTimeout(retryTimer);
      if (recoverTimer) clearTimeout(recoverTimer);
    };
  }, []);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <p className="meta-label text-primary flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          IA preparando o Mapa
        </p>
        <Card className="loading-panel space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="heading-2 text-foreground">Trocando suas moedas pelo Mapa dos Números Quentes</h2>
            <p className="text-sm text-muted-foreground">Processo seguro. Você está a poucos segundos de ver o mapa.</p>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.text} className="loading-row border-b border-border/40 last:border-b-0">
                <span className="text-xs text-primary font-semibold">{index + 1}</span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <span className="mr-1" role="img" aria-hidden="true">
                      {step.icon}
                    </span>
                    {step.text}
                  </p>
                  <div className={`h-2 rounded-full bg-muted/50 overflow-hidden ${stuckRef.current && index === steps.length - 1 ? "bar-flicker" : ""}`}>
                    <div
                      className={`h-full rounded-full ${index === steps.length - 1 ? "bg-primary" : "bg-primary/80"}`}
                      style={{ width: `${progressRef.current[index]}%`, transition: "width 0.2s ease" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="loading-visual">
            <img
              src="https://i.ibb.co/wrYL4fMd/como-funciona-o-jogo-lotofacil.webp"
              alt="Imagem explicativa do funcionamento do jogo Lotofácil"
              loading="lazy"
            />
            <div className="loading-visual__badges">
              {visualBadges.map((badge) => (
                <span key={badge.label} className="loading-visual__badge">
                  <span role="img" aria-hidden="true">
                    {badge.icon}
                  </span>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {alertMessage && <div className="text-sm text-center text-primary animate-fade-in">{alertMessage}</div>}
          {finalUnlock && (
            <div className="text-center text-sm text-foreground font-semibold bg-primary/10 border border-primary/30 rounded-lg p-3">
              ✅ Mapa aberto. Use agora antes do painel fechar.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
