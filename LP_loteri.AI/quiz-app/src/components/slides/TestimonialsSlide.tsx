import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TestimonialsSlideProps {
  onNext: () => void;
}

const testimonials = [
  {
    name: "Ana • SP",
    image: "https://i.ibb.co/ZpGzh5st/Whats-App-Image-2025-10-27-at-16-29-26.jpg",
  },
  {
    name: "Lucas • MG",
    image: "https://i.ibb.co/rfQNMBX2/Whats-App-Image-2025-10-27-at-16-32-16.jpg",
  },
  {
    name: "Marina • RJ",
    image: "https://i.ibb.co/TD85XLkM/Whats-App-Image-2025-10-27-at-16-36-22.jpg",
  },
];

export const TestimonialsSlide = ({ onNext }: TestimonialsSlideProps) => {
  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <img src="https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png" alt="LOTER.IA" className="mx-auto w-24 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
          <h1 className="heading-1 flex items-center justify-center gap-2 text-glow text-center">
            <span role="img" aria-hidden="true">
              🎥
            </span>
            Antes de resgatar seus prêmios, veja quem já ganhou com a LOTER.IA
          </h1>
          <p className="body-lead">
            Esses jogadores acabaram de destravar o mesmo bônus de R$500 e ativaram seus acessos com a IA.
          </p>
        </div>

        <Card className="border-0 bg-gradient-to-r from-primary/10 to-gold/10 p-0 overflow-hidden">
          <video
            className="w-full h-full rounded-2xl"
            src="/video/slot.mp4"
            controls
            playsInline
            poster="https://i.ibb.co/ZpGzh5st/Whats-App-Image-2025-10-27-at-16-29-26.jpg"
          />
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="relative overflow-hidden border border-primary/30 p-0">
              <div className="w-full bg-black aspect-[9/16] flex items-center justify-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-full w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-x-3 bottom-3 bg-background/90 rounded-xl px-3 py-2 text-left shadow-lg">
                <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Button
            onClick={onNext}
            size="lg"
            className="w-full sm:w-auto text-lg sm:text-xl py-5 sm:py-6 px-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow flex items-center justify-center gap-2"
          >
            <span role="img" aria-hidden="true">
              🎯
            </span>
            Garantir Meu Desconto
          </Button>
        </div>
      </div>
    </div>
  );
};
