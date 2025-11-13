import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[create-password-direct-test] 🚀 Request received');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    console.log('[create-password-direct-test] 📧 Email:', email);

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
    console.log('[create-password-direct-test] 🔍 Buscando usuário...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);

    if (!existingUser) {
      console.log('[create-password-direct-test] ❌ Usuário não encontrado');
      throw new Error('Email não encontrado. Verifique se sua compra foi processada.');
    }

    console.log('[create-password-direct-test] ✅ Usuário encontrado:', existingUser.id);

    // ⚠️ REMOVENDO VALIDAÇÃO DE PAGAMENTO PARA TESTE
    console.log('[create-password-direct-test] ⚠️ Modo teste - pulando validação de pagamento');

    // 3. Definir/Atualizar senha do usuário
    console.log('[create-password-direct-test] 🔐 Definindo senha para usuário:', existingUser.id);

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: password,
        email_confirm: true,
      }
    );

    if (updateError) {
      console.error('[create-password-direct-test] ❌ Erro detalhado:', JSON.stringify(updateError, null, 2));
      throw new Error(`Erro ao definir senha: ${updateError.message || 'Erro desconhecido'}`);
    }

    console.log('[create-password-direct-test] ✅ Senha definida/atualizada com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha criada com sucesso! (MODO TESTE - sem validação de pagamento)',
        user_id: existingUser.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[create-password-direct-test] 💥 Erro:', error);
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
