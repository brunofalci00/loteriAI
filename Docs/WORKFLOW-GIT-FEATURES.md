# 🔀 Workflow Git - Desenvolvimento de Novas Features

**Data:** 07/11/2025
**Autor:** Bruno Falci
**Versão:** 1.0

---

## 🎯 Filosofia de Desenvolvimento

### Princípios Fundamentais

1. **Master branch = SEMPRE estável** (produção)
2. **Feature branches = Desenvolvimento isolado**
3. **Testar TUDO localmente antes de fazer merge**
4. **Nunca commitar direto na master** (exceto hotfixes críticos)
5. **Um branch por feature** (não misturar features)

---

## 📋 Fluxo Completo - Passo a Passo

### Fase 1: Preparação (Antes de Começar)

#### 1.1 Garantir que Master está Atualizada

```bash
# 1. Ir para master
git checkout master

# 2. Atualizar master
git pull origin master

# 3. Verificar estado
git status
# Deve mostrar: "nothing to commit, working tree clean"

# 4. Ver último commit
git log --oneline -1
```

**Por quê?** Você quer começar sua feature a partir do código mais recente.

#### 1.2 Verificar que Não Há Mudanças Pendentes

```bash
git status
```

Se mostrar arquivos modificados:
```bash
# Opção 1: Commitar as mudanças
git add .
git commit -m "feat: Sua mensagem"

# Opção 2: Descartar as mudanças (CUIDADO!)
git checkout .

# Opção 3: Guardar temporariamente (stash)
git stash
```

---

### Fase 2: Criar Branch de Feature

#### 2.1 Nomenclatura de Branches

**Formato:** `tipo/nome-descritivo`

**Tipos:**
- `feature/` → Nova funcionalidade
- `bugfix/` → Correção de bug
- `hotfix/` → Correção urgente em produção
- `improvement/` → Melhoria em feature existente
- `refactor/` → Refatoração de código

**Exemplos:**
```bash
feature/novo-painel-dashboard
feature/integracao-whatsapp
bugfix/corrigir-calculo-probabilidade
hotfix/erro-login-critico
improvement/otimizar-performance-quiz
refactor/reorganizar-componentes
```

#### 2.2 Criar e Mudar para o Branch

```bash
# Criar branch a partir da master atual
git checkout -b feature/nome-da-feature

# Verificar que está no branch correto
git branch
# O branch com * é o atual
```

**Exemplo prático:**
```bash
git checkout -b feature/sistema-notificacoes
```

---

### Fase 3: Desenvolver a Feature

#### 3.1 Desenvolvimento Iterativo

Durante o desenvolvimento, faça commits pequenos e frequentes:

```bash
# 1. Fazer mudanças no código
# (editar arquivos)

# 2. Ver o que mudou
git status
git diff

# 3. Adicionar arquivos
git add LP_loteri.AI/app/src/components/NovoComponente.tsx
# OU adicionar tudo
git add .

# 4. Commitar com mensagem descritiva
git commit -m "feat: Adicionar componente de notificações"

# 5. Repetir o ciclo
```

#### 3.2 Tipos de Mensagens de Commit

```bash
feat: Nova funcionalidade
fix: Correção de bug
refactor: Refatoração de código
style: Mudanças de estilo/formatação
docs: Documentação
test: Testes
chore: Manutenção/configs
perf: Melhoria de performance
```

**Exemplos:**
```bash
git commit -m "feat: Adicionar sistema de notificações push"
git commit -m "fix: Corrigir erro ao salvar jogo"
git commit -m "refactor: Reorganizar estrutura de pastas"
git commit -m "style: Ajustar espaçamento do header"
git commit -m "docs: Atualizar README com novas instruções"
git commit -m "test: Adicionar testes para serviço de créditos"
git commit -m "chore: Atualizar dependências do projeto"
git commit -m "perf: Otimizar carregamento de imagens"
```

#### 3.3 Manter Branch Atualizado com Master

