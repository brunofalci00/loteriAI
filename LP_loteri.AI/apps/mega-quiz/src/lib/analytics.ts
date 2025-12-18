declare global {
  type FacebookCapiHandler = (options?: Record<string, unknown>) => void;

  interface Window {
    fbq?: (...args: unknown[]) => void;
    fbCAPI_trackViewContent?: FacebookCapiHandler;
    fbCAPI_trackPageView?: FacebookCapiHandler;
    fbCAPI_trackLead?: FacebookCapiHandler;
    fbCAPI_trackCompleteRegistration?: FacebookCapiHandler;
    fbCAPI_trackAddToCart?: FacebookCapiHandler;
    // InitiateCheckout é enviado pela PerfectPay.
    fbCAPI_trackPurchase?: FacebookCapiHandler;
  }
}

export const trackPixelEvent = (event: string, payload?: Record<string, unknown>) => {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) return;

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", event, payload);

    if (event === "QuizEntryStart") {
      window.fbq("track", "Lead", { content_name: "Quiz Iniciado" });
    }

    if (event === "QuizBonusUnlocked") {
      window.fbq("track", "CompleteRegistration", { content_name: "Quiz Completo" });
    }

    if (event === "CheckoutClick") {
      window.fbq("track", "AddToCart", { value: 147, currency: "BRL" });
    }
  }

  const capiEventMap: Record<
    string,
    { handler: keyof Pick<Window, "fbCAPI_trackLead" | "fbCAPI_trackCompleteRegistration" | "fbCAPI_trackAddToCart">;
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
      defaults: { contentName: "Oferta LOTER.IA", value: 147, currency: "BRL" },
    },
    WhatsAppSupportClick: {
      handler: "fbCAPI_trackLead",
      defaults: { contentName: "Suporte WhatsApp" },
    },
    MaxWinCTA: {
      handler: "fbCAPI_trackAddToCart",
      defaults: { contentName: "CTA Pré-Checkout", value: 147, currency: "BRL" },
    },
    CheckoutClick: {
      handler: "fbCAPI_trackAddToCart",
      defaults: { contentName: "Clique Checkout (PerfectPay)", value: 147, currency: "BRL" },
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
