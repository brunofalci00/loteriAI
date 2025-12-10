import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// ========================================
// TYPES
// ========================================

interface BuyerData {
  name: string;
  email: string;
  document?: string;
  phone?: string;
}

interface ProductData {
  name: string;
  quantity?: number;
}

interface OfferData {
  name?: string;
  discount_price?: number;
  quantity?: number;
}

interface TrackingData {
  ref?: string;
  src?: string;
  sck?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_id?: string;
  utm_term?: string;
  utm_content?: string;
}

interface CreatePixRequest {
  action: 'create';
  external_id: string;
  amount: number; // centavos
  buyer: BuyerData;
  product?: ProductData;
  offer?: OfferData;
  tracking?: TrackingData;
}

interface StatusRequest {
  action: 'status';
  external_id: string;
}

interface WebhookRequest {
  action: 'webhook';
  event: string;
  data: any;
}

type RequestPayload = CreatePixRequest | StatusRequest | WebhookRequest;

// ========================================
// HELPER FUNCTIONS
// ========================================

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

// ========================================
// BUCK API FUNCTIONS
// ========================================

async function callBuckAPI(
  endpoint: string,
  method: string,
  body?: any
): Promise<any> {
  const buckApiUrl = Deno.env.get('BUCKPAY_API_URL') || 'https://api.realtechdev.com.br';
  const buckApiToken = Deno.env.get('BUCKPAY_API_TOKEN') || Deno.env.get('BUCK_WEBHOOK_TOKEN');
  const buckUserAgent = Deno.env.get('BUCKPAY_USER_AGENT') || 'loter.AI/1.0';

  console.log(`[buckpay-pix] 🌐 Calling Buck API: ${method} ${endpoint}`);

  const response = await fetch(`${buckApiUrl}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${buckApiToken}`,
      'User-Agent': buckUserAgent,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[buckpay-pix] ❌ Buck API error (${response.status}):`, errorText);
    throw new Error(`Buck API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[buckpay-pix] ✅ Buck API success');
  return data;
}

// ========================================
// DATABASE FUNCTIONS
// ========================================

async function storePixTransaction(
  supabase: any,
  external_id: string,
  transaction_id: string,
  email: string,
  name: string,
  amount: number,
  tracking: any = {}
): Promise<void> {
  try {
    console.log('[buckpay-pix] 💾 Storing PIX transaction in database...');

    const { error } = await supabase
      .from('pix_transactions')
      .insert({
        external_id,
        transaction_id,
        email,
        name,
        amount_cents: amount,
        status: 'pending',
        tracking
      });

    if (error) {
      console.error('[buckpay-pix] ⚠️ Failed to store transaction (non-fatal):', error);
      // Não lançar erro - falha no DB não deve impedir fluxo
    } else {
      console.log('[buckpay-pix] ✅ PIX transaction stored');
    }
  } catch (err) {
    console.error('[buckpay-pix] ⚠️ Exception storing transaction (non-fatal):', err);
  }
}

async function updatePixTransactionStatus(
  supabase: any,
  external_id: string,
  status: string
): Promise<void> {
  try {
    console.log(`[buckpay-pix] 🔄 Updating transaction status to: ${status}`);

    const update: any = { status };
    if (status === 'paid') {
      update.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('pix_transactions')
      .update(update)
      .eq('external_id', external_id);

    if (error) {
      console.error('[buckpay-pix] ⚠️ Failed to update status (non-fatal):', error);
    } else {
      console.log('[buckpay-pix] ✅ Transaction status updated');
    }
  } catch (err) {
    console.error('[buckpay-pix] ⚠️ Exception updating status (non-fatal):', err);
  }
}

// ========================================
// PAYMENT PROCESSING
// ========================================

async function processPayment(
  supabase: any,
  customerEmail: string,
  customerName: string,
  transactionId: string,
  amount: number,
  productName: string,
  paymentMethod: string,
  buyerDocument?: string
): Promise<{ userId: string; isNewUser: boolean }> {
  console.log(`[buckpay-pix] 👤 Processing payment for: ${customerName} (${customerEmail})`);
  console.log(`[buckpay-pix] 💰 Amount: ${formatCurrency(amount)}`);
  console.log(`[buckpay-pix] 🎫 Transaction ID: ${transactionId}`);

  // Verificar se usuário já existe
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u: any) => u.email === customerEmail);

  let userId: string;
  let isNewUser = false;

  if (existingUser) {
    console.log(`[buckpay-pix] ✅ Existing user found: ${existingUser.id}`);
    userId = existingUser.id;
  } else {
    // Criar novo usuário
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: customerEmail,
      email_confirm: true,
      user_metadata: {
        full_name: customerName,
        buck_buyer_id: buyerDocument,
        created_via: 'buckpay_pix'
      }
    });

    if (authError) {
      console.error('[buckpay-pix] ❌ Error creating user:', authError);
      throw authError;
    }

    userId = newUser.user.id;
    isNewUser = true;
    console.log(`[buckpay-pix] ✨ New user created: ${userId}`);
  }

  // Chamar N8N webhook
  await callN8NWebhook(userId, customerEmail, customerName, transactionId, amount);

  // Enviar email de acesso
  await sendAccessEmail(customerEmail);

  // Registrar pagamento (com upsert para prevenir duplicação)
  await registerPayment(
    supabase,
    userId,
    transactionId,
    amount,
    productName,
    paymentMethod,
    customerName,
    customerEmail
  );

  return { userId, isNewUser };
}

