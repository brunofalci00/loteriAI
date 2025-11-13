import { useEffect, useRef } from "react";

interface UseSoundEffectOptions {
  autoplay?: boolean;
  loop?: boolean;
  playbackRate?: number;
  volume?: number;
}

/**
 * Small utility hook to orchestrate casino-like audio loops without repeating boilerplate.
 * Returns the underlying audio ref so callers can trigger play/pause manually if needed.
 */
export function useSoundEffect(src: string | null, options: UseSoundEffectOptions = {}) {
  const { autoplay = true, loop = false, playbackRate = 1, volume = 0.1 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    if (autoplay) {
      audio.play().catch(() => undefined);
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [autoplay, loop, playbackRate, src, volume]);

  return audioRef;
}
