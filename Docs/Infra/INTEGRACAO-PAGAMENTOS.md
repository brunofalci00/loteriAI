# 💰 Integração de Pagamentos - Supabase + Kirvano/Hubla

**Data:** 07/11/2025
**Autor:** Bruno Falci
**Versão:** 1.0

---

## 🎯 Visão Geral

Este documento descreve como funciona o fluxo completo de pagamentos no projeto Loter.IA, integrando:

1. **Gateways de Pagamento:** Kirvano e Hubla
2. **Backend:** Edge Functions (Webhooks) no Supabase
3. **Database:** Tabela `payments` no PostgreSQL
4. **Frontend:** Página de obrigado (thanks.html) com acesso instantâneo
5. **Email:** Notificações e credenciais de acesso

---

## 🔄 Fluxo Completo de Pagamento

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO ACESSA LANDING PAGE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  www.fqdigital.com.br/                                      │
│  ├─ Preenche formulário com email                          │
│  ├─ Clica em "Comprar Agora"                               │
│  └─ Redireciona para Kirvano ou Hubla                      │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. GATEWAY DE PAGAMENTO (Kirvano/Hubla)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ├─ Usuário preenche dados bancários                       │
│  ├─ Processa pagamento                                      │
│  ├─ Aprova ou recusa                                        │
│  └─ SE APROVADO → Envia webhook para Supabase             │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ WEBHOOK
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SUPABASE EDGE FUNCTION (Webhook Handler)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /functions/kirvano-webhook          ou                    │
│  /functions/hubla-webhook                                   │
│                                                              │
│  Tarefas:                                                   │
│  ├─ Validar payload                                         │
│  ├─ Extrair email, nome, valor                            │
│  ├─ Verificar/criar usuário no Supabase Auth             │
│  ├─ Registrar pagamento na tabela 'payments'              │
│  └─ Enviar email com credenciais                          │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌──────────────────┐    ┌──────────────────┐
│ 4a. ENVIAR EMAIL │    │ 4b. REDIRECT     │
├──────────────────┤    ├──────────────────┤
│                  │    │                  │
│ Via Resend ou    │    │ www.fqdigital    │
│ Supabase Auth    │    │ .com.br/thanks   │
│                  │    │                  │
│ Contém:          │    │ Mostra página    │
│ - Email/senha    │    │ de obrigado com  │
│ - Link de login  │    │ acesso instantâneo│
│                  │    │                  │
└──────────────────┘    └──────────────────┘
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. USUÁRIO ACESSA A CONTA                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Opção A: Via Email                                        │
│  ├─ Clica em link do email                                │
│  ├─ Usa senha/cria senha                                   │
│  └─ Entra em www.fqdigital.com.br/app                    │
│                                                              │
│  Opção B: Via thanks.html                                  │
│  ├─ Acesso Instantâneo form                               │
│  ├─ Digita email + cria senha                             │
│  └─ Redireciona para /app/auth                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Componentes da Integração

### 1. Gateways de Pagamento

#### 1.1 Kirvano
- **URL:** https://kirvano.com.br (ou similar)
- **Webhook Event:** `sale_approved`
- **Authentication:** Header `x-kirvano-token` (opcional)
- **Particularidades:** Sem validação obrigatória de token

**Estrutura do Payload Kirvano:**
```json
{
  "event": "sale_approved",
  "id": "transaction_123",
  "customer": {
    "email": "user@example.com",
    "name": "João Silva",
    "id": "cust_456"
  },
  "product": {
    "name": "Loter.IA - Acesso Vitalício",
    "price": 37.00
  },
  "transaction": {
    "id": "trans_789",
    "amount_paid": 37.00,
    "method": "credit_card"
  }
}
```

#### 1.2 Hubla
- **URL:** https://hubla.com.br (ou similar)
- **Webhook Event:** `invoice.payment_succeeded`
- **Authentication:** Header `x-hubla-token` (OBRIGATÓRIO)
- **Idempotência:** Header `x-hubla-idempotency`

**Estrutura do Payload Hubla:**
```json
{
  "type": "invoice.payment_succeeded",
  "event": {
    "email": "user@example.com",
    "customer": {
      "email": "user@example.com",
      "firstName": "João",
      "lastName": "Silva",
      "id": "cust_123"
    },
    "invoice": {
      "id": "inv_456",
      "amount": {
        "totalCents": 3700
      },
      "paymentMethod": "credit_card"
    },
    "products": [
      {
        "name": "Loter.IA - Acesso Vitalício"
      }
    ]
  }
}
```

