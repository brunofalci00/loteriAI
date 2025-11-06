# 🔄 Reset Automático de Créditos - Documentação

**Data:** 2025-01-04
**Status:** ✅ Implementado (aguardando deploy)

---

## 📋 Visão Geral

Sistema de reset automático de créditos que executa todo dia 1º de cada mês às 00:00 UTC.

**Funcionalidade:**
- Reseta `credits_remaining` de todos os usuários para 50
- Reseta `credits_total` para 50
- Atualiza `last_reset_at` para a data do reset

---

## 🏗️ Arquitetura

### **Componentes Criados:**

1. **Edge Function:** `reset-monthly-credits`
   - Localização: `supabase/functions/reset-monthly-credits/index.ts`
   - Usa SERVICE_ROLE_KEY para acesso total ao banco
   - Chama a função SQL `reset_monthly_credits()`

2. **SQL Function:** `reset_monthly_credits()`
   - Localização: `supabase/migrations/MIGRATIONS_SQL_COMPLETAS.sql` (linhas 151-172)
   - Atualiza todos os registros na tabela `user_credits`
   - Retorna número de usuários resetados

3. **Cron Job Configuration:**
   - Localização: `supabase/config.toml`
   - Schedule: `0 0 1 * *` (dia 1 de cada mês, 00:00 UTC)

---

## 📁 Arquivos Modificados/Criados

### **1. Edge Function: `reset-monthly-credits/index.ts`**

```typescript
// Executa no dia 1º de cada mês via Supabase Cron
// - Usa SERVICE_ROLE_KEY para acesso administrativo
// - Chama função SQL reset_monthly_credits()
// - Retorna número de usuários resetados
```

**Principais features:**
- ✅ Autenticação via SERVICE_ROLE_KEY
- ✅ Chamada à função SQL via RPC
- ✅ Logging detalhado
- ✅ Error handling completo
- ✅ Resposta JSON com estatísticas

### **2. Config: `supabase/config.toml`**

```toml
[functions.reset-monthly-credits]
verify_jwt = false

[functions.reset-monthly-credits.cron]
# Executa às 00:00 (UTC) do dia 1 de cada mês
# Reseta créditos de todos os usuários para 50
schedule = "0 0 1 * *"
```

**Cron Schedule Explicado:**
```
0 0 1 * *
│ │ │ │ │
│ │ │ │ └─ Dia da semana (qualquer)
│ │ │ └─── Mês (qualquer)
│ │ └───── Dia do mês (1)
│ └─────── Hora (00)
└───────── Minuto (00)
```

### **3. SQL Function: `reset_monthly_credits()`**

**Já existe** em `MIGRATIONS_SQL_COMPLETAS.sql` linhas 151-172:

```sql
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  v_reset_count INTEGER;
BEGIN
  UPDATE public.user_credits
  SET
    credits_remaining = 50,
    credits_total = 50,
    last_reset_at = NOW();

  GET DIAGNOSTICS v_reset_count = ROW_COUNT;

  RAISE NOTICE 'Reset mensal executado: % usuários atualizados', v_reset_count;

  RETURN v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚀 Deploy

### **Passo 1: Deploy da Edge Function**

```bash
cd C:\Users\bruno\Documents\Black\Loter.IA\Prod\App\app

# Deploy da nova Edge Function
npx supabase functions deploy reset-monthly-credits
```

### **Passo 2: Verificar Cron Job no Dashboard**

1. Acesse: [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em: **Edge Functions** → **Cron Jobs**
3. Verifique se `reset-monthly-credits` aparece com:
   - **Schedule:** `0 0 1 * *`
   - **Status:** Active
   - **Next Run:** 1º do próximo mês às 00:00 UTC

### **Passo 3: Confirmar SQL Function Existe**

```sql
-- No SQL Editor do Supabase Dashboard:
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'reset_monthly_credits';

-- Deve retornar 1 linha
```

---

## 🧪 Como Testar

### **Teste Manual (Agora)**

```bash
# Testar a Edge Function manualmente
curl -X POST https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/reset-monthly-credits \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Reset mensal concluído com sucesso",
  "users_reset": 5,
  "reset_date": "2025-01-04T12:34:56.789Z"
}
```

### **Teste Direto da SQL Function**

```sql
-- No SQL Editor do Supabase Dashboard:
SELECT reset_monthly_credits();

-- Deve retornar o número de usuários resetados
```

### **Verificar Créditos Foram Resetados**

```sql
SELECT
  user_id,
  credits_remaining,
  credits_total,
  last_reset_at
FROM user_credits
ORDER BY last_reset_at DESC;

-- Todos devem ter:
-- credits_remaining = 50
-- credits_total = 50
-- last_reset_at = agora
```

---

## 📊 Monitoramento

### **Ver Logs da Edge Function**

1. Acesse: **Edge Functions** → **reset-monthly-credits** → **Logs**
2. Procure por:
   ```
   [reset-monthly-credits] 🔄 Iniciando reset mensal...
   [reset-monthly-credits] ✅ Reset executado com sucesso!
   [reset-monthly-credits] 📊 Resultado: 5
   ```

### **Verificar Último Reset**

```sql
SELECT
  COUNT(*) as total_usuarios,
  MIN(last_reset_at) as reset_mais_antigo,
  MAX(last_reset_at) as reset_mais_recente
