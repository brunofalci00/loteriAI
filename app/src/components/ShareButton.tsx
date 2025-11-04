/**
 * Component: ShareButton
 *
 * Botão de compartilhamento viral com:
 * - 3 variantes visuais (primary, secondary, ghost)
 * - Validação de limite diário (3/dia)
 * - Animação confetti
 * - Sistema de recompensa de créditos
 * - Analytics tracking
 * - Toast de sucesso
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Share2, Sparkles, MessageCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import {
  canShareToday,
  getRemainingShares,
  recordShare,
  calculateShareCredits,
} from '@/services/shareTrackingService';
import { getMessageForContext, getABTestMessage } from '@/utils/shareMessages';
import { shouldShowFeedbackToast, markFeedbackToastShown } from '@/utils/feedbackRateLimit';
import { dispatchFeedbackEvent } from '@/hooks/useFeedbackModal';
import { useCreditsStatus } from '@/hooks/useUserCredits';
import type { ShareEvent } from '@/services/shareTrackingService';

export interface ShareButtonProps {
  /**
   * Contexto do compartilhamento
   */
  context: ShareEvent['context'];

  /**
   * Dados opcionais para personalização da mensagem
   */
  data?: {
    score?: number;
    accuracyRate?: number;
    milestone?: number;
  };

  /**
   * Variante visual do botão
   * - primary: Verde vibrante com gradiente (Tier S moments)
   * - secondary: Outline secundário (Tier A moments)
   * - ghost: Minimalista (Tier B moments)
   */
  variant?: 'primary' | 'secondary' | 'ghost';

  /**
   * Tamanho do botão
   */
  size?: 'sm' | 'default' | 'lg';

  /**
   * Usar animação celebratória extra (confetti mais intenso)
   */
  celebratory?: boolean;

  /**
   * Texto customizado do botão (default: "Compartilhar")
   */
  label?: string;

  /**
   * Mostrar contador de créditos no botão
   */
  showCredits?: boolean;

  /**
   * Usar teste A/B de mensagens
   */
  useABTest?: boolean;

  /**
   * ID do usuário (para mostrar saldo atualizado no toast)
   */
  userId?: string | null;

  /**
   * Callback após share bem-sucedido
   */
  onShareSuccess?: (credits: number) => void;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * Botão de Compartilhamento Viral
 */