### 2. Edge Functions (Webhooks)

#### 2.1 Kirvano Webhook (`/functions/kirvano-webhook`)

**Localização:** `LP_loteri.AI/app/supabase/functions/kirvano-webhook/index.ts`

**O que faz (8 passos):**

```
1️⃣  Validar payload
    └─ Verifica se event = 'sale_approved'

2️⃣  Extrair dados
    ├─ email
    ├─ name
    ├─ transaction_id
    ├─ amount
    └─ product_name

3️⃣  Inicializar Supabase Admin
    └─ Usa SUPABASE_SERVICE_ROLE_KEY

4️⃣  Verificar usuário existente
    └─ SELECT FROM auth.users WHERE email

5️⃣  Criar novo usuário (se não existe)
    ├─ Cria em Supabase Auth
    ├─ email_confirm = true
    └─ Armazena metadata

6️⃣  Enviar email de acesso
    └─ Via Supabase Auth resetPasswordForEmail

7️⃣  Registrar pagamento (UPSERT)
    ├─ INSERT ou UPDATE na tabela payments
    ├─ onConflict: hubla_transaction_id
    └─ Previne duplicação

8️⃣  Retornar resposta
    └─ { success, user_id, is_new_user, transaction_id }
```

**Fluxo Detalhado:**

```typescript
// 1. Recebe webhook
POST /functions/v1/kirvano-webhook
{
  "event": "sale_approved",
  "customer": { "email": "user@example.com", ... },
  ...
}

// 2. Valida
if (payload.event !== 'sale_approved') return 200; // ignora

// 3. Extrai dados
const customerEmail = payload.customer.email;
const transactionId = payload.transaction.id;
const amount = payload.transaction.amount_paid; // em reais

// 4. Procura usuário
const existingUser = auth.users.find(u => u.email === customerEmail);

// 5. Cria ou usa existente
if (existingUser) {
  userId = existingUser.id;
} else {
  userId = auth.createUser({
    email: customerEmail,
    email_confirm: true
  }).id;
}

// 6. Envia email
auth.resetPasswordForEmail(customerEmail, {
  redirectTo: 'https://www.fqdigital.com.br/app/auth?type=recovery'
});

// 7. Salva pagamento
payments.upsert({
  user_id: userId,
  hubla_transaction_id: transactionId,
  amount: amount * 100, // em centavos
  status: 'active',
  ...
});

// 8. Retorna
{ success: true, user_id, is_new_user, transaction_id }
```

**Variáveis de Ambiente Necessárias:**
- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de admin (secreto!)
- `SUPABASE_ANON_KEY` - Chave anônima
- `APP_URL` - URL da aplicação (default: https://www.fqdigital.com.br/app)

#### 2.2 Hubla Webhook (`/functions/hubla-webhook`)

**Localização:** `LP_loteri.AI/app/supabase/functions/hubla-webhook/index.ts`

**Diferenças Principais:**

1. **Validação de Token** (OBRIGATÓRIA)
   ```typescript
   const hublaToken = req.headers.get('x-hubla-token');
   const expectedToken = Deno.env.get('HUBLA_WEBHOOK_TOKEN');

   if (!hublaToken || hublaToken !== expectedToken) {
     return new Response({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **Senha Temporária**
   ```typescript
   // Gera: primeiros 3 chars do nome + últimos 6 do invoice ID
   const tempPassword = `${firstName.substring(0, 3)}${invoiceId.slice(-6)}`;

   // Armazena em user_metadata
   user_metadata: {
     temp_password: tempPassword
   }
   ```

3. **Email Customizado**
   - Usa **Resend API** (se configurada)
   - Fallback para Supabase Auth
   - Email HTML completo com credenciais

4. **Tratamento de Duplicação**
   - Header `x-hubla-idempotency` para idempotência
   - UPSERT em `hubla_transaction_id`

**Fluxo Diferente:**

```
Hubla Webhook
├─ Valida token x-hubla-token ✓
├─ Processa event type
├─ Cria usuário com senha temporária
├─ Envia email via Resend (ou Supabase fallback)
└─ Salva em payments
```

### 3. Tabela `payments` (PostgreSQL)

**Localização:** Supabase Database

**Schema:**
```sql
CREATE TABLE payments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Identificadores de transação
  hubla_transaction_id TEXT UNIQUE,
  hubla_invoice_id TEXT,

  -- Dados da compra
  amount BIGINT NOT NULL,          -- em centavos
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'active',    -- active, cancelled, refunded
  product_name TEXT,
  payment_method TEXT,

  -- Dados do cliente
  customer_name TEXT,
  customer_email TEXT,

  -- Rastreamento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Índices
  UNIQUE(hubla_transaction_id)
);

