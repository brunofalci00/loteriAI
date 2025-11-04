/**
 * Component: SavedGameCard
 *
 * Card de jogo salvo com:
 * - Layout completo com números e análise
 * - Checkbox "Já joguei"
 * - Menu de ações (editar, compartilhar, exportar, excluir)
 * - AlertDialog de confirmação de exclusão
 * - Integração com EditGameNameModal
 * - Badges (IA, Manual, Jogado Xx)
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Send, Download, Trash2, Sparkles, Pencil, Flame } from 'lucide-react';
import { useUnsaveGame, useMarkAsPlayed, useUnmarkAsPlayed } from '@/hooks/useSavedGames';
import { shareViaWhatsApp, exportAsTxt } from '@/services/exportService';
import { EditGameNameModal } from './EditGameNameModal';
import type { SavedGame } from '@/services/savedGamesService';

export interface SavedGameCardProps {
  game: SavedGame;
}

/**
 * Card de Jogo Salvo
 */
export function SavedGameCard({ game }: SavedGameCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const unsaveGame = useUnsaveGame();
  const markAsPlayed = useMarkAsPlayed();
  const unmarkAsPlayed = useUnmarkAsPlayed();

  // Mapear tipo de loteria para nome amigável
  const lotteryNames: Record<string, string> = {
    'mega-sena': 'Mega-Sena',
    'quina': 'Quina',
    'lotofacil': 'Lotofácil',
    'lotomania': 'Lotomania',
    'dupla-sena': 'Dupla Sena',
    'timemania': 'Timemania',
  };

  const lotteryName = lotteryNames[game.lottery_type] || game.lottery_type;
  const defaultName = `Jogo ${lotteryName} #${game.contest_number}`;
  const displayName = game.name || defaultName;

  // Formatação de números
  const numbers = Array.isArray(game.numbers) ? game.numbers : [];
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const numbersFormatted = sortedNumbers.map(n => n.toString().padStart(2, '0'));

  // Data de salvamento
  const savedDate = new Date(game.saved_at);
  const savedDateFormatted = savedDate.toLocaleDateString('pt-BR');

  // Análise
  const analysis = game.analysis_result as any;
  const hotCount = analysis?.hotCount || 0;
  const coldCount = analysis?.coldCount || 0;
  const balancedCount = analysis?.balancedCount || 0;

  // Hot numbers (se disponível na análise detalhada)
  const hotNumbers: number[] = analysis?.detailedAnalysis?.hotNumbers || [];

  // Handlers
  const handleDelete = async () => {
    await unsaveGame.mutateAsync(game.id);
    setShowDeleteDialog(false);
  };

  const handleMarkAsPlayed = async (checked: boolean) => {
    if (checked) {
      await markAsPlayed.mutateAsync({ gameId: game.id });
    } else {
      await unmarkAsPlayed.mutateAsync({ gameId: game.id });
    }
  };

  const handleShare = () => {
    shareViaWhatsApp(game);
  };

  const handleExport = () => {
    exportAsTxt(game);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {displayName}
                {game.source === 'ai_generated' && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    IA
                  </Badge>
                )}
                {game.source === 'manual_created' && (
                  <Badge variant="outline" className="gap-1">
                    <Pencil className="h-3 w-3" />
                    Manual
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {lotteryName} • Concurso #{game.contest_number}
              </CardDescription>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-1">
              {/* Botão Compartilhar - Destacado */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="shrink-0"
                title="Compartilhar"
              >
                <Send className="h-4 w-4" />
              </Button>

              {/* Menu de Ações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Nome
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar TXT
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Números com foguinhos para quentes */}
          <div className="flex flex-wrap gap-2">
            {sortedNumbers.map((num, index) => {
              const isHot = hotNumbers.includes(num);
              return (
                <div
                  key={index}
                  className={`
                    relative flex items-center justify-center rounded-lg
                    text-base font-mono px-3 py-1.5 border
                    ${isHot
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 font-semibold'
                      : 'bg-background border-border'
                    }
                  `}
                >
                  {num.toString().padStart(2, '0')}
                  {isHot && <Flame className="absolute -top-1 -right-1 h-3 w-3 text-orange-500" />}
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          {/* Checkbox "Já joguei" */}
          <div className="flex items-center gap-2">
            <Checkbox
              id={`played-${game.id}`}
              checked={game.play_count > 0}
              onCheckedChange={handleMarkAsPlayed}
              disabled={markAsPlayed.isPending || unmarkAsPlayed.isPending}
            />
            <label
              htmlFor={`played-${game.id}`}
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              {game.play_count > 0 ? `Jogado ${game.play_count}x` : 'Já joguei'}
            </label>
          </div>

          {/* Data */}
          <div className="text-xs text-muted-foreground">
            Salvo em {savedDateFormatted}
          </div>
        </CardFooter>
      </Card>

      {/* Modal de Edição de Nome */}
      <EditGameNameModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        gameId={game.id}
        currentName={game.name}
        lotteryType={game.lottery_type}
        contestNumber={game.contest_number}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir jogo salvo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{displayName}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {unsaveGame.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
