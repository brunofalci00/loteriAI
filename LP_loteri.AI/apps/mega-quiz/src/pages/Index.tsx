import { useEffect, useState } from "react";
import { CoinCounter } from "@/components/CoinCounter";
import { ExitIntentOverlay } from "@/components/ExitIntentOverlay";
import { EntrySlide } from "@/components/slides/EntrySlide";
import { QuizSlide } from "@/components/slides/QuizSlide";
import { BonusUnlockLoadingSlide } from "@/components/slides/BonusUnlockLoadingSlide";
import { BonusMapSlide } from "@/components/slides/BonusMapSlide";
import { IntuitionGameSlide } from "@/components/slides/IntuitionGameSlide";
import { UserResultSlide } from "@/components/slides/UserResultSlide";
import { AISyncLoadingSlide } from "@/components/slides/AISyncLoadingSlide";
import { AISimulationSlide } from "@/components/slides/AISimulationSlide";
import { TestimonialsSlide } from "@/components/slides/TestimonialsSlide";
import { RouletteBonusSlide } from "@/components/slides/RouletteBonusSlide";
import { MaxWinCelebrationSlide } from "@/components/slides/MaxWinCelebrationSlide";
import { FinalOfferSlide } from "@/components/slides/FinalOfferSlide";
import { useExitIntent } from "@/hooks/useExitIntent";

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinDelta, setCoinDelta] = useState(0);
  const [userScore, setUserScore] = useState(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const aiScore = 5;
  const [userSpins, setUserSpins] = useState(1);
  const aiSpins = 3;
  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const { exitIntentTriggered, acknowledge } = useExitIntent(currentSlide > 0);

  const handleCoinsEarned = (amount: number) => {
    setCoins((prev) => prev + amount);
    setCoinDelta(amount);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const handleIntuitionComplete = (selection: number[]) => {
    setSelectedNumbers(selection);
    setUserScore(1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSlide]);

  useEffect(() => {
    if (exitIntentTriggered) {
      setShowExitOverlay(true);
    }
  }, [exitIntentTriggered]);

  const handleExitOverlayClose = () => {
    setShowExitOverlay(false);
    acknowledge();
  };

  const FIRST_BONUS_UNLOCK_SLIDE_INDEX = 3;

  const slides = [
    <EntrySlide key="entry" onNext={handleNext} />,
    <QuizSlide key="quiz" onNext={handleNext} onCoinsEarned={handleCoinsEarned} />,
    <BonusUnlockLoadingSlide key="bonus-loading" onNext={handleNext} />,
    <BonusMapSlide key="bonus-map" onNext={handleNext} />,
    <IntuitionGameSlide key="intuition" onNext={handleNext} onComplete={handleIntuitionComplete} />,
    <UserResultSlide key="user-result" onNext={handleNext} userScore={userScore} selectedNumbers={selectedNumbers} />,
    <AISyncLoadingSlide key="ai-sync" onNext={handleNext} />,
    <AISimulationSlide
      key="ai-simulation"
      onNext={handleNext}
      userScore={userScore}
      aiScore={aiScore}
      userSpins={userSpins}
      aiSpins={aiSpins}
    />,
    <RouletteBonusSlide key="roulette" onNext={handleNext} userSpins={userSpins} onSpinComplete={() => setUserSpins(0)} />,
    <MaxWinCelebrationSlide key="max-win" onNext={handleNext} />,
    <TestimonialsSlide key="testimonials" onNext={handleNext} />,
    <FinalOfferSlide key="final-offer" />,
  ];

  const shouldShowCoinCounter = currentSlide > 0 && currentSlide <= FIRST_BONUS_UNLOCK_SLIDE_INDEX;

  return (
    <div className="relative overflow-x-hidden">
      {shouldShowCoinCounter && <CoinCounter coins={coins} delta={coinDelta} />}
      {slides[currentSlide]}
      <ExitIntentOverlay open={showExitOverlay} onStay={handleExitOverlayClose} />
    </div>
  );
};

export default Index;
