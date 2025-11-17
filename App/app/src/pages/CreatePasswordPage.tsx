import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import logo from "@/assets/logo-loterai.png";
import { supabase } from "@/integrations/supabase/client";

const CreatePasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPurchaseWarning, setShowPurchaseWarning] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const navigate = useNavigate();

  const validateAndCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validação básica
      if (!email.trim()) {
        toast.error("Por favor, insira seu email");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error("Senha deve ter no mínimo 6 caracteres");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        setIsLoading(false);
        return;
      }

      // Valida se email tem compra registrada
      setValidatingEmail(true);
      const { data: payments, error: paymentError } = await supabase
        .from("payments")
        .select("id, user_id")
        .eq("customer_email", email.toLowerCase().trim())
        .eq("status", "active")
        .limit(1);

      if (paymentError) {
        console.error("Erro ao validar pagamento:", paymentError);
        throw paymentError;
      }

      if (!payments || payments.length === 0) {
        // Email não tem compra ativa
        setShowPurchaseWarning(true);
        setValidatingEmail(false);
        setIsLoading(false);
        return;
      }

      // Email tem compra ativa - permite criar senha
      const paymentRecord = payments[0];
      const existingUserId = paymentRecord.user_id;

      // Verifica se usuário já existe no Supabase Auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      let userId = existingUserId;

      if (!userExists && existingUserId) {
        // Usuário já está na tabela de pagamentos mas não no Auth
        // Tenta atualizar sua senha diretamente
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUserId,
          { password }
        );

        if (updateError) {
          console.error("Erro ao atualizar senha:", updateError);
          throw updateError;
        }
      } else if (!userExists) {
        // Criar novo usuário (caso não exista em nenhum lugar)
        const { data: newUser, error: authError } =
          await supabase.auth.admin.createUser({
            email: email.toLowerCase().trim(),
            password,
            email_confirm: true,
            user_metadata: {
              full_name: email.split("@")[0],
              created_via: "password_creation_page",
            },
          });

        if (authError) {
          console.error("Erro ao criar usuário:", authError);
          throw authError;
        }

        userId = newUser.user.id;

        // Atualiza o registro de pagamento com o novo user_id
        if (paymentRecord.id) {
          await supabase
            .from("payments")
            .update({ user_id: userId })
            .eq("id", paymentRecord.id);
        }
      }

      // Faz login automático
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (signInError) {
        console.error("Erro ao fazer login:", signInError);
        throw signInError;
      }

      toast.success("Senha criada com sucesso! Bem-vindo ao loter.AI! 🎉");

      // Aguarda um pouco e redireciona
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Erro ao criar senha:", error);
      const message =
        error instanceof Error ? error.message : "Erro ao criar senha";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setValidatingEmail(false);
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

            {showPurchaseWarning ? (
              <>
                <h1 className="mb-2 text-2xl font-bold">
                  Ainda não tem acesso?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Parece que esse email ainda não foi comprado no loter.AI
                </p>
              </>
            ) : (
              <>
                <h1 className="mb-2 text-2xl font-bold">Criar Acesso</h1>
                <p className="text-sm text-muted-foreground">
                  Crie sua senha para acessar o loter.AI
                </p>
              </>
            )}
          </div>

          {!showPurchaseWarning ? (
            <form onSubmit={validateAndCreatePassword} className="space-y-4">
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
                  disabled={isLoading}
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
                  minLength={6}
                  className="bg-input border-border"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-input border-border"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={isLoading || validatingEmail}
              >
                {isLoading || validatingEmail ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>
                      {validatingEmail
                        ? "Validando email..."
                        : "Processando..."}
                    </span>
                  </div>
                ) : (
                  "Criar Senha e Acessar"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-900">
                  😢 Não encontramos uma compra ativa para este email.
                </p>
                <p className="text-xs text-amber-800 mt-2">
                  Se você comprou recentemente, talvez ainda não tenha processado.
                  Tente novamente em alguns momentos.
                </p>
              </div>

              <Button
                onClick={() => {
                  setShowPurchaseWarning(false);
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                variant="outline"
                className="w-full"
              >
                Tentar outro email
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>

              <Button
                onClick={() =>
                  (window.location.href =
                    "https://pay.kirvano.com/723e60dd-cf83-47c6-8084-f31f88475689")
                }
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Comprar Acesso ao loter.AI
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                💎 Pagamento único • Acesso vitalício • Sem mensalidades
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreatePasswordPage;
