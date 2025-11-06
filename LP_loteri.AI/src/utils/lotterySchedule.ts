import { LotteryDrawInfo } from "@/types/lottery";

export interface LotteryPeriodicity {
  daysOfWeek: number[]; // 0 = Domingo, 1 = Segunda, etc.
  drawTime: string; // "20:00", "22:00", etc.
}

export const lotteryPeriodicities: Record<string, LotteryPeriodicity> = {
  "mega-sena": {
    daysOfWeek: [2, 4, 6], // Terça (2), Quinta (4) e Sábado (6)
    drawTime: "22:00",
  },
  "quina": {
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
    drawTime: "20:00",
  },
  "lotofacil": {
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
    drawTime: "20:00",
  },
  "lotomania": {
    daysOfWeek: [1, 3, 5], // Segunda (1), Quarta (3) e Sexta (5)
    drawTime: "20:00",
  },
  "dupla-sena": {
    daysOfWeek: [1, 3, 5], // Segunda (1), Quarta (3) e Sexta (5)
    drawTime: "20:00",
  },
  "timemania": {
    daysOfWeek: [2, 4, 6], // Terça (2), Quinta (4) e Sábado (6)
    drawTime: "20:00",
  },
  "mais-milionaria": {
    daysOfWeek: [3, 6], // Quarta (3) e Sábado (6)
    drawTime: "20:00",
  },
  "federal": {
    daysOfWeek: [3, 6], // Quarta (3) e Sábado (6)
    drawTime: "19:00",
  },
  "dia-de-sorte": {
    daysOfWeek: [2, 4, 6], // Terça (2), Quinta (4) e Sábado (6)
    drawTime: "20:00",
  },
  "super-sete": {
    daysOfWeek: [1, 3, 5], // Segunda (1), Quarta (3) e Sexta (5)
    drawTime: "15:00",
  },
};

export const specialPrizeThresholds: Record<string, number> = {
  "mega-sena": 50000000, // R$ 50 milhões
  "quina": 15000000, // R$ 15 milhões
  "lotofacil": 5000000, // R$ 5 milhões
  "lotomania": 10000000, // R$ 10 milhões
  "dupla-sena": 20000000, // R$ 20 milhões
  "timemania": 8000000, // R$ 8 milhões
  "mais-milionaria": 100000000, // R$ 100 milhões
  "federal": 500000, // R$ 500 mil (prêmio fixo - não acumula)
  "dia-de-sorte": 10000000, // R$ 10 milhões
  "super-sete": 5000000, // R$ 5 milhões
};

export interface UpcomingDraw {
  contestNumber: number;
  drawDate: Date;
  estimatedPrize: number;
  status: "HOJE" | "AMANHÃ" | "ESPECIAL" | null;
  dayOfWeek: string;
}

const getNextDrawDate = (
  currentDate: Date,
  daysOfWeek: number[],
  drawTime: string
): Date => {
  const [hours, minutes] = drawTime.split(":").map(Number);
  const nextDate = new Date(currentDate);
  
  // Procurar o próximo dia válido
  let daysToAdd = 1;
  while (daysToAdd <= 7) {
    nextDate.setDate(currentDate.getDate() + daysToAdd);
    if (daysOfWeek.includes(nextDate.getDay())) {
      nextDate.setHours(hours, minutes, 0, 0);
      return nextDate;
    }
    daysToAdd++;
  }
  
  // Fallback: adicionar 1 dia
  nextDate.setDate(currentDate.getDate() + 1);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate;
};

export const generateUpcomingDraws = (
  lotteryType: string,
  currentDrawInfo: LotteryDrawInfo,
  count: number = 7
): UpcomingDraw[] => {
  const periodicity = lotteryPeriodicities[lotteryType];
  
  if (!periodicity) {
    // Fallback: retornar apenas o próximo concurso da API
    return [
      {
        contestNumber: currentDrawInfo.nextDrawNumber,
        drawDate: currentDrawInfo.nextDrawDate,
        estimatedPrize: currentDrawInfo.estimatedPrize,
        status: getDrawStatus(currentDrawInfo.nextDrawDate, currentDrawInfo.estimatedPrize, lotteryType),
        dayOfWeek: getDayOfWeek(currentDrawInfo.nextDrawDate),
      },
    ];
  }

  const upcomingDraws: UpcomingDraw[] = [];
  let currentDate = currentDrawInfo.nextDrawDate;
  let currentContestNumber = currentDrawInfo.nextDrawNumber;

  for (let i = 0; i < count; i++) {
    const drawDate = i === 0 ? currentDate : getNextDrawDate(currentDate, periodicity.daysOfWeek, periodicity.drawTime);
    
    upcomingDraws.push({
      contestNumber: currentContestNumber,
      drawDate,
      estimatedPrize: currentDrawInfo.estimatedPrize, // Usar o mesmo prêmio estimado
      status: getDrawStatus(drawDate, currentDrawInfo.estimatedPrize, lotteryType),
      dayOfWeek: getDayOfWeek(drawDate),
    });

    currentDate = drawDate;
    currentContestNumber++;
  }

  return upcomingDraws;
};

export const getDrawStatus = (
  drawDate: Date,
  estimatedPrize: number,
  lotteryType: string
): "HOJE" | "AMANHÃ" | "ESPECIAL" | null => {
  if (isToday(drawDate)) {
    return "HOJE";
  }
  if (isTomorrow(drawDate)) {
    return "AMANHÃ";
  }
  if (isSpecialDraw(estimatedPrize, lotteryType)) {
    return "ESPECIAL";
  }
  return null;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

export const isSpecialDraw = (estimatedPrize: number, lotteryType: string): boolean => {
  const threshold = specialPrizeThresholds[lotteryType];
  return threshold ? estimatedPrize >= threshold : false;
};

export const getDayOfWeek = (date: Date): string => {
  const days = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return days[date.getDay()];
};