async function callN8NWebhook(
  userId: string,
  email: string,
  name: string,
  transactionId: string,
  amount: number
): Promise<void> {
  try {
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') ||
      'https://n8n-evo-n8n.harxon.easypanel.host/webhook/loter-ai-welcome';

    const n8nPayload = {
      userId,
      email,
      name,
      transactionId,
      value: amount / 100, // converter centavos para reais
      timestamp: new Date().toISOString()
    };

    console.log('[buckpay-pix] 📤 Sending to N8N webhook...');
    console.log('[buckpay-pix] 📦 N8N payload:', JSON.stringify(n8nPayload));

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload)
    });

    if (n8nResponse.ok) {
      const n8nResult = await n8nResponse.json();
      console.log('[buckpay-pix] ✅ N8N webhook executed successfully');
      console.log('[buckpay-pix] 📨 N8N response:', JSON.stringify(n8nResult));
    } else {
      console.error(`[buckpay-pix] ⚠️ N8N error (${n8nResponse.status}): ${await n8nResponse.text()}`);
    }
  } catch (err) {
    console.error('[buckpay-pix] ⚠️ Error calling N8N (non-fatal):', err);
  }
}

async function sendAccessEmail(email: string): Promise<void> {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const appUrl = Deno.env.get('APP_URL') || 'https://www.fqdigital.com.br/app';

    const { error: emailError } = await supabaseClient.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${appUrl}/auth?type=recovery` }
    );

    if (emailError) {
      console.error('[buckpay-pix] ⚠️ Error sending access email:', emailError);
    } else {
      console.log(`[buckpay-pix] ✉️ Access email sent to: ${email}`);
    }
  } catch (err) {
    console.error('[buckpay-pix] ⚠️ Exception sending email (non-fatal):', err);
  }
}

async function registerPayment(
  supabase: any,
  userId: string,
  transactionId: string,
  amount: number,
  productName: string,
  paymentMethod: string,
  customerName: string,
  customerEmail: string
): Promise<void> {
  try {
    console.log('[buckpay-pix] 💾 Registering payment...');

    const { error: paymentError } = await supabase
      .from('payments')
      .upsert({
        user_id: userId,
        buck_transaction_id: transactionId,
        amount: amount, // já em centavos
        status: 'active',
        product_name: productName,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_email: customerEmail
      }, {
        onConflict: 'buck_transaction_id',
        ignoreDuplicates: false
      });

    if (paymentError) {
      console.error('[buckpay-pix] ❌ Error registering payment:', paymentError);
      throw paymentError;
    }

    console.log('[buckpay-pix] ✅ Payment registered successfully');
  } catch (err) {
    console.error('[buckpay-pix] ⚠️ Exception registering payment:', err);
    throw err;
  }
}

// ========================================
// ACTION HANDLERS
// ========================================

async function handleCreatePix(payload: CreatePixRequest, supabase: any): Promise<Response> {
  console.log('[buckpay-pix] 🎯 Action: CREATE PIX');
  console.log('[buckpay-pix] 📦 External ID:', payload.external_id);
  console.log('[buckpay-pix] 💰 Amount:', formatCurrency(payload.amount));
  console.log('[buckpay-pix] 👤 Buyer:', payload.buyer.email);

  // Preparar payload para Buck API
  const buckPayload = {
    external_id: payload.external_id,
    payment_method: 'pix',
    amount: payload.amount,
    buyer: {
      name: payload.buyer.name,
      email: payload.buyer.email,
      document: payload.buyer.document,
      phone: payload.buyer.phone
    },
    product: {
      name: payload.product?.name || 'Acesso loter.IA',
      quantity: payload.product?.quantity || 1
    },
    offer: {
      name: payload.offer?.name || 'Quiz Classic - Desconto Especial',
      discount_price: payload.offer?.discount_price || payload.amount,
      quantity: payload.offer?.quantity || 1
    },
    tracking: payload.tracking || {}
  };

  console.log('[buckpay-pix] 📤 Calling Buck API to create PIX...');

  // Chamar Buck API
  const buckResponse = await callBuckAPI('/v1/transactions', 'POST', buckPayload);

  if (!buckResponse.data?.pix) {
    throw new Error('Buck API response missing PIX data');
  }

  const transactionData = buckResponse.data;
  console.log('[buckpay-pix] ✅ PIX created successfully');
  console.log('[buckpay-pix] 🎫 Transaction ID:', transactionData.id);
  console.log('[buckpay-pix] 📊 Status:', transactionData.status);

  // Armazenar em pix_transactions
  await storePixTransaction(
    supabase,
    payload.external_id,
    transactionData.id,
    payload.buyer.email,
    payload.buyer.name,
    payload.amount,
    payload.tracking
  );

  // Retornar QR Code e dados
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        transaction_id: transactionData.id,
        external_id: payload.external_id,
        status: transactionData.status,
        qrcode_base64: transactionData.pix.qrcode_base64,
        pix_code: transactionData.pix.code,
        amount: transactionData.total_amount
      }
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleCheckStatus(payload: StatusRequest, supabase: any): Promise<Response> {
  console.log('[buckpay-pix] 🎯 Action: CHECK STATUS');
  console.log('[buckpay-pix] 📦 External ID:', payload.external_id);

  // Consultar status na Buck API
  const buckResponse = await callBuckAPI(
    `/v1/transactions/external_id/${payload.external_id}`,
    'GET'
  );

  const transactionData = buckResponse.data;
  const currentStatus = transactionData.status;

  console.log('[buckpay-pix] 📊 Current status:', currentStatus);

  // Atualizar status no banco
  await updatePixTransactionStatus(supabase, payload.external_id, currentStatus);

  // Se foi pago, processar pagamento
  if (currentStatus === 'paid') {
    console.log('[buckpay-pix] 💳 Status is PAID - processing payment...');

    const buyer = transactionData.buyer;
    const { userId, isNewUser } = await processPayment(
      supabase,
      buyer.email,
      buyer.name,
      transactionData.id,
      transactionData.total_amount * 100, // converter reais para centavos
      transactionData.offer?.name || 'Acesso loter.IA',
      'pix',
      buyer.document
    );

    console.log('[buckpay-pix] ✅ Payment processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        status: currentStatus,
        paid: true,
        user_id: userId,
        is_new_user: isNewUser
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Status não é 'paid'
  return new Response(
    JSON.stringify({
      success: true,
      status: currentStatus,
      paid: false
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleWebhook(payload: WebhookRequest, supabase: any, req: Request): Promise<Response> {
  console.log('[buckpay-pix] 🎯 Action: WEBHOOK');
  console.log(`[buckpay-pix] 📦 Event: ${payload.event}`);
  console.log('[buckpay-pix] 📋 Payload:', JSON.stringify(payload, null, 2));

  // Validar token
  const buckToken = req.headers.get('authorization');
  const expectedToken = Deno.env.get('BUCK_WEBHOOK_TOKEN');

  if (!buckToken || buckToken !== expectedToken) {
    console.error('[buckpay-pix] ❌ Invalid or missing token');
    console.error('[buckpay-pix] ❌ Received:', buckToken);
    console.error('[buckpay-pix] ❌ Expected:', expectedToken);
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  console.log('[buckpay-pix] ✅ Token validated successfully!');

  // Processar apenas eventos de pagamento aprovado
  if (payload.event !== 'transaction.processed' || payload.data?.status !== 'paid') {
    console.log(`[buckpay-pix] ⏭️ Event ignored: ${payload.event} (status: ${payload.data?.status})`);
    return new Response(
      JSON.stringify({ message: 'Event type not processed' }),
      { status: 200, headers: corsHeaders }
    );
  }

  // Extrair dados
  const eventData = payload.data;
  const buyer = eventData?.buyer;

  const customerEmail = buyer?.email;
  const customerName = buyer?.name || 'Usuário loter.IA';
  const transactionId = eventData?.id;
  const amount = (eventData?.total_amount || 0) * 100; // converter reais para centavos
  const productName = eventData?.offer?.name || 'loter.IA - Acesso Vitalício';
  const paymentMethod = eventData?.payment_method || 'pix';

  if (!customerEmail) {
    console.error('[buckpay-pix] ❌ Complete payload:', JSON.stringify(payload, null, 2));
    throw new Error('Customer email missing from payload');
  }

  // Atualizar status em pix_transactions (se existir)
  if (eventData.external_id) {
    await updatePixTransactionStatus(supabase, eventData.external_id, 'paid');
  }

  // Processar pagamento
  const { userId, isNewUser } = await processPayment(
    supabase,
    customerEmail,
    customerName,
    transactionId,
    amount,
    productName,
    paymentMethod,
    buyer?.document
  );

  console.log('[buckpay-pix] ✅ Webhook processing completed!');

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
}

// ========================================
// MAIN HANDLER
// ========================================

serve(async (req) => {
  console.log('[buckpay-pix] 🚀 === REQUEST RECEIVED ===');
  console.log('[buckpay-pix] 🔍 Method:', req.method);
  console.log('[buckpay-pix] 🔍 URL:', req.url);
  console.log('[buckpay-pix] ⏰ Timestamp:', new Date().toISOString());

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[buckpay-pix] ⚙️ CORS Preflight - returning 200');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse payload
    const rawBody = await req.text();
    console.log('[buckpay-pix] 📦 Body raw:', rawBody);

    const payload: RequestPayload = JSON.parse(rawBody);
    console.log('[buckpay-pix] 🎯 Action:', (payload as any).action || 'webhook');

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Route to appropriate handler
    if ('action' in payload) {
      switch (payload.action) {
        case 'create':
          return await handleCreatePix(payload, supabase);
        case 'status':
          return await handleCheckStatus(payload, supabase);
        case 'webhook':
          return await handleWebhook(payload, supabase, req);
        default:
          throw new Error(`Unknown action: ${(payload as any).action}`);
      }
    } else {
      // Legacy webhook format (no action field)
      console.log('[buckpay-pix] 📌 Legacy webhook format detected');
      return await handleWebhook({ action: 'webhook', ...payload } as WebhookRequest, supabase, req);
    }
  } catch (error) {
    console.error('[buckpay-pix] 💥 Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
