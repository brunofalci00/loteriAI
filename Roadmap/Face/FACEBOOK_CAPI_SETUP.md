# 🎯 FACEBOOK CONVERSIONS API (CAPI) - GUIA DE CONFIGURAÇÃO

**Data:** 2025-01-03
**Status:** Implementado - Requer Configuração
**Pixel ID:** 369969430611939

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Configuração do Token no Supabase](#configuração-do-token-no-supabase)
3. [Deploy da Edge Function](#deploy-da-edge-function)
4. [Integração no Frontend](#integração-no-frontend)
5. [Testando a Integração](#testando-a-integração)
6. [Eventos Configurados](#eventos-configurados)
7. [Troubleshooting](#troubleshooting)

---

## 1. VISÃO GERAL

### 🎯 O que é Facebook CAPI?

A **Conversions API (CAPI)** do Facebook é uma forma de enviar eventos de conversão diretamente do servidor para o Facebook, sem depender exclusivamente do pixel no navegador.

### ✅ Benefícios

- **Maior Confiabilidade**: Funciona mesmo com bloqueadores de anúncios
- **iOS 14+**: Contorna limitações do ATT (App Tracking Transparency)
- **Precisão**: Elimina perda de dados por cookies bloqueados
- **Deduplicação**: Quando usado com pixel, Facebook remove duplicatas automaticamente

### 🔧 Arquitetura

```
Frontend (Browser)
    ↓
    └─→ Supabase Edge Function (/facebook-capi)
            ↓
            └─→ Facebook Graph API
```

**Por que Edge Function?**
- ✅ Token do Facebook fica protegido no servidor
- ✅ Hashing de dados sensíveis (email, phone) no servidor
- ✅ Validação de dados antes de enviar
- ✅ Logs centralizados

---

## 2. CONFIGURAÇÃO DO TOKEN NO SUPABASE

### Passo 1: Acessar Supabase Dashboard

1. Acesse: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione o projeto: `aaqthgqsuhyagsrlnyqk`
3. Vá em **Settings** → **Edge Functions** → **Secrets**

### Passo 2: Adicionar o Token

Clique em **Add Secret** e adicione:

```
Name: FACEBOOK_ACCESS_TOKEN
Value: EAAUGxPD9l0ABP666Bhj4u860kpIoEhyBZA2ZBbXOHwhREhjKKRt23toNdR45UwFvnmqBZAsk41ZBW5OniP8ZB7XbPZBKXiPifAfgiOyI0fcqZBwWOQOjCeE1TQRz7f43AjZBZBeL0NnYT1hJIBunvIEsvPRuINmlfzyjsrnphoWZBdlorPtzNslQDiWqyHCZB6ljwZDZD
```

⚠️ **IMPORTANTE**:
- Este token **NUNCA** deve ser commitado no repositório
- Guarde uma cópia em local seguro (1Password, Bitwarden, etc.)
- Token expira em: **Verificar no Facebook Business Manager**

### Passo 3: Verificar Configuração

Execute no terminal:

```bash
supabase secrets list
```

Deve aparecer:
```
FACEBOOK_ACCESS_TOKEN | ••••••••••••••••
```

---

## 3. DEPLOY DA EDGE FUNCTION

### Pré-requisitos

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link do projeto
cd App/app
supabase link --project-ref aaqthgqsuhyagsrlnyqk
```

### Deploy

```bash
# Deploy da função facebook-capi
supabase functions deploy facebook-capi

# Verificar status
supabase functions list
```

**Output esperado:**
```
┌─────────────────┬────────────┬─────────────┬────────────┐
│ Name            │ Status     │ Version     │ Updated    │
├─────────────────┼────────────┼─────────────┼────────────┤
│ facebook-capi   │ ACTIVE     │ v1          │ 2025-01-03 │
└─────────────────┴────────────┴─────────────┴────────────┘
```

### Testar Edge Function Manualmente

```bash
curl -X POST \
  https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/facebook-capi \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "ViewContent",
    "user_data": {
      "em": "test@example.com",
      "external_id": "user123"
    },
    "custom_data": {
      "content_name": "Test Content",
      "value": 100,
      "currency": "BRL"
    }
  }'
```

---

## 4. INTEGRAÇÃO NO FRONTEND

### Exemplo 1: Track ViewContent (Visualização de Loteria)

```typescript
import { trackViewContent } from '@/services/facebookCAPI';
import { useAuth } from '@/hooks/useAuth';

function LotteryPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      trackViewContent({
        user_data: {
          em: user.email,
          external_id: user.id,
        },
        content_name: 'Mega-Sena Concurso 2750',
        content_type: 'lottery_analysis',
        content_ids: ['mega-sena-2750'],
        value: 37.00,
        currency: 'BRL',
      });
    }
  }, [user]);

  return <div>...</div>;
}
```

### Exemplo 2: Track InitiateCheckout (Clique no CTA)

```typescript
import { trackInitiateCheckout } from '@/services/facebookCAPI';

function CheckoutButton() {
  const { user } = useAuth();

  const handleClick = async () => {
    // Track evento ANTES de redirecionar
    await trackInitiateCheckout({
      user_data: {
        em: user?.email,
        external_id: user?.id,
      },
      value: 37.00,
      currency: 'BRL',
      content_name: 'Plano Básico - 12 meses',
      num_items: 1,
    });

    // Redirecionar para checkout
    window.location.href = 'https://pay.kirvano.com/...';
  };

  return <button onClick={handleClick}>Assinar Agora</button>;
}
```

### Exemplo 3: Track Purchase (Webhook de Pagamento)

**Arquivo:** `App/app/supabase/functions/kirvano-webhook/index.ts`

```typescript
// Após confirmar pagamento, adicionar:

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ... código existente ...

// APÓS registrar pagamento no banco:
console.log(`[kirvano-webhook] 💾 Pagamento registrado com sucesso`);

// 🆕 ENVIAR EVENTO DE PURCHASE PARA FACEBOOK
try {
  const fbResponse = await fetch(
    'https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/facebook-capi',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'Purchase',
        user_data: {
          em: customerEmail,
          fn: customerName.split(' ')[0],
          ln: customerName.split(' ').slice(1).join(' '),
          external_id: userId,
        },
        custom_data: {
          currency: 'BRL',
          value: amount / 100, // Converter centavos para reais
          content_name: productName,
          num_items: 1,
        },
      }),
    }
  );

  if (fbResponse.ok) {
    console.log('[kirvano-webhook] ✅ Evento Purchase enviado para Facebook');
  }
} catch (error) {
  console.error('[kirvano-webhook] ⚠️ Erro ao enviar evento para Facebook:', error);
  // Não falhar o webhook por erro no Facebook
}
```

---

## 5. TESTANDO A INTEGRAÇÃO

### Test Events Tool

1. Acesse: [https://business.facebook.com/events_manager2/list](https://business.facebook.com/events_manager2/list)
2. Selecione o Pixel: **369969430611939**
3. Vá em **Test Events**
4. Clique em **Test server events**

Copie o **Test Event Code**: (ex: `TEST12345`)

### Enviar Evento de Teste

```typescript
import { sendFacebookEvent } from '@/services/facebookCAPI';

