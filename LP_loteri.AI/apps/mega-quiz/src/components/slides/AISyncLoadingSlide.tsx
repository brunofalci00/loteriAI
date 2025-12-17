import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface AISyncLoadingSlideProps {
  onNext: () => void;
}

export const AISyncLoadingSlide = ({ onNext }: AISyncLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/suspense-whoosh.mp3", { loop: true, volume: 0.09 });

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = window.setTimeout(onNext, 2600);
    return () => window.clearTimeout(timer);
  }, [ambientRef, onNext]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <p className="meta-label flex items-center justify-center gap-2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          IA auditando seu jogo
        </p>
        <Card className="loading-panel space-y-3">
          <div className="space-y-1 text-center">
            <h2 className="heading-2">Etapa 2</h2>
            <p className="text-sm text-muted-foreground">Validando o Sistema LOTER.IA.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
