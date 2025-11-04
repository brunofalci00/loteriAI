import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Endpoint para conceder créditos por compartilhamento
 *
 * Sistema de recompensas:
 * - Primeiro share ever: +2 créditos
 * - Score 4.5+: +3 créditos
 * - Share normal: +1 crédito
 * - Limite: 5 shares/dia
 *
 * @author Claude Code
 * @date 2025-01-03
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[share-reward] 🎁 Requisição recebida');

    // 1. Validar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[share-reward] ❌ Token ausente');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 3. Obter usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[share-reward] ❌ Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = user.id;
    console.log('[share-reward] 👤 Usuário:', userId);

    // 4. Parse payload
    const { credits } = await req.json();

    if (!credits || credits < 1 || credits > 3) {
      console.error('[share-reward] ❌ Créditos inválidos:', credits);
      return new Response(
        JSON.stringify({ error: 'Invalid credits amount' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[share-reward] 🎁 Concedendo +${credits} créditos`);

    // 5. Buscar créditos atuais
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits_remaining, credits_total')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[share-reward] ❌ Erro ao buscar créditos:', fetchError);
      throw fetchError;
    }

    let newCreditsRemaining: number;
    let newCreditsTotal: number;

    if (!currentCredits) {
      // Usuário não tem registro de créditos ainda - criar
      newCreditsRemaining = 50 + credits; // 50 iniciais + bônus de share
      newCreditsTotal = 50 + credits;

      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          credits_remaining: newCreditsRemaining,
          credits_total: newCreditsTotal,
          last_reset_at: new Date().toISOString(),
          last_generation_at: null,
        });

      if (insertError) {
        console.error('[share-reward] ❌ Erro ao criar créditos:', insertError);
        throw insertError;
      }

      console.log('[share-reward] ✨ Créditos criados:', newCreditsRemaining);
    } else {
      // Atualizar créditos existentes
      newCreditsRemaining = currentCredits.credits_remaining + credits;
      newCreditsTotal = currentCredits.credits_total + credits;

      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: newCreditsRemaining,
          credits_total: newCreditsTotal,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('[share-reward] ❌ Erro ao atualizar créditos:', updateError);
        throw updateError;
      }

      console.log('[share-reward] ✅ Créditos atualizados:', newCreditsRemaining);
    }

    // 6. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        credits_awarded: credits,
        credits_remaining: newCreditsRemaining,
        message: `+${credits} ${credits === 1 ? 'crédito concedido' : 'créditos concedidos'}!`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[share-reward] 💥 Erro fatal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
