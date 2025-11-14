# 🚀 PLANO DE MIGRAÇÃO: Mega da Virada → Master

## Resumo Executivo

**Status:** ✅ SEGURO FAZER MERGE
**Risco:** MÉDIO (mitiga com procedimentos)
**Tempo Estimado:** ~90 minutos
**Branch Origem:** `feat/mega-da-virada-refactoring` (138 commits)
**Branch Destino:** `master` (produção)

---

## 📊 Análise Rápida

| Métrica | Valor |
|---------|-------|
| Commits no branch | 138 |
| Arquivos alterados | 9.264 (9k são node_modules) |
| Arquivos TS/TSX novos | 15 |
| Arquivos TS/TSX modificados | 8 |
| Breaking changes | 1 (mega_tokens removido) |
| Feature flags | 1 novo (VITE_MEGA_EVENT_ENABLED) |
| Database migrations | 1 (remove mega_tokens) |
| Conflitos esperados | 3 MÉDIOS (mitigáveis) |

---

## ⚠️ TRÊS COISAS CRÍTICAS

### 🔴 1. VITE_MEGA_EVENT_ENABLED OBRIGATÓRIO
```bash
# Sem isto, rota /mega-da-virada NÃO renderiza
# Deve estar em:
# - LP_loteri.AI/.env
# - App/.env
# - Vercel Environment Variables

VITE_MEGA_EVENT_ENABLED=true
```

### 🔴 2. System MEGA_TOKENS Será Removido
```bash
# Estas tabelas/funções serão DELETADAS:
# - mega_tokens table
# - mega_token_transactions table
# - consume_mega_token() RPC
# - expire_mega_tokens_job() function

# Problema: types.ts terá referências orphaned
# Solução: Regenerar após migration com:
supabase gen types typescript --linked
```

### 🔴 3. Merge Tem 3 Conflitos Esperados
```bash
# App/app/src/App.tsx (rota /mega-da-virada)
# LP_loteri.AI/app/src/App.tsx (3 rotas mega)
# Dashboard.tsx em ambos (MegaEventHero)

# Solução: Testar merge local ANTES de fazer push
```

---

## 🔄 PASSO A PASSO (Execute Sequencialmente)

### PASSO 1: PREPARAÇÃO & BACKUP (⏰ 15 min)

#### 1.1 Backup Supabase (CRÍTICO)
```bash
# ⚠️ IMPORTANTE: Fazer backup manual antes de qualquer migration

# Dashboard Supabase → Backups → Manual Backup
# URL: https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk/backups

# Ou via CLI:
supabase db push --dry-run
# Verifica se migration rodaria sem erros
```

#### 1.2 Criar Branch de Rollback
```bash
cd "C:\Users\bruno\Documents\Black\Loter.IA\Prod"

git checkout master
git pull origin master

# Salvar estado atual
git checkout -b hotfix/mega-virada-rollback
git push origin hotfix/mega-virada-rollback

# Voltar para master
git checkout master
```

#### 1.3 Documentar Estado Atual
```bash
# Guardar informações de restauração
git log --oneline master -5 > ROLLBACK_STATE.txt
git status >> ROLLBACK_STATE.txt

# Esto permite voltar para aqui se algo quebrar
```

---

### PASSO 2: MERGE LOCAL (⏰ 10 min)

#### 2.1 Fazer Merge Localmente
```bash
cd "C:\Users\bruno\Documents\Black\Loter.IA\Prod"

git checkout master
git merge feat/mega-da-virada-refactoring
```

#### 2.2 Resolver Conflitos (Se houver)
```bash
# Verá algo assim se tiver conflitos:
# CONFLICT (content): Merge conflict in App/app/src/App.tsx
# CONFLICT (content): Merge conflict in LP_loteri.AI/app/src/App.tsx
# CONFLICT (content): Merge conflict in App/app/src/pages/Dashboard.tsx
# CONFLICT (content): Merge conflict in LP_loteri.AI/app/src/pages/Dashboard.tsx

# Ver status
git status

# Abrir VS Code e resolver manualmente
# Procure por <<<<<<< ======= >>>>>>>
# Escolha a versão correta (geralmente a do branch)

# Depois de resolver:
git add .
git commit -m "chore: resolve merge conflicts from mega-virada branch"
```

#### 2.3 Verificar Status
```bash
git status
# Deve estar limpo (nothing to commit)

git log --oneline -5
# Último commit deve ser do merge
```

---

### PASSO 3: VALIDAÇÃO LOCAL (⏰ 15 min)

#### 3.1 Instalar Dependências
```bash
cd LP_loteri.AI
npm run install:all

cd ../App
npm install
```

