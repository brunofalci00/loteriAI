import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { NextDrawInfo } from "@/components/NextDrawInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLotteryAnalysis } from "@/hooks/useLotteryAnalysis";
import { formatShortDate } from "@/utils/formatters";

const lotteryData: Record<string, { name: string; maxNumber: number; numbersPerGame: number }> = {
  "mega-sena": { name: "Mega-Sena", maxNumber: 60, numbersPerGame: 6 },
  "quina": { name: "Quina", maxNumber: 80, numbersPerGame: 5 },
  "lotofacil": { name: "Lotofácil", maxNumber: 25, numbersPerGame: 15 },
  "lotomania": { name: "Lotomania", maxNumber: 100, numbersPerGame: 50 },
  "dupla-sena": { name: "Dupla Sena", maxNumber: 50, numbersPerGame: 6 },
  "timemania": { name: "Timemania", maxNumber: 80, numbersPerGame: 10 },
};

const Lottery = () => {
  const { type, contestNumber } = useParams<{ type: string; contestNumber: string }>();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const lottery = type ? lotteryData[type] : null;

  // Iniciar análise real
  const { 
    data: analysisResult, 
    isLoading: isAnalyzing,
    error: analysisError
  } = useLotteryAnalysis(
    type || "",
    lottery?.maxNumber || 60,
    lottery?.numbersPerGame || 6,
    !!lottery // só habilita se loteria existe
  );

  if (!lottery) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <p className="text-center text-muted-foreground">Loteria não encontrada</p>
        </div>
      </div>
    );
  }

  // Tratamento de erro
  useEffect(() => {
    if (analysisError) {
      toast.error("Erro ao analisar dados. Tente novamente.");
      console.error("Erro na análise:", analysisError);
    }
  }, [analysisError]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowResults(true);
  };

  const handleExport = () => {
    if (!analysisResult) return;

    const { combinations, statistics, strategy, confidence, calculatedAccuracy } = analysisResult;

    let content = `=== LotterAI - ${lottery.name} ===\n\n`;
    content += `📋 INFORMAÇÕES DA ANÁLISE\n`;
    content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    content += `Concursos analisados: ${statistics.totalDrawsAnalyzed}\n`;
    content += `Período: ${formatShortDate(statistics.periodStart)} - ${formatShortDate(statistics.periodEnd)}\n`;
    content += `Taxa de acerto estimada: ${calculatedAccuracy}%\n`;
    content += `Confiabilidade: ${confidence.toUpperCase()}\n`;
    content += `Estratégia: ${strategy.description}\n\n`;

    content += `📊 ESTATÍSTICAS\n`;
    content += `Números quentes: ${statistics.hotNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}\n`;
    content += `Números frios: ${statistics.coldNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}\n`;
    const totalNumbers = statistics.pairOddRatio.pairs + statistics.pairOddRatio.odds;
    const pairPercent = ((statistics.pairOddRatio.pairs / totalNumbers) * 100).toFixed(1);
    const oddPercent = ((statistics.pairOddRatio.odds / totalNumbers) * 100).toFixed(1);
    content += `Proporção pares/ímpares: ${pairPercent}% / ${oddPercent}%\n\n`;

    content += `🎲 JOGOS SUGERIDOS (${combinations.length})\n`;
    combinations.forEach((combo, index) => {
      const numbersFormatted = combo.map(n => {
        const numStr = n.toString().padStart(2, '0');
        if (statistics.hotNumbers.includes(n)) return `${numStr}♨`;
        if (statistics.coldNumbers.includes(n)) return `${numStr}❄`;
        return numStr;
      }).join(' - ');
      content += `Jogo ${index + 1}: ${numbersFormatted}\n`;
    });

    content += `\nLegenda: ♨ = Número quente | ❄ = Número frio\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lotterai-${type}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Arquivo exportado com sucesso!");
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate(`/lottery/${type}/contests`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">
            {lottery.name} - Concurso {contestNumber || "N/A"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {showLoading ? "Análise inteligente em andamento..." : "Análise concluída"}
          </p>
        </div>

        <div className="mb-8">
          <NextDrawInfo lotteryType={type} lotteryName={lottery.name} />
        </div>

        {showLoading ? (
          <LoadingAnalysis 
            onComplete={handleLoadingComplete} 
            isAnalyzing={isAnalyzing}
          />
        ) : showResults && analysisResult ? (
          <ResultsDisplay
            lotteryName={lottery.name}
            combinations={analysisResult.combinations}
            stats={{
              accuracy: analysisResult.calculatedAccuracy,
              gamesGenerated: analysisResult.gamesGenerated,
              drawsAnalyzed: analysisResult.statistics.totalDrawsAnalyzed,
              periodAnalyzed: `${formatShortDate(analysisResult.statistics.periodStart)} - ${formatShortDate(analysisResult.statistics.periodEnd)}`,
              confidence: analysisResult.confidence,
              hotNumbers: analysisResult.statistics.hotNumbers,
              coldNumbers: analysisResult.statistics.coldNumbers,
              lastUpdate: analysisResult.statistics.lastUpdate,
            }}
            strategy={analysisResult.strategy}
            onExport={handleExport}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Lottery;
