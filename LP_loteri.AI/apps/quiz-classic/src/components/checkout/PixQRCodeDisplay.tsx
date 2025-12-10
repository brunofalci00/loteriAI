import { Clock, Copy, CheckCircle2, Smartphone, QrCode as QrCodeIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePixTimer } from "@/hooks/usePixTimer";
import { toast } from "sonner";

interface PixQRCodeDisplayProps {
  qrCodeBase64: string;
  pixCode: string;
  expiresAt: Date;
  onExpired: () => void;
  onCopy: () => void;
}

export const PixQRCodeDisplay = ({
  qrCodeBase64,
  pixCode,
  expiresAt,
  onExpired,
  onCopy,
}: PixQRCodeDisplayProps) => {
  const { timeLeft, formattedTime, isUrgent, isCritical, isExpired } = usePixTimer(
    expiresAt,
    onExpired
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast.success("Código PIX copiado!");
      onCopy();
    } catch (err) {
      toast.error("Erro ao copiar código");
      console.error("Erro ao copiar:", err);
    }
  };

  // Determinar cor do timer
  const timerColor = isCritical
    ? "text-destructive"
    : isUrgent
    ? "text-orange-500"
    : "text-foreground";

  const timerBgColor = isCritical
    ? "bg-destructive/10 border-destructive/50"
    : isUrgent
    ? "bg-orange-500/10 border-orange-500/50"
    : "bg-primary/10 border-primary/30";

  return (
    <div className="space-y-6">
      {/* Timer */}
      <Card className={`p-4 border-2 ${timerBgColor} ${isCritical ? "animate-pulse" : ""}`}>
        <div className="flex items-center justify-center gap-3">
          <Clock className={`w-6 h-6 ${timerColor} ${isCritical ? "animate-bounce" : ""}`} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Tempo restante
            </p>
            <p className={`text-4xl font-bold ${timerColor}`}>
              {formattedTime}
            </p>
            {isCritical && (
              <p className="text-xs text-destructive mt-1 animate-pulse">
                PIX expira em breve!
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-lg" />
          <Card className="relative p-4 border-2 border-primary/30 bg-background">
            <div className="relative">
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-full max-w-[280px] md:max-w-[320px] h-auto"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-2 rounded-full shadow-lg">
                <QrCodeIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        <Badge className="bg-primary animate-pulse" variant="default">
          Aguardando pagamento...
        </Badge>
      </div>

      {/* Código PIX copiável */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Ou copie o código PIX:
        </label>
        <div className="flex gap-2">
          <Input
            value={pixCode}
            readOnly
            className="font-mono text-xs bg-muted border-primary/30"
          />
          <Button
            onClick={handleCopyCode}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            aria-label="Copiar código PIX"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Instruções */}
      <Alert className="border-primary/30 bg-primary/5">
        <Smartphone className="w-4 h-4 text-primary" />
        <AlertDescription className="text-sm space-y-2 ml-2">
          <p className="font-semibold text-foreground">Como pagar:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar com PIX</li>
            <li>Escaneie o QR Code ou cole o código</li>
            <li>Confirme o pagamento</li>
          </ol>
          <p className="text-xs text-primary font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Seu acesso será liberado automaticamente após o pagamento
          </p>
        </AlertDescription>
      </Alert>

      {isUrgent && !isCritical && (
        <Alert className="border-orange-500/50 bg-orange-500/10">
          <Clock className="w-4 h-4 text-orange-500" />
          <AlertDescription className="text-sm ml-2 text-orange-500">
            <strong>Atenção!</strong> Menos de 5 minutos restantes. Complete o pagamento agora.
          </AlertDescription>
        </Alert>
      )}

      {isCritical && (
        <Alert variant="destructive">
          <Clock className="w-4 h-4" />
          <AlertDescription className="text-sm ml-2">
            <strong>Urgente!</strong> Menos de 1 minuto restante. Pague agora para não perder o acesso.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
