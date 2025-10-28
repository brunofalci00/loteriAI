import { HistoricalDraw } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";
import { getMockDraws, getMockDataAge } from "./lotteryMockData";

const API_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

const lotteryEndpoints: Record<string, string> = {
  "mega-sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "lotomania": "lotomania",
  "dupla-sena": "duplasena",
  "timemania": "timemania",
};

const formatBrazilianDate = (dateString: string): Date => {
  if (!dateString || typeof dateString !== 'string') {
    return new Date();
  }
  
  const parts = dateString.split("/");
  if (parts.length !== 3) {
    return new Date();
  }
  
  const [day, month, year] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  if (isNaN(date.getTime())) {
    return new Date();
  }
  
  return date;
};

const fetchDirectFromCaixa = async (
  lotteryType: string,
  maxDraws: number
): Promise<HistoricalDraw[]> => {
  const endpoint = lotteryEndpoints[lotteryType];
  
  if (!endpoint) {
    throw new Error(`Tipo de loteria não suportado: ${lotteryType}`);
  }

  console.log(`[lotteryHistory] Tentando requisição direta para: ${lotteryType}`);

  // Buscar concurso mais recente
  const latestResponse = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!latestResponse.ok) {
    throw new Error(`Erro ao buscar dados: ${latestResponse.status}`);
  }

  const latestData = await latestResponse.json();
  const latestContest = latestData.numero;

  if (!latestContest) {
    throw new Error("Não foi possível obter número do último concurso");
  }

  // Buscar múltiplos concursos em paralelo
  const startContest = Math.max(1, latestContest - maxDraws + 1);
  const promises: Promise<HistoricalDraw | null>[] = [];

  for (let i = latestContest; i >= startContest; i--) {
    promises.push(
      fetch(`${API_BASE_URL}/${endpoint}/${i}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      })
        .then(async (response) => {
          if (!response.ok) return null;
          const data = await response.json();
          return {
            contestNumber: data.numero,
            drawDate: formatBrazilianDate(data.dataApuracao),
            numbers: data.listaDezenas?.map((n: string) => parseInt(n)) || [],
          };
        })
        .catch(() => null)
    );
  }

  const results = await Promise.all(promises);
  const draws = results.filter((draw): draw is HistoricalDraw => draw !== null);

  if (draws.length === 0) {
    throw new Error("Nenhum concurso válido encontrado");
  }

  console.log(`[lotteryHistory] Sucesso via requisição direta: ${draws.length} concursos`);
  return draws;
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
  // TENTATIVA 1: Requisição Direta (funciona!)
  try {
    const draws = await fetchDirectFromCaixa(lotteryType, maxDraws);
    return { draws, source: "api" };
  } catch (directError) {
    console.warn("[lotteryHistory] Requisição direta falhou, tentando proxy:", directError);
    
    // TENTATIVA 2: Edge Function Proxy
    try {
      console.log(`[lotteryHistory] Tentando buscar via proxy: ${lotteryType}`);
      const draws = await fetchFromProxy(lotteryType, maxDraws);
      console.log(`[lotteryHistory] Sucesso via proxy: ${draws.length} concursos`);
      return { draws, source: "api" };
    } catch (proxyError) {
      console.warn("[lotteryHistory] Proxy falhou, tentando mock data:", proxyError);
      
      // TENTATIVA 3: Dados Mock
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
