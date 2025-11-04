import { supabase } from '@/integrations/supabase/client';
import { ManualGameAnalysisService, type AnalysisResult } from './manualGameAnalysisService';
import { consumeCredit } from './creditsService';
import { LotteryType } from '@/config/lotteryConfig';

export interface GenerateVariationsParams {
  originalNumbers: number[];
  lotteryType: LotteryType;
  contestNumber: number;
}

export interface Variation {
  id: string;
  numbers: number[];
  strategy: string;
  strategyLabel: string;
  score: number;
  analysisResult: AnalysisResult;
  changedNumbers: {
    removed: number[];
    added: number[];
  };
}

export class GameVariationsService {
  /**
   * Gera 5 variações otimizadas a partir dos números originais
   * Opção C (Q16): Aplica sugestões da IA mantendo 60-70% dos números originais
   */
  static async generateVariations(params: GenerateVariationsParams): Promise<{
    success: boolean;
    data?: Variation[];
    error?: string;
    creditsRemaining?: number;
  }> {
    console.log('🚀 GameVariationsService: generateVariations() chamado');
    console.log('📋 Params recebidos:', params);

    try {
      console.log('👤 Verificando autenticação...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }
      console.log(`✅ Usuário autenticado: ${user.id}`);

      // **CONSUMIR 1 CRÉDITO ANTES DE GERAR**
      console.log('🎯 Consumindo 1 crédito para gerar variações...');
      const creditResult = await consumeCredit(user.id);

      if (!creditResult.success) {
        console.error('❌ Erro ao consumir crédito:', creditResult.message);
        return {
          success: false,
          error: creditResult.message,
          creditsRemaining: creditResult.credits_remaining
        };
      }

      console.log(`✅ Crédito consumido! Restam ${creditResult.credits_remaining} créditos`);

      // Buscar hot/cold numbers do concurso
      const { data: historicalData, error: histError } = await supabase
        .from('lottery_analyses')
        .select('hot_numbers, cold_numbers')
        .eq('lottery_type', params.lotteryType)
        .eq('contest_number', params.contestNumber)
        .maybeSingle();

      if (histError) {
        console.error('Erro ao buscar histórico:', histError);
      }

      const hotNumbers = historicalData?.hot_numbers || [];
      const coldNumbers = historicalData?.cold_numbers || [];

      // Usar getLotteryConfig para pegar configurações corretas
      const { getLotteryConfig } = await import('@/config/lotteryConfig');
      const lotteryConfig = getLotteryConfig(params.lotteryType);

      const allNumbers = Array.from({ length: lotteryConfig.maxNumber - lotteryConfig.minNumber + 1 }, (_, i) => i + lotteryConfig.minNumber);
      const expectedCount = lotteryConfig.numbersToSelect;

      console.log(`📊 Loteria: ${params.lotteryType}, expectedCount: ${expectedCount}, range: ${lotteryConfig.minNumber}-${lotteryConfig.maxNumber}`);

      // 5 estratégias de variação
      const strategies = [
        { key: 'balanced', label: 'Balanceada' },
        { key: 'hot_focused', label: 'Focada em Quentes' },
        { key: 'cold_focused', label: 'Focada em Frios' },
        { key: 'even_odd_optimized', label: 'Otimizada Par/Ímpar' },
        { key: 'dezena_optimized', label: 'Otimizada por Dezenas' }
      ];

      const variations: Variation[] = [];

      console.log(`🔄 Gerando ${strategies.length} variações...`);

      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        console.log(`📝 Variação ${i + 1}/${strategies.length}: ${strategy.label}`);

        const variation = this.generateSingleVariation({
          originalNumbers: params.originalNumbers,
          strategy: strategy.key,
          hotNumbers,
          coldNumbers,
          allNumbers,
          expectedCount
        });
        console.log(`✅ Variação gerada: [${variation.slice(0, 5).join(', ')}...]`);

        // Analisar variação (reutilizar ManualGameAnalysisService)
        console.log(`🔍 Analisando variação ${i + 1}...`);
        const analysisResult = await ManualGameAnalysisService.analyzeManualGame({
          lotteryType: params.lotteryType,
          contestNumber: params.contestNumber,
          selectedNumbers: variation
        });
        console.log(`📊 Análise ${i + 1}: success=${analysisResult.success}, score=${analysisResult.data?.score || 'N/A'}`);

        if (analysisResult.success && analysisResult.data) {
          // Identificar números alterados
          const removed = params.originalNumbers.filter(n => !variation.includes(n));
          const added = variation.filter(n => !params.originalNumbers.includes(n));

          variations.push({
            id: crypto.randomUUID(),
            numbers: variation,
            strategy: strategy.key,
            strategyLabel: strategy.label,
            score: analysisResult.data.score,
            analysisResult: analysisResult.data,
            changedNumbers: { removed, added }
          });
          console.log(`✅ Variação ${i + 1} adicionada ao array (${variations.length} total)`);
        } else {
          console.error(`❌ Variação ${i + 1} falhou na análise: ${analysisResult.error || 'Erro desconhecido'}`);
        }
      }

      console.log(`📊 Total de variações geradas: ${variations.length}/${strategies.length}`);

      // Salvar variações no banco (opcional)
      const variationsToInsert = variations.map(v => ({
        user_id: user.id,
        original_numbers: params.originalNumbers,
        original_contest_number: params.contestNumber,
        original_lottery_type: params.lotteryType,
        variation_numbers: v.numbers,
        variation_strategy: v.strategy,
        variation_score: v.score,
        analysis_result: v.analysisResult as any
      }));

      const { error: insertError } = await supabase
        .from('manual_game_variations')
        .insert(variationsToInsert);

      if (insertError) {
        console.error('Erro ao salvar variações:', insertError);
        // Não retornar erro, variações ainda são geradas
      }

      console.log(`✅ ${variations.length} variações geradas com sucesso!`);
      console.log('📦 Retornando resultado:', {
        success: true,
        variationsCount: variations.length,
        creditsRemaining: creditResult.credits_remaining
      });

      return {
        success: true,
        data: variations,
        creditsRemaining: creditResult.credits_remaining
      };
    } catch (error) {
      console.error('Erro ao gerar variações:', error);
      return {
        success: false,
        error: 'Erro inesperado ao gerar variações'
      };
    }
  }

