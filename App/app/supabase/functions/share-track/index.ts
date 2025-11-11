import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[share-track] 📨 Requisição recebida');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[share-track] ❌ Token ausente');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[share-track] ❌ Erro de autenticação:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = user.id;
    const body = await req.json();
    const {
      context,
      lotteryType,
      contestNumber,
      numbersShared,
      payload,
      messageLength,
    } = body;

    if (!context) {
      return new Response(JSON.stringify({ error: 'Missing context' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const insertPayload = {
      user_id: userId,
      context,
      lottery_type: lotteryType ?? null,
      contest_number: contestNumber ?? null,
      numbers_shared: numbersShared ?? null,
      payload: payload ?? null,
      message_length: messageLength ?? null,
    };

    const { error: insertError } = await supabase
      .from('share_events')
      .insert(insertPayload);

    if (insertError) {
      console.error('[share-track] ❌ Erro ao salvar evento:', insertError);
      throw insertError;
    }

    console.log('[share-track] ✅ Evento registrado:', context);

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[share-track] 💥 Erro inesperado:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
