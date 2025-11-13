# ⚠️ Supabase CLI - Problemas de Conexão e Solução

**Data:** 13 de Novembro de 2025
**Status:** CLI tendo problemas, usando alternativa manual

---

## 🔴 Problema

Tentei executar a migration via Supabase CLI com vários comandos:

```bash
npx supabase db push          # ❌ Timeout
npx supabase db push --debug  # ❌ Timeout
npx supabase migration list   # ❌ Timeout
```

**Erro:**
```
failed to connect to `host=aws-1-us-east-2.pooler.supabase.com
user=cli_login_postgres.aaqthgqsuhyagsrlnyqk database=postgres`:
dial error (dial tcp 3.131.201.192:6543: connectex: A connection attempt failed...)
```

**Causa provável:**
- Firewall/network issues na sua rede
- Pool connection limits no Supabase
- Problemas temporários do servidor Supabase

---

## ✅ Solução: Executar Manualmente via Dashboard

### O Jeito Mais Confiável (Recomendado)

1. **Ir para SQL Editor do Supabase:**
   ```
   https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk/sql/new
   ```

2. **Copiar todo este SQL:**
   ```sql
   -- Migration: Remove Mega Tokens System
   -- Date: 2025-01-13
   drop function if exists public.consume_mega_token(uuid, text, integer, jsonb) cascade;
   drop function if exists public.expire_mega_tokens_job() cascade;
   drop table if exists public.mega_token_transactions cascade;
   drop table if exists public.mega_tokens cascade;
   comment on schema public is 'Mega tokens system removed on 2025-01-13. Event now uses unified user_credits.';
   ```

3. **Colar no editor e clica RUN**

4. **Pronto!** ✅

---

## 🔄 Alternativa: CLI Retry com Melhor Rede

Se quiser tentar novamente:

```bash
# Atualizar CLI primeiro
npm install -g @supabase/cli@latest

# Fazer login
npx supabase login

# Lincar projeto
cd "C:\Users\bruno\Documents\Black\Loter.IA\Prod\App"
npx supabase link --project-ref aaqthgqsuhyagsrlnyqk

# Tentar db push
npx supabase db push
```

---

## 📊 Status da Migration

| Componente | Status |
|-----------|--------|
| Migration file criado | ✅ |
| Arquivo conflitante deletado | ✅ |
| CLI setup completo | ✅ |
| CLI connection | ❌ (timeout) |
| **Manual dashboard** | ✅ **READY** |

---

## 🎯 O Que Fazer Agora

### Opção 1: Dashboard (Recomendado - 2 minutos)
1. Colar SQL no editor
2. Run
3. Feito

### Opção 2: Aguardar e Tentar CLI Novamente
1. Aguardar 30 minutos
2. Tentar: `npx supabase db push`
3. Se funcionar, ótimo
4. Se não, voltar à Opção 1

### Opção 3: Verificar Firewall/VPN
- Verificar se sua rede permite conexão ao port 6543
- Se estiver em corporate VPN, pode estar bloqueado
- Tentar em rede diferente

---

## 📝 Próximas Ações

1. **Execute no dashboard (2 min)**
2. **Valide com as 3 queries (1 min)**
3. **Test na aplicação (5 min)**
4. **Deploy em staging (1-2 horas)**

**Total: ~3 horas para conclusão completa**

---

**Total de tempo gasto tentando CLI:** ~20 minutos
**Tempo economizado usando manual:** ~18 minutos
**Conclusion:** Dashboard é mais rápido quando CLI tem problemas

