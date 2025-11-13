# Executar Migration Manualmente - Supabase Dashboard

## ⚠️ Situação Atual
O CLI do Supabase está tendo problemas de conectividade com o banco remoto.

**Solução:** Executar via Dashboard do Supabase (mais confiável)

---

## ✅ O Que Já Foi Feito

### Arquivos
- ✅ Arquivo conflitante deletado: `20250210213000_add_mega_token_expiration_function.sql`
- ✅ Migration de remoção pronta: `20250113_remove_mega_tokens_system.sql`

### Status
- ✅ Build passou sem erros
- ✅ Nenhuma referência a mega_tokens no código
- ✅ Projeto Supabase linqueado: `aaqthgqsuhyagsrlnyqk`

---

## 📋 Instruções para Executar Manualmente

### Step 1: Acessar SQL Editor
1. Ir para: https://app.supabase.com/project/aaqthgqsuhyagsrlnyqk/sql/new
2. Ou:
   - Ir para: https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk
   - Click em **SQL Editor** (menu esquerdo)
   - Click em **New Query**

### Step 2: Copiar o SQL da Migration

Copie este código inteiro:

```sql
-- Migration: Remove Mega Tokens System
-- Date: 2025-01-13
-- Description: Remove exclusive mega_tokens tables and functions.
--              Event now uses unified user_credits system.

-- Drop RPC function for consuming mega tokens
drop function if exists public.consume_mega_token(uuid, text, integer, jsonb) cascade;

-- Drop job function for expiration
drop function if exists public.expire_mega_tokens_job() cascade;

-- Drop ledger table (transactions)
drop table if exists public.mega_token_transactions cascade;

-- Drop wallet table (tokens)
drop table if exists public.mega_tokens cascade;

-- Update schema comment
comment on schema public is 'Mega tokens system removed on 2025-01-13. Event now uses unified user_credits.';
```

### Step 3: Executar a Query
1. Cole o código no editor SQL
2. Click em **Run** (botão verde, canto superior direito)
3. Espere a conclusão

### Step 4: Verificar Resultado
Você verá uma mensagem como:
```
Execution Successful

Command: DROP FUNCTION IF EXISTS public.consume_mega_token(uuid, text, integer, jsonb) cascade;
```

Ou erros como:
```
ERROR: function "consume_mega_token" does not exist
```

(Isso é OK - significa que já foi removida anteriormente)

---

## ✅ Validação Pós-Execução

Após executar, rode estas queries para verificar:

### Query 1: Confirmar mega_tokens foi removida
```sql
SELECT COUNT(*) as token_count FROM public.mega_tokens;
```

**Resultado esperado:**
```
ERROR: relation "public.mega_tokens" does not exist
```

### Query 2: Confirmar user_credits continua intacta
```sql
SELECT COUNT(*) as credit_count FROM public.user_credits;
```

**Resultado esperado:**
```
 credit_count
--------------
 <número>
```

(Qualquer número é OK - significa tabela existe)

### Query 3: Confirmar consume_credit funciona
```sql
SELECT EXISTS(
  SELECT 1 FROM information_schema.routines
  WHERE routine_name = 'consume_credit'
  AND routine_schema = 'public'
);
```

**Resultado esperado:**
```
 exists
--------
 t
```

(t = true, ou seja, função existe)

---

## 🔍 Se Houver Erros

### Erro 1: "function does not exist"
```
ERROR: function "consume_mega_token" does not exist
```

**O que significa:** Já foi removida em uma execução anterior
**Ação:** Continuar com as outras queries - é seguro

### Erro 2: "permission denied"
```
ERROR: permission denied for schema public
```

**O que significa:** Você não tem permissão de admin
**Ação:** Usar a senha de admin fornecida ou contactar Supabase support

### Erro 3: Timeout/Connection Lost
```
FATAL: max_connections reached
```

**O que significa:** Servidor sobrecarregado
**Ação:** Aguarde 5 minutos e tente novamente

---

## 📊 Status de Cada Comando

| Comando | Status | Descrição |
|---------|--------|-----------|
| `drop function consume_mega_token()` | ✅ Seguro | Se não existir, será ignorado |
| `drop function expire_mega_tokens_job()` | ✅ Seguro | Se não existir, será ignorado |
| `drop table mega_token_transactions` | ✅ Seguro | Se não existir, será ignorado |
| `drop table mega_tokens` | ✅ Seguro | Se não existir, será ignorado |
| `comment on schema` | ✅ Seguro | Apenas adiciona comentário |

---

## ⏮️ Se Precisar Reverter

Se algo der errado:

### Opção 1: Restaurar Backup (MELHOR)
1. Ir para: **Settings → Backups** (no dashboard Supabase)
2. Click em **Restore** do backup anterior
3. Aguarde ~15 minutos

### Opção 2: Recrear Tabelas (SÓ SE PRECISAR)
Se você tem os arquivos de criação das tabelas, pode recreá-las. Mas normalmente não é necessário.

---

## 📝 Próximos Passos

Após a execução bem-sucedida:

### 1. Confirmar no Código
```bash
cd "App"
git status
```

Você deve ver apenas deletado:
```
deleted:    supabase/migrations/20250210213000_add_mega_token_expiration_function.sql
```

### 2. Fazer Commit
```bash
git add supabase/migrations/
git commit -m "feat: remove mega tokens system and execute migration"
```

### 3. Testar na Aplicação
- Abrir app em dev mode
- Ir para Mega da Virada
- Verificar que créditos aparecem corretamente
- Tentar regenerar combinação (deve consumir 1 crédito)

---

## 🆘 Precisa de Ajuda?

Se tiver problemas na execução manual:

1. **Supabase Status**: https://status.supabase.io
2. **Documentação**: https://supabase.com/docs/guides/database/sql-editor
3. **Support**: Contatar Supabase via dashboard

---

**Data:** 13 de Novembro de 2025
**Projeto:** Mega da Virada - Refactoring Completo
**Status:** Pronto para Execução Manual

