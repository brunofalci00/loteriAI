/**
 * Context: MegaEventContext
 *
 * Fornece informações simples sobre o evento da Mega da Virada:
 * - Se o evento está ativo
 * - Configurações do evento
 *
 * Sistema simplificado: sem "modo mega", apenas flags
 */

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { MEGA_EVENT_CONFIG, isMegaEventActive } from "@/config/megaEvent";

interface MegaEventContextValue {
  isEventActive: boolean;
  eventConfig: typeof MEGA_EVENT_CONFIG;
}

const MegaEventContext = createContext<MegaEventContextValue>({
  isEventActive: false,
  eventConfig: MEGA_EVENT_CONFIG,
});

export const MegaEventProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo<MegaEventContextValue>(
    () => ({
      isEventActive: isMegaEventActive(),
      eventConfig: MEGA_EVENT_CONFIG,
    }),
    []
  );

  return (
    <MegaEventContext.Provider value={value}>
      {children}
    </MegaEventContext.Provider>
  );
};

export const useMegaEvent = () => useContext(MegaEventContext);
