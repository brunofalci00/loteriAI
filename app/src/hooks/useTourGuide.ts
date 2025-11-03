import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TourStep {
  id: string;
  target: string; // CSS selector do elemento
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export function useTourGuide(tourId: string, steps: TourStep[]) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default true para não mostrar até verificar

  // Verificar se usuário já viu o tour
  useEffect(() => {
    const checkTourStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('has_seen_manual_creation_tour')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        const seen = data.has_seen_manual_creation_tour || false;
        setHasSeenTour(seen);
        if (!seen) {
          setIsActive(true); // Ativar tour automaticamente
        }
      }
    };

    checkTourStatus();
  }, [tourId]);

  // Marcar tour como visto
  const markTourAsSeen = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ has_seen_manual_creation_tour: true })
      .eq('id', user.id);

    setHasSeenTour(true);
    setIsActive(false);
  };

  // Navegar entre etapas
  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      markTourAsSeen();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const skipTour = () => {
    markTourAsSeen();
  };

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isLastStep,
    hasSeenTour,
    nextStep,
    prevStep,
    skipTour,
    startTour: () => setIsActive(true),
  };
}
