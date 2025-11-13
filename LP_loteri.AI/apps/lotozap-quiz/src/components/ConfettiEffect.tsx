import { type CSSProperties, useEffect, useState } from "react";

type ConfettiVariant = "standard" | "emoji-rain";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  type: "confetti" | "emoji";
  size: number;
  color: string;
  emoji?: string;
  drift: number;
}

type ConfettiStyle = CSSProperties & {
  "--confetti-drift"?: string;
};

type EmojiStyle = CSSProperties & {
  "--emoji-drift"?: string;
};

const confettiPalette = ["#34d399", "#fbbf24", "#f472b6", "#a855f7", "#f97316", "#38bdf8"];
const emojiBurst = ["🔥", "🎉", "💰", "✨", "🪙", "⚡"];

interface ConfettiEffectProps {
  trigger: boolean;
  variant?: ConfettiVariant;
}

export const ConfettiEffect = ({ trigger, variant = "standard" }: ConfettiEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const isEmojiVariant = variant === "emoji-rain";
    const totalParticles = isEmojiVariant ? 90 : 50;

    const newParticles: Particle[] = Array.from({ length: totalParticles }, (_, index) => {
      const isEmoji = isEmojiVariant && index % 3 === 0;
      return {
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * (isEmojiVariant ? 1.2 : 0.6),
        duration: (isEmojiVariant ? 3.2 : 2.2) + Math.random() * (isEmojiVariant ? 1.5 : 1),
        type: isEmoji ? "emoji" : "confetti",
        size: isEmoji ? 22 + Math.random() * 14 : 6 + Math.random() * 5,
        color: confettiPalette[index % confettiPalette.length],
        emoji: isEmoji ? emojiBurst[index % emojiBurst.length] : undefined,
        drift: (Math.random() - 0.5) * (isEmojiVariant ? 140 : 70),
      };
    });

    setParticles(newParticles);
    const cleanup = setTimeout(() => setParticles([]), isEmojiVariant ? 4800 : 3200);
    return () => clearTimeout(cleanup);
  }, [trigger, variant]);

  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => {
        if (particle.type === "emoji" && particle.emoji) {
          const emojiStyle: EmojiStyle = {
            left: `${particle.left}%`,
            top: "-12px",
            fontSize: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            animationTimingFunction: "ease-in-out",
            animationFillMode: "forwards",
            animationName: "emojiFall",
            "--emoji-drift": `${particle.drift}px`,
          };
          return (
            <span key={particle.id} className="absolute emoji-shower" style={emojiStyle} aria-hidden="true">
              {particle.emoji}
            </span>
          );
        }

        const confettiStyle: ConfettiStyle = {
          left: `${particle.left}%`,
          top: "-16px",
          width: `${particle.size}px`,
          height: `${particle.size * 0.7}px`,
          borderRadius: "4px",
          backgroundColor: particle.color,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`,
          animationTimingFunction: "linear",
          animationFillMode: "forwards",
          animationName: "confettiFall",
          "--confetti-drift": `${particle.drift}px`,
        };

        return <span key={particle.id} className="absolute confetti-piece" style={confettiStyle} aria-hidden="true" />;
      })}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--confetti-drift, 0px), 110vh, 0) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes emojiFall {
          0% {
            transform: translate3d(0, -10vh, 0) scale(0.9) rotate(-12deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          60% {
            transform: translate3d(calc(var(--emoji-drift, 0px) * 0.6), 60vh, 0) scale(1.08) rotate(16deg);
          }
          100% {
            transform: translate3d(var(--emoji-drift, 0px), 115vh, 0) scale(0.85) rotate(-8deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
