import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ManualGameAnalysisService, type ManualGameAnalysisParams, type AnalysisResult } from '@/services/manualGameAnalysisService';
import { GameVariationsService, type GenerateVariationsParams, type Variation } from '@/services/gameVariationsService';
import { LotteryType, getLotteryConfig } from '@/config/lotteryConfig';
import { toast } from 'sonner';

export type StepNumber = 1 | 2 | 3 | 4;

export interface ManualGameState {
  currentStep: StepNumber;
  lotteryType: LotteryType | null;
  contestNumber: number | null;
  selectedNumbers: number[];
  analysisResult: AnalysisResult | null;
  variations: Variation[];
  timeSpent: {
    step1: number;
    step2: number;
    step3: number;
    step4: number;
  };
}

export function useManualGameCreation() {
  const [state, setState] = useState<ManualGameState>({
    currentStep: 1,
    lotteryType: null,
    contestNumber: null,
    selectedNumbers: [],
    analysisResult: null,
    variations: [],
    timeSpent: { step1: 0, step2: 0, step3: 0, step4: 0 }
  });

  // Rastrear tempo gasto em cada etapa
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setStepStartTime(Date.now());
  }, [state.currentStep]);

  // Atualizar tempo gasto ao mudar de etapa
  const updateTimeSpent = useCallback((step: StepNumber) => {
    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
    setState(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [`step${step}`]: prev.timeSpent[`step${step}` as keyof typeof prev.timeSpent] + timeSpent
      }
    }));
  }, [stepStartTime]);

  // Navegação entre etapas
  const goToStep = useCallback((step: StepNumber) => {
    updateTimeSpent(state.currentStep);
    setState(prev => ({ ...prev, currentStep: step }));
  }, [state.currentStep, updateTimeSpent]);

  const nextStep = useCallback(() => {
    if (state.currentStep < 4) {
      goToStep((state.currentStep + 1) as StepNumber);
    }
  }, [state.currentStep, goToStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      goToStep((state.currentStep - 1) as StepNumber);
    }
  }, [state.currentStep, goToStep]);

  // Etapa 1: Selecionar loteria
  const selectLottery = useCallback((lotteryType: LotteryType) => {
    setState(prev => ({ ...prev, lotteryType, selectedNumbers: [] })); // Limpar números ao trocar de loteria
  }, []);

  // Etapa 2: Selecionar concurso
  const selectContest = useCallback((contestNumber: number) => {
    setState(prev => ({ ...prev, contestNumber }));
  }, []);

  // Etapa 3: Adicionar/remover número
  const toggleNumber = useCallback((number: number) => {
    setState(prev => {
      if (!prev.lotteryType) return prev;

      const isSelected = prev.selectedNumbers.includes(number);
      const config = getLotteryConfig(prev.lotteryType);
      const expectedCount = config.numbersToSelect;

      if (isSelected) {
        return {
          ...prev,
          selectedNumbers: prev.selectedNumbers.filter(n => n !== number),
          analysisResult: null, // Limpar análise ao editar
          variations: [] // Limpar variações ao editar
        };
      } else {
        if (prev.selectedNumbers.length >= expectedCount) {
          toast.error(`Limite atingido: você já selecionou ${expectedCount} números.`);
          return prev;
        }
        return {
          ...prev,
          selectedNumbers: [...prev.selectedNumbers, number].sort((a, b) => a - b),
          analysisResult: null, // Limpar análise ao editar
          variations: [] // Limpar variações ao editar
        };
      }
    });
  }, []);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedNumbers: [],
      analysisResult: null, // Limpar análise ao limpar
      variations: [] // Limpar variações ao limpar
    }));
    toast.info('Seleção limpa');
  }, []);

  // Seleção aleatória
  const randomSelection = useCallback(() => {
    if (!state.lotteryType) return;

    const config = getLotteryConfig(state.lotteryType);
    const expectedCount = config.numbersToSelect;
    const minNumber = config.minNumber;
    const maxNumber = config.maxNumber;

    const numbers: number[] = [];
    while (numbers.length < expectedCount) {
      const num = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    setState(prev => ({
      ...prev,
      selectedNumbers: numbers.sort((a, b) => a - b),
      analysisResult: null, // Limpar análise ao gerar aleatório
      variations: [] // Limpar variações ao gerar aleatório
    }));

    toast.success(`${expectedCount} números selecionados aleatoriamente!`);
  }, [state.lotteryType]);

  // Etapa 4: Analisar jogo
  const analyzeGame = useMutation({
    mutationFn: () => {
      if (!state.lotteryType || !state.contestNumber) {
        throw new Error('Dados incompletos');
      }

      const params: ManualGameAnalysisParams = {
        lotteryType: state.lotteryType,
        contestNumber: state.contestNumber,
        selectedNumbers: state.selectedNumbers
      };

      return ManualGameAnalysisService.analyzeManualGame(params);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setState(prev => ({ ...prev, analysisResult: result.data! }));
        toast.success('Análise concluída!', {
          description: `Score: ${result.data.score.toFixed(1)}/5`
        });
      } else {
        toast.error('Erro na análise', {
          description: result.error || 'Erro desconhecido'
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Erro ao analisar jogo', {
        description: error.message
      });
    }
  });

  // Gerar variações
  const generateVariations = useMutation({
    mutationFn: () => {
      console.log('🚀 useManualGameCreation: Iniciando geração de variações...');
      if (!state.lotteryType || !state.contestNumber) {
        throw new Error('Dados incompletos');
      }

      const params: GenerateVariationsParams = {
        originalNumbers: state.selectedNumbers,
        lotteryType: state.lotteryType,
        contestNumber: state.contestNumber
      };

      console.log('📋 Params:', params);
      return GameVariationsService.generateVariations(params);
    },
    onSuccess: (result) => {
      console.log('✅ useManualGameCreation: Resultado recebido:', result);
      if (result.success && result.data) {
        console.log(`📦 Atualizando estado com ${result.data.length} variações`);
        setState(prev => ({ ...prev, variations: result.data! }));
        toast.success('5 variações geradas!', {
          description: 'Explore as opções otimizadas pela IA.'
        });
        console.log('✅ Estado atualizado! variations.length =', result.data.length);
      } else {
        console.error('❌ Resultado sem sucesso:', result.error);
        toast.error('Erro ao gerar variações', {
          description: result.error || 'Erro desconhecido'
        });
      }
    },
    onError: (error: Error) => {
      console.error('❌ useManualGameCreation: Erro na mutação:', error);
      toast.error('Erro ao gerar variações', {
        description: error.message
      });
    }
  });

  // Reiniciar stepper
  const resetStepper = useCallback(() => {
    setState({
      currentStep: 1,
      lotteryType: null,
      contestNumber: null,
      selectedNumbers: [],
      analysisResult: null,
      variations: [],
      timeSpent: { step1: 0, step2: 0, step3: 0, step4: 0 }
    });
    toast.info('Criando novo jogo');
  }, []);

  // Validações por etapa
  const canProceedToStep2 = state.lotteryType !== null;
  const canProceedToStep3 = state.contestNumber !== null;
  const canProceedToStep4 = state.lotteryType &&
    state.selectedNumbers.length === getLotteryConfig(state.lotteryType).numbersToSelect;

  return {
    // Estado
    state,

    // Navegação
    goToStep,
    nextStep,
    prevStep,
    resetStepper,

    // Etapa 1
    selectLottery,

    // Etapa 2
    selectContest,

    // Etapa 3
    toggleNumber,
    clearSelection,
    randomSelection,

    // Etapa 4
    analyzeGame,
    generateVariations,

    // Validações
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
  };
}
