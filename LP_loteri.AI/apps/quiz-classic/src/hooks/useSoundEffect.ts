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
    audio.preload = "auto";
    audioRef.current = audio;

    if (autoplay) {
      // Try to play with better mobile support
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Mobile browsers often block autoplay until user interaction
          // The audio ref is still available for manual play
        });
      }
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [autoplay, loop, playbackRate, src, volume]);

  return audioRef;
}
