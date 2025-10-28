import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Download, TrendingUp, Target, Database } from "lucide-react";

interface ResultsDisplayProps {
  lotteryName: string;
  combinations: number[][];
  stats: {
    accuracy: number;
    gamesGenerated: number;
    drawsAnalyzed: number;
  };
  onExport: () => void;
}

export const ResultsDisplay = ({ lotteryName, combinations, stats, onExport }: ResultsDisplayProps) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-success">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
              <p className="text-2xl font-bold text-success">{stats.accuracy}%</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jogos Gerados</p>
              <p className="text-2xl font-bold text-accent">{stats.gamesGenerated}</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concursos Analisados</p>
              <p className="text-2xl font-bold text-primary">{stats.drawsAnalyzed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Números Sugeridos - {lotteryName}</h2>
          <p className="text-sm text-muted-foreground">
            Baseado em análise estatística avançada e IA
          </p>
        </div>
        <Button variant="gold" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar .txt
        </Button>
      </div>

      {/* Combinations Grid */}
      <div className="grid gap-4">
        {combinations.map((combo, index) => (
          <Card key={index} className="border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary">
                {index + 1}
              </div>
              <div className="flex flex-wrap gap-2">
                {combo.map((number, numIndex) => (
                  <div
                    key={numIndex}
                    className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-sm font-bold shadow-glow"
                  >
                    {number.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
