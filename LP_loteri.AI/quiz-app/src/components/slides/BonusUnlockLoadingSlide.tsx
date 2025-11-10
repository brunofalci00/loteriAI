import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusUnlockLoadingSlideProps {
  onNext: () => void;
}

const steps = [
  { icon: "📝", text: "Conferindo suas respostas" },
  { icon: "🪙", text: "Usando as moedas para abrir o mapa" },
  { icon: "🔐", text: "Liberando a visualização segura" },
];

const visualBadges = [
  { icon: "📶", label: "Painel estável" },
  { icon: "🛡️", label: "Dados protegidos" },
  { icon: "⚡", label: "Liberado em segundos" },
];

export const BonusUnlockLoadingSlide = ({ onNext }: BonusUnlockLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/processing-loop.mp3", { loop: true, volume: 0.05 });

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = setTimeout(onNext, 5200);
    return () => clearTimeout(timer);
  }, [ambientRef, onNext]);

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
            <img src="/placeholder.svg" alt="Cofre digital segurando suas moedas" loading="lazy" />
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

          <div className="text-xs text-muted-foreground text-center">É um respiro rápido para salvar seus dados no servidor.</div>
        </Card>
      </div>
    </div>
  );
};
