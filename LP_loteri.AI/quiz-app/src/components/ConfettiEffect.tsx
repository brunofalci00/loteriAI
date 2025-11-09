import { useEffect, useState } from "react";

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export const ConfettiEffect = ({ trigger }: { trigger: boolean }) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    if (trigger) {
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
      }));
      setConfetti(newConfetti);

      const timer = setTimeout(() => setConfetti([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!confetti.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((conf) => (
        <div
          key={conf.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${conf.left}%`,
            top: "-10px",
            backgroundColor: Math.random() > 0.5 ? "hsl(var(--primary))" : "hsl(var(--gold))",
            animation: `fall ${conf.duration}s linear ${conf.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
