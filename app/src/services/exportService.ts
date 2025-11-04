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

import type { SavedGame } from './savedGamesService';

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

/**
 * Formata jogo para compartilhamento (WhatsApp e TXT)
 */
export function formatGameForSharing(game: SavedGame): string {
  const lotteryName = lotteryNames[game.lottery_type] || game.lottery_type;

  // Formatação de números
  const numbers = Array.isArray(game.numbers) ? game.numbers : [];
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const numbersFormatted = sortedNumbers.map(n => n.toString().padStart(2, '0')).join(', ');

  // Análise do jogo
  const analysis = game.analysis_result as any;
  const hotCount = analysis?.hotCount || 0;
  const coldCount = analysis?.coldCount || 0;
  const balancedCount = analysis?.balancedCount || 0;

  // Formatação de data
  const date = new Date(game.saved_at);
  const dateFormatted = date.toLocaleDateString('pt-BR');
  const timeFormatted = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let text = `🎰 *Jogo ${lotteryName} - Concurso #${game.contest_number}*\n\n`;

  if (game.name) {
    text += `📝 *Nome:* ${game.name}\n\n`;
  }

  text += `📊 *Números ${game.source === 'ai_generated' ? 'gerados pela LOTER.IA' : 'selecionados'}:*\n`;
  text += `${numbersFormatted}\n\n`;

  text += `🔥 *Números quentes:* ${hotCount}\n`;
  text += `❄️ *Números frios:* ${coldCount}\n`;
  text += `⚖️ *Balanceados:* ${balancedCount}\n\n`;

  if (game.strategy_type) {
    const strategyNames: Record<string, string> = {
      'balanced': 'Balanceada',
      'hot_focused': 'Focada em Quentes',
      'cold_focused': 'Focada em Frios',
    };
    text += `🎯 *Estratégia:* ${strategyNames[game.strategy_type] || game.strategy_type}\n\n`;
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
