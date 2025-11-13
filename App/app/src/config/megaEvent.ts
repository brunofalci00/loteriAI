/**
 * Mega da Virada Event Configuration
 *
 * Sistema unificado usando user_credits
 * Cada ação premium consome 1 crédito mensal
 */

export const MEGA_EVENT_CONFIG = {
  // Feature flag controlado por env var
  enabled: (import.meta.env?.VITE_MEGA_EVENT_ENABLED ?? "true") === "true",

  // Datas do evento (próxima Mega da Virada: 31 Dez 2025 - 07 Jan 2026)
  eventDate: new Date("2025-12-31T23:59:59-03:00"),
  endDate: new Date("2026-01-07T23:59:59-03:00"),

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
  return now <= MEGA_EVENT_CONFIG.endDate;
};
