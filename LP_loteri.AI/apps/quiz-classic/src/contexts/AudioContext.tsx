import { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";

interface AudioContextType {
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playBackgroundMusic = useCallback(() => {
    if (!backgroundMusicRef.current) {
      const audio = new Audio("/sounds/good-luck-353353.mp3");
      audio.loop = true;
      audio.volume = 0.08;
      backgroundMusicRef.current = audio;
    }

    if (!isPlaying) {
      backgroundMusicRef.current.play().catch(() => undefined);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const pauseBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (backgroundMusicRef.current) {
      const newMutedState = !isMuted;
      backgroundMusicRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  return (
    <AudioContext.Provider
      value={{
        playBackgroundMusic,
        pauseBackgroundMusic,
        stopBackgroundMusic,
        toggleMute,
        isMuted,
        isPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
