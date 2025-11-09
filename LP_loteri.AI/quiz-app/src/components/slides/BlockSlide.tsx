import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Unlock } from "lucide-react";

interface BlockSlideProps {
  onNext: () => void;
  coinsEarned: number;
}

const typingMessage = "Painel da IA aguardando confirmação do último participante...";

export const BlockSlide = ({ onNext, coinsEarned }: BlockSlideProps) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [typedText, setTypedText] = useState("");
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedText(typingMessage.slice(0, index));
      if (index >= typingMessage.length) {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const playSound = (file: string) => {
    soundRef.current = new Audio(file);
    soundRef.current.volume = 0.12;
    soundRef.current.play().catch(() => undefined);
  };

  const handleUnlock = () => {
    playSound("/sounds/lock-break.mp3");
    setIsUnlocking(true);
    setTimeout(() => onNext(), 1500);
  };

  const handleDesist = () => {
    playSound("/sounds/warning-tone.mp3");
    setShowWarning(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
      <div className="max-w-2xl w-full relative z-10">
        <Card className={`p-8 space-y-6 border-2 text-center transition-all duration-700 ${
          isUnlocking ? "border-primary glow-primary-strong" : "border-muted"
        }`}>
          <div className="space-y-6">
            <div className="relative flex justify-center">
              {isUnlocking ? (
                <Unlock className="w-20 h-20 text-primary mx-auto animate-bounce" />
              ) : (
                <Lock className="w-20 h-20 text-muted-foreground mx-auto lock-pulse" />
              )}
              <div className="lock-beam" />
            </div>

            <div>
              <p className="text-sm text-primary font-semibold tracking-widest">⚠️ Momento decisivo</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                ⚠️ Você chegou longe demais pra parar agora.
              </h2>
            </div>

            {!isUnlocking ? (
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-primary/15 to-gold/10 border border-primary/40 rounded-lg p-4 space-y-2">
                  <p className="text-lg text-foreground flex items-center gap-2">
                    <span role="img" aria-hidden="true">
                      🚧
                    </span>
                    Jogadores que passaram desse ponto desbloquearam 7x mais chances que os demais.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você já acumulou {coinsEarned} moedas... e agora só falta 1 clique pra liberar o Bônus 1.
                  </p>
                </div>

                <p className="text-muted-foreground text-sm typing-text">{typedText}</p>
                <div className="space-y-2 text-left">
                  <p className="text-sm text-destructive font-semibold">
                    Parar agora significa jogar suas moedas no lixo.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Deixar o Mapa dos Números Quentes pra trás pode custar o lucro que você busca há anos.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleUnlock}
                    size="lg"
                    className="w-full text-lg sm:text-xl py-5 sm:py-6 px-4 text-center leading-tight whitespace-normal bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow lock-button"
                  >
                    Continuar e liberar meu bônus
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full text-sm text-muted-foreground"
                    onClick={handleDesist}
                  >
                    Desistir agora
                  </Button>
                  {showWarning && (
                    <p className="text-xs text-destructive">
                      Você perderá suas moedas e o Mapa dos Números Quentes da IA. Tem certeza disso?
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Decisão final. Depois... não tem como voltar. O sistema vai resetar suas moedas e fechar sua sessão.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xl text-primary font-bold">Desbloqueando bônus...</p>
                <div className="flex justify-center gap-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${index * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
