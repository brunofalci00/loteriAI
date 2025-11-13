/**
 * Feedback Rate Limiting
 *
 * Sistema para controlar a frequência de sugestões contextuais de feedback.
 * Previne spam e garante boa UX.
 *
 * Regras:
 * - Máximo 1 toast contextual a cada 24 horas
 * - Menu fixo sempre disponível (sem limite)
 * - Tracking por usuário via localStorage
 *
 * @author Claude Code
 * @date 2025-01-03
 */

const LAST_TOAST_KEY = 'loter_ia_last_feedback_toast';
const COOLDOWN_HOURS = 24;

/**
 * Verifica se deve mostrar toast contextual de feedback
 * @returns true se pode mostrar, false se ainda está em cooldown
 */
export function shouldShowFeedbackToast(): boolean {
  try {
    const lastToast = localStorage.getItem(LAST_TOAST_KEY);

    if (!lastToast) {
      console.log('✅ Primeira vez - pode mostrar toast de feedback');
      return true; // Primeira vez
    }

    const lastTimestamp = parseInt(lastToast, 10);
    const hoursSince = (Date.now() - lastTimestamp) / (1000 * 60 * 60);

    const canShow = hoursSince >= COOLDOWN_HOURS;

    if (canShow) {
      console.log(`✅ ${hoursSince.toFixed(1)}h desde último toast - pode mostrar`);
    } else {
      const hoursRemaining = COOLDOWN_HOURS - hoursSince;
      console.log(`⏳ Cooldown ativo - faltam ${hoursRemaining.toFixed(1)}h`);
    }

    return canShow;
  } catch (error) {
    console.error('❌ Erro ao verificar rate limit:', error);
    return true; // Em caso de erro, permite mostrar
  }
}

/**
 * Marca que o toast contextual foi mostrado
 */
export function markFeedbackToastShown(): void {
  try {
    localStorage.setItem(LAST_TOAST_KEY, Date.now().toString());
    console.log('✅ Toast de feedback marcado como mostrado');
  } catch (error) {
    console.error('❌ Erro ao marcar toast:', error);
  }
}

/**
 * Reseta o rate limit (útil para testes)
 */
export function resetFeedbackRateLimit(): void {
  try {
    localStorage.removeItem(LAST_TOAST_KEY);
    console.log('🔄 Rate limit resetado');
  } catch (error) {
    console.error('❌ Erro ao resetar rate limit:', error);
  }
}

/**
 * Obtém informações sobre o estado do rate limit
 */
export function getFeedbackRateLimitInfo(): {
  canShow: boolean;
  lastShown: Date | null;
  hoursUntilNext: number;
} {
  try {
    const lastToast = localStorage.getItem(LAST_TOAST_KEY);

    if (!lastToast) {
      return {
        canShow: true,
        lastShown: null,
        hoursUntilNext: 0,
      };
    }

    const lastTimestamp = parseInt(lastToast, 10);
    const hoursSince = (Date.now() - lastTimestamp) / (1000 * 60 * 60);
    const canShow = hoursSince >= COOLDOWN_HOURS;
    const hoursUntilNext = canShow ? 0 : COOLDOWN_HOURS - hoursSince;

    return {
      canShow,
      lastShown: new Date(lastTimestamp),
      hoursUntilNext,
    };
  } catch (error) {
    console.error('❌ Erro ao obter info do rate limit:', error);
    return {
      canShow: true,
      lastShown: null,
      hoursUntilNext: 0,
    };
  }
}
