/**
 * Utility: Edge Function Retry
 *
 * Helper para chamar Edge Functions com retry automático
 * Melhora confiabilidade em redes instáveis
 *
 * Features:
 * - Retry automático em caso de falha de rede
 * - Exponential backoff
 * - Logging detalhado
 * - Type-safe
 *
 * @author Claude Code
 * @date 2025-01-04
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface RetryOptions {
  /**
   * Número máximo de tentativas (padrão: 2)
   */
  maxAttempts?: number;

  /**
   * Delay inicial entre tentativas em ms (padrão: 1000)
   */
  initialDelay?: number;

  /**
   * Multiplicador para exponential backoff (padrão: 2)
   */
  backoffMultiplier?: number;

  /**
   * Se deve fazer retry em erros específicos (padrão: apenas network errors)
   */
  shouldRetry?: (error: any) => boolean;
}

export interface EdgeFunctionResponse<T = any> {
  data: T | null;
  error: any;
}

/**
 * Verifica se o erro é de rede (deve fazer retry)
 */
function isNetworkError(error: any): boolean {
  if (!error) return false;

  // Erros de rede comuns
  const networkErrorPatterns = [
    'network',
    'fetch',
    'timeout',
    'connection',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'Failed to fetch'
  ];

  const errorString = String(error?.message || error).toLowerCase();

  return networkErrorPatterns.some(pattern =>
    errorString.includes(pattern.toLowerCase())
  );
}

/**
 * Sleep helper para delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chama Edge Function com retry automático
 *
 * @param supabase - Cliente Supabase
 * @param functionName - Nome da Edge Function
 * @param body - Payload para enviar
 * @param options - Opções de retry
 * @returns Resposta da Edge Function
 *
 * @example
 * ```typescript
 * const result = await callEdgeFunctionWithRetry(
 *   supabase,
 *   'share-reward',
 *   { credits: 2 },
 *   { maxAttempts: 3 }
 * );
 *
 * if (result.error) {
 *   console.error('Falha após 3 tentativas:', result.error);
 * } else {
 *   console.log('Sucesso:', result.data);
 * }
 * ```
 */
export async function callEdgeFunctionWithRetry<T = any>(
  supabase: SupabaseClient,
  functionName: string,
  body?: any,
  options: RetryOptions = {}
): Promise<EdgeFunctionResponse<T>> {
  const {
    maxAttempts = 2,
    initialDelay = 1000,
    backoffMultiplier = 2,
    shouldRetry = isNetworkError
  } = options;

  let lastError: any = null;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `🔄 [Edge Function] Chamando "${functionName}" (tentativa ${attempt}/${maxAttempts})...`
      );

      const response = await supabase.functions.invoke<T>(functionName, {
        body
      });

      // Sucesso
      if (!response.error) {
        if (attempt > 1) {
          console.log(
            `✅ [Edge Function] "${functionName}" sucesso após ${attempt} tentativas`
          );
        } else {
          console.log(`✅ [Edge Function] "${functionName}" sucesso`);
        }

        return response;
      }

      // Houve erro, mas a chamada foi feita
      lastError = response.error;

      // Verificar se deve fazer retry
      if (attempt < maxAttempts && shouldRetry(response.error)) {
        console.warn(
          `⚠️ [Edge Function] "${functionName}" falhou (tentativa ${attempt}/${maxAttempts}). Retrying em ${delay}ms...`,
          response.error
        );

        await sleep(delay);
        delay *= backoffMultiplier;
        continue;
      }

      // Não deve fazer retry ou é a última tentativa
      console.error(
        `❌ [Edge Function] "${functionName}" erro final após ${attempt} tentativa(s):`,
        response.error
      );

      return response;

    } catch (error: any) {
      lastError = error;

      // Erro na chamada em si (network error, etc)
      if (attempt < maxAttempts && shouldRetry(error)) {
        console.warn(
          `⚠️ [Edge Function] "${functionName}" exceção na tentativa ${attempt}/${maxAttempts}. Retrying em ${delay}ms...`,
          error
        );

        await sleep(delay);
        delay *= backoffMultiplier;
        continue;
      }

      // Não deve fazer retry ou é a última tentativa
      console.error(
        `❌ [Edge Function] "${functionName}" exceção final após ${attempt} tentativa(s):`,
        error
      );

      return {
        data: null,
        error: error
      };
    }
  }

  // Não deveria chegar aqui, mas por segurança
  return {
    data: null,
    error: lastError || new Error('Falha após todas as tentativas')
  };
}

/**
 * Variante simplificada que lança exceção em caso de erro
 * Útil quando você quer que o erro seja propagado
 *
 * @throws {Error} Se todas as tentativas falharem
 */
export async function callEdgeFunctionWithRetryOrThrow<T = any>(
  supabase: SupabaseClient,
  functionName: string,
  body?: any,
  options: RetryOptions = {}
): Promise<T> {
  const response = await callEdgeFunctionWithRetry<T>(
    supabase,
    functionName,
    body,
    options
  );

  if (response.error) {
    throw response.error;
  }

  return response.data as T;
}
