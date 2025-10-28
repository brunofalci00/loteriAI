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
  return useQuery<AnalysisResult>({
    queryKey: ["lotteryAnalysis", lotteryType, maxNumber, numbersPerGame],
    queryFn: async () => {
      // 1. Buscar histórico (últimos 100 concursos para otimizar)
      const maxDraws = 100;
      const history = await fetchHistoricalDraws(lotteryType, maxDraws);

      if (history.length === 0) {
        throw new Error("Não foi possível obter dados históricos");
      }

      // 2. Calcular estatísticas
      const statistics = analyzeHistoricalData(history, maxNumber);

      // 3. Gerar análise completa com combinações inteligentes
      const result = generateAnalysisResult(
        statistics,
        numbersPerGame,
        maxNumber,
        lotteryType,
        10
      );

      return result;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 48 * 60 * 60 * 1000, // 48 horas
    refetchOnWindowFocus: false,
    retry: 2,
    enabled,
  });
};