-- Índices para performance
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_email ON payments(customer_email);
CREATE INDEX idx_payments_status ON payments(status);
```

**Exemplos de Registros:**

```
Kirvano:
┌──────────────────────────────────────┐
│ user_id      │ xyz123               │
│ transaction  │ kirvano_5000         │
│ amount       │ 3700 (centavos)      │
│ status       │ active               │
│ email        │ user@example.com     │
│ created_at   │ 2025-11-07 14:30:00  │
└──────────────────────────────────────┘

Hubla:
┌──────────────────────────────────────┐
│ user_id      │ abc456               │
│ transaction  │ hubla_inv_7890       │
│ amount       │ 3700 (centavos)      │
│ status       │ active               │
│ email        │ user2@example.com    │
│ created_at   │ 2025-11-07 14:35:00  │
└──────────────────────────────────────┘
```

### 4. Página de Obrigado (thanks.html)

**Localização:** `LP_loteri.AI/public/thanks.html`

#### 4.1 Disparo de Pixel Facebook

**O pixel é disparado em 2 momentos:**

```javascript
// 1. IMEDIATAMENTE ao carregar a página
(function() {
  if (typeof fbCAPI_trackPurchase === 'function') {
    fbCAPI_trackPurchase({
      contentName: 'Plano Básico - Loter.IA',
      value: 37.00,
      currency: 'BRL',
      numItems: 1
    });
  }
})();

// 2. AO SUBMETER FORMULÁRIO (com email para deduplicação)
instantForm.addEventListener('submit', function(e) {
  if (typeof fbCAPI_trackPurchase === 'function') {
    fbCAPI_trackPurchase({
      email: emailInput.value,
      contentName: 'Plano Básico - Loter.IA',
      value: 37.00,
      currency: 'BRL',
      numItems: 1
    });
  }
});
```

**Dados Enviados:**
- `contentName` - Nome do produto
- `value` - Valor da compra
- `currency` - Moeda (BRL)
- `numItems` - Quantidade de itens
- `email` - Email do cliente (second pass com deduplicação)

#### 4.2 Formulário de Acesso Instantâneo

```html
<form id="instant-access-form">
  <input type="email" id="user-email" required />
  <input type="password" id="user-password" minlength="6" required />
  <button type="submit">CRIAR SENHA E ACESSAR</button>
</form>
```

**O que faz ao submeter:**

```typescript
const email = document.getElementById('user-email').value;
const password = document.getElementById('user-password').value;

// Chama Edge Function para criar senha
POST https://supabase.../functions/v1/create-password-direct
{
  "email": email,
  "password": password
}

