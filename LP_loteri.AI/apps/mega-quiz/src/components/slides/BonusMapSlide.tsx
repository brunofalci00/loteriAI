import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSoundEffect } from "@/hooks/useSoundEffect";

interface BonusMapSlideProps {
  onNext: () => void;
}

export const BonusMapSlide = ({ onNext }: BonusMapSlideProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  const [coinStage, setCoinStage] = useState<"stack" | "travel" | "spent">("stack");
  const fanfareRef = useSoundEffect("/sounds/winning-unlock.mp3", { autoplay: false, volume: 0.3 });

  useEffect(() => {
    setShowConfetti(true);
    fanfareRef.current?.play().catch(() => undefined);
  }, [fanfareRef]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setCoinStage("travel"), 600),
      window.setTimeout(() => setCoinStage("spent"), 2200),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const handleOpenModal = () => setShowNextStepModal(true);
  const handleProceed = () => {
    setShowNextStepModal(false);
    onNext();
  };

  return (
    <div className="slide-shell relative">
      <ConfettiEffect trigger={showConfetti} variant="emoji-rain" />
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <p className="meta-label text-primary flex items-center justify-center gap-2">✨ Bônus 1 liberado</p>
          <h1 className="heading-1 text-glow">Mapa dos números quentes na sua tela</h1>
          <p className="body-lead">Ele já vem pronto, sem termos difíceis e com letras grandes para você consultar antes de apostar.</p>
        </div>

        <div className="coin-flow-panel">
          <p className="text-sm text-muted-foreground text-center">Veja suas moedas pagando o bônus:</p>
          <div className={`coin-flow ${coinStage !== "stack" ? "coin-flow--active" : ""}`}>
            <div className={`coin-stack ${coinStage !== "stack" ? "coin-stack--light" : ""}`}>
              <span className="coin-stack__label">Moedas</span>
              <span className="coin-stack__value">30</span>
            </div>
            <div className="coin-path">
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className={`coin-path__coin ${coinStage === "travel" ? `coin-path__coin--move coin-path__coin--delay-${index}` : ""} ${
                    coinStage === "spent" ? "coin-path__coin--hidden" : ""
                  }`}
                />
              ))}
            </div>
            <div className={`coin-target ${coinStage === "spent" ? "coin-target--active" : ""}`}>Bônus liberado</div>
          </div>
          <p className="coin-flow-panel__hint">As moedas não somem: elas viram acesso ao mapa sempre que você completar o quiz.</p>
        </div>

        <Card className="p-5 sm:p-6 space-y-6 border border-primary glow-primary-strong animate-scale-in">
          <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-background">
            <img
              src="https://i.ibb.co/JWTvC1bs/Chat-GPT-Image-13-de-nov-de-2025-18-20-05.png"
              alt="Mapa dos números quentes"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="space-y-4 text-center">
            <p className="text-sm sm:text-base text-foreground">
              Este mapa usa 500 sorteios auditados com IA. Não existe chute aqui: são probabilidades reais pensadas para quem travava na intuição.
            </p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm sm:text-base">
              Acesso exclusivo enquanto o painel estiver aberto. Se fechar ou atualizar a página, a IA bloqueia o mapa.
            </div>
            <p className="text-sm text-muted-foreground">Depois desta etapa você vai direto para o duelo simples contra a IA.</p>
          </div>

          <Button
            onClick={handleOpenModal}
            size="lg"
            className="w-full text-lg sm:text-xl py-5 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow"
          >
            Ir para o desafio: você vs IA
          </Button>
        </Card>
      </div>

      <Dialog open={showNextStepModal} onOpenChange={setShowNextStepModal}>
        <DialogContent className="max-w-md text-center space-y-4">
          <DialogHeader>
            <DialogTitle>Agora é você contra a IA</DialogTitle>
            <DialogDescription>
              Ela abre um duelo valendo mais de R$1.000 em desconto. Seu papel é mostrar sua intuição antes de ver como a máquina joga.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Responda como jogador, compare com a inteligência artificial e libere o giro que garante seu acesso à Loter.IA.
          </p>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleProceed} className="w-full sm:w-auto">
              Partiu enfrentar a IA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
