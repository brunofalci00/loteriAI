import { useState, useEffect } from "react";
import { Coins } from "lucide-react";

interface CoinCounterProps {
  coins: number;
  delta?: number;
}

export const CoinCounter = ({ coins, delta }: CoinCounterProps) => {
  const [showDelta, setShowDelta] = useState(false);

  useEffect(() => {
    if (delta && delta !== 0) {
      setShowDelta(true);
      const timer = setTimeout(() => setShowDelta(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [delta]);

  return (
    <div className="fixed top-6 right-6 max-sm:top-auto max-sm:bottom-6 max-sm:right-4 z-50 flex items-center gap-3 bg-card border-2 border-primary/30 rounded-full px-5 py-3 glow-primary">
      <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-gold animate-pulse" />
      <div className="relative">
        <span className="text-xl sm:text-2xl font-bold text-foreground">{coins}</span>
        {showDelta && delta && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-primary font-bold text-base sm:text-xl coin-pop">
            +{delta}
          </span>
        )}
      </div>
    </div>
  );
};
