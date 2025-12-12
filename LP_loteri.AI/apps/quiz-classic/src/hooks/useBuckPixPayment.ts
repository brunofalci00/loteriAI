import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  BuckCreateTransactionRequest,
  BuckTransactionResponse,
  BuckPaymentStatus,
  BuckErrorResponse,
} from '@/types/buck-api.types';
import type { PixFormData } from '@/types/checkout.types';

// Supabase Edge Function endpoint (não mais Buck API direta!)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aaqthgqsuhyagsrlnyqk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface PixPaymentResponse {
  transactionId: string;
  externalId: string;
  qrCodeBase64: string;
  pixCode: string;
  expiresAt: Date;
  status: BuckPaymentStatus;
}

interface UseBuckPixPaymentReturn {
  createPixPayment: (formData: PixFormData, config: {
    amount: number;
    productName: string;
    offerName: string;
  }) => Promise<PixPaymentResponse>;
  checkPaymentStatus: (externalId: string) => Promise<BuckPaymentStatus>;
  startPolling: (externalId: string, onPaid: () => void, onExpired: () => void) => void;
  stopPolling: () => void;
  isCreating: boolean;
  isPolling: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook para integração com Buck API
 * Gerencia criação de pagamento PIX, verificação de status e polling
 */
export const useBuckPixPayment = (): UseBuckPixPaymentReturn => {
  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef<number>(0);

  // Cleanup de timers no unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Gera um external_id único para a transação
   */
  const generateExternalId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `quiz-${timestamp}-${random}`;
  };

  /**
   * Captura UTMs da URL atual
   */
  const captureUTMs = () => {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    return {
      ref: urlParams.get('ref') || undefined,
      src: urlParams.get('src') || undefined,
      sck: urlParams.get('sck') || undefined,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_id: urlParams.get('utm_id') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
    };
  };