Se o desenvolvimento está demorando vários dias, é bom manter o branch atualizado:

```bash
# 1. Salvar trabalho atual
git add .
git commit -m "wip: Trabalho em progresso"

# 2. Ir para master
git checkout master

# 3. Atualizar master
git pull origin master

# 4. Voltar para sua feature
git checkout feature/nome-da-feature

# 5. Trazer mudanças da master
git merge master

# 6. Resolver conflitos se houver (ver seção 5.2)
```

---

### Fase 4: Testar Localmente

#### 4.1 Testar Landing Page

Se modificou arquivos em `LP_loteri.AI/public/`:

```bash
cd LP_loteri.AI

# Testar se build funciona
npm run build

# Verificar output
ls -la dist/
ls -la dist/app/

# Abrir arquivos HTML no navegador para testar
# Windows:
start dist/index.html
start dist/quiz.html
```

#### 4.2 Testar App React

Se modificou arquivos em `LP_loteri.AI/app/src/`:

```bash
cd LP_loteri.AI/app

# Instalar dependências (se adicionou novas)
npm install

# Rodar em desenvolvimento
npm run dev
# Abre em: http://localhost:5173

# Testar TUDO:
# ✓ Navegação entre páginas
# ✓ Funcionalidades novas
# ✓ Funcionalidades antigas (não quebrar)
# ✓ Responsividade (mobile)
# ✓ Console sem erros (F12)

# Build de produção
npm run build

# Verificar que buildou sem erros
echo $?  # Deve retornar 0
```

#### 4.3 Testar Build Completo

```bash
cd LP_loteri.AI

# Build completo (igual ao Vercel)
npm run build

# Verificar estrutura final
tree dist/  # ou ls -R dist/

# Verificar arquivos críticos
test -f dist/index.html && echo "✓ LP OK"
test -f dist/app/index.html && echo "✓ App OK"
```

#### 4.4 Checklist de Testes

```
□ Build passa sem erros
□ App roda sem erros no console (F12)
□ Todas as páginas navegam corretamente
□ Funcionalidades antigas continuam funcionando
□ Nova funcionalidade funciona como esperado
□ Código está limpo (sem console.logs desnecessários)
□ Responsivo (testar em mobile)
□ Performance OK (não está lento)
```

---

### Fase 5: Preparar para Merge

#### 5.1 Atualizar Branch com Master (Final)

Antes de fazer merge, garantir que seu branch tem as últimas mudanças:

```bash
# 1. Commitar tudo no seu branch
git add .
git commit -m "feat: Finalizar feature X"

# 2. Ir para master
git checkout master

# 3. Atualizar master
git pull origin master

# 4. Voltar para feature
git checkout feature/nome-da-feature

# 5. Merge da master na feature
git merge master

# 6. Resolver conflitos se houver
```

#### 5.2 Resolver Conflitos (Se Houver)

Se aparecer conflitos:

```bash
# Git vai mostrar algo como:
# CONFLICT (content): Merge conflict in arquivo.tsx

# 1. Ver arquivos com conflito
git status

# 2. Abrir arquivo conflitante no editor
# Vai ter marcações como:
<<<<<<< HEAD
seu código
=======
código da master
>>>>>>> master

# 3. Editar e escolher o código correto
# (remover as marcações <<<, ===, >>>)

# 4. Adicionar arquivo resolvido
git add arquivo.tsx

# 5. Continuar merge
git commit -m "merge: Resolver conflitos com master"

# 6. Testar tudo de novo!
npm run build  # Garantir que ainda funciona
```

#### 5.3 Review de Código (Self Review)

Antes do merge, revisar suas próprias mudanças:

```bash
# Ver todas as mudanças
git diff master

# Ver arquivos alterados
git diff --name-only master

# Ver histórico de commits
git log master..HEAD --oneline

# Perguntas para si mesmo:
# □ O código está limpo?
# □ Removi todos os console.logs de debug?
# □ A documentação está atualizada?
# □ Não estou commitando arquivos desnecessários?
# □ As mensagens de commit fazem sentido?
```

