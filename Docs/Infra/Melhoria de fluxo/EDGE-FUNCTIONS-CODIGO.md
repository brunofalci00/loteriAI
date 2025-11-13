# 🔧 Edge Functions Necessárias - Código Completo

**Data:** 13/11/2025
**Autor:** Claude Code
**Versão:** 1.0

---

## 📋 Funções Necessárias

| Função | Descrição | Chamada por |
|--------|-----------|-------------|
| `validate-access-token` | Valida token de acesso | CreatePassword.tsx |
| `set-password-with-token` | Define senha com token | CreatePassword.tsx |
| `kirvano-webhook` (modificação) | Chama n8n após criar usuário | Kirvano |

---

## 🔐 Edge Function 1: validate-access-token

### Propósito
Validar se um token é válido, não expirou e retornar o email do usuário.

### Localização
```
LP_loteri.AI/app/supabase/functions/validate-access-token/index.ts
```

### Código Completo:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[validate-access-token] 🚀 Request received');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      throw new Error('Token é obrigatório');
    }

    console.log('[validate-access-token] 🔍 Validando token...');

    // Inicializar Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar token na tabela access_tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('access_tokens')
      .select('*, users:auth.users!user_id(email)')
      .eq('token', token)
      .is('used_at', null) // Ainda não foi usado
      .single();

    if (tokenError || !tokenData) {
      console.log('[validate-access-token] ❌ Token não encontrado');
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Token inválido ou já utilizado'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar se token expirou
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.log('[validate-access-token] ⏰ Token expirado');
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Token expirado. Solicite um novo link de acesso.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Token válido!
    console.log('[validate-access-token] ✅ Token válido');

    return new Response(
      JSON.stringify({
        valid: true,
        email: tokenData.users.email,
        userId: tokenData.user_id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[validate-access-token] 💥 Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return new Response(
      JSON.stringify({
        valid: false,
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

## 🔑 Edge Function 2: set-password-with-token

### Propósito
Definir senha do usuário usando token válido e marcar token como usado.

### Localização
```
LP_loteri.AI/app/supabase/functions/set-password-with-token/index.ts
```

### Código Completo:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[set-password-with-token] 🚀 Request received');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, password } = await req.json();

    // Validações
    if (!token || !password) {
      throw new Error('Token e senha são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    console.log('[set-password-with-token] 🔍 Validando token...');

    // Inicializar Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Buscar e validar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .single();

    if (tokenError || !tokenData) {
      console.log('[set-password-with-token] ❌ Token não encontrado ou já usado');
      throw new Error('Token inválido ou já utilizado');
    }

    // 2. Verificar expiração
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.log('[set-password-with-token] ⏰ Token expirado');
      throw new Error('Token expirado. Solicite um novo link de acesso.');
    }

    const userId = tokenData.user_id;
    console.log('[set-password-with-token] 👤 Usuário:', userId);

    // 3. Definir senha do usuário
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: password,
        email_confirm: true // Garante que email está confirmado
      }
    );

    if (updateError) {
      console.error('[set-password-with-token] ❌ Erro ao definir senha:', updateError);
      throw new Error(`Erro ao definir senha: ${updateError.message}`);
    }

    console.log('[set-password-with-token] ✅ Senha definida com sucesso');

    // 4. Marcar token como usado
    const { error: markUsedError } = await supabase
      .from('access_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (markUsedError) {
      console.error('[set-password-with-token] ⚠️ Erro ao marcar token como usado:', markUsedError);
      // Não falha a operação por causa disso
    }

    console.log('[set-password-with-token] 🎉 Processo concluído');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha criada com sucesso! Você já pode fazer login.',
        userId: userId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[set-password-with-token] 💥 Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

## 🔄 Modificação: kirvano-webhook

### Localização
```
LP_loteri.AI/app/supabase/functions/kirvano-webhook/index.ts
```

### Modificação Necessária:

**Substituir o bloco de envio de email (linhas 107-124) por:**

```typescript
// 8. Enviar email via n8n (ao invés de resetPasswordForEmail)
const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');

if (!N8N_WEBHOOK_URL) {
  console.error('[kirvano-webhook] ⚠️ N8N_WEBHOOK_URL não configurada');
} else {
  try {
    console.log('[kirvano-webhook] 📤 Chamando n8n para enviar email...');

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        name: customerName,
        userId: userId,
        transactionId: transactionId,
      }),
    });

    if (n8nResponse.ok) {
      const n8nData = await n8nResponse.json();
      console.log('[kirvano-webhook] ✉️ Email enviado via n8n com sucesso');
      console.log('[kirvano-webhook] 🔗 Token gerado:', n8nData.token);
    } else {
      const errorText = await n8nResponse.text();
      console.error('[kirvano-webhook] ⚠️ Erro ao enviar email via n8n:', errorText);
    }
  } catch (error) {
    console.error('[kirvano-webhook] ⚠️ Erro ao chamar n8n:', error);
    // Não falha o webhook por causa de email
    // O importante é que usuário foi criado e pagamento registrado
  }
}

// 9. Registrar/atualizar pagamento (continua igual)
```

**Código completo modificado:**

```typescript
// ... (início do arquivo igual até linha 105)

    console.log(`[kirvano-webhook] ✨ Novo usuário criado: ${userId}`);
  }

  // 8. Enviar email via n8n
  const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');

  if (!N8N_WEBHOOK_URL) {
    console.error('[kirvano-webhook] ⚠️ N8N_WEBHOOK_URL não configurada');
  } else {
    try {
      console.log('[kirvano-webhook] 📤 Chamando n8n para enviar email...');

      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          name: customerName,
          userId: userId,
          transactionId: transactionId,
        }),
      });

      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.json();
        console.log('[kirvano-webhook] ✉️ Email enviado via n8n com sucesso');
        console.log('[kirvano-webhook] 🔗 Token gerado:', n8nData.token);
      } else {
        const errorText = await n8nResponse.text();
        console.error('[kirvano-webhook] ⚠️ Erro ao enviar email via n8n:', errorText);
      }
    } catch (error) {
      console.error('[kirvano-webhook] ⚠️ Erro ao chamar n8n:', error);
    }
  }

  // 9. Registrar/atualizar pagamento (resto do código continua igual)
  const { error: paymentError } = await supabase
    .from('payments')
    .upsert(
      {
        user_id: userId,
        hubla_transaction_id: transactionId,
        hubla_invoice_id: transactionId,
        amount: Math.round(amount * 100),
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

// ... (resto do arquivo igual - catch e fim)
```

---

## 📝 Registrar no config.toml

### Localização
```
LP_loteri.AI/app/supabase/config.toml
```

### Adicionar:

```toml
[functions.validate-access-token]
verify_jwt = false

[functions.set-password-with-token]
verify_jwt = false

# kirvano-webhook já existe, não precisa adicionar novamente
```

---

## 🚀 Deploy das Edge Functions

### Passo 1: Link do projeto

```bash
cd LP_loteri.AI/app
supabase link --project-ref aaqthgqsuhyagsrlnyqk
```

### Passo 2: Deploy das novas functions

```bash
# Deploy validate-access-token
supabase functions deploy validate-access-token

# Deploy set-password-with-token
supabase functions deploy set-password-with-token

# Re-deploy kirvano-webhook (com modificações)
supabase functions deploy kirvano-webhook
```

### Passo 3: Configurar variável de ambiente N8N_WEBHOOK_URL

```bash
# Substitua pela URL real do seu n8n
supabase secrets set N8N_WEBHOOK_URL=https://your-n8n.app/webhook/loter-ai-welcome
```

### Passo 4: Verificar deploy

```bash
# Listar todas as functions
supabase functions list

# Deve mostrar:
# - kirvano-webhook
# - validate-access-token
# - set-password-with-token
# - (outras existentes)
```

---

## 🧪 Testar as Edge Functions

### Testar validate-access-token:

```bash
curl -X POST \
  https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/validate-access-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "seu-token-de-teste-aqui"
  }'
```

**Resposta esperada (token válido):**
```json
{
  "valid": true,
  "email": "user@example.com",
  "userId": "uuid-xxx"
}
```

**Resposta esperada (token inválido/expirado):**
```json
{
  "valid": false,
  "error": "Token inválido ou já utilizado"
}
```

---

### Testar set-password-with-token:

```bash
curl -X POST \
  https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/set-password-with-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "seu-token-de-teste-aqui",
    "password": "senha123"
  }'
```

**Resposta esperada (sucesso):**
```json
{
  "success": true,
  "message": "Senha criada com sucesso! Você já pode fazer login.",
  "userId": "uuid-xxx"
}
```

**Resposta esperada (erro):**
```json
{
  "success": false,
  "error": "Token inválido ou já utilizado"
}
```

---

### Testar fluxo completo:

1. **Simular compra** (chamar kirvano-webhook manualmente)
2. **Verificar logs** do n8n (email foi enviado?)
3. **Abrir email** e copiar link com token
4. **Abrir link** no navegador
5. **Criar senha** no formulário
6. **Fazer login** com email + senha criada

---

## 📊 Monitoramento e Logs

### Ver logs das Edge Functions:

```bash
# Logs do validate-access-token
supabase functions logs validate-access-token --tail

# Logs do set-password-with-token
supabase functions logs set-password-with-token --tail

# Logs do kirvano-webhook
supabase functions logs kirvano-webhook --tail
```

### Logs esperados (sucesso):

**validate-access-token:**
```
[validate-access-token] 🚀 Request received
[validate-access-token] 🔍 Validando token...
[validate-access-token] ✅ Token válido
```

**set-password-with-token:**
```
[set-password-with-token] 🚀 Request received
[set-password-with-token] 🔍 Validando token...
[set-password-with-token] 👤 Usuário: uuid-xxx
[set-password-with-token] ✅ Senha definida com sucesso
[set-password-with-token] 🎉 Processo concluído
```

**kirvano-webhook:**
```
[kirvano-webhook] 🚀 === INÍCIO DA REQUISIÇÃO ===
[kirvano-webhook] 📦 Event: sale_approved
[kirvano-webhook] ✨ Novo usuário criado: uuid-xxx
[kirvano-webhook] 📤 Chamando n8n para enviar email...
[kirvano-webhook] ✉️ Email enviado via n8n com sucesso
[kirvano-webhook] 💾 Pagamento registrado com sucesso
[kirvano-webhook] ✅ Processamento concluído!
```

---

## 🔒 Segurança

### Práticas Recomendadas:

1. **Tokens únicos e criptograficamente seguros**
   - ✅ Usamos `crypto.randomBytes(32)` no n8n

2. **Expiração de tokens**
   - ✅ 24h para email inicial
   - ✅ 48h para reenvios

3. **Token de uso único**
   - ✅ Marcamos como `used_at` após usar

4. **Validação de senha**
   - ✅ Mínimo 6 caracteres
   - ⚠️ Recomendado: adicionar regex para força da senha

5. **Rate limiting**
   - ⚠️ n8n: adicionar delay entre requests
   - ⚠️ Supabase: configurar rate limit no dashboard

---

## ⚠️ Possíveis Erros e Soluções

### Erro: "N8N_WEBHOOK_URL não configurada"
**Solução:**
```bash
supabase secrets set N8N_WEBHOOK_URL=https://your-n8n.app/webhook/loter-ai-welcome
```

### Erro: "Token inválido ou já utilizado"
**Causas:**
- Token foi usado anteriormente
- Token expirou
- Token não existe no banco

**Solução:**
- Gerar novo token (reenviar email)
- Verificar tabela `access_tokens`

### Erro: "Erro ao definir senha"
**Causas:**
- Senha muito curta (< 6 caracteres)
- Usuário não existe
- Problemas com Supabase Auth

**Solução:**
- Verificar logs do Supabase
- Testar com senha mais forte

---

## 📋 Checklist Final

Antes de considerar completo:

- [ ] `validate-access-token` deployada
- [ ] `set-password-with-token` deployada
- [ ] `kirvano-webhook` modificada e re-deployada
- [ ] `N8N_WEBHOOK_URL` configurada nos secrets
- [ ] Tabela `access_tokens` criada
- [ ] Workflow n8n ativado
- [ ] Testado fluxo completo end-to-end
- [ ] Logs verificados (sem erros)
- [ ] Email recebido e link funcionando
- [ ] Senha criada com sucesso
- [ ] Login funcionando

---

**Última atualização:** 13/11/2025
**Versão:** 1.0

**FIM DO CÓDIGO DAS EDGE FUNCTIONS**
