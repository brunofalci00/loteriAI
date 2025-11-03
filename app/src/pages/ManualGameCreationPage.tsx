import { useState, useEffect } from "react";
import { useManualGameCreation } from "@/hooks/useManualGameCreation";
import { useWelcomeGuide } from "@/hooks/useTourGuide";
import { useAuth } from "@/contexts/AuthContext";
import { ManualGameStepper } from "@/components/ManualGameStepper";
import { Step1_LotterySelector } from "@/components/Step1_LotterySelector";
import { Step2_ContestSelector } from "@/components/Step2_ContestSelector";
import { Step3_NumberGrid } from "@/components/Step3_NumberGrid";
import { Step4_AnalysisResult } from "@/components/Step4_AnalysisResult";
import { AnalysisDetailsModal } from "@/components/AnalysisDetailsModal";
import { VariationsGrid } from "@/components/VariationsGrid";
import { WelcomeGuideModal, GuideStep } from "@/components/WelcomeGuideModal";
import { Header } from "@/components/Header";
import {
  Sparkles,
  ListTodo,
  Grid3x3,
  BarChart3,
  Shuffle,
  Zap
} from "lucide-react";

const guideSteps: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo à Criação Manual!',
    description: 'Aqui você cria seus próprios jogos de loteria e recebe análise completa da IA com score, sugestões e variações otimizadas. Vamos conhecer o passo a passo?',
    icon: <Sparkles className="h-12 w-12 text-primary" />,
    badge: 'Novo'
  },
  {
    id: 'step1',
    title: 'Escolha sua Loteria',
    description: 'Primeiro, selecione se quer jogar Lotofácil (15 números de 1 a 25) ou Lotomania (50 números de 00 a 99).',
    icon: <ListTodo className="h-12 w-12 text-blue-500" />,
  },
  {
    id: 'step2',
    title: 'Selecione o Concurso',
    description: 'Escolha o concurso para que a IA use o histórico correto na análise. Você pode ver os últimos sorteios de cada concurso.',
    icon: <Zap className="h-12 w-12 text-yellow-500" />,
  },
  {
    id: 'step3',
    title: 'Monte seu Jogo',
    description: 'Clique nos números para criar seu jogo personalizado. Use o botão "Aleatório" se quiser preencher rapidamente ou "Limpar" para recomeçar.',
    icon: <Grid3x3 className="h-12 w-12 text-purple-500" />,
  },
  {
    id: 'step4',
    title: 'Análise da IA',
    description: 'A IA analisa automaticamente seu jogo e dá um score de 0 a 10, mostrando números quentes/frios, distribuição e padrões. Clique em "Ver Detalhes" para análise completa!',
    icon: <BarChart3 className="h-12 w-12 text-green-500" />,
  },
  {
    id: 'variations',
    title: 'Gere Variações Otimizadas',
    description: 'Por apenas 1 crédito, a IA gera 5 variações do seu jogo mantendo 60-70% dos números originais, cada uma com estratégia diferente de otimização.',
    icon: <Shuffle className="h-12 w-12 text-orange-500" />,
    badge: '1 Crédito'
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

  const guide = useWelcomeGuide();

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

      {/* Welcome Guide Modal */}
      <WelcomeGuideModal
        open={guide.isOpen}
        steps={guideSteps}
        onComplete={guide.markAsComplete}
        onSkip={guide.skip}
      />
    </div>
  );
};

export default ManualGameCreationPage;