---

### Fase 6: Fazer Merge na Master

#### 6.1 Método Seguro - Merge Local Primeiro

**RECOMENDADO para evitar problemas:**

```bash
# 1. Ir para master
git checkout master

# 2. Garantir que está atualizada
git pull origin master

# 3. Fazer merge da feature
git merge feature/nome-da-feature

# 4. Se houver conflitos, resolver (ver 5.2)

# 5. Testar localmente APÓS o merge
cd LP_loteri.AI
npm run build

# 6. Se tudo OK, push para produção
git push origin master
```

#### 6.2 Verificar no Vercel

Após o push:

```bash
# 1. Aguardar 2-3 minutos

# 2. Verificar logs no dashboard Vercel
# - Build deve demorar ~14-24 segundos
# - Deve mostrar "Build organizado com sucesso!"

# 3. Testar no site de produção
# www.fqdigital.com.br/
# www.fqdigital.com.br/app
```

#### 6.3 Se Algo Quebrar (Rollback)

Se após o merge algo quebrar em produção:

```bash
# 1. Ver último commit bom
git log --oneline -10

# 2. Fazer revert do merge problemático
git revert HEAD

# 3. Push do revert
git push origin master

# 4. OU fazer reset hard (mais drástico)
git reset --hard <commit-hash-bom>
git push --force origin master
```

---

### Fase 7: Limpar Branches Antigas

#### 7.1 Deletar Branch Local

Após merge bem-sucedido:

```bash
# 1. Ir para master
git checkout master

# 2. Deletar branch local
git branch -d feature/nome-da-feature

# 3. Verificar branches restantes
git branch
```

#### 7.2 Deletar Branch Remota (Se Enviou)

Se você fez push do branch de feature:

```bash
# Deletar do GitHub
git push origin --delete feature/nome-da-feature
```

---

## 📊 Fluxos Visuais

### Fluxo Simples - Nova Feature

```
master (produção)
   │
   │ git checkout -b feature/X
   ├──────────────────> feature/X
   │                        │
   │                        │ desenvolvimento
   │                        │ commits
   │                        │ testes
   │                        │
   │ git merge feature/X    │
   │<───────────────────────┤
   │
   │ git push origin master
   └──────────────────────> 🚀 PRODUÇÃO
```

### Fluxo com Master Atualizada Durante Desenvolvimento

```
master
   │
   │ git checkout -b feature/X
   ├──────────────────> feature/X
   │                        │
   ●────────────────────────┤  Outros commits na master
   │                        │
   │ git checkout feature/X │
   │ git merge master       │
   │ ────────────────────> ┤  Atualizar feature com master
   │                        │
   │                        │  Continuar desenvolvimento
   │                        │
   │ git checkout master    │
   │ git merge feature/X    │
   │<───────────────────────┤
   │
   └──────────────────────> 🚀 PRODUÇÃO
```

### Fluxo com Múltiplas Features Paralelas

```
master
   │
   ├──────> feature/A (desenvolve)
   │            │
   │            ●──────> merge na master
   │            │
   ├──────> feature/B (desenvolve)
   │            │
   │            │
   │<───────────┘ merge na master
   │
   ├──────> feature/C (desenvolve)
   │            │
   │<───────────┘ merge na master
   │
   └────────────────> 🚀 PRODUÇÃO
```

---

## 🔥 Cenários Especiais

### Cenário 1: Hotfix Urgente em Produção

Se há um bug crítico em produção que precisa ser corrigido IMEDIATAMENTE:

```bash
# 1. Partir da master (produção)
git checkout master
git pull origin master

# 2. Criar branch de hotfix
git checkout -b hotfix/corrigir-erro-critico

# 3. Fazer correção mínima
# (editar apenas o necessário)

# 4. Testar rapidamente
npm run build

# 5. Commitar
git add .
git commit -m "hotfix: Corrigir erro crítico de login"

# 6. Merge direto na master
git checkout master
git merge hotfix/corrigir-erro-critico

# 7. Push para produção
git push origin master

# 8. Verificar deploy urgente no Vercel

# 9. Deletar branch de hotfix
git branch -d hotfix/corrigir-erro-critico
```

