import { supabase } from '@/integrations/supabase/client';
import { LotteryType, getLotteryConfig } from '@/config/lotteryConfig';

export interface ManualGameAnalysisParams {
  lotteryType: LotteryType;
  contestNumber: number;
  selectedNumbers: number[];
}

export interface AnalysisResult {
  score: number; // 0-5
  summary: string;
  hotCount: number;
  coldCount: number;
  balancedCount: number;
  evenOddDistribution: {
    even: number;
    odd: number;
  };
  dezenaDistribution: Record<string, number>;
  patterns: string[];
  suggestions: string[];
  comparisonWithAverage: string;
  detailedAnalysis: {
    hotNumbers: number[];
    coldNumbers: number[];
    balancedNumbers: number[];
    consecutiveSequences: number[][];
    multiplesOf5: number[];
    [key: string]: any;
  };
}

export class ManualGameAnalysisService {
  /**
   * Analisa jogo criado manualmente
   * Usa mesmo algoritmo da IA de geração, mas em modo reverso
   */
  static async analyzeManualGame(params: ManualGameAnalysisParams): Promise<{
    success: boolean;
    data?: AnalysisResult;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Validações básicas
      const lotteryConfig = getLotteryConfig(params.lotteryType);
      const expectedCount = lotteryConfig.numbersToSelect;

      if (params.selectedNumbers.length !== expectedCount) {
        return {
          success: false,
          error: `Quantidade inválida. Esperado: ${expectedCount} números.`
        };
      }

      // Validar range dos números
      const invalidNumbers = params.selectedNumbers.filter(
        num => num < lotteryConfig.minNumber || num > lotteryConfig.maxNumber
      );
      if (invalidNumbers.length > 0) {
        return {
          success: false,
          error: `Números fora do range válido (${lotteryConfig.minNumber}-${lotteryConfig.maxNumber}): ${invalidNumbers.join(', ')}`
        };
      }

      // Buscar histórico do concurso para análise contextual
      const { data: historicalData, error: histError } = await supabase
        .from('lottery_analyses')
        .select('hot_numbers, cold_numbers')
        .eq('lottery_type', params.lotteryType)
        .eq('contest_number', params.contestNumber)
        .maybeSingle();

      if (histError) {
        console.error('Erro ao buscar histórico:', histError);
      }

      // Classificar números como hot/cold/balanced
      const hotNumbers = historicalData?.hot_numbers || [];
      const coldNumbers = historicalData?.cold_numbers || [];

      let hotCount = 0;
      let coldCount = 0;
      let balancedCount = 0;

      const classifiedNumbers = {
        hot: [] as number[],
        cold: [] as number[],
        balanced: [] as number[]
      };

      params.selectedNumbers.forEach(num => {
        if (hotNumbers.includes(num)) {
          hotCount++;
          classifiedNumbers.hot.push(num);
        } else if (coldNumbers.includes(num)) {
          coldCount++;
          classifiedNumbers.cold.push(num);
        } else {
          balancedCount++;
          classifiedNumbers.balanced.push(num);
        }
      });

      // Análise par/ímpar
      const evenCount = params.selectedNumbers.filter(n => n % 2 === 0).length;
      const oddCount = params.selectedNumbers.length - evenCount;

      // Análise por dezenas
      const dezenaDistribution: Record<string, number> = {};
      params.selectedNumbers.forEach(num => {
        const dezena = Math.floor((num - 1) / 10) + 1;
        const key = `${dezena}ª dezena`;
        dezenaDistribution[key] = (dezenaDistribution[key] || 0) + 1;
      });

      // Identificar padrões
      const patterns: string[] = [];
      const sortedNumbers = [...params.selectedNumbers].sort((a, b) => a - b);

      // Sequências consecutivas
      const consecutiveSequences: number[][] = [];
      let currentSeq: number[] = [sortedNumbers[0]];
      for (let i = 1; i < sortedNumbers.length; i++) {
        if (sortedNumbers[i] === sortedNumbers[i - 1] + 1) {
          currentSeq.push(sortedNumbers[i]);
        } else {
          if (currentSeq.length >= 3) {
            consecutiveSequences.push([...currentSeq]);
            patterns.push(`Sequência consecutiva: ${currentSeq.join(', ')}`);
          }
          currentSeq = [sortedNumbers[i]];
        }
      }
      if (currentSeq.length >= 3) {
        consecutiveSequences.push([...currentSeq]);
        patterns.push(`Sequência consecutiva: ${currentSeq.join(', ')}`);
      }

      // Múltiplos de 5
      const multiplesOf5 = params.selectedNumbers.filter(n => n % 5 === 0);
      if (multiplesOf5.length > 0) {
        patterns.push(`${multiplesOf5.length} múltiplos de 5: ${multiplesOf5.join(', ')}`);
      }

      // Calcular score (0-10)
      let score = 5.0; // Base

      // +1 se distribuição hot/cold/balanced balanceada (ideal: 33%/33%/33%)
      const idealRatio = expectedCount / 3;
      const balanceScore = 1 - (
        Math.abs(hotCount - idealRatio) +
        Math.abs(coldCount - idealRatio) +
        Math.abs(balancedCount - idealRatio)
      ) / expectedCount;
      score += balanceScore;

      // +1 se distribuição par/ímpar próxima de 50/50
      const evenOddBalance = 1 - Math.abs(evenCount - oddCount) / expectedCount;
      score += evenOddBalance;

      // +1 se boa distribuição por dezenas
      const dezenaValues = Object.values(dezenaDistribution);
      const dezenaStdDev = this.calculateStdDev(dezenaValues);
      const dezenaScore = Math.max(0, 1 - dezenaStdDev / 5);
      score += dezenaScore;

      // -0.5 para cada sequência consecutiva longa (não é estatisticamente ideal)
      score -= Math.min(2, consecutiveSequences.length * 0.5);

      // Limitar score entre 0-10 e depois converter para 0-5
      score = Math.max(0, Math.min(10, score));
      score = score / 2; // Converter de 0-10 para 0-5

      // Gerar resumo textual
      const summary = this.generateSummary({
        hotCount,
        coldCount,
        balancedCount,
        evenCount,
        oddCount,
        patterns,
        score
      });

      // Gerar sugestões de melhoria
      const suggestions = this.generateSuggestions({
        hotCount,
        coldCount,
        balancedCount,
        evenCount,
        oddCount,
        consecutiveSequences,
        multiplesOf5,
        expectedCount
      });

      // Comparar com média histórica (simulado) - Score agora é 0-5
      const comparisonWithAverage = score >= 3.5 ? 'Acima da média'
        : score >= 2.5 ? 'Na média'
        : 'Abaixo da média';

      const result: AnalysisResult = {
        score: Math.round(score * 10) / 10,
        summary,
        hotCount,
        coldCount,
        balancedCount,
        evenOddDistribution: { even: evenCount, odd: oddCount },
        dezenaDistribution,
        patterns,
        suggestions,
        comparisonWithAverage,
        detailedAnalysis: {
          hotNumbers: classifiedNumbers.hot,
          coldNumbers: classifiedNumbers.cold,
          balancedNumbers: classifiedNumbers.balanced,
          consecutiveSequences,
          multiplesOf5
        }
      };

      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao analisar jogo manual:', error);
      return {
        success: false,
        error: 'Erro inesperado ao analisar jogo'
      };
    }
  }

  /**
   * Gera resumo textual da análise
   */
  private static generateSummary(data: {
    hotCount: number;
    coldCount: number;
    balancedCount: number;
    evenCount: number;
    oddCount: number;
    patterns: string[];
    score: number;
  }): string {
    const { hotCount, coldCount, balancedCount, evenCount, oddCount, patterns, score } = data;

    let summary = `Seu jogo tem uma distribuição `;

    // Análise hot/cold/balanced
    if (Math.abs(hotCount - coldCount) <= 2 && Math.abs(hotCount - balancedCount) <= 2) {
      summary += `balanceada com ${hotCount} números quentes, ${coldCount} outros e ${balancedCount} balanceados. `;
    } else if (hotCount > coldCount + 3) {
      summary += `focada em números quentes (${hotCount} quentes vs ${coldCount} outros). `;
    } else if (coldCount > hotCount + 3) {
      summary += `com mais números de padrão histórico variado (${coldCount} outros vs ${hotCount} quentes). `;
    } else {
      summary += `com ${hotCount} números quentes, ${coldCount} outros e ${balancedCount} balanceados. `;
    }

    // Análise par/ímpar
    if (Math.abs(evenCount - oddCount) <= 2) {
      summary += `A distribuição par/ímpar está boa (${evenCount} pares / ${oddCount} ímpares). `;
    } else {
      summary += `A distribuição par/ímpar poderia melhorar (atualmente ${evenCount} pares / ${oddCount} ímpares). `;
    }

    // Padrões identificados
    if (patterns.length > 0) {
      summary += `Identificamos ${patterns.length} padrão(ões) no seu jogo. `;
    }

    // Score geral (agora 0-5)
    if (score >= 4) {
      summary += `Excelente escolha!`;
    } else if (score >= 3) {
      summary += `Boas chances!`;
    } else {
      summary += `Considere as sugestões de melhoria.`;
    }

    return summary;
  }

  /**
   * Gera sugestões de melhoria
   */
  private static generateSuggestions(data: {
    hotCount: number;
    coldCount: number;
    balancedCount: number;
    evenCount: number;
    oddCount: number;
    consecutiveSequences: number[][];
    multiplesOf5: number[];
    expectedCount: number;
  }): string[] {
    const suggestions: string[] = [];
    const { hotCount, coldCount, balancedCount, evenCount, oddCount, consecutiveSequences, multiplesOf5, expectedCount } = data;

    // Sugestões hot/cold
    const idealRatio = expectedCount / 3;
    if (hotCount < idealRatio - 3) {
      suggestions.push(`Adicione mais números quentes para melhorar a probabilidade.`);
    }

    // Removido sugestão sobre "números frios" (percepção negativa)

    // Sugestões par/ímpar
    if (Math.abs(evenCount - oddCount) > 4) {
      const target = evenCount > oddCount ? 'ímpares' : 'pares';
      suggestions.push(`Balance melhor a distribuição: adicione mais números ${target}.`);
    }

    // Sugestões sobre padrões
    if (consecutiveSequences.length > 0) {
      suggestions.push(`Evite sequências consecutivas longas - elas raramente são sorteadas juntas.`);
    }

    if (multiplesOf5.length > expectedCount / 5) {
      suggestions.push(`Muitos múltiplos de 5 (${multiplesOf5.length}). Diversifique mais.`);
    }

    // Sugestão geral se score baixo
    if (suggestions.length === 0) {
      suggestions.push(`Seu jogo está bem equilibrado! Mantenha essa estratégia.`);
    }

    return suggestions;
  }

  /**
   * Calcula desvio padrão
   */
  private static calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Salva sessão de criação manual (analytics)
   */
  static async saveManualSession(params: {
    lotteryType: string;
    contestNumber: number;
    selectedNumbers: number[];
    analysisResult: AnalysisResult;
    timeSpent: {
      step1: number;
      step2: number;
      step3: number;
      step4: number;
    };
  }): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('manual_creation_sessions')
        .insert({
          user_id: user.id,
          lottery_type: params.lotteryType,
          contest_number: params.contestNumber,
          selected_numbers: params.selectedNumbers,
          analysis_result: params.analysisResult as any,
          completed_at: new Date().toISOString(),
          time_spent_step1: params.timeSpent.step1,
          time_spent_step2: params.timeSpent.step2,
          time_spent_step3: params.timeSpent.step3,
          time_spent_step4: params.timeSpent.step4,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao salvar sessão manual:', error);
        return { success: false, error: error.message };
      }

      return { success: true, sessionId: data.id };
    } catch (error) {
      console.error('Erro inesperado ao salvar sessão:', error);
      return { success: false, error: 'Erro inesperado' };
    }
  }
}

export default ManualGameAnalysisService;
