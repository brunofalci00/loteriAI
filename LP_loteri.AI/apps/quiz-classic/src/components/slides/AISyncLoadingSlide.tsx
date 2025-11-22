import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface AISyncLoadingSlideProps {
  onNext: () => void;
  userScore: number;
}

export const AISyncLoadingSlide = ({ onNext, userScore }: AISyncLoadingSlideProps) => {
  const ambientRef = useSoundEffect("/sounds/suspense-whoosh.mp3", { loop: true, volume: 0.09 });
  const [, forceRender] = useState(0);
  const progressRef = useRef<number[]>([0, 0, 0]);
  const syncTimeline = [
    { icon: "1️⃣", label: "Seu jogo", description: `${userScore} pontos conferidos` },
    { icon: "2️⃣", label: "IA ativa", description: "Mesmos números rodando na máquina" },
    { icon: "3️⃣", label: "Giro pronto", description: "Roleta carregada para você" },
  ];

  useEffect(() => {
    ambientRef.current?.play().catch(() => undefined);
    const timer = setTimeout(onNext, 4800);
    return () => clearTimeout(timer);
  }, [ambientRef, onNext]);

  useEffect(() => {
    const stepDuration = 1400;
    const tickMs = 120;
    let active = 0;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += tickMs;
      const pct = Math.min(100, Math.round((elapsed / stepDuration) * 100));
      progressRef.current = progressRef.current.map((value, index) => {
        if (index < active) return 100;
        if (index === active) return pct;
        return value;
      });
      forceRender((v) => v + 1);
      if (pct >= 100) {
        active += 1;
        elapsed = 0;
        if (active >= syncTimeline.length) {
          clearInterval(interval);
        }
      }
    }, tickMs);
    return () => clearInterval(interval);
  }, [syncTimeline.length]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <p className="meta-label flex items-center justify-center gap-2 text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          Conferindo resultado
        </p>
        <Card className="loading-panel space-y-5">
          <div className="space-y-2 text-center">
            <h2 className="heading-2">Estamos comparando seus {userScore} pontos com a jogada da IA</h2>
            <p className="text-sm text-muted-foreground">É uma tela rápida para não travar e garantir que o placar saia certinho.</p>
          </div>

          <div className="bg-secondary/60 rounded-xl p-4 space-y-2 text-sm text-foreground">
            <p className="font-semibold text-primary">O que está acontecendo agora</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Conferimos seus 15 números em 2.500 resultados.</li>
              <li>Separarmos o mesmo jogo rodado pela IA.</li>
              <li>Carregamos o giro bônus que ela deixou pra você.</li>
            </ul>
          </div>

          <div className="timeline-strip">
            {syncTimeline.map((item, index) => (
              <div key={item.label} className="timeline-badge">
                <span className="timeline-badge__icon" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <p className="timeline-badge__label">{item.label}</p>
                <p className="timeline-badge__description">{item.description}</p>
                <div className="mt-2 h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progressRef.current[index]}%`, transition: "width 0.2s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">Segure uns segundos e já mostramos o comparativo.</div>
        </Card>
      </div>
    </div>
  );
};
