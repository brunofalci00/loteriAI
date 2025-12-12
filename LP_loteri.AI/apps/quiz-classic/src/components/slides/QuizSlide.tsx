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
    question: "Quando você joga na Lotofácil, o que mais te trava?",
    options: [
      "Não saber se estou no caminho certo",
      "Ficar preso nos mesmos 11 pontos",
      "Ver a galera usando sistema enquanto vou no chute",
    ],
  },
  {
    question: "Quantas vezes faltou 1 número para valer a pena?",
    options: [
      "Direto: 1 ou 2 escapam",
      "Quase sempre fico por um triz",
      "Ainda não passei de 11",
    ],
  },
  {
    question: "Como escolhe seus jogos hoje?",
    options: ["Intuição pura", "Datas, palpites, sensação", "Só jogo e espero"],
  },
  {
    question: "Se pudesse testar seu palpite contra a IA agora, você...",
    options: ["Toparia de cara", "Quero ver onde erro", "Prefiro deixar ela decidir"],
  },
  {
    question: "O que você quer resolver hoje?",
    options: ["Parar de jogar no escuro", "Validar se meu jeito funciona", "Usar vantagem real"],
  },
];

const COINS_PER_ANSWER = 10;
const TOTAL_COINS = questions.length * COINS_PER_ANSWER;
const motivationalBursts = [
  "Boa! Isso libera mais moedas pro mapa.",
  "Continue, faltam poucos cliques.",
  "A IA está mapeando seu estilo agora.",
];
const microStatusQueue = ["Processando moedas...", "Liberando o próximo passo...", "Quase destravando o mapa..."];

export const QuizSlide = ({ onNext, onCoinsEarned }: QuizSlideProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [recentGain, setRecentGain] = useState<number | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [microStatus, setMicroStatus] = useState<string | null>(null);
  const [progressPulse, setProgressPulse] = useState(false);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const answerSoundRef = useRef<HTMLAudioElement | null>(null);
  const bonusSoundRef = useRef<HTMLAudioElement | null>(null);
  const coinCardRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!progressPulse) return;
    const timer = setTimeout(() => setProgressPulse(false), 800);
    return () => clearTimeout(timer);
  }, [progressPulse]);

  const animateCoinJourney = (sourceButton: HTMLButtonElement) => {
    if (typeof document === "undefined") return;
    // Use cached ref instead of querySelector to avoid layout thrashing
    const target = coinCardRef.current;
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
    setFlashMessage(motivationalBursts[Math.floor(Math.random() * motivationalBursts.length)]);
    setMicroStatus(microStatusQueue[Math.floor(Math.random() * microStatusQueue.length)]);
    setProgressPulse(true);
    setTimeout(() => setFlashMessage(null), 700);
    setTimeout(() => setMicroStatus(null), 680);
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
              Bônus 1 · Pergunta {currentQuestion + 1} de {questions.length}
            </p>
            {microStatus && <p className="text-xs text-primary mt-1 micro-toast">{microStatus}</p>}
          </div>
          <div className="text-center sm:text-right">
            <div className={`medal-badge ${medalUnlocked ? "medal-badge--active" : ""}`}>
              {medalUnlocked ? "Mapa pronto" : `${coinsCollected}/${TOTAL_COINS}`}
            </div>
          </div>
        </div>

        <div ref={coinCardRef} className="coin-status-card">
          <div>
            <div className="coin-status-card__value">
              <span>{coinsCollected}</span>
              <span className="text-muted-foreground">/ {TOTAL_COINS}</span>
            </div>
            <p className="text-xs text-muted-foreground">Moedas convertidas em acesso.</p>
          </div>
          {recentGain && <span className="coin-status-card__delta coin-shiver">+{recentGain} liberadas</span>}
        </div>

        <div className="bg-secondary rounded-full h-3 overflow-hidden progress-sheen">
          <div className={`bg-primary h-3 progress-fill ${progressPulse ? "bar-flicker" : ""}`} style={{ width: `${progressPercentage}%` }} />
        </div>

        <Card className="p-4 sm:p-6 md:p-7 space-y-6 border border-border glow-primary quiz-card">
          <div className="space-y-2 text-center">
            <h3 className="heading-2 text-foreground">{current.question}</h3>
            <p className="text-sm text-muted-foreground">Clique rápido. Não tem resposta errada, só o caminho que a IA vai usar.</p>
          </div>

          <div className="space-y-3">
            {current.options.map((option, index) => (
              <Button
                key={option}
                onClick={(event) => handleAnswer(index, event.currentTarget)}
                variant="outline"
                className="w-full min-h-[52px] sm:min-h-[56px] py-3 sm:py-4 text-left text-sm sm:text-base md:text-lg chips-button tap-intent"
              >
                {option}
              </Button>
            ))}
          </div>
        </Card>
        {flashMessage && <p className="text-center text-primary text-sm micro-toast">{flashMessage}</p>}
      </div>

      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="max-w-sm text-center space-y-4">
          <DialogHeader>
            <DialogTitle>Trocando moedas pelo mapa</DialogTitle>
            <DialogDescription>Segure um pouco: estamos convertendo suas respostas em acesso ao Mapa dos Números Quentes.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-5">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Transferindo fichas e liberando o mapa seguro...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
