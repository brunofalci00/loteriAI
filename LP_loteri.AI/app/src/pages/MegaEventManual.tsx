import { useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Step3_NumberGrid } from "@/components/Step3_NumberGrid";
import { Step4_AnalysisResult } from "@/components/Step4_AnalysisResult";
import { VariationsGrid } from "@/components/VariationsGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useManualGameCreation, type StepNumber } from "@/hooks/useManualGameCreation";
import { useAuth } from "@/contexts/AuthContext";
import { useUpcomingDraws } from "@/hooks/useUpcomingDraws";
import { cn } from "@/lib/utils";

export default function MegaEventManual() {
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
    canProceedToStep4,
  } = useManualGameCreation();

  const { data: upcomingDraws } = useUpcomingDraws("mega-sena", 1);
  const featuredContest = useMemo(() => upcomingDraws?.[0]?.contestNumber ?? 2940, [upcomingDraws]);

  useEffect(() => {
    if (state.lotteryType !== "megasena") {
      selectLottery("megasena");
    }
  }, [state.lotteryType, selectLottery]);

  useEffect(() => {
    if (state.lotteryType === "megasena" && state.currentStep < 3) {
      goToStep(3 as StepNumber);
    }
  }, [state.lotteryType, state.currentStep, goToStep]);

  useEffect(() => {
    if (state.currentStep === 4 && !state.analysisResult && !analyzeGame.isPending) {
      analyzeGame.mutate();
    }
  }, [state.currentStep, state.analysisResult, analyzeGame]);

  useEffect(() => {
    if (featuredContest && state.contestNumber !== featuredContest) {
      selectContest(featuredContest);
    }

  }, [featuredContest, selectContest, state.contestNumber]);

  const handleNumbersNext = () => {
    if (canProceedToStep4) {
      nextStep();
    }
  };

  const handleEditNumbers = () => {
    goToStep(3);
  };

  const handleStepperClick = (step: StepNumber) => {
    if (step < 3) return;
    goToStep(step);
  };

  const stages = [
    { id: 3 as StepNumber, label: "Números" },
    { id: 4 as StepNumber, label: "Análise" },
  ];
  const activeStage = state.currentStep >= 4 ? 4 : 3;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,16,14,0.95),_#010302)] text-foreground">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16 space-y-10">
        <section className="mega-panel">
          <div className="mega-panel__inner space-y-3 text-center text-amber-50">
            <Badge className="mx-auto bg-amber-100/20 text-amber-50">Mega da Virada</Badge>
            <h1 className="text-3xl font-black sm:text-4xl text-white">Monte seu jogo manual com luxo dourado.</h1>
            <p className="mx-auto max-w-2xl text-sm mega-text-muted">
              Selecionamos apenas Mega-Sena e adaptamos cada etapa para a estética exclusiva da virada.
            </p>
          </div>
        </section>

        <div className="mega-panel">
          <div className="mega-panel__inner space-y-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-3">
                  <button
                    onClick={() => handleStepperClick(stage.id)}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold",
                      activeStage === stage.id ? "bg-amber-300 text-emerald-950" : "bg-transparent text-amber-200 border-amber-200/40"
                    )}
                  >
                    {stage.label.charAt(0)}
                  </button>
                  {index < stages.length - 1 && <div className="hidden sm:block h-[2px] w-16 bg-amber-200/40" />}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-amber-200/30 bg-amber-100/5 p-4 text-center text-sm text-amber-100">
              <p className="font-semibold">Loteria fixa: Mega-Sena</p>
              <p>Todas as análises usam os parâmetros oficiais do evento.</p>
              <p className="text-xs mega-text-muted">Concurso oficial nº {featuredContest}</p>
            </div>

            <div className="space-y-12">
            {state.currentStep === 3 && (
              <div className="mega-panel">
                <div className="mega-panel__inner">
                  <Step3_NumberGrid
                    lotteryType="megasena"
                    selectedNumbers={state.selectedNumbers}
                    onToggleNumber={toggleNumber}
                    onClear={clearSelection}
                    onRandom={randomSelection}
                    onNext={handleNumbersNext}
                    onBack={prevStep}
                  />
                </div>
              </div>
            )}

            {state.currentStep === 4 && state.lotteryType === "megasena" && state.contestNumber && (
              <div className="space-y-12">
                {analyzeGame.isPending && (
                  <div className="mega-panel">
                    <div className="mega-panel__inner p-10 text-center">
                      <p className="text-lg font-semibold text-amber-50">Analisando seu jogo...</p>
                    </div>
                  </div>
                )}

                {state.analysisResult && (
                  <>
                    <div className="mega-panel">
                      <div className="mega-panel__inner">
                        <Step4_AnalysisResult
                          lotteryType="megasena"
                          contestNumber={state.contestNumber}
                          selectedNumbers={state.selectedNumbers}
                          analysisResult={state.analysisResult}
                          userId={user?.id || null}
                          onGenerateVariations={() => generateVariations.mutate()}
                          onEdit={handleEditNumbers}
                          onReset={resetStepper}
                          isGeneratingVariations={generateVariations.isPending}
                        />
                      </div>
                    </div>

                    {state.variations.length > 0 && (
                      <div className="mega-panel">
                        <div className="mega-panel__inner">
                          <VariationsGrid
                            variations={state.variations}
                            originalNumbers={state.selectedNumbers}
                            lotteryType="megasena"
                            contestNumber={state.contestNumber}
                            userId={user?.id || null}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <Button variant="ghost" className="mega-button bg-transparent text-amber-100 hover:text-amber-100" onClick={() => resetStepper()}>
              Reiniciar fluxo
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
