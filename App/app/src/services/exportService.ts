/**
 * Export Service
 *
 * Serviço para exportação e compartilhamento de jogos:
 * - Formatação de texto para compartilhamento
 * - Compartilhamento via WhatsApp Web
 * - Exportação como arquivo .txt
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import type { SavedGame, SavedGameAnalysisResult } from './savedGamesService';
import type { ShareNumbersPayload } from '@/types/share';
import { formatCompactSharePayload } from '@/utils/sharePayloadFormatter';

/**
 * Mapeia tipo de loteria para nome amigável
 */
const lotteryNames: Record<string, string> = {
  'mega-sena': 'Mega-Sena',
  'quina': 'Quina',
  'lotofacil': 'Lotofácil',
  'lotomania': 'Lotomania',
  'dupla-sena': 'Dupla Sena',
  'timemania': 'Timemania',
};

function buildSharePayloadFromGame(game: SavedGame): ShareNumbersPayload {
  const numbers = Array.isArray(game.numbers) ? game.numbers : [];
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const analysis = game.analysis_result as SavedGameAnalysisResult | null;

  return {
    lotteryType: game.lottery_type,
    lotteryName: lotteryNames[game.lottery_type] || game.lottery_type,
    contestNumber: game.contest_number,
    numbers: sortedNumbers,
    hotCount: analysis?.hotCount ?? undefined,
    coldCount: analysis?.coldCount ?? undefined,
    balancedCount: analysis?.balancedCount ?? undefined,
    strategyLabel: game.strategy_type ?? undefined,
    source: game.source === 'ai_generated' ? 'ai' : 'manual',
  };
}

/**
 * Formata jogo para compartilhamento (WhatsApp e TXT)
 */
export function formatGameForSharing(game: SavedGame): string {
  const payload = buildSharePayloadFromGame(game);
  const compact = formatCompactSharePayload(payload);

  // Formatação de data
  const date = new Date(game.saved_at);
  const dateFormatted = date.toLocaleDateString('pt-BR');
  const timeFormatted = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let text = compact ? `${compact}\n\n` : '';

  if (game.name) {
    text += `📝 *Nome:* ${game.name}\n\n`;
  }

  const strategyNames: Record<string, string> = {
    'balanced': 'Balanceada',
    'hot_focused': 'Focada em Quentes',
    'cold_focused': 'Focada em Frios',
  };

  if (game.strategy_type) {
    text += `🎯 *Estratégia:* ${strategyNames[game.strategy_type] || game.strategy_type}\n`;
  }

  if (typeof payload.hotCount === 'number' || typeof payload.coldCount === 'number') {
    text += `🔥 Quentes: ${payload.hotCount ?? 0} • ❄️ Frios: ${payload.coldCount ?? 0}\n`;
  }

  if (typeof payload.balancedCount === 'number') {
    text += `⚖️ Balanceados: ${payload.balancedCount}\n`;
  }

  text += `✅ *Salvo em:* ${dateFormatted} às ${timeFormatted}\n`;

  if (game.play_count > 0) {
    text += `🎲 *Jogado:* ${game.play_count}x\n`;
  }

  text += `\n💡 *Use LOTER.IA e aumente suas chances:*\n`;
  text += `https://www.fqdigital.com.br/\n`;

  return text;
}

/**
 * Compartilha jogo via WhatsApp Web
 * Abre nova janela com texto pré-formatado
 */
export function shareViaWhatsApp(game: SavedGame): void {
  const text = formatGameForSharing(game);
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Exporta jogo como arquivo .txt
 * Download automático do arquivo
 */
export function exportAsTxt(game: SavedGame): void {
  const text = formatGameForSharing(game);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

  const filename = `loter-ia-${game.lottery_type}-${game.contest_number}-${Date.now()}.txt`;

  // Criar link temporário para download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar URL criada
  URL.revokeObjectURL(link.href);
}
