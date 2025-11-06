# 🎯 FACEBOOK CONVERSIONS API - LANDING PAGE

**Data:** 2025-01-03
**Status:** ✅ Implementado - Aguardando Deploy
**Pixel ID:** 369969430611939
**Foco:** Landing Page (LP_loteri.AI)

---

## 📋 SUMÁRIO EXECUTIVO

### Objetivo
Rastrear a jornada completa do usuário **na Landing Page** com Facebook Conversions API (server-side) + Pixel (browser-side) para:
- ✅ Contornar bloqueadores de anúncios
- ✅ Melhorar qualidade dos dados (iOS 14+ compatibility)
- ✅ Deduplicação automática pelo Facebook

### Jornada Rastreada

```
index.html (LP Principal)
    ↓ ViewContent
quiz.html (Quiz Interativo)
    ↓ Lead (início do quiz)
    ↓ CompleteRegistration (fim do quiz)
    ↓ InitiateCheckout (clique no CTA)
Kirvano Checkout
    ↓
thanks.html (Obrigado)
    ↓ Purchase
```

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. Edge Function (Supabase)
**Arquivo:** `App/app/supabase/functions/facebook-capi/index.ts`

- ✅ Proxy server-side para proteger token do Facebook
- ✅ Hashing automático de dados sensíveis (SHA256)
- ✅ Captura de IP e User-Agent
- ✅ Deduplicação via `event_id`

### 2. Script Helper para LP
**Arquivo:** `LP_loteri.AI/public/fb-capi.js`

Funções exportadas globalmente:
- `fbCAPI_trackViewContent()` - Visualização de conteúdo
- `fbCAPI_trackLead()` - Lead capturado
- `fbCAPI_trackCompleteRegistration()` - Registro completo
- `fbCAPI_trackInitiateCheckout()` - Início de checkout
- `fbCAPI_trackPurchase()` - Compra confirmada

**Recursos:**
- ✅ Captura automática de cookies do Facebook (_fbc, _fbp)
- ✅ Captura de parâmetros UTM
- ✅ Geração de `event_id` para deduplicação
- ✅ Disparo duplo: CAPI (server) + Pixel (browser) com mesmo event_id

### 3. Integrações na LP

#### index.html
```html
<script src="fb-capi.js"></script>

<script>
  fbCAPI_trackViewContent({
    contentName: 'LP Principal - Loter.IA',
    value: 37.00,
    currency: 'BRL'
  });
</script>
```

#### quiz.html (quiz.head.js)
```javascript
case 'preloading':
  fbCAPI_trackLead({
    contentName: 'Quiz Loter.IA - Iniciado'
  });
  break;

case 'summary':
  fbCAPI_trackCompleteRegistration({
    contentName: 'Quiz Loter.IA - Completo'
  });
  break;

case 'offer':
  fbCAPI_trackInitiateCheckout({
    contentName: 'Plano Básico - Loter.IA',
    value: 37.00,
    currency: 'BRL',
    numItems: 1
  });
  break;
```

#### thanks.html
```javascript
fbCAPI_trackPurchase({
  email: userEmail, // se disponível
  contentName: 'Plano Básico - Loter.IA',
  value: 37.00,
  currency: 'BRL',
  numItems: 1
});
```

---

## 🚀 PRÓXIMOS PASSOS (TO-DO)

### 1. Configurar Token no Supabase (5 min)

```bash
# Via Supabase Dashboard:
# Project: aaqthgqsuhyagsrlnyqk
# Settings → Edge Functions → Secrets

Name: FACEBOOK_ACCESS_TOKEN
Value: EAAUGxPD9l0ABP666Bhj4u860kpIoEhyBZA2ZBbXOHwhREhjKKRt23toNdR45UwFvnmqBZAsk41ZBW5OniP8ZB7XbPZBKXiPifAfgiOyI0fcqZBwWOQOjCeE1TQRz7f43AjZBZBeL0NnYT1hJIBunvIEsvPRuINmlfzyjsrnphoWZBdlorPtzNslQDiWqyHCZB6ljwZDZD
```