sendFacebookEvent({
  event_name: 'ViewContent',
  user_data: {
    em: 'test@example.com',
    external_id: 'user123',
  },
  custom_data: {
    content_name: 'Test Page',
    value: 100,
    currency: 'BRL',
  },
  test_event_code: 'TEST12345', // 🆕 Adicionar código de teste
});
```

### Verificar no Test Events Tool

Após enviar, você deve ver:
- ✅ **Event Received**: Confirmação de recebimento
- 📊 **Event Match Quality**: Score de qualidade dos dados
- 🔍 **Event Details**: Parâmetros recebidos

**Event Match Quality esperado:**
- 🟢 **Good (7-10)**: Todos dados enviados corretamente
- 🟡 **Fair (4-6)**: Faltam alguns dados
- 🔴 **Poor (0-3)**: Revisar implementação

---

## 6. EVENTOS CONFIGURADOS

### 📋 Tabela de Eventos

| Evento | Quando Disparar | Dados Obrigatórios | Dados Opcionais |
|--------|-----------------|--------------------|--------------------|
| **ViewContent** | Usuário visualiza análise de loteria | `em`, `external_id` | `content_name`, `value`, `content_ids` |
| **AddToCart** | Clica em "Salvar Jogo" | `em`, `external_id` | `content_name`, `value` |
| **InitiateCheckout** | Clica em CTA de compra | `em`, `external_id`, `value` | `content_name`, `num_items` |
| **Purchase** | Pagamento confirmado (webhook) | `em`, `external_id`, `value` | `fn`, `ln`, `content_name` |
| **Lead** | Usuário se cadastra | `em` | `fn`, `ln` |
| **CompleteRegistration** | Usuário cria senha | `em`, `external_id` | `fn`, `ln` |

### 🔐 Dados do Usuário (user_data)

| Campo | Tipo | Exemplo | Hash Obrigatório? |
|-------|------|---------|-------------------|
| `em` | Email | `user@example.com` | ✅ Sim |
| `ph` | Telefone | `11999999999` | ✅ Sim |
| `fn` | Primeiro nome | `João` | ✅ Sim |
| `ln` | Sobrenome | `Silva` | ✅ Sim |
| `ct` | Cidade | `São Paulo` | ✅ Sim |
| `st` | Estado | `SP` | ✅ Sim |
| `zp` | CEP | `01310100` | ✅ Sim |
| `country` | País | `br` | ✅ Sim |
| `external_id` | User ID | `uuid` | ❌ Não |
| `client_ip_address` | IP do cliente | `192.168.1.1` | ❌ Não |
| `client_user_agent` | User Agent | `Mozilla/5.0...` | ❌ Não |
| `fbc` | Cookie _fbc | `fb.1.xxx` | ❌ Não |
| `fbp` | Cookie _fbp | `fb.1.yyy` | ❌ Não |

⚠️ **Hashing Automático**: A Edge Function automaticamente aplica SHA256 nos campos obrigatórios.

---

## 7. TROUBLESHOOTING

### ❌ Erro: "Access token is invalid"

**Causa**: Token expirado ou incorreto.

**Solução**:
1. Verificar token no Facebook Business Manager
2. Gerar novo token se necessário
3. Atualizar secret no Supabase:
```bash
supabase secrets set FACEBOOK_ACCESS_TOKEN="novo_token"
```

### ❌ Erro: "User data parameters are not hashed"

**Causa**: Dados sensíveis não foram hasheados.

**Solução**: Verificar se Edge Function está hasheando corretamente:
```typescript
// Verificar função normalizeUserData() em:
// App/app/supabase/functions/facebook-capi/index.ts
```

### ❌ Eventos não aparecem no Events Manager

**Possíveis causas**:
1. **Delay de processamento**: Aguardar até 20 minutos
2. **Pixel ID incorreto**: Verificar se é `369969430611939`
3. **Token sem permissões**: Verificar permissões do token no Business Manager

**Como verificar**:
```bash
# Logs da Edge Function
supabase functions logs facebook-capi --tail
```

### ⚠️ Event Match Quality baixo

**Como melhorar**:
- ✅ Enviar `em` (email) sempre que possível
- ✅ Enviar `ph` (telefone) se disponível
- ✅ Enviar `fn` e `ln` (nome completo)
- ✅ Enviar `external_id` (user ID)
- ✅ Enviar `fbc` e `fbp` (cookies do Facebook)

### 🔍 Debug Mode

Para ver logs detalhados:

```typescript
// Adicionar no início do arquivo
const DEBUG = true;

