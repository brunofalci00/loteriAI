/**
 * Tabela de custos das loterias Caixa por quantidade de números apostados
 * Valores atualizados em Julho de 2025
 */

export type LotteryCostTable = Record<number, number>;

export const lotteryCosts: Record<string, LotteryCostTable> = {
  "mega-sena": {
    6: 6.00,
    7: 42.00,
    8: 168.00,
    9: 504.00,
    10: 1260.00,
    11: 2772.00,
    12: 5544.00,
    13: 10296.00,
    14: 18018.00,
    15: 30030.00,
    16: 48048.00,
    17: 74256.00,
    18: 111384.00,
    19: 162792.00,
    20: 232560.00,
  },

  "quina": {
    5: 3.00,
    6: 18.00,
    7: 63.00,
    8: 168.00,
    9: 378.00,
    10: 756.00,
    11: 1386.00,
    12: 2376.00,
    13: 3861.00,
    14: 5940.00,
    15: 8751.00,
  },

  "lotofacil": {
    15: 3.50,
    16: 56.00,
    17: 476.00,
    18: 2720.00,
    19: 13566.00,
    20: 54264.00,
  },

  "dupla-sena": {
    6: 3.00,
    7: 21.00,
    8: 84.00,
    9: 252.00,
    10: 630.00,
    11: 1386.00,
    12: 2772.00,
    13: 5148.00,
    14: 9009.00,
    15: 15015.00,
  },

  "lotomania": {
    50: 3.00, // Aposta única
  },

  "timemania": {
    10: 3.00, // Aposta única
  },
};

/**
 * Retorna o custo de uma aposta baseado no tipo de loteria e quantidade de números
 */
export const getBetCost = (lotteryType: string, numbersCount: number): number => {
  const costs = lotteryCosts[lotteryType];
  if (!costs) return 0;
  return costs[numbersCount] || 0;
};

/**
 * Retorna as opções disponíveis de quantidade de números para uma loteria
 */
export const getAvailableNumberOptions = (lotteryType: string): number[] => {
  const costs = lotteryCosts[lotteryType];
  if (!costs) return [];
  return Object.keys(costs).map(Number).sort((a, b) => a - b);
};

/**
 * Retorna a quantidade mínima de números para uma loteria
 */
export const getMinNumbers = (lotteryType: string): number => {
  const options = getAvailableNumberOptions(lotteryType);
  return options[0] || 0;
};

/**
 * Retorna a quantidade máxima de números para uma loteria
 */
export const getMaxNumbers = (lotteryType: string): number => {
  const options = getAvailableNumberOptions(lotteryType);
  return options[options.length - 1] || 0;
};
