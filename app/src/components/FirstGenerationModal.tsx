/**
 * Component: FirstGenerationModal
 *
 * Modal de celebração da primeira geração com IA
 * Tier A moment (10-15% conversion)
 *
 * Features:
 * - Aparece apenas na primeira geração ever
 * - Confetti automático ao abrir
 * - ShareButton com bônus +2 créditos
 * - Tracking no localStorage
 * - Explicação do valor do app
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
import { Sparkles, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { dispatchFeedbackEvent } from '@/hooks/useFeedbackModal';

const STORAGE_KEY = 'loter_ia_first_generation';

export interface FirstGenerationModalProps {
  /**
   * Controle de abertura (externo)
   */
  open: boolean;

  /**
   * Callback ao fechar
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Estatísticas da geração
   */
  stats: {
    gamesGenerated: number;
    accuracy: number;
    lotteryName: string;
  };

  /**
   * Callback após compartilhamento bem-sucedido
   */
  onShareSuccess?: () => void;
}

/**
 * Verifica se é a primeira geração do usuário
 */
export function isFirstGeneration(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return !stored || stored !== 'true';
  } catch {
    return true;
  }
}

/**
 * Marca primeira geração como concluída
 */
export function markFirstGenerationComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Erro ao marcar primeira geração:', error);
  }
}

/**
 * Modal de Primeira Geração
 */
export function FirstGenerationModal({
  open,
  onOpenChange,
  stats,
  onShareSuccess,
}: FirstGenerationModalProps) {
  const [hasShared, setHasShared] = useState(false);

  // Confetti ao abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
        });
      }, 300);
    }
  }, [open]);

  const handleClose = () => {
    // Marcar como concluído ao fechar (independente de share)
    markFirstGenerationComplete();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          <DialogTitle className="text-2xl text-center">
            Parabéns pela primeira geração!
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            A IA acabou de criar jogos otimizados para você
          </DialogDescription>
        </DialogHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <p className="text-xs text-emerald-600 font-medium mb-1">Jogos Gerados</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.gamesGenerated}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">Taxa de Acerto</p>
            <p className="text-2xl font-bold text-blue-700">{stats.accuracy}%</p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Análise baseada em padrões históricos</p>
              <p className="text-xs text-muted-foreground">
                A IA analisou milhares de concursos para gerar seus números
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Números quentes e balanceados</p>
              <p className="text-xs text-muted-foreground">
                Combinação estratégica para maximizar suas chances
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Gere até 50 vezes por mês</p>
              <p className="text-xs text-muted-foreground">
                Ganhe créditos extras compartilhando o app
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!hasShared ? (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 space-y-3">
            <div className="text-center">
              <Badge variant="secondary" className="bg-emerald-600 text-white mb-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Bônus de Boas-Vindas
              </Badge>
              <p className="text-sm font-medium text-emerald-900">
                Compartilhe agora e ganhe +2 créditos
              </p>
              <p className="text-xs text-emerald-700">
                Seu primeiro compartilhamento tem recompensa em dobro!
              </p>
            </div>

            <ShareButton
              context="first-gen"
              variant="primary"
              size="lg"
              celebratory={true}
              label="Compartilhar Primeira Geração"
              showCredits={true}
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
            <p className="font-medium text-emerald-900">Obrigado por compartilhar!</p>
            <p className="text-sm text-emerald-700">Fechando...</p>
          </div>
        )}

        {/* Footer Note */}
        <p className="text-xs text-center text-muted-foreground">
          Você pode gerar novos jogos a qualquer momento usando seus créditos.{' '}
          <button
            className="underline hover:text-foreground transition-colors"
            onClick={() => {
              onOpenChange(false);
              setTimeout(() => {
                dispatchFeedbackEvent('post-generation', 'suggestion');
              }, 300);
            }}
          >
            Envie sugestões aqui
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
