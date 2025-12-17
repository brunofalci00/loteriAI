import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusUnlockLoadingSlideProps {
  onNext: () => void;
}

export const BonusUnlockLoadingSlide = ({ onNext }: BonusUnlockLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/processing-loop.mp3", { loop: true, volume: 0.05 });

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = window.setTimeout(onNext, 2200);
    return () => window.clearTimeout(timer);
  }, [ambientRef, onNext]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <p className="meta-label text-primary flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analisando suas respostas
        </p>
        <Card className="loading-panel space-y-4">
          <div className="space-y-1 text-center">
            <h2 className="heading-2 text-foreground">Liberado</h2>
            <p className="text-sm text-muted-foreground">Mapa dos Números Quentes.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
