import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Hash, Database, Flame, Calendar, Award } from "lucide-react";
import { formatShortDate } from "@/utils/formatters";

interface ResultsDisplayProps {
  lotteryName: string;
  combinations: number[][];
  stats: {
    accuracy: number;
    gamesGenerated: number;
    hotNumbers?: number[];
    coldNumbers?: number[];
    lastUpdate?: Date;
    dataSource?: string;
  };
  strategy?: {
    type: string;
    description: string;
  };
  onExport: () => void;
}

export const ResultsDisplay = ({
  lotteryName,
  combinations,
  stats,
  strategy,
  onExport,
}: ResultsDisplayProps) => {
  const confidenceColors = {
    baixa: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    média: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    alta: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  const isHotNumber = (num: number) => stats.hotNumbers?.includes(num);

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Acerto Estimada
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Análise baseada em dados históricos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jogos Gerados
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gamesGenerated}</div>
            <p className="text-xs text-muted-foreground">
              Combinações inteligentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Como chegamos nestes números */}
      {(stats.hotNumbers || strategy) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Como chegamos nestes números?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.hotNumbers && stats.hotNumbers.length > 0 && (
              <div className="flex items-start gap-2">
                <Flame className="h-4 w-4 mt-1 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Números Quentes (mais frequentes)</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stats.hotNumbers.map((num) => (
                      <Badge key={num} variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-500">
                        {num.toString().padStart(2, '0')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {strategy && (
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Estratégia Utilizada</p>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </div>
              </div>
            )}

            {stats.lastUpdate && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Última atualização: {formatShortDate(stats.lastUpdate)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Números Sugeridos - {lotteryName}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-3 w-3" />
            <span>{stats.dataSource || "Dados em tempo real"}</span>
          </div>
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
                {combo.map((number, numIndex) => {
                  const hot = isHotNumber(number);

                  return (
                    <div
                      key={numIndex}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm shadow-glow relative ${
                        hot
                          ? "bg-orange-500 text-white ring-2 ring-orange-500/50"
                          : "gradient-primary"
                      }`}
                      title={hot ? "Número quente" : ""}
                    >
                      {number.toString().padStart(2, "0")}
                      {hot && <Flame className="absolute -top-1 -right-1 h-3 w-3 text-orange-300" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
