import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ManualGameStepper } from "@/components/ManualGameStepper";
import { Step3_NumberGrid } from "@/components/Step3_NumberGrid";
import { Step4_AnalysisResult } from "@/components/Step4_AnalysisResult";
import { VariationsGrid } from "@/components/VariationsGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useManualGameCreation, type StepNumber } from "@/hooks/useManualGameCreation";
import { useAuth } from "@/contexts/AuthContext";
import { useUpcomingDraws } from "@/hooks/useUpcomingDraws";

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
  const [contestInput, setContestInput] = useState("");

  useEffect(() => {
    if (state.lotteryType !== "megasena") {
      selectLottery("megasena");
    }
  }, [state.lotteryType, selectLottery]);

  useEffect(() => {
    if (state.lotteryType === "megasena" && state.currentStep === 1) {
      goToStep(2 as StepNumber);
    }
  }, [state.lotteryType, state.currentStep, goToStep]);

  useEffect(() => {
    if (state.currentStep === 4 && !state.analysisResult && !analyzeGame.isPending) {
      analyzeGame.mutate();
    }
  }, [state.currentStep, state.analysisResult, analyzeGame]);

  useEffect(() => {
    if (upcomingDraws?.[0] && !contestInput) {
      setContestInput(String(upcomingDraws[0].contestNumber));
    }
  }, [upcomingDraws, contestInput]);

  const handleContestSelection = () => {
    const parsed = parseInt(contestInput, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      selectContest(parsed);
      nextStep();
    }
  };

  const handleNumbersNext = () => {
    if (canProceedToStep4) {
      nextStep();
    }
  };

  const handleEditNumbers = () => {
    goToStep(3);
  };

  const handleStepperClick = (step: StepNumber) => {
    if (step === 1) return;
    goToStep(step);
  };

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
          <ManualGameStepper currentStep={state.currentStep} onStepClick={handleStepperClick} />

          <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 p-4 text-center text-sm text-emerald-900">
            <p className="font-semibold">Loteria fixa: Mega-Sena</p>
            <p>Todas as análises usam os parâmetros oficiais do evento.</p>
          </div>

          <div className="space-y-12">
            {state.currentStep === 2 && (
              <div className="mega-panel max-w-3xl mx-auto">
                <div className="mega-panel__inner space-y-6">
                  <div className="space-y-2 text-center text-amber-50">
                    <h2 className="text-2xl font-bold">Escolha o concurso da virada</h2>
                    <p className="text-sm mega-text-muted">
                      Use o número oficial divulgado pela Caixa ou aceite a sugestão abaixo.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="contest" className="text-sm text-amber-100">
                      Número do concurso
                    </Label>
                    <Input
                      id="contest"
                      type="number"
                      min={1}
                      value={contestInput}
                      onChange={(event) => setContestInput(event.target.value)}
                      className="bg-emerald-950/60 border-amber-100/30 text-amber-50"
                    />
                    {upcomingDraws?.[0] && (
                      <p className="text-xs mega-text-muted">
                        Próximo previsto: {upcomingDraws[0].contestNumber} - {upcomingDraws[0].dayOfWeek}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      className="mega-button bg-transparent text-amber-100 border border-amber-100/40"
                      onClick={() => goToStep(2)}
                    >
                      Voltar
                    </Button>
                    <Button
                      className="mega-button"
                      disabled={!contestInput}
                      onClick={handleContestSelection}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
