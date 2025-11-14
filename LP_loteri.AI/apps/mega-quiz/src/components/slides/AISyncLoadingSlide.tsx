import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { megaQuizConfig, currencyFormatter } from "@/config/mega";

interface AISyncLoadingSlideProps {
  onNext: () => void;
}

const { manualMaxNumbers, slotMaxDiscount } = megaQuizConfig;

export const AISyncLoadingSlide = ({ onNext }: AISyncLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/suspense-whoosh.mp3", { loop: true, volume: 0.09 });
  const syncTimeline = [
    { icon: "1️⃣", label: "Seu jogo", description: `${manualMaxNumbers} dezenas conferidas` },
    { icon: "2️⃣", label: "IA ativa", description: "Mesmas dezenas rodando na máquina" },
    { icon: "3️⃣", label: "Giro pronto", description: "Painel liberado pra você" },
  ];

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
          IA auditando seu jogo
        </p>
        <Card className="loading-panel space-y-5">
          <div className="space-y-2 text-center">
            <h2 className="heading-2">Comparando sua intuição com a IA anti-choque</h2>
            <p className="text-sm text-muted-foreground">
              Segure alguns segundos para o painel não travar enquanto sincronizamos os dados.
            </p>
          </div>

          <div className="bg-secondary/60 rounded-xl p-4 space-y-2 text-sm text-foreground">
            <p className="font-semibold text-primary">O que acontece agora</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Conferimos suas {manualMaxNumbers} dezenas contra 20 anos da Mega.</li>
              <li>Rodamos a mesma aposta com a IA anti-choque.</li>
              <li>Carregamos o giro bônus com {currencyFormatter.format(slotMaxDiscount)} em potencial.</li>
            </ul>
          </div>

          <div className="timeline-strip">
            {syncTimeline.map((item) => (
              <div key={item.label} className="timeline-badge">
                <span className="timeline-badge__icon" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <p className="timeline-badge__label">{item.label}</p>
                <p className="timeline-badge__description">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Tudo automático: o comparativo aparece sozinho quando terminar.
          </div>
        </Card>
      </div>
    </div>
  );
};