if (DEBUG) {
  console.log('[FacebookCAPI] Event:', eventName);
  console.log('[FacebookCAPI] User Data:', userData);
  console.log('[FacebookCAPI] Custom Data:', customData);
}
```

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial

- [Facebook CAPI Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Event Parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)
- [User Data Parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)

### Tools

- [Event Setup Tool](https://business.facebook.com/events_manager2/list)
- [Test Events](https://business.facebook.com/events_manager2/test_events)
- [Payload Helper](https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper)

### Supabase

- [Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Secrets Management](https://supabase.com/docs/guides/functions/secrets)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend
- [x] Edge Function `facebook-capi` criada
- [x] Função de hashing SHA256 implementada
- [x] Normalização de dados implementada
- [x] Config.toml atualizado
- [ ] Token configurado no Supabase Secrets
- [ ] Edge Function deployed

### Frontend
- [x] Serviço `facebookCAPI.ts` criado
- [x] Funções helper exportadas (trackViewContent, trackPurchase, etc.)
- [ ] Integração em `Lottery.tsx` (ViewContent)
- [ ] Integração em botões de checkout (InitiateCheckout)
- [ ] Integração em webhook (Purchase)

### Testes
- [ ] Evento de teste enviado com test_event_code
- [ ] Verificado no Test Events Tool
- [ ] Event Match Quality verificado (>= 7)
- [ ] Produção testada com evento real

---

**Última atualização:** 2025-01-03
**Responsável:** Bruno + Claude Code
**Status:** ✅ Implementado - ⚠️ Aguardando Deploy e Testes
