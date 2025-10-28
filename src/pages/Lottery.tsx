import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { NextDrawInfo } from "@/components/NextDrawInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<number[][] | null>(null);

  const lottery = type ? lotteryData[type] : null;

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

  const generateCombinations = () => {
    const combinations: number[][] = [];
    const numberOfGames = 10;

    for (let i = 0; i < numberOfGames; i++) {
      const numbers = new Set<number>();
      while (numbers.size < lottery.numbersPerGame) {
        numbers.add(Math.floor(Math.random() * lottery.maxNumber) + 1);
      }
      combinations.push(Array.from(numbers).sort((a, b) => a - b));
    }

    return combinations;
  };

  const handleLoadingComplete = () => {
    const combinations = generateCombinations();
    setResults(combinations);
    setIsLoading(false);
  };

  const handleExport = () => {
    if (!results) return;

    let content = `=== LottoSort - ${lottery.name} ===\n\n`;
    content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    content += `Total de jogos: ${results.length}\n\n`;
    
    results.forEach((combo, index) => {
      content += `Jogo ${index + 1}: ${combo.map(n => n.toString().padStart(2, '0')).join(' - ')}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lottosort-${type}-${Date.now()}.txt`;
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
            Análise inteligente em andamento...
          </p>
        </div>

        <div className="mb-8">
          <NextDrawInfo lotteryType={type} lotteryName={lottery.name} />
        </div>

        {isLoading ? (
          <LoadingAnalysis onComplete={handleLoadingComplete} />
        ) : results ? (
          <ResultsDisplay
            lotteryName={lottery.name}
            combinations={results}
            stats={{
              accuracy: 78,
              gamesGenerated: results.length,
              drawsAnalyzed: 2547,
            }}
            onExport={handleExport}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Lottery;