### 2. Deploy da Edge Function (2 min)

```bash
cd App/app
supabase login
supabase link --project-ref aaqthgqsuhyagsrlnyqk
supabase functions deploy facebook-capi
```

Verificar:
```bash
supabase functions list
# Deve aparecer: facebook-capi | ACTIVE
```

### 3. Testar com Facebook Test Events (10 min)

#### 3.1. Obter Test Event Code
1. Acessar: https://business.facebook.com/events_manager2/list
2. Selecionar Pixel: **369969430611939**
3. Clicar em **Test Events** → **Test server events**
4. Copiar o código (ex: `TEST12345`)

#### 3.2. Testar Manualmente

Editar temporariamente `fb-capi.js` linha 31:

```javascript
const payload = {
  event_name: eventName,
  user_data: {...},
  custom_data: customData,
  event_source_url: window.location.href,
  event_id: eventId,
  test_event_code: 'TEST12345' // 🆕 ADICIONAR AQUI TEMPORARIAMENTE
};
```

#### 3.3. Acessar a LP

```
1. Abrir: https://fqdigital.com.br/quiz.html (ou ambiente de teste)
2. Abrir DevTools → Console
3. Verificar logs: "[FB-CAPI] Enviando evento..."
4. Ir no Facebook Test Events Tool
5. Verificar se evento apareceu
```

**Esperado:**
- ✅ Event Received
- ✅ Event Match Quality: **Good (7-10 pontos)**
- ✅ Parâmetros corretos (user_data, custom_data)

#### 3.4. Remover Test Event Code

Após testes, **REMOVER** `test_event_code` do `fb-capi.js`.

### 4. Validar Deduplicação (15 min)

**Objetivo:** Confirmar que Facebook não conta em duplicado (Pixel + CAPI).

#### Como testar:

1. **Adicionar event_id no pixel browser-side**

Já está implementado no `fb-capi.js` (linhas 70-73):

```javascript
// Pixel dispara com MESMO event_id
if (typeof fbq === 'function') {
  fbq('track', eventName, customData, { eventID: eventId });
}
```

2. **Verificar no Events Manager**

- Acessar Events Manager → Event Activity
- Filtrar por último evento enviado
- Verificar coluna "Deduplicated Events"
- Deve mostrar: **1 evento** (não 2)

### 5. Monitorar em Produção (primeira semana)

```bash
# Ver logs da Edge Function em tempo real
supabase functions logs facebook-capi --tail

# Verificar se há erros
```

**Métricas a observar:**
- Taxa de sucesso (>95%)
- Event Match Quality (média >7)
- Deduplicação funcionando (ratio ~1:1)

---

## 📊 EVENTOS CONFIGURADOS

| Evento | Página | Quando Dispara | Dados Enviados |
|--------|---------|----------------|----------------|
| **ViewContent** | index.html | Carregamento da LP | `contentName`, `value`, UTM |
| **Lead** | quiz.html | Usuário inicia quiz (step: preloading) | `contentName`, UTM |
| **CompleteRegistration** | quiz.html | Usuário completa quiz (step: summary) | `contentName`, UTM |
| **InitiateCheckout** | quiz.html | Clique em CTA compra (step: offer) | `value`, `currency`, `numItems`, UTM |
| **Purchase** | thanks.html | Carregamento da página | `email` (se disponível), `value`, `currency` |

---

## 🔐 SEGURANÇA & BOAS PRÁTICAS

### ✅ Token Protegido
- Token do Facebook **NUNCA** exposto no frontend
- Apenas Edge Function tem acesso
- Secret gerenciado pelo Supabase

### ✅ Hashing Automático
Edge Function faz SHA256 de:
- `em` (email)
- `ph` (phone)
- `fn`, `ln` (nome)
- `ct`, `st`, `zp` (localização)