  /**
   * Fetch com retry logic
   */
  const fetchWithRetry = async <T>(
    fn: () => Promise<Response>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fn();

        if (!response.ok) {
          const errorData: BuckErrorResponse = await response.json();
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        if (i === maxRetries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    throw new Error('Max retries reached');
  };

  /**
   * Cria uma transação PIX na Buck API
   */
  const createPixPayment = useCallback(
    async (
      formData: PixFormData,
      config: { amount: number; productName: string; offerName: string }
    ): Promise<PixPaymentResponse> => {
      setIsCreating(true);
      setError(null);

      try {
        // Verificar se já existe uma transação ativa
        const existingExternalId = sessionStorage.getItem('buck_pix_transaction_id');
        const existingCreatedAt = sessionStorage.getItem('buck_pix_created_at');

        if (existingExternalId && existingCreatedAt) {
          const elapsed = Date.now() - new Date(existingCreatedAt).getTime();
          const fifteenMinutes = 15 * 60 * 1000;

          // Se ainda não expirou, retornar erro
          if (elapsed < fifteenMinutes) {
            throw new Error(
              'Já existe uma transação PIX ativa. Aguarde a conclusão ou expiração.'
            );
          }

          // Expirou, limpar
          sessionStorage.removeItem('buck_pix_transaction_id');
          sessionStorage.removeItem('buck_pix_created_at');
        }

        const externalId = generateExternalId();
        const tracking = captureUTMs();

        const requestBody = {
          action: 'create',
          external_id: externalId,
          amount: config.amount,
          buyer: {
            name: formData.name,
            email: formData.email,
            document: formData.document, // Já vem sem formatação do zod
            phone: formData.phone, // Já vem sem formatação do zod
          },
          product: {
            name: config.productName,
            quantity: 1,
          },
          offer: {
            name: config.offerName,
            discount_price: config.amount,
            quantity: 1,
          },
          tracking,
        };

        console.log('[BuckAPI] Criando transação PIX via Edge Function:', {
          external_id: externalId,
          amount: config.amount,
          buyer_email: formData.email,
        });

        const data = await fetchWithRetry<any>(
          () =>
            fetch(`${SUPABASE_URL}/functions/v1/buckpay-pix-loteria`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY || '',
              },
              body: JSON.stringify(requestBody),
            }),
          3,
          1000
        );

        if (!data.success || !data.data) {
          throw new Error('Resposta do edge function inválida');
        }

        if (!data.data.qrcode_base64 || !data.data.pix_code) {
          throw new Error('Resposta não contém dados do PIX');
        }

        // Salvar no sessionStorage para idempotência
        sessionStorage.setItem('buck_pix_transaction_id', externalId);
        sessionStorage.setItem('buck_pix_created_at', new Date().toISOString());

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        console.log('[BuckAPI] Transação criada com sucesso:', {
          transaction_id: data.data.transaction_id,
          external_id: data.data.external_id,
          status: data.data.status,
        });

        return {
          transactionId: data.data.transaction_id,
          externalId: data.data.external_id,
          qrCodeBase64: data.data.qrcode_base64,
          pixCode: data.data.pix_code,
          expiresAt,
          status: data.data.status,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro ao criar pagamento PIX');
        setError(error);
        console.error('[BuckAPI] Erro ao criar transação:', error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  /**
   * Verifica o status de um pagamento
   */
  const checkPaymentStatus = useCallback(
    async (externalId: string): Promise<BuckPaymentStatus> => {
      try {
        const data = await fetchWithRetry<any>(
          () =>
            fetch(`${SUPABASE_URL}/functions/v1/buckpay-pix-loteria`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY || '',
              },
              body: JSON.stringify({
                action: 'status',
                external_id: externalId,
              }),
            }),
          2,
          500
        );

        return data.status || 'pending';
      } catch (err) {
        console.error('[BuckAPI] Erro ao verificar status:', err);
        return 'pending';
      }
    },
    []
  );

  /**
   * Calcula o intervalo de polling com exponential backoff
   * 5s -> 10s -> 20s -> 30s (máximo)
   */
  const getPollingInterval = (attempt: number): number => {
    const intervals = [5000, 10000, 20000, 30000];
    return intervals[Math.min(attempt, intervals.length - 1)];
  };

  /**
   * Inicia polling para verificar status do pagamento com exponential backoff
   */
  const startPolling = useCallback(
    (externalId: string, onPaid: () => void, onExpired: () => void) => {
      // Limpar polling anterior
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }

      setIsPolling(true);
      pollingAttemptsRef.current = 0;
      console.log('[BuckAPI] Iniciando polling para:', externalId);

      // Função recursiva de polling com backoff
      const poll = async () => {
        const status = await checkPaymentStatus(externalId);
        console.log('[BuckAPI] Status do pagamento:', status, `(tentativa ${pollingAttemptsRef.current + 1})`);

        if (status === 'paid') {
          stopPolling();
          // Limpar sessionStorage
          sessionStorage.removeItem('buck_pix_transaction_id');
          sessionStorage.removeItem('buck_pix_created_at');
          onPaid();
          return;
        }

        if (status === 'failed' || status === 'expired') {
          stopPolling();
          sessionStorage.removeItem('buck_pix_transaction_id');
          sessionStorage.removeItem('buck_pix_created_at');
          onExpired();
          return;
        }

        // Agendar próxima verificação com backoff
        const nextInterval = getPollingInterval(pollingAttemptsRef.current);
        pollingAttemptsRef.current += 1;
        console.log(`[BuckAPI] Próxima verificação em ${nextInterval / 1000}s`);
        pollingIntervalRef.current = setTimeout(poll, nextInterval);
      };

      // Primeira verificação imediata
      poll();

      // Timeout de 15 minutos
      pollingTimeoutRef.current = setTimeout(() => {
        stopPolling();
        sessionStorage.removeItem('buck_pix_transaction_id');
        sessionStorage.removeItem('buck_pix_created_at');
        onExpired();
      }, 15 * 60 * 1000);
    },
    [checkPaymentStatus]
  );

  /**
   * Para o polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    pollingAttemptsRef.current = 0;
    setIsPolling(false);
    console.log('[BuckAPI] Polling parado');
  }, []);

  /**
   * Reseta o estado do hook
   */
  const reset = useCallback(() => {
    stopPolling();
    setError(null);
    setIsCreating(false);
  }, [stopPolling]);

  return {
    createPixPayment,
    checkPaymentStatus,
    startPolling,
    stopPolling,
    isCreating,
    isPolling,
    error,
    reset,
  };
};
