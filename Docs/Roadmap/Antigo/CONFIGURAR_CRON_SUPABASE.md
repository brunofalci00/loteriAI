# 🕒 Como Configurar o Cron Job no Supabase Dashboard

**Edge Function:** `reset-monthly-credits`
**Objetivo:** Resetar créditos de todos os usuários para 50 no dia 1º de cada mês

---

## ✅ Status das Edge Functions

| Edge Function | Status | Versão | Para que serve |
|---------------|--------|--------|----------------|
| `share-reward` | ✅ ACTIVE | 1 | Concede créditos ao compartilhar/dar feedback |
| `reset-monthly-credits` | ✅ ACTIVE | 1 | Reseta créditos mensalmente (precisa configurar cron) |

---

## 📋 Passo a Passo - Configurar Cron Job

### **1. Acessar o Supabase Dashboard**

🔗 **Link direto:** https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk/functions/reset-monthly-credits

Ou navegue manualmente:
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o projeto: **aaqthgqsuhyagsrlnyqk**
3. Clique em **Edge Functions** (no menu lateral)
4. Clique na função **reset-monthly-credits**

---

### **2. Configurar o Cron Job**

Na página da Edge Function `reset-monthly-credits`:

1. **Procure a seção "Cron Jobs" ou "Triggers"**
   - Se não existir, procure por "Add Trigger" ou "Schedule"

2. **Clique em "Create Cron Job" ou "Add Schedule"**

3. **Configure o schedule:**
   ```
   Schedule: 0 0 1 * *
   ```

4. **Detalhes da configuração:**
   - **Nome:** Reset Créditos Mensais
   - **Cron Expression:** `0 0 1 * *`
   - **Timezone:** UTC (padrão)
   - **Descrição:** Reseta créditos de todos os usuários para 50 no primeiro dia de cada mês

---

### **3. Entender a Cron Expression**

```
0 0 1 * *
│ │ │ │ │
│ │ │ │ └─── Dia da semana (0-7, onde 0 e 7 são domingo) - * = qualquer dia
│ │ │ └───── Mês (1-12) - * = todos os meses
│ │ └─────── Dia do mês (1-31) - 1 = dia 1º
│ └───────── Hora (0-23) - 0 = meia-noite
└─────────── Minuto (0-59) - 0 = minuto zero
```

**Tradução:** "Executar às 00:00 UTC do dia 1º de cada mês"

---

### **4. Se não tiver interface de Cron no Dashboard**

Caso o Supabase Dashboard não tenha interface visual para cron jobs, você tem 2 opções:

#### **Opção A: Usar Supabase Management API**

Execute este comando (substitua `YOUR_ACCESS_TOKEN`):

```bash
curl -X POST \
  'https://api.supabase.com/v1/projects/aaqthgqsuhyagsrlnyqk/functions/reset-monthly-credits/schedule' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "cron": "0 0 1 * *",
    "timezone": "UTC"
  }'
```

Para obter o `YOUR_ACCESS_TOKEN`:
1. Acesse https://supabase.com/dashboard/account/tokens
2. Crie um novo token de acesso
3. Use no comando acima

#### **Opção B: Usar External Cron Service**

Se o Supabase não suportar cron jobs nativamente, use um serviço externo:

