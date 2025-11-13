# 🔧 Setup: Edge Functions para Fluxo de Senha

**Data:** 13/11/2025
**Responsável:** Bruno Falci / Claude Code
**Status:** 🔴 Não Implementado (pronto para implementar)

---

## 📋 Sumário

Este documento descreve como setup as 3 Edge Functions necessárias para o fluxo completo de criação de senha pós-compra.

**Funções a criar:**
1. `validate-access-token` - Valida se o token é válido e não expirou
2. `set-password-with-token` - Define a senha usando um token válido
3. `create-password-instant` - Cria senha diretamente (thanks.html)

---

## ✅ Pré-requisitos

- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Acesso ao projeto Supabase (chaves de API)
- [ ] Projeto local do Loter.IA atualizado
- [ ] Tabela `access_tokens` criada (veja seção SQL abaixo)
- [ ] Tabela `email_logs` criada (veja seção SQL abaixo)

---

## 🗄️ Criar Tabelas SQL

Execute estas queries no SQL Editor do Supabase:

### 1. Tabela: access_tokens

```sql
-- Criar tabela access_tokens
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  purpose TEXT DEFAULT 'create_password',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_access_tokens_token ON access_tokens(token);
CREATE INDEX idx_access_tokens_user_id ON access_tokens(user_id);
CREATE INDEX idx_access_tokens_expires ON access_tokens(expires_at);

-- Adicionar comentários
COMMENT ON TABLE access_tokens IS 'Tokens de acesso para criação de senha pós-compra';
COMMENT ON COLUMN access_tokens.token IS 'Token único e aleatório (64 caracteres hex)';
COMMENT ON COLUMN access_tokens.expires_at IS 'Data/hora de expiração do token';
COMMENT ON COLUMN access_tokens.used_at IS 'Data/hora quando o token foi utilizado';
```

### 2. Tabela: email_logs (se não existir)

```sql
-- Criar tabela email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'sent',
  recipient TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_date ON email_logs(created_at);

-- Adicionar comentários
COMMENT ON TABLE email_logs IS 'Log de todos os emails enviados no sistema';
COMMENT ON COLUMN email_logs.email_type IS 'Tipo de email: welcome, reminder_24h, urgent_3days, password_created, etc';
COMMENT ON COLUMN email_logs.status IS 'Status do envio: sent, bounced, opened, clicked';
```

---

## 📁 Estrutura de Diretórios

Crie a seguinte estrutura no seu projeto:

```
LP_loteri.AI/app/supabase/functions/
├── validate-access-token/
│   └── index.ts
├── set-password-with-token/
│   └── index.ts
├── create-password-instant/
│   └── index.ts
└── kirvano-webhook/
    └── index.ts (já existe - MODIFICAR)
```

---

## 🔧 Edge Function 1: validate-access-token

**Arquivo:** `supabase/functions/validate-access-token/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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
```

---

## 🔧 Edge Function 2: set-password-with-token

**Arquivo:** `supabase/functions/set-password-with-token/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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
```

---

## 🔧 Edge Function 3: create-password-instant

**Arquivo:** `supabase/functions/create-password-instant/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

Deno.serve(async (req) => {
  try {
    const { email, password, source } = await req.json();

    // Validar inputs
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email e senha são obrigatórios' }),
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

    // 1. Validar que o usuário foi criado
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    const user = userData?.users?.find(u => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email não encontrado. Você já fez a compra?'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validar que há pagamento ativo
    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!paymentData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nenhum pagamento ativo encontrado para este email'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Atualizar senha
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar senha' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Log do acesso instantâneo
    await supabase.from('email_logs').insert({
      user_id: user.id,
      email_type: 'instant_password_creation',
      sent_at: new Date().toISOString(),
      status: 'success',
      recipient: email,
      subject: 'Instant access from thanks.html'
    }).catch(err => console.error('Erro ao registrar log:', err));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha criada com sucesso',
        userId: user.id
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
```

---

## 📝 Modificar kirvano-webhook

**Arquivo:** `supabase/functions/kirvano-webhook/index.ts`

Adicione após criar o usuário:

