import { HistoricalDraw } from "@/types/analysis";
import { formatBrazilianDate } from "./lotteryApi";

const API_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

const lotteryEndpoints: Record<string, string> = {
  "mega-sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "lotomania": "lotomania",
  "dupla-sena": "duplasena",
  "timemania": "timemania",
};

export const fetchHistoricalDraws = async (
  lotteryType: string,
  maxDraws: number = 100
): Promise<HistoricalDraw[]> => {
  const endpoint = lotteryEndpoints[lotteryType];
  
  if (!endpoint) {
    throw new Error(`Tipo de loteria não suportado: ${lotteryType}`);
  }

  try {
    // Primeiro, buscar o último concurso para saber o número atual
    const latestResponse = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!latestResponse.ok) {
      throw new Error(`Erro ao buscar último concurso: ${latestResponse.status}`);
    }

    const latestData = await latestResponse.json();
    const latestContestNumber = latestData.numero;

    // Buscar histórico em lote (últimos N concursos)
    const draws: HistoricalDraw[] = [];
    const startContest = Math.max(1, latestContestNumber - maxDraws + 1);
    
    // Fazer requisições em paralelo (mas limitadas para não sobrecarregar a API)
    const batchSize = 10;
    for (let i = startContest; i <= latestContestNumber; i += batchSize) {
      const batchPromises = [];
      
      for (let j = i; j < Math.min(i + batchSize, latestContestNumber + 1); j++) {
        batchPromises.push(
          fetch(`${API_BASE_URL}/${endpoint}/${j}`, {
            method: "GET",
            headers: { "Accept": "application/json" },
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data && data.listaDezenas) {
                return {
                  contestNumber: data.numero,
                  drawDate: formatBrazilianDate(data.dataApuracao),
                  numbers: data.listaDezenas.map((n: string) => parseInt(n)),
                };
              }
              return null;
            })
            .catch(() => null)
        );
      }

      const batchResults = await Promise.all(batchPromises);
      draws.push(...batchResults.filter((d): d is HistoricalDraw => d !== null));
      
      // Pequeno delay entre lotes para não sobrecarregar a API
      if (i + batchSize <= latestContestNumber) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return draws.sort((a, b) => b.contestNumber - a.contestNumber);
  } catch (error) {
    console.error(`Erro ao buscar histórico da ${lotteryType}:`, error);
    throw error;
  }
};

export const fetchDrawByNumber = async (
  lotteryType: string,
  contestNumber: number
): Promise<HistoricalDraw | null> => {
  const endpoint = lotteryEndpoints[lotteryType];
  
  if (!endpoint) {
    throw new Error(`Tipo de loteria não suportado: ${lotteryType}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${contestNumber}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.listaDezenas) {
      return null;
    }

    return {
      contestNumber: data.numero,
      drawDate: formatBrazilianDate(data.dataApuracao),
      numbers: data.listaDezenas.map((n: string) => parseInt(n)),
    };
  } catch (error) {
    console.error(`Erro ao buscar concurso ${contestNumber}:`, error);
    return null;
  }
};
