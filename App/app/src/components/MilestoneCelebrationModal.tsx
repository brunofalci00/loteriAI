/**
 * Component: MilestoneCelebrationModal
 *
 * Modal de celebração de milestones de jogos salvos
 * Tier A moment (10-15% conversion)
 *
 * Milestones:
 * - 10 jogos: Colecionador Iniciante 🎯
 * - 25 jogos: Colecionador Experiente 🏆
 * - 50 jogos: Colecionador Master 👑
 *
 * Features:
 * - Confetti automático ao abrir
 * - ShareButton integrado
 * - Badges personalizados
 * - Marca milestone como celebrado
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ShareButton';
import { Trophy, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { markMilestoneCelebrated, type MilestoneData } from '@/services/milestoneService';

export interface MilestoneCelebrationModalProps {
  /**
   * Controle de abertura (externo)
   */
  open: boolean;

  /**
   * Callback ao fechar
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Dados do milestone
   */
  milestone: MilestoneData | null;

  /**
   * Total atual de jogos salvos
   */
  currentTotal: number;

  /**
   * ID do usuário (para mostrar saldo atualizado no toast)
   */
  userId?: string | null;

  /**
   * Callback após compartilhamento bem-sucedido
   */
  onShareSuccess?: () => void;
}

/**
 * Modal de Celebração de Milestone
 */
export function MilestoneCelebrationModal({
  open,
  onOpenChange,
  milestone,
  currentTotal,
  userId = null,
  onShareSuccess,
}: MilestoneCelebrationModalProps) {
  const [hasShared, setHasShared] = useState(false);

  // Confetti ao abrir (intensidade baseada no nível)
  useEffect(() => {
    if (open && milestone) {
      setTimeout(() => {
        const particleCount = milestone.level === 50 ? 150 : milestone.level === 25 ? 100 : 75;

        confetti({
          particleCount,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'], // Gold colors
        });

        // Burst extra para milestone 50
        if (milestone.level === 50) {
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#f59e0b', '#fbbf24'],
            });
          }, 100);

          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#f59e0b', '#fbbf24'],
            });
          }, 200);
        }
      }, 300);
    }
  }, [open, milestone]);

  const handleClose = () => {
    // Marcar como celebrado ao fechar
    if (milestone) {
      markMilestoneCelebrated(milestone.level, currentTotal);
    }
    onOpenChange(false);
  };

  const handleShareSuccess = (credits: number) => {
    setHasShared(true);
    onShareSuccess?.();

    // Fechar após 2 segundos
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  if (!milestone) {
    return null;
  }

  // Cores baseadas no nível
  const colorScheme = {
    10: {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      badge: 'bg-blue-600',
      text: 'text-blue-900',
      textLight: 'text-blue-700',
    },
    25: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      badge: 'bg-purple-600',
      text: 'text-purple-900',
      textLight: 'text-purple-700',
    },
    50: {
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      badge: 'bg-amber-600',
      text: 'text-amber-900',
      textLight: 'text-amber-700',
    },
  };

  const colors = colorScheme[milestone.level];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-4xl">{milestone.emoji}</span>
            </div>
          </div>

          <DialogTitle className="text-2xl text-center">
            {milestone.title}
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            {milestone.description}
          </DialogDescription>
        </DialogHeader>

        {/* Badge Conquistado */}
        <div className="text-center my-4">
          <Badge variant="secondary" className={`${colors.badge} text-white text-base px-4 py-2`}>
            <Trophy className="h-4 w-4 mr-2" />
            {milestone.badge}
          </Badge>
        </div>

        {/* Stats */}
        <div className={`bg-gradient-to-br ${colors.bg} ${colors.border} border rounded-lg p-6 text-center`}>
          <p className={`text-sm font-medium ${colors.textLight} mb-2`}>
            Total de Jogos Salvos
          </p>
          <p className={`text-5xl font-bold ${colors.text}`}>
            {currentTotal}
          </p>

          {/* Próximo milestone (se não for o último) */}
          {milestone.level < 50 && (
            <p className={`text-xs ${colors.textLight} mt-3`}>
              {milestone.level === 10
                ? `Faltam ${25 - currentTotal} para o próximo marco 🏆`
                : `Faltam ${50 - currentTotal} para o marco final 👑`}
            </p>
          )}

          {milestone.level === 50 && (
            <p className={`text-xs ${colors.textLight} mt-3`}>
              Você completou todos os marcos! 🎉
            </p>
          )}
        </div>

        {/* CTA Section */}
        {!hasShared ? (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 space-y-3 mt-4">
            <div className="text-center">
              <Badge variant="secondary" className="bg-emerald-600 text-white mb-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Ganhe Créditos
              </Badge>
              <p className="text-sm font-medium text-emerald-900">
                Compartilhe sua conquista e ganhe +1 crédito
              </p>
              <p className="text-xs text-emerald-700">
                Mostre para seus amigos quantos jogos você já criou!
              </p>
            </div>

            <ShareButton
              context="milestone"
              data={{ milestone: milestone.level }}
              variant="primary"
              size="lg"
              celebratory={milestone.level === 50}
              label="Compartilhar Conquista"
              showCredits={true}
              userId={userId}
              onShareSuccess={handleShareSuccess}
              className="w-full"
            />

            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-xs"
            >
              Continuar sem compartilhar
            </Button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center mt-4">
            <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
            <p className="font-medium text-emerald-900">Obrigado por compartilhar!</p>
            <p className="text-sm text-emerald-700">Fechando...</p>
          </div>
        )}

        {/* Footer Note */}
        <p className="text-xs text-center text-muted-foreground mt-2">
          Continue salvando seus melhores jogos e desbloqueie mais conquistas
        </p>
      </DialogContent>
    </Dialog>
  );
}
