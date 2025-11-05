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
    const eventData = payload.event;
    const invoice = eventData.invoice;
    const payer = invoice?.payer;
    const customer = eventData.customer;
    const user = eventData.user;

    // Tentar extrair email (priorizar payer, depois customer, depois user)
    const customerEmail = payer?.email ||
                         customer?.email ||
                         user?.email ||
                         invoice?.email ||
                         eventData.email;

    if (!customerEmail) {
      console.error('[hubla-webhook] ❌ Payload completo:', JSON.stringify(payload, null, 2));
      throw new Error('Email do cliente ausente no payload');
    }

    // Extrair nome completo
    const firstName = payer?.firstName || customer?.firstName || user?.firstName || '';
    const lastName = payer?.lastName || customer?.lastName || user?.lastName || '';
    const customerName = `${firstName} ${lastName}`.trim() ||
                        customer?.fullName ||
                        customer?.name ||
                        payer?.name ||
                        'Usuário loter.AI';

    const invoiceId = invoice?.id;
    const transactionId = invoice?.id; // Hubla usa mesmo ID
    const amount = invoice?.amount?.totalCents || invoice?.amount?.value || 0;
    const productName = eventData.products?.[0]?.name || eventData.product?.name || 'loter.AI - Acesso Vitalício';
    const paymentMethod = invoice?.paymentMethod || 'unknown';

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

    const appUrl = Deno.env.get('APP_URL') || 'https://www.fqdigital.com.br/app';

    if (existingUser) {
      console.log(`[hubla-webhook] ✅ Usuário existente encontrado: ${existingUser.id}`);
      userId = existingUser.id;
    } else {
      // 8. Criar novo usuário no Supabase Auth com senha temporária
      // Gera senha temporária: primeiros 3 chars do nome + últimos 6 do invoice ID
      const tempPassword = `${firstName.substring(0, 3)}${invoiceId.slice(-6)}`.toLowerCase();

      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        password: tempPassword,
        email_confirm: true, // Email já confirmado (pagamento = confiável)
        user_metadata: {
          full_name: customerName,
          hubla_payer_id: payer?.id || customer?.id || user?.id,
          created_via: 'hubla_webhook',
          temp_password: tempPassword // Armazena para enviar no email
        }
      });

      if (authError) {
        console.error('[hubla-webhook] ❌ Erro ao criar usuário:', authError);
        throw authError;
      }

      userId = newUser.user.id;
      isNewUser = true;
      console.log(`[hubla-webhook] ✨ Novo usuário criado: ${userId}`);
      console.log(`[hubla-webhook] 🔑 Senha temporária: ${tempPassword}`);
    }

    // 9. Preparar instruções de login
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const tempPassword = userData?.user?.user_metadata?.temp_password || '';
    const loginUrl = `${appUrl}/auth`;

    console.log(`[hubla-webhook] 🔗 URL de login: ${loginUrl}`);

    // 10. Enviar email via Resend ou Supabase (fallback)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      console.log('[hubla-webhook] ⚠️ RESEND_API_KEY não configurada - usando email do Supabase');

      // Fallback: usa resetPasswordForEmail do Supabase
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!
      );

      const { error: emailError } = await supabaseClient.auth.resetPasswordForEmail(
        customerEmail,
        { redirectTo: `${loginUrl}?type=recovery` }
      );

      if (emailError) {
        console.error('[hubla-webhook] ⚠️ Erro ao enviar email:', emailError);
      } else {
        console.log(`[hubla-webhook] ✉️ Email do Supabase enviado para: ${customerEmail}`);
        console.log(`[hubla-webhook] 🔑 Senha temporária (para suporte): ${tempPassword}`);
      }
    } else {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'loter.AI <onboarding@resend.dev>',
          to: customerEmail,
          subject: '🎉 Seu acesso ao loter.AI está liberado!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bem-vindo ao loter.AI!</h1>
              </div>

              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Olá <strong>${customerName}</strong>,</p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  Seu pagamento foi confirmado com sucesso! 🎊
                </p>

                ${isNewUser ? `
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Use as credenciais abaixo para fazer seu primeiro acesso:
                  </p>

                  <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">📧 Email:</p>
                    <p style="margin: 0 0 20px 0; font-family: monospace; background: white; padding: 12px; border-radius: 4px; font-size: 16px;">${customerEmail}</p>

                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #1e40af;">🔑 Senha Temporária:</p>
                    <p style="margin: 0 0 10px 0; font-family: monospace; background: white; padding: 12px; border-radius: 4px; font-size: 20px; font-weight: bold; color: #059669;">${tempPassword}</p>

                    <p style="font-size: 13px; color: #666; margin: 15px 0 0 0;">
                      ⚠️ Após fazer login, você poderá alterar sua senha nas configurações.
                    </p>
                  </div>
                ` : `
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 0; color: #92400e;">
                      ✅ Você já possui uma conta! Use sua senha atual para fazer login.
                    </p>
                  </div>
                `}

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${loginUrl}"
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 15px 40px;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                            font-size: 16px;
                            display: inline-block;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    🚀 Fazer Login
                  </a>
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <strong>Detalhes da compra:</strong><br>
                  Produto: ${productName}<br>
                  Valor: R$ ${(amount / 100).toFixed(2)}<br>
                  ID da Transação: ${invoiceId}
                </p>

                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                  Se você não fez esta compra, por favor ignore este email.
                </p>
              </div>
            </body>
            </html>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('[hubla-webhook] ⚠️ Erro ao enviar email via Resend:', errorText);
      } else {
        const emailData = await emailResponse.json();
        console.log(`[hubla-webhook] ✉️ Email enviado com sucesso via Resend! ID: ${emailData.id}`);
      }
    }

    // 11. Registrar/atualizar pagamento (upsert para prevenir duplicação)
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
