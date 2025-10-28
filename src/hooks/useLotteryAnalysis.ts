import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalDraws } from "@/services/lotteryHistory";
import { 
  analyzeHistoricalData, 
  generateAnalysisResult 
} from "@/services/lotteryAnalysis";
import { AnalysisResult } from "@/types/analysis";
import { supabase } from "@/integrations/supabase/client";

export const useLotteryAnalysis = (
  lotteryType: string,
  maxNumber: number,
  numbersPerGame: number,
  contestNumber: number,
  userId: string | null,
  enabled: boolean = true
) => {
  return useQuery<AnalysisResult & { dataSource: string; warning?: string; fromCache?: boolean }>({
    queryKey: ["lotteryAnalysis", lotteryType, maxNumber, numbersPerGame, contestNumber, userId],
    queryFn: async () => {
      // 1. Verificar se já existe análise salva (cache)
      if (userId) {
        try {
          const { data: cachedAnalysis, error } = await supabase
            .from('lottery_analyses')
            .select('*')
            .eq('user_id', userId)
            .eq('lottery_type', lotteryType)
            .eq('contest_number', contestNumber)
            .maybeSingle();

          if (!error && cachedAnalysis) {
            // Retorna análise do cache
            const combinations = cachedAnalysis.generated_numbers as number[][];
            return {
              combinations,
              statistics: {
                totalDrawsAnalyzed: cachedAnalysis.draws_analyzed,
                periodStart: new Date(),
                periodEnd: new Date(),
                numberFrequency: new Map(),
                hotNumbers: cachedAnalysis.hot_numbers,
                coldNumbers: cachedAnalysis.cold_numbers,
                averageSum: 0,
                pairOddRatio: { pairs: 0, odds: 0 },
                consecutiveFrequency: 0,
                lastUpdate: new Date(cachedAnalysis.analyzed_at),
              },
              strategy: {
                type: cachedAnalysis.strategy_type as "balanced" | "hot" | "cold" | "mixed",
                description: "Estratégia equilibrada",
                hotNumbersWeight: 40,
                coldNumbersWeight: 30,
                randomWeight: 30,
              },
              confidence: "alta" as const,
              calculatedAccuracy: cachedAnalysis.accuracy_rate,
              gamesGenerated: combinations.length,
              dataSource: cachedAnalysis.data_source,
              fromCache: true,
            };
          }
        } catch (error) {
          console.error('Error checking cache:', error);
          // Continua para processar nova análise
        }
      }

      // 2. Buscar histórico (com source e warning) - MÍNIMO 50 concursos
      const maxDraws = 100;
      const { draws, source, warning } = await fetchHistoricalDraws(lotteryType, maxDraws);

      if (draws.length === 0) {
        throw new Error("Não foi possível obter dados históricos");
      }

      // Validação: garantir mínimo de 50 concursos para análise confiável
      if (draws.length < 50) {
        console.warn(`⚠️ Apenas ${draws.length} concursos disponíveis. Mínimo recomendado: 50`);
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

      // 4. Salvar análise no banco (se usuário estiver autenticado)
      if (userId) {
        try {
          await supabase.from('lottery_analyses').insert({
            user_id: userId,
            lottery_type: lotteryType,
            contest_number: contestNumber,
            generated_numbers: result.combinations,
            hot_numbers: statistics.hotNumbers,
            cold_numbers: statistics.coldNumbers,
            accuracy_rate: result.calculatedAccuracy,
            strategy_type: result.strategy.type,
            draws_analyzed: statistics.totalDrawsAnalyzed,
            data_source: source === "api" ? "Dados em tempo real" : "Dados históricos (offline)",
          });
        } catch (error: any) {
          // Ignora erro de duplicação (unique constraint)
          if (error?.code !== '23505') {
            console.error('Error saving analysis:', error);
          }
        }
      }

      // 5. Adicionar informação sobre fonte de dados
      return {
        ...result,
        dataSource: source === "api" ? "Dados em tempo real" : "Dados históricos (offline)",
        warning,
        fromCache: false,
      };
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 48 * 60 * 60 * 1000, // 48 horas
    refetchOnWindowFocus: false,
    retry: 2,
    enabled,
  });
};
