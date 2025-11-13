# Supabase - O Que Fazer (Resumo Rápido)

## Situação
- ✅ App e LP_loteri.AI compartilham **1 Supabase** (projeto: `aaqthgqsuhyagsrlnyqk`)
- ✅ Migration de remoção dos mega_tokens está pronta
- ⚠️ 1 arquivo conflitante precisa ser deletado

---

## 3 Ações Necessárias

### 1️⃣ Deletar Migration Conflitante (AGORA)
```bash
rm "App/supabase/migrations/20250210213000_add_mega_token_expiration_function.sql"
```
**Por quê?** Essa migration cria a função que a 20250113 remove. Deletar evita conflito.

---

### 2️⃣ Fazer Backup no Supabase (ANTES DO DEPLOY)
1. Ir para: https://app.supabase.com/project/aaqthgqsuhyagsrlnyqk
2. **Settings → Backups → Start new backup**
3. Esperar conclusão

---

### 3️⃣ Executar Migration de Remoção (NO DEPLOY)

#### Opção A: CLI (Automático)
```bash
cd "App"
npx supabase login
npx supabase link --project-ref aaqthgqsuhyagsrlnyqk
npx supabase migration up
```

#### Opção B: Dashboard (Manual)
1. SQL Editor: https://app.supabase.com/project/aaqthgqsuhyagsrlnyqk/sql/new
2. Copiar arquivo: `App/supabase/migrations/20250113_remove_mega_tokens_system.sql`
3. Executar

---

## O Que Será Removido
- ❌ Tabela `mega_tokens`
- ❌ Tabela `mega_token_transactions`
- ❌ Função `consume_mega_token()`
- ❌ Função `expire_mega_tokens_job()`

## O Que Será Mantido
- ✅ Tabela `user_credits` (intacta)
- ✅ Função `consume_credit()` (intacta)
- ✅ Todos os dados de usuários

---

## Validação Pós-Deploy (5 min)
```sql
-- Executar no SQL Editor para confirmar:

-- Tabelas foram removidas?
SELECT COUNT(*) FROM public.mega_tokens;
-- Resultado esperado: ERROR (tabela não existe)

-- Função consume_credit continua?
SELECT EXISTS(
  SELECT 1 FROM information_schema.routines
  WHERE routine_name = 'consume_credit'
);
-- Resultado esperado: true
```

---

## Timeline Recomendado
- **Agora:** Deletar arquivo conflitante + documentar
- **Hoje/Amanhã:** Fazer backup no Supabase
- **Esta semana (madrugada):** Executar migration em staging
- **Próxima semana (madrugada):** Deploy em produção (2 AM)

---

## Documentação Completa
Arquivo detalhado com todos os passos:
```
Docs/Mega_virada/SUPABASE_DEPLOYMENT_CHECKLIST.md
```

