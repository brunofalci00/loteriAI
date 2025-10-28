import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-loterai.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { user, login, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (error) {
      // Erros já são tratados no AuthContext
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <Card className="w-full max-w-md border-border bg-card p-8 shadow-card">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center">
              <img src={logo} alt="loter.AI" className="h-32 w-auto" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">
              {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin 
                ? "Entre para acessar suas análises" 
                : "Comece a usar análise inteligente agora"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
            )}

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
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

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
                isLogin ? "Entrar" : "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </button>
            </p>
          </div>

          {!isLogin && (
            <div className="mt-6 rounded-lg bg-accent/10 border border-accent/20 p-4">
              <p className="text-xs text-center text-muted-foreground">
                🎉 Pagamento único • Acesso vitalício • Sem mensalidades
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
