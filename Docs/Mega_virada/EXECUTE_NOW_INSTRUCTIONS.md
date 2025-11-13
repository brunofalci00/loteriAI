# ⚡ EXECUTE AGORA - Passo a Passo Completo

**Tempo estimado:** 5 minutos

---

## 📍 PASSO 1: Abrir Supabase Dashboard

1. Cole esta URL no navegador:
   ```
   https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk/sql/new
   ```

2. Você deve ver a tela do SQL Editor do Supabase

---

## 📋 PASSO 2: Copiar o SQL

Copie **TODO** o texto abaixo (Ctrl+A, Ctrl+C):

```sql
-- Migration: Remove Mega Tokens System
-- Date: 2025-01-13
-- Description: Remove exclusive mega_tokens tables and functions.
--              Event now uses unified user_credits system.

drop function if exists public.consume_mega_token(uuid, text, integer, jsonb) cascade;
drop function if exists public.expire_mega_tokens_job() cascade;
drop table if exists public.mega_token_transactions cascade;
drop table if exists public.mega_tokens cascade;
comment on schema public is 'Mega tokens system removed on 2025-01-13. Event now uses unified user_credits.';
```

---

## ⌨️ PASSO 3: Colar no Editor

1. No SQL Editor do Supabase, clica no **campo de texto branco** (esquerda)
2. Cole o código: **Ctrl+V**
3. Você deve ver o código aparecendo no editor

---

## ▶️ PASSO 4: Executar

1. Procure pelo botão **RUN** (verde, no canto superior direito)
2. Click no botão **RUN**
3. Aguarde ~5-10 segundos

---

## ✅ PASSO 5: Verificar Resultado

### Sucesso?
Se vir uma mensagem com "**Query successful**" ou algo como:
```
Execution Successful

Command: DROP FUNCTION IF EXISTS...
```

Então está **✅ PRONTO!**

### Erros esperados (IGNORE):
Se vir erros como:
```
ERROR: function "consume_mega_token" does not exist
```

Isso é **NORMAL** - significa que já foi removido antes. Continue.

---

## 🔍 PASSO 6: Validar (Opcional)

Para confirmar que tudo funcionou, execute estas 3 queries:

### Query 1: Confirmar remoção
```sql
SELECT COUNT(*) FROM public.mega_tokens;
```
Resultado esperado: **ERROR** (tabela não existe)

### Query 2: Confirmar user_credits existe
```sql
SELECT COUNT(*) FROM public.user_credits;
```
Resultado esperado: **número > 0**

### Query 3: Confirmar consume_credit funciona
```sql
SELECT EXISTS(
  SELECT 1 FROM information_schema.routines
  WHERE routine_name = 'consume_credit'
  AND routine_schema = 'public'
);
```
Resultado esperado: **true**

---

## 🎉 PRONTO!

Se chegou aqui, a migration foi executada com sucesso!

### Próximos passos:
1. ✅ Fechar Supabase dashboard
2. ✅ Voltar para a aplicação
3. ✅ Testar se Mega da Virada funciona
4. ✅ Tentar regenerar uma combinação (deve consumir 1 crédito)

---

## ⏱️ Timeline

| Ação | Tempo |
|------|-------|
| Abrir dashboard | 1 min |
| Copiar SQL | 1 min |
| Executar no editor | 1 min |
| Validar resultado | 1 min |
| Testar na app | 5 min |
| **TOTAL** | **~9 minutos** |

---

## 🆘 Se Algo Der Errado

### Erro: "permission denied"
- **Cause:** Não está logado como admin
- **Solução:** Fazer login com credenciais de admin do Supabase

### Erro: "connection timeout"
- **Cause:** Problema de rede
- **Solução:** Aguardar 2 minutos e tentar novamente

### Erro: "syntax error"
- **Cause:** SQL foi copiado incorretamente
- **Solução:** Copiar novamente do começo

### Não vê nenhuma mensagem
- **Cause:** Pode estar processando ainda
- **Solução:** Aguardar 10 segundos

---

## 📞 Precisa de Ajuda?

Se não conseguir, me avisa:
1. Qual erro você vê exatamente?
2. Qual é o seu navegador?
3. Está usando VPN/Proxy?

---

**Boa sorte! Você consegue! 🚀**

