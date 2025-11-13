/**
 * Milestone Service
 *
 * Gerencia milestones de jogos salvos (10/25/50)
 * - Rastreia quais milestones foram celebrados
 * - Detecta novos milestones atingidos
 * - Persiste no localStorage
 *
 * @author Claude Code
 * @date 2025-01-03
 */

const STORAGE_KEY = 'loter_ia_milestones';

export type MilestoneLevel = 10 | 25 | 50;

export interface MilestoneData {
  level: MilestoneLevel;
  title: string;
  description: string;
  emoji: string;
  badge: string;
}

interface MilestoneHistory {
  celebrated: MilestoneLevel[];
  lastCheck: number; // Total de jogos salvos no último check
}

/**
 * Definições dos milestones
 */
export const MILESTONES: Record<MilestoneLevel, MilestoneData> = {
  10: {
    level: 10,
    title: 'Primeiro Marco!',
    description: 'Você salvou seus primeiros 10 jogos',
    emoji: '🎯',
    badge: 'Colecionador Iniciante',
  },
  25: {
    level: 25,
    title: 'Quarto de Século!',
    description: 'Você já tem 25 jogos na sua coleção',
    emoji: '🏆',
    badge: 'Colecionador Experiente',
  },
  50: {
    level: 50,
    title: 'Mestre da Sorte!',
    description: 'Você atingiu o máximo de 50 jogos salvos',
    emoji: '👑',
    badge: 'Colecionador Master',
  },
};

/**
 * Obtém histórico de milestones do localStorage
 */
function getMilestoneHistory(): MilestoneHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        celebrated: [],
        lastCheck: 0,
      };
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('Erro ao ler milestones:', error);
    return {
      celebrated: [],
      lastCheck: 0,
    };
  }
}

/**
 * Salva histórico de milestones no localStorage
 */
function saveMilestoneHistory(history: MilestoneHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Erro ao salvar milestones:', error);
  }
}

/**
 * Verifica se um milestone específico já foi celebrado
 */
export function isMilestoneCelebrated(level: MilestoneLevel): boolean {
  const history = getMilestoneHistory();
  return history.celebrated.includes(level);
}

/**
 * Marca um milestone como celebrado
 */
export function markMilestoneCelebrated(level: MilestoneLevel, currentTotal: number): void {
  const history = getMilestoneHistory();

  if (!history.celebrated.includes(level)) {
    history.celebrated.push(level);
  }

  history.lastCheck = currentTotal;
  saveMilestoneHistory(history);

  console.log(`✅ Milestone ${level} celebrado. Total: ${currentTotal}`);
}

/**
 * Detecta se um novo milestone foi atingido
 * Retorna o milestone a ser celebrado ou null
 */
export function checkNewMilestone(currentTotal: number): MilestoneData | null {
  const history = getMilestoneHistory();

  // Verificar milestones em ordem crescente
  const milestones: MilestoneLevel[] = [10, 25, 50];

  for (const level of milestones) {
    // Se atingiu o milestone e ainda não foi celebrado
    if (currentTotal >= level && !history.celebrated.includes(level)) {
      console.log(`🎉 Novo milestone atingido: ${level} jogos`);
      return MILESTONES[level];
    }
  }

  return null;
}

/**
 * Obtém próximo milestone a ser atingido
 */
export function getNextMilestone(currentTotal: number): MilestoneData | null {
  const milestones: MilestoneLevel[] = [10, 25, 50];

  for (const level of milestones) {
    if (currentTotal < level) {
      return MILESTONES[level];
    }
  }

  // Já atingiu todos os milestones
  return null;
}

/**
 * Calcula progresso até o próximo milestone
 */
export function getMilestoneProgress(currentTotal: number): {
  current: number;
  next: MilestoneLevel | null;
  progress: number; // 0-100
  remaining: number;
} {
  const next = getNextMilestone(currentTotal);

  if (!next) {
    // Todos os milestones atingidos
    return {
      current: currentTotal,
      next: null,
      progress: 100,
      remaining: 0,
    };
  }

  // Calcular milestone anterior
  const milestones: MilestoneLevel[] = [10, 25, 50];
  const currentIndex = milestones.indexOf(next.level);
  const previous = currentIndex > 0 ? milestones[currentIndex - 1] : 0;

  const range = next.level - previous;
  const currentProgress = currentTotal - previous;
  const progress = Math.min(100, (currentProgress / range) * 100);

  return {
    current: currentTotal,
    next: next.level,
    progress: Math.round(progress),
    remaining: next.level - currentTotal,
  };
}

/**
 * Reseta todos os milestones (apenas para debug/testes)
 */
export function resetMilestones(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Milestones resetados');
}

/**
 * Obtém estatísticas de milestones
 */
export function getMilestoneStats(): {
  totalCelebrated: number;
  levels: MilestoneLevel[];
  allCompleted: boolean;
} {
  const history = getMilestoneHistory();

  return {
    totalCelebrated: history.celebrated.length,
    levels: history.celebrated,
    allCompleted: history.celebrated.length === 3, // 10, 25, 50
  };
}
