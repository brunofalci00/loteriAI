# 🚀 Implementação Scenario B - Checklist Completo

**Data:** 13/11/2025
**Status:** ✅ ARQUIVOS CRIADOS - PRONTO PARA IMPLEMENTAR

---

## 📊 O Que Foi Feito

✅ **2 Edge Functions criadas:**
- `validate-access-token/index.ts`
- `set-password-with-token/index.ts`

✅ **kirvano-webhook modificado** para chamar N8N webhook

✅ **SQL Setup** documentado

✅ **CreatePassword.tsx** já existe na rota `/criar-senha`

---

## 🎯 Próximos Passos (você precisa fazer)

### **PASSO 1: Executar SQL (5 minutos)**

1. Abrir Supabase Dashboard → **SQL Editor**
2. Copiar e colar TODO o conteúdo de `SQL_SETUP_SCENARIO_B.sql`
3. Clicar **RUN**

> ✅ Isso cria as tabelas `access_tokens` e `email_logs`

---

### **PASSO 2: Deploy das Edge Functions (10 minutos)**

**Via Supabase CLI:**

```bash
# 1. Na pasta do projeto
cd LP_loteri.AI/app

# 2. Login no Supabase (se não estiver logado)
supabase login

# 3. Link o projeto
supabase link --project-ref aaqthgqsuhyagsrlnyqk

# 4. Deploy as 2 funções
supabase functions deploy validate-access-token
supabase functions deploy set-password-with-token

# 5. Verificar que foram deployed
supabase functions list
```

**Esperado (você deve ver):**
```
NAME                          TYPE       DEPLOYMENTS   CREATED_AT (UTC)
validate-access-token         HTTP       1            2025-11-13
set-password-with-token       HTTP       1            2025-11-13
```

---

### **PASSO 3: Configurar N8N (15 minutos)**

#### **3.1. Acessar N8N**

1. URL: https://n8n.srv1079374.hstgr.cloud/
2. Procurar workflow `Z6MRThWeRObubaPi`
3. Abrir para editar

#### **3.2. Configurar Credenciais Gmail**

1. Clique no nó **Gmail**
2. Abra a seção "Gmail account"
3. Clique em **"Create new credential"**
4. Siga o fluxo OAuth da Google para autenticar
5. Selecione a conta `scalewithlumen@gmail.com`

#### **3.3. Configurar Credenciais Supabase**

1. Clique no nó **Supabase** (o que salva tokens)
2. Abra a seção "Supabase"
3. Clique em **"Create new credential"**
4. Preencha:
   - **Supabase URL:** `https://aaqthgqsuhyagsrlnyqk.supabase.co`
   - **Service Role Key:** (Use sua chave secreta - cuidado!)

> 🔒 **Segurança:** Nunca compartilhe a Service Role Key publicamente!

#### **3.4. Configurar Variável de Ambiente no Supabase**

1. Supabase Dashboard → **Settings → Edge Functions**
2. Clique em **Environment Variables**
3. Adicione:
   - **Variable Name:** `N8N_WEBHOOK_URL`
   - **Value:** `https://seu-n8n-instance.app/webhook/loter-ai-welcome`

> ℹ️ Você deve saber qual é a URL exata do seu workflow n8n. Procure na barra de URL do workflow.

#### **3.5. Ativar o Workflow**

1. No N8N, veja se existe um botão **"Inactive"** no topo
2. Clique para ativar (deve ficar **"Active"**)
3. A URL do webhook ficará visível na seção "Webhook Details"

---

### **PASSO 4: Fazer Deploy do kirvano-webhook (5 minutos)**

```bash
cd LP_loteri.AI/app

# Deploy a função modificada
supabase functions deploy kirvano-webhook

# Verificar
supabase functions list
```

---

### **PASSO 5: Testar com curl (10 minutos)**

#### **Teste 1: Validar Token (ainda não existe)**

```bash
curl -X POST https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/validate-access-token \
  -H "Content-Type: application/json" \
  -d '{"token": "teste-invalido-123"}'

# Resposta esperada:
# {"valid":false,"error":"Link inválido ou já utilizado"}
```

#### **Teste 2: Verificar Fluxo Completo**

**Melhor forma:** Fazer uma compra de teste na Kirvano

