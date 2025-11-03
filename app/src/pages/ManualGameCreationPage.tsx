import { useState, useEffect } from "react";
import { useManualGameCreation } from "@/hooks/useManualGameCreation";
import { useTourGuide } from "@/hooks/useTourGuide";
import { useAuth } from "@/contexts/AuthContext";
import { ManualGameStepper } from "@/components/ManualGameStepper";
import { Step1_LotterySelector } from "@/components/Step1_LotterySelector";
import { Step2_ContestSelector } from "@/components/Step2_ContestSelector";
import { Step3_NumberGrid } from "@/components/Step3_NumberGrid";
import { Step4_AnalysisResult } from "@/components/Step4_AnalysisResult";
import { AnalysisDetailsModal } from "@/components/AnalysisDetailsModal";
import { VariationsGrid } from "@/components/VariationsGrid";
import { TourGuideOverlay } from "@/components/TourGuideOverlay";
import { Header } from "@/components/Header";

const tourSteps = [
  {
    id: 'welcome',
    target: 'body',
    title: 'Bem-vindo à Criação Manual!',
    content: 'Aqui você cria seus próprios jogos e recebe análise completa da IA. Vamos fazer um tour rápido?',
    placement: 'center' as const
  },
  {
    id: 'step1',
    target: '[data-tour="lottery-selector"]',
    title: 'Escolha a Loteria',
    content: 'Primeiro, selecione se quer jogar Lotofácil (15 números) ou Lotomania (50 números).',
    placement: 'bottom' as const
  },
  {
    id: 'step2',
    target: '[data-tour="contest-selector"]',
    title: 'Escolha o Concurso',
    content: 'Selecione o concurso para a IA usar o histórico correto na análise.',
    placement: 'bottom' as const
  },
  {
    id: 'step3',
    target: '[data-tour="number-grid"]',
    title: 'Selecione os Números',
    content: 'Clique nos números para montar seu jogo. Use "Aleatório" para preencher rapidamente!',
    placement: 'top' as const
  },
  {
    id: 'step4',
    target: '[data-tour="analysis-result"]',
    title: 'Veja a Análise',
    content: 'A IA analisa seu jogo e dá um score de 0-10. Clique em "Ver Detalhes" para análise completa!',
    placement: 'top' as const
  },
  {
    id: 'variations',
    target: '[data-tour="generate-variations"]',
    title: 'Gere Variações',
    content: 'A IA pode gerar 5 variações otimizadas mantendo parte dos seus números!',
    placement: 'top' as const
  },
];

const ManualGameCreationPage = () => {
  const { user } = useAuth();
  const {
    state,
    goToStep,
    nextStep,
    prevStep,
    resetStepper,
    selectLottery,
    selectContest,
    toggleNumber,
    clearSelection,
    randomSelection,
    analyzeGame,
    generateVariations,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
  } = useManualGameCreation();

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const tour = useTourGuide('manual-creation-tour', tourSteps);

  // Trigger análise when reaching step 4
  useEffect(() => {
    if (state.currentStep === 4 && !state.analysisResult && !analyzeGame.isPending) {
      analyzeGame.mutate();
    }
  }, [state.currentStep, state.analysisResult, analyzeGame]);

  const handleStep1Next = () => {
    if (canProceedToStep2) {
      nextStep();
    }
  };

  const handleStep2Next = () => {
    if (canProceedToStep3) {
      nextStep();
    }
  };

  const handleStep3Next = () => {
    if (canProceedToStep4) {
      nextStep();
    }
  };

  const handleEditNumbers = () => {
    goToStep(3);
  };

  const handleGenerateVariations = () => {
    generateVariations.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Criar Jogo Manualmente</h1>
          <p className="text-lg text-muted-foreground">
            Monte seu jogo e receba análise completa da IA
          </p>
        </div>

        {/* Stepper */}
        <ManualGameStepper
          currentStep={state.currentStep}
          onStepClick={goToStep}
        />

        {/* Step Content */}
        <div className="mt-12">
          {state.currentStep === 1 && (
            <Step1_LotterySelector
              selected={state.lotteryType}
              onSelect={selectLottery}
              onNext={handleStep1Next}
            />
          )}

          {state.currentStep === 2 && state.lotteryType && (
            <Step2_ContestSelector
              lotteryType={state.lotteryType}
              selectedContest={state.contestNumber}
              onSelect={selectContest}
              onNext={handleStep2Next}
              onBack={prevStep}
            />
          )}

          {state.currentStep === 3 && state.lotteryType && (
            <Step3_NumberGrid
              lotteryType={state.lotteryType}
              selectedNumbers={state.selectedNumbers}
              onToggleNumber={toggleNumber}
              onClear={clearSelection}
              onRandom={randomSelection}
              onNext={handleStep3Next}
              onBack={prevStep}
            />
          )}

          {state.currentStep === 4 && state.lotteryType && state.contestNumber && (
            <div className="space-y-12">
              {/* Loading State */}
              {analyzeGame.isPending && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Analisando seu jogo...</p>
                </div>
              )}

              {/* Analysis Result */}
              {state.analysisResult && (
                <>
                  <Step4_AnalysisResult
                    lotteryType={state.lotteryType}
                    contestNumber={state.contestNumber}
                    selectedNumbers={state.selectedNumbers}
                    analysisResult={state.analysisResult}
                    userId={user?.id || null}
                    onViewDetails={() => setDetailsModalOpen(true)}
                    onGenerateVariations={handleGenerateVariations}
                    onEdit={handleEditNumbers}
                    onReset={resetStepper}
                    isGeneratingVariations={generateVariations.isPending}
                  />

                  {/* Variations Grid */}
                  {state.variations.length > 0 && (
                    <VariationsGrid
                      variations={state.variations}
                      originalNumbers={state.selectedNumbers}
                      lotteryType={state.lotteryType}
                      contestNumber={state.contestNumber}
                      userId={user?.id || null}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Details Modal */}
      {state.analysisResult && (
        <AnalysisDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          analysisResult={state.analysisResult}
        />
      )}

      {/* Tour Guide Overlay */}
      <TourGuideOverlay
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        currentStepIndex={tour.currentStepIndex}
        totalSteps={tour.totalSteps}
        isLastStep={tour.isLastStep}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={tour.skipTour}
      />
    </div>
  );
};

export default ManualGameCreationPage;
