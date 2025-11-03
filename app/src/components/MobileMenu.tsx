import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, PlusCircle, Heart, HelpCircle, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedGamesStats } from "@/hooks/useSavedGames";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: savedGamesStats } = useSavedGamesStats();
  const savedCount = savedGamesStats?.totalSaved || 0;

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  if (!user?.isAuthenticated) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-1 mt-6">
          {/* User Info */}
          <div className="px-4 py-3 mb-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-lg font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <Button
            variant="ghost"
            className="justify-start gap-3 h-11"
            onClick={() => handleNavigation('/dashboard')}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-3 h-11"
            onClick={() => handleNavigation('/criar-jogo')}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Criar Jogo Manual</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              Novo
            </Badge>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-3 h-11"
            onClick={() => handleNavigation('/meus-jogos')}
          >
            <Heart className="h-4 w-4" />
            <span>Meus Jogos</span>
            {savedCount > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                {savedCount}
              </Badge>
            )}
          </Button>

          <Separator className="my-3" />

          <Button
            variant="ghost"
            className="justify-start gap-3 h-11"
            onClick={() => handleNavigation('/how-it-works')}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Como Funciona</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-3 h-11"
            onClick={() => handleNavigation('/profile')}
          >
            <User className="h-4 w-4" />
            <span>Meu Perfil</span>
          </Button>

          <Separator className="my-3" />

          <Button
            variant="ghost"
            className="justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-center text-xs text-muted-foreground">
            <p>Loter.AI © 2025</p>
            <p className="mt-1">Versão 3.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
