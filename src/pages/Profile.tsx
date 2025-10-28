import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, CheckCircle, LogOut } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Card className="mx-auto max-w-2xl border-border bg-card p-8 shadow-card">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full gradient-primary shadow-glow">
              <User className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-4">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-accent bg-accent/10 p-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-success">Status da Conta</p>
                <p className="text-sm text-muted-foreground">✅ Acesso Vitalício Ativo</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button 
              onClick={logout} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
