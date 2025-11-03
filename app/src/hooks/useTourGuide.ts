/**
 * Hook: useWelcomeGuide
 *
 * Gerencia o estado do guia de boas-vindas para novos usuários
 * - Verifica se usuário já viu o guia (has_seen_manual_creation_tour)
 * - Controla abertura/fechamento do modal
 * - Marca guia como visto no banco de dados
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useWelcomeGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(true); // Default true para não mostrar até verificar

  // Verificar se usuário já viu o guia
  useEffect(() => {
    const checkGuideStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('has_seen_manual_creation_tour')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        const seen = data.has_seen_manual_creation_tour || false;
        setHasSeenGuide(seen);
        if (!seen) {
          // Delay pequeno para garantir que a página carregou
          setTimeout(() => setIsOpen(true), 500);
        }
      }
    };

    checkGuideStatus();
  }, []);

  // Marcar guia como visto
  const markAsComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ has_seen_manual_creation_tour: true })
      .eq('id', user.id);

    setHasSeenGuide(true);
    setIsOpen(false);
  };

  const skip = () => {
    markAsComplete();
  };

  return {
    isOpen,
    hasSeenGuide,
    markAsComplete,
    skip,
  };
}
