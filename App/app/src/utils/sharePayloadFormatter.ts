import type { ShareNumbersPayload } from '@/types/share';

interface FormatOptions {
  maxNumbers?: number;
}

const DEFAULT_MAX_NUMBERS = 15;

const formatNumber = (value: number) => value.toString().padStart(2, '0');

export function formatCompactSharePayload(
  payload?: ShareNumbersPayload,
  options: FormatOptions = {}
): string {
  if (!payload || !payload.numbers || payload.numbers.length === 0) {
    return '';
  }

  const maxNumbers = options.maxNumbers ?? DEFAULT_MAX_NUMBERS;

  const headerParts: string[] = [];
  if (payload.lotteryName) {
    headerParts.push(payload.lotteryName);
  } else if (payload.lotteryType) {
    headerParts.push(payload.lotteryType);
  }

  if (payload.contestNumber) {
    headerParts.push(`Concurso #${payload.contestNumber}`);
  }

  const numbersLine = payload.numbers
    .slice(0, maxNumbers)
    .map(formatNumber)
    .join(' ');

  const statsParts: string[] = [];
  if (typeof payload.hotCount === 'number') {
    statsParts.push(`🔥 ${payload.hotCount} quentes`);
  }
  if (typeof payload.coldCount === 'number') {
    statsParts.push(`❄️ ${payload.coldCount} frios`);
  }
  if (typeof payload.balancedCount === 'number') {
    statsParts.push(`⚖️ ${payload.balancedCount} balanceados`);
  }
  if (payload.strategyLabel) {
    statsParts.push(`🎯 ${payload.strategyLabel}`);
  }

  const lines: string[] = [];
  if (headerParts.length > 0) {
    lines.push(`🎰 ${headerParts.join(' • ')}`);
  }

  lines.push(`🎲 ${numbersLine}`);

  if (statsParts.length > 0) {
    lines.push(statsParts.join(' | '));
  }

  if (payload.source) {
    lines.push(payload.source === 'ai' ? '✨ Gerado pela IA' : '✍️ Selecionado manualmente');
  }

  return lines.join('\n').trim();
}