#### 3.2 Build Test
```bash
# App
cd App
npm run build 2>&1 | tail -20
# Deve terminar com "✓ built in X.XXs"

# LP_loteri.AI
cd ../LP_loteri.AI
npm run build 2>&1 | tail -20
# Deve terminar com "✓ built in X.XXs"
```

#### 3.3 TypeScript Check
```bash
# Verificar se há erros TS
npm run build 2>&1 | grep -i "error"
# Deve retornar NADA (vazio)
```

#### 3.4 Verificar Referências Orphaned
```bash
# Procura por mega_tokens (que não deveria existir)
grep -r "mega_token" App/app/src/ --include="*.tsx" --include="*.ts"
# Deve retornar NADA (vazio)

grep -r "mega_token" LP_loteri.AI/app/src/ --include="*.tsx" --include="*.ts"
# Deve retornar NADA (vazio)
```

#### 3.5 Verificar Feature Flag
```bash
# Feature flag está definido?
grep -n "isMegaEventEnabled\|VITE_MEGA_EVENT_ENABLED" App/app/src/config/features.ts
grep -n "isMegaEventEnabled\|VITE_MEGA_EVENT_ENABLED" LP_loteri.AI/app/src/config/features.ts

# Deve retornar linhas (não vazio)
```

---

### PASSO 4: DATABASE MIGRATION (⏰ 10 min)

#### 4.1 Verificar Migration
```bash
cd App
ls -la supabase/migrations/ | grep mega

# Deve existir arquivo tipo:
# 20250113_remove_mega_tokens_system.sql
# ou
# 20250210213000_add_mega_token_expiration_function.sql
```

#### 4.2 Dry Run (Testar Sem Executar)
```bash
# ⚠️ IMPORTANTE: Nunca pule isto

cd App
npx supabase db push --dry-run

# Lerá o arquivo SQL e mostrará o que faria
# Verifique:
# ✅ Tabelas corretas sendo dropadas
# ✅ Functions corretas sendo dropadas
# ✅ Sem erros de syntax
```

#### 4.3 Executar Migration (SE dry-run OK)
```bash
cd App

# AQUI É O PONTO DE NÃO RETORNO
# Após isto, mega_tokens será removido

npx supabase db push --yes

# Aguarde conclusão
# Deve terminar com sucesso
```

#### 4.4 Regenerar Types (CRÍTICO)
```bash
# types.ts precisa ser atualizado para remover referências a mega_tokens

cd App

# Opção 1 (automático):
npm run postinstall
# Se tiver script que regenera types

# Opção 2 (manual):
npx supabase gen types typescript --linked > app/src/integrations/supabase/types.ts

# Verificar que não tem mega_token references
grep -c "mega_token" app/src/integrations/supabase/types.ts
# Deve retornar "0" ou nada
```

---

### PASSO 5: BUILD FINAL (⏰ 10 min)

#### 5.1 Build App
```bash
cd App
npm run build 2>&1 | tail -30

# Verificar:
# ✅ "✓ built in X.XXs"
# ✅ "2747 modules transformed"
# ✅ Zero errors
```

#### 5.2 Build LP
```bash
cd ../LP_loteri.AI
npm run build 2>&1 | tail -30

# Mesmo checklist
```

#### 5.3 Final Validation
```bash
# Não deve haver erros
npm run build 2>&1 | grep -i "error"
# Vazio = OK
```

---

### PASSO 6: PUSH PARA GITHUB (⏰ 5 min)

#### 6.1 Push Master
```bash
cd "C:\Users\bruno\Documents\Black\Loter.IA\Prod"

git push origin master

# Output esperado:
# To https://github.com/brunofalci00/loteriAI.git
#   [new branch]      master -> master
```

#### 6.2 Verificar Push
```bash
git log origin/master -1
# Deve mostrar commit do merge

git status
# Deve estar clean
```

#### 6.3 Opcional: Deletar Feature Branch
```bash
# Se quiser limpar (cuidado, não é reversível):
git branch -d feat/mega-da-virada-refactoring
git push origin --delete feat/mega-da-virada-refactoring
```

---

### PASSO 7: DEPLOY (⏰ 20 min)

#### 7.1 Vercel Deploy Automático
```bash
# Vercel vai detectar push e começar deploy automaticamente
# https://vercel.com/dashboard → seu projeto → Deployments

# Esperado:
# ✅ Status: "Building"
# ✅ Depois: "Analyzing"
# ✅ Depois: "Ready" (2-3 minutos)
```

#### 7.2 Acompanhar Build
```bash
# Logs do Vercel:
# Vercel dashboard → Deployments → último deploy → Logs

# Procure por:
# ✅ "npm run build" completed
# ✅ "✓ built in" message
# ✅ "✓ built successfully"
```