1. Vá para site da Kirvano (sandbox/teste)
2. Faça uma compra de teste
3. Verificar em Supabase:
   - ✅ Usuário foi criado em `auth.users`
   - ✅ Pagamento registrado em `payments`
   - ✅ Token foi criado em `access_tokens` (via N8N)

4. Verificar email:
   - ✅ Email recebido de `loter.AI <scalewithlumen@gmail.com>`
   - ✅ Contém link: `https://fqdigital.com.br/app/criar-senha?token=xxx`

5. Clicar no link:
   - ✅ Página `/criar-senha` carrega
   - ✅ Mostra "Validando link..."
   - ✅ Token é reconhecido como válido
   - ✅ Formulário aparece

6. Criar senha:
   - ✅ Preenche senha
   - ✅ Confirma senha
   - ✅ Clica "CRIAR SENHA E ENTRAR"
   - ✅ Redirecionado para `/dashboard`
   - ✅ Está logado!

---

## 📋 Checklist Final

- [ ] **1. SQL Executado** - Tabelas `access_tokens` e `email_logs` criadas
- [ ] **2. Edge Function 1** - `validate-access-token` deployed
- [ ] **3. Edge Function 2** - `set-password-with-token` deployed
- [ ] **4. N8N Configurado** - Gmail + Supabase credentials
- [ ] **5. Variável N8N_WEBHOOK_URL** - Configurada em Supabase
- [ ] **6. Workflow N8N** - ATIVO
- [ ] **7. kirvano-webhook** - Deployed (com modificação)
- [ ] **8. Testes com curl** - Passaram
- [ ] **9. Compra de Teste** - Fluxo completo funcionou
- [ ] **10. Usuario logou** - Conseguiu criar senha e entrar no dashboard

---

## 🎯 Resultado Esperado

Quando tudo estiver funcionando:

```
┌─────────────────────────────────────────┐
│ 1. COMPRA NA KIRVANO (PIX/Cartão)      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 2. kirvano-webhook CRIA USUÁRIO         │
│    + Chama N8N webhook                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 3. N8N:                                 │
│    ├─ Gera token (24h válido)          │
│    ├─ Salva em access_tokens           │
│    ├─ Envia email (Gmail customizado)  │
│    └─ Registra log                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 4. EMAIL RECEBIDO:                      │
│    De: loter.AI <email@gmail.com>      │
│    Assunto: 🎉 Seu acesso liberado     │
│    Link: ...criar-senha?token=xxx       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 5. USUÁRIO CLICA NO LINK                │
│    CreatePassword.tsx carrega           │
│    Valida token (validate-access-token) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 6. CRIA SENHA:                          │
│    set-password-with-token              │
│    ├─ Valida token                      │
│    ├─ Define senha                      │
│    ├─ Marca token como usado            │
│    └─ Registra log                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 7. LOGIN AUTOMÁTICO                     │
│    Redireciona para /dashboard          │
│    ✅ SUCESSO!                          │
└─────────────────────────────────────────┘
```

---

## ⚠️ Possíveis Problemas e Soluções

### **Problema: "N8N_WEBHOOK_URL not found"**

**Solução:**
1. Verifique se a variável foi adicionada em Supabase Settings → Edge Functions
2. Redeploy o `kirvano-webhook`

### **Problema: Email não chega**

**Solução:**
1. Verificar se Gmail está autenticado no N8N
2. Verificar se a credencial de Supabase está correta
3. Ver logs do N8N (clique em "Logs" no workflow)

### **Problema: "Token inválido" ao clicar no link**

**Solução:**
1. Verificar se o token está realmente em `access_tokens` (Supabase Dashboard)
2. Verificar se não expirou (expires_at > agora)
3. Ver logs do N8N para ver se foi criado

### **Problema: Erro ao criar senha**

**Solução:**
1. Verificar se o token ainda é válido
2. Verificar se o usuário existe em `auth.users`
3. Ver logs da Edge Function em Supabase Dashboard

---

## 📞 Resumo de Contato

Se precisar de ajuda:

1. **Logs do N8N:** Clique em "Logs" no workflow para ver o que aconteceu
2. **Logs do Supabase:** Edge Functions → Clique na função → "Logs"
3. **Database Explorer:** Veja as tabelas `access_tokens` e `email_logs`
4. **Browser DevTools:** Console pode ter mensagens de erro

---

**Última Atualização:** 13/11/2025
**Status:** ✅ Pronto para Implementar

