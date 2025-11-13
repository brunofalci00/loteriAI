export interface LotteryDrawInfo {
  nextDrawNumber: number;
  nextDrawDate: Date;
  estimatedPrize: number;
  lastDrawDate: Date;
  lastDrawNumbers?: number[];
}

export interface LotteryApiResponse {
  numero: number;
  dataProximoConcurso: string;
  valorEstimadoProximoConcurso: number;
  dataApuracao: string;
  listaDezenas?: string[];
}

export interface UpcomingDraw {
  contestNumber: number;
  drawDate: Date;
  estimatedPrize: number;
  status: "HOJE" | "AMANHÃ" | "ESPECIAL" | null;
  dayOfWeek: string;
}

export interface LotterySchedule {
  type: string;
  name: string;
  upcomingDraws: UpcomingDraw[];
}
