import { Link } from "react-router-dom";
import { User, LogOut, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsDisplay } from "./CreditsDisplay";
import { useSavedGamesStats } from "@/hooks/useSavedGames";
import logo from "@/assets/logo-loterai.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, logout } = useAuth();

  // Buscar estatísticas de jogos salvos
  const { data: savedGamesStats } = useSavedGamesStats();
  const savedCount = savedGamesStats?.totalSaved || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="loter.AI" className="h-16 w-auto" />
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          <Link to="/" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link to="/how-it-works" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Como Funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user?.isAuthenticated && (
            <>
              {/* Credits Badge */}
              {user.id && (
                <CreditsDisplay userId={user.id} variant="badge" />
              )}

              {/* Saved Games Badge */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/meus-jogos">
                  <Heart className="h-5 w-5" />
                  {savedCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      variant="destructive"
                    >
                      {savedCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
