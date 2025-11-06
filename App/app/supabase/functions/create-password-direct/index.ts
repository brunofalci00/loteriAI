import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[create-password-direct] 🚀 Request received');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    console.log('[create-password-direct] 📧 Email:', email);

    // Validações
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    // Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    // Inicializar Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Verificar se usuário existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);

    if (!existingUser) {
      console.log('[create-password-direct] ❌ Usuário não encontrado');
      throw new Error('Email não encontrado. Verifique se sua compra foi processada.');
    }

    console.log('[create-password-direct] ✅ Usuário encontrado:', existingUser.id);

    // 2. Validar se usuário tem pagamento ativo
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_email', email)
      .eq('status', 'active')
      .maybeSingle();

    if (paymentError) {
      console.error('[create-password-direct] ❌ Erro ao buscar pagamento:', paymentError);
      throw new Error('Erro ao verificar pagamento');
    }

    if (!payment) {
      console.log('[create-password-direct] ❌ Pagamento não encontrado para:', email);
      throw new Error('Nenhum pagamento ativo encontrado para este email. Entre em contato com o suporte.');
    }

    console.log('[create-password-direct] 💳 Pagamento ativo encontrado');

    // 3. Definir senha do usuário
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: password,
        email_confirm: true, // Garante que email está confirmado
      }
    );

    if (updateError) {
      console.error('[create-password-direct] ❌ Erro ao definir senha:', updateError);
      throw new Error('Erro ao definir senha. Tente novamente.');
    }

    console.log('[create-password-direct] ✅ Senha definida com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha criada com sucesso! Você já pode fazer login.',
        user_id: existingUser.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[create-password-direct] 💥 Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
