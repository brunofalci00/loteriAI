/**
 * Feature Flags Configuration
 *
 * Controla a disponibilidade de features no app
 * Configurável via env vars
 */

export const featureFlags = {
  megaEventEnabled:
    (import.meta.env?.VITE_MEGA_EVENT_ENABLED ?? "true").toLowerCase() === "true",
};

export const isMegaEventEnabled = featureFlags.megaEventEnabled;
