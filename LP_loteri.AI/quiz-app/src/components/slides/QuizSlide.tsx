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
    question: "Quando você joga na Lotofácil, o que mais te incomoda?",
    options: [
      "Jogar sem saber se estou no caminho certo",
      "Apostar várias vezes e nunca passar dos mesmos 11 pontos",
      "Ver os outros falando que usam sistema e eu aqui tentando na raça",
    ],
  },
  {
    question: 'Quantas vezes você achou que "faltou pouco"?',
    options: [
      "Sempre. 1 ou 2 números me perseguem",
      "Em quase todo jogo fico por um triz",
      "Nunca passei dos 11. Já tô desacreditado",
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
  const [toastValue, setToastValue] = useState<number | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const answerSoundRef = useRef<HTMLAudioElement | null>(null);
  const bonusSoundRef = useRef<HTMLAudioElement | null>(null);

  const answeredCount = useMemo(() => answers.filter((answer) => answer !== undefined).length, [answers]);
  const coinsCollected = answeredCount * COINS_PER_ANSWER;
  const remainingCoins = Math.max(TOTAL_COINS - coinsCollected, 0);
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
    if (toastValue === null) return;
    const timer = setTimeout(() => setToastValue(null), 1700);
    return () => clearTimeout(timer);
  }, [toastValue]);

  const handleAnswer = (answerIndex: number) => {
    if (answers[currentQuestion] !== undefined) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    onCoinsEarned(COINS_PER_ANSWER);
    setToastValue((answeredCount + 1) * COINS_PER_ANSWER);
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
        {toastValue !== null && (
          <div className="coin-toast animate-fade-in-up z-50 bg-gradient-to-r from-primary/80 to-gold/70 text-background">
            💰 Moedas coletadas! Agora você tem {toastValue}/50.
            <span className="text-xs text-background/80 block">
              ⚡ Faltam {Math.max(TOTAL_COINS - coinsCollected, 0)} moedas para liberar o Mapa dos Números Quentes
            </span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="space-y-1">
            <p className="meta-label flex items-center gap-2 justify-center sm:justify-start">
              🎯 Passo {currentQuestion + 1} de {questions.length} - para desbloquear o bônus
            </p>
            <h2 className="heading-2 flex items-center gap-2 justify-center sm:justify-start">
              🧠 Teste em andamento
            </h2>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">Bônus 1: Mapa dos Números Quentes</p>
            <div className={`medal-badge ${medalUnlocked ? "medal-badge--active" : ""}`}>
              {medalUnlocked ? "🏅 Liberado" : `🏅 Faltam ${remainingCoins} moedas`}
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-full h-3 overflow-hidden progress-sheen">
          <div className="bg-primary h-3 progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>

        <Card className="p-5 md:p-7 space-y-8 border border-border glow-primary quiz-card">
          <div className="space-y-2 text-center">
            <h3 className="heading-2 text-foreground">{current.question}</h3>
            <p className="text-xs text-primary font-semibold uppercase tracking-[0.4em]">
              Quanto mais real, mais afiada fica a IA
            </p>
          </div>

          <div className="space-y-3">
            {current.options.map((option, index) => (
              <Button
                key={option}
                onClick={() => handleAnswer(index)}
                variant="outline"
                className="w-full min-h-[56px] py-4 text-left text-base md:text-lg chips-button"
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