**Tempo esperado:** 5-10 minutos do início ao deploy.

### Cenário 2: Abandonar Feature Incompleta

Se decidir NÃO continuar uma feature:

```bash
# 1. Ir para master
git checkout master

# 2. Deletar branch local
git branch -D feature/nome-da-feature
# -D (maiúsculo) = força deleção mesmo com mudanças não mergeadas

# 3. Se fez push, deletar do remoto
git push origin --delete feature/nome-da-feature
```

### Cenário 3: Pausar Feature e Começar Outra

Se precisar pausar uma feature e trabalhar em outra:

```bash
# 1. Salvar trabalho atual (stash)
git add .
git stash save "WIP: Feature X pausada"

# 2. Ir para master
git checkout master

# 3. Criar novo branch
git checkout -b feature/outra-feature

# 4. Trabalhar na nova feature...

# 5. Quando quiser voltar para a primeira:
git checkout feature/primeira-feature
git stash pop  # Restaura mudanças salvas
```

### Cenário 4: Feature Depende de Outra Feature

Se feature B depende de feature A (ainda não mergeada):

```bash
# 1. Partir do branch da feature A
git checkout feature/A

# 2. Criar feature B a partir da A
git checkout -b feature/B

# 3. Desenvolver feature B
# ...

# 4. Quando feature A for mergeada na master:
git checkout feature/B
git rebase master  # Reaplica feature B em cima da master atualizada
```

---

## ⚠️ Erros Comuns e Como Evitar

### Erro 1: Commitar Direto na Master

❌ **NUNCA fazer:**
```bash
git checkout master
# (editar arquivos)
git add .
git commit -m "feat: Nova feature"
git push
```

✅ **SEMPRE fazer:**
```bash
git checkout master
git checkout -b feature/nova-feature
# (editar arquivos)
git add .
git commit -m "feat: Nova feature"
# Testar, testar, testar
git checkout master
git merge feature/nova-feature
git push
```

### Erro 2: Não Testar Antes do Merge

❌ **Problema:**
```bash
git merge feature/X
git push  # 💥 Quebrou produção!
```

✅ **Solução:**
```bash
git merge feature/X
cd LP_loteri.AI
npm run build  # ✓ Testar primeiro!
# Se OK:
git push
```

### Erro 3: Misturar Múltiplas Features em Um Branch

❌ **Problema:**
```bash
git checkout -b feature/melhorias-gerais
# Adiciona notificações
# Adiciona chat
# Corrige bug
# Muda design
# 💥 Difícil de revisar e testar
```

✅ **Solução:**
```bash
git checkout -b feature/sistema-notificacoes
# Adiciona APENAS notificações
git checkout master
git checkout -b feature/sistema-chat
# Adiciona APENAS chat
```

### Erro 4: Não Atualizar Branch com Master

❌ **Problema:**
```bash
# Trabalha 1 semana sem puxar master
# Master avançou muito
git merge feature/X
# 💥 50 conflitos!
```

✅ **Solução:**
```bash
# A cada 1-2 dias:
git checkout master
git pull
git checkout feature/X
git merge master  # Resolver conflitos aos poucos
```

### Erro 5: Commitar Arquivos Sensíveis

❌ **NUNCA commitar:**
```bash
.env
.env.local
credentials.json
secrets/
passwords.txt
node_modules/
```

✅ **Verificar antes:**
```bash
git status  # Ver o que vai ser commitado
git diff    # Ver mudanças
```

Se acidentalmente commitou:
```bash
git reset HEAD~1  # Desfaz último commit (mantém mudanças)
# Adicionar arquivo ao .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: Adicionar .env ao gitignore"
```

