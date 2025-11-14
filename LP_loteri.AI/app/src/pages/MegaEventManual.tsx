import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ManualGameStepper } from "@/components/ManualGameStepper";
import { Step3_NumberGrid } from "@/components/Step3_NumberGrid";
import { Step4_AnalysisResult } from "@/components/Step4_AnalysisResult";
import { VariationsGrid } from "@/components/VariationsGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    if (state.lotteryType !== "mega-sena") {
      selectLottery("mega-sena");
    }
  }, [state.lotteryType, selectLottery]);

  useEffect(() => {
    if (state.lotteryType === "mega-sena" && state.currentStep === 1) {
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-foreground">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16 space-y-10">
        <section className="space-y-3 text-center text-amber-50">
          <Badge className="mx-auto bg-amber-100/20 text-amber-50">Mega da Virada</Badge>
          <h1 className="text-3xl font-black sm:text-4xl">Monte seu jogo manual com o branding dourado da virada.</h1>
          <p className="mx-auto max-w-2xl text-sm text-amber-100/80">
            É o mesmo construtor avançado do app, mas já bloqueado na Mega-Sena e com visual premium. Passe pelas etapas abaixo
            para analisar e gerar variações douradas.
          </p>
        </section>

        <div className="rounded-3xl border border-amber-100/20 bg-emerald-950/40 p-6 shadow-xl shadow-emerald-900/30">
          <ManualGameStepper currentStep={state.currentStep} onStepClick={handleStepperClick} />

          <div className="mb-8 rounded-2xl border border-amber-200/20 bg-amber-100/10 p-4 text-center text-sm text-emerald-900">
            <p className="font-semibold">Loteria fixa: Mega-Sena</p>
            <p>Todas as análises usam os parâmetros oficiais do evento.</p>
          </div>

          <div className="space-y-12">
            {state.currentStep === 2 && (
              <Card className="max-w-3xl mx-auto space-y-6 border border-amber-100/30 bg-emerald-950/30 p-6">
                <div className="space-y-2 text-center text-amber-50">
                  <h2 className="text-2xl font-bold">Escolha o concurso da virada</h2>
                  <p className="text-sm text-amber-100/80">
                    Use o número oficial divulgado pela Caixa. Se preferir, use o próximo concurso estimado abaixo.
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
                    <p className="text-xs text-amber-100/70">
                      Próximo previsto: {upcomingDraws[0].contestNumber} - {upcomingDraws[0].dayOfWeek}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="text-amber-100 border-amber-100/40 hover:bg-emerald-900/40"
                    onClick={() => goToStep(2)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="rounded-full bg-emerald-950 text-amber-200 hover:bg-emerald-900"
                    disabled={!contestInput}
                    onClick={handleContestSelection}
                  >
                    Confirmar
                  </Button>
                </div>
              </Card>
            )}

            {state.currentStep === 3 && (
              <div className="rounded-3xl border border-amber-100/20 bg-emerald-950/30 p-6">
                <Step3_NumberGrid
                  lotteryType="mega-sena"
                  selectedNumbers={state.selectedNumbers}
                  onToggleNumber={toggleNumber}
                  onClear={clearSelection}
                  onRandom={randomSelection}
                  onNext={handleNumbersNext}
                  onBack={prevStep}
                />
              </div>
            )}

            {state.currentStep === 4 && state.lotteryType === "mega-sena" && state.contestNumber && (
              <div className="space-y-12">
                {analyzeGame.isPending && (
                  <div className="rounded-3xl border border-amber-100/20 bg-emerald-950/30 p-10 text-center">
                    <p className="text-lg font-semibold text-amber-50">Analisando seu jogo...</p>
                  </div>
                )}

                {state.analysisResult && (
                  <>
                    <div className="rounded-3xl border border-amber-100/20 bg-emerald-950/30 p-4">
                      <Step4_AnalysisResult
                        lotteryType="mega-sena"
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

                    {state.variations.length > 0 && (
                      <VariationsGrid
                        variations={state.variations}
                        originalNumbers={state.selectedNumbers}
                        lotteryType="mega-sena"
                        contestNumber={state.contestNumber}
                        userId={user?.id || null}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <Button variant="ghost" className="text-amber-100 hover:text-amber-100" onClick={() => resetStepper()}>
              Reiniciar fluxo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
