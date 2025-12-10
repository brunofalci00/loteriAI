import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  BuckCreateTransactionRequest,
  BuckTransactionResponse,
  BuckPaymentStatus,
  BuckErrorResponse,
} from '@/types/buck-api.types';
import type { PixFormData } from '@/types/checkout.types';

const BUCK_API_URL = import.meta.env.VITE_BUCK_API_URL || 'https://api.realtechdev.com.br';
const BUCK_API_KEY = import.meta.env.VITE_BUCK_API_KEY;
const BUCK_USER_AGENT = import.meta.env.VITE_BUCK_USER_AGENT || 'Buckpay API';

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

  // Cleanup de timers no unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
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

        const requestBody: BuckCreateTransactionRequest = {
          external_id: externalId,
          payment_method: 'pix',
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

        console.log('[BuckAPI] Criando transação PIX:', {
          external_id: externalId,
          amount: config.amount,
          buyer_email: formData.email,
        });

        const data = await fetchWithRetry<BuckTransactionResponse>(
          () =>
            fetch(`${BUCK_API_URL}/v1/transactions`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${BUCK_API_KEY}`,
                'User-Agent': BUCK_USER_AGENT,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }),
          3,
          1000
        );

        if (!data.data?.pix) {
          throw new Error('Resposta da API não contém dados do PIX');
        }

        // Salvar no sessionStorage para idempotência
        sessionStorage.setItem('buck_pix_transaction_id', externalId);
        sessionStorage.setItem('buck_pix_created_at', new Date().toISOString());

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        console.log('[BuckAPI] Transação criada com sucesso:', {
          transaction_id: data.data.id,
          external_id: externalId,
          status: data.data.status,
        });

        return {
          transactionId: data.data.id,
          externalId,
          qrCodeBase64: data.data.pix.qrcode_base64,
          pixCode: data.data.pix.code,
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
        const data = await fetchWithRetry<BuckTransactionResponse>(
          () =>
            fetch(`${BUCK_API_URL}/v1/transactions/external_id/${externalId}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${BUCK_API_KEY}`,
                'User-Agent': BUCK_USER_AGENT,
              },
            }),
          2,
          500
        );

        return data.data.status;
      } catch (err) {
        console.error('[BuckAPI] Erro ao verificar status:', err);
        return 'pending';
      }
    },
    []
  );

  /**
   * Inicia polling para verificar status do pagamento
   */
  const startPolling = useCallback(
    (externalId: string, onPaid: () => void, onExpired: () => void) => {
      // Limpar polling anterior
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }

      setIsPolling(true);
      console.log('[BuckAPI] Iniciando polling para:', externalId);

      // Polling a cada 5 segundos
      pollingIntervalRef.current = setInterval(async () => {
        const status = await checkPaymentStatus(externalId);
        console.log('[BuckAPI] Status do pagamento:', status);

        if (status === 'paid') {
          stopPolling();
          // Limpar sessionStorage
          sessionStorage.removeItem('buck_pix_transaction_id');
          sessionStorage.removeItem('buck_pix_created_at');
          onPaid();
        } else if (status === 'failed' || status === 'expired') {
          stopPolling();
          sessionStorage.removeItem('buck_pix_transaction_id');
          sessionStorage.removeItem('buck_pix_created_at');
          onExpired();
        }
      }, 5000);

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
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
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
