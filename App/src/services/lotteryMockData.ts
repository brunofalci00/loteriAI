import { HistoricalDraw } from "@/types/analysis";
import mockData from "@/data/lottery-mock-data.json";

interface MockLotteryData {
  lastUpdate: string;
  latestContest: number;
  draws: Array<{
    contestNumber: number;
    drawDate: string;
    numbers: number[];
  }>;
}

type MockDataStore = Record<string, MockLotteryData>;

const typedMockData = mockData as MockDataStore;

export const getMockDraws = (
  lotteryType: string,
  maxDraws: number = 100
): HistoricalDraw[] => {
  const lottery = typedMockData[lotteryType];
  
  if (!lottery) {
    throw new Error(`Mock data não disponível para: ${lotteryType}`);
  }

  return lottery.draws
    .slice(0, maxDraws)
    .map(draw => ({
      contestNumber: draw.contestNumber,
      drawDate: new Date(draw.drawDate),
      numbers: draw.numbers,
    }));
};

export const getMockLatestDraw = (lotteryType: string): HistoricalDraw => {
  const draws = getMockDraws(lotteryType, 1);
  
  if (draws.length === 0) {
    throw new Error(`Nenhum dado mock disponível para: ${lotteryType}`);
  }

  return draws[0];
};

export const isMockDataAvailable = (lotteryType: string): boolean => {
  return lotteryType in typedMockData;
};

export const getMockDataAge = (lotteryType: string): number => {
  const lottery = typedMockData[lotteryType];
  
  if (!lottery) {
    return -1;
  }

  const lastUpdate = new Date(lottery.lastUpdate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getAllAvailableLotteries = (): string[] => {
  return Object.keys(typedMockData);
};