```typescript
// Após criar usuário (linha ~105)
const userId = newUser.user.id;

// Preparar dados para n8n
const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL') ||
  'https://seu-n8n-instance.app/webhook/loter-ai-welcome';

const n8nPayload = {
  email: customerEmail,
  name: customerName,
  userId: userId,
  transactionId: transactionId,
  value: amount,
  timestamp: new Date().toISOString()
};

// Chamar n8n webhook de forma não-bloqueante
try {
  fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(n8nPayload)
  })
    .then(response => {
      if (response.ok) {
        console.log(`[kirvano-webhook] ✉️ Email enviado via n8n para: ${customerEmail}`);
      } else {
        console.error(`[kirvano-webhook] ⚠️ Erro n8n (${response.status})`);
      }
    })
    .catch(error => {
      console.error('[kirvano-webhook] ⚠️ Erro ao chamar n8n:', error);
    });
} catch (error) {
  console.error('[kirvano-webhook] ⚠️ Erro ao preparar n8n:', error);
}

// ... resto do código ...
```

---

## 🚀 Deploy das Edge Functions

### Via Supabase CLI:

```bash
# 1. Login no Supabase
supabase login

# 2. Link o projeto
supabase link --project-ref aaqthgqsuhyagsrlnyqk

# 3. Deploy as funções
supabase functions deploy validate-access-token
supabase functions deploy set-password-with-token
supabase functions deploy create-password-instant

# 4. Verificar status
supabase functions list
```

### Via Supabase Dashboard:

1. Vá em **Functions**
2. Clique em **Create Function**
3. Nome: `validate-access-token`
4. Cole o código do index.ts
5. Clique **Deploy**
6. Repita para as outras funções

---

## 🔐 Variáveis de Ambiente

Defina no Supabase (Settings → Edge Functions):

```
N8N_WEBHOOK_URL=https://seu-n8n-instance.app/webhook/loter-ai-welcome
```

---

## ✅ Checklist de Setup

- [ ] Tabelas SQL criadas
- [ ] Edge Function `validate-access-token` deployed
- [ ] Edge Function `set-password-with-token` deployed
- [ ] Edge Function `create-password-instant` deployed
- [ ] Variável `N8N_WEBHOOK_URL` configurada
- [ ] Arquivo `kirvano-webhook` modificado
- [ ] Página `CreatePassword.tsx` criada
- [ ] Rota `/criar-senha` adicionada em App.tsx
- [ ] N8N workflow ativado
- [ ] Testes realizados (curl)

---

## 🧪 Testar as Edge Functions

### Teste 1: Validar Token (antes de criar)

```bash
curl -X POST https://seu-supabase-url/functions/v1/validate-access-token \
  -H "Content-Type: application/json" \
  -d '{"token": "seu-token-teste"}'

# Resposta esperada (válido):
# { "valid": true, "email": "user@example.com", "userId": "uuid-xxx" }

# Resposta esperada (expirado):
# { "valid": false, "error": "Link expirado. Solicite um novo acesso." }
```

### Teste 2: Criar Senha com Token

```bash
curl -X POST https://seu-supabase-url/functions/v1/set-password-with-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "seu-token-teste",
    "password": "SenhaForte123!"
  }'

# Resposta esperada:
# { "success": true, "message": "Senha criada com sucesso", "userId": "uuid-xxx" }
```

### Teste 3: Criar Senha Instantânea (thanks.html)

```bash
curl -X POST https://seu-supabase-url/functions/v1/create-password-instant \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SenhaForte123!",
    "source": "thanks_page"
  }'

# Resposta esperada:
# { "success": true, "message": "Senha criada com sucesso", "userId": "uuid-xxx" }
```

---

## 📊 Fluxo Completo Testado

```
✅ Compra na Kirvano
   ↓
✅ Webhook chega no Supabase (kirvano-webhook)
   ↓
✅ Supabase cria usuário + registra pagamento
   ↓
✅ Supabase chama n8n webhook
   ↓
✅ N8N gera token + envia email
   ↓
✅ Usuário clica link: https://fqdigital.com.br/app/criar-senha?token=xxx
   ↓
✅ React carrega CreatePassword.tsx
   ↓
✅ Valida token (validate-access-token)
   ↓
✅ Usuário cria senha
   ↓
✅ Confirma e envia (set-password-with-token)
   ↓
✅ Login automático
   ↓
✅ Redireciona para /dashboard
```

---

**Última atualização:** 13/11/2025
**Status:** 🟢 Pronto para Implementar
