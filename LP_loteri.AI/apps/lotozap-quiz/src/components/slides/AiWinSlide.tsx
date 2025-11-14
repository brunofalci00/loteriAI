import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AiWinSlideProps {
  onNext: () => void;
}

export const AiWinSlide = ({ onNext }: AiWinSlideProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-[clamp(2rem,6vw,3.2rem)] font-bold text-foreground">
            Parabéns! Bônus secreto reservado só pra você.
          </h1>
          <p className="text-muted-foreground">
            Você é o primeiro ganhador do mês e, por isso, destravou o desconto máximo de R$200 para acessar a plataforma.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 border-2 border-primary/40">
          <div className="space-y-3">
            <p className="text-lg text-muted-foreground">
              A IA cravou 14 pontos usando análise preditiva. Ela já desbloqueou os 3 giros dela… e separou 1 giro bônus para você.
            </p>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-foreground font-semibold">
                Você ganhou 1 giro na Roleta de Prêmios — ele pode liberar imediatamente a LotoZap com R$200 de desconto.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Se sair agora, o giro desaparece.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Antes de usar o giro, veja em segundos como outros jogadores estão ativando a LotoZap.
            </p>
          </div>

          <Button
            onClick={onNext}
            size="lg"
            className="w-full text-base sm:text-xl py-5 sm:py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold pulse-glow"
          >
            Ver jogadores reais e liberar meu giro
          </Button>
        </Card>
      </div>
    </div>
  );
};