FROM user_credits;
```

### **Ver Próximas Execuções do Cron**

No Dashboard do Supabase:
- **Edge Functions** → **Cron Jobs**
- Mostra "Next Run" com data/hora da próxima execução

---

## 🔐 Segurança

### **SERVICE_ROLE_KEY**

- ⚠️ A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY`
- Esta chave **bypassa RLS** (Row Level Security)
- **Nunca** exponha esta chave no frontend
- Apenas usada em Edge Functions server-side

### **RLS Policies**

A função SQL `reset_monthly_credits()` tem `SECURITY DEFINER`, o que significa:
- Executa com permissões do criador (admin)
- Pode atualizar qualquer linha em `user_credits`
- Não é afetada por RLS policies

---

## 🌍 Fuso Horário

### **UTC vs Horário de Brasília**

- **Cron Schedule:** 00:00 UTC
- **Horário de Brasília (BRT):** 21:00 do dia anterior
- **Horário de Brasília (BRST - Verão):** 22:00 do dia anterior

**Exemplo:**
- Cron configurado para: 1º de Fevereiro, 00:00 UTC
- Executa em Brasília: 31 de Janeiro, 21:00 BRT

### **Alterar Horário (Opcional)**

Para executar em outro horário, edite `config.toml`:

```toml
# Executar às 03:00 UTC (00:00 BRT)
schedule = "0 3 1 * *"

# Executar às 12:00 UTC (09:00 BRT)
schedule = "0 12 1 * *"
```

---

## 🐛 Troubleshooting

### **Problema: Cron não executa**

**Verificar:**
1. Edge Function foi deployada?
   ```bash
   npx supabase functions list
   ```
2. Cron está ativo no Dashboard?
3. Logs mostram algum erro?

### **Problema: Função retorna erro**

**Verificar:**
1. SQL function existe?
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'reset_monthly_credits';
   ```
2. SERVICE_ROLE_KEY está configurada?
   - Dashboard → Settings → API → `service_role key`

### **Problema: Apenas alguns usuários foram resetados**

**Verificar:**
1. Tabela `user_credits` tem registros para todos os usuários?
   ```sql
   SELECT COUNT(*) FROM user_credits;
   ```
2. Há algum constraint ou trigger impedindo update?

---

## 📈 Estatísticas Úteis

### **Créditos Totais no Sistema**

```sql
SELECT
  SUM(credits_remaining) as creditos_restantes_total,
  SUM(credits_total) as creditos_concedidos_total,
  COUNT(*) as total_usuarios,
  AVG(credits_remaining) as media_creditos_por_usuario
FROM user_credits;
```

### **Distribuição de Créditos**

```sql
SELECT
  CASE
    WHEN credits_remaining = 0 THEN '0 créditos'
    WHEN credits_remaining BETWEEN 1 AND 10 THEN '1-10 créditos'
    WHEN credits_remaining BETWEEN 11 AND 30 THEN '11-30 créditos'
    WHEN credits_remaining BETWEEN 31 AND 50 THEN '31-50 créditos'
    ELSE '50+ créditos'
  END as faixa,
  COUNT(*) as usuarios
FROM user_credits
GROUP BY faixa
ORDER BY faixa;
```

### **Usuários que Mais Usam**

```sql
SELECT
  user_id,
  credits_total - credits_remaining as creditos_usados_este_mes,
  credits_remaining,
  last_generation_at
FROM user_credits
ORDER BY (credits_total - credits_remaining) DESC
LIMIT 10;
```

---

## ✅ Checklist de Implementação

- [x] Edge Function criada (`reset-monthly-credits/index.ts`)
- [x] Configuração de cron adicionada (`config.toml`)
- [x] SQL function já existe (`reset_monthly_credits()`)
- [ ] **Deploy da Edge Function** ⚠️ **PENDENTE**
- [ ] **Teste manual da função** ⚠️ **PENDENTE**
- [ ] **Verificar cron no Dashboard** ⚠️ **PENDENTE**

---

## 🎯 Próximos Passos

1. **Deploy da Edge Function:**
   ```bash
   npx supabase functions deploy reset-monthly-credits
   ```

2. **Teste Manual:**
   ```bash
   curl -X POST https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/reset-monthly-credits \
     -H "Authorization: Bearer SERVICE_ROLE_KEY"
   ```

3. **Verificar no Dashboard:**
   - Edge Functions → Cron Jobs → `reset-monthly-credits`
   - Confirmar "Next Run" está correto

4. **Monitorar Primeira Execução Real:**
   - Aguardar até 1º do próximo mês
   - Verificar logs da execução
   - Confirmar que todos os usuários foram resetados

---

**Documentação criada por:** Claude Code
**Data:** 2025-01-04
**Versão:** 1.0
