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

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Heart, Sparkles, Pencil, TrendingUp, Filter } from 'lucide-react';
import { SavedGameCard } from '@/components/SavedGameCard';
import { MilestoneCelebrationModal } from '@/components/MilestoneCelebrationModal';
import { checkNewMilestone, type MilestoneData } from '@/services/milestoneService';
import { useSavedGames, useSavedGamesStats } from '@/hooks/useSavedGames';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Página de Jogos Salvos
 */
export default function SavedGamesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all'); // 'all' | 'ai_generated' | 'manual_created'
  const [playedFilter, setPlayedFilter] = useState<string>('all'); // 'all' | 'played' | 'not_played'
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest' | 'oldest' | 'most_played'
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneData | null>(null);

  // Buscar jogos salvos (filtrado pela tab ativa)
  const lotteryType = activeTab === 'all' ? undefined : activeTab;
  const { data: savedGames = [], isLoading: isLoadingGames } = useSavedGames({ lotteryType });

  // Buscar estatísticas
  const { data: stats, isLoading: isLoadingStats } = useSavedGamesStats();

  const isLoading = isLoadingGames || isLoadingStats;

  // Detectar novo milestone (Tier A moment)
  useEffect(() => {
    if (!stats || isLoadingStats) return;

    const totalSaved = stats.totalSaved || 0;
    const milestone = checkNewMilestone(totalSaved);

    if (milestone) {
      // Delay de 500ms para dar tempo de atualizar a UI
      setTimeout(() => {
        setCurrentMilestone(milestone);
        setMilestoneModalOpen(true);
      }, 500);
    }
  }, [stats?.totalSaved, isLoadingStats]);

  // Aplicar filtros adicionais e ordenação
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...savedGames];

    // Filtro por fonte (AI vs Manual)
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(game => game.source === sourceFilter);
    }

    // Filtro por status de jogado
    if (playedFilter === 'played') {
      filtered = filtered.filter(game => game.play_count > 0);
    } else if (playedFilter === 'not_played') {
      filtered = filtered.filter(game => game.play_count === 0);
    }

    // Ordenação
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime());
    } else if (sortBy === 'most_played') {
      filtered.sort((a, b) => b.play_count - a.play_count);
    }

    return filtered;
  }, [savedGames, sourceFilter, playedFilter, sortBy]);

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

        {/* Filtros Avançados */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Filtro por Fonte */}
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="ai_generated">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Gerados por IA
                  </div>
                </SelectItem>
                <SelectItem value="manual_created">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Criados Manualmente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por Status de Jogado */}
            <Select value={playedFilter} onValueChange={setPlayedFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="played">Já jogados</SelectItem>
                <SelectItem value="not_played">Ainda não jogados</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
                <SelectItem value="most_played">Mais jogados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs de Filtro + Grid de Jogos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="lotofacil">Lotofácil</TabsTrigger>
            <TabsTrigger value="lotomania">Lotomania</TabsTrigger>
            <TabsTrigger value="megasena">Mega-Sena</TabsTrigger>
            <TabsTrigger value="quina">Quina</TabsTrigger>
            <TabsTrigger value="dupla_sena">Dupla Sena</TabsTrigger>
            <TabsTrigger value="timemania">Timemania</TabsTrigger>
            <TabsTrigger value="dia_de_sorte">Dia de Sorte</TabsTrigger>
            <TabsTrigger value="mais_milionaria">+Milionária</TabsTrigger>
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
            {!isLoading && filteredAndSortedGames.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum jogo encontrado</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {savedGames.length === 0
                    ? 'Você ainda não salvou nenhum jogo. Comece gerando combinações inteligentes!'
                    : 'Nenhum jogo encontrado com os filtros selecionados. Tente ajustar os filtros.'}
                </p>
                <Button onClick={() => navigate('/')} variant="default">
                  Gerar Jogos
                </Button>
              </div>
            )}

            {/* Grid de Jogos Salvos */}
            {!isLoading && filteredAndSortedGames.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedGames.map((game) => (
                  <SavedGameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Milestone Celebration Modal - Tier A */}
        <MilestoneCelebrationModal
          open={milestoneModalOpen}
          onOpenChange={setMilestoneModalOpen}
          milestone={currentMilestone}
          currentTotal={stats?.totalSaved || 0}
          userId={user?.id || null}
        />
      </div>
    </div>
  );
}
