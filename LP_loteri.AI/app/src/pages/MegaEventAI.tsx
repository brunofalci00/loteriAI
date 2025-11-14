import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { GenerationSelector } from "@/components/GenerationSelector";
import { GenerationHistoryModal } from "@/components/GenerationHistoryModal";
import { FirstGenerationModal, isFirstGeneration } from "@/components/FirstGenerationModal";
import { RegenerateButton } from "@/components/RegenerateButton";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { NextDrawInfo } from "@/components/NextDrawInfo";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUpcomingDraws } from "@/hooks/useUpcomingDraws";
import { useLotteryAnalysis } from "@/hooks/useLotteryAnalysis";
import { useActiveGeneration } from "@/hooks/useGenerationHistory";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import { toast } from "sonner";
import { ArrowLeft, Archive } from "lucide-react";

const MEGA_TYPE = "mega-sena";

export default function MegaEventAI() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedContest, setSelectedContest] = useState<number | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [firstGenModalOpen, setFirstGenModalOpen] = useState(false);

  const {
    data: upcomingDraws,
    isLoading: loadingDraws,
    error: drawsError,
  } = useUpcomingDraws(MEGA_TYPE, 6);

  const {
    data: analysisResult,
    isLoading: isAnalyzing,
    error: analysisError,
  } = useLotteryAnalysis(
    selectedContest ? MEGA_TYPE : "",
    60,
    6,
    selectedContest ?? 0,
    user?.id || null,
    !!selectedContest
  );

  const { data: activeGeneration } = useActiveGeneration(
    user?.id,
    selectedContest ? MEGA_TYPE : "",
    selectedContest ?? 0,
    showResults && !!user?.id && !!selectedContest
  );

  const displayedCombinations = useMemo(() => {
    if (!showResults || !analysisResult) return [];
    return activeGeneration?.generated_numbers || analysisResult.combinations || [];
  }, [showResults, analysisResult, activeGeneration]);

  const displayedHotNumbers = useMemo(() => {
    if (!analysisResult) return [];
    return activeGeneration?.hot_numbers || analysisResult.statistics.hotNumbers || [];
  }, [analysisResult, activeGeneration]);

  useEffect(() => {
    if (analysisError) {
      toast.error("Erro ao analisar dados da Mega da Virada.");
      console.error(analysisError);
    }
  }, [analysisError]);

  const handleContestSelection = (contestNumber: number) => {
    setSelectedContest(contestNumber);
    setShowLoading(true);
    setShowResults(false);
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowResults(true);

    if (isFirstGeneration()) {
      setTimeout(() => setFirstGenModalOpen(true), 800);
    }
  };

  const handleExport = () => {
    if (!analysisResult || !selectedContest) return;

    const { combinations, statistics, strategy, confidence, calculatedAccuracy } = analysisResult;
    let content = `=== Mega da Virada - Loteri.AI ===\n\n`;
    content += `🏆 Concurso: ${selectedContest}\n`;
    content += `Gerado em: ${new Date().toLocaleString("pt-BR")}\n`;
    content += `Concursos analisados: ${statistics.totalDrawsAnalyzed}\n`;
    content += `Período: ${formatShortDate(statistics.periodStart)} - ${formatShortDate(statistics.periodEnd)}\n`;
    content += `Taxa estimada: ${calculatedAccuracy}% | Confiança: ${confidence.toUpperCase()}\n`;
    content += `Estratégia: ${strategy.description}\n\n`;

    content += `📊 Estatísticas\n`;
    content += `Números quentes: ${statistics.hotNumbers.map((n) => n.toString().padStart(2, "0")).join(", ")}\n\n`;

    content += `🎲 Jogos sugeridos (${combinations.length})\n`;
    combinations.forEach((combo, index) => {
      const formatted = combo
        .map((n) => {
          const numStr = n.toString().padStart(2, "0");
          return statistics.hotNumbers.includes(n) ? `${numStr}♨` : numStr;
        })
        .join(" - ");
      content += `Jogo ${index + 1}: ${formatted}\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mega-da-virada-${selectedContest}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Jogos exportados!");
  };

  const renderContestSelection = () => {
    const featuredDraw = upcomingDraws?.[0];

    return (
      <div className="space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/mega-da-virada")}
          className="mega-button bg-transparent text-amber-100 hover:text-amber-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o evento
        </Button>

        <section className="space-y-4 text-center">
          <Badge className="mx-auto bg-amber-100/20 text-amber-50">Mega da Virada</Badge>
          <h1 className="text-3xl font-black sm:text-4xl text-white">Escolha o concurso dourado.</h1>
          <p className="mx-auto max-w-2xl text-sm mega-text-muted">
            Cada cartão exibe data, prêmio e status exclusivo. Basta tocar para abrir a sala da IA.
          </p>
        </section>

        {drawsError && (
          <Alert className="border-amber-300/40 bg-amber-300/10 text-amber-50">
            <AlertTitle>Erro ao carregar concursos</AlertTitle>
            <AlertDescription>{drawsError.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {loadingDraws ? (
            <div className="mega-border rounded-3xl p-[1px] opacity-60 animate-pulse">
              <div className="rounded-[calc(var(--radius)*2)] bg-emerald-950/40 p-6 h-36" />
            </div>
          ) : featuredDraw ? (
            <div className="mega-panel">
              <div className="mega-panel__inner flex flex-col gap-3 border-0 text-left text-amber-50 opacity-60">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-amber-100/70">
                  <Lock className="h-3 w-3" />
                  Acesso exclusivo
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-100/70">Mega da Virada</p>
                  <h3 className="text-2xl font-black">R$ 850 milhões em jogo</h3>
                  <p className="text-sm mega-text-muted">
                    31 de dezembro de 2025 · 20h
                  </p>
                </div>
                <p className="text-xs mega-text-muted">
                  Disponível apenas para convidados. Aguarde desbloqueio oficial.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-amber-100/70">
              Nenhum concurso disponível no momento. Volte mais tarde.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderAnalysisView = () => {
    if (!selectedContest) return null;

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Button variant="ghost" onClick={() => setSelectedContest(null)} className="mega-button bg-transparent w-fit text-amber-100 hover:text-amber-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para concursos
          </Button>
          <div className="text-right">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">Mega da Virada</p>
            <h1 className="text-3xl font-black text-white">Concurso {selectedContest}</h1>
          </div>
        </div>

        {analysisResult?.fromCache && (
          <Alert className="border-amber-200/40 bg-amber-200/10 text-amber-50">
            <Archive className="h-4 w-4" />
            <AlertDescription>Análise recuperada do histórico. Você pode regenerar novas combinações acima.</AlertDescription>
          </Alert>
        )}

        {showLoading || isAnalyzing ? (
          <LoadingAnalysis onComplete={handleLoadingComplete} isAnalyzing={isAnalyzing} />
        ) : (
          showResults &&
          analysisResult && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {user?.id && (
                  <GenerationSelector
                    userId={user.id}
                    lotteryType={MEGA_TYPE}
                    contestNumber={selectedContest}
                    onOpenHistory={() => setHistoryModalOpen(true)}
                  />
                )}

                {user?.id && analysisResult.statistics && (
                  <div className="flex flex-wrap gap-3">
                    <RegenerateButton
                      userId={user.id}
                      lotteryType={MEGA_TYPE}
                      contestNumber={selectedContest}
                      statistics={analysisResult.statistics}
                      numbersPerGame={6}
                      maxNumber={60}
                      numberOfGames={10}
                      variant="hero"
                      showCreditsCount
                    />
                    <Button variant="outline" onClick={handleExport}>
                      Exportar jogos
                    </Button>
                  </div>
                )}

                <div className="mega-panel">
                  <div className="mega-panel__inner relative">
                    {!activeGeneration && (
                      <Badge className="absolute -top-4 right-6 bg-amber-300 text-emerald-950">ANÁLISE GRATUITA</Badge>
                    )}
                    <ResultsDisplay
                      lotteryName="Mega-Sena"
                    lotteryType={MEGA_TYPE}
                    combinations={displayedCombinations}
                    stats={{
                      accuracy: analysisResult.calculatedAccuracy,
                      gamesGenerated: displayedCombinations.length,
                      hotNumbers: displayedHotNumbers,
                      coldNumbers: analysisResult.statistics.coldNumbers,
                      lastUpdate: analysisResult.statistics.lastUpdate,
                      dataSource: analysisResult.dataSource,
                    }}
                    strategy={analysisResult.strategy}
                    onExport={handleExport}
                    contestNumber={selectedContest}
                    generationId={activeGeneration?.id || null}
                    userId={user?.id || null}
                  />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                {user?.id && (
                  <div className="mega-panel">
                    <div className="mega-panel__inner">
                      <CreditsDisplay
                        userId={user.id}
                        variant="default"
                        showProgress
                        showResetInfo
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {user?.id && selectedContest && (
          <GenerationHistoryModal
            userId={user.id}
            lotteryType={MEGA_TYPE}
            contestNumber={selectedContest}
            open={historyModalOpen}
            onOpenChange={setHistoryModalOpen}
          />
        )}

        {analysisResult && selectedContest && (
          <FirstGenerationModal
            open={firstGenModalOpen}
            onOpenChange={setFirstGenModalOpen}
            stats={{
              gamesGenerated: displayedCombinations.length,
              accuracy: analysisResult.calculatedAccuracy,
              lotteryName: "Mega-Sena",
            }}
            userId={user?.id || null}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,16,14,0.95),_#010302)] text-foreground">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {!selectedContest ? renderContestSelection() : renderAnalysisView()}
      </div>
    </div>
  );
}
