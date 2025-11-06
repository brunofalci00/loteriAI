import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentGuard = () => {
  const [hasPayment, setHasPayment] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasPayment(false);
        setIsLoading(false);
        return;
      }

      const { data: payment, error } = await supabase
        .from('payments')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('[usePaymentGuard] Erro ao verificar pagamento:', error);
        setHasPayment(false);
      } else {
        setHasPayment(!!payment);
      }
    } catch (error) {
      console.error('[usePaymentGuard] Erro:', error);
      setHasPayment(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { hasPayment, isLoading, recheckPayment: checkPaymentStatus };
};
