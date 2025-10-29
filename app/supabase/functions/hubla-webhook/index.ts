import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hubla-token, x-hubla-idempotency',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[hubla-webhook] 🎯 Webhook recebido');

    // 1. SEGURANÇA: Validar token da Hubla
    const hublaToken = req.headers.get('x-hubla-token');
    const expectedToken = Deno.env.get('HUBLA_WEBHOOK_TOKEN');
    
    if (!hublaToken || hublaToken !== expectedToken) {
      console.error('[hubla-webhook] ❌ Token inválido ou ausente');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Idempotência: Log do key para debug
    const idempotencyKey = req.headers.get('x-hubla-idempotency');
    console.log(`[hubla-webhook] 🔑 Idempotency key: ${idempotencyKey}`);

    // 3. Parse do payload
    const payload = await req.json();
    console.log(`[hubla-webhook] 📦 Event type: ${payload.type}`);
    console.log(`[hubla-webhook] 📋 Payload:`, JSON.stringify(payload, null, 2));

    // 4. Processar apenas eventos de pagamento aprovado
    if (payload.type !== 'invoice.payment_succeeded') {
      console.log(`[hubla-webhook] ⏭️ Evento ignorado: ${payload.type}`);
      return new Response(
        JSON.stringify({ message: 'Event type not processed' }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 5. Extrair dados do cliente e transação
    const invoice = payload.event;
    const customer = invoice.customer;
    
    if (!customer?.email) {
      throw new Error('Email do cliente ausente no payload');
    }

    const customerEmail = customer.email;
    const customerName = customer.fullName || customer.name || 'Usuário loter.AI';
    const invoiceId = invoice.id;
    const transactionId = invoice.transaction?.id || invoiceId;
    const amount = invoice.amount?.value || invoice.total?.value || 0;
    const productName = invoice.products?.[0]?.name || 'loter.AI - Acesso Vitalício';
    const paymentMethod = invoice.payment?.method || 'unknown';

    console.log(`[hubla-webhook] 👤 Cliente: ${customerName} (${customerEmail})`);
    console.log(`[hubla-webhook] 💰 Valor: R$ ${amount}`);
    console.log(`[hubla-webhook] 🎫 Invoice ID: ${invoiceId}`);

    // 6. Inicializar Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 7. Verificar se usuário já existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === customerEmail);

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      console.log(`[hubla-webhook] ✅ Usuário existente encontrado: ${existingUser.id}`);
      userId = existingUser.id;
    } else {
      // 8. Criar novo usuário no Supabase Auth
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true, // Email já confirmado (pagamento = confiável)
        user_metadata: {
          full_name: customerName,
          hubla_customer_id: customer.id,
          created_via: 'hubla_webhook'
        }
      });

      if (authError) {
        console.error('[hubla-webhook] ❌ Erro ao criar usuário:', authError);
        throw authError;
      }

      userId = newUser.user.id;
      isNewUser = true;
      console.log(`[hubla-webhook] ✨ Novo usuário criado: ${userId}`);

      // 9. Enviar email de convite para definir senha
      const appUrl = Deno.env.get('APP_URL') || 'https://www.fqdigital.com.br/app';
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        customerEmail,
        { 
          redirectTo: `${appUrl}/auth?invited=true`,
          data: {
            full_name: customerName
          }
        }
      );

      if (inviteError) {
        console.error('[hubla-webhook] ⚠️ Erro ao enviar convite:', inviteError);
        // Não falhar a requisição por causa disso
      } else {
        console.log(`[hubla-webhook] ✉️ Email de convite enviado para: ${customerEmail}`);
      }
    }

    // 10. Registrar/atualizar pagamento (upsert para prevenir duplicação)
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert(
        {
          user_id: userId,
          hubla_transaction_id: transactionId,
          hubla_invoice_id: invoiceId,
          amount,
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
      console.error('[hubla-webhook] ❌ Erro ao registrar pagamento:', paymentError);
      throw paymentError;
    }

    console.log(`[hubla-webhook] 💾 Pagamento registrado com sucesso`);
    console.log(`[hubla-webhook] ✅ Processamento concluído!`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userId,
        is_new_user: isNewUser,
        invoice_id: invoiceId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[hubla-webhook] 💥 Erro fatal:', error);
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
