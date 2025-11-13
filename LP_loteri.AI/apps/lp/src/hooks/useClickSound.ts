import { useCallback, useRef } from 'react';

/**
 * Hook para reproduzir som de clique ao selecionar números
 * Som sutil com volume baixo para não irritar o usuário
 */
export function useClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar áudio apenas quando necessário (lazy load)
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/start-13691.mp3');
      audioRef.current.volume = 0.4; // Volume baixo (0.3-0.5 recomendado)
    }
  }, []);

  /**
   * Reproduz som de clique
   * Reinicia áudio se já estiver tocando (permite múltiplos clicks rápidos)
   */
  const playClick = useCallback(() => {
    try {
      initAudio();

      if (audioRef.current) {
        // Reiniciar áudio se já estiver tocando
        audioRef.current.currentTime = 0;

        // Play com promise para lidar com erros de autoplay
        audioRef.current.play().catch((error) => {
          // Silenciosamente ignorar erros de autoplay (algumas políticas de browser)
          console.debug('Audio autoplay prevented:', error);
        });
      }
    } catch (error) {
      // Falhar silenciosamente - som é enhancement, não feature crítica
      console.debug('Error playing click sound:', error);
    }
  }, [initAudio]);

  return { playClick };
}
