# 📚 Documentação Completa - Estrutura do Projeto Loter.IA

**Data:** 07/11/2025
**Autor:** Bruno Falci
**Versão:** 1.0

---

## 🎯 Visão Geral

Este projeto é um **monorepo** que contém dois projetos independentes mas integrados:

1. **Landing Page (LP)** - HTML/CSS/JS estático para captação de leads
2. **App React** - Aplicação completa em React/Vite para análise de loterias

Ambos são servidos pelo **mesmo domínio** (www.fqdigital.com.br) através do **Vercel**:
- **Raiz** (`/`) → Landing Page
- **Rota `/app`** → Aplicação React

---

## 📁 Estrutura de Diretórios

```
Prod/
├── vercel.json                    # ⚠️ CRÍTICO - Configuração principal do Vercel
├── LP_loteri.AI/                  # Projeto principal (LP + App)
│   ├── vercel.json                # Configuração de rewrites e headers
│   ├── package.json               # Scripts de build do monorepo
│   ├── public/                    # Landing Page (HTML estático)
│   │   ├── index.html            # LP principal
│   │   ├── fb-capi.js            # Helper para Meta CAPI
│   │   ├── thanks.html           # Página de agradecimento
│   │   ├── fb-capi.js            # Facebook Conversions API
│   │   ├── styles.css            # Estilos da LP
│   │   └── *.mp4, *.mp3          # Assets da LP
│   ├── quiz-app/                 # ✅ Novo: Quiz React (Vite)
│   │   ├── src/                  # Código-fonte do quiz
│   │   ├── public/               # Áudios e vídeos consumidos pelo quiz
│   │   └── dist/                 # Output (copiado para dist/quiz.html via script)
│   ├── app/                       # Aplicação React
│   │   ├── package.json          # Dependências do React app
│   │   ├── vite.config.ts        # Configuração do Vite
│   │   ├── src/                  # Código fonte React
│   │   └── dist/                 # Build output do React (gerado)
│   ├── scripts/
│   │   └── organize-dist.js      # ⚠️ CRÍTICO - Organiza LP + App no dist/
│   └── dist/                      # ⚠️ Output final servido pelo Vercel
│       ├── index.html            # LP na raiz
│       ├── quiz.html, thanks.html, etc.
│       └── app/                  # App React
│           └── index.html        # App React
├── App/                           # ⚠️ NÃO É USADO - Projeto antigo
└── Roadmap/                       # Documentação de planejamento
```

---

## ⚙️ Como Funciona o Build

### 1. Vercel Detecta o Push

Quando você faz `git push`, o Vercel:
1. Lê o **`vercel.json` NA RAIZ** do repositório
2. Executa os comandos especificados nele

### 2. Configuração do `vercel.json` (Raiz)

**Localização:** `C:\Users\bruno\Documents\Black\Loter.IA\Prod\vercel.json`

```json
{
  "buildCommand": "cd LP_loteri.AI && npm install && npm run build",
  "outputDirectory": "LP_loteri.AI/dist",
  "installCommand": "echo 'Install will be done in build command'"
}
```

**O que faz:**
- **buildCommand:** Entra em `LP_loteri.AI/` e roda `npm install && npm run build`
- **outputDirectory:** Diz ao Vercel para servir o conteúdo de `LP_loteri.AI/dist/`
- **installCommand:** Placeholder (o install real é feito no buildCommand)

### 3. Script de Build (`LP_loteri.AI/package.json`)

```json
{
  "scripts": {
    "install": "cd app && npm install",
    "build:app": "cd app && npm run build",
    "build:organize": "node scripts/organize-dist.js",
    "build": "npm run install && npm run build:app && npm run build:organize"
  }
}
```

**Ordem de execução:**
1. `npm run install` → Instala dependências do React app
2. `npm run build:app` → Builda o React app (Vite) para `app/dist/`
3. `npm run build:organize` → Executa o script que organiza tudo

### 4. Script `organize-dist.js` (⚠️ CRÍTICO)

