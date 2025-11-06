/**
 * Component: FeedbackFAB (Floating Action Button)
 *
 * Botão flutuante para feedback sempre visível
 * Tier 3 - Descoberta Visual (Opcional)
 *
 * Features:
 * - Posição fixa no canto inferior direito
 * - Ícone de mensagem
 * - Animação sutil de pulse
 * - Tooltip explicativo
 * - Responsivo (esconde em mobile se necessário)
 *
 * IMPORTANTE: Este componente é OPCIONAL
 * Recomenda-se testar A/B antes de implementar em produção
 * Pode ser intrusivo em algumas UIs
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { dispatchFeedbackEvent } from '@/hooks/useFeedbackModal';

export interface FeedbackFABProps {
  /**
   * Se deve mostrar o FAB (útil para A/B testing)
   */
  show?: boolean;

  /**
   * Mostrar apenas em desktop (esconde em mobile)
   */
  desktopOnly?: boolean;
}

export function FeedbackFAB({ show = true, desktopOnly = false }: FeedbackFABProps) {
  if (!show) return null;

  const handleClick = () => {
    dispatchFeedbackEvent('fab', 'suggestion');
    console.log('💬 FAB clicado - abrindo FeedbackModal');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className={`
              fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40
              gradient-primary hover:scale-110 transition-transform
              ${desktopOnly ? 'hidden md:flex' : 'flex'}
              items-center justify-center
            `}
            size="icon"
            aria-label="Enviar feedback"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="mr-2">
          <p>Enviar feedback ou sugestão</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
