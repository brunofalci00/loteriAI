import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EmailConfirmation = () => {
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resendConfirmationEmail } = useAuth();
  const email = location.state?.email || "seu email";

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendConfirmationEmail(email);
      toast.success("Email reenviado com sucesso!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao reenviar email";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <Card className="w-full max-w-md border-border bg-card shadow-card">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Email de Confirmação Enviado!</CardTitle>
            <CardDescription className="text-base">
              Enviamos um link de confirmação para:
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-center">
              <p className="font-medium text-foreground">{email}</p>
            </div>

            <div className="space-y-2 text-center text-sm text-muted-foreground">
              <p>Clique no link enviado para ativar sua conta.</p>
              <p>Verifique também a pasta de spam.</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  "Reenviar Email"
                )}
              </Button>

              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmation;
