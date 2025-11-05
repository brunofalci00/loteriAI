import { LotteryDrawInfo, LotteryApiResponse } from "@/types/lottery";

const API_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";
const FALLBACK_API_URL = "https://api.guidi.dev.br/loteria";

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

/**
 * Busca dados da API de fallback (Guidi)
 */
const fetchFromFallbackAPI = async (
  lotteryType: string
): Promise<LotteryDrawInfo> => {
  const endpoint = lotteryEndpoints[lotteryType];

  console.log(`🔄 Tentando API de fallback para ${lotteryType}...`);

  const response = await fetch(`${FALLBACK_API_URL}/${endpoint}/ultimo`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Fallback API retornou status ${response.status}`);
  }

  const data: LotteryApiResponse = await response.json();

  // Validar dados críticos
  if (!data || typeof data.numero === 'undefined') {
    throw new Error('Dados da fallback API inválidos');
  }

  // Loteria Federal tem prêmio fixo (R$ 500 mil para 1º prêmio), não acumula
  const estimatedPrize = lotteryType === "federal"
    ? 500000
    : (data.valorEstimadoProximoConcurso || 0);

  console.log(`✅ Dados obtidos da API de fallback para ${lotteryType}`);

  return {
    nextDrawNumber: data.numero + 1,
    nextDrawDate: formatBrazilianDate(data.dataProximoConcurso),
    estimatedPrize,
    lastDrawDate: formatBrazilianDate(data.dataApuracao),
    lastDrawNumbers: data.listaDezenas?.map(n => parseInt(n)),
  };
};

export const fetchLotteryDrawInfo = async (
  lotteryType: string
): Promise<LotteryDrawInfo> => {
  const endpoint = lotteryEndpoints[lotteryType];

  if (!endpoint) {
    throw new Error(`Tipo de loteria não suportado: ${lotteryType}`);
  }

  // Tentar API principal da Caixa primeiro
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`API Caixa retornou status ${response.status} para ${lotteryType}`);
      throw new Error(`Erro ao buscar dados: ${response.status}`);
    }

    // Verificar se é JSON válido
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`API Caixa retornou tipo inválido: ${contentType}`);
      throw new Error('API da Caixa retornou formato inválido');
    }

    const data: LotteryApiResponse = await response.json();

    // Validar dados críticos
    if (!data || typeof data.numero === 'undefined') {
      console.warn(`Dados inválidos da API Caixa para ${lotteryType}`);
      throw new Error('Dados da API inválidos');
    }

    // Loteria Federal tem prêmio fixo (R$ 500 mil para 1º prêmio), não acumula
    const estimatedPrize = lotteryType === "federal"
      ? 500000
      : (data.valorEstimadoProximoConcurso || 0);

    console.log(`✅ Dados obtidos da API oficial Caixa para ${lotteryType}`);

    return {
      nextDrawNumber: data.numero + 1,
      nextDrawDate: formatBrazilianDate(data.dataProximoConcurso),
      estimatedPrize,
      lastDrawDate: formatBrazilianDate(data.dataApuracao),
      lastDrawNumbers: data.listaDezenas?.map(n => parseInt(n)),
    };
  } catch (error) {
    console.warn(`❌ API Caixa falhou para ${lotteryType}, tentando fallback...`, error);

    // Se API principal falhou, tentar fallback
    try {
      return await fetchFromFallbackAPI(lotteryType);
    } catch (fallbackError) {
      console.error(`❌ Fallback API também falhou para ${lotteryType}:`, fallbackError);
      throw new Error('Todas as APIs de loteria estão temporariamente indisponíveis');
    }
  }
};
