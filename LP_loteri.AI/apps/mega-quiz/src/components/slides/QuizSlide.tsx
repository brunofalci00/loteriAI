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

type QuizStep =
  | {
      type: "info";
      primaryText: string;
      supportingText: string[];
      cta: string;
    }
  | {
      type: "question";
      contextText?: string;
      question: string;
      options: string[];
    };

const steps: QuizStep[] = [
  {
    type: "question",
    question: "Você sabia que a Mega da Virada pode pagar mais de R$ 850 milhões?",
    options: ["Sim, estou acompanhando de perto", "Sabia que era alto, mas não tanto", "Nem fazia ideia, me mostra como funciona"],
  },
  {
    type: "question",
    question: "Você já apostou e sentiu que só perde, mesmo seguindo sua intuição?",
    options: [
      "Sempre. Escolho e nunca passo dos mesmos pontos",
      "Jogo às vezes, mas já desanimei",
      "Ainda não jogo, quero começar com estratégia",
    ],
  },
  {
    type: "question",
    question: "Quer ver a IA que analisou 20 anos de concursos montar um jogo só pra você?",
    options: ["Quero ver agora", "Quero entender como funciona", "Tô curioso, pode liberar"],
  },
  {
    type: "info",
    primaryText:
      'A ex-BBB Paulinha ganhou mais de 50 vezes. Guilhermino, de PE, ganhou 70 vezes. O matemático "Munir Pé Quente" acertou 46 vezes.',
    supportingText: [
      "Se a loteria fosse puramente sorte, como você explica isso?",
      "A matemática não bate.",
      "A verdade que a Caixa esconde: Um jogo criado por humanos PODE SIM ser decodificado.",
    ],
    cta: "Continuar",
  },
  {
    type: "question",
    question: "Qual seu principal objetivo ao jogar na loteria?",
    options: [
      "Ganhar milhões e mudar de vida completamente",
      "Conquistar de 50 a 100 mil para quitar dívidas",
      "Fazer uma renda extra de 5 a 10 mil por mês",
      "Apenas diversão, sem expectativas",
    ],
  },
  {
    type: "question",
    contextText:
      "Enquanto você queima dinheiro há anos, pessoas comuns estão faturando milhares toda semana usando ciência ao invés de sorte.",
    question: "Qual foi o maior prêmio que você já ganhou na loteria?",
    options: ["Nunca ganhei nada", "Menos de R$ 100", "Entre R$ 100 a R$ 1.000", "Mais de R$ 10.000"],
  },
  {
    type: "question",
    question: "Como você escolhe seus números para apostar?",
    options: [
      "Datas especiais (aniversários, casamento, etc.)",
      "Números da sorte pessoais",
      "Surpresinha (aleatório)",
      "Baseado em estatísticas dos sorteios anteriores",
      "Uso algum método ou sistema",
    ],
  },
  {
    type: "question",
    question: "Quanto você gasta por mês com apostas na loteria?",
    options: ["Não gasto nada", "Até R$ 50", "Entre R$ 50 a R$ 100", "Mais de R$ 500"],
  },
  {
    type: "question",
    question: "Se você ganhasse R$ 50.000 na loteria amanhã, qual seria sua primeira ação?",
    options: ["Pagaria todas as dívidas", "Compraria um carro novo", "Investiria o dinheiro", "Realizaria o sonho da casa própria", "Ajudaria a família"],
  },
  {
    type: "question",
    question: "Você já ouviu falar de pessoas que ganharam na loteria mais de 10 vezes?",
    options: ["Sim, e acredito que é possível", "Sim, mas acho que é sorte", "Sim, mas desconfio que seja golpe", "Não, nunca soube disso", "Não acredito que seja real"],
  },
  {
    type: "question",
    question: "Qual seu maior obstáculo para ganhar na loteria?",
    options: ["Não sei escolher os números certos", "Gasto muito e ganho pouco", "Não tenho um método eficaz", "Acho que é tudo sorte mesmo", "Nunca pensei nisso"],
  },
  {
    type: "question",
    question: "Qual seria o valor ideal para você ganhar mensalmente na loteria?",
    options: [
      "Entre R$ 1.000 a R$ 5.000",
      "Entre R$ 5.000 a R$ 15.000",
      "Entre R$ 15.000 a R$ 50.000",
      "Mais de R$ 50.000",
      "Qualquer valor já mudaria minha vida",
    ],
  },
  {
    type: "question",
    question:
      "Se existisse um método científico para aumentar drasticamente suas chances de ganhar, você investiria R$87,00 para aprender?",
    options: ["Sim, sem dúvida", "Talvez, dependendo da prova", "Não, prefiro apostar na sorte", "Não tenho esse dinheiro agora"],
  },
  {
    type: "info",
    primaryText: "Sua resposta revela se você tem mentalidade de GANHADOR ou de PERDEDOR.",
    supportingText: ["Continue para descobrir a verdade..."],
    cta: "Continuar",
  },
];

let runningQuestionIndex = 0;
const questionIndexByStep = steps.map((step) => (step.type === "question" ? runningQuestionIndex++ : -1));
const QUESTION_COUNT = runningQuestionIndex;