**Localização:** `LP_loteri.AI/scripts/organize-dist.js`

**O que faz:**
1. Limpa a pasta `dist/` anterior
2. Copia **TODO** o conteúdo de `public/` para `dist/` (raiz)
3. Copia `app/dist/` para `dist/app/`

**Resultado final:**
```
LP_loteri.AI/dist/
├── index.html              ← Landing Page (raiz)
├── quiz.html
├── thanks.html
├── styles.css
├── fb-capi.js
├── *.mp4, *.mp3
└── app/                    ← App React
    ├── index.html
    ├── assets/
    │   ├── index-*.js
    │   └── index-*.css
    └── favicon.ico
```

### 5. Vercel Serve o Conteúdo

O Vercel pega `LP_loteri.AI/dist/` e serve:
- `www.fqdigital.com.br/` → `dist/index.html` (LP)
- `www.fqdigital.com.br/quiz` → `dist/quiz.html`
- `www.fqdigital.com.br/app` → `dist/app/index.html` (React)
- `www.fqdigital.com.br/app/dashboard` → `dist/app/index.html` (React Router)

---

## 🔧 Configuração do Vercel (Dashboard)

### Settings → General

#### 1. Root Directory
- **Valor:** `LP_loteri.AI`
- **Por quê:** O Vercel precisa saber que o projeto está dentro dessa pasta

#### 2. Build & Development Settings
- **Framework Preset:** Other (ou deixe auto-detect)
- **Build Command:** ❌ NÃO SOBRESCREVER (usa do vercel.json)
- **Output Directory:** ❌ NÃO SOBRESCREVER (usa do vercel.json)
- **Install Command:** ❌ NÃO SOBRESCREVER (usa do vercel.json)

⚠️ **IMPORTANTE:** Os overrides só devem ser usados se o `vercel.json` na raiz não estiver funcionando.

### Settings → Domains

Domínios configurados:
- `www.fqdigital.com.br` (Production)
- `fqdigital.com.br` (redirect para www)
- `loteri-ai-git-master-*.vercel.app` (branch preview)

---

## 🔄 Rewrites e Roteamento

**Localização:** `LP_loteri.AI/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/app/:path((?!.*\\.).*)",
      "destination": "/app/index.html"
    },
    {
      "source": "/app",
      "destination": "/app/index.html"
    }
  ]
}
```

**O que faz:**
- Qualquer rota que comece com `/app` (sem extensão de arquivo) → `app/index.html`
- Permite que o React Router funcione com rotas como:
  - `/app/dashboard`
  - `/app/auth`
  - `/app/lottery/megasena`

---

## 🚀 Workflow de Deploy

### Para fazer alterações na Landing Page:

1. Edite os arquivos em `LP_loteri.AI/public/`
2. Commit e push:
   ```bash
   git add LP_loteri.AI/public/
   git commit -m "feat: Atualizar LP"
   git push origin master
   ```
3. O Vercel vai:
   - Rodar o build completo (~14-24 segundos)
   - Copiar os novos arquivos de `public/` para `dist/`
   - Deploy automático

### Para fazer alterações no App React:

1. Edite os arquivos em `LP_loteri.AI/app/src/`
2. Teste localmente:
   ```bash
   cd LP_loteri.AI/app
   npm run dev  # localhost:5173
   ```
3. Commit e push:
   ```bash
   git add LP_loteri.AI/app/
   git commit -m "feat: Atualizar App React"
   git push origin master
   ```
4. O Vercel vai:
   - Rodar o build completo
   - Buildar o React app com Vite
   - Organizar no `dist/app/`
   - Deploy automático

### Para testar o build localmente:

```bash
cd LP_loteri.AI
npm run build
```

Isso vai criar o `dist/` exatamente como o Vercel faz.

---

## ⚠️ ARQUIVOS CRÍTICOS - NÃO DELETAR

### 1. `vercel.json` (RAIZ do repositório)
- **Path:** `Prod/vercel.json`
- **Por quê:** Sem ele, o Vercel não sabe como buildar o projeto
- **Sintomas se deletado:** Build de 900ms apenas, erro 404 em tudo

