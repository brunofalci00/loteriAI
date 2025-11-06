/**
 * Component: EditGameNameModal
 *
 * Modal para editar nome do jogo salvo:
 * - Input com validação de 50 caracteres
 * - Placeholder com nome padrão
 * - Botões Limpar/Cancelar/Salvar
 * - Loading state durante salvamento
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateGameName } from '@/hooks/useSavedGames';

export interface EditGameNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  currentName: string | null;
  lotteryType: string;
  contestNumber: number;
}

/**
 * Modal de Edição de Nome
 */
export function EditGameNameModal({
  open,
  onOpenChange,
  gameId,
  currentName,
  lotteryType,
  contestNumber,
}: EditGameNameModalProps) {
  const [name, setName] = useState(currentName || '');
  const updateGameName = useUpdateGameName();

  // Reset input quando modal abre
  useEffect(() => {
    if (open) {
      setName(currentName || '');
    }
  }, [currentName, open]);

  // Mapear tipo de loteria para nome amigável
  const lotteryNames: Record<string, string> = {
    'mega-sena': 'Mega-Sena',
    'quina': 'Quina',
    'lotofacil': 'Lotofácil',
    'lotomania': 'Lotomania',
    'dupla-sena': 'Dupla Sena',
    'timemania': 'Timemania',
  };

  const lotteryName = lotteryNames[lotteryType] || lotteryType;
  const defaultName = `Jogo ${lotteryName} #${contestNumber}`;

  const handleSave = async () => {
    const finalName = name.trim() || null;

    const result = await updateGameName.mutateAsync({
      gameId,
      name: finalName,
    });

    if (result.success) {
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !updateGameName.isPending) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>✏️ Editar Nome do Jogo</DialogTitle>
          <DialogDescription>
            Dê um nome personalizado para identificar este jogo facilmente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="game-name">Nome do Jogo (opcional)</Label>
            <Input
              id="game-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={defaultName}
              maxLength={50}
              disabled={updateGameName.isPending}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 caracteres
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={updateGameName.isPending || !name}
          >
            Limpar
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateGameName.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateGameName.isPending}
          >
            {updateGameName.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
