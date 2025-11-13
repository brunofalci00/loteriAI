export interface HistoricalDraw {
  contestNumber: number;
  drawDate: Date;
  numbers: number[];
}

export interface LotteryStatistics {
  totalDrawsAnalyzed: number;
  periodStart: Date;
  periodEnd: Date;
  numberFrequency: Map<number, number>;
  hotNumbers: number[];
  coldNumbers: number[];
  averageSum: number;
  pairOddRatio: { pairs: number; odds: number };
  consecutiveFrequency: number;
  lastUpdate: Date;
}

export interface GenerationStrategy {
  type: "balanced" | "hot" | "cold" | "mixed";
  description: string;
  hotNumbersWeight: number;
  coldNumbersWeight: number;
  randomWeight: number;
}

export interface AnalysisResult {
  combinations: number[][];
  statistics: LotteryStatistics;
  strategy: GenerationStrategy;
  confidence: "baixa" | "média" | "alta";
  calculatedAccuracy: number;
  gamesGenerated: number;
}
