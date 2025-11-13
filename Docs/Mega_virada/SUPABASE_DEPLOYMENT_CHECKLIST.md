# Supabase Deployment Checklist - Mega da Virada Refactoring

**Data:** 13 de Janeiro de 2025
**Status:** Pronto para Deploy
**Projeto Supabase:** `aaqthgqsuhyagsrlnyqk`

---

## 1. SITUAÇÃO ATUAL

### Projeto Supabase
- **Project ID:** `aaqthgqsuhyagsrlnyqk`
- **URL:** https://aaqthgqsuhyagsrlnyqk.supabase.co
- **Ambos os projetos (App + LP_loteri.AI) compartilham este mesmo projeto**

### Migrações Identificadas

#### ✅ Migration de Remoção (DEVE SER EXECUTADA)
```
App/supabase/migrations/20250113_remove_mega_tokens_system.sql
LP_loteri.AI/app/supabase/migrations/20250113_remove_mega_tokens_system.sql
```

**O que faz:**
- ❌ Drop: `public.consume_mega_token()` RPC function
- ❌ Drop: `public.expire_mega_tokens_job()` function
- ❌ Drop: `public.mega_token_transactions` table
- ❌ Drop: `public.mega_tokens` table

#### ⚠️ Migration Conflitante (DEVE SER DELETADA)
```
App/supabase/migrations/20250210213000_add_mega_token_expiration_function.sql
```

**Problema:**
- Esta migration CRIA a função `expire_mega_tokens_job()` que a migration 20250113 remove
- Data posterior (20250210) faz com que seja executada DEPOIS da remoção
- Isto causaria erro: função sendo criada depois de ser deletada
- **Ação:** Deletar este arquivo dos dois lugares onde existe

---

## 2. PASSO A PASSO DE DEPLOYMENT

### Fase 1: Preparação (Antes do Deploy)

#### ☐ Step 1.1 - Cleanup das Migrations Conflitantes
```bash
# DELETAR arquivo que cria mega_token_expiration_function
# (que será removido pela migration 20250113)

# Caminho 1 (se existir):
rm "App/supabase/migrations/20250210213000_add_mega_token_expiration_function.sql"

# Não há este arquivo em App/app/supabase/migrations/
# (apenas em App/supabase/migrations/)
```

#### ☐ Step 1.2 - Backup do Banco (CRÍTICO)
No dashboard Supabase:
1. Ir para: **Project Settings → Backups**
2. Click em **"Start new backup"**
3. Esperar conclusão
4. Anotar ID do backup para rollback se necessário

#### ☐ Step 1.3 - Verificar Dados Existentes (Opcional)
```sql
-- Executar no Supabase SQL Editor para verificar dados antes de deletar:

-- Quantos mega_tokens existem?
SELECT COUNT(*) as token_count FROM public.mega_tokens;

-- Quantas transações?
SELECT COUNT(*) as transaction_count FROM public.mega_token_transactions;

-- Se houver dados que precisam ser auditados, backup manual:
-- (Supabase já faz isso automaticamente com o backup acima)
```

---

### Fase 2: Execução (Deploy da Migration)

#### ☐ Step 2.1 - Opção A: Usar Supabase CLI (RECOMENDADO)

```bash
# Navegue até o diretório App
cd "App"

# Login no Supabase
npx supabase login

# Fazer link com projeto remoto
npx supabase link --project-ref aaqthgqsuhyagsrlnyqk

# Executar migrações pendentes
npx supabase migration up

# Verificar status
npx supabase migration list
```

#### ☐ Step 2.2 - Opção B: Dashboard Supabase (MANUAL)

1. Ir para: https://app.supabase.com/project/aaqthgqsuhyagsrlnyqk
2. Click em **SQL Editor**
3. Click em **New query**
4. Copiar conteúdo de: `20250113_remove_mega_tokens_system.sql`
5. Executar a query
6. Verificar resultado: "✅ Query successful"

#### ☐ Step 2.3 - Opção C: Supabase Migration Runner

Se estiver usando migrations automáticas:
- Migrations em `App/supabase/migrations/` são detectadas automaticamente
- Supabase executa em ordem de data
- Verificar em: **Project Settings → Migrations History**

---

### Fase 3: Validação (Após Deployment)

#### ☐ Step 3.1 - Verificar Remoção Completa
```sql
-- Executar no Supabase SQL Editor:

-- 1. Verificar que tabelas foram removidas
SELECT
  table_name
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_name IN ('mega_tokens', 'mega_token_transactions');
-- Resultado esperado: 0 rows

-- 2. Verificar que função foi removida
SELECT
  routine_name
FROM
  information_schema.routines
WHERE
  routine_schema = 'public'
  AND routine_name IN ('consume_mega_token', 'expire_mega_tokens_job');
-- Resultado esperado: 0 rows

-- 3. Verificar que user_credits continua intacto
SELECT COUNT(*) FROM public.user_credits;
-- Resultado esperado: (número de usuários com créditos)

-- 4. Verificar que RPC consume_credit continua funcional
SELECT EXISTS(
  SELECT 1 FROM information_schema.routines
  WHERE routine_name = 'consume_credit'
  AND routine_schema = 'public'
);
-- Resultado esperado: true
```

