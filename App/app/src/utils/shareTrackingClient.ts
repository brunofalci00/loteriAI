/**
 * Helper para invocar edge functions relacionadas a tracking de compartilhamentos.
 * Usa import dinâmico para evitar carregar o cliente Supabase em bundle inicial.
 */
export async function invokeSupabaseFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>
): Promise<T | null> {
  const { supabase } = await import('@/integrations/supabase/client');

  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
  });

  if (error) {
    throw error;
  }

  return data;
}