---

## 📝 Templates de Mensagens

### Template de Commit

```
tipo: Descrição curta (máx 72 caracteres)

Descrição detalhada do que foi feito e por quê.
Pode ter múltiplas linhas.

Resolves: #123
Related to: #456
```

**Exemplo:**
```bash
git commit -m "feat: Adicionar sistema de notificações push

Implementado sistema completo de notificações para alertar
usuários sobre novos sorteios e resultados.

Inclui:
- Backend com Firebase Cloud Messaging
- Frontend com service worker
- Tela de configurações de notificações

Resolves: #45
Related to: #12"
```

### Template de Pull Request (Se Usar GitHub PR)

```markdown
## 📋 Descrição

Breve descrição da feature/fix.

## 🎯 Motivação

Por que essa mudança é necessária?

## 🔄 Mudanças

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## 🧪 Como Testar

1. Passo 1
2. Passo 2
3. Passo 3

## 📸 Screenshots

(Se aplicável)

## ✅ Checklist

- [ ] Build passa sem erros
- [ ] Testes locais OK
- [ ] Documentação atualizada
- [ ] Sem console.logs de debug
- [ ] Código revisado
```

---

## 🎓 Boas Práticas Resumidas

### ✅ FAZER

1. ✅ **Sempre criar branch para novas features**
2. ✅ **Testar TUDO localmente antes de merge**
3. ✅ **Commits pequenos e frequentes**
4. ✅ **Mensagens de commit descritivas**
5. ✅ **Manter branch atualizado com master**
6. ✅ **Fazer self-review antes de merge**
7. ✅ **Deletar branches após merge**
8. ✅ **Documentar mudanças importantes**

### ❌ NÃO FAZER

1. ❌ **Commitar direto na master** (exceto hotfixes)
2. ❌ **Fazer merge sem testar**
3. ❌ **Misturar múltiplas features em um branch**
4. ❌ **Commitar arquivos gerados** (dist/, node_modules/)
5. ❌ **Usar git push --force na master** (exceto emergências)
6. ❌ **Deixar branches mortos** (deletar após merge)
7. ❌ **Commitar código com console.logs de debug**
8. ❌ **Fazer commits genéricos** ("fix", "update", "changes")

---

## 🆘 Comandos de Emergência

### Ver Estado Atual

```bash
git status              # Ver arquivos modificados
git branch             # Ver branches locais
git log --oneline -10  # Ver últimos commits
git diff               # Ver mudanças não commitadas
git diff master        # Ver diferença com master
```

### Desfazer Mudanças

```bash
# Desfazer mudanças em arquivo específico (antes de add)
git checkout arquivo.txt

# Desfazer todas as mudanças (antes de add)
git checkout .

# Desfazer add (unstage)
git reset HEAD arquivo.txt

# Desfazer último commit (mantém mudanças)
git reset HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1

# Desfazer N commits atrás
git reset --hard HEAD~3
```

### Recuperar Trabalho Perdido

```bash
# Ver histórico completo (incluindo commits deletados)
git reflog

# Recuperar commit deletado
git checkout <hash-do-reflog>
git checkout -b branch-recuperado
```

### Limpar Repo

```bash
# Remover arquivos não rastreados
git clean -n  # Ver o que seria deletado (dry run)
git clean -f  # Deletar arquivos não rastreados
git clean -fd # Deletar arquivos e diretórios

# Remover branches locais mergeados
git branch --merged | grep -v "master" | xargs git branch -d
```

---

## 📊 Exemplo Completo - Do Início ao Fim

### Feature: Sistema de Notificações

