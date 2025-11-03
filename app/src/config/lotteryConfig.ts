/**
 * Configurações das loterias disponíveis para criação manual
 *
 * Apenas loterias com formato simples (escolher X números de Y a Z)
 * estão incluídas aqui. Loterias complexas (+Milionária com trevos,
 * Federal com bilhetes, Super Sete com colunas) não são suportadas.
 *
 * @author Claude Code
 * @date 2025-01-03
 */

export type LotteryType =
  | 'megasena'
  | 'quina'
  | 'lotofacil'
  | 'lotomania'
  | 'dupla_sena'
  | 'timemania';

export interface LotteryConfig {
  id: LotteryType;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  numbersToSelect: number; // Quantidade de números que o usuário deve escolher
  minNumber: number; // Número mínimo (geralmente 1)
  maxNumber: number; // Número máximo do range
  drawDays: string; // Dias de sorteio
  color: string; // Cor para UI
}

export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  megasena: {
    id: 'megasena',
    name: 'mega-sena',
    displayName: 'Mega-Sena',
    description: '6 números entre 1 e 60',
    icon: '🎱',
    numbersToSelect: 6,
    minNumber: 1,
    maxNumber: 60,
    drawDays: 'Quarta e Sábado',
    color: 'emerald'
  },
  quina: {
    id: 'quina',
    name: 'quina',
    displayName: 'Quina',
    description: '5 números entre 1 e 80',
    icon: '⭐',
    numbersToSelect: 5,
    minNumber: 1,
    maxNumber: 80,
    drawDays: 'Segunda a Sábado',
    color: 'blue'
  },
  lotofacil: {
    id: 'lotofacil',
    name: 'lotofacil',
    displayName: 'Lotofácil',
    description: '15 números entre 1 e 25',
    icon: '🎯',
    numbersToSelect: 15,
    minNumber: 1,
    maxNumber: 25,
    drawDays: 'Segunda a Sábado',
    color: 'purple'
  },
  lotomania: {
    id: 'lotomania',
    name: 'lotomania',
    displayName: 'Lotomania',
    description: '50 números entre 1 e 100',
    icon: '🔮',
    numbersToSelect: 50,
    minNumber: 1,
    maxNumber: 100,
    drawDays: 'Terça, Quinta e Sábado',
    color: 'pink'
  },
  dupla_sena: {
    id: 'dupla_sena',
    name: 'dupla-sena',
    displayName: 'Dupla Sena',
    description: '6 números entre 1 e 50',
    icon: '🎲',
    numbersToSelect: 6,
    minNumber: 1,
    maxNumber: 50,
    drawDays: 'Terça, Quinta e Sábado',
    color: 'red'
  },
  timemania: {
    id: 'timemania',
    name: 'timemania',
    displayName: 'Timemania',
    description: '10 números entre 1 e 80',
    icon: '⚽',
    numbersToSelect: 10,
    minNumber: 1,
    maxNumber: 80,
    drawDays: 'Terça, Quinta e Sábado',
    color: 'green'
  }
};

// Helper functions
export function getLotteryConfig(lotteryType: LotteryType): LotteryConfig {
  return LOTTERY_CONFIGS[lotteryType];
}

export function getAllSupportedLotteries(): LotteryConfig[] {
  return Object.values(LOTTERY_CONFIGS);
}

export function isLotterySupported(lotteryType: string): boolean {
  return lotteryType in LOTTERY_CONFIGS;
}
