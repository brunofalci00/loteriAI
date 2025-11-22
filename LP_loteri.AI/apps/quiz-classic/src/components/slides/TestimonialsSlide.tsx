import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TestimonialsSlideProps {
  onNext: () => void;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
}

export const TestimonialsSlide = ({ onNext, onVideoPause, onVideoPlay }: TestimonialsSlideProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);

  const handleStartWithSound = () => {
    if (!videoRef.current) return;
    setMuted(false);
    setShowOverlay(false);
    videoRef.current.currentTime = 0;
    videoRef.current.muted = false;
    videoRef.current.play().catch(() => undefined);
    onVideoPlay?.();
  };

  const handleVideoPause = () => onVideoPause?.();

  useEffect(() => {
    videoRef.current?.play().catch(() => undefined);
    return () => {
      onVideoPause?.();
    };
  }, [onVideoPause]);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <img src="https://i.ibb.co/Dfy1rwfr/Logo-Lumen-2.png" alt="LOTER.IA" className="mx-auto w-24 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
          <h1 className="heading-1 flex items-center justify-center gap-2 text-glow text-center">
            <span role="img" aria-hidden="true">
              💬
            </span>
            Antes de resgatar seus prêmios, veja quem já ganhou com a LOTER.IA
          </h1>
          <p className="body-lead">
            Esses jogadores acabaram de destravar o mesmo bônus de R$500 e ativaram seus acessos com a IA.
          </p>
        </div>

        <Card className="border-0 bg-gradient-to-r from-primary/10 to-gold/10 p-0 overflow-hidden">
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl overflow-hidden border border-primary/20 bg-black">
              <video
                ref={videoRef}
                className="w-full aspect-[9/16] object-cover"
                src="/video/slot.mp4"
                autoPlay
                muted={muted}
                loop
                playsInline
                controls={!showOverlay}
                onPause={handleVideoPause}
                onEnded={handleVideoPause}
              />
            </div>
            {showOverlay && (
              <button
                type="button"
                onClick={handleStartWithSound}
                className="absolute inset-0 flex items-center justify-center bg-black/45 text-primary-foreground text-lg font-semibold rounded-2xl"
              >
                Clique para assistir com som
              </button>
            )}
          </div>
        </Card>

        <div>
          <Button
            onClick={onNext}
            size="lg"
            className="w-full sm:w-auto text-lg sm:text-xl py-5 sm:py-6 px-8 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow flex items-center justify-center gap-2"
          >
            <span role="img" aria-hidden="true">
              🏆
            </span>
            Garantir Meu Desconto
          </Button>
        </div>
      </div>
    </div>
  );
};