```bash
# ============================================
# FASE 1: PREPARAÇÃO
# ============================================

# Atualizar master
git checkout master
git pull origin master
git status  # Verificar que está limpo

# ============================================
# FASE 2: CRIAR BRANCH
# ============================================

# Criar branch de feature
git checkout -b feature/sistema-notificacoes
git branch  # Verificar que está no branch correto

# ============================================
# FASE 3: DESENVOLVIMENTO
# ============================================

# Dia 1: Criar estrutura básica
# (criar arquivos, editar código)
git add LP_loteri.AI/app/src/services/notificationService.ts
git commit -m "feat: Criar serviço de notificações"

# (continuar desenvolvendo)
git add LP_loteri.AI/app/src/components/NotificationBell.tsx
git commit -m "feat: Adicionar componente de sino de notificações"

# Dia 2: Integrar com backend
git add LP_loteri.AI/app/src/hooks/useNotifications.ts
git commit -m "feat: Criar hook de notificações"

# (testar localmente)
cd LP_loteri.AI/app
npm run dev
# Testar no navegador

# Dia 3: Finalizar
git add .
git commit -m "feat: Adicionar tela de configurações de notificações"

# ============================================
# FASE 4: TESTAR LOCALMENTE
# ============================================

# Build completo
cd LP_loteri.AI
npm run build
# ✓ Sem erros

# Testar estrutura
ls -la dist/app/

# ============================================
# FASE 5: PREPARAR MERGE
# ============================================

# Atualizar com master
git checkout master
git pull origin master
git checkout feature/sistema-notificacoes
git merge master
# (resolver conflitos se houver)

# Testar novamente após merge
npm run build

# Self review
git diff master
git log master..HEAD --oneline

# ============================================
# FASE 6: MERGE
# ============================================

# Merge na master
git checkout master
git merge feature/sistema-notificacoes

# Testar mais uma vez
cd LP_loteri.AI
npm run build

# Push para produção
git push origin master

# ============================================
# FASE 7: VERIFICAR E LIMPAR
# ============================================

# Aguardar deploy do Vercel (2-3 min)
# Verificar logs no dashboard

# Testar em produção
# www.fqdigital.com.br/app

# Se tudo OK, deletar branch
git branch -d feature/sistema-notificacoes

# ============================================
# CONCLUÍDO! 🎉
# ============================================
```

---

## 🔗 Recursos Úteis

### Comandos Git Essenciais

```bash
# Ver ajuda de comando
git help <comando>
git <comando> --help

# Configurar editor padrão
git config --global core.editor "code --wait"

# Ver configurações
git config --list

# Criar alias úteis
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
```

### Links Úteis

- **Git Documentation:** https://git-scm.com/doc
- **Conventional Commits:** https://www.conventionalcommits.org/
- **GitHub Flow:** https://guides.github.com/introduction/flow/
- **Atlassian Git Tutorials:** https://www.atlassian.com/git/tutorials

---

## 📅 Histórico de Mudanças

| Data       | Versão | Mudança                                |
|------------|--------|----------------------------------------|
| 07/11/2025 | 1.0    | Documentação inicial do workflow Git   |

---

**Última atualização:** 07/11/2025
**Mantido por:** Bruno Falci

---

## ⚡ Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  WORKFLOW RÁPIDO - NOVA FEATURE                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1️⃣  Preparar                                            │
│     git checkout master && git pull                     │
│                                                          │
│  2️⃣  Criar Branch                                        │
│     git checkout -b feature/nome                        │
│                                                          │
│  3️⃣  Desenvolver                                         │
│     (editar arquivos)                                   │
│     git add . && git commit -m "feat: ..."             │
│                                                          │
│  4️⃣  Testar                                              │
│     cd LP_loteri.AI && npm run build                   │
│                                                          │
│  5️⃣  Atualizar com Master                                │
│     git checkout master && git pull                     │
│     git checkout feature/nome                           │
│     git merge master                                    │
│                                                          │
│  6️⃣  Merge                                               │
│     git checkout master                                 │
│     git merge feature/nome                              │
│     npm run build  # Testar!                           │
│     git push origin master                              │
│                                                          │
│  7️⃣  Limpar                                              │
│     git branch -d feature/nome                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

**FIM DA DOCUMENTAÇÃO**