// Se sucesso:
- Mostra mensagem ✅
- Aguarda 2 segundos
- Redireciona para /app/auth
```

#### 4.3 Fluxo de UX na thanks.html

```
Usuário chega em thanks.html (após pagamento)
│
├─ Header com logo
│
├─ Card de sucesso
│  ├─ Badge "Tudo certo!"
│  ├─ Título "Crie sua senha e acesse AGORA"
│  ├─ Descrição
│  └─ Aviso: "Não precisa aguardar email"
│
├─ Formulário de Acesso Instantâneo
│  ├─ Campo email (pré-preenchido se possível)
│  ├─ Campo senha (mínimo 6 caracteres)
│  └─ Botão de submissão
│
├─ Separador "ou aguarde o email"
│
├─ Info grid (2 colunas)
│  ├─ Não encontrou o email?
│  │  └─ Instruções para recuperar
│  └─ Próximos passos liberados
│     └─ Lista de benefícios
│
├─ Card de WhatsApp
│  ├─ Ícone 💬
│  ├─ Descrição
│  ├─ Botão "Falar com Suporte"
│  └─ Email de contato
│
└─ Footer
```

---

## 🔐 Segurança

### Validação de Webhooks

**Kirvano:**
- ❌ Sem validação obrigatória de assinatura
- ⚠️ Validação opcional: Header `x-kirvano-token`

**Hubla:**
- ✅ OBRIGATÓRIA: Header `x-hubla-token`
- ✅ Idempotência: Header `x-hubla-idempotency`

### Proteção de Dados

**O que nunca deve ser commitado:**
```
❌ SUPABASE_SERVICE_ROLE_KEY
❌ SUPABASE_ANON_KEY
❌ HUBLA_WEBHOOK_TOKEN
❌ RESEND_API_KEY
❌ .env files
```

**Armazenamento seguro:**
- ✅ Usar Supabase Secrets
- ✅ Variáveis de ambiente no Vercel
- ✅ GitHub Secrets

### Prevenção de Duplicação

**Estratégia UPSERT:**
```sql
INSERT INTO payments (user_id, hubla_transaction_id, ...)
VALUES (...)
ON CONFLICT (hubla_transaction_id)
DO UPDATE SET ...;
```

**Por quê:** Se Kirvano/Hubla enviar webhook 2x (falha de rede + retry), não cria pagamento duplicado.

---

## 📧 Envio de Emails

### 1. Via Supabase Auth (Padrão - Kirvano)

```typescript
const { error } = await supabaseClient.auth.resetPasswordForEmail(
  customerEmail,
  {
    redirectTo: `${appUrl}/auth?type=recovery`
  }
);
```

**Template:** Email padrão do Supabase
**Conteúdo:** Link de reset de senha
**Tempo:** ~5-10 minutos

### 2. Via Resend (Premium - Hubla)

```typescript
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`
  },
  body: JSON.stringify({
    from: 'loter.AI <onboarding@resend.dev>',
    to: customerEmail,
    subject: '🎉 Seu acesso ao loter.AI está liberado!',
    html: `...` // HTML customizado
  })
});
```

**Template:** HTML customizado com credenciais
**Conteúdo:** Email/senha temporária + link de login
**Tempo:** ~1-2 minutos

### 3. Email Customizado (Resend - Hubla)

Template contém:
- Cabeçalho com gradient
- Saudação personalizada
- Credenciais de acesso (novos usuários)
- Botão "Fazer Login"
- Detalhes da compra
- Aviso de segurança

---

## 🔍 Troubleshooting

### Problema 1: Webhook não dispara

**Causas:**
- Kirvano/Hubla configurados incorretamente
- URL do webhook errada
- Firewall bloqueando

**Verificar:**
```bash
# Logs no Supabase
Dashboard → Functions → kirvano-webhook → Logs

# Deve mostrar:
# 🚀 === INÍCIO DA REQUISIÇÃO ===
# 📦 Event: sale_approved
# ✅ Processamento concluído!
```

**Solução:**
1. Confirmar URL do webhook em Kirvano/Hubla settings
2. Testar manualmente: `curl -X POST https://.../kirvano-webhook -H "Content-Type: application/json" -d '{...}'`

### Problema 2: Usuário criado, mas email não chega

**Causas:**
- Supabase não configurado com email
- Resend API key inválida
- Email em spam

**Verificar:**
```bash
# No Supabase Dashboard
Auth → Users → [Procure o usuário]

# Deve mostrar email_confirmed = true
```

**Solução:**
1. Verificar spam/promoções
2. Verificar configuração de email no Supabase
3. Confirmar RESEND_API_KEY se usar Resend

### Problema 3: Acesso instantâneo não funciona (thanks.html)

**Causas:**
- Edge Function `create-password-direct` não existe
- Email digitado não matches com webhook
- Erro de CORS

**Verificar:**
1. Abrir DevTools (F12) → Console
2. Procurar erros de rede
3. Verificar se function existe: `Supabase Dashboard → Functions`

**Solução:**
1. Garantir que email matches exatamente (case-insensitive)
2. Verificar se function responde 200

### Problema 4: Duplicação de pagamentos

**Causa:** Webhook foi processado 2x

**Verificar:**
```sql
SELECT * FROM payments
WHERE customer_email = 'user@example.com'
ORDER BY created_at DESC LIMIT 5;
```

**Solução:** O UPSERT já trata isso automaticamente. Se houver duplicação, é bug no logic.

---

## 📊 Monitoramento

### KPIs Importantes

