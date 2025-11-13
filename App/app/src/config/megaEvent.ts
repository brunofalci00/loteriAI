/**
 * Mega da Virada Event Configuration
 *
 * Sistema unificado usando user_credits
 * Cada ação premium consome 1 crédito mensal
 */

// Criar datas de forma robusta (sem timezone para compatibilidade)
const createEventDate = () => {
  // 13 de Novembro de 2025, 00:00:00 (hora local de São Paulo é UTC-3)
  const eventDate = new Date(2025, 10, 13, 0, 0, 0, 0); // Mês é 0-indexed (10 = Nov)
  return eventDate;
};

const createEndDate = () => {
  // 31 de Dezembro de 2025, 23:59:59
  const endDate = new Date(2025, 11, 31, 23, 59, 59, 0); // Mês 11 = Dec
  return endDate;
};

export const MEGA_EVENT_CONFIG = {
  // Feature flag controlado por env var
  enabled: (import.meta.env?.VITE_MEGA_EVENT_ENABLED ?? "true") === "true",

  // Datas do evento (Mega da Virada especial com análises premium)
  // Estendido: 13 Nov 2025 - 31 Dez 2025 (para aproveitar season de vendas)
  eventDate: createEventDate(),
  endDate: createEndDate(),

  // Informações do prêmio
  prizeAmount: "R$ 850 milhões",
  prizeAmountNumeric: 850000000,

  // Tema visual (dourado)
  theme: {
    gradient: "from-[#f7c948] via-[#ffb347] to-[#f06543]",
    primaryColor: "#f7c948",
    secondaryColor: "#ffb347",
    accentColor: "#f06543",
  },

  // Custo em créditos
  creditsPerAction: 1,
} as const;

/**
 * Verifica se o evento está ativo (dentro do período)
 */
export const isMegaEventActive = (): boolean => {
  if (!MEGA_EVENT_CONFIG.enabled) return false;
  const now = new Date();

  // Log para debug
  console.log("🎉 Mega Event Active Check:", {
    enabled: MEGA_EVENT_CONFIG.enabled,
    now: now.toISOString(),
    eventStart: MEGA_EVENT_CONFIG.eventDate.toISOString(),
    eventEnd: MEGA_EVENT_CONFIG.endDate.toISOString(),
    isActive: now >= MEGA_EVENT_CONFIG.eventDate && now <= MEGA_EVENT_CONFIG.endDate,
  });

  return now >= MEGA_EVENT_CONFIG.eventDate && now <= MEGA_EVENT_CONFIG.endDate;
};
