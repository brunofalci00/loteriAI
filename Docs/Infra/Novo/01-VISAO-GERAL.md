# 🎯 Visão Geral do Projeto LoteriAI

## Resumo Executivo

**LoteriAI** é uma plataforma completa para análise inteligente de loterias brasileiras, utilizando inteligência artificial e dados históricos. O projeto é um **monorepo** que contém:
- Uma **Landing Page** para captação de leads
- Uma **Aplicação React** completa com análises avançadas
- Um **Quiz interativo** para engajamento de usuários
- Sistema de **créditos** e **autenticação** integrado
- Suporte a evento especial **Mega da Virada**

---

## 📊 Estatísticas Gerais

| Métrica | Valor |
|---------|-------|
| Repositório | https://github.com/brunofalci00/loteriAI |
| Servidor | Vercel (https://fqdigital.com.br) |
| Linguagem | TypeScript 5.8 + React 18 |
| UI Framework | Shadcn-ui + TailwindCSS |
| Database | Supabase (PostgreSQL) |
| Arquivos TS/TSX | 376 arquivos |
| Linhas de Código | ~50,000+ |
| Componentes | 40+ |
| Páginas | 12 |
| Hooks Customizados | 14 |
| Serviços | 14 |
| Status | ✅ Ativo e em Desenvolvimento |

---

## 🏗️ Estrutura de Alto Nível

```
loteriAI (Monorepo)
│
├── 📱 Landing Page (HTML/CSS)
│   └── Captação de leads + Vídeo demo
│
├── 🧮 App React Principal
│   ├── Análise de loterias
│   ├── Sistema de créditos
│   ├── Autenticação Supabase
│   ├── Jogos salvos
│   ├── Compartilhamento com tracking
│   └── Mega da Virada
│
├── 🎯 Quiz App
│   └── Quiz interativo com efeitos
│
├── 🗄️ Database (Supabase)
│   ├── Autenticação
│   ├── Perfis de usuário
│   ├── Sistema de créditos
│   ├── Histórico de análises
│   └── Cloud Functions
│
└── 🚀 Deployment (Vercel)
    └── Pipeline automatizado
```

---

## 🎯 Objetivo Principal

Fornecer aos usuários ferramentas avançadas de análise para loterias brasileiras, com:
- **IA generativa** para geração de combinações
- **Dados históricos** para análise de padrões
- **Variações estratégicas** baseadas em estatísticas
- **Compartilhamento social** com rastreamento
- **Experiência premium** com sistema de créditos

---

## 🚀 Projetos/Aplicações

### 1. Landing Page (HTML/CSS)
**Localização:** `LP_loteri.AI/public/`
- Página de captação de leads
- Formulário de email
- Vídeo demonstrativo
- Integração Facebook CAPI
- Página de agradecimento (thanks.html)

**Status:** ✅ Ativo

### 2. App React Principal
**Localização:** `LP_loteri.AI/app/`
- 145 arquivos TypeScript
- 40+ componentes
- 12 páginas/rotas
- 14 custom hooks
- 14 serviços

**Features:**
- Dashboard com loterias
- Análise de combinações
- Geração de variações
- Histórico de análises
- Jogos salvos
- Perfil do usuário
- Compartilhamento com tracking
- Mega da Virada (evento especial)

**Status:** ✅ Ativo

### 3. Quiz App
**Localização:** `LP_loteri.AI/quiz-app/`
- 78 arquivos TypeScript
- 7+ componentes
- Quiz interativo
- Efeitos visuais (Confetti)

**Status:** ✅ Ativo

### 4. App/ (Projeto Antigo)
**Localização:** `App/`

**Status:** ⚠️ Descontinuado (mantido como referência)

---

## 🌐 URLs e Acesso

| Serviço | URL |
|---------|-----|
| Landing Page | https://fqdigital.com.br/ |
| App React | https://fqdigital.com.br/app |
| Quiz | https://fqdigital.com.br/quiz |
| GitHub | https://github.com/brunofalci00/loteriAI |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## 🔧 Stack Tecnológico

### Frontend
- **Vite** 5.4.19 - Build tool
- **React** 18.3 - UI Framework
- **TypeScript** 5.8 - Tipagem
- **TailwindCSS** 3.4 - Estilos
- **Shadcn-ui** - Componentes de UI
- **React Router** 6.30 - Roteamento
- **React Hook Form** 7.61 - Formulários
- **React Query** 5.83 - State management
- **Sonner** 1.7 - Toasts

### Backend
- **Supabase** - Database + Auth + Real-time
- **PostgreSQL** - Database
- **Node.js Functions** - Cloud Functions

### DevOps
- **Vercel** - Hosting
- **GitHub** - Versionamento
- **Git** - Controle de versão

---

## 📈 Features Principais

### ✅ Implementados
- [x] Autenticação com Supabase
- [x] Sistema de créditos
- [x] Análise de loterias
- [x] Geração de combinações com IA
- [x] Histórico de análises
- [x] Jogos salvos
- [x] Compartilhamento com tracking
- [x] Quiz interativo
- [x] Landing Page com vídeo
- [x] Mega da Virada
- [x] Feedback de usuários
- [x] Mobile responsive

### 🚧 Em Desenvolvimento
- [ ] Melhorias no fluxo de pós-compra
- [ ] Integração com mais payment providers
- [ ] Análises avançadas com machine learning
- [ ] Social features (friends, comparisons)

---

## 📊 Branching Strategy

### Branches Principais
```
master (Main/Production)
├── feat/mega-da-virada-refactoring (ATIVO)
├── claude/post-purchase-workflow-*
├── feature/fase2-fase3-complete
└── backup-before-integration
```

### Estratégia
- **main/master:** Produção
- **feat/:** Novas features
- **claude/:** Branches geradas por Claude Code
- **backup-:** Backups de estados anteriores

---

## 🚀 Pipeline de Deployment

```
Git Push
   ↓
Vercel Webhook
   ↓
Build: cd LP_loteri.AI && npm run build
   ↓
Organiza estrutura com organize-dist.js
   ↓
Deploy em https://fqdigital.com.br/
   ↓
Domínio customizado (fqdigital.com.br)
```

**Tempo de Deploy:** ~2-3 minutos

---

## 👥 Estrutura de Arquivos Principais

```
LP_loteri.AI/
├── app/                      (React App Principal)
│   ├── src/
│   │   ├── components/       (40+ componentes)
│   │   ├── pages/            (12 páginas)
│   │   ├── hooks/            (14 hooks)
│   │   ├── services/         (14 serviços)
│   │   ├── contexts/         (Auth, MegaEvent)
│   │   └── integrations/     (Supabase)
│   └── package.json
│
├── quiz-app/                 (React Quiz App)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── package.json
│
├── public/                   (Landing Page HTML)
│   ├── index.html
│   ├── quiz.html
│   ├── thanks.html
│   ├── styles.css
│   └── assets/
│
├── supabase/                 (Database)
│   ├── config.toml
│   ├── migrations/
│   └── functions/
│
├── scripts/                  (Build scripts)
│   └── organize-dist.js
│
└── dist/                     (Build output)
    ├── index.html
    ├── quiz.html
    ├── app/
    └── assets/
```

---

## 🔐 Segurança & Autenticação

### Autenticação
- **Supabase Auth** (Email/Senha)
- **JWT Tokens** (Automaticamente gerenciados)
- **Context API** (Estado global de autenticação)

### Proteção de Rotas
- **ProtectedRoute** component
- Redireciona usuários não autenticados
- Validação de token no cliente e servidor

---

## 💳 Sistema de Créditos

### Features
- **Créditos Mensais:** Renováveis a cada mês
- **Consumo:** 1 crédito por análise
- **Display:** Mostra créditos disponíveis em tempo real
- **Validação:** Verifica saldo antes de executar ação

### Tabela no Database
```sql
user_credits (
  user_id,
  credits_remaining,
  credits_total,
  last_reset_at
)
```

---

## 📱 Responsividade

- **Mobile:** Totalmente responsivo
- **Tablet:** Otimizado
- **Desktop:** Layout completo
- **Breakpoints:** Tailwind padrão (sm, md, lg, xl, 2xl)

---

## 🌙 Dark Mode

- **Suportado:** Sim
- **Implementação:** CSS variables + TailwindCSS
- **Persistência:** Local storage

---

## 📊 Analytics & Tracking

### Integrations
- **Facebook CAPI:** Conversions API
- **Compartilhamento:** Tracking de clicks
- **Feedback:** Coleta de feedback de usuários

---

## 🐛 Última Atualização

| Aspecto | Data |
|---------|------|
| Último commit | Há ~7 dias |
| Última feature | Mega da Virada |
| Status build | ✅ Passando (2747 módulos) |
| Deploy status | ✅ Ativo |

---

## 📚 Próximos Passos

1. Ler [02-PROJETOS.md](./02-PROJETOS.md) - Detalhamento de cada projeto
2. Entender [03-ESTRUTURA-PASTAS.md](./03-ESTRUTURA-PASTAS.md) - Organização
3. Aprender [04-BUILD-DEPLOY.md](./04-BUILD-DEPLOY.md) - Como faz deploy

---

## 🎓 Como Contribuir

1. Clonar repositório: `git clone https://github.com/brunofalci00/loteriAI.git`
2. Criar feature branch: `git checkout -b feat/sua-feature`
3. Instalar dependências: `npm run install:all`
4. Desenvolver localmente
5. Fazer commit: `git commit -m "feat: descrição"`
6. Push e criar PR

Veja [12-GUIA-RAPIDO.md](./12-GUIA-RAPIDO.md) para mais detalhes.

---

**Documentação atualizada:** Novembro 2025
