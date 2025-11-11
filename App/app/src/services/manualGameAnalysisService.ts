import { supabase } from '@/integrations/supabase/client';
import { LotteryType, getLotteryConfig } from '@/config/lotteryConfig';
import { fetchHistoricalDraws } from '@/services/lotteryHistory';
import { analyzeHistoricalData } from '@/services/lotteryAnalysis';
import type { Database } from '@/integrations/supabase/types';

export interface ManualGameAnalysisParams {
  lotteryType: LotteryType;
  contestNumber: number;
  selectedNumbers: number[];
}

type LotteryConfig = ReturnType<typeof getLotteryConfig>;
type ManualSessionInsert = Database['public']['Tables']['manual_creation_sessions']['Insert'];

export interface Recommendation {
  type: 'hot_numbers' | 'par_impar' | 'dezena' | 'general';
  severity: 'success' | 'warning' | 'info';
  title: string;
  diagnosis: string;
  recommendation: string;
  actionable: boolean;
  numbersToAdd?: number[];
  numbersToRemove?: number[];
  priority: number; // 1-5 (1 = mais importante)
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
  suggestions: string[]; // Deprecated: use recommendations instead
  recommendations: Recommendation[];
  comparisonWithAverage: string;
  detailedAnalysis: {
    hotNumbers: number[]; // Números selecionados que são quentes
    coldNumbers: number[]; // Números selecionados que são frios
    balancedNumbers: number[]; // Números selecionados que são balanceados
    allHotNumbers: number[]; // TODOS os números quentes do histórico
    consecutiveSequences: number[][];
    multiplesOf5: number[];
    availableHotNumbers?: number[];
    suggestedEvenNumbers?: number[];
    suggestedOddNumbers?: number[];
  } & Record<string, unknown>;
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
      const normalizedLotteryType = lotteryConfig.name;
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
        .eq('lottery_type', normalizedLotteryType)
        .eq('contest_number', params.contestNumber)
        .maybeSingle();

      if (histError) {
        console.error('Erro ao buscar histórico:', histError);
      }

      // Classificar numeros como hot/cold/balanced
      let hotNumbers = Array.isArray(historicalData?.hot_numbers)
        ? historicalData?.hot_numbers ?? []
        : [];
      let coldNumbers = Array.isArray(historicalData?.cold_numbers)
        ? historicalData?.cold_numbers ?? []
        : [];

      if (hotNumbers.length === 0 || coldNumbers.length === 0) {
        try {
          const { draws } = await fetchHistoricalDraws(normalizedLotteryType, 120);
          if (draws.length > 0) {
            const statistics = analyzeHistoricalData(draws, lotteryConfig.maxNumber);
            hotNumbers = statistics.hotNumbers;
            coldNumbers = statistics.coldNumbers;
          }
        } catch (fallbackError) {
          console.error('Erro ao recalcular numeros quentes/frios:', fallbackError);
        }
      }

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
        const key = `${dezena}Âª dezena`;
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

      // Gerar sugestões de melhoria (deprecated)
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

      // Gerar recomendações inteligentes estruturadas
      const recommendations = this.generateRecommendations({
        selectedNumbers: params.selectedNumbers,
        hotNumbers,
        coldNumbers,
        balancedNumbers: classifiedNumbers.balanced,
        hotCount,
        coldCount,
        balancedCount,
        evenCount,
        oddCount,
        dezenaDistribution,
        lotteryConfig,
        expectedCount
      });

