# 🛠️ Guia de Desenvolvimento - Loter.IA

## 📋 Workflow de Desenvolvimento Seguro

### 🎯 Filosofia
- **Master branch** = SEMPRE estável (produção)
- **Feature branches** = Desenvolvimento de novas funcionalidades
- **Tags** = Snapshots de versões funcionais

---

## 🚀 Comandos Essenciais

### 1️⃣ Antes de Começar uma Nova Feature

```bash
# Garantir que está na master atualizada
cd C:\Users\bruno\Documents\Black\Loter.IA\Prod\App
git checkout master
git pull

# Ver versões estáveis disponíveis
git tag
```

---

### 2️⃣ Criar Branch para Nova Feature

```bash
# Criar e mudar para nova branch
git checkout -b feature/nome-da-feature

# Exemplos de nomes de branches:
# feature/new-dashboard
# feature/export-pdf
# feature/payment-integration
# bugfix/lotomania-display
# improvement/loading-performance
```

---

### 3️⃣ Desenvolver e Testar Localmente

```bash
# Instalar dependências (se necessário)
cd app
npm install

# Rodar em modo desenvolvimento (localhost:5173)
npm run dev

# Testar TUDO antes de fazer commit
# - Navegação
# - Funcionalidades antigas
# - Nova funcionalidade
# - Responsividade
# - Console sem erros
```

---

### 4️⃣ Fazer Commits na Branch

```bash
# Adicionar mudanças
git add .

# OU adicionar arquivos específicos
git add app/src/components/NewComponent.tsx

# Commit com mensagem descritiva
git commit -m "feat: Adiciona nova dashboard com gráficos"

# Tipos de commit:
# feat: Nova funcionalidade
# fix: Correção de bug
# refactor: Refatoração de código
# style: Mudanças de estilo/formatação
# docs: Documentação
# test: Testes
```

---

### 5️⃣ Fazer Build e Testar

```bash
# Build de produção
npm run build

# Se build falhar, corrija antes de fazer merge!
# Se build passar, teste o app buildado

# Ver diferenças com master
git diff master
```

---

### 6️⃣ Merge na Master (Se Tudo OK)

```bash
# Voltar para master
git checkout master

# Atualizar master (caso tenha mudado)
git pull

# Merge da feature
git merge feature/nome-da-feature

# Se houver conflitos, resolva e:
git add .
git commit -m "Merge feature/nome-da-feature"

# Push para produção
git push
```

---

### 7️⃣ Limpar Branch Antiga

```bash
# Deletar branch local (depois do merge)
git branch -d feature/nome-da-feature

# Deletar branch remota (se enviou)
git push origin --delete feature/nome-da-feature
```

---

## 🆘 Comandos de Emergência

### ❌ Se Algo Quebrar em Produção

```bash
# OPÇÃO 1: Voltar para última versão estável
git checkout master
git reset --hard v1.0.0
git push --force

# OPÇÃO 2: Desfazer último commit
git revert HEAD
git push

# OPÇÃO 3: Voltar N commits atrás
git reset --hard HEAD~3  # Volta 3 commits
git push --force
```

---

### 🔄 Se Mudou de Ideia Durante Desenvolvimento

```bash
# Descartar todas as mudanças não commitadas
git checkout .

# Voltar para master e deletar branch
git checkout master
git branch -D feature/nome-da-feature
```

---

### 🔍 Verificar Estado Atual

```bash
# Ver branch atual
git branch

# Ver diferenças não commitadas
git diff

# Ver histórico de commits
git log --oneline --graph --all

# Ver tags (versões estáveis)
git tag -l
```

---

## 📊 Fluxo Visual

```
master (produção) ──●──────────●────────────●───>
                    │          │            │
                    │      merge OK     merge OK
                    │          │            │
feature/X          ●●●●●──────┘            │
                                            │
feature/Y                         ●●●●●●●──┘
```

---

## 🏷️ Criar Novas Versões Estáveis

```bash
# Quando tudo estiver 100% funcionando
git tag -a v1.1.0 -m "Nova feature X implementada"
git push origin v1.1.0

# Convenção de versionamento:
# v1.0.0 = Major.Minor.Patch
# Major: Mudanças grandes/breaking changes
# Minor: Novas features
# Patch: Correções de bugs
```

---

## 🎯 Boas Práticas

### ✅ FAZER
- ✅ Sempre trabalhar em branches separadas
- ✅ Testar TUDO localmente antes de merge
- ✅ Fazer commits pequenos e frequentes
- ✅ Mensagens de commit descritivas
- ✅ Criar tag quando versão estiver estável
- ✅ Fazer pull antes de começar nova feature

### ❌ NÃO FAZER
- ❌ Commitar direto na master
- ❌ Fazer push sem testar build
- ❌ Merge sem testar localmente
- ❌ Usar git push --force na master (exceto emergências)
- ❌ Deletar branch antes de confirmar que merge funcionou

---

## 🚨 Checklist Antes de Fazer Merge

- [ ] Build passou sem erros (`npm run build`)
- [ ] App roda sem erros no console (F12)
- [ ] Todas as páginas navegam corretamente
- [ ] Funcionalidades antigas continuam funcionando
- [ ] Nova funcionalidade funciona como esperado
- [ ] Código está documentado/comentado
- [ ] Não há console.logs desnecessários

---

## 📞 Comandos Úteis

```bash
# Ver branches locais
git branch

# Ver branches remotas
git branch -r

# Ver todas as branches
git branch -a

# Trocar de branch
git checkout nome-da-branch

# Criar branch a partir de tag específica
git checkout -b hotfix/emergency v1.0.0

# Ver conteúdo de tag
git show v1.0.0

# Comparar duas branches
git diff master feature/X

# Ver arquivos modificados
git status

# Ver log resumido
git log --oneline -10
```

---

## 🎓 Exemplos Práticos

### Exemplo 1: Adicionar Nova Dashboard

```bash
# 1. Criar branch
git checkout -b feature/new-dashboard

# 2. Desenvolver...
# (criar arquivos, editar código)

# 3. Testar
npm run dev

# 4. Commit
git add .
git commit -m "feat: Nova dashboard com gráficos interativos"

# 5. Build
npm run build

# 6. Merge
git checkout master
git merge feature/new-dashboard
git push

# 7. Limpar
git branch -d feature/new-dashboard
```

---

### Exemplo 2: Corrigir Bug Urgente

```bash
# 1. Criar branch de bugfix
git checkout -b bugfix/lotomania-crash

# 2. Corrigir bug
# (editar arquivo problemático)

# 3. Testar
npm run dev

# 4. Commit
git add .
git commit -m "fix: Corrige crash ao gerar Lotomania"

# 5. Merge rápido
git checkout master
git merge bugfix/lotomania-crash
git push

# 6. Tag de patch
git tag -a v1.0.1 -m "Hotfix: Lotomania crash"
git push origin v1.0.1
```

---

## 🔗 Links Úteis

- Git Documentation: https://git-scm.com/doc
- Conventional Commits: https://www.conventionalcommits.org/
- GitHub Repo: https://github.com/brunofalci00/loteriAI

---

## 📌 Versões Estáveis

| Tag | Data | Descrição |
|-----|------|-----------|
| v1.0.0 | 2025-11-03 | Base estável - Lotomania funcionando |

---

**Lembre-se:** Se tiver dúvida, pergunte antes de fazer push! 💡
