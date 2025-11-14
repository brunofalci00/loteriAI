import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Lottery from "./pages/Lottery";
import LotteryContests from "./pages/LotteryContests";
import Profile from "./pages/Profile";
import HowItWorks from "./pages/HowItWorks";
import EmailConfirmation from "./pages/EmailConfirmation";
import SavedGamesPage from "./pages/SavedGamesPage";
import ManualGameCreationPage from "./pages/ManualGameCreationPage";
import MegaEvent from "./pages/MegaEvent";
import MegaEventAI from "./pages/MegaEventAI";
import MegaEventManual from "./pages/MegaEventManual";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/app">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/lottery/:type/contests" element={<ProtectedRoute><LotteryContests /></ProtectedRoute>} />
            <Route path="/lottery/:type/analysis/:contestNumber" element={<ProtectedRoute><Lottery /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/meus-jogos" element={<ProtectedRoute><SavedGamesPage /></ProtectedRoute>} />
            <Route path="/criar-jogo" element={<ProtectedRoute><ManualGameCreationPage /></ProtectedRoute>} />
            <Route path="/mega-da-virada" element={<ProtectedRoute><MegaEvent /></ProtectedRoute>} />
            <Route path="/mega-da-virada/jogo-ia" element={<ProtectedRoute><MegaEventAI /></ProtectedRoute>} />
            <Route path="/mega-da-virada/manual" element={<ProtectedRoute><MegaEventManual /></ProtectedRoute>} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
