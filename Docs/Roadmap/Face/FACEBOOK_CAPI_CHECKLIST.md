# ✅ FACEBOOK CAPI - CHECKLIST DE VALIDAÇÃO

**Data:** 2025-01-03
**Status:** Pronto para Testes
**Pixel ID:** 369969430611939

---

## ✅ INFRAESTRUTURA (COMPLETO)

### Backend
- [x] Edge Function `facebook-capi` criada
- [x] Edge Function deployed e ATIVA (v1)
- [x] Token `FACEBOOK_ACCESS_TOKEN` configurado no Supabase
- [x] Registrada no `config.toml`
- [x] Hashing SHA256 implementado
- [x] Captura de IP/User-Agent implementada

### Frontend (Landing Page)
- [x] Script `fb-capi.js` criado
- [x] Pixel atualizado para ID: 369969430611939
- [x] ViewContent integrado (index.html)
- [x] Lead integrado (quiz.html)
- [x] CompleteRegistration integrado (quiz.html)
- [x] InitiateCheckout integrado (quiz.html)
- [x] Purchase integrado (thanks.html)
- [x] Deduplicação configurada (mesmo event_id)

### Repositórios
- [x] LP_loteri.AI commitado e pushed
- [x] App commitado e pushed
- [x] Documentação criada

---

## 🧪 TESTES NECESSÁRIOS

### 1. Teste da Edge Function (via curl)

```bash
curl -X POST \
  https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/facebook-capi \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "ViewContent",
    "user_data": {
      "em": "test@example.com",
      "external_id": "test123"
    },
    "custom_data": {
      "content_name": "Teste CAPI",
      "value": 37.00,
      "currency": "BRL"
    }
  }'
```

**Resposta esperada:**
```json
{
  "events_received": 1,
  "messages": ["Events received"],
  "fbtrace_id": "..."
}
```

### 2. Teste com Facebook Test Events

**Passo a passo:**

1. Acessar: https://business.facebook.com/events_manager2/list
2. Selecionar Pixel: **369969430611939**
3. Ir em **Test Events** → **Test server events**
4. Copiar o **Test Event Code** (ex: `TEST12345`)

5. Adicionar temporariamente no `fb-capi.js` (linha 35):
```javascript
const payload = {
  event_name: eventName,
  user_data: {...},
  custom_data: customData,
  event_source_url: window.location.href,
  event_id: eventId,
  test_event_code: 'TEST12345', // 🆕 ADICIONAR AQUI
};
```

6. Acessar a Landing Page em ambiente de teste ou produção

7. Verificar no Facebook Test Events Tool:
   - [ ] Evento apareceu
   - [ ] Event Match Quality >= 7 (Good)
   - [ ] Parâmetros corretos (user_data, custom_data)
   - [ ] Sem erros

8. **IMPORTANTE:** Remover `test_event_code` após testes!

### 3. Teste de Deduplicação

**Objetivo:** Verificar se Facebook não conta em duplicado (Pixel + CAPI)

1. Disparar evento com `event_id` único
2. Verificar no Events Manager → Event Activity
3. Filtrar por último evento
4. Verificar coluna "Deduplicated Events"
5. Deve mostrar: **1 evento total** (não 2)

**Checklist:**
- [ ] Pixel browser-side dispara com `eventID` parameter
- [ ] CAPI server-side usa mesmo `event_id`
- [ ] Facebook mostra apenas 1 evento (deduplicado)

### 4. Teste da Jornada Completa (End-to-End)

Simular jornada de usuário:

1. **index.html** (LP Principal)
   - [ ] Página carrega
   - [ ] Console mostra: `[FB-CAPI] Enviando evento: ViewContent`
   - [ ] Sem erros no console

2. **quiz.html** (Quiz)
   - [ ] Inicia quiz (step: preloading)
   - [ ] Console mostra: `[FB-CAPI] Enviando evento: Lead`
   - [ ] Completa quiz (step: summary)
   - [ ] Console mostra: `[FB-CAPI] Enviando evento: CompleteRegistration`
   - [ ] Clica em CTA (step: offer)
   - [ ] Console mostra: `[FB-CAPI] Enviando evento: InitiateCheckout`

3. **thanks.html** (Obrigado)
   - [ ] Página carrega
   - [ ] Console mostra: `[FB-CAPI] Enviando evento: Purchase`

