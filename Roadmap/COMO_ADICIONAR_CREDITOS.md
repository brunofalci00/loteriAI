# 💳 Como Adicionar Créditos para Todos os Usuários

Este guia mostra como adicionar 50 créditos para todos os usuários existentes no sistema.

---

## 🎯 **OPÇÃO 1: SQL Direto no Supabase (RECOMENDADO)**

### ✅ Vantagens:
- Mais rápido
- Mais seguro
- Não precisa de código local
- Execução em uma única query

### 📝 Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard
   - Login com sua conta

2. **Vá para o SQL Editor:**
   - Menu lateral → **SQL Editor**
   - Clique em **+ New query**

3. **Escolha uma das queries abaixo:**

#### **Query Simplificada (UPSERT)** - Use esta! ⭐

```sql
-- UPSERT: Insere novos ou atualiza existentes automaticamente
INSERT INTO user_credits (user_id, credits_remaining, credits_total, last_reset_at)
SELECT
  id,
  50,
  50,
  NOW()
FROM profiles
ON CONFLICT (user_id)
DO UPDATE SET
  credits_remaining = 50,
  credits_total = 50,
  last_reset_at = NOW();

-- Verificar resultado
SELECT
  COUNT(*) as total_usuarios_com_creditos,
  SUM(CASE WHEN credits_remaining = 50 THEN 1 ELSE 0 END) as usuarios_com_50_creditos
FROM user_credits;
```

#### **Query Detalhada (Com Verificação)** - Alternativa

```sql
-- Passo 1: Inserir créditos para usuários novos
INSERT INTO user_credits (user_id, credits_remaining, credits_total, last_reset_at)
SELECT
  id as user_id,
  50 as credits_remaining,
  50 as credits_total,
  NOW() as last_reset_at
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM user_credits WHERE user_credits.user_id = profiles.id
);

-- Passo 2: Atualizar créditos para usuários existentes
UPDATE user_credits
SET
  credits_remaining = 50,
  credits_total = 50,
  last_reset_at = NOW()
WHERE user_id IN (SELECT id FROM profiles);

-- Passo 3: Verificar resultado
SELECT
  COUNT(*) as total_usuarios,
  AVG(credits_remaining) as media_creditos,
  MIN(credits_remaining) as minimo_creditos,
  MAX(credits_remaining) as maximo_creditos
FROM user_credits;

-- Passo 4: Ver detalhes por usuário
SELECT
  uc.user_id,
  p.email,
  uc.credits_remaining,
  uc.credits_total,
  uc.last_reset_at
FROM user_credits uc
JOIN profiles p ON p.id = uc.user_id
ORDER BY p.email;
```

4. **Execute a query:**
   - Clique em **Run** (ou Ctrl+Enter)
   - Aguarde a execução

5. **Verifique o resultado:**
   - A query de verificação mostrará:
     - `total_usuarios_com_creditos`: Quantos usuários têm créditos
     - `usuarios_com_50_creditos`: Quantos têm exatamente 50 créditos

---

## 🖥️ **OPÇÃO 2: Script Node.js Local**

### ⚠️ Requer:
- Service Role Key do Supabase (chave de admin)
- Node.js instalado localmente

### 📝 Passo a Passo:

1. **Obter Service Role Key:**
   - Supabase Dashboard → **Settings** → **API**
   - Copie o `service_role key` (⚠️ NÃO compartilhe esta chave!)

2. **Editar o script:**
   ```bash
   # Abra o arquivo
   C:\Users\bruno\Documents\Black\Loter.IA\Prod\app\scripts\add-credits-to-users.js
   ```

3. **Substituir a chave:**
   ```javascript
   const SUPABASE_SERVICE_KEY = 'SUA_SERVICE_ROLE_KEY_AQUI';
   ```

4. **Descomentar a linha de execução:**
   ```javascript
   // Encontre esta linha no final do arquivo:
   // addCreditsToAllUsers();

   // E remova o "//" para:
   addCreditsToAllUsers();
   ```

5. **Executar:**
   ```bash
   cd C:\Users\bruno\Documents\Black\Loter.IA\Prod\app\app
   node ../scripts/add-credits-to-users.js
   ```

---

## 📊 **Verificar Créditos Atuais (Query Rápida)**

Para ver quantos créditos cada usuário tem atualmente:

```sql
SELECT
  p.email,
  COALESCE(uc.credits_remaining, 0) as creditos,
  uc.last_reset_at as ultimo_reset
FROM profiles p
LEFT JOIN user_credits uc ON uc.user_id = p.id
ORDER BY p.email;
```

---

## 🔍 **Entendendo a Estrutura**

### Tabela `user_credits`:
```sql
- user_id: UUID (chave primária)
- credits_remaining: INTEGER (créditos disponíveis)
- credits_total: INTEGER (créditos totais do mês)
- last_reset_at: TIMESTAMPTZ (última vez que resetou)
- last_generation_at: TIMESTAMPTZ (última geração feita)
```

### Sistema de Reset Automático:
- 🔄 Os créditos resetam automaticamente todo dia 1º do mês
- 📅 Gerenciado pela Edge Function `reset-credits`
- 🎯 Default: 50 créditos por mês por usuário

---

## ⚠️ **Importante:**

1. **Backup antes de executar:**
   - O Supabase mantém backups automáticos
   - Mas é bom ter certeza

2. **Teste primeiro:**
   - Você pode testar com um único usuário primeiro:
   ```sql
   UPDATE user_credits
   SET credits_remaining = 50, credits_total = 50
   WHERE user_id = 'UUID_DO_USUARIO_TESTE';
   ```

3. **Verifique RLS:**
   - As políticas RLS já estão configuradas
   - Usuários só veem seus próprios créditos

---

## 🎉 **Pronto!**

Após executar, todos os usuários terão:
- ✅ 50 créditos disponíveis
- ✅ `credits_remaining = 50`
- ✅ `credits_total = 50`
- ✅ `last_reset_at = NOW()`

---

## 📞 **Troubleshooting**

### Erro: "permission denied"
- Certifique-se de estar usando a conta de admin do Supabase
- Ou use o Service Role Key no script Node.js

### Erro: "violates check constraint"
- Os créditos não podem ser negativos
- Verifique se `credits_remaining` e `credits_total` estão corretos

### Usuários não aparecem
- Verifique se os usuários estão na tabela `profiles`
- Execute: `SELECT COUNT(*) FROM profiles;`
