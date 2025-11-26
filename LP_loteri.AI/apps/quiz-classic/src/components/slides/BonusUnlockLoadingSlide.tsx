import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusUnlockLoadingSlideProps {
  onNext: () => void;
  onComplete?: () => void;
}

const steps = [
  { icon: "💡", text: "Conferindo suas respostas" },
  { icon: "🪙", text: "Usando as moedas para abrir o mapa" },
  { icon: "🔐", text: "Liberando a visualização segura" },
];

const visualBadges = [
  { icon: "🛰️", label: "Painel estável" },
  { icon: "🛡️", label: "Dados protegidos" },
  { icon: "⚡", label: "Liberado em segundos" },
];

export const BonusUnlockLoadingSlide = ({ onNext, onComplete }: BonusUnlockLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/game-loading-sound-effect-380367.mp3", { loop: true, volume: 0.35 });
  const [, forceRender] = useState(0);
  const progressRef = useRef<number[]>(Array(steps.length).fill(0));

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = setTimeout(() => {
      onComplete?.(); // Trigger callback before advancing
      onNext();
    }, 5600);
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
        if (index === activeStep) return pct;
        return value;
      });
      forceRender((v) => v + 1);
      if (pct >= 100) {
        activeStep += 1;
        elapsed = 0;
        if (activeStep >= steps.length) {
          clearInterval(interval);
        }
      }
    }, tick);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <p className="meta-label text-primary flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          IA preparando o Bônus 1
        </p>
        <Card className="loading-panel space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="heading-2 text-foreground">Estamos trocando suas moedas pelo mapa</h2>
            <p className="body-lead">Essa tela existe só para garantir que todo mundo veja o mesmo relatório sem travar o celular.</p>
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
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
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
              alt="Imagem explicativa do funcionamento do jogo Lotofacil"
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

          <div className="text-xs text-muted-foreground text-center">Só um respiro rápido para salvar seus dados no servidor.</div>
        </Card>
      </div>
    </div>
  );
};
