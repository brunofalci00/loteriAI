/**
 * Feedback Service
 *
 * Serviço para gerenciar feedback de usuários:
 * - Submeter feedback
 * - Listar próprio feedback
 * - Buscar estatísticas
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { supabase } from '@/integrations/supabase/client';
import { callEdgeFunctionWithRetry } from '@/utils/edgeFunctionRetry';

export interface SubmitFeedbackParams {
  type: 'suggestion' | 'bug' | 'praise';
  category?: string;
  title?: string;
  content: string;
  context: 'general' | 'post-generation' | 'post-share' | 'post-save' | 'header' | 'mobile-menu' | 'fab';
  pageUrl: string;
}

export interface Feedback {
  id: string;
  type: string;
  category: string | null;
  title: string | null;
  content: string;
  status: string;
  credit_awarded: boolean;
  upvotes: number;
  created_at: string;
  implemented_at: string | null;
}

/**
 * Submeter novo feedback
 * Concede +1 crédito se feedback > 50 caracteres
 */
export async function submitFeedback(
  params: SubmitFeedbackParams
): Promise<{
  success: boolean;
  creditAwarded?: boolean;
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Validação client-side
    if (params.content.length < 10) {
      return { success: false, error: 'Feedback muito curto (mínimo 10 caracteres)' };
    }

    // Detectar informações técnicas
    const userAgent = navigator.userAgent;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const browserInfo = {
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
    };

    // Decidir se concede crédito (>50 chars)
    const shouldAwardCredit = params.content.length >= 50 && params.type !== 'praise';

    // Inserir feedback
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: user.id,
        type: params.type,
        category: params.category || 'other',
        title: params.title,
        content: params.content,
        context: params.context,
        page_url: params.pageUrl,
        user_agent: userAgent,
        screen_resolution: screenResolution,
        browser_info: browserInfo,
        credit_awarded: shouldAwardCredit,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao submeter feedback:', error);
      return { success: false, error: error.message };
    }

    // Se deve conceder crédito, chamar edge function (com retry)
    if (shouldAwardCredit) {
      try {
        const response = await callEdgeFunctionWithRetry(
          supabase,
          'share-reward',
          { credits: 1 },
          { maxAttempts: 2 }
        );

        if (response.error) {
          console.error('⚠️ Erro ao conceder crédito:', response.error);
        }
      } catch (creditError) {
        console.error('⚠️ Erro ao conceder crédito:', creditError);
        // Não bloqueia o feedback, mas loga o erro
      }
    }

    console.log('✅ Feedback enviado:', data.id, '| Crédito:', shouldAwardCredit);

    return {
      success: true,
      creditAwarded: shouldAwardCredit,
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao submeter feedback:', error);
    return {
      success: false,
      error: 'Erro inesperado ao enviar feedback',
    };
  }
}

/**
 * Listar próprio feedback
 */
export async function listMyFeedback(): Promise<{
  success: boolean;
  data?: Feedback[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao listar feedback:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${data.length} feedbacks carregados`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao listar feedback:', error);
    return {
      success: false,
      error: 'Erro inesperado ao listar feedback',
    };
  }
}

/**
 * Buscar estatísticas de feedback do usuário
 */
export async function getFeedbackStats(): Promise<{
  success: boolean;
  data?: {
    totalFeedbacks: number;
    suggestionsCount: number;
    bugsCount: number;
    praiseCount: number;
    creditsEarned: number;
    implementedCount: number;
  };
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('feedback_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar stats:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      // Usuário ainda não enviou feedback
      return {
        success: true,
        data: {
          totalFeedbacks: 0,
          suggestionsCount: 0,
          bugsCount: 0,
          praiseCount: 0,
          creditsEarned: 0,
          implementedCount: 0,
        },
      };
    }

    return {
      success: true,
      data: {
        totalFeedbacks: data.total_feedbacks || 0,
        suggestionsCount: data.suggestions_count || 0,
        bugsCount: data.bugs_count || 0,
        praiseCount: data.praise_count || 0,
        creditsEarned: data.credits_earned || 0,
        implementedCount: data.implemented_count || 0,
      },
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar stats:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar estatísticas',
    };
  }
}