### 2. `LP_loteri.AI/scripts/organize-dist.js`
- **Por quê:** Organiza LP + App no mesmo `dist/`
- **Sintomas se deletado:** LP e App não aparecem juntos

### 3. `LP_loteri.AI/package.json`
- **Por quê:** Define os scripts de build
- **Sintomas se alterado:** Build pode quebrar

### 4. `LP_loteri.AI/vercel.json`
- **Por quê:** Define rewrites para o React Router funcionar
- **Sintomas se deletado:** `/app/auth`, `/app/dashboard` dão 404

---

## 🐛 Troubleshooting

### Problema: Site inteiro dando 404

**Causa:** `vercel.json` na raiz foi deletado ou está incorreto

**Solução:**
1. Verificar se existe `Prod/vercel.json`
2. Conteúdo deve ser:
   ```json
   {
     "buildCommand": "cd LP_loteri.AI && npm install && npm run build",
     "outputDirectory": "LP_loteri.AI/dist",
     "installCommand": "echo 'Install will be done in build command'"
   }
   ```
3. Commit e push

### Problema: Build rápido demais (< 1 segundo)

**Causa:** Vercel não está executando o buildCommand

**Diagnóstico:**
- Ver logs do deployment no Vercel
- Se mostrar "Build Completed in /vercel/output [900ms]" → problema!

**Solução:**
1. Verificar Root Directory = `LP_loteri.AI`
2. Verificar se `vercel.json` na raiz existe
3. Fazer Redeploy no dashboard do Vercel

### Problema: LP funciona mas App dá 404

**Causa:** Rewrites não estão funcionando ou `dist/app/` não foi gerado

**Solução:**
1. Verificar se `LP_loteri.AI/vercel.json` tem os rewrites
2. Verificar nos logs se "App React copiado para dist/app/" aparece
3. Verificar se `LP_loteri.AI/app/dist/` existe localmente após build

### Problema: `/app/dashboard` funciona mas `/app/auth` dá 404

**Causa:** Rewrite está funcionando, mas o React Router ou componente Auth tem problema

**Solução:**
1. Verificar se a rota está definida no React Router
2. Verificar se o componente Auth existe
3. Testar localmente: `cd LP_loteri.AI/app && npm run dev`

### Problema: Alterações na LP não aparecem no site

**Causa:** Cache do navegador ou Vercel servindo build antigo

**Solução:**
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Testar em aba anônima
3. Verificar no Vercel se o último deployment é o esperado
4. Forçar Redeploy no Vercel

---

## 📊 Como Verificar se o Deploy Funcionou

### 1. Logs do Vercel (Dashboard)

Um build **bem-sucedido** deve mostrar:

```
Running "install" command: echo 'Install will be done in build command'
Install will be done in build command

> loteriAI-monorepo@1.0.1 build
> npm run install && npm run build:app && npm run build:organize

> loteriAI-monorepo@1.0.1 install
> cd app && npm install

up to date, audited 397 packages in 910ms

> loteriAI-monorepo@1.0.1 build:app
> cd app && npm run build

vite v5.4.19 building for production...
✓ 2737 modules transformed.
✓ built in 8.12s

> loteriAI-monorepo@1.0.1 build:organize
> node scripts/organize-dist.js

🔨 Organizando arquivos de build...
✓ dist/ criado
✓ Landing Page copiada para dist/ (raiz)
✓ App React copiado para dist/app/
✓ App index.html validado
✓ Landing Page index.html validado (raiz)

✅ Build organizado com sucesso!
```

**Duração esperada:** 14-24 segundos

### 2. Testar no Navegador

- ✅ `www.fqdigital.com.br/` → Mostra a Landing Page
- ✅ `www.fqdigital.com.br/quiz` → Mostra o quiz
- ✅ `www.fqdigital.com.br/app` → Mostra o App React
- ✅ `www.fqdigital.com.br/app/dashboard` → Rota do React funciona
- ✅ `www.fqdigital.com.br/app/auth` → Rota do React funciona

