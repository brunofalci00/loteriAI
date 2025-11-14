# 🚀 Build & Deployment

## 🏗️ Fluxo Completo de Build

### 1. Local Development

```bash
# Instalar dependências de todos os projetos
cd LP_loteri.AI
npm run install:all

# Rodar desenvolvimento
cd app && npm run dev     # App React na porta 5173
cd quiz-app && npm run dev # Quiz React na porta 5174
```

### 2. Build Local

```bash
# Buildar tudo
cd LP_loteri.AI
npm run build

# Isto executa:
# 1. npm run build:quiz    → quiz-app/dist/
# 2. npm run build:app     → app/dist/
# 3. npm run build:organize → LP_loteri.AI/dist/
```

### 3. Resultado do Build

```
LP_loteri.AI/dist/
├── index.html          (Landing Page)
├── quiz.html           (Quiz app renamed)
├── thanks.html         (Thanks page)
├── styles.css
├── assets/             (Imagens, vídeos, audio)
└── app/                (App React)
    ├── index.html
    ├── assets/
    └── ... (app bundles)
```

---

## 📋 Scripts de Build

### vercel.json (Root)

```json
{
  "buildCommand": "cd LP_loteri.AI && npm run build",
  "installCommand": "cd LP_loteri.AI && npm run install:all",
  "outputDirectory": "LP_loteri.AI/dist"
}
```

### package.json (LP_loteri.AI)

```json
{
  "scripts": {
    "install:quiz": "cd quiz-app && npm install",
    "install:app": "cd app && npm install",
    "install:all": "npm run install:quiz && npm run install:app",
    "build:quiz": "cd quiz-app && npm run build",
    "build:app": "cd app && npm run build",
    "build:organize": "node scripts/organize-dist.js",
    "build": "npm run build:quiz && npm run build:app && npm run build:organize"
  }
}
```

### scripts/organize-dist.js (CRÍTICO)

```javascript
// Limpa dist/ anterior
// Copia LP_loteri.AI/public → dist/ (raiz)
// Copia quiz-app/dist/index.html → dist/quiz.html
// Copia app/dist → dist/app/
// Cria estrutura final para Vercel
```

**Resultado:** Estrutura unificada servida pelo Vercel

---

## 🌐 Roteamento (vercel.json)

### Rewrites Configuradas

```json
"rewrites": [
  {
    "source": "/quiz",
    "destination": "/quiz.html"
  },
  {
    "source": "/app/:path((?!.*\\.).*)",
    "destination": "/app/index.html"
  },
  {
    "source": "/app",
    "destination": "/app/index.html"
  }
]
```

### Mapa de URLs

| URL | Arquivo Servido | Descrição |
|-----|-----------------|-----------|
| `/` | `index.html` | Landing Page |
| `/quiz` | `quiz.html` | Quiz App |
| `/thanks` | `thanks.html` | Thanks Page |
| `/app` | `app/index.html` | App React |
| `/app/*` | `app/index.html` | App React (SPA routing) |

---

## 🚀 Deploy via Vercel (Automático)

### Fluxo Completo

```
1. Developer faz git push origin feat/branch
                ↓
2. GitHub webhook notifica Vercel
                ↓
3. Vercel lê /vercel.json (raiz)
                ↓
4. Vercel executa:
   buildCommand: "cd LP_loteri.AI && npm run build"
                ↓
5. npm run build executa:
   a. npm run build:quiz      (Vite build)
   b. npm run build:app       (Vite build)
   c. npm run build:organize  (Reorganiza)
                ↓
6. Resultado em LP_loteri.AI/dist/
                ↓
7. Vercel deploy desta pasta
                ↓
8. https://fqdigital.com.br atualiza
                ↓
9. Cache clearing (se configurado)
                ↓
✅ Deploy completo (2-3 minutos)
```

### Status do Deploy

**URL:** https://vercel.com/dashboard

**Tempo:** ~2-3 minutos