4. **Facebook Events Manager**
   - [ ] Todos 5 eventos apareceram
   - [ ] Event Match Quality médio >= 7
   - [ ] Parâmetros corretos em cada evento

### 5. Teste de Produção (Primeira Semana)

**Monitoramento:**

```bash
# Ver logs em tempo real
supabase functions logs facebook-capi --tail
```

**Métricas a observar:**
- [ ] Taxa de sucesso >= 95%
- [ ] Event Match Quality médio >= 7
- [ ] Sem erros críticos nos logs
- [ ] Deduplicação funcionando (ratio ~1:1)

---

## 📊 EVENTOS ESPERADOS

| Evento | Pixel (Browser) | CAPI (Server) | Total Esperado |
|--------|-----------------|---------------|----------------|
| ViewContent | ✅ | ✅ | 1 (deduplicado) |
| Lead | ✅ | ✅ | 1 (deduplicado) |
| CompleteRegistration | ✅ | ✅ | 1 (deduplicado) |
| InitiateCheckout | ✅ | ✅ | 1 (deduplicado) |
| Purchase | ✅ | ✅ | 1 (deduplicado) |

**Total por usuário:** 5 eventos únicos

---

## 🐛 TROUBLESHOOTING

### Erro: CORS blocked

**Solução:** Já configurado no Edge Function (linhas 4-7)
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...',
};
```

### Erro: "Access token is invalid"

**Verificar:**
```bash
supabase secrets list
# FACEBOOK_ACCESS_TOKEN deve aparecer
```

Se não aparecer, adicionar novamente no Dashboard.

### Event Match Quality baixo (<7)

**Melhorias:**
1. Capturar email quando possível
2. Verificar cookies `_fbc` e `_fbp`
3. Confirmar que IP está sendo capturado

**Debug:**
```javascript
// Adicionar no fb-capi.js
console.log('Facebook Cookies:', getFacebookCookies());
console.log('Payload enviado:', payload);
```

### Eventos duplicados

**Verificar:**
1. Mesmo `event_id` usado em Pixel e CAPI? (linha 72 do fb-capi.js)
2. Facebook configurado para deduplicação?

---

## 📈 CRITÉRIOS DE SUCESSO

### ✅ Aceitação Mínima
- [x] Edge Function deployed e ativa
- [x] Token configurado
- [ ] Teste manual via curl com sucesso
- [ ] Ao menos 1 evento aparece no Test Events Tool
- [ ] Event Match Quality >= 5

### 🎯 Aceitação Ideal
- [x] Todas as integrações deployadas
- [ ] Todos 5 eventos testados e funcionando
- [ ] Event Match Quality médio >= 7
- [ ] Deduplicação validada (ratio 1:1)
- [ ] Sem erros em 24h de produção

### 🚀 Excelência
- [ ] Event Match Quality médio >= 9
- [ ] 100% de eventos com sucesso
- [ ] Atribuição de conversões melhorada vs pixel-only
- [ ] Documentação completa e atualizada

---

## 📝 PRÓXIMOS PASSOS

### Agora (próximos 30 minutos)
1. [ ] Teste via curl
2. [ ] Configurar Test Event Code
3. [ ] Testar 1 evento na LP

### Hoje
4. [ ] Testar jornada completa (5 eventos)
5. [ ] Validar Event Match Quality
6. [ ] Confirmar deduplicação

### Esta Semana
7. [ ] Monitorar logs por 24-48h
8. [ ] Ajustar conforme necessário
9. [ ] Documentar resultados

---

## 📚 RECURSOS

### Documentação
- **Setup Completo:** `Roadmap/FACEBOOK_CAPI_LANDING_PAGE.md`
- **Este Checklist:** `Roadmap/FACEBOOK_CAPI_CHECKLIST.md`

### Links Úteis
- **Events Manager:** https://business.facebook.com/events_manager2/list
- **Test Events:** https://business.facebook.com/events_manager2/test_events
- **Supabase Dashboard:** https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk

### Comandos Úteis
```bash
# Ver secrets
supabase secrets list

# Ver logs
supabase functions logs facebook-capi --tail

# Listar funções
supabase functions list

# Re-deploy
supabase functions deploy facebook-capi
```

---

**Última atualização:** 2025-01-03
**Status:** ✅ Pronto para Testes
**Responsável:** Bruno + Claude Code
