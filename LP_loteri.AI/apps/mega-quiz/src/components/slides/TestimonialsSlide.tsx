import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import testimonialVideo from "../../../WhatsApp Video 2025-11-13 at 21.01.43.mp4";

interface TestimonialsSlideProps {
  onNext: () => void;
}

export const TestimonialsSlide = ({ onNext }: TestimonialsSlideProps) => {
  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <img src="https://i.ibb.co/Dfy1rwfr/Logo-Lumen-2.png" alt="LOTER.IA" className="mx-auto w-24 drop-shadow-[0_0_20px_rgba(255,215,0,0.35)]" />
          <h1 className="heading-1 flex items-center justify-center gap-2 text-glow text-center">
            <span role="img" aria-hidden="true">
              ✨
            </span>
            Antes de resgatar seu prêmio, veja quem já garantiu o acesso
          </h1>
          <p className="body-lead">
            Esses jogadores destravaram mais de R$1.000 em desconto e já estão usando a IA antes da Mega da Virada.
          </p>
        </div>

        <Card className="border-0 bg-gradient-to-r from-primary/10 to-gold/10 p-0 overflow-hidden">
          <video
            className="w-full h-full rounded-2xl"
            src={testimonialVideo}
            controls
            playsInline
            poster="https://i.ibb.co/ZpGzh5st/Whats-App-Image-2025-10-27-at-16-29-26.jpg"
          />
        </Card>

        <div>
          <Button
            onClick={onNext}
            size="lg"
            className="w-full sm:w-auto text-lg sm:text-xl py-5 sm:py-6 px-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow flex items-center justify-center gap-2"
          >
            <span role="img" aria-hidden="true">
              ⚡
            </span>
            Garantir Meu Desconto
          </Button>
        </div>
      </div>
    </div>
  );
};
