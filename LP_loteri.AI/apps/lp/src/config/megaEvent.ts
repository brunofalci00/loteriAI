/**
 * Mega da Virada Event Configuration
 * Configuration for the special Mega da Virada event
 */

export const MEGA_EVENT_CONFIG = {
  enabled: true,
  eventName: "Mega da Virada 2025",
  eventDate: new Date(2025, 11, 31), // December 31, 2025
  prizeAmount: 850000000, // R$ 850 milhões
  lotteryType: "mega-sena",
  lotteryName: "Mega-Sena",
  specialTheme: "golden", // golden color theme for the event
};

export const isMegaEventActive = (): boolean => {
  const now = new Date();
  return now < MEGA_EVENT_CONFIG.eventDate;
};

export default MEGA_EVENT_CONFIG;
