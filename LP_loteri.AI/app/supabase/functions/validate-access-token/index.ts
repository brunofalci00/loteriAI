import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

Deno.serve(async (req) => {
  try {
    const { token } = await req.json();

    // Validar input
    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // 1. Buscar token no banco
    const { data: tokenData, error: queryError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (queryError || !tokenData) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Link inválido ou já utilizado'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar se expirou
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (expiresAt < now) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Link expirado. Solicite um novo acesso.'
        }),
        { status: 410, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verificar se já foi usado
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Este link já foi utilizado'
        }),
        { status: 410, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Buscar email do usuário
    const { data: userData } = await supabase.auth.admin.getUserById(
      tokenData.user_id
    );

    // Token válido!
    return new Response(
      JSON.stringify({
        valid: true,
        email: userData?.user?.email,
        userId: tokenData.user_id,
        expiresAt: tokenData.expires_at
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
