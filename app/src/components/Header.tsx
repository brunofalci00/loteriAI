import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Heart, PlusCircle, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { CreditsDisplay } from "./CreditsDisplay";
import { MobileMenu } from "./MobileMenu";
import { FeedbackModal } from "./FeedbackModal";
import { useSavedGamesStats } from "@/hooks/useSavedGames";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
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
  const navigate = useNavigate();
  const { open, context, defaultTab, handleOpen, handleClose } = useFeedbackModal();

  // Buscar estatísticas de jogos salvos
  const { data: savedGamesStats } = useSavedGamesStats();
  const savedCount = savedGamesStats?.totalSaved || 0;

  // Logo redireciona para dashboard se logado, ou home se não logado
  const handleLogoClick = () => {
    if (user?.isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center cursor-pointer">
          <img src={logo} alt="loter.AI" className="h-16 w-auto" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          {user?.isAuthenticated && (
            <>
              <Link
                to="/criar-jogo"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Criar Jogo</span>
                <Badge variant="secondary" className="ml-1 text-[10px] hidden lg:inline-flex">
                  Novo
                </Badge>
              </Link>
            </>
          )}
          <Link
            to="/how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            Como Funciona
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {user?.isAuthenticated ? (
            <>
              {/* Credits Badge - Visible on all screens */}
              {user.id && (
                <CreditsDisplay userId={user.id} variant="badge" />
              )}

              {/* Saved Games Badge - Desktop only */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden md:flex"
                asChild
              >
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

              {/* User Dropdown - Desktop only */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hidden md:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{user.name}</span>
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
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleOpen('header')} className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Enviar Feedback
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <MobileMenu />
            </>
          ) : (
            /* Not authenticated - Show login button */
            <Button asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {user?.isAuthenticated && (
        <FeedbackModal
          open={open}
          onOpenChange={handleClose}
          context={context}
          defaultTab={defaultTab}
        />
      )}
    </header>
  );
};