#### 7.3 Verificar Status
```bash
# Quando status mudar para "Ready":
# ✅ Deploy completado com sucesso

# Tempo esperado: 2-3 minutos
```

---

### PASSO 8: TESTES EM PRODUÇÃO (⏰ 30 min)

#### 8.1 Acessar Aplicação
```bash
# Em navegador:
https://fqdigital.com.br/app

# Verificar:
✅ Página carrega
✅ Sem erros no console (F12 → Console)
✅ Dashboard visível
```

#### 8.2 Testar MegaEventHero Banner
```bash
# Na página do Dashboard (/app/dashboard):
✅ Banner da Mega da Virada visível
✅ Com gradient dourado (#f7c948)
✅ Countdown funciona (atualiza cada 60s)
✅ Cards de prêmio visíveis
✅ Botões funcionam
```

#### 8.3 Testar Rota /mega-da-virada
```bash
# Se estiver logado:
https://fqdigital.com.br/app/mega-da-virada

✅ Página carrega
✅ Timeline do evento visível
✅ Cards de features aparecem
✅ Sem erros console
```

#### 8.4 Verificar Feature Flag
```bash
# Em dev console (F12 → Console):
localStorage.getItem('isMegaEventEnabled')
// Deve retornar true (ou estar no .env)
```

#### 8.5 Monitorar Logs
```bash
# Monitorar por ~5 minutos:
# Vercel dashboard → Logs → Function Logs

# Procure por:
⚠️ NÃO deve haver erros
⚠️ NÃO deve haver 500 status codes
✅ Requisições normais
```

#### 8.6 Testar Responsividade
```bash
# Abrir F12 → Responsive Design Mode (Ctrl+Shift+M)

✅ Mobile (375px): Todos elementos visíveis
✅ Tablet (768px): Layout responsivo
✅ Desktop (1920px): Layout completo
```

---

### PASSO 9: PÓS-DEPLOY (⏰ 30 min)

#### 9.1 Comunicar ao Time
```
📢 Mega da Virada migrada com sucesso!

✅ Feature está LIVE em produção
✅ Rota /mega-da-virada acessível
✅ Banner visível em Dashboard
✅ Sistema de créditos funcionando

Monitorem por 24h!
```

#### 9.2 Monitorar por 24h
```bash
# Verificar periodicamente:
# - Vercel logs (erros?)
# - Usuários conseguem acessar?
# - Créditos funcionam?
# - Countdown regride?

# Alertas:
⚠️ Se houver erros → Iniciar ROLLBACK
⚠️ Se feature não aparecer → Verificar flag env
⚠️ Se quebrar outros features → Rollback
```

#### 9.3 Cleanup
```bash
# Remover arquivos temporários
rm ROLLBACK_STATE.txt
rm ANALISE_MEGA_VIRADA_BRANCH.txt

# Ou guardar para documentação
git add docs/
git commit -m "docs: add migration documentation"
```

---

## 🆘 ROLLBACK (SE DER ERRADO)

### Opção 1: Soft Rollback (Recomendado)
```bash
# Não reseta hard, apenas reverte o merge
git revert -m 1 <merge-commit-hash>

# Encontrar hash:
git log --oneline -5
# Procurar por "Merge branch 'feat/mega-da-virada..."

# Exemplo:
git revert -m 1 abc1234

# Build e deploy novamente
npm run build
git push origin master

# Vercel vai re-deploy automaticamente (2-3 min)
```

### Opção 2: Hard Rollback (Emergência)
```bash
# ⚠️ ÚLTIMO RECURSO - faz hard reset

git reset --hard hotfix/mega-virada-rollback
git push origin master --force

# Restaurar backup Supabase:
# Dashboard > Backups > Restore
# Selecionar backup anterior
```

### Opção 3: Feature Flag Disable (Rápido)
```bash
# Se só o banner é o problema:
# Remover de .env:
VITE_MEGA_EVENT_ENABLED=false

# Build e deploy
# Banner desaparece, resto funciona
```

---

## ✅ CHECKLIST ANTES DE COMEÇAR

```
PREPARAÇÃO
☐ Backup Supabase feito (manual dashboard)
☐ Branch hotfix criado (hotfix/mega-virada-rollback)
☐ Team comunicado (vamos fazer merge hoje)
☐ Este documento lido e entendido

AMBIENTE
☐ Internet estável
☐ VS Code/editor aberto
☐ Terminal pronto
☐ GitHub token válido (se usar SSH)
☐ Supabase credenciais valid

CHECKLIST TÉCNICO
☐ Master está atualizado (git pull origin master)
☐ Nenhuma mudança local não commitada (git status limpo)
☐ Node.js/npm instalado e atualizado
☐ Npm dependencies atualizadas

TEMPO
☐ Tenho ~90 minutos disponíveis
☐ Sem meetings ou interrupções
☐ Posso monitorar por 30 min após deploy

BACKUP
☐ Salvei estado atual em arquivo
☐ Tenho screenshot de last good deploy
☐ Supabase backup está OK
```

