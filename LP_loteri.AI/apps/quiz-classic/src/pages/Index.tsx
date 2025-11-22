import { useCallback, useEffect, useState } from "react";
import { CoinCounter } from "@/components/CoinCounter";
import { AudioToggle } from "@/components/AudioToggle";
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
import { useAudio } from "@/contexts/AudioContext";

const AI_NUMBERS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 21, 23, 24, 25, 3];
const DRAWN_NUMBERS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 21, 23, 24, 25, 1];

const countHits = (source: number[], target: number[]) => source.filter((num) => target.includes(num)).length;

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>(DRAWN_NUMBERS);
  const [coins, setCoins] = useState(0);
  const [coinDelta, setCoinDelta] = useState(0);
  const [userScore, setUserScore] = useState(11);
  const [aiScore] = useState(14);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [userSpins, setUserSpins] = useState(1);
  const aiSpins = 3;
  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const [shouldPlayMaxWinSound, setShouldPlayMaxWinSound] = useState(false);
  const [shouldPlayMapSound, setShouldPlayMapSound] = useState(false);
  const { exitIntentTriggered, acknowledge } = useExitIntent(currentSlide > 0);
  const { pauseBackgroundMusic, playBackgroundMusic, stopBackgroundMusic } = useAudio();

  const handleCoinsEarned = (amount: number) => {
    setCoins((prev) => prev + amount);
    setCoinDelta(amount);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const handleIntuitionComplete = (selection: number[]) => {
    // Keep user's real selection
    setSelectedNumbers(selection);

    // Strategy: Create 15 drawn numbers that guarantee:
    // - User hits exactly 11 (from their 15 selected)
    // - AI hits exactly 14 (from AI_NUMBERS)

    // Step 1: Pick 11 random numbers from user's selection (user will hit these)
    const shuffledUserNumbers = [...selection].sort(() => Math.random() - 0.5);
    const userHits = shuffledUserNumbers.slice(0, 11);

    // Step 2: From AI_NUMBERS, pick numbers that overlap with userHits
    const aiNumbersInUserHits = AI_NUMBERS.filter((num) => userHits.includes(num));

    // Step 3: Pick additional AI numbers (not in userHits) to reach 14 total AI hits
    const aiNumbersNotInUserHits = AI_NUMBERS.filter((num) => !userHits.includes(num));
    const shuffledAIExtra = [...aiNumbersNotInUserHits].sort(() => Math.random() - 0.5);
    const neededAINumbers = 14 - aiNumbersInUserHits.length;
    const aiExtraHits = shuffledAIExtra.slice(0, neededAINumbers);

    // Step 4: Combine to create final 15 drawn numbers
    // = userHits (11) + aiExtraHits (4 max, to reach 15 total)
    const finalDrawn = [...userHits, ...aiExtraHits].slice(0, 15);

    setDrawnNumbers(finalDrawn);
    setUserScore(11);
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
    <BonusUnlockLoadingSlide key="bonus-loading" onNext={handleNext} onComplete={() => setShouldPlayMapSound(true)} />,
    <BonusMapSlide key="bonus-map" onNext={handleNext} playMapSound={shouldPlayMapSound} />,
    <IntuitionGameSlide key="intuition" onNext={handleNext} onComplete={handleIntuitionComplete} />,
    <UserResultSlide
      key="user-result"
      onNext={handleNext}
      userScore={userScore}
      selectedNumbers={selectedNumbers}
      drawnNumbers={drawnNumbers}
    />,
    <AISyncLoadingSlide key="ai-sync" onNext={handleNext} userScore={userScore} />,
    <AISimulationSlide
      key="ai-simulation"
      onNext={handleNext}
      userScore={userScore}
      aiScore={aiScore}
      aiNumbers={AI_NUMBERS}
      drawnNumbers={drawnNumbers}
      userNumbers={selectedNumbers}
      userSpins={userSpins}
      aiSpins={aiSpins}
    />,
    <RouletteBonusSlide
      key="roulette"
      onNext={handleNext}
      userSpins={userSpins}
      onSpinComplete={() => setUserSpins(0)}
      onMaxWinClick={() => setShouldPlayMaxWinSound(true)}
    />,
    <MaxWinCelebrationSlide key="max-win" onNext={handleNext} playWinSound={shouldPlayMaxWinSound} />,
    <TestimonialsSlide
      key="testimonials"
      onNext={handleNext}
      onVideoPlay={pauseBackgroundMusic}
      onVideoPause={playBackgroundMusic}
    />,
    <FinalOfferSlide
      key="final-offer"
      onCheckoutClick={stopBackgroundMusic}
      onVideoPlay={pauseBackgroundMusic}
      onVideoPause={playBackgroundMusic}
    />,
  ];

  const shouldShowCoinCounter = currentSlide > 0 && currentSlide <= FIRST_BONUS_UNLOCK_SLIDE_INDEX;

  return (
    <div className="relative overflow-x-hidden">
      <AudioToggle />
      {shouldShowCoinCounter && <CoinCounter coins={coins} delta={coinDelta} />}
      {slides[currentSlide]}
      <ExitIntentOverlay open={showExitOverlay} onStay={handleExitOverlayClose} />
    </div>
  );
};

export default Index;
