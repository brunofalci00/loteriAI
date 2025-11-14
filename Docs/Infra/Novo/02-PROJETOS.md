# 📦 Detalhamento de Projetos/Aplicações

## 🔍 Visão Geral dos Projetos

O repositório contém **3 projetos principais**, sendo 2 ativos e 1 descontinuado:

1. ✅ **Landing Page** - HTML/CSS estático
2. ✅ **App React** - Aplicação principal
3. ✅ **Quiz App** - Quiz interativo
4. ⚠️ **App/** - Projeto antigo (descontinuado)

---

## 1. 📄 Landing Page

### Localização
```
LP_loteri.AI/public/
```

### Tipo
**HTML/CSS/JavaScript** (Não é React)

### Propósito
- Captação de leads
- Demonstração de produto
- Vídeo tutorial
- Formulário de email
- Integração Facebook CAPI

### Arquivos Principais
```
public/
├── index.html          (Landing page principal)
├── quiz.html           (Versão old do quiz)
├── thanks.html         (Página de agradecimento)
├── styles.css          (Estilos compartilhados)
├── fb-capi.js          (Facebook Conversions API)
│
└── assets/
    ├── videos/         (Vídeos MP4)
    ├── audio/          (Áudio MP3)
    ├── images/         (Imagens PNG, JPG, SVG)
    └── icons/          (Ícones)
```

### Tecnologias
- HTML5
- CSS3
- Vanilla JavaScript
- Facebook CAPI (Pixel tracking)

### Features
- ✅ Responsivo (Mobile, Tablet, Desktop)
- ✅ Vídeo demonstrativo
- ✅ Formulário de email
- ✅ Dark mode support
- ✅ Animations CSS
- ✅ SEO optimizado

### URL
**Produção:** https://fqdigital.com.br/
**Staging:** N/A (Sem staging específico)

### Deployment
- Servida via Vercel
- Arquivo estático (sem build)
- Rewrite em vercel.json: `/` → `index.html`

---

## 2. 🧮 App React Principal

### Localização
```
LP_loteri.AI/app/
```

### Tipo
**Vite + React 18 + TypeScript**

### Estatísticas
| Métrica | Valor |
|---------|-------|
| Arquivos TS/TSX | 145 |
| Componentes | 40+ |
| Páginas/Rotas | 12 |
| Custom Hooks | 14 |
| Serviços | 14 |
| Tipos TypeScript | 3 arquivos |
| Contextos | 2 |

### Estrutura de Pastas
```
app/src/
├── components/         (40+ componentes)
│   ├── ui/            (Shadcn components)
│   ├── AnalysisDetailsModal.tsx
│   ├── CreditsDisplay.tsx
│   ├── CreditsDisplayMega.tsx
│   ├── DetailedAnalysisModal.tsx
│   ├── FeedbackModal.tsx
│   ├── FeedbackFAB.tsx
│   ├── FirstGenerationModal.tsx
│   ├── GenerationHistoryModal.tsx
│   ├── GenerationSelector.tsx
│   ├── Header.tsx
│   ├── HighScoreBanner.tsx
│   ├── LoadingAnalysis.tsx
│   ├── LotteryCard.tsx
│   ├── ContestCard.tsx
│   ├── ManualGameCreationForm.tsx
│   ├── MegaEventHero.tsx
│   ├── ProtectedRoute.tsx
│   ├── RegenerateButton.tsx
│   ├── SaveGameModal.tsx
│   ├── ShareButton.tsx
│   ├── Step1_LotterySelector.tsx
│   ├── Step2_ContestSelector.tsx
│   ├── Step3_NumberGrid.tsx
│   ├── Step4_AnalysisResult.tsx
│   └── ... (mais)
│
├── pages/              (12 páginas)
│   ├── Auth.tsx                        (Login/Sign-up)
│   ├── CreatePassword.tsx              (Reset password)
│   ├── Dashboard.tsx                   (Home principal)
│   ├── EmailConfirmation.tsx           (Email confirmation)
│   ├── HowItWorks.tsx                  (How to guide)
│   ├── Lottery.tsx                     (Análise principal)
│   ├── LotteryContests.tsx             (Concursos)
│   ├── ManualGameCreationPage.tsx      (Criar jogo manual)
│   ├── MegaEvent.tsx                   (Mega da Virada)
│   ├── NotFound.tsx                    (404)
│   ├── Profile.tsx                     (Perfil)
│   └── SavedGamesPage.tsx              (Jogos salvos)
│
├── hooks/              (14 custom hooks)
│   ├── useClickSound.ts
│   ├── useFeedbackModal.ts
│   ├── useGenerationHistory.ts
│   ├── useLotteryAnalysis.ts
│   ├── useLotteryDrawInfo.ts
│   ├── useManualGameCreation.ts
│   ├── useMegaTokens.ts                (Novo)
│   ├── usePaymentGuard.ts
│   ├── useRegenerateCombinations.ts
│   ├── useSavedGames.ts
│   ├── useTourGuide.ts
│   ├── useUserCredits.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── services/           (14 serviços)
│   ├── creditsService.ts
│   ├── exportService.ts
│   ├── feedbackService.ts
│   ├── gameVariationsService.ts
│   ├── generationService.ts
│   ├── lotteryAnalysis.ts
│   ├── lotteryApi.ts
│   ├── lotteryHistory.ts
│   ├── megaTokensService.ts            (Novo)
│   ├── manualGameAnalysisService.ts
│   ├── milestoneService.ts
│   ├── savedGamesService.ts
│   ├── shareTrackingService.ts
│   └── ... (mais)
│
├── types/              (Tipos TypeScript)
│   ├── analysis.ts
│   ├── lottery.ts
│   ├── share.ts
│   └── currency.ts                     (Novo)
│
├── contexts/           (React Contexts)
│   ├── AuthContext.tsx
│   └── MegaEventContext.tsx            (Novo)
│
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
│
├── config/
│   ├── features.ts         (Feature flags)
│   ├── megaEvent.ts        (Config Mega)
│   └── lotteryConfig.ts
│
├── utils/
│   ├── edgeFunctionRetry.ts
│   └── shareTrackingClient.ts
│
├── lib/
│   └── cn.ts               (TailwindCSS utilities)
│
├── assets/
│   └── (Imagens, ícones)
│
├── App.tsx                 (Root component)
├── main.tsx                (Ponto de entrada)
└── index.css               (Estilos globais)
```

### Páginas (12)

| Página | Rota | Descrição |
|--------|------|-----------|
| Auth | `/auth`, `/` | Login/Sign-up |
| CreatePassword | `/criar-senha` | Reset password |
| Dashboard | `/dashboard` | Página principal |
| EmailConfirmation | `/email-confirmation` | Confirmar email |
| HowItWorks | `/how-it-works` | Guia de uso |
| Lottery | `/lottery/:type/analysis/:contestNumber` | Análise |
| LotteryContests | `/lottery/:type/contests` | Concursos |
| ManualGameCreation | `/criar-jogo` | Criar jogo manual |
| MegaEvent | `/mega-da-virada` | Mega da Virada |
| NotFound | `*` | 404 |
| Profile | `/profile` | Perfil do usuário |
| SavedGames | `/meus-jogos` | Jogos salvos |

### Features Principais

#### 1. Autenticação
- Supabase Auth (Email/Senha)
- JWT tokens automáticos
- Protected routes
- Context API para estado global

#### 2. Sistema de Créditos
- Créditos mensais renováveis
- Consumo por análise
- Display em tempo real
- Validação de saldo

#### 3. Análise de Loterias
- Busca de próximos concursos
- Análise de combinações
- Geração de variações com IA
- Histórico de análises

#### 4. Jogos Salvos
- Salvar análises
- Carregar análises anteriores
- Deletar análises
- Exportar dados

#### 5. Compartilhamento com Tracking
- Link compartilháveis
- Rastreamento de clicks
- Analytics
- Referral system

#### 6. Mega da Virada (Novo)
- Banner especial no Dashboard
- Página dedicada com timeline
- Análises exclusivas
- Fluxo manual de 2 estágios

#### 7. Feedback de Usuários
- Modal de feedback
- Coleta de sugestões
- Envio para Supabase

### Tecnologias
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "vite": "^5.4.19",
  "typescript": "^5.8.3",
  "tailwindcss": "^3.4.17",
  "shadcn-ui": "latest",
  "supabase": "^2.76.1",
  "@tanstack/react-query": "^5.83.0",
  "react-hook-form": "^7.61.1",
  "lucide-react": "^0.462.0",
  "sonner": "^1.7.4"
}
```

### URL
**Produção:** https://fqdigital.com.br/app
**Rota base:** `/app/*`

---

## 3. 🎯 Quiz App

### Localização
```
LP_loteri.AI/quiz-app/
```

### Tipo
**Vite + React 18 + TypeScript**

### Estatísticas
| Métrica | Valor |
|---------|-------|
| Arquivos TS/TSX | 78 |
| Componentes | 7+ |
| Linhas de Código | ~3,000 |

### Propósito
- Quiz interativo para captação de leads
- Efeitos visuais e animations
- Standalone (pode rodar independente)
- Integração com Supabase

### Estrutura
```
quiz-app/src/
├── components/
│   ├── CoinCounter.tsx
│   ├── ConfettiEffect.tsx
│   ├── ExitIntentOverlay.tsx
│   ├── NavLink.tsx
│   ├── slides/
│   │   ├── Slide1_Welcome.tsx
│   │   ├── Slide2_Questions.tsx
│   │   └── ... (mais slides)
│   └── ui/
│
├── hooks/
│   └── useQuizLogic.ts
│
├── pages/
│   └── QuizPage.tsx
│
├── lib/
│   └── quizData.ts
│
├── App.tsx
└── main.tsx
```

### Features
- ✅ Multiple slides
- ✅ Coin counter animation
- ✅ Confetti effect
- ✅ Exit intent overlay
- ✅ Responsive design
- ✅ Dark mode

### URL
**Produção:** https://fqdigital.com.br/quiz
**Rota:** `/quiz`

---

## 4. ⚠️ App/ (Descontinuado)

### Localização
```
App/
```

### Status
**Descontinuado** - Substituído pela estrutura em LP_loteri.AI/

### Conteúdo
- 153 arquivos TypeScript/React
- Estrutura idêntica à versão anterior
- Mantido como referência histórica

### Por que foi descontinuado?
- Monorepo em LP_loteri.AI é mais escalável
- Facilita compartilhamento de dependências
- Melhor organização de múltiplos apps
- Pipeline de build mais eficiente

---

## 📊 Comparação de Projetos

| Aspecto | Landing Page | App React | Quiz App |
|---------|--------------|-----------|----------|
| **Tipo** | HTML/CSS | Vite + React | Vite + React |
| **Linguagem** | HTML/CSS/JS | TypeScript | TypeScript |
| **Arquivos** | ~10 | 145 | 78 |
| **Componentes** | N/A | 40+ | 7+ |
| **Build** | Sem build | Vite build | Vite build |
| **Deploy** | Estático | SPA | SPA |
| **URL** | / | /app | /quiz |
| **Status** | ✅ Ativo | ✅ Ativo | ✅ Ativo |

---

## 🔄 Integração Entre Projetos

```
Landing Page
    ↓ (Link de CTA)
    ├─→ Quiz App (/quiz)
    └─→ App React (/app)

Quiz App
    ↓ (Após conclusão)
    └─→ App React (/app)

App React
    ↓ (Compartilhamento)
    └─→ Landing Page (tracking)
```

---

## 🚀 Como Rodar Cada Projeto Localmente

### Landing Page
```bash
# Não precisa build, é estático
# Apenas abrir LP_loteri.AI/public/index.html
```

### App React
```bash
cd LP_loteri.AI/app
npm install
npm run dev
# Abrir http://localhost:5173
```

### Quiz App
```bash
cd LP_loteri.AI/quiz-app
npm install
npm run dev
# Abrir http://localhost:5174
```

### Todos os projetos
```bash
cd LP_loteri.AI
npm run install:all
npm run dev  # Se configurado
```

---

**Documentação atualizada:** Novembro 2025