```sql
-- Total de pagamentos por mês
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_payments,
  SUM(amount)/100.0 as revenue_brl
FROM payments
WHERE status = 'active'
GROUP BY 1
ORDER BY 1 DESC;

-- Novos usuários por gateway
SELECT
  (CASE
    WHEN hubla_transaction_id LIKE 'hubla_%' THEN 'Hubla'
    ELSE 'Kirvano'
  END) as gateway,
  COUNT(DISTINCT user_id) as new_users,
  AVG(amount)/100.0 as avg_value_brl
FROM payments
GROUP BY 1;

-- Taxa de sucesso de webhooks
SELECT
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM payments
GROUP BY 1;
```

### Alertas Recomendados

```
⚠️ Se webhook falhar 5x em 1 hora
⚠️ Se usuário criado mas não consegue fazer login
⚠️ Se email não é enviado dentro de 5 minutos
⚠️ Se pagamento registrado mas webhook falhou
```

---

## 📝 Checklist de Configuração

### Kirvano Setup

```
□ Criar conta em Kirvano
□ Configurar webhook para: /functions/v1/kirvano-webhook
□ Testar com transação de teste
□ Confirmar email chega
□ Testar acesso instantâneo em thanks.html
```

### Hubla Setup

```
□ Criar conta em Hubla
□ Gerar token de webhook (x-hubla-token)
□ Armazenar em Supabase Secrets
□ Configurar webhook para: /functions/v1/hubla-webhook
□ Configurar RESEND_API_KEY (opcional)
□ Testar com transação de teste
□ Confirmar email HTML customizado chega
```

### Supabase Setup

```
□ Tabela 'payments' criada
□ Índices criados
□ SUPABASE_SERVICE_ROLE_KEY armazenada em Secrets
□ SUPABASE_ANON_KEY armazenada em Secrets
□ Email configurado para resetPasswordForEmail
```

### Vercel Setup

```
□ Variáveis de ambiente configuradas:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - SUPABASE_ANON_KEY
  - HUBLA_WEBHOOK_TOKEN
  - RESEND_API_KEY (opcional)
  - APP_URL
□ Edge Functions deployadas
```

---

## 🔗 Endpoints

### Webhooks (Recebem dados)

```
POST /functions/v1/kirvano-webhook
  Event: sale_approved
  Body: payload do Kirvano

POST /functions/v1/hubla-webhook
  Event: invoice.payment_succeeded
  Header: x-hubla-token
  Body: payload do Hubla
```

### APIs Externas (Chamam dados)

```
POST https://supabase.../functions/v1/create-password-direct
  Body: { email, password }
  Response: { success, message }

POST https://api.resend.com/emails
  Header: Authorization: Bearer {API_KEY}
  Body: { from, to, subject, html }
```

---

## 📚 Referências

- **Kirvano Docs:** https://docs.kirvano.com.br (ou similar)
- **Hubla Docs:** https://docs.hubla.com.br
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Resend Email API:** https://resend.com/docs

---

## 📅 Histórico de Mudanças

| Data       | Versão | Mudança                                |
|------------|--------|----------------------------------------|
| 07/11/2025 | 1.0    | Documentação inicial de pagamentos     |

---

**Última atualização:** 07/11/2025
**Mantido por:** Bruno Falci

---

## ⚡ Quick Reference

```
┌─────────────────────────────────────────┐
│ FLUXO RÁPIDO - PAGAMENTO               │
├─────────────────────────────────────────┤
│                                         │
│ 1️⃣  Usuário clica "Comprar"            │
│    → Redireciona para Kirvano/Hubla   │
│                                         │
│ 2️⃣  Pagamento aprovado                 │
│    → Kirvano/Hubla envia webhook      │
│                                         │
│ 3️⃣  Edge Function processa             │
│    → Cria usuário                      │
│    → Envia email                       │
│    → Salva pagamento                   │
│                                         │
│ 4️⃣  Usuário acessa thanks.html         │
│    → Opção A: Espera email             │
│    → Opção B: Acesso instantâneo       │
│                                         │
│ 5️⃣  Acessa /app com credenciais        │
│                                         │
└─────────────────────────────────────────┘

CHECKLIST DE ERRO:
□ Webhook foi enviado? (logs Supabase)
□ Usuário foi criado? (auth.users)
□ Pagamento foi registrado? (payments table)
□ Email foi enviado? (inbox/spam)
```

---

**FIM DA DOCUMENTAÇÃO**
