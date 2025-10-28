import { HistoricalDraw } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";
import { getMockDraws, getMockDataAge } from "./lotteryMockData";

const lotteryEndpoints: Record<string, string> = {
  "mega-sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "lotomania": "lotomania",
  "dupla-sena": "duplasena",
  "timemania": "timemania",
};

const fetchFromProxy = async (
  lotteryType: string,
  maxDraws: number
): Promise<HistoricalDraw[]> => {
  const { data, error } = await supabase.functions.invoke("lottery-proxy", {
    body: {
      lotteryType,
      action: "history",
      maxDraws,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Erro desconhecido ao buscar dados");
  }

  // Convert string dates to Date objects
  return data.data.map((draw: any) => ({
    ...draw,
    drawDate: new Date(draw.drawDate),
  }));
};

export const fetchHistoricalDraws = async (
  lotteryType: string,
  maxDraws: number = 100
): Promise<{
  draws: HistoricalDraw[];
  source: "api" | "mock";
  warning?: string;
}> => {
  // TENTATIVA 1: Edge Function Proxy
  try {
    console.log(`[lotteryHistory] Tentando buscar via proxy: ${lotteryType}`);
    const draws = await fetchFromProxy(lotteryType, maxDraws);
    console.log(`[lotteryHistory] Sucesso via proxy: ${draws.length} concursos`);
    return { draws, source: "api" };
  } catch (proxyError) {
    console.warn("[lotteryHistory] Proxy falhou, tentando mock data:", proxyError);
    
    // TENTATIVA 2: Dados Mock
    try {
      const mockDraws = getMockDraws(lotteryType, maxDraws);
      const age = getMockDataAge(lotteryType);
      
      console.log(`[lotteryHistory] Usando mock data: ${mockDraws.length} concursos (${age} dias atrás)`);
      
      return {
        draws: mockDraws,
        source: "mock",
        warning: `Usando dados históricos salvos (última atualização: ${age} ${age === 1 ? 'dia' : 'dias'} atrás)`,
      };
    } catch (mockError) {
      console.error("[lotteryHistory] Mock data também falhou:", mockError);
      throw new Error("Não foi possível obter dados históricos. Tente novamente mais tarde.");
    }
  }
};

export const fetchDrawByNumber = async (
  lotteryType: string,
  contestNumber: number
): Promise<HistoricalDraw | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("lottery-proxy", {
      body: {
        lotteryType,
        action: "byNumber",
        contestNumber,
      },
    });

    if (error || !data?.success) {
      return null;
    }

    return {
      ...data.data,
      drawDate: new Date(data.data.drawDate),
    };
  } catch (error) {
    console.error(`Erro ao buscar concurso ${contestNumber}:`, error);
    return null;
  }
};
