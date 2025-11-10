import { useState, useEffect } from "react";
import { Coins } from "lucide-react";

interface CoinCounterProps {
  coins: number;
  delta?: number;
}

export const CoinCounter = ({ coins, delta }: CoinCounterProps) => {
  const [visibleDelta, setVisibleDelta] = useState<number | null>(null);

  useEffect(() => {
    if (!delta) return;
    setVisibleDelta(delta);
    const timer = setTimeout(() => setVisibleDelta(null), 1200);
    return () => clearTimeout(timer);
  }, [delta]);

  return (
    <div className="coin-counter">
      <div className="coin-counter__icon">
        <Coins className="w-4 h-4" />
      </div>
      <div>
        <p className="coin-counter__label">Moedas</p>
        <p className="coin-counter__value">{coins}</p>
      </div>
      {visibleDelta && (
        <span className="coin-counter__delta" aria-live="polite">
          +{visibleDelta}
        </span>
      )}
    </div>
  );
};
