import { QrCode, CreditCard, ShieldCheck, Zap, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPixSelected: () => void;
  onCardSelected: () => void;
}

export const PaymentMethodDialog = ({
  open,
  onOpenChange,
  onPixSelected,
  onCardSelected,
}: PaymentMethodDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Escolha a forma de pagamento
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Selecione como prefere pagar pelo seu acesso ao loter.AI
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {/* Card PIX */}
          <Card
            className="relative p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-primary/30 hover:border-primary bg-gradient-to-br from-primary/5 to-primary/10"
            onClick={onPixSelected}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative bg-primary/10 p-4 rounded-full">
                  <QrCode className="w-12 h-12 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  Pagamento PIX
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pagamento instantâneo direto no app
                </p>
              </div>

              <Badge className="bg-primary hover:bg-primary text-primary-foreground">
                Aprovação em segundos
              </Badge>

              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>100% seguro</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Aprovação automática</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Acesso liberado na hora</span>
                </div>
              </div>

              <div className="pt-2 border-t border-primary/20 w-full">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Protegido por Buck Pay
                </p>
              </div>
            </div>
          </Card>

          {/* Card Cartão */}
          <Card
            className="relative p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-border hover:border-primary/50 bg-gradient-to-br from-background to-muted/30"
            onClick={onCardSelected}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-muted/50 blur-xl rounded-full" />
                <div className="relative bg-muted p-4 rounded-full">
                  <CreditCard className="w-12 h-12 text-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  Cartão de Crédito
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pague com seu cartão preferido
                </p>
              </div>

              <Badge variant="secondary">
                Parcelamento disponível
              </Badge>

              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-foreground" />
                  <span>Todas as bandeiras</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-foreground" />
                  <span>Parcele em até 12x</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-foreground" />
                  <span>Aprovação rápida</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border w-full">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" />
                  Processamento seguro
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Seus dados estão protegidos com criptografia de ponta
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
