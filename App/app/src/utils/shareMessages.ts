/**
 * Share Messages Utility
 *
 * Mensagens humanizadas para compartilhamento viral
 * Estratégia: Base padronizada + contexto personalizado
 *
 * Padrão: Amigo para amigo, natural, sem exageros
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import type { ShareContext, ShareEventData, ShareNumbersPayload } from '@/types/share';
import { formatCompactSharePayload } from '@/utils/sharePayloadFormatter';

const BASE_MESSAGE = "Testei esse app de loteria com IA e curti\n\n";
const LINK = "\n\nhttps://www.fqdigital.com.br/";

/**
 * Contexto #1: Score alto em jogo manual (4.0+)
 * Momento: Step4_AnalysisResult quando score >= 4.0
 * Tier: S (15-25% conversion)
 */
export function formatScoreHighMessage(score: number): string {
  const scoreRounded = score.toFixed(1);
  return BASE_MESSAGE +
    `Criei um jogo manual e a análise deu ${scoreRounded}/5 ⭐\n` +
    `Ficou acima da média` +
    LINK;
}

/**
 * Contexto #2: 5 Variações geradas pela IA
 * Momento: VariationsGrid após carregar variações
 * Tier: S (15-25% conversion)
 */
export function formatVariationsMessage(): string {
  return BASE_MESSAGE +
    `A IA criou 5 versões diferentes do meu jogo\n` +
    `Cada uma com estratégia diferente` +
    LINK;
}

/**
 * Contexto #3: Taxa de acerto alta (75%+)
 * Momento: ResultsDisplay quando accuracyRate >= 75%
 * Tier: S (15-25% conversion)
 */
export function formatHighRateMessage(accuracyRate: number): string {
  const rateRounded = Math.round(accuracyRate);
  return BASE_MESSAGE +
    `Gerou jogos com ${rateRounded}% de taxa de acerto\n` +
    `Bem acima da média` +
    LINK;
}

/**
 * Contexto #4: Primeira geração (onboarding)
 * Momento: Modal após primeira geração bem-sucedida
 * Tier: A (10-15% conversion)
 */
export function formatFirstGenerationMessage(): string {
  return BASE_MESSAGE +
    `Acabei de gerar meu primeiro jogo com IA\n` +
    `A análise ficou massa` +
    LINK;
}

/**
 * Contexto #5: Milestones de jogos salvos (10/25/50)
 * Momento: SavedGamesPage ao atingir milestone
 * Tier: A (10-15% conversion)
 */
export function formatMilestoneMessage(milestone: number): string {
  return BASE_MESSAGE +
    `Já salvei ${milestone} jogos diferentes\n` +
    `O app analisa cada um` +
    LINK;
}

/**
 * Contexto #6: Análise detalhada completa
 * Momento: Modal de análise detalhada
 * Tier: B (5-10% conversion)
 */
export function formatDetailedAnalysisMessage(): string {
  return BASE_MESSAGE +
    `Tem análise completa de números quentes, frios, pares\n` +
    `Tudo automatizado` +
    LINK;
}

// ============================================
// Variações A/B Testing
// ============================================

/**
 * Variação alternativa para score alto
 * Para testes A/B
 */
export function formatScoreHighMessageAlt(score: number): string {
  const scoreRounded = score.toFixed(1);
  return `Achei esse app de loteria que analisa com IA\n\n` +
    `Fiz um jogo aqui e ficou bem avaliado (${scoreRounded}/5)\n\n` +
    `www.fqdigital.com.br`;
}

/**
 * Variação alternativa para variações
 * Para testes A/B
 */
export function formatVariationsMessageAlt(): string {
  return `Tem um app de loteria que gera variações automáticas\n\n` +
    `Ele criou 5 versões do meu jogo, cada uma diferente\n\n` +
    `www.fqdigital.com.br`;
}

/**
 * Variação alternativa para taxa alta
 * Para testes A/B
 */
export function formatHighRateMessageAlt(accuracyRate: number): string {
  const rateRounded = Math.round(accuracyRate);
  return `Testei esse app de IA pra loteria\n\n` +
    `Taxa de acerto: ${rateRounded}%\n` +
    `Bem melhor que o normal\n\n` +
    `www.fqdigital.com.br`;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Determina qual mensagem usar baseado no contexto
 * Útil para decisões dinâmicas
 */
function appendPayloadDetails(
  message: string,
  payload?: ShareNumbersPayload
): string {
  if (!payload) return message;

  const payloadText = formatCompactSharePayload(payload);
  if (!payloadText) return message;

  if (message.includes(LINK)) {
    return message.replace(LINK, `\n\n${payloadText}${LINK}`);
  }

  return `${message}\n\n${payloadText}`;
}

export function getMessageForContext(
  context: ShareContext,
  data?: ShareEventData,
  payload?: ShareNumbersPayload
): string {
  let message: string;

  switch (context) {
    case 'score':
      message = data?.score ? formatScoreHighMessage(data.score) : BASE_MESSAGE + LINK;
      break;
    case 'variations':
      message = formatVariationsMessage();
      break;
    case 'high-rate':
      message = data?.accuracyRate ? formatHighRateMessage(data.accuracyRate) : BASE_MESSAGE + LINK;
      break;
    case 'first-gen':
      message = formatFirstGenerationMessage();
      break;
    case 'milestone':
      message = data?.milestone ? formatMilestoneMessage(data.milestone) : BASE_MESSAGE + LINK;
      break;
    case 'detailed':
      message = formatDetailedAnalysisMessage();
      break;
    default:
      message = BASE_MESSAGE + LINK;
  }

  return appendPayloadDetails(message, payload);
}

/**
 * Retorna versão A/B baseado em randomização
 * 50% chance de cada versão
 */
export function getABTestMessage(
  context: 'score' | 'variations' | 'high-rate',
  data?: ShareEventData,
  payload?: ShareNumbersPayload
): string {
  const useVariantB = Math.random() > 0.5;

  if (!useVariantB) {
    // Versão original
    return getMessageForContext(context, data, payload);
  }

  // Versão alternativa
  let message: string;

  switch (context) {
    case 'score':
      message = data?.score ? formatScoreHighMessageAlt(data.score) : BASE_MESSAGE + LINK;
      break;
    case 'variations':
      message = formatVariationsMessageAlt();
      break;
    case 'high-rate':
      message = data?.accuracyRate ? formatHighRateMessageAlt(data.accuracyRate) : BASE_MESSAGE + LINK;
      break;
    default:
      message = BASE_MESSAGE + LINK;
  }

  return appendPayloadDetails(message, payload);
}
