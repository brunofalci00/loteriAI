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

    // 1. LER BODY COMO RAW
    console.log('[kirvano-webhook] 📖 Lendo body raw...');
    const rawBody = await req.text();
    console.log('[kirvano-webhook] 📦 Body raw (primeiros 200 chars):', rawBody.substring(0, 200));

    // 2. Parse do payload
    console.log('[kirvano-webhook] 🔄 Parsing JSON...');
    const payload = JSON.parse(rawBody);
    console.log(`[kirvano-webhook] 📦 Event: ${payload.event}`);

    // 3. Processar apenas vendas aprovadas
    const eventType = payload.event?.toUpperCase();
    console.log(`[kirvano-webhook] 🔍 Event type normalizado: ${eventType}`);

    if (eventType !== 'SALE_APPROVED') {
      console.log(`[kirvano-webhook] ⏭️ Evento ignorado: ${payload.event}`);
      return new Response(
        JSON.stringify({ message: 'Event type not processed' }),
        { status: 200, headers: corsHeaders }
      );
    }

    console.log('[kirvano-webhook] ✅ Evento SALE_APPROVED confirmado, continuando...');

    // 4. Extrair dados do cliente
    const customerEmail = payload.customer?.email;
    if (!customerEmail) {
      console.error('[kirvano-webhook] ❌ Payload completo:', JSON.stringify(payload, null, 2));
      throw new Error('Email do cliente ausente no payload');
    }

    const customerName = payload.customer?.name || 'Usuário loter.AI';
    const transactionId = payload.sale_id;
    const paymentMethod = payload.payment_method || 'unknown';

    // Kirvano envia total_price como STRING "R$ 169,80" - precisa parsear
    const totalPriceStr = payload.total_price || 'R$ 0,00';
    const amountInReais = parseFloat(
      totalPriceStr.replace('R$', '').replace(/\s/g, '').replace(',', '.')
    );
    const amount = Math.round(amountInReais * 100);

    // Kirvano envia ARRAY de produtos
    const products = payload.products || [];
    const productNames = products.map((p) => p.name).join(', ');
    const productName = productNames || 'loter.AI - Acesso Vitalício';

    console.log(`[kirvano-webhook] 👤 Cliente: ${customerName} (${customerEmail})`);
    console.log(`[kirvano-webhook] 💰 Valor total: ${totalPriceStr} (${amount} centavos)`);
    console.log(`[kirvano-webhook] 🎫 Sale ID: ${transactionId}`);
    console.log(`[kirvano-webhook] 📦 Produtos (${products.length}): ${productName}`);

    // 5. Inicializar Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 6. Verificar se usuário já existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === customerEmail);

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      console.log(`[kirvano-webhook] ✅ Usuário existente encontrado: ${existingUser.id}`);
      userId = existingUser.id;
    } else {
      // 7. Criar novo usuário no Supabase Auth
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
          kirvano_customer_id: payload.customer?.id,
          created_via: 'kirvano_webhook',
        },
      });

      if (authError) {
        console.error('[kirvano-webhook] ❌ Erro ao criar usuário:', authError);
        throw authError;
      }

      userId = newUser.user.id;
      isNewUser = true;
      console.log(`[kirvano-webhook] ✨ Novo usuário criado: ${userId}`);
    }

    // 8. Registrar/atualizar pagamento
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert(
        {
          user_id: userId,
          hubla_transaction_id: transactionId,
          hubla_invoice_id: transactionId,
          amount: amount,
          status: 'active',
          product_name: productName,
          payment_method: paymentMethod,
          customer_name: customerName,
          customer_email: customerEmail,
        },
        {
          onConflict: 'hubla_transaction_id',
          ignoreDuplicates: false,
        }
      );

    if (paymentError) {
      console.error('[kirvano-webhook] ❌ Erro ao registrar pagamento:', paymentError);
      throw paymentError;
    }

    console.log(`[kirvano-webhook] 💾 Pagamento registrado com sucesso`);

    // 9. 🆕 CHAMAR N8N WEBHOOK PARA ENVIAR EMAIL COM TOKEN
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') ||
      'https://n8n.srv1079374.hstgr.cloud/webhook/loter-ai-welcome';

    const n8nPayload = {
      userId: userId,
      email: customerEmail,
      name: customerName,
      transactionId: transactionId,
      value: amountInReais,
      timestamp: new Date().toISOString(),
    };

    console.log('[kirvano-webhook] 📤 Enviando para N8N webhook...');
    console.log('[kirvano-webhook] 📦 Payload N8N:', JSON.stringify(n8nPayload));

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload),
      });

      if (n8nResponse.ok) {
        const n8nResult = await n8nResponse.json();
        console.log('[kirvano-webhook] ✅ N8N webhook executado com sucesso');
        console.log('[kirvano-webhook] 📨 Resposta N8N:', JSON.stringify(n8nResult));
      } else {
        console.error(
          `[kirvano-webhook] ⚠️ Erro N8N (${n8nResponse.status}): ${await n8nResponse.text()}`
        );
      }
    } catch (n8nError) {
      console.error('[kirvano-webhook] ⚠️ Erro ao chamar N8N:', n8nError);
    }

    console.log(`[kirvano-webhook] ✅ Processamento concluído!`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        is_new_user: isNewUser,
        transaction_id: transactionId,
        message: 'Pagamento registrado e email agendado para envio',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[kirvano-webhook] 💥 Erro fatal:', error);
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
