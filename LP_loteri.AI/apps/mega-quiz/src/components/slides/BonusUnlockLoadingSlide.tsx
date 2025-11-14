import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusUnlockLoadingSlideProps {
  onNext: () => void;
}

const steps = [
  { icon: "🧊", text: "Reservando sua vaga entre os testadores" },
  { icon: "📡", text: "Sincronizando 20 anos da Mega da Virada" },
  { icon: "🔐", text: "Preparando rodada manual + IA" },
  { icon: "⚡", text: "Liberando o painel seguro" },
];

const visualBadges = [
  { icon: "🛡️", label: "Painel blindado" },
  { icon: "📊", label: "Dados auditados" },
  { icon: "⏱️", label: "Pronto em segundos" },
];

export const BonusUnlockLoadingSlide = ({ onNext }: BonusUnlockLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/processing-loop.mp3", { loop: true, volume: 0.05 });

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = window.setTimeout(onNext, 5200);
    return () => window.clearTimeout(timer);
  }, [ambientRef, onNext]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <p className="meta-label text-primary flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          IA preparando o bônus 1
        </p>
        <Card className="loading-panel space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="heading-2 text-foreground">Estamos ativando seu teste da IA da Mega da Virada</h2>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.text} className="loading-row border-b border-border/40 last:border-b-0">
                <span className="text-xs text-primary font-semibold">{index + 1}</span>
                <p className="text-sm text-foreground">
                  <span className="mr-2" role="img" aria-hidden="true">
                    {step.icon}
                  </span>
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="loading-visual">
            <img
              src="https://i.ibb.co/JWTvC1bs/Chat-GPT-Image-13-de-nov-de-2025-18-20-05.png"
              alt="Pré-visualização do painel Mega da Virada"
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

          <div className="text-xs text-muted-foreground text-center">Pausa rápida para salvar seus dados sem travar o painel.</div>
        </Card>
      </div>
    </div>
  );
};
