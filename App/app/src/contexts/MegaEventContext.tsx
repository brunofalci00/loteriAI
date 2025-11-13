/**
 * Context: MegaEventContext
 *
 * Fornece informações simples sobre o evento da Mega da Virada:
 * - Se o evento está ativo
 * - Configurações do evento
 *
 * Sistema simplificado: sem "modo mega", apenas flags
 *
 * IMPORTANTE: megaEvent.ts é importado APENAS dentro do Provider,
 * nunca no escopo do módulo. Isto evita erros de parsing de datas
 * quando o App carrega.
 */

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";

// Importação dinâmica - ocorre apenas quando o Provider é renderizado
const getMegaEventConfig = () => {
  const { MEGA_EVENT_CONFIG, isMegaEventActive } = require("@/config/megaEvent");
  return { MEGA_EVENT_CONFIG, isMegaEventActive };
};

interface MegaEventContextValue {
  isEventActive: boolean;
  eventConfig: any;
}

const MegaEventContext = createContext<MegaEventContextValue>({
  isEventActive: false,
  eventConfig: null,
});

export const MegaEventProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo<MegaEventContextValue>(
    () => {
      const { MEGA_EVENT_CONFIG, isMegaEventActive } = getMegaEventConfig();
      return {
        isEventActive: isMegaEventActive(),
        eventConfig: MEGA_EVENT_CONFIG,
      };
    },
    []
  );

  return (
    <MegaEventContext.Provider value={value}>
      {children}
    </MegaEventContext.Provider>
  );
};

export const useMegaEvent = () => useContext(MegaEventContext);
