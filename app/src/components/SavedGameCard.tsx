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
import { MoreVertical, Edit, Share2, Download, Trash2, Sparkles, Pencil } from 'lucide-react';
import { useUnsaveGame, useMarkAsPlayed } from '@/hooks/useSavedGames';
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

  // Handlers
  const handleDelete = async () => {
    await unsaveGame.mutateAsync(game.id);
    setShowDeleteDialog(false);
  };

  const handleMarkAsPlayed = async (checked: boolean) => {
    if (checked) {
      await markAsPlayed.mutateAsync({ gameId: game.id });
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
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar WhatsApp
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
        </CardHeader>

        <CardContent>
          {/* Números */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {numbersFormatted.map((num, index) => (
                <Badge key={index} variant="outline" className="text-base font-mono px-3 py-1">
                  {num}
                </Badge>
              ))}
            </div>
          </div>

          {/* Análise */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>🔥</span>
              <span>{hotCount} quentes</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📊</span>
              <span>{coldCount} outros</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚖️</span>
              <span>{balancedCount} balanceados</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          {/* Checkbox "Já joguei" */}
          <div className="flex items-center gap-2">
            <Checkbox
              id={`played-${game.id}`}
              checked={game.play_count > 0}
              onCheckedChange={handleMarkAsPlayed}
              disabled={markAsPlayed.isPending}
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