**Triggers:**
- ✅ Push em master/main
- ✅ Push em feat/* (preview)
- ✅ Push em develop (staging)

---

## 📊 Build Output

### Sizes

```
Landing Page HTML/CSS:  ~50 KB
Quiz App (Minified):    ~200 KB
App React (Minified):   ~1 MB
Total:                  ~1.2 MB
```

### Modules

```
App React:    2747 modules
Vite build:   ✅ Zero errors
Tree shaking: ✅ Ativado
Minification: ✅ Ativado
```

---

## 🔧 Configurações Importantes

### Environment Variables

**LP_loteri.AI/.env**

```
VITE_SUPABASE_URL=https://aaqthgqsuhyagsrlnyqk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MEGA_EVENT_ENABLED=true
```

**Vercel Environment Variables**

Configurar em: https://vercel.com/[project]/settings/environment-variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_MEGA_EVENT_ENABLED
```

### Vite Config (app)

**LP_loteri.AI/app/vite.config.ts**

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  }
});
```

### Vite Config (quiz-app)

**LP_loteri.AI/quiz-app/vite.config.ts**

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
  build: {
    outDir: 'dist'
  }
});
```

---

## 🐛 Troubleshooting Build

### Erro: "Module not found"

```bash
# Solução
cd LP_loteri.AI
npm run install:all
npm run build
```

### Erro: "Vite build failed"

```bash
# Verificar qual projeto falhou
cd app && npm run build      # Se falhar aqui
cd quiz-app && npm run build # Se falhar aqui
```

### Erro: "organize-dist.js failed"

```bash
# Verificar se dist/ foi criado
ls LP_loteri.AI/app/dist
ls LP_loteri.AI/quiz-app/dist

# Se não existir, buildar novamente
npm run build:app
npm run build:quiz
npm run build:organize
```

### Erro: "Timeout no Vercel"

```bash
# Aumentar timeout em vercel.json
{
  "buildCommand": "cd LP_loteri.AI && npm run build",
  "maxDuration": 600  # 10 minutos
}
```

---

## ✅ Checklist de Deploy

- [ ] Todos os tests passando
- [ ] Sem console errors
- [ ] Build passou localmente
- [ ] Código commitado
- [ ] Branch pushed para origin
- [ ] Vercel build passou
- [ ] Preview URL funcionando
- [ ] Testas todas as pages
- [ ] Testar responsividade
- [ ] Verificar analytics
- [ ] Produção atualizada

---

## 📊 Pipeline CI/CD (Se configurado)

### GitHub Actions (Futuro)

```yaml
name: Build & Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd LP_loteri.AI && npm run install:all
      - run: cd LP_loteri.AI && npm run build
      - run: npm run test  # Se houver
```

**Status:** ⚠️ Não configurado ainda

---

## 🚨 Rollback de Deploy

Se algo der errado em produção:

### 1. Via Vercel Dashboard
- Ir em Deployments
- Clicar em deploy anterior
- Promote to Production

### 2. Via Git
```bash
git revert <commit-hash>
git push origin main
```

**Tempo:** ~2-3 minutos

---

## 📈 Performance

### Lighthouse Scores
- Performance: 85+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 95+

### Bundle Size
```
App React:  ~300 KB (gzipped)
Quiz App:   ~150 KB (gzipped)
Landing:    ~50 KB (gzipped)
Total:      ~500 KB (gzipped)
```

### Optimization
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Image optimization
- ✅ CSS purging

---

## 🔒 Security

### Build Security
- [ ] Dependências atualizadas
- [ ] Sem hardcoded secrets
- [ ] Sem console.log em produção
- [ ] HTTPS ativado
- [ ] CORS configurado

### Ambiente de Produção
- [ ] `.env` não em git
- [ ] Secrets em Vercel
- [ ] API keys protegidas
- [ ] Rate limiting ativado
- [ ] DDOS protection

---

## 📞 Suporte

**Problemas comuns?**

1. Verificar logs do Vercel
2. Verificar build local
3. Verificar environment variables
4. Verificar dependências

**Documentação:**
- https://vercel.com/docs
- https://vitejs.dev/guide/
- https://react.dev/

---

**Última atualização:** Novembro 2025
