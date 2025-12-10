import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { pixFormSchema, type PixFormData } from "@/lib/validations/pix-form.validation";
import { formatCPF, formatPhone, formatCurrency } from "@/lib/utils/input-masks";
import { useBuckPixPayment } from "@/hooks/useBuckPixPayment";
import { PixQRCodeDisplay } from "./PixQRCodeDisplay";
import { trackPixelEvent } from "@/lib/analytics";
import type { CheckoutState, PixDisplayData } from "@/types/checkout.types";

interface BuckPixCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (transactionId: string) => void;
  amount: number; // em centavos
  productName: string;
  offerName: string;
}

export const BuckPixCheckout = ({
  open,
  onOpenChange,
  onSuccess,
  amount,
  productName,
  offerName,
}: BuckPixCheckoutProps) => {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    type: "pix-form",
  });

  const {
    createPixPayment,
    startPolling,
    stopPolling,
    isCreating,
    isPolling,
    error: apiError,
    reset: resetPayment,
  } = useBuckPixPayment();

  const form = useForm<PixFormData>({
    resolver: zodResolver(pixFormSchema),
    defaultValues: {
      name: "",
      email: "",
      document: "",
      phone: "",
    },
  });

  const handleFormSubmit = async (data: PixFormData) => {
    try {
      trackPixelEvent("PixFormStarted", {
        email: data.email,
        amount: amount / 100,
        currency: "BRL",
      });

      setCheckoutState({ type: "pix-loading" });

      const response = await createPixPayment(data, {
        amount,
        productName,
        offerName,
      });

      const pixData: PixDisplayData = {
        externalId: response.externalId,
        transactionId: response.transactionId,
        qrCodeBase64: response.qrCodeBase64,
        pixCode: response.pixCode,
        expiresAt: response.expiresAt,
        totalAmount: amount,
      };

      trackPixelEvent("PixQRCodeGenerated", {
        external_id: response.externalId,
        transaction_id: response.transactionId,
        amount: amount / 100,
        currency: "BRL",
      });

      setCheckoutState({
        type: "pix-display",
        data: pixData,
      });

      // Iniciar polling
      startPolling(
        response.externalId,
        () => handlePaymentSuccess(response.transactionId, data.email),
        () => handlePaymentExpired()
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao gerar PIX");
      setCheckoutState({
        type: "pix-error",
        error: error.message,
        canRetry: true,
      });
    }
  };

  const handlePaymentSuccess = (transactionId: string, email: string) => {
    trackPixelEvent("PixPaymentCompleted", {
      transaction_id: transactionId,
      value: amount / 100,
      currency: "BRL",
    });

    setCheckoutState({
      type: "pix-success",
      transactionId,
      email,
    });

    // Aguardar 3 segundos antes de chamar onSuccess
    setTimeout(() => {
      onSuccess(transactionId);
    }, 3000);
  };

  const handlePaymentExpired = () => {
    trackPixelEvent("PixPaymentExpired");
    setCheckoutState({ type: "pix-expired" });
  };

  const handleCopyCode = () => {
    trackPixelEvent("PixCodeCopied");
  };

  const handleClose = () => {
    if (isPolling) {
      stopPolling();
    }
    resetPayment();
    form.reset();
    setCheckoutState({ type: "pix-form" });
    onOpenChange(false);
  };

  const handleRetry = () => {
    resetPayment();
    setCheckoutState({ type: "pix-form" });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                {checkoutState.type === "pix-success"
                  ? "Pagamento Confirmado!"
                  : checkoutState.type === "pix-expired"
                  ? "PIX Expirado"
                  : checkoutState.type === "pix-error"
                  ? "Erro no Pagamento"
                  : "Pagamento via PIX"}
              </DialogTitle>
              {checkoutState.type === "pix-form" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Valor: <span className="font-bold text-primary">{formatCurrency(amount)}</span>
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Formulário */}
        {checkoutState.type === "pix-form" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome completo"
                        {...field}
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        value={formatCPF(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={14}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        value={formatPhone(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={15}
                        autoComplete="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {apiError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="ml-2">{apiError.message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  <>Gerar PIX</>
                )}
              </Button>
            </form>
          </Form>
        )}

        {/* Loading */}
        {checkoutState.type === "pix-loading" && (
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-lg font-semibold">Gerando seu PIX...</p>
              <p className="text-sm text-muted-foreground text-center">
                Aguarde alguns instantes enquanto criamos seu código de pagamento
              </p>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        )}

        {/* Display QR Code */}
        {(checkoutState.type === "pix-display" || checkoutState.type === "pix-polling") && (
          <PixQRCodeDisplay
            qrCodeBase64={checkoutState.data.qrCodeBase64}
            pixCode={checkoutState.data.pixCode}
            expiresAt={checkoutState.data.expiresAt}
            onExpired={handlePaymentExpired}
            onCopy={handleCopyCode}
          />
        )}

        {/* Success */}
        {checkoutState.type === "pix-success" && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative bg-primary/10 p-6 rounded-full">
                  <CheckCircle2 className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center">
                Pagamento Confirmado!
              </h3>
              <p className="text-center text-muted-foreground max-w-md">
                Seu acesso ao <span className="font-semibold text-primary">loter.IA</span> foi liberado e
                enviado para <span className="font-semibold">{checkoutState.email}</span>
              </p>
            </div>

            <Alert className="border-primary/30 bg-primary/5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <AlertDescription className="ml-2 text-sm">
                <p className="font-semibold">O que acontece agora?</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>Você receberá um e-mail com instruções de acesso</li>
                  <li>Defina sua senha através do link no e-mail</li>
                  <li>Faça login e comece a usar o loter.IA</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleClose}
              className="w-full"
              size="lg"
            >
              Entendi
            </Button>
          </div>
        )}

        {/* Expired */}
        {checkoutState.type === "pix-expired" && (
          <div className="space-y-6 py-8">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="ml-2">
                <p className="font-semibold">O PIX expirou</p>
                <p className="text-sm mt-1">
                  O código PIX tem validade de 15 minutos. Gere um novo código para continuar.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                className="flex-1"
                variant="outline"
              >
                Gerar Novo PIX
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {checkoutState.type === "pix-error" && (
          <div className="space-y-6 py-8">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="ml-2">
                <p className="font-semibold">Erro ao processar pagamento</p>
                <p className="text-sm mt-1">{checkoutState.error}</p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              {checkoutState.canRetry && (
                <Button
                  onClick={handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
              )}
              <Button
                onClick={handleClose}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