**Serviços recomendados (gratuitos):**
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Uptime Robot](https://uptimerobot.com)

**Configuração:**
1. Cadastre-se no serviço
2. Crie novo cron job
3. **URL:** `https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/reset-monthly-credits`
4. **Method:** POST
5. **Headers:**
   ```
   Content-Type: application/json
   ```
6. **Body:** `{}`
7. **Schedule:** `0 0 1 * *` (todo dia 1º às 00:00 UTC)

---

## 🧪 Como Testar a Edge Function

### **Teste Manual via CLI:**

```bash
cd app
npx supabase functions invoke reset-monthly-credits --project-ref aaqthgqsuhyagsrlnyqk
```

**Resposta esperada:**
```json
{
  "success": true,
  "usersReset": 123,
  "message": "Reset mensal executado com sucesso"
}
```

### **Teste Manual via cURL:**

```bash
curl -X POST \
  'https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/reset-monthly-credits' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

**⚠️ ATENÇÃO:** Este comando resetará TODOS os créditos de TODOS os usuários para 50. Use apenas em ambiente de teste!

---

## 📊 Monitorar Execuções

### **Via Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk/logs/functions
2. Filtrar por: `reset-monthly-credits`
3. Verificar logs de execução

### **O que verificar nos logs:**

- ✅ **Sucesso:** Status 200, message: "Reset mensal executado"
- ✅ **Usuários resetados:** Número de usuários processados
- ❌ **Erro:** Status 500, checar message de erro

---

## 📝 Resumo das Edge Functions

### **1. reset-monthly-credits**

**Quando executar:**
- Automaticamente todo dia 1º do mês às 00:00 UTC (via cron)
- Manualmente quando precisar resetar os créditos

**O que faz:**
```sql
-- Chama a função SQL
SELECT reset_monthly_credits();

-- Que executa:
UPDATE user_credits
SET
  credits_remaining = 50,
  credits_total = 50,
  last_reset_at = NOW();

-- Retorna: Número de usuários resetados
```

**Configuração:**
- ✅ verify_jwt = false (não precisa autenticação)
- ✅ Cron: 0 0 1 * * (todo dia 1º às 00:00 UTC)

---

### **2. share-reward**

**Quando executar:**
- Automaticamente quando usuário compartilha no WhatsApp
- Automaticamente quando usuário envia feedback detalhado (>50 chars)

**O que faz:**
```typescript
// Recebe: { credits: 1 }
// Valida JWT do usuário
// Adiciona créditos ao saldo atual
UPDATE user_credits
SET credits_remaining = credits_remaining + 1
WHERE user_id = authenticated_user_id;
```

**Configuração:**
- ✅ verify_jwt = true (requer autenticação)
- ✅ Chamado via frontend (ShareButton, FeedbackModal)

---

## 🔍 Verificar se Cron está Funcionando

### **Checklist pós-configuração:**

- [ ] Edge Function `reset-monthly-credits` está ACTIVE
- [ ] Cron job está configurado: `0 0 1 * *`
- [ ] Teste manual funcionou (retornou número de usuários)
- [ ] Logs mostram "Reset mensal executado com sucesso"
- [ ] Aguardar próximo dia 1º do mês e verificar se executou automaticamente

### **No primeiro dia 1º após configuração:**

1. Acesse o banco de dados às 00:05 UTC (5min após reset)
2. Execute:
   ```sql
   SELECT user_id, credits_remaining, credits_total, last_reset_at
   FROM user_credits
   ORDER BY last_reset_at DESC
   LIMIT 10;
   ```
3. Verifique se `last_reset_at` foi atualizado para hoje
4. Verifique se `credits_remaining = 50`

---

## ❓ Troubleshooting

### **Problema: Cron não executou**

**Possíveis causas:**
1. Cron job não foi configurado corretamente
2. Edge Function está inativa
3. Erro na função SQL `reset_monthly_credits()`

**Solução:**
1. Verificar logs da Edge Function
2. Testar manualmente: `npx supabase functions invoke reset-monthly-credits`
3. Verificar se função SQL existe: `SELECT reset_monthly_credits();`

### **Problema: Erro 500 ao executar**

**Possíveis causas:**
1. Função SQL não existe no banco
2. Erro de permissão (RLS)

**Solução:**
1. Verificar se migration foi aplicada:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'reset_monthly_credits';
   ```
2. Reaplicar migration se necessário

---

## 🚀 Conclusão

**Status Atual:**
- ✅ Edge Function `reset-monthly-credits` deployada
- ✅ Edge Function `share-reward` deployada
- ⏳ Cron job precisa ser configurado manualmente (siga passos acima)

**Próximo passo:**
Configurar o cron job no Supabase Dashboard ou via serviço externo.

---

**Documento criado por:** Claude Code
**Data:** 2025-01-04
**Versão:** 1.0