export function ShareButton({
  context,
  data,
  variant = 'primary',
  size = 'default',
  celebratory = false,
  label = 'Compartilhar',
  showCredits = true,
  useABTest = false,
  userId,
  onShareSuccess,
  className = '',
}: ShareButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);

  // Hook de créditos (se userId fornecido)
  const { creditsRemaining } = useCreditsStatus(userId || '', !!userId);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Validar limite diário
      if (!canShareToday()) {
        toast({
          variant: 'destructive',
          title: 'Limite diário atingido',
          description: 'Você já compartilhou 3 vezes hoje. Volte amanhã para ganhar mais créditos!',
        });
        setIsSharing(false);
        return;
      }

      // Gerar mensagem
      const message = useABTest
        ? getABTestMessage(context as any, data)
        : getMessageForContext(context, data);

      // Compartilhar via WhatsApp
      // Usando API Web Share ou fallback para WhatsApp Web
      const shareData = {
        text: message,
      };

      let shareSuccessful = false;

      // Tentar Web Share API primeiro (mobile)
      if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        try {
          await navigator.share(shareData);
          shareSuccessful = true;
        } catch (error: any) {
          // Usuário cancelou ou erro
          if (error.name !== 'AbortError') {
            console.error('Erro no Web Share:', error);
          }
          setIsSharing(false);
          return;
        }
      } else {
        // Desktop: abrir WhatsApp Web
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        shareSuccessful = true;
      }

      if (!shareSuccessful) {
        setIsSharing(false);
        return;
      }

      // Registrar share e calcular créditos
      const credits = recordShare(context, data);

      // Chamar backend para conceder créditos
      await awardShareCredits(credits);

      // Animação confetti
      triggerConfetti(celebratory);

      // Toast de sucesso aprimorado
      const remaining = getRemainingShares() - 1; // -1 porque ainda não atualizou
      const canShowFeedback = shouldShowFeedbackToast();
      const newBalance = userId ? creditsRemaining + credits : null;

      // Descrição com novo saldo
      let description = `Você ganhou +${credits} ${credits === 1 ? 'crédito' : 'créditos'}!`;
      if (newBalance !== null) {
        description += ` Novo saldo: ${newBalance} ${newBalance === 1 ? 'crédito' : 'créditos'}.`;
      }
      if (remaining > 0) {
        description += ` Restam ${remaining} ${remaining === 1 ? 'compartilhamento' : 'compartilhamentos'} hoje.`;
      } else {
        description += ' Limite diário atingido.';
      }

      // Decidir qual botão mostrar (prioridade: Usar créditos > Feedback)
      let toastAction;
      if (userId && newBalance && newBalance > 0) {
        // Mostrar botão "Usar créditos" se tem créditos
        toastAction = (
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate('/criar-jogo')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-4 w-4 mr-1" />
            Usar créditos
          </Button>
        );
      } else if (canShowFeedback) {
        // Mostrar botão de feedback se pode
        toastAction = (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              dispatchFeedbackEvent('post-share', 'suggestion');
              markFeedbackToastShown();
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Feedback
          </Button>
        );
      }

      toast({
        title: `🎉 Compartilhado com sucesso!`,
        description,
        duration: toastAction ? 8000 : 5000, // Mais tempo se tem botão
        action: toastAction,
      });

      // Marcar que mostrou toast (se mostrou o botão)
      if (canShowFeedback) {
        console.log('📢 Toast de feedback exibido (pós-compartilhamento)');
      }

      // Callback de sucesso
      onShareSuccess?.(credits);

      console.log(`✅ Share concluído: ${context} (+${credits} créditos)`);
    } catch (error) {
      console.error('❌ Erro ao compartilhar:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao compartilhar',
        description: 'Não foi possível completar o compartilhamento. Tente novamente.',
      });
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Animação confetti
   */
  const triggerConfetti = (intense: boolean) => {
    if (intense) {
      // Confetti intenso para momentos especiais
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#34d399'],
        });
      }, 100);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#34d399'],
        });
      }, 200);
    } else {
      // Confetti normal
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }
  };

  /**
   * Chama backend para conceder créditos (com retry)
   */
  const awardShareCredits = async (credits: number): Promise<void> => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { callEdgeFunctionWithRetry } = await import('@/utils/edgeFunctionRetry');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.warn('⚠️ Usuário não autenticado - créditos não concedidos');
        return;
      }

      const response = await callEdgeFunctionWithRetry(
        supabase,
        'share-reward',
        { credits },
        { maxAttempts: 2 }
      );

      if (response.error) {
        throw response.error;
      }

      console.log(`🎁 Backend: +${credits} créditos concedidos`, response.data);
    } catch (error) {
      console.error('❌ Erro ao conceder créditos no backend:', error);
      // Não bloqueia o fluxo - share foi registrado localmente
    }
  };

  // Calcular créditos para exibição
  const creditsToEarn = calculateShareCredits(context, data);
  const remaining = getRemainingShares();
  const canShare = canShareToday();

  // Variantes visuais
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all',
    secondary: 'border-emerald-500 text-emerald-600 hover:bg-emerald-50',
    ghost: 'text-emerald-600 hover:bg-emerald-50',
  };

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing || !canShare}
      variant={variant === 'primary' ? 'default' : variant === 'secondary' ? 'outline' : 'ghost'}
      size={size}
      className={`gap-2 ${variant === 'primary' ? variantClasses.primary : ''} ${
        variant === 'secondary' ? variantClasses.secondary : ''
      } ${variant === 'ghost' ? variantClasses.ghost : ''} ${className}`}
    >
      <Share2 className="h-4 w-4" />
      <span>{isSharing ? 'Compartilhando...' : label}</span>
      {showCredits && !isSharing && canShare && (
        <span className="flex items-center gap-1 text-xs opacity-90">
          <Sparkles className="h-3 w-3" />+{creditsToEarn}
        </span>
      )}
      {!canShare && !isSharing && (
        <span className="text-xs opacity-70">(Limite diário atingido)</span>
      )}
    </Button>
  );
}
