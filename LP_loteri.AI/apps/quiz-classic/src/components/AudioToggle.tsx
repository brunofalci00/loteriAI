import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";

export const AudioToggle = () => {
  const { toggleMute, isMuted, isPlaying } = useAudio();

  if (!isPlaying) return null;

  return (
    <Button
      onClick={toggleMute}
      size="icon"
      variant="outline"
      className="fixed top-4 right-4 z-50 rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/20 shadow-lg"
      aria-label={isMuted ? "Ativar som" : "Desativar som"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary" />
      )}
    </Button>
  );
};