  /**
   * Gera uma variação baseada em estratégia específica
   * Mantém 60-70% dos números originais
   */
  private static generateSingleVariation(config: {
    originalNumbers: number[];
    strategy: string;
    hotNumbers: number[];
    coldNumbers: number[];
    allNumbers: number[];
    expectedCount: number;
  }): number[] {
    const { originalNumbers, strategy, hotNumbers, coldNumbers, allNumbers, expectedCount } = config;

    // Definir quantos números manter (60-70%)
    const keepCount = Math.floor(expectedCount * (0.6 + Math.random() * 0.1));
    const changeCount = expectedCount - keepCount;

    // Selecionar números a manter aleatoriamente
    const shuffledOriginal = [...originalNumbers].sort(() => Math.random() - 0.5);
    const toKeep = shuffledOriginal.slice(0, keepCount);
    const availableNumbers = allNumbers.filter(n => !toKeep.includes(n));

    let numbersToAdd: number[] = [];

    switch (strategy) {
      case 'balanced':
        // Mix balanceado de hot/cold/balanced
        const hotToAdd = Math.floor(changeCount / 3);
        const coldToAdd = Math.floor(changeCount / 3);
        const balancedToAdd = changeCount - hotToAdd - coldToAdd;

        numbersToAdd = [
          ...this.selectRandom(availableNumbers.filter(n => hotNumbers.includes(n)), hotToAdd),
          ...this.selectRandom(availableNumbers.filter(n => coldNumbers.includes(n)), coldToAdd),
          ...this.selectRandom(availableNumbers.filter(n => !hotNumbers.includes(n) && !coldNumbers.includes(n)), balancedToAdd)
        ];
        break;

      case 'hot_focused':
        // Priorizar números quentes
        const hotAvailable = availableNumbers.filter(n => hotNumbers.includes(n));
        numbersToAdd = this.selectRandom(hotAvailable, Math.min(changeCount, hotAvailable.length));
        // Completar com balanceados se necessário
        if (numbersToAdd.length < changeCount) {
          const remaining = changeCount - numbersToAdd.length;
          numbersToAdd.push(...this.selectRandom(availableNumbers.filter(n => !numbersToAdd.includes(n)), remaining));
        }
        break;

      case 'cold_focused':
        // Priorizar números frios
        const coldAvailable = availableNumbers.filter(n => coldNumbers.includes(n));
        numbersToAdd = this.selectRandom(coldAvailable, Math.min(changeCount, coldAvailable.length));
        // Completar com balanceados se necessário
        if (numbersToAdd.length < changeCount) {
          const remaining = changeCount - numbersToAdd.length;
          numbersToAdd.push(...this.selectRandom(availableNumbers.filter(n => !numbersToAdd.includes(n)), remaining));
        }
        break;

      case 'even_odd_optimized':
        // Otimizar distribuição par/ímpar (50/50)
        const currentEven = toKeep.filter(n => n % 2 === 0).length;
        const currentOdd = keepCount - currentEven;
        const targetEven = Math.floor(expectedCount / 2);
        const targetOdd = expectedCount - targetEven;

        const needEven = Math.max(0, targetEven - currentEven);
        const needOdd = Math.max(0, targetOdd - currentOdd);

        numbersToAdd = [
          ...this.selectRandom(availableNumbers.filter(n => n % 2 === 0), needEven),
          ...this.selectRandom(availableNumbers.filter(n => n % 2 === 1), needOdd)
        ];

        // Completar se necessário
        if (numbersToAdd.length < changeCount) {
          const remaining = changeCount - numbersToAdd.length;
          numbersToAdd.push(...this.selectRandom(availableNumbers.filter(n => !numbersToAdd.includes(n)), remaining));
        }
        break;

      case 'dezena_optimized':
        // Otimizar distribuição por dezenas
        // Calcular dezenas atuais
        const dezenaCount: Record<number, number> = {};
        toKeep.forEach(num => {
          const dezena = Math.floor((num - 1) / 10) + 1;
          dezenaCount[dezena] = (dezenaCount[dezena] || 0) + 1;
        });

        // Encontrar dezenas com menos números
        const maxDezena = config.allNumbers.length === 25 ? 3 : 10;
        const dezenaDeficit: number[] = [];
        for (let d = 1; d <= maxDezena; d++) {
          const count = dezenaCount[d] || 0;
          if (count < expectedCount / maxDezena) {
            dezenaDeficit.push(d);
          }
        }

        // Adicionar números das dezenas deficitárias
        if (dezenaDeficit.length > 0) {
          const numbersFromDeficitDezenas = availableNumbers.filter(n => {
            const dezena = Math.floor((n - 1) / 10) + 1;
            return dezenaDeficit.includes(dezena);
          });
          numbersToAdd = this.selectRandom(numbersFromDeficitDezenas, Math.min(changeCount, numbersFromDeficitDezenas.length));
        }

        // Completar se necessário
        if (numbersToAdd.length < changeCount) {
          const remaining = changeCount - numbersToAdd.length;
          numbersToAdd.push(...this.selectRandom(availableNumbers.filter(n => !numbersToAdd.includes(n)), remaining));
        }
        break;

      default:
        numbersToAdd = this.selectRandom(availableNumbers, changeCount);
    }

    return [...toKeep, ...numbersToAdd].sort((a, b) => a - b);
  }

  /**
   * Seleciona N números aleatórios de um array
   */
  private static selectRandom(array: number[], count: number): number[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

export default GameVariationsService;
