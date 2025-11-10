declare global {
  type FacebookCapiHandler = (options?: Record<string, unknown>) => void;

  interface Window {
    fbq?: (...args: unknown[]) => void;
    fbCAPI_trackViewContent?: FacebookCapiHandler;
    fbCAPI_trackLead?: FacebookCapiHandler;
    fbCAPI_trackCompleteRegistration?: FacebookCapiHandler;
    fbCAPI_trackAddToCart?: FacebookCapiHandler;
    fbCAPI_trackInitiateCheckout?: FacebookCapiHandler;
    fbCAPI_trackPurchase?: FacebookCapiHandler;
  }
}

export const trackPixelEvent = (event: string, payload?: Record<string, unknown>) => {
  const isBrowser = typeof window !== "undefined";
  if (isBrowser && typeof window.fbq === "function") {
    window.fbq("trackCustom", event, payload);
  }

  if (!isBrowser) return;

  const capiEventMap: Record<
    string,
    { handler: keyof Pick<Window, "fbCAPI_trackLead" | "fbCAPI_trackCompleteRegistration" | "fbCAPI_trackAddToCart" | "fbCAPI_trackInitiateCheckout">;
      defaults?: Record<string, unknown>;
    }
  > = {
    QuizEntryStart: {
      handler: "fbCAPI_trackLead",
      defaults: { contentName: "Quiz Iniciado" },
    },
    QuizBonusUnlocked: {
      handler: "fbCAPI_trackCompleteRegistration",
      defaults: { contentName: "Quiz Completo" },
    },
    SlotMaxWin: {
      handler: "fbCAPI_trackAddToCart",
      defaults: { contentName: "Oferta MAX WIN", value: 37, currency: "BRL" },
    },
    WhatsAppSupportClick: {
      handler: "fbCAPI_trackLead",
      defaults: { contentName: "Suporte WhatsApp" },
    },
    MaxWinCTA: {
      handler: "fbCAPI_trackInitiateCheckout",
      defaults: { contentName: "CTA Pré-Checkout", value: 37, currency: "BRL" },
    },
    CheckoutClick: {
      handler: "fbCAPI_trackInitiateCheckout",
      defaults: { contentName: "Checkout Loter.IA", value: 37, currency: "BRL" },
    },
  };

  const capiConfig = capiEventMap[event];
  if (!capiConfig) return;

  const handler = window[capiConfig.handler] as FacebookCapiHandler | undefined;
  if (typeof handler === "function") {
    handler({ ...(capiConfig.defaults || {}), ...(payload || {}) });
  }
};

export {};
