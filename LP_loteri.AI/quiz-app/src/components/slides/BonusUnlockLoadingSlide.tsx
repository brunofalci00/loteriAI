import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusUnlockLoadingSlideProps {
  onNext: () => void;
}

const steps = [
  "IA conferindo suas respostas",
  "Transferindo fichas para o cofre seguro",
  "Liberando visualização do mapa quente",
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
            <h2 className="heading-2 text-foreground">Segura firme: o mapa secreto está sendo desbloqueado</h2>
            <p className="body-lead">
              O sistema precisa validar cada uma das suas respostas antes de liberar a visualização completa. Isso impede vazamentos.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="loading-row border-b border-border/40 last:border-b-0">
                <span className="text-xs text-primary font-semibold">{index + 1}</span>
                <p className="text-sm text-foreground">{step}</p>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Mantemos essa pausa para validar tudo no servidor e garantir que o painel não trave no seu celular.
          </div>
        </Card>
      </div>
    </div>
  );
};
