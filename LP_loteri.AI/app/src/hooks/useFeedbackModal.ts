/**
 * Global Feedback Modal Hook
 *
 * Hook para gerenciar o estado do FeedbackModal globalmente.
 * Permite que qualquer componente abra o modal via eventos customizados.
 *
 * Uso:
 * 1. No componente raiz (Header): const { open, context, handleOpen, handleClose } = useFeedbackModal()
 * 2. Em qualquer componente: dispatchFeedbackEvent('post-share')
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState, useEffect } from 'react';

export type FeedbackContext =
  | 'general'
  | 'post-generation'
  | 'post-share'
  | 'post-save'
  | 'header'
  | 'mobile-menu'
  | 'fab';

export type FeedbackTab = 'suggestion' | 'bug' | 'praise';

interface FeedbackEventDetail {
  context?: FeedbackContext;
  defaultTab?: FeedbackTab;
}

/**
 * Hook para gerenciar o FeedbackModal globalmente
 */
export function useFeedbackModal() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<FeedbackContext>('general');
  const [defaultTab, setDefaultTab] = useState<FeedbackTab>('suggestion');

  useEffect(() => {
    const handleFeedbackEvent = (event: Event) => {
      const customEvent = event as CustomEvent<FeedbackEventDetail>;
      const detail = customEvent.detail || {};

      console.log('📢 Evento de feedback recebido:', detail);

      setContext(detail.context || 'general');
      setDefaultTab(detail.defaultTab || 'suggestion');
      setOpen(true);
    };

    // Escutar evento customizado
    window.addEventListener('open-feedback', handleFeedbackEvent);

    return () => {
      window.removeEventListener('open-feedback', handleFeedbackEvent);
    };
  }, []);

  const handleOpen = (ctx: FeedbackContext = 'general', tab: FeedbackTab = 'suggestion') => {
    setContext(ctx);
    setDefaultTab(tab);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return {
    open,
    context,
    defaultTab,
    handleOpen,
    handleClose,
  };
}

/**
 * Utility: Disparar evento global para abrir FeedbackModal
 * @param context - Contexto de onde vem o feedback
 * @param defaultTab - Tab padrão a abrir (sugestão, bug, elogio)
 */
export function dispatchFeedbackEvent(
  context: FeedbackContext = 'general',
  defaultTab: FeedbackTab = 'suggestion'
): void {
  const event = new CustomEvent<FeedbackEventDetail>('open-feedback', {
    detail: { context, defaultTab },
  });
  window.dispatchEvent(event);
  console.log('🚀 Disparado evento de feedback:', { context, defaultTab });
}
