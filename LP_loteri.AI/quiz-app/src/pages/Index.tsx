import { useState } from "react";
import { CoinCounter } from "@/components/CoinCounter";
import { EntrySlide } from "@/components/slides/EntrySlide";
import { QuizSlide } from "@/components/slides/QuizSlide";
import { BlockSlide } from "@/components/slides/BlockSlide";
import { BonusMapSlide } from "@/components/slides/BonusMapSlide";
import { IntuitionGameSlide } from "@/components/slides/IntuitionGameSlide";
import { UserResultSlide } from "@/components/slides/UserResultSlide";
import { AISimulationSlide } from "@/components/slides/AISimulationSlide";
import { TestimonialsSlide } from "@/components/slides/TestimonialsSlide";
import { RouletteBonusSlide } from "@/components/slides/RouletteBonusSlide";
import { MaxWinCelebrationSlide } from "@/components/slides/MaxWinCelebrationSlide";
import { FinalOfferSlide } from "@/components/slides/FinalOfferSlide";

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinDelta, setCoinDelta] = useState(0);
  const [userScore, setUserScore] = useState(7);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const aiScore = 14;
  const [userSpins, setUserSpins] = useState(1);
  const aiSpins = 3;

  const handleCoinsEarned = (amount: number) => {
    setCoins((prev) => prev + amount);
    setCoinDelta(amount);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const handleIntuitionComplete = (selection: number[]) => {
    setSelectedNumbers(selection);
    setUserScore(7);
  };

  const slides = [
    <EntrySlide key="entry" onNext={handleNext} />,
    <QuizSlide key="quiz" onNext={handleNext} onCoinsEarned={handleCoinsEarned} />,
    <BlockSlide key="block" onNext={handleNext} coinsEarned={coins} />,
    <BonusMapSlide key="bonus-map" onNext={handleNext} />,
    <IntuitionGameSlide key="intuition" onNext={handleNext} onComplete={handleIntuitionComplete} />,
    <UserResultSlide key="user-result" onNext={handleNext} userScore={userScore} selectedNumbers={selectedNumbers} />,
    <AISimulationSlide
      key="ai-simulation"
      onNext={handleNext}
      userScore={userScore}
      aiScore={aiScore}
      userSpins={userSpins}
      aiSpins={aiSpins}
    />,
    <TestimonialsSlide key="testimonials" onNext={handleNext} />,
    <RouletteBonusSlide
      key="roulette"
      onNext={handleNext}
      userSpins={userSpins}
      onSpinComplete={() => setUserSpins(0)}
    />,
    <MaxWinCelebrationSlide key="max-win" onNext={handleNext} />,
    <FinalOfferSlide key="final-offer" />,
  ];

  return (
    <div className="relative">
      {currentSlide > 0 && currentSlide < slides.length - 1 && <CoinCounter coins={coins} delta={coinDelta} />}
      {slides[currentSlide]}
    </div>
  );
};

export default Index;
