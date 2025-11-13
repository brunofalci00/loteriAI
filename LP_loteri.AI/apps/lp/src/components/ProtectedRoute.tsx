import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentGuard } from '@/hooks/usePaymentGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ShoppingCart } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { hasPayment, isLoading: paymentLoading } = usePaymentGuard();

  // Loading state
  if (authLoading || paymentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autenticado → Redirecionar para login
  if (!user?.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Autenticado mas sem pagamento → Tela de bloqueio
  if (!hasPayment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card p-8 shadow-card">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            
            <h2 className="mb-2 text-2xl font-bold">Acesso Restrito</h2>
            
            <p className="mb-6 text-muted-foreground">
              Você precisa adquirir o acesso ao <strong>loter.AI</strong> para usar todas as funcionalidades de análise inteligente de loterias.
            </p>

            <div className="mb-6 rounded-lg bg-accent/10 border border-accent/20 p-4">
              <p className="text-sm text-muted-foreground">
                ✨ <strong>Pagamento único</strong> • Acesso vitalício • Sem mensalidades
              </p>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => window.location.href = 'https://pay.kirvano.com/723e60dd-cf83-47c6-8084-f31f88475689'}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adquirir Acesso Agora
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Após o pagamento, você receberá um email para ativar sua conta.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Tudo OK → Renderizar conteúdo protegido
  return <>{children}</>;
};
