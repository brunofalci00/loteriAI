import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TestimonialsSlideProps {
  onNext: () => void;
}

const testimonials = [
  {
    name: "Ana • SP",
    gain: "R$ 2.500",
    image: "https://i.ibb.co/ZpGzh5st/Whats-App-Image-2025-10-27-at-16-29-26.jpg",
  },
  {
    name: "Lucas • MG",
    gain: "R$ 370",
    image: "https://i.ibb.co/rfQNMBX2/Whats-App-Image-2025-10-27-at-16-32-16.jpg",
  },
  {
    name: "Marina • RJ",
    gain: "R$ 2.030",
    image: "https://i.ibb.co/TD85XLkM/Whats-App-Image-2025-10-27-at-16-36-22.jpg",
  },
];

export const TestimonialsSlide = ({ onNext }: TestimonialsSlideProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl space-y-10 text-center">
        <div className="space-y-3">
          <img
            src="https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png"
            alt="LOTER.IA"
            className="mx-auto w-28 sm:w-36 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          />
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-bold text-foreground flex items-center justify-center gap-2 text-glow">
            <span role="img" aria-hidden="true">
              🗣️
            </span>
            Depoimentos reais rodando agora
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            São centenas jogando com a LOTER.IA neste momento — sinta a energia dentro do painel.
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
              <img src={testimonial.image} alt={testimonial.name} className="w-full h-52 object-cover" loading="lazy" />
              <div className="absolute inset-x-3 bottom-3 bg-background/90 rounded-xl px-3 py-2 text-left shadow-lg">
                <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-xs text-primary font-bold">+ {testimonial.gain}</p>
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
              🎰
            </span>
            Liberar meu giro
          </Button>
        </div>
      </div>
    </div>
  );
};
