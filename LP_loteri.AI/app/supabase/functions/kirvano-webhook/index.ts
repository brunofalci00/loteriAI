import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kirvano-token',
};

serve(async (req) => {
  console.log('[kirvano-webhook] 🚀 === INÍCIO DA REQUISIÇÃO ===');
  console.log('[kirvano-webhook] 🔍 Method:', req.method);
  console.log('[kirvano-webhook] 🔍 URL:', req.url);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[kirvano-webhook] ⚙️ CORS Preflight - retornando 200');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[kirvano-webhook] 🎯 Processando webhook');

    // Log todos os headers para debug
    console.log('[kirvano-webhook] 🔍 Headers recebidos:');
    req.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    // 1. LER BODY COMO RAW (necessário para validação HMAC futura)
    console.log('[kirvano-webhook] 📖 Lendo body raw...');
    const rawBody = await req.text();
    console.log('[kirvano-webhook] 📦 Body raw (primeiros 200 chars):', rawBody.substring(0, 200));

    // 2. Parse do payload
    console.log('[kirvano-webhook] 🔄 Parsing JSON...');
    const payload = JSON.parse(rawBody);
    console.log(`[kirvano-webhook] 📦 Event: ${payload.event}`);
    console.log(`[kirvano-webhook] 📋 Payload:`, JSON.stringify(payload, null, 2));

    // 3. Processar apenas vendas aprovadas
    if (payload.event !== 'sale_approved') {
      console.log(`[kirvano-webhook] ⏭️ Evento ignorado: ${payload.event}`);
      return new Response(
        JSON.stringify({ message: 'Event type not processed' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 4. Extrair dados do cliente e transação
    const customerEmail = payload.customer?.email;

    if (!customerEmail) {
      console.error('[kirvano-webhook] ❌ Payload completo:', JSON.stringify(payload, null, 2));
      throw new Error('Email do cliente ausente no payload');
    }

    const customerName = payload.customer?.name || 'Usuário loter.AI';
    const transactionId = payload.transaction?.id || payload.id;
    const amount = payload.transaction?.amount_paid || payload.product?.price || 0;
    const productName = payload.product?.name || 'loter.AI - Acesso Vitalício';
    const paymentMethod = payload.transaction?.method || 'unknown';

    console.log(`[kirvano-webhook] 👤 Cliente: ${customerName} (${customerEmail})`);
    console.log(`[kirvano-webhook] 💰 Valor: R$ ${amount}`);
    console.log(`[kirvano-webhook] 🎫 Transaction ID: ${transactionId}`);

    // 5. Inicializar Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 6. Verificar se usuário já existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === customerEmail);

    let userId: string;
    let isNewUser = false;

    const appUrl = Deno.env.get('APP_URL') || 'https://www.fqdigital.com.br/app';

    if (existingUser) {
      console.log(`[kirvano-webhook] ✅ Usuário existente encontrado: ${existingUser.id}`);
      userId = existingUser.id;
    } else {
      // 7. Criar novo usuário no Supabase Auth
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true, // Email já confirmado (pagamento = confiável)
        user_metadata: {
          full_name: customerName,
          kirvano_customer_id: payload.customer?.id,
          created_via: 'kirvano_webhook'
        }
      });

      if (authError) {
        console.error('[kirvano-webhook] ❌ Erro ao criar usuário:', authError);
        throw authError;
      }

      userId = newUser.user.id;
      isNewUser = true;
      console.log(`[kirvano-webhook] ✨ Novo usuário criado: ${userId}`);
    }

    // 8. Chamar N8N para enviar email customizado (NOVO FLUXO)
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') ||
      'https://seu-n8n-instance.app/webhook/loter-ai-welcome';

    const n8nPayload = {
      email: customerEmail,
      name: customerName,
      userId: userId,
      transactionId: transactionId,
      value: amount,
      timestamp: new Date().toISOString()
    };

    // Chamar n8n webhook de forma não-bloqueante
    try {
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      })
        .then(response => {
          if (response.ok) {
            console.log(`[kirvano-webhook] ✉️ Email enviado via n8n para: ${customerEmail}`);
          } else {
            console.error(`[kirvano-webhook] ⚠️ Erro n8n (${response.status})`);
          }
        })
        .catch(error => {
          console.error('[kirvano-webhook] ⚠️ Erro ao chamar n8n:', error);
        });
    } catch (error) {
      console.error('[kirvano-webhook] ⚠️ Erro ao preparar n8n:', error);
    }

    // 9. FALLBACK: Enviar email Supabase genérico (se N8N falhar)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { error: emailError } = await supabaseClient.auth.resetPasswordForEmail(
      customerEmail,
      {
        redirectTo: `${appUrl}/auth?type=recovery`
      }
    );

    if (emailError) {
      console.error('[kirvano-webhook] ⚠️ Erro ao enviar email fallback:', emailError);
    } else {
      console.log(`[kirvano-webhook] ✉️ Email fallback (Supabase) enviado para: ${customerEmail}`);
    }

    // 9. Registrar/atualizar pagamento (upsert para prevenir duplicação)
    // Nota: Mantém nome de coluna hubla_transaction_id para compatibilidade
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert(
        {
          user_id: userId,
          hubla_transaction_id: transactionId,
          hubla_invoice_id: transactionId,
          amount: Math.round(amount * 100), // Converter para centavos se Kirvano enviar em reais
          status: 'active',
          product_name: productName,
          payment_method: paymentMethod,
          customer_name: customerName,
          customer_email: customerEmail,
        },
        {
          onConflict: 'hubla_transaction_id',
          ignoreDuplicates: false
        }
      );

    if (paymentError) {
      console.error('[kirvano-webhook] ❌ Erro ao registrar pagamento:', paymentError);
      throw paymentError;
    }

    console.log(`[kirvano-webhook] 💾 Pagamento registrado com sucesso`);
    console.log(`[kirvano-webhook] ✅ Processamento concluído!`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        is_new_user: isNewUser,
        transaction_id: transactionId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[kirvano-webhook] 💥 Erro fatal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