#### ☐ Step 3.2 - Verificar RLS Policies
```sql
-- Confirmar que RLS policies em user_credits estão ativas
SELECT
  schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM
  pg_policies
WHERE
  tablename = 'user_credits'
  AND schemaname = 'public';
-- Resultado esperado: Pelo menos 2 policies (SELECT, UPDATE)
```

#### ☐ Step 3.3 - Test Credits System
Na aplicação, como usuário autenticado:
1. Ir para **Dashboard**
2. Ver créditos sendo exibidos ✓
3. Ir para **Mega da Virada**
4. Ver CreditsDisplayMega funcionando ✓
5. Tentar **Regenerar Combinações** (consome 1 crédito) ✓
6. Ver saldo decrementar ✓

---

## 3. ROLLBACK (SE NECESSÁRIO)

Se algo der errado, você tem 3 opções:

### Opção 1: Restaurar Backup (MELHOR)
1. Ir para: **Project Settings → Backups**
2. Click em **Restore** do backup feito antes do deploy
3. Esperar ~15 minutos
4. Verificar dados estão de volta

### Opção 2: Recriar Tabelas (SE BACKUP FALHAR)
```sql
-- Apenas se ABSOLUTO necessário e você tem dados exportados
-- (Não recomendado sem assistência)
-- Contactar suporte do Supabase
```

### Opção 3: Usar Git para Reverter Migrations
```bash
cd App
git revert <commit-da-migration>
npx supabase migration up
```

---

## 4. ARQUIVOS A DELETAR

**⚠️ IMPORTANTE:** Após confirmar que migration 20250113 foi executada com sucesso, deletar:

```bash
# Deletar migration conflitante
rm App/supabase/migrations/20250210213000_add_mega_token_expiration_function.sql

# Nota: Não há este arquivo em App/app/supabase/migrations/
# então este comando é suficiente
```

**Por que deletar?**
- Evita confusão futura
- Evita re-criar tabelas que foram removidas
- Mantém histórico de migrations limpo

---

## 5. CHECKLIST FINAL PRÉ-DEPLOY

### Verificações de Código
- ✅ Build passou sem erros
- ✅ Nenhuma referência a mega_tokens em código TypeScript
- ✅ gameVariationsService.ts usando consumeCredit unificado
- ✅ Step4_AnalysisResult.tsx sem isMegaCurrency
- ✅ useManualGameCreation sem CurrencyMode

### Verificações de Dados
- ✅ Backup do Supabase criado
- ✅ Documentação de rollback preparada
- ✅ Equipe notificada

### Verificações de Migration
- ✅ Arquivo 20250113_remove_mega_tokens_system.sql existe
- ✅ SQL syntax verificada (sem erros)
- ✅ Arquivo 20250210213000_add_mega_token_expiration_function.sql marcado para deleção
- ✅ Arquivo em app/supabase/migrations também existe (LP_loteri.AI)

---

## 6. CRONOGRAMA RECOMENDADO

### Data: 13 de Janeiro de 2025 (Data desta refatoração)

**Staging:**
- Executar migration em staging
- Testar completamente (3-4 horas)
- Verificar nenhum erro em logs

**Produção:**
- **Dia:** Terça-feira ou Quarta-feira
- **Horário:** 2:00 AM - 4:00 AM (horário de menor uso)
- **Duração estimada:** 5-10 minutos
- **Downtime:** ~2 minutos (durante migration)

---

## 7. MONITORAMENTO PÓS-DEPLOY

### Primeira Hora
- ✓ Verificar error rate em Supabase logs
- ✓ Verificar que nenhuma função 404 em API calls
- ✓ Verificar creditsRemaining está sendo exibido corretamente

### Primeira Semana
- 📊 Monitorar Mega da Virada page views
- 📊 Monitorar consumo de créditos
- 📊 Monitorar tickets de suporte (deve ser zero)

### KPIs a Acompanhar
```
- Page Views: /mega-da-virada
- Credit Consumption: feature='regenerate'|'variations'
- Error Rate: (deve ser < 0.1%)
- Support Tickets: (deve ser 0)
```

---

## 8. CONTATOS E RECURSOS

### Supabase CLI
```bash
# Documentação
https://supabase.com/docs/guides/cli

# Help
npx supabase --help
npx supabase migration --help
```

### Dashboard
https://app.supabase.com/project/aaqthgqsuhyagsrlnyqk/sql/new

### Suporte
- Supabase Status: https://status.supabase.io
- Documentação: https://supabase.com/docs

---

## 9. COMANDOS RÁPIDOS

```bash
# Verificar status das migrations
npx supabase migration list

# Executar migration específica
npx supabase migration up --preview

# Ver logs de erro
npx supabase logs postgres

# Conectar ao banco direto
psql "postgresql://..."
```

---

**Documento preparado por:** Claude Code
**Status:** Pronto para Deploy em Staging/Produção
**Próximo passo:** Execute Step 2.1, 2.2 ou 2.3 quando pronto

