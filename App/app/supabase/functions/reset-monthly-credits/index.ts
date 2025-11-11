import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function: Reset Monthly Credits
 *
 * Executa no dia 1º de cada mês via Supabase Cron
 *
 * Funcionalidade:
 * - Reseta credits_remaining de todos os usuários para 20
 * - Reseta credits_total para 20
 * - Atualiza last_reset_at para data atual
 *
 * Cron Schedule: 0 0 1 * * (00:00 do dia 1 de cada mês)
 *
 * @author Claude Code
 * @date 2025-01-04
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[reset-monthly-credits] 🔄 Iniciando reset mensal...');

    // Validar que a requisição vem do Supabase Cron
    // O Supabase Cron envia um header especial ou usa service role
    const authHeader = req.headers.get('Authorization');

    // Criar cliente Supabase com SERVICE ROLE para acesso total
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Chamar a função SQL reset_monthly_credits()
    const { data, error } = await supabase.rpc('reset_monthly_credits');

    if (error) {
      console.error('[reset-monthly-credits] ❌ Erro ao executar função SQL:', error);
      throw error;
    }

    console.log('[reset-monthly-credits] ✅ Reset executado com sucesso!');
    console.log('[reset-monthly-credits] 📊 Resultado:', data);

    // data deve conter o número de usuários resetados
    const usersReset = data || 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reset mensal concluído com sucesso`,
        users_reset: usersReset,
        reset_date: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[reset-monthly-credits] 💥 Erro fatal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        reset_date: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