      // Números disponíveis para sugestões
      const allNumbers = Array.from(
        { length: lotteryConfig.maxNumber - lotteryConfig.minNumber + 1 },
        (_, i) => i + lotteryConfig.minNumber
      );
      const availableHotNumbers = hotNumbers.filter(n => !params.selectedNumbers.includes(n));
      const suggestedEvenNumbers = allNumbers.filter(n => !params.selectedNumbers.includes(n) && n % 2 === 0).slice(0, 10);
      const suggestedOddNumbers = allNumbers.filter(n => !params.selectedNumbers.includes(n) && n % 2 === 1).slice(0, 10);

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
        suggestions, // Deprecated
        recommendations, // New structured recommendations
        comparisonWithAverage,
        detailedAnalysis: {
          hotNumbers: classifiedNumbers.hot, // Números selecionados que são quentes
          coldNumbers: classifiedNumbers.cold,
          balancedNumbers: classifiedNumbers.balanced,
          allHotNumbers: hotNumbers, // TODOS os números quentes do histórico
          consecutiveSequences,
          multiplesOf5,
          availableHotNumbers,
          suggestedEvenNumbers,
          suggestedOddNumbers
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
   * Gera recomendações inteligentes estruturadas
   */
  private static generateRecommendations(data: {
    selectedNumbers: number[];
    hotNumbers: number[];
    coldNumbers: number[];
    balancedNumbers: number[];
    hotCount: number;
    coldCount: number;
    balancedCount: number;
    evenCount: number;
    oddCount: number;
    dezenaDistribution: Record<string, number>;
    lotteryConfig: LotteryConfig;
    expectedCount: number;
  }): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const {
      selectedNumbers,
      hotNumbers,
      coldNumbers,
      balancedNumbers,
      hotCount,
      coldCount,
      balancedCount,
      evenCount,
      oddCount,
      dezenaDistribution,
      lotteryConfig,
      expectedCount
    } = data;

    // Recomendação 1: Hot Numbers
    const hotPercentage = (hotCount / selectedNumbers.length) * 100;

    if (hotCount < 3) {
      // Encontrar hot numbers não selecionados
      const availableHotNumbers = hotNumbers
        .filter(n => !selectedNumbers.includes(n))
        .slice(0, 5);

      const numbersToRemove = selectedNumbers
        .filter(n => coldNumbers.includes(n))
        .slice(0, 3 - hotCount);

      recommendations.push({
        type: 'hot_numbers',
        severity: 'warning',
        title: 'Poucos números quentes',
        diagnosis: `Seu jogo tem apenas ${hotCount} números quentes (${hotPercentage.toFixed(0)}%). O ideal é ter entre 3 e 5 números quentes (20-30% do jogo). Números quentes são aqueles que apareceram com maior frequência nos últimos concursos.`,
        recommendation: `Adicione ${3 - hotCount} número(s) quente(s) para melhorar suas chances: ${availableHotNumbers.slice(0, 3 - hotCount).map(n => n.toString().padStart(2, '0')).join(', ')}.`,
        actionable: true,
        numbersToAdd: availableHotNumbers.slice(0, 3 - hotCount),
        numbersToRemove: numbersToRemove,
        priority: 1
      });
    } else if (hotCount >= 3 && hotCount <= 5) {
      recommendations.push({
        type: 'hot_numbers',
        severity: 'success',
        title: 'Excelente quantidade de números quentes',
        diagnosis: `Seu jogo tem ${hotCount} números quentes (${hotPercentage.toFixed(0)}%), dentro do intervalo ideal de 20-30%.`,
        recommendation: 'Mantenha essa distribuição! Números quentes têm maior probabilidade estatística baseado em padrões históricos.',
        actionable: false,
        priority: 5
      });
    } else {
      // Muitos hot numbers
      const numbersToRemove = selectedNumbers
        .filter(n => hotNumbers.includes(n))
        .slice(0, hotCount - 5);

      const numbersToAdd = balancedNumbers
        .filter(n => !selectedNumbers.includes(n))
        .slice(0, hotCount - 5);

      recommendations.push({
        type: 'hot_numbers',
        severity: 'warning',
        title: 'Muitos números quentes',
        diagnosis: `Seu jogo tem ${hotCount} números quentes (${hotPercentage.toFixed(0)}%). Isso pode reduzir a diversidade do jogo.`,
        recommendation: `Substitua ${hotCount - 5} número(s) quente(s) por números balanceados para melhor distribuição.`,
        actionable: true,
        numbersToRemove: numbersToRemove,
        numbersToAdd: numbersToAdd,
        priority: 2
      });
    }

    // Recomendação 2: Par/Ímpar
    const idealEven = Math.floor(expectedCount / 2);
    const idealOdd = expectedCount - idealEven;

    if (evenCount >= idealEven - 1 && evenCount <= idealEven + 1) {
      recommendations.push({
        type: 'par_impar',
        severity: 'success',
        title: 'Distribuição Par/Ímpar balanceada',
        diagnosis: `Seu jogo tem ${evenCount} pares e ${oddCount} ímpares, dentro do intervalo ideal de ${idealEven - 1}-${idealEven + 1} / ${idealOdd - 1}-${idealOdd + 1}.`,
        recommendation: 'Perfeito! Mantenha essa distribuição equilibrada. Jogos com aproximadamente 50/50 têm melhor desempenho estatístico.',
        actionable: false,
        priority: 5
      });
    } else {
      const needMoreEven = evenCount < idealEven - 1;
      const diff = Math.abs(evenCount - idealEven);

      // Encontrar números sugeridos
      const allNumbers = Array.from(
        { length: lotteryConfig.maxNumber - lotteryConfig.minNumber + 1 },
        (_, i) => i + lotteryConfig.minNumber
      );

      const suggestedNumbers = allNumbers
        .filter(n => !selectedNumbers.includes(n))
        .filter(n => needMoreEven ? n % 2 === 0 : n % 2 === 1)
        .slice(0, diff);

      const numbersToRemove = selectedNumbers
        .filter(n => needMoreEven ? n % 2 === 1 : n % 2 === 0)
        .slice(0, diff);

      recommendations.push({
        type: 'par_impar',
        severity: 'warning',
        title: `Desequilíbrio na distribuição Par/Ímpar`,
        diagnosis: `Seu jogo tem ${evenCount} pares e ${oddCount} ímpares. O ideal é ter aproximadamente ${idealEven} pares e ${idealOdd} ímpares (50/50).`,
        recommendation: `Substitua ${diff} número(s) ${needMoreEven ? 'ímpar(es)' : 'par(es)'} por ${needMoreEven ? 'par(es)' : 'ímpar(es)'}: ${suggestedNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}.`,
        actionable: true,
        numbersToAdd: suggestedNumbers,
        numbersToRemove: numbersToRemove,
        priority: 2
      });
    }

    // Recomendação 3: Dezenas
    const dezenaEntries = Object.entries(dezenaDistribution);
    if (dezenaEntries.length > 0) {
      const maxDezena = Math.max(...dezenaEntries.map(([_, count]) => count));
      const minDezena = Math.min(...dezenaEntries.map(([_, count]) => count));

      if (maxDezena - minDezena >= 4) {
        // Muito desbalanceado
        const overloadedDezenaEntry = dezenaEntries.find(([_, count]) => count === maxDezena);
        const underloadedDezenaEntry = dezenaEntries.find(([_, count]) => count === minDezena);

        const overloadedDezena = overloadedDezenaEntry?.[0] || '';
        const underloadedDezena = underloadedDezenaEntry?.[0] || '';

        recommendations.push({
          type: 'dezena',
          severity: 'info',
          title: 'Concentração de números em uma dezena',
          diagnosis: `Você tem ${maxDezena} números na ${overloadedDezena} e apenas ${minDezena} na ${underloadedDezena}.`,
          recommendation: `Distribua melhor os números entre as dezenas para aumentar cobertura. Substitua alguns números da ${overloadedDezena} por números da ${underloadedDezena}.`,
          actionable: true,
          priority: 3
        });
      }
    }

    // Ordenar por prioridade
    return recommendations.sort((a, b) => a.priority - b.priority);
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
          analysis_result: params.analysisResult as ManualSessionInsert['analysis_result'],
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




