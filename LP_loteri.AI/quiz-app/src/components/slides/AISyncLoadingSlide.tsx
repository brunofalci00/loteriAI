import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface AISyncLoadingSlideProps {
  onNext: () => void;
  userScore: number;
}

export const AISyncLoadingSlide = ({ onNext, userScore }: AISyncLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/suspense-whoosh.mp3", { loop: true, volume: 0.09 });

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = setTimeout(onNext, 4800);
    return () => clearTimeout(timer);
  }, [ambientRef, onNext]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <p className="meta-label flex items-center justify-center gap-2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          Modo duelo: você x IA
        </p>
        <Card className="loading-panel space-y-5">
          <div className="space-y-2 text-center">
            <h2 className="heading-2">Comparando seus {userScore} pontos com a jogada da máquina</h2>
            <p className="text-sm text-muted-foreground">
              A IA precisa auditar 2.500 sorteios antes de liberar o placar oficial. Esse tempo extra aumenta a precisão.
            </p>
          </div>

          <div className="bg-secondary/60 rounded-xl p-4 space-y-2 text-sm text-foreground">
            <p className="font-semibold text-primary">⚙️ Processos em andamento</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Sincronizando sua aposta com o painel em tempo real</li>
              <li>Testando cenários em paralelo com machine learning</li>
              <li>Carregando a roleta de bônus liberada pelo giro da IA</li>
            </ul>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Essa tela existe para sincronizar seu histórico em tempo real antes de liberar o duelo com a IA.
          </div>
        </Card>
      </div>
    </div>
  );
};
