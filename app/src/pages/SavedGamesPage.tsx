/**
 * Page: SavedGamesPage
 *
 * Página dedicada "Meus Jogos" com:
 * - Cards de estatísticas (Total, IA, Manual, Apostas)
 * - Tabs de filtro por loteria
 * - Grid responsivo de SavedGameCard
 * - Estado vazio com mensagem amigável
 * - Loading skeleton durante fetch
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Heart, Sparkles, Pencil, TrendingUp } from 'lucide-react';
import { SavedGameCard } from '@/components/SavedGameCard';
import { useSavedGames, useSavedGamesStats } from '@/hooks/useSavedGames';

/**
 * Página de Jogos Salvos
 */
export default function SavedGamesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');

  // Buscar jogos salvos (filtrado pela tab ativa)
  const lotteryType = activeTab === 'all' ? undefined : activeTab;
  const { data: savedGames = [], isLoading: isLoadingGames } = useSavedGames({ lotteryType });

  // Buscar estatísticas
  const { data: stats, isLoading: isLoadingStats } = useSavedGamesStats();

  const isLoading = isLoadingGames || isLoadingStats;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-8 pb-12">
        {/* Header com botão voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Título */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 fill-red-500 text-red-500" />
            Meus Jogos Salvos
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus jogos favoritos em um só lugar
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Salvos */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Jogos</CardDescription>
              <CardTitle className="text-3xl">
                {isLoadingStats ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <span>{stats?.totalSaved || 0}</span>
                )}
                <span className="text-sm text-muted-foreground ml-1">/ 50</span>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* IA Generated */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Gerados por IA
              </CardDescription>
              <CardTitle className="text-3xl">
                {isLoadingStats ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  stats?.aiGeneratedCount || 0
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Manual Created */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <Pencil className="h-4 w-4" />
                Criados Manualmente
              </CardDescription>
              <CardTitle className="text-3xl">
                {isLoadingStats ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  stats?.manualCreatedCount || 0
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Total Plays */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Total de Apostas
              </CardDescription>
              <CardTitle className="text-3xl">
                {isLoadingStats ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  stats?.totalPlays || 0
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs de Filtro + Grid de Jogos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="lotofacil">Lotofácil</TabsTrigger>
            <TabsTrigger value="lotomania">Lotomania</TabsTrigger>
            <TabsTrigger value="mega-sena">Mega-Sena</TabsTrigger>
            <TabsTrigger value="quina">Quina</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && savedGames.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum jogo salvo</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {activeTab === 'all'
                    ? 'Você ainda não salvou nenhum jogo. Comece gerando combinações inteligentes!'
                    : `Você não tem jogos salvos de ${activeTab === 'lotofacil' ? 'Lotofácil' : activeTab}.`}
                </p>
                <Button onClick={() => navigate('/')} variant="default">
                  Gerar Jogos
                </Button>
              </div>
            )}

            {/* Grid de Jogos Salvos */}
            {!isLoading && savedGames.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedGames.map((game) => (
                  <SavedGameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
