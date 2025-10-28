import { LotteryDrawInfo, LotteryApiResponse } from "@/types/lottery";

const API_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

const lotteryEndpoints: Record<string, string> = {
  "mega-sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "lotomania": "lotomania",
  "dupla-sena": "duplasena",
  "timemania": "timemania",
  "mais-milionaria": "maismilionaria",
  "federal": "federal",
  "dia-de-sorte": "diadesorte",
  "super-sete": "supersete",
};

export const formatBrazilianDate = (dateString: string): Date => {
  // Formato esperado: "DD/MM/YYYY"
  if (!dateString || typeof dateString !== 'string') {
    console.warn('Invalid date string received:', dateString);
    return new Date(); // Retorna data atual como fallback
  }
  
  const parts = dateString.split("/");
  if (parts.length !== 3) {
    console.warn('Invalid date format:', dateString);
    return new Date(); // Retorna data atual como fallback
  }
  
  const [day, month, year] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Valida se a data é válida
  if (isNaN(date.getTime())) {
    console.warn('Invalid date created from:', dateString);
    return new Date(); // Retorna data atual como fallback
  }
  
  return date;
};

export const fetchLotteryDrawInfo = async (
  lotteryType: string
): Promise<LotteryDrawInfo> => {
  const endpoint = lotteryEndpoints[lotteryType];
  
  if (!endpoint) {
    throw new Error(`Tipo de loteria não suportado: ${lotteryType}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`API retornou status ${response.status} para ${lotteryType}`);
      throw new Error(`Erro ao buscar dados: ${response.status}`);
    }

    const data: LotteryApiResponse = await response.json();

    // Validar dados críticos
    if (!data || typeof data.numero === 'undefined') {
      console.warn(`Dados inválidos recebidos para ${lotteryType}:`, data);
      throw new Error('Dados da API inválidos');
    }

    return {
      nextDrawNumber: data.numero + 1,
      nextDrawDate: formatBrazilianDate(data.dataProximoConcurso),
      estimatedPrize: data.valorEstimadoProximoConcurso || 0,
      lastDrawDate: formatBrazilianDate(data.dataApuracao),
      lastDrawNumbers: data.listaDezenas?.map(n => parseInt(n)),
    };
  } catch (error) {
    console.error(`Erro ao buscar informações da ${lotteryType}:`, error);
    throw error;
  }
};
