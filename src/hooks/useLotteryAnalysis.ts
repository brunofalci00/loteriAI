import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalDraws } from "@/services/lotteryHistory";
import { 
  analyzeHistoricalData, 
  generateAnalysisResult 
} from "@/services/lotteryAnalysis";
import { AnalysisResult } from "@/types/analysis";

export const useLotteryAnalysis = (
  lotteryType: string,
  maxNumber: number,
  numbersPerGame: number,
  enabled: boolean = true
) => {
  return useQuery<AnalysisResult & { dataSource: string; warning?: string }>({
    queryKey: ["lotteryAnalysis", lotteryType, maxNumber, numbersPerGame],
    queryFn: async () => {
      // 1. Buscar histórico (com source e warning)
      const maxDraws = 100;
      const { draws, source, warning } = await fetchHistoricalDraws(lotteryType, maxDraws);

      if (draws.length === 0) {
        throw new Error("Não foi possível obter dados históricos");
      }

      // 2. Calcular estatísticas
      const statistics = analyzeHistoricalData(draws, maxNumber);

      // 3. Gerar análise completa com combinações inteligentes
      const result = generateAnalysisResult(
        statistics,
        numbersPerGame,
        maxNumber,
        lotteryType,
        10
      );

      // 4. Adicionar informação sobre fonte de dados
      return {
        ...result,
        dataSource: source === "api" ? "Dados em tempo real" : "Dados históricos (offline)",
        warning,
      };
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 48 * 60 * 60 * 1000, // 48 horas
    refetchOnWindowFocus: false,
    retry: 2,
    enabled,
  });
};
