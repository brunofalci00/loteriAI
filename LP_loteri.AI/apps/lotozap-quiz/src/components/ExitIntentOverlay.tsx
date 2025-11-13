import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Unlock } from "lucide-react";

interface ExitIntentOverlayProps {
  open: boolean;
  onStay: () => void;
}

export const ExitIntentOverlay = ({ open, onStay }: ExitIntentOverlayProps) => {
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none casino-grid opacity-40" />
      <div className="w-full max-w-md relative z-10">
        <Card className="p-6 sm:p-8 space-y-6 text-center border border-muted glow-primary">
          <div className="space-y-5">
            <div className="relative flex justify-center">
              <Unlock className="w-16 h-16 text-primary mx-auto animate-pulse" />
              <div className="lock-beam" />
            </div>

            <h2 className="heading-2">Você chegou longe demais para sair agora.</h2>

            <p className="text-sm text-muted-foreground">
              Se fechar agora, o sistema zera suas moedas e fecha o acesso à IA secreta.
            </p>

            <Button
              onClick={onStay}
              size="lg"
              className="w-full text-lg py-4 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow"
            >
              Continuar e liberar meu bônus
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
