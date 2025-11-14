import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackPixelEvent } from "@/lib/analytics";

interface QuizSlideProps {
  onNext: () => void;
  onCoinsEarned: (amount: number) => void;
}

const questions = [
  {
    question: "Quando você joga na Mega-Sena, o que mais te incomoda?",
    options: [
      "Jogar sem saber se estou no caminho certo",
      "Apostar várias vezes e nunca passar da quadra",
      "Ver os outros falando que usam sistema e eu aqui tentando na raça",
    ],
  },
  {
    question: 'Quantas vezes você achou que "faltou pouco"?',
    options: [
      "Sempre. 1 ou 2 números me perseguem",
      "Em quase todo jogo fico por um triz",
      "Nunca passei da quadra. Já tô desacreditado",
    ],
  },
  {
    question: "Como escolhe seus jogos hoje?",
    options: [
      "Sigo minha intuição. Sinto quando vai dar certo",
      "Vou por datas, palpites, sensação",
      "Eu nem penso muito. Só jogo e espero",
    ],
  },
  {
    question: "E se pudesse testar seu palpite contra uma IA treinada?",
    options: [
      "Toparia agora. Quero ver no que dá",
      "Seria bom ver se tá tão errado assim",
      "Talvez... mas acho que ela ganharia fácil",
    ],
  },
  {
    question: "O que você mais quer resolver hoje?",
    options: [
      "Parar de jogar no escuro",
      "Descobrir se meu jeito funciona ou não",
      "Usar algo que dê vantagem real",
    ],
  },
];

const COINS_PER_ANSWER = 10;
const TOTAL_COINS = questions.length * COINS_PER_ANSWER;

export const QuizSlide = ({ onNext, onCoinsEarned }: QuizSlideProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [recentGain, setRecentGain] = useState<number | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const answerSoundRef = useRef<HTMLAudioElement | null>(null);
  const bonusSoundRef = useRef<HTMLAudioElement | null>(null);

  const answeredCount = useMemo(() => answers.filter((answer) => answer !== undefined).length, [answers]);
  const coinsCollected = answeredCount * COINS_PER_ANSWER;
  const progressPercentage = (answeredCount / questions.length) * 100;
  const medalUnlocked = coinsCollected >= TOTAL_COINS;

  useEffect(() => {
    startSoundRef.current = new Audio("/sounds/game-start.mp3");
    answerSoundRef.current = new Audio("/sounds/coin-drop.mp3");
    bonusSoundRef.current = new Audio("/sounds/winning-unlock.mp3");
    startSoundRef.current.play().catch(() => undefined);
    trackPixelEvent("QuizStart");
    return () => {
      startSoundRef.current = null;
      answerSoundRef.current = null;
      bonusSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (recentGain === null) return;
    const timer = setTimeout(() => setRecentGain(null), 1200);
    return () => clearTimeout(timer);
  }, [recentGain]);

  const animateCoinJourney = (sourceButton: HTMLButtonElement) => {
    if (typeof document === "undefined") return;
    const target = document.querySelector(".coin-status-card") as HTMLElement | null;
    if (!target) return;

    const sourceRect = sourceButton.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const coin = document.createElement("span");
    coin.className = "flying-coin";

    const coinSize = 32;
    const startX = sourceRect.left + sourceRect.width / 2 - coinSize / 2;
    const startY = sourceRect.top + sourceRect.height / 2 - coinSize / 2;
    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;
    coin.style.width = `${coinSize}px`;
    coin.style.height = `${coinSize}px`;

    document.body.appendChild(coin);

    const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    const arcX = deltaX * 0.25;
    const liftY = Math.min(deltaY - 80, -80);

    const animation = coin.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(0.9) rotate(-8deg)", opacity: 0.9 },
        { offset: 0.4, transform: `translate3d(${arcX}px, ${liftY}px, 0) scale(1.08) rotate(220deg)`, opacity: 1 },
        { offset: 1, transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.8) rotate(520deg)`, opacity: 0 },
      ],
      {
        duration: 1700,
        easing: "cubic-bezier(0.22, 0.7, 0.25, 1)",
        fill: "forwards",
      },
    );

    animation.onfinish = () => coin.remove();
    animation.oncancel = () => coin.remove();
  };

  const handleAnswer = (answerIndex: number, buttonElement: HTMLButtonElement) => {
    if (answers[currentQuestion] !== undefined) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;

    animateCoinJourney(buttonElement);
    setAnswers(newAnswers);
    onCoinsEarned(COINS_PER_ANSWER);
    setRecentGain(COINS_PER_ANSWER);
    if (answerSoundRef.current) {
      answerSoundRef.current.currentTime = 0;
      answerSoundRef.current.play().catch(() => undefined);
    }
    trackPixelEvent("QuizAnswer", { question: currentQuestion + 1 });

    if (answeredCount + 1 === questions.length) {
      setTimeout(() => setShowCompletionModal(true), 600);
    } else {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 900);
    }
  };

  useEffect(() => {
    if (!showCompletionModal) return;
    bonusSoundRef.current?.play().catch(() => undefined);
    trackPixelEvent("QuizBonusUnlocked");
    const timer = setTimeout(() => {
      setShowCompletionModal(false);
      onNext();
    }, 2100);
    return () => clearTimeout(timer);
  }, [showCompletionModal, onNext]);

  const current = questions[currentQuestion];

  return (
    <div className="slide-shell relative">
      <div className="slide-frame space-y-6 relative">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="space-y-1">
            <p className="meta-label flex items-center gap-2 justify-center sm:justify-start">
              🎯 Pergunta {currentQuestion + 1} de {questions.length}
            </p>
            <h2 className="heading-2 flex items-center gap-2 justify-center sm:justify-start">
              Responda com calma
            </h2>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">Moedas liberadas</p>
            <div className={`medal-badge ${medalUnlocked ? "medal-badge--active" : ""}`}>
              {medalUnlocked ? "🏅 Mapa liberado" : `${coinsCollected}/${TOTAL_COINS}`}
            </div>
          </div>
        </div>

        <div className="coin-status-card">
          <div>
            <p className="coin-status-card__label">Total acumulado</p>
            <div className="coin-status-card__value">
              <span>{coinsCollected}</span>
              <span className="text-muted-foreground">/ {TOTAL_COINS}</span>
            </div>
          </div>
          {recentGain && <span className="coin-status-card__delta">+{recentGain} agora</span>}
          <p className="coin-status-card__hint">Usamos essas moedas automaticamente para abrir o Mapa dos Números Quentes.</p>
        </div>

        <div className="bg-secondary rounded-full h-3 overflow-hidden progress-sheen">
          <div className="bg-primary h-3 progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>

        <Card className="p-4 sm:p-6 md:p-7 space-y-6 border border-border glow-primary quiz-card">
          <div className="space-y-2 text-center">
            <h3 className="heading-2 text-foreground">{current.question}</h3>
            <p className="text-sm text-muted-foreground">Responda como você fala no dia a dia.</p>
          </div>

          <div className="space-y-3">
            {current.options.map((option, index) => (
              <Button
                key={option}
                onClick={(event) => handleAnswer(index, event.currentTarget)}
                variant="outline"
                className="w-full min-h-[52px] sm:min-h-[56px] py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg chips-button"
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="max-w-sm text-center space-y-4">
          <DialogHeader>
            <DialogTitle>Destravando o Bônus 1</DialogTitle>
            <DialogDescription>Segure um pouco: estamos preparando os dados para liberar o mapa secreto.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-5">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Transferindo fichas e liberando o Mapa Secreto...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
