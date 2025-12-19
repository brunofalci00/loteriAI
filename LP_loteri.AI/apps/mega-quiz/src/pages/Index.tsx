import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { EntrySlide } from "@/components/slides/EntrySlide";
import { useExitIntent } from "@/hooks/useExitIntent";

const CoinCounter = lazy(() => import("@/components/CoinCounter").then((m) => ({ default: m.CoinCounter })));
const ExitIntentOverlay = lazy(() => import("@/components/ExitIntentOverlay").then((m) => ({ default: m.ExitIntentOverlay })));

const QuizSlide = lazy(() => import("@/components/slides/QuizSlide").then((m) => ({ default: m.QuizSlide })));
const BonusUnlockLoadingSlide = lazy(() =>
  import("@/components/slides/BonusUnlockLoadingSlide").then((m) => ({ default: m.BonusUnlockLoadingSlide })),
);
const BonusMapSlide = lazy(() => import("@/components/slides/BonusMapSlide").then((m) => ({ default: m.BonusMapSlide })));
const IntuitionGameSlide = lazy(() => import("@/components/slides/IntuitionGameSlide").then((m) => ({ default: m.IntuitionGameSlide })));
const UserResultSlide = lazy(() => import("@/components/slides/UserResultSlide").then((m) => ({ default: m.UserResultSlide })));
const AISyncLoadingSlide = lazy(() => import("@/components/slides/AISyncLoadingSlide").then((m) => ({ default: m.AISyncLoadingSlide })));
const AISimulationSlide = lazy(() => import("@/components/slides/AISimulationSlide").then((m) => ({ default: m.AISimulationSlide })));
const TestimonialsSlide = lazy(() => import("@/components/slides/TestimonialsSlide").then((m) => ({ default: m.TestimonialsSlide })));
const FinalOfferSlide = lazy(() => import("@/components/slides/FinalOfferSlide").then((m) => ({ default: m.FinalOfferSlide })));

const SlideFallback = () => (
  <div className="slide-shell relative">
    <div className="casino-grid" />
    <div className="slide-frame relative z-10">
      <div className="rounded-3xl border border-border bg-card/80 p-6 text-center">
        <p className="font-semibold text-foreground">Carregando…</p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinDelta, setCoinDelta] = useState(0);
  const [userScore, setUserScore] = useState(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const aiScore = 5;
  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const { exitIntentTriggered, acknowledge } = useExitIntent(currentSlide > 0);

  const handleCoinsEarned = useCallback((amount: number) => {
    setCoins((prev) => prev + amount);
    setCoinDelta(amount);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => prev + 1);
  }, []);

  const handleIntuitionComplete = useCallback((selection: number[]) => {
    setSelectedNumbers(selection);
    setUserScore(1);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSlide]);

  useEffect(() => {
    if (exitIntentTriggered) {
      setShowExitOverlay(true);
    }
  }, [exitIntentTriggered]);

  const handleExitOverlayClose = useCallback(() => {
    setShowExitOverlay(false);
    acknowledge();
  }, [acknowledge]);

  const FIRST_BONUS_UNLOCK_SLIDE_INDEX = 3;

  const slides = useMemo(
    () => [
      <EntrySlide key="entry" onNext={handleNext} />,
      <QuizSlide key="quiz" onNext={handleNext} onCoinsEarned={handleCoinsEarned} />,
      <BonusUnlockLoadingSlide key="bonus-loading" onNext={handleNext} />,
      <BonusMapSlide key="bonus-map" onNext={handleNext} pointsUsed={coins} />,
      <IntuitionGameSlide key="intuition" onNext={handleNext} onComplete={handleIntuitionComplete} />,
      <UserResultSlide key="user-result" onNext={handleNext} userScore={userScore} selectedNumbers={selectedNumbers} />,
      <AISyncLoadingSlide key="ai-sync" onNext={handleNext} />,
      <AISimulationSlide key="ai-simulation" onNext={handleNext} userScore={userScore} aiScore={aiScore} />,
      <TestimonialsSlide key="testimonials" onNext={handleNext} />,
      <FinalOfferSlide key="final-offer" />,
    ],
    [aiScore, coins, handleCoinsEarned, handleIntuitionComplete, handleNext, selectedNumbers, userScore],
  );

  const shouldShowCoinCounter = currentSlide > 0 && currentSlide <= FIRST_BONUS_UNLOCK_SLIDE_INDEX;

  return (
    <div className="relative overflow-x-hidden">
      <Suspense fallback={null}>
        {shouldShowCoinCounter && <CoinCounter coins={coins} delta={coinDelta} />}
      </Suspense>
      <Suspense fallback={<SlideFallback />}>{slides[currentSlide]}</Suspense>
      {showExitOverlay && (
        <Suspense fallback={null}>
          <ExitIntentOverlay open={showExitOverlay} onStay={handleExitOverlayClose} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
