import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

Deno.serve(async (req) => {
  try {
    const { token, password } = await req.json();

    // Validar inputs
    if (!token || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token e senha são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha deve ter no mínimo 6 caracteres' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // 1. Validar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar expiração
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (expiresAt < now || tokenData.used_at) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token expirado ou já utilizado' }),
        { status: 410, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Atualizar senha no auth.users
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password }
    );

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar senha' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Marcar token como usado
    const { error: markError } = await supabase
      .from('access_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (markError) {
      console.error('Erro ao marcar token como usado:', markError);
      // Não falha nesse ponto, pois a senha já foi criada
    }

    // 5. Log
    await supabase.from('email_logs').insert({
      user_id: tokenData.user_id,
      email_type: 'password_created',
      sent_at: new Date().toISOString(),
      status: 'success'
    }).catch(err => console.error('Erro ao registrar log:', err));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha criada com sucesso',
        userId: tokenData.user_id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
