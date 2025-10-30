/**
 * Calculadora de Probabilidades para Loterias
 * Usa combinatória real e distribuição hipergeométrica
 */

/**
 * Calcula o coeficiente binomial C(n, k) = n! / (k! * (n-k)!)
 * Usa algoritmo otimizado para evitar overflow com fatoriais grandes
 */
export const combination = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  // Otimização: C(n, k) = C(n, n-k), usar o menor
  k = Math.min(k, n - k);

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i);
    result /= (i + 1);
  }

  return Math.round(result);
};

/**
 * Configurações de cada loteria
 */
interface LotteryConfig {
  totalNumbers: number;      // Total de números disponíveis
  drawSize: number;           // Quantos números são sorteados
  minHit: number;             // Mínimo de acertos para ganhar
  prizeRanges: number[];      // Faixas de premiação
}

const lotteryConfigs: Record<string, LotteryConfig> = {
  "lotofacil": {
    totalNumbers: 25,
    drawSize: 15,
    minHit: 11,
    prizeRanges: [11, 12, 13, 14, 15],
  },
  "mega-sena": {
    totalNumbers: 60,
    drawSize: 6,
    minHit: 4,
    prizeRanges: [4, 5, 6],
  },
  "quina": {
    totalNumbers: 80,
    drawSize: 5,
    minHit: 2,
    prizeRanges: [2, 3, 4, 5],
  },
  "dupla-sena": {
    totalNumbers: 50,
    drawSize: 6,
    minHit: 3,
    prizeRanges: [3, 4, 5, 6],
  },
  "timemania": {
    totalNumbers: 80,
    drawSize: 10,
    minHit: 3,
    prizeRanges: [3, 4, 5, 6, 7],
  },
  "lotomania": {
    totalNumbers: 100,
    drawSize: 20,
    minHit: 15,
    prizeRanges: [15, 16, 17, 18, 19, 20],
  },
};

/**
 * Calcula a probabilidade de acertar EXATAMENTE k números
 * Usa distribuição hipergeométrica:
 * P(X = k) = C(escolhidos, k) * C(não_escolhidos, sorteados - k) / C(total, sorteados)
 */
const hypergeometricProbability = (
  totalNumbers: number,
  drawSize: number,
  numbersChosen: number,
  hits: number
): number => {
  // Validações
  if (hits > Math.min(numbersChosen, drawSize)) return 0;
  if (hits < Math.max(0, numbersChosen + drawSize - totalNumbers)) return 0;

  const chosen = numbersChosen;
  const notChosen = totalNumbers - chosen;
  const drawn = drawSize;
  const notDrawn = drawn - hits;

  // P = C(chosen, hits) * C(notChosen, notDrawn) / C(total, drawn)
  const numerator = combination(chosen, hits) * combination(notChosen, notDrawn);
  const denominator = combination(totalNumbers, drawn);

  return numerator / denominator;
};

/**
 * Calcula a probabilidade de acertar PELO MENOS k números (k ou mais)
 */
const cumulativeProbability = (
  totalNumbers: number,
  drawSize: number,
  numbersChosen: number,
  minHits: number
): number => {
  let probability = 0;
  const maxPossibleHits = Math.min(numbersChosen, drawSize);

  for (let k = minHits; k <= maxPossibleHits; k++) {
    probability += hypergeometricProbability(
      totalNumbers,
      drawSize,
      numbersChosen,
      k
    );
  }

  return probability;
};

/**
 * Calcula probabilidades para UMA cartela em todas as faixas de premiação
 */
export const calculateSingleTicketProbabilities = (
  lotteryType: string,
  numbersChosen: number
): Record<number, number> => {
  const config = lotteryConfigs[lotteryType];

  if (!config) {
    console.warn(`Loteria ${lotteryType} não configurada`);
    return {};
  }

  const probabilities: Record<number, number> = {};

  // Calcula probabilidade para cada faixa de premiação
  config.prizeRanges.forEach(hits => {
    const prob = cumulativeProbability(
      config.totalNumbers,
      config.drawSize,
      numbersChosen,
      hits
    );

    // Converte para porcentagem e limita a 2 casas decimais
    probabilities[hits] = Math.min(parseFloat((prob * 100).toFixed(2)), 100);
  });

  return probabilities;
};

/**
 * Calcula probabilidade com MÚLTIPLAS cartelas
 * Fórmula: P_total = 1 - (1 - P_individual)^n_cartelas
 *
 * Eventos independentes: cada cartela é uma nova tentativa
 */
export const calculateMultipleTicketsProbability = (
  singleTicketProb: number,
  numberOfTickets: number
): number => {
  if (numberOfTickets === 1) return singleTicketProb;

  // Converte % para decimal se necessário
  const probDecimal = singleTicketProb > 1 ? singleTicketProb / 100 : singleTicketProb;

  // P_total = 1 - (1 - p)^n
  const totalProb = 1 - Math.pow(1 - probDecimal, numberOfTickets);

  // Converte para % e limita
  return Math.min(parseFloat((totalProb * 100).toFixed(2)), 100);
};

/**
 * Calcula todas as probabilidades considerando número de cartelas
 */
export const calculateProbabilitiesWithTickets = (
  lotteryType: string,
  numbersChosen: number,
  numberOfTickets: number
): Record<number, number> => {
  const singleTicketProbs = calculateSingleTicketProbabilities(lotteryType, numbersChosen);

  if (numberOfTickets === 1) {
    return singleTicketProbs;
  }

  // Aplica fórmula de múltiplas cartelas para cada faixa
  const multipleTicketsProbs: Record<number, number> = {};

  Object.entries(singleTicketProbs).forEach(([hits, prob]) => {
    multipleTicketsProbs[Number(hits)] = calculateMultipleTicketsProbability(prob, numberOfTickets);
  });

  return multipleTicketsProbs;
};

/**
 * Calcula o aumento percentual ao adicionar mais cartelas
 */
export const calculateProbabilityIncrease = (
  lotteryType: string,
  numbersChosen: number,
  fromTickets: number,
  toTickets: number
): number => {
  const config = lotteryConfigs[lotteryType];
  if (!config) return 0;

  // Usa a menor faixa de premiação como referência
  const minHit = config.minHit;

  const probFrom = calculateSingleTicketProbabilities(lotteryType, numbersChosen)[minHit] || 0;
  const probWithFrom = calculateMultipleTicketsProbability(probFrom, fromTickets);
  const probWithTo = calculateMultipleTicketsProbability(probFrom, toTickets);

  return parseFloat((probWithTo - probWithFrom).toFixed(2));
};