const COINS_PER_ANSWER = 10;
const TOTAL_COINS = QUESTION_COUNT * COINS_PER_ANSWER;
const DISQUALIFY_ANSWER_TEXT = "Não tenho esse dinheiro agora";

export const QuizSlide = ({ onNext, onCoinsEarned }: QuizSlideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Array<number | undefined>>([]);
  const [recentGain, setRecentGain] = useState<number | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const answerSoundRef = useRef<HTMLAudioElement | null>(null);
  const bonusSoundRef = useRef<HTMLAudioElement | null>(null);

  const answeredCount = useMemo(() => answers.filter((answer) => answer !== undefined).length, [answers]);
  const coinsCollected = answeredCount * COINS_PER_ANSWER;
  const progressPercentage = QUESTION_COUNT === 0 ? 0 : (answeredCount / QUESTION_COUNT) * 100;
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
    const timer = window.setTimeout(() => setRecentGain(null), 1200);
    return () => window.clearTimeout(timer);
  }, [recentGain]);

  const advanceStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

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
    const questionIndex = questionIndexByStep[currentStep];
    if (questionIndex < 0) return;
    if (answers[questionIndex] !== undefined) return;

    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;

    animateCoinJourney(buttonElement);
    setAnswers(newAnswers);
    onCoinsEarned(COINS_PER_ANSWER);
    setRecentGain(COINS_PER_ANSWER);
    if (answerSoundRef.current) {
      answerSoundRef.current.currentTime = 0;
      answerSoundRef.current.play().catch(() => undefined);
    }
    trackPixelEvent("QuizAnswer", { question: questionIndex + 1, step: currentStep + 1 });

    if (current.type === "question" && current.options[answerIndex] === DISQUALIFY_ANSWER_TEXT) {
      trackPixelEvent("QuizNoMoneyNow", { question: questionIndex + 1, step: currentStep + 1 });
    }

    const isLastQuestion = answeredCount + 1 === QUESTION_COUNT;
    const hasNextStep = currentStep < steps.length - 1;

    if (isLastQuestion && !hasNextStep) {
      window.setTimeout(() => setShowCompletionModal(true), 600);
      return;
    }

    window.setTimeout(() => advanceStep(), 900);
  };

  useEffect(() => {
    if (!showCompletionModal) return;
    bonusSoundRef.current?.play().catch(() => undefined);
    trackPixelEvent("QuizBonusUnlocked");
    const timer = window.setTimeout(() => {
      setShowCompletionModal(false);
      onNext();
    }, 2100);
    return () => window.clearTimeout(timer);
  }, [showCompletionModal, onNext]);

  const current = steps[currentStep];
  const questionIndex = questionIndexByStep[currentStep];

  return (
    <div className="slide-shell relative">
      <div className="slide-frame space-y-6 relative">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="space-y-1">
            <p className="meta-label flex items-center gap-2 justify-center sm:justify-start">
              Qualificação • Etapa 1
            </p>
            <h2 className="heading-2 flex items-center gap-2 justify-center sm:justify-start">Responda com calma</h2>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">Pontos</p>
            <div className={`medal-badge ${medalUnlocked ? "medal-badge--active" : ""}`}>
              {medalUnlocked ? "Liberado" : `${coinsCollected}/${TOTAL_COINS}`}
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
          <p className="coin-status-card__hint">Esses pontos liberam o Mapa dos Números Quentes.</p>
        </div>

        <div className="bg-secondary rounded-full h-3 overflow-hidden progress-sheen">
          <div className="bg-primary h-3 progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>

        {current.type === "info" ? (
          <Card className="p-4 sm:p-6 md:p-7 space-y-6 border border-border glow-primary quiz-card">
            <div className="space-y-4 text-center">
              <h3 className="heading-2 text-foreground">{current.primaryText}</h3>
              <div className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {current.supportingText.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                trackPixelEvent("QuizStepContinue", { step: currentStep + 1 });
                if (currentStep >= steps.length - 1 && answeredCount >= QUESTION_COUNT) {
                  setShowCompletionModal(true);
                  return;
                }
                advanceStep();
              }}
              size="lg"
              className="w-full text-base sm:text-lg py-5 bg-primary hover:bg-primary-glow text-primary-foreground font-bold"
            >
              {current.cta}
            </Button>
          </Card>
        ) : (
          <Card className="p-4 sm:p-6 md:p-7 space-y-6 border border-border glow-primary quiz-card">
            <div className="space-y-2 text-center">
              {questionIndex >= 0 && (
                <p className="meta-label text-muted-foreground">
                  Pergunta {questionIndex + 1} de {QUESTION_COUNT}
                </p>
              )}
              {current.contextText && <p className="text-sm sm:text-base text-muted-foreground">{current.contextText}</p>}
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
        )}
      </div>

      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="max-w-sm text-center space-y-4">
          <DialogHeader>
            <DialogTitle>Liberando o mapa</DialogTitle>
            <DialogDescription>Um instante.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-5">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Processando...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
