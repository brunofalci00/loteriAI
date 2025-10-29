import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kirvano-token',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[kirvano-webhook] 🎯 Webhook recebido');

    // 1. SEGURANÇA: Validar token (opcional, se configurado)
    const kirvanoToken = req.headers.get('x-kirvano-token');
    const expectedToken = Deno.env.get('KIRVANO_WEBHOOK_TOKEN');

    if (expectedToken && kirvanoToken !== expectedToken) {
      console.error('[kirvano-webhook] ❌ Token inválido');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse do payload
    const payload = await req.json();
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

    // 8. Enviar email de acesso (SEMPRE - para novos e existentes)
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
      console.error('[kirvano-webhook] ⚠️ Erro ao enviar email de acesso:', emailError);
    } else {
      console.log(`[kirvano-webhook] ✉️ Email de acesso enviado para: ${customerEmail}`);
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
