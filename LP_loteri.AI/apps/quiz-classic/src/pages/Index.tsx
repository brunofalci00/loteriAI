import { useCallback, useEffect, useState } from "react";
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
import { useSoundEffect } from "@/hooks/useSoundEffect";

const AI_NUMBERS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 21, 23, 24, 25, 3];
const DRAWN_NUMBERS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 21, 23, 24, 25, 1];

const countHits = (source: number[], target: number[]) => source.filter((num) => target.includes(num)).length;

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drawnNumbers] = useState<number[]>(DRAWN_NUMBERS);
  const [coins, setCoins] = useState(0);
  const [coinDelta, setCoinDelta] = useState(0);
  const [userScore, setUserScore] = useState(11);
  const [aiScore] = useState(14);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [userSpins, setUserSpins] = useState(1);
  const aiSpins = 3;
  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const [bgStarted, setBgStarted] = useState(false);
  const { exitIntentTriggered, acknowledge } = useExitIntent(currentSlide > 0);
  const backgroundMusicRef = useSoundEffect("/sounds/good-luck-353353.mp3", { loop: true, volume: 0.12, autoplay: false });

  const playBackgroundMusic = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;
    audio.play().catch(() => undefined);
  }, [backgroundMusicRef]);

  const pauseBackgroundMusic = useCallback(() => {
    backgroundMusicRef.current?.pause();
  }, [backgroundMusicRef]);

  const stopBackgroundMusic = useCallback(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, [backgroundMusicRef]);

  const handleCoinsEarned = (amount: number) => {
    setCoins((prev) => prev + amount);
    setCoinDelta(amount);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const handleIntuitionComplete = () => {
    const hits = DRAWN_NUMBERS.slice(0, 11);
    const missesPool = Array.from({ length: 25 }, (_, i) => i + 1).filter((num) => !DRAWN_NUMBERS.includes(num));
    const misses = missesPool.slice(0, 4);
    const enforcedSelection = [...hits, ...misses];
    setSelectedNumbers(enforcedSelection);
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

  useEffect(() => {
    if (!bgStarted) {
      playBackgroundMusic();
      setBgStarted(true);
    }
    return () => stopBackgroundMusic();
  }, [bgStarted, playBackgroundMusic, stopBackgroundMusic]);

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
    <RouletteBonusSlide key="roulette" onNext={handleNext} userSpins={userSpins} onSpinComplete={() => setUserSpins(0)} />,
    <MaxWinCelebrationSlide key="max-win" onNext={handleNext} />,
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
      {shouldShowCoinCounter && <CoinCounter coins={coins} delta={coinDelta} />}
      {slides[currentSlide]}
      <ExitIntentOverlay open={showExitOverlay} onStay={handleExitOverlayClose} />
    </div>
  );
};

export default Index;
