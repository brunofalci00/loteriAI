const STORAGE_KEY = 'loter_ia_first_generation';

export function isFirstGeneration(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return !stored || stored !== 'true';
  } catch {
    return true;
  }
}

export function markFirstGenerationComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Erro ao marcar primeira geração:', error);
  }
}