---

## 🔐 Variáveis de Ambiente

### Landing Page
- Variáveis são hardcoded no `public/fb-capi.js`
- Facebook Pixel ID: `369969430611939`

### App React
- **Path:** `LP_loteri.AI/app/.env`
- Variáveis Supabase:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

⚠️ O `.env` está no `.gitignore` - não é commitado por segurança.

---

## 📝 Commits Importantes

### Commit que funciona (referência)
- **Hash:** `76dab47`
- **Mensagem:** "fix: Consolidar install no buildCommand do Vercel"
- **O que tinha:** `vercel.json` na raiz funcionando

### Commit atual
- **Hash:** `eb20b29`
- **Mensagem:** "fix: Restaurar vercel.json na raiz que fazia funcionar"

---

## 🎓 Boas Práticas

### ✅ FAZER

1. **Sempre testar localmente antes de commitar:**
   ```bash
   cd LP_loteri.AI
   npm run build
   ```

2. **Verificar o output `dist/` antes do push:**
   ```bash
   ls -la LP_loteri.AI/dist/
   ls -la LP_loteri.AI/dist/app/
   ```

3. **Fazer commits descritivos:**
   ```bash
   git commit -m "feat: Adicionar tracking de conversão na LP"
   ```

4. **Verificar os logs do Vercel após cada deploy**

5. **Testar em aba anônima após deploy** (evita cache)

### ❌ NÃO FAZER

1. ❌ Deletar ou modificar `vercel.json` na raiz
2. ❌ Deletar `scripts/organize-dist.js`
3. ❌ Modificar manualmente a pasta `dist/` (ela é gerada automaticamente)
4. ❌ Commitar a pasta `dist/` (está no `.gitignore`)
5. ❌ Modificar Root Directory no Vercel sem necessidade
6. ❌ Ativar overrides no Vercel sem entender o impacto
7. ❌ Fazer force push sem backup (pode perder `vercel.json`)

---

## 🆘 Em Caso de Emergência

### Se tudo quebrar:

1. **Encontrar último commit funcional:**
   ```bash
   git log --oneline -20
   ```

2. **Resetar para commit funcional:**
   ```bash
   git reset --hard <commit-hash>
   git push --force origin master
   ```

3. **Commits de referência que funcionam:**
   - `eb20b29` - Atual (07/11/2025)
   - `76dab47` - Testado e funcionando

4. **Redeploy no Vercel:**
   - Dashboard → Deployments → "..." → Redeploy

---

## 📞 Contatos e Links Úteis

- **Repositório GitHub:** https://github.com/brunofalci00/loteriAI
- **Vercel Project:** loteri-ai (brunofalci00)
- **Domínio Production:** https://www.fqdigital.com.br
- **Documentação Vercel:** https://vercel.com/docs

---

## 📅 Histórico de Mudanças

| Data       | Versão | Mudança                                      |
|------------|--------|----------------------------------------------|
| 07/11/2025 | 1.0    | Documentação inicial completa                |

---

**Última atualização:** 07/11/2025
**Mantido por:** Bruno Falci

---

## ⚡ Quick Reference

### Comandos Úteis

```bash
# Testar build localmente
cd LP_loteri.AI && npm run build

# Ver estrutura do dist
ls -la LP_loteri.AI/dist/
ls -la LP_loteri.AI/dist/app/

# Verificar vercel.json
cat vercel.json

# Ver último deploy
git log --oneline -1

# Forçar novo deploy (commit vazio)
git commit --allow-empty -m "chore: Force redeploy" && git push
```

### Arquivos Críticos Checklist

- [ ] `Prod/vercel.json` existe
- [ ] `LP_loteri.AI/vercel.json` existe
- [ ] `LP_loteri.AI/package.json` tem script "build"
- [ ] `LP_loteri.AI/scripts/organize-dist.js` existe
- [ ] Root Directory no Vercel = `LP_loteri.AI`

---

**FIM DA DOCUMENTAÇÃO**
