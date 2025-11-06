import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import logo from "@/assets/logo-loterai.png";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isInvited = searchParams.get('invited') === 'true';
  const hasToken = searchParams.get('token') !== null;

  useEffect(() => {
    // Mensagens especiais
    if (isInvited || hasToken) {
      toast.success('🎉 Bem-vindo ao loter.AI! Defina sua senha para começar.');
    } else if (searchParams.get('confirmed') === 'true') {
      toast.success('Email confirmado! Você já pode fazer login.');
    }
  }, [searchParams, isInvited, hasToken]);

  useEffect(() => {
    if (user?.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
    } catch (error) {
      // Erros já são tratados no AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <Card className="w-full max-w-md border-border bg-card p-8 shadow-card">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center">
              <img src={logo} alt="loter.AI" className="h-32 w-auto" />
            </div>
            
            {isInvited || hasToken ? (
              <>
                <h1 className="mb-2 text-2xl font-bold">Defina sua senha</h1>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento foi confirmado! Configure sua senha para acessar o sistema.
                </p>
              </>
            ) : (
              <>
                <h1 className="mb-2 text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-sm text-muted-foreground">
                  Entre para acessar suas análises inteligentes
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isInvited || hasToken ? 'Nova Senha' : 'Senha'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-input border-border"
              />
              {(isInvited || hasToken) && (
                <p className="text-xs text-muted-foreground">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Processando...</span>
                </div>
              ) : (
                isInvited || hasToken ? "Ativar Conta" : "Entrar"
              )}
            </Button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Ainda não tem acesso?
              </span>
            </div>
          </div>

          {/* Link para checkout */}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => window.location.href = 'https://pay.hub.la/KdtoUOEAt8J8w23kP93P'}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adquirir Acesso ao loter.AI
          </Button>

          <div className="mt-6 rounded-lg bg-accent/10 border border-accent/20 p-4">
            <p className="text-xs text-center text-muted-foreground">
              💎 Pagamento único • Acesso vitalício • Sem mensalidades
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
