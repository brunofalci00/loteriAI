/**
 * Share Tracking Service
 *
 * Gerencia tracking de compartilhamentos:
 * - Analytics (GA4/Mixpanel)
 * - Limite diário (5 shares/dia)
 * - Histórico de shares
 * - Validações
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import type { ShareContext, ShareEventData } from '@/types/share';

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  mixpanel?: {
    track: (event: string, data?: Record<string, unknown>) => void;
  };
};

const STORAGE_KEY = 'loter_ia_shares';
const MAX_DAILY_SHARES = 5;

export interface ShareEvent {
  context: ShareContext;
  timestamp: string;
  method: 'whatsapp';
  creditAwarded: number;
  data?: ShareEventData;
}

interface ShareHistory {
  shares: ShareEvent[];
  lastResetDate: string; // ISO date string
}

/**
 * Obtém histórico de shares do localStorage
 */
function getShareHistory(): ShareHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        shares: [],
        lastResetDate: new Date().toISOString().split('T')[0],
      };
    }

    const history: ShareHistory = JSON.parse(stored);

    // Verificar se precisa resetar (novo dia)
    const today = new Date().toISOString().split('T')[0];
    if (history.lastResetDate !== today) {
      return {
        shares: [],
        lastResetDate: today,
      };
    }

    return history;
  } catch (error) {
    console.error('❌ Erro ao ler histórico de shares:', error);
    return {
      shares: [],
      lastResetDate: new Date().toISOString().split('T')[0],
    };
  }
}

/**
 * Salva histórico de shares no localStorage
 */
function saveShareHistory(history: ShareHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('❌ Erro ao salvar histórico de shares:', error);
  }
}

/**
 * Verifica quantos shares foram feitos hoje
 */
export function getTodayShareCount(): number {
  const history = getShareHistory();
  return history.shares.length;
}

/**
 * Verifica se usuário pode compartilhar (limite 5/dia)
 */
export function canShareToday(): boolean {
  const count = getTodayShareCount();
  return count < MAX_DAILY_SHARES;
}

/**
 * Verifica quantos shares restam hoje
 */
export function getRemainingShares(): number {
  const count = getTodayShareCount();
  return Math.max(MAX_DAILY_SHARES - count, 0);
}

/**
 * Verifica se é o primeiro share do usuário (ever)
 */
export function isFirstShareEver(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;

    const history: ShareHistory = JSON.parse(stored);
    return history.shares.length === 0;
  } catch {
    return true;
  }
}

/**
 * Calcula créditos a serem concedidos por um share
 * - Primeiro share ever: +2 créditos
 * - Score 4.5+: +3 créditos
 * - Share normal: +1 crédito
 */
export function calculateShareCredits(
  context: ShareEvent['context'],
  data?: ShareEvent['data']
): number {
  // Primeiro share ever: bônus
  if (isFirstShareEver()) {
    return 2;
  }

  // Score excepcional (4.5+): bônus extra
  if (context === 'score' && data?.score && data.score >= 4.5) {
    return 3;
  }

  // Share normal
  return 1;
}

/**
 * Registra um novo share
 * Retorna número de créditos concedidos
 */
export function recordShare(
  context: ShareEvent['context'],
  data?: ShareEvent['data']
): number {
  const history = getShareHistory();

  const credits = calculateShareCredits(context, data);

  const event: ShareEvent = {
    context,
    timestamp: new Date().toISOString(),
    method: 'whatsapp',
    creditAwarded: credits,
    data,
  };

  history.shares.push(event);
  saveShareHistory(history);

  // Track analytics
  trackShareEvent(event);

  console.log(`✅ Share registrado: ${context} (+${credits} créditos)`);

  return credits;
}

/**
 * Envia evento de share para analytics
 * Suporta GA4 e Mixpanel
 */
function trackShareEvent(event: ShareEvent): void {
  try {
    if (typeof window !== 'undefined') {
      const analyticsWindow = window as AnalyticsWindow;

      // Google Analytics 4
      if (typeof analyticsWindow.gtag === 'function') {
        analyticsWindow.gtag('event', 'share', {
          method: event.method,
          content_type: 'lottery_game',
          item_id: event.context,
          credits_awarded: event.creditAwarded,
          ...event.data,
        });
      }

      // Mixpanel (se disponível)
      if (analyticsWindow.mixpanel) {
        analyticsWindow.mixpanel.track('Share', {
          context: event.context,
          method: event.method,
          credits_awarded: event.creditAwarded,
          ...event.data,
        });
      }
    }

    console.log('📊 Analytics: Share event tracked', event.context);
  } catch (error) {
    console.error('❌ Erro ao enviar analytics:', error);
  }
}

/**
 * Obtém estatísticas de shares do usuário
 */
export function getShareStats(): {
  totalShares: number;
  todayShares: number;
  remainingToday: number;
  totalCreditsEarned: number;
  sharesByContext: Record<string, number>;
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        totalShares: 0,
        todayShares: 0,
        remainingToday: MAX_DAILY_SHARES,
        totalCreditsEarned: 0,
        sharesByContext: {},
      };
    }

    const history: ShareHistory = JSON.parse(stored);
    const today = new Date().toISOString().split('T')[0];
    const isToday = history.lastResetDate === today;

    const todayShares = isToday ? history.shares.length : 0;

    // Contar shares por contexto
    const sharesByContext: Record<string, number> = {};
    history.shares.forEach((share) => {
      sharesByContext[share.context] = (sharesByContext[share.context] || 0) + 1;
    });

    // Calcular total de créditos ganhos hoje
    const totalCreditsEarned = history.shares.reduce(
      (sum, share) => sum + share.creditAwarded,
      0
    );

    return {
      totalShares: history.shares.length,
      todayShares,
      remainingToday: Math.max(MAX_DAILY_SHARES - todayShares, 0),
      totalCreditsEarned,
      sharesByContext,
    };
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    return {
      totalShares: 0,
      todayShares: 0,
      remainingToday: MAX_DAILY_SHARES,
      totalCreditsEarned: 0,
      sharesByContext: {},
    };
  }
}

/**
 * Limpa histórico de shares (apenas para debug/testes)
 */
export function clearShareHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Histórico de shares limpo');
}
