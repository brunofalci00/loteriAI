import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePixTimerReturn {
  timeLeft: number; // Tempo restante em segundos
  formattedTime: string; // Tempo formatado "MM:SS"
  isUrgent: boolean; // Menos de 5 minutos
  isCritical: boolean; // Menos de 1 minuto
  isExpired: boolean; // Tempo expirado
  reset: (newExpiresAt?: Date) => void;
}

/**
 * Hook para gerenciar countdown timer do PIX
 * @param expiresAt - Data de expiração do PIX
 * @param onExpire - Callback quando expirar
 * @returns Estado e funções do timer
 */
export const usePixTimer = (
  expiresAt: Date,
  onExpire?: () => void
): UsePixTimerReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);

  // Atualizar ref do callback
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  /**
   * Calcula tempo restante em segundos
   */
  const calculateTimeLeft = useCallback((expirationDate: Date): number => {
    const now = new Date().getTime();
    const expiry = expirationDate.getTime();
    const diff = expiry - now;
    return Math.max(0, Math.floor(diff / 1000));
  }, []);

  /**
   * Formata segundos em MM:SS
   */
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  /**
   * Reseta o timer com nova data de expiração
   */
  const reset = useCallback((newExpiresAt?: Date) => {
    const targetDate = newExpiresAt || expiresAt;
    const newTimeLeft = calculateTimeLeft(targetDate);
    setTimeLeft(newTimeLeft);
  }, [expiresAt, calculateTimeLeft]);

  // Inicializar e atualizar timer
  useEffect(() => {
    // Calcular tempo inicial
    const initialTime = calculateTimeLeft(expiresAt);
    setTimeLeft(initialTime);

    // Limpar interval anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Criar novo interval
    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeLeft(expiresAt);
      setTimeLeft(remaining);

      // Se expirou, chamar callback e limpar interval
      if (remaining === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onExpireRef.current?.();
      }
    }, 1000);

    // Cleanup no unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [expiresAt, calculateTimeLeft]);

  const formattedTime = formatTime(timeLeft);
  const isUrgent = timeLeft > 0 && timeLeft <= 5 * 60; // Menos de 5 minutos
  const isCritical = timeLeft > 0 && timeLeft <= 60; // Menos de 1 minuto
  const isExpired = timeLeft === 0;

  return {
    timeLeft,
    formattedTime,
    isUrgent,
    isCritical,
    isExpired,
    reset,
  };
};
