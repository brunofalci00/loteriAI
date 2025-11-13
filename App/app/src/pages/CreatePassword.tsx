import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import logo from "@/assets/logo-loterai.png";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type TokenValidationState = "validating" | "valid" | "invalid";

interface TokenData {
  valid: boolean;
  email?: string;
  userId?: string;
  expiresAt?: string;
  error?: string;
}

const CreatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenState, setTokenState] = useState<TokenValidationState>("validating");
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Efeito para validar token ao carregar
  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      setErrorMessage("Nenhum link de acesso foi fornecido.");
      return;
    }

    validateToken();
  }, [token]);

  // Função para validar o token
  const validateToken = async () => {
    try {
      setTokenState("validating");
      setErrorMessage("");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/validate-access-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const data: TokenData = await response.json();

      if (!response.ok) {
        setTokenState("invalid");
        setErrorMessage(data.error || "Link inválido ou expirado.");
        toast.error(data.error || "Erro ao validar link");
        return;
      }

      if (data.valid && data.email) {
        setTokenState("valid");
        setUserEmail(data.email);
        toast.success("Link válido! Crie sua senha abaixo.");
      } else {
        setTokenState("invalid");
        setErrorMessage(data.error || "Link inválido ou expirado.");
        toast.error(data.error || "Token inválido");
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      setTokenState("invalid");
      setErrorMessage("Erro ao validar link. Tente novamente.");
      toast.error("Erro ao validar link");
    }
  };

  // Função para criar a senha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Chamar Edge Function para definir a senha
      const response = await fetch(
        `${supabaseUrl}/functions/v1/set-password-with-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Erro ao criar senha");
        setErrorMessage(data.error || "Erro ao criar senha");
        return;
      }

      // Sucesso! Fazer login automático
      toast.success("🎉 Senha criada com sucesso!");

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password,
        });

        if (signInError) {
          console.error("Erro ao fazer login:", signInError);
          // Se o login falhar, redirecionar para auth para o usuário fazer login manualmente
          toast.info("Senha criada! Faça login com suas credenciais");
          setTimeout(() => {
            navigate("/auth");
          }, 2000);
          return;
        }

        // Login bem-sucedido, redirecionar para dashboard
        toast.success("Bem-vindo ao loter.AI! Entrando na plataforma...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (loginError) {
        console.error("Erro inesperado no login:", loginError);
        toast.error("Erro ao fazer login. Tente novamente.");
        setErrorMessage("Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao criar senha. Tente novamente.");
      setErrorMessage("Erro ao criar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Estado: Validando token
  if (tokenState === "validating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-sm p-8 text-center shadow-lg">
          <div className="mb-6">
            <img src={logo} alt="loter.AI" className="h-24 w-auto mx-auto mb-4" />
            <div className="inline-block">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Validando link de acesso...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Estado: Link inválido ou expirado
  if (tokenState === "invalid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-destructive/50 bg-card/80 backdrop-blur-sm p-8 text-center shadow-lg">
          <div className="mb-6">
            <img src={logo} alt="loter.AI" className="h-24 w-auto mx-auto mb-4" />
            <div className="mb-4 text-4xl">🚫</div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              Link inválido ou expirado
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              {errorMessage || "Este link não é mais válido. Por favor, solicite um novo link de acesso."}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="default"
              className="w-full"
              onClick={() =>
                window.location.href =
                  "https://api.whatsapp.com/send?phone=5511993371766&text=Ol%C3%A1!%20Meu%20link%20de%20acesso%20expirou.%20Preciso%20de%20um%20novo."
              }
            >
              💬 Pedir Novo Link via WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/auth")}
            >
              Voltar para Login
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Dica:</strong> Links de acesso têm validade de 24 horas. Se expirou, entre em contato conosco pelo WhatsApp.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Estado: Link válido - Mostrar formulário
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-sm p-8 shadow-lg">
        <div className="mb-8 text-center">
          <img src={logo} alt="loter.AI" className="h-32 w-auto mx-auto mb-4" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            🎉 Falta só um passo!
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie sua senha para acessar a plataforma loter.AI
          </p>
          {userEmail && (
            <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted/50 rounded">
              Conta: <strong>{userEmail}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo: Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Nova Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 6 caracteres. Use letras, números e símbolos para melhor segurança.
            </p>
          </div>

          {/* Campo: Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirmar Senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>

          {/* Mostrar erro se houver */}
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/50 rounded text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Botão: Criar Senha */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Criando senha...</span>
              </div>
            ) : (
              "🔐 CRIAR SENHA E ENTRAR"
            )}
          </Button>
        </form>

        {/* Seção de Suporte */}
        <div className="mt-6 rounded-lg bg-muted/50 border border-muted p-4">
          <p className="text-center text-sm text-muted-foreground mb-3">
            Precisa de ajuda?
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() =>
              window.location.href =
                "https://api.whatsapp.com/send?phone=5511993371766&text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20como%20criar%20minha%20senha%20no%20loter.AI"
            }
          >
            💬 Falar com Suporte via WhatsApp
          </Button>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 space-y-2 p-3 bg-info/10 border border-info/30 rounded text-xs text-muted-foreground">
          <p>
            <strong>✅ Seu pagamento foi confirmado!</strong>
          </p>
          <p>
            Você agora tem acesso vitalício à plataforma loter.AI. Crie uma senha forte para proteger sua conta.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CreatePassword;