### ✅ Deduplicação
- Mesmo `event_id` usado em Pixel + CAPI
- Facebook automaticamente remove duplicatas
- Resultado: tracking mais preciso

### ❌ Dados NÃO Hasheados (conforme spec do Facebook)
- `client_ip_address`
- `client_user_agent`
- `fbc`, `fbp` (cookies do Facebook)
- `external_id` (user ID interno)

---

## 🐛 TROUBLESHOOTING

### Erro: "Failed to fetch"

**Causa:** Edge Function não deployada ou token incorreto.

**Solução:**
```bash
# 1. Verificar se função está ativa
supabase functions list

# 2. Verificar logs
supabase functions logs facebook-capi --tail

# 3. Re-deploy se necessário
supabase functions deploy facebook-capi
```

### Event Match Quality Baixo (<7)

**Causa:** Faltam dados do usuário.

**Solução:**
- Adicionar `email` quando disponível
- Verificar se cookies `_fbc` e `_fbp` estão sendo capturados
- Verificar se `client_ip_address` está sendo enviado

**Debug:**
```javascript
// Adicionar no fb-capi.js (temporariamente)
console.log('Cookies FB:', getFacebookCookies());
console.log('Payload:', payload);
```

### Eventos Duplicados

**Causa:** `event_id` diferente entre Pixel e CAPI.

**Solução:** Verificar linha 72 do `fb-capi.js`:

```javascript
fbq('track', eventName, customData, { eventID: eventId });
//                                    ^^^ CRUCIAL ^^^
```

### Purchase não dispara

**Causa:** `thanks.html` carrega antes do `fb-capi.js`.

**Solução:** Verificar ordem dos scripts:
```html
<head>
  <script src="fb-capi.js"></script> <!-- ANTES -->
</head>
<body>
  <script>
    fbCAPI_trackPurchase(...); <!-- DEPOIS -->
  </script>
</body>
```

---

## 📈 MÉTRICAS DE SUCESSO

### Curto Prazo (primeira semana)
- [ ] Edge Function deployed sem erros
- [ ] 100% dos eventos enviando com sucesso
- [ ] Event Match Quality médio >= 7
- [ ] Deduplicação funcionando (ratio ~1:1)

### Médio Prazo (primeiro mês)
- [ ] Redução de perda de dados vs pixel-only
- [ ] Melhora na atribuição de conversões
- [ ] Custo por conversão estabilizado ou reduzido

---

## 📚 ARQUIVOS CRIADOS/MODIFICADOS

### Novos Arquivos
- ✅ `App/app/supabase/functions/facebook-capi/index.ts` - Edge Function
- ✅ `LP_loteri.AI/public/fb-capi.js` - Helper JavaScript
- ✅ `Roadmap/FACEBOOK_CAPI_LANDING_PAGE.md` - Esta documentação

### Arquivos Modificados
- ✅ `LP_loteri.AI/public/index.html` - Adicionado script + evento ViewContent
- ✅ `LP_loteri.AI/public/quiz.html` - Adicionado script
- ✅ `LP_loteri.AI/public/quiz.head.js` - Eventos Lead, CompleteRegistration, InitiateCheckout
- ✅ `LP_loteri.AI/public/thanks.html` - Adicionado script + evento Purchase
- ✅ `App/app/supabase/config.toml` - Registrada função facebook-capi

### Pixel ID Atualizado
- ✅ Todos arquivos HTML atualizados para: **369969430611939**

---

## ✅ CHECKLIST FINAL

### Antes de ir para produção:
- [ ] Token configurado no Supabase Secrets
- [ ] Edge Function deployed e ativa
- [ ] Testado com Test Events Tool (Event Match Quality >= 7)
- [ ] Deduplicação validada (eventos não duplicam)
- [ ] `test_event_code` removido de produção
- [ ] Logs monitorados por 24h sem erros críticos

---

**Última atualização:** 2025-01-03
**Status:** ✅ Código Implementado - ⏳ Aguardando Deploy e Testes
**Responsável:** Bruno + Claude Code

