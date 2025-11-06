/**
 * Component: GenerationHistoryModal
 *
 * Modal de histórico completo com:
 * - Lista de todas as gerações
 * - Botões para ativar/deletar
 * - Detalhes expandidos de cada geração
 * - Confirmação de deleção
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Calendar,
  Hash
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useGenerationHistoryWithActions } from '@/hooks/useGenerationHistory';
import type { GenerationHistoryItem } from '@/services/generationService';

export interface GenerationHistoryModalProps {
  userId: string;
  lotteryType: string;
  contestNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal de Histórico Completo
 */
export function GenerationHistoryModal({
  userId,
  lotteryType,
  contestNumber,
  open,
  onOpenChange
}: GenerationHistoryModalProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generationToDelete, setGenerationToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    history,
    activeGeneration,
    isLoading,
    setActiveGeneration,
    deleteGeneration,
    isSettingActive,
    isDeleting
  } = useGenerationHistoryWithActions(userId, lotteryType, contestNumber, open);

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  // Handle set active
  const handleSetActive = (generationId: string) => {
    setActiveGeneration(generationId);

    toast({
      title: 'Geração ativada',
      description: 'As combinações exibidas foram atualizadas.',
      duration: 3000
    });
  };

  // Handle delete request
  const handleDeleteRequest = (generationId: string) => {
    // Check if it's the active generation
    if (activeGeneration?.id === generationId) {
      toast({
        variant: 'destructive',
        title: 'Não é possível deletar',
        description: 'Você não pode deletar a geração ativa. Ative outra geração primeiro.',
        duration: 5000
      });
      return;
    }

    setGenerationToDelete(generationId);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (!generationToDelete) return;

    deleteGeneration(generationToDelete);

    toast({
      title: 'Geração deletada',
      description: 'A geração foi removida do histórico.',
      duration: 3000
    });

    setDeleteDialogOpen(false);
    setGenerationToDelete(null);
  };

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Histórico de Gerações</DialogTitle>
            <DialogDescription>
              Todas as gerações criadas para o concurso {contestNumber}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Carregando histórico...</div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Nenhuma geração encontrada</div>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((generation, index) => {
                  const isActive = generation.id === activeGeneration?.id;
                  const isExpanded = expandedId === generation.id;

                  return (
                    <div
                      key={generation.id}
                      className={cn(
                        'rounded-lg border p-4 transition-colors',
                        isActive ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              Geração #{history.length - index}
                            </h4>
                            {isActive && (
                              <Badge variant="default" className="text-xs">
                                Ativa
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTimestamp(generation.generated_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {generation.generated_numbers.length} jogos
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {generation.accuracy_rate.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetActive(generation.id)}
                              disabled={isSettingActive}
                              className="gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Ativar
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRequest(generation.id)}
                            disabled={isActive || isDeleting}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(generation.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="font-medium mb-1">Números Quentes:</div>
                              <div className="flex flex-wrap gap-1">
                                {generation.hot_numbers.map(num => (
                                  <Badge key={num} variant="secondary" className="text-xs">
                                    {num}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="font-medium mb-1">Números Frios:</div>
                              <div className="flex flex-wrap gap-1">
                                {generation.cold_numbers.map(num => (
                                  <Badge key={num} variant="outline" className="text-xs">
                                    {num}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="font-medium mb-1">Estatísticas:</div>
                              <div className="text-xs text-muted-foreground">
                                <div>Sorteios analisados: {generation.draws_analyzed}</div>
                                <div>Taxa de acurácia: {generation.accuracy_rate.toFixed(2)}%</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar geração?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A geração será permanentemente removida do histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