---

## 📋 CHECKLIST DURANTE EXECUÇÃO

```
PASSO 1: Backup ✅
☐ Backup Supabase feito
☐ Branch hotfix criado
☐ Estado documentado

PASSO 2: Merge Local ✅
☐ Merge feito sem erros
☐ Conflitos resolvidos (se havia)
☐ Status limpo

PASSO 3: Validação Local ✅
☐ Dependencies instaladas
☐ Build passou (App)
☐ Build passou (LP)
☐ Sem erros TypeScript
☐ Sem referências orphaned
☐ Feature flag verificado

PASSO 4: Database ✅
☐ Dry run passou
☐ Migration executada
☐ types.ts regenerado
☐ Sem referências mega_token

PASSO 5: Build Final ✅
☐ App build OK
☐ LP build OK
☐ Sem erros

PASSO 6: Push ✅
☐ Feito push origem master
☐ Verificado que subiu

PASSO 7: Deploy ✅
☐ Vercel começou build
☐ Build completou
☐ Status = "Ready"

PASSO 8: Testes ✅
☐ Aplicação carrega
☐ Banner visível
☐ Rota /mega-da-virada OK
☐ Sem erros console
☐ Responsividade OK

PASSO 9: Finalização ✅
☐ Time comunicado
☐ Monitoramento iniciado
☐ Cleanup feito
```

---

## 📊 ANTES vs DEPOIS

### Antes do Merge
```
┌─────────────────────────────┐
│  MASTER (sem Mega Event)    │
├─────────────────────────────┤
│ ✅ Dashboard normal         │
│ ✅ Loterias análise        │
│ ✅ Sistema créditos        │
│ ✅ Autenticação            │
│ ❌ Mega Event              │
│ ❌ /mega-da-virada route   │
└─────────────────────────────┘
```

### Depois do Merge
```
┌──────────────────────────────┐
│  MASTER (com Mega Event)     │
├──────────────────────────────┤
│ ✅ Dashboard normal          │
│ ✅ Loterias análise         │
│ ✅ Sistema créditos         │
│ ✅ Autenticação             │
│ ✅ Mega Event               │
│ ✅ /mega-da-virada route    │
│ ✅ MegaEventHero banner     │
│ ✅ Timeline evento          │
│ ✅ Análises exclusivas      │
└──────────────────────────────┘
```

---

## 🎯 TEMPO ESTIMADO

| Fase | Tempo | Status |
|------|-------|--------|
| Preparação & Backup | 15 min | ⏰ |
| Merge Local | 10 min | ⏰ |
| Validação Local | 15 min | ⏰ |
| Database Migration | 10 min | ⏰ |
| Build Final | 10 min | ⏰ |
| Push GitHub | 5 min | ⏰ |
| Deploy (Vercel) | 20 min | ⏰ |
| Testes Produção | 30 min | ⏰ |
| **TOTAL** | **~115 min** | |

---

## 🚨 RED FLAGS (ABORTE SE...)

```
⛔ NÃO Continue se:
   - Backup Supabase falhou
   - Merge local tem MUITOS conflitos (>5)
   - Build local não passou
   - Há referências orphaned a mega_tokens
   - Vercel build falhou
   - Testes em prod mostram erros críticos
   - Feature flag não está definido

✅ Todos os checks passaram → Pode continuar
```

---

## 📞 CONTATO & SUPORTE

**Problema durante merge?**
1. Não panique
2. Verifique este documento
3. Se crítico: execute ROLLBACK

**Problema pós-deploy?**
1. Verifique logs Vercel
2. Se crítico: execute ROLLBACK
3. Monitorar por 24h

**Documentação:**
- Este arquivo: PLANO_MIGRACAO_MEGA_VIRADA.md
- Análise: ANALISE_MEGA_VIRADA_BRANCH.txt
- Docs: Docs/Infra/Novo/

---

## ✨ BOM SORTE!

Você está prestes a levar a **Mega da Virada para produção** 🚀

**Leia este documento novamente ANTES de começar!**

Tempo estimado: **~2 horas**
Dificuldade: **MÉDIO**
Risco: **MITIGADO com procedimentos**

---

**Criado:** Novembro 2025
**Status:** PRONTO PARA EXECUTAR
**Última revisão:** 2025-11-14
