# Refatoração Completa - Mega da Virada 2024/2025
## Transição de Tokens Exclusivos para Sistema de Créditos Unificado

**Data:** 2025-01-13
**Versão:** 1.0
**Status:** Documentação para Implementação

---

## 1. RESUMO EXECUTIVO

### 1.1 Situação Atual
O evento da Mega da Virada foi implementado com:
- Sistema de **tokens exclusivos** (mega_tokens)
- **Paywall** com pacotes pagos (100 e 1000 tokens)
- **Economia paralela** separada dos créditos mensais
- Modal de compra integrado com Link.com (não implementado)
- Toggle manual entre "modo mega" e "modo créditos"

### 1.2 Nova Direção
Simplificar para:
- **Créditos únicos**: usar o sistema existente de `user_credits`
- **Sem paywall**: funcionalidades disponíveis para todos os usuários com créditos
- **Sem economia paralela**: mesmos 20 créditos mensais servem para tudo
- **Design dourado mantido**: preservar identidade visual do evento
- **UX simplificada**: navegação direta, sem modos ou toggles

### 1.3 Motivação
- **Complexidade reduzida**: um único sistema de créditos
- **Melhor experiência**: sem fricção de compra adicional
- **Maior adoção**: todos os usuários podem participar do evento
- **Manutenção simplificada**: menos código, menos bugs
- **Foco no valor**: análises e estratégias especiais da Mega, não venda de tokens

---

## 2. ANÁLISE COMPLETA DA ESTRUTURA ATUAL

### 2.1 Banco de Dados

#### Tabelas Criadas (A REMOVER)
```sql
-- supabase/migrations/20250210190000_add_mega_tokens.sql
public.mega_tokens
├─ user_id (PK, FK auth.users)
├─ balance (integer, default 0)
├─ plan_type ('limited' | 'unlimited')
├─ expires_at (timestamptz)
├─ updated_at (timestamptz)
└─ created_at (timestamptz)

public.mega_token_transactions
├─ id (PK uuid)
├─ user_id (FK auth.users)
├─ type ('purchase' | 'consumption' | 'adjustment' | 'refund')
├─ feature (text)
├─ amount (integer)
├─ contest_number (integer)
├─ lottery_type (text)
├─ metadata (jsonb)
└─ created_at (timestamptz)
```

#### Funções SQL (A REMOVER)
```sql
-- consume_mega_token(p_user_id, p_feature, p_amount, p_metadata)
-- Valida saldo, desconta tokens, registra transação

-- expire_mega_tokens_job()
-- Job cron para expirar tokens +7 dias após evento
```

#### Sistema Existente (MANTER E USAR)
```sql
public.user_credits
├─ user_id (PK, FK auth.users)
├─ credits_remaining (integer)
├─ credits_total (integer, default 20)
├─ last_reset_at (timestamptz)
├─ last_generation_at (timestamptz)
└─ updated_at (timestamptz)

-- consume_credit(p_user_id)
-- Valida saldo + cooldown, consome 1 crédito
```

### 2.2 Frontend - Arquivos Criados

#### Páginas
- `App/app/src/pages/MegaEvent.tsx` - **SIMPLIFICAR**
  - Página principal do evento
  - Remove modal de compra
  - Remove toggle de modo
  - Mantém conteúdo informativo e histórico

#### Componentes
- `App/app/src/components/MegaEventHero.tsx` - **MANTER**
  - Banner dourado no dashboard
  - Contagem regressiva
  - CTA para entrar no evento

- `App/src/components/TokenWalletCard.tsx` - **REMOVER**
  - Card de saldo de tokens
  - Botão "Adicionar Moedas"
  - Substituir por CreditsDisplay existente com tema dourado

#### Contextos
- `App/app/src/contexts/MegaEventContext.tsx` - **SIMPLIFICAR**
  - Remove conceito de "mega mode"
  - Mantém apenas flag se evento está ativo
  - Remove persistência de modo no localStorage

#### Hooks
- `App/app/src/hooks/useMegaTokens.ts` - **REMOVER**
  - Busca saldo de mega tokens
  - Usar `useUserCredits` existente

#### Serviços
- `App/src/services/megaTokensService.ts` - **REMOVER**
  - getMegaTokenBalance()
  - listMegaTokenTransactions()
  - consumeMegaTokens()

#### Configuração
- `App/app/src/config/megaEvent.ts` - **SIMPLIFICAR**
  ```typescript
  // ANTES
  export const MEGA_TOKENS_PER_ACTION = 20;

  // DEPOIS
  export const MEGA_EVENT_CONFIG = {
    enabled: true,
    eventDate: new Date("2024-12-31T23:59:59-03:00"),
    endDate: new Date("2025-01-07T23:59:59-03:00"),
    prizeAmount: "R$ 850 milhões"
  };
  ```

- `App/src/config/features.ts` - **MANTER**
  ```typescript
  export const isMegaEventEnabled =
    (import.meta.env?.VITE_MEGA_EVENT_ENABLED ?? "true") === "true";
  ```

#### Types
- `App/app/src/types/currency.ts` - **REMOVER**
  ```typescript
  // REMOVER conceito de CurrencyMode
  export type CurrencyMode = "credits" | "mega";
  export const CURRENCY_LABELS: Record<CurrencyMode, string> = {...};
  ```

### 2.3 Componentes Modificados (REVERTER PARCIALMENTE)

#### RegenerateButton.tsx
**Modificações atuais:**
- Aceita prop `currencyMode?: CurrencyMode`
- Usa `useMegaEvent()` para obter modo atual
- Valida mega tokens OU créditos conforme modo
- Chama `consumeMegaTokens()` ou `consumeCredit()`

**Mudanças necessárias:**
- Remover prop `currencyMode`
- Remover lógica de validação de mega tokens
- Usar apenas sistema de créditos
- Simplificar para sempre usar `consumeCredit()`

#### Step4_AnalysisResult.tsx
Similar ao RegenerateButton - aceita `currencyMode` e precisa ser simplificado.

#### useRegenerateCombinations.ts
**Modificações atuais:**
- Aceita `currencyMode` em params
- Lógica condicional para consumir tokens ou créditos

**Mudanças necessárias:**
- Remover lógica de mega tokens
- Sempre usar `consumeCredit()`

#### useManualGameCreation.ts
Similar - precisa remover lógica de currency mode.

---

## 3. PLANO DE REFATORAÇÃO DETALHADO

### FASE 1: Preparação e Análise (1-2 horas)
**Status:** ✅ CONCLUÍDO

1. ✅ Ler documentação existente
2. ✅ Mapear todos os arquivos relacionados
3. ✅ Identificar dependências
4. ✅ Criar este documento

### FASE 2: Banco de Dados (30 min)

#### 2.1 Criar Migration de Remoção
**Arquivo:** `App/supabase/migrations/20250113_remove_mega_tokens_system.sql`

```sql
-- Remover funções
drop function if exists public.expire_mega_tokens_job();
drop function if exists public.consume_mega_token(uuid, text, integer, jsonb);

-- Remover tabelas (e dados associados)
drop table if exists public.mega_token_transactions;
drop table if exists public.mega_tokens;

-- Comentário de auditoria
comment on schema public is
  'Mega tokens system removed on 2025-01-13. Event now uses unified user_credits.';
```

#### 2.2 Verificar Tipos Supabase
**Arquivo:** `App/src/integrations/supabase/types.ts`

Remover tipos gerados:
- `Tables<"mega_tokens">`
- `Tables<"mega_token_transactions">`

### FASE 3: Limpeza de Código Backend (1 hora)

#### 3.1 Remover Serviços
```bash
# Arquivos a deletar
App/src/services/megaTokensService.ts
```

#### 3.2 Remover Hooks
```bash
# Arquivos a deletar
App/app/src/hooks/useMegaTokens.ts
```

#### 3.3 Simplificar Configuração

**App/app/src/config/megaEvent.ts**
```typescript
export const MEGA_EVENT_CONFIG = {
  // Feature flag (controlado por env var)
  enabled: (import.meta.env?.VITE_MEGA_EVENT_ENABLED ?? "true") === "true",

  // Datas do evento
  eventDate: new Date("2024-12-31T23:59:59-03:00"),
  endDate: new Date("2025-01-07T23:59:59-03:00"),

  // Informações do prêmio
  prizeAmount: "R$ 850 milhões",
  prizeAmountNumeric: 850000000,

  // Tema visual
  theme: {
    gradient: "from-[#f7c948] via-[#ffb347] to-[#f06543]",
    primaryColor: "#f7c948",
    secondaryColor: "#ffb347",
  }
};

// Helper para verificar se evento está ativo
export const isMegaEventActive = (): boolean => {
  if (!MEGA_EVENT_CONFIG.enabled) return false;

  const now = new Date();
  return now <= MEGA_EVENT_CONFIG.endDate;
};
```

#### 3.4 Remover Types
```bash
# Arquivos a deletar
App/app/src/types/currency.ts
```

### FASE 4: Simplificação de Contexto (30 min)

**App/app/src/contexts/MegaEventContext.tsx**

```typescript
import { createContext, useContext, ReactNode, useMemo } from "react";
import { MEGA_EVENT_CONFIG, isMegaEventActive } from "@/config/megaEvent";

interface MegaEventContextValue {
  isEventActive: boolean;
  eventConfig: typeof MEGA_EVENT_CONFIG;
}

const MegaEventContext = createContext<MegaEventContextValue>({
  isEventActive: false,
  eventConfig: MEGA_EVENT_CONFIG,
});

export const MegaEventProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo<MegaEventContextValue>(
    () => ({
      isEventActive: isMegaEventActive(),
      eventConfig: MEGA_EVENT_CONFIG,
    }),
    []
  );

  return (
    <MegaEventContext.Provider value={value}>
      {children}
    </MegaEventContext.Provider>
  );
};

export const useMegaEvent = () => useContext(MegaEventContext);
```

### FASE 5: Refatoração de Componentes (2-3 horas)

#### 5.1 Simplificar MegaEvent.tsx

**Mudanças principais:**
1. ❌ Remover `TokenWalletCard`
2. ✅ Adicionar `CreditsDisplay` com tema dourado
3. ❌ Remover modal de compra (`purchaseModalOpen`, `Dialog`)
4. ❌ Remover toggle de modo mega
5. ❌ Remover `useMegaTokens()`
6. ✅ Usar `useCreditsStatus()` existente
7. ✅ Manter seções de conteúdo (histórico, probabilidades, impacto social)
8. ✅ Atualizar CTAs para refletir uso de créditos normais

**Estrutura nova:**
```typescript
export const MegaEvent = () => {
  const { user } = useAuth();
  const { isEventActive, eventConfig } = useMegaEvent();
  const { creditsRemaining, creditsTotal, isLoading } = useCreditsStatus(user?.id);

  // Contagem regressiva (manter)
  const timeLeft = useMemo(() => { ... }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 space-y-10">
        {/* Hero Section com tema dourado - MANTER */}
        <section className="rounded-3xl bg-gradient-to-br from-[#f7c948] via-[#ffb347] to-[#f06543] p-8">
          {/* Contador regressivo + info do prêmio */}
        </section>

        {/* Credits Display com tema dourado - NOVO */}
        <section>
          <CreditsDisplayMega
            creditsRemaining={creditsRemaining}
            creditsTotal={creditsTotal}
            isLoading={isLoading}
          />
          <Alert className="mt-4">
            <AlertTitle>Como usar seus créditos no evento</AlertTitle>
            <AlertDescription>
              Cada ação premium (gerar, analisar, regenerar, variar) consome 1 dos seus 20 créditos mensais.
              Use-os em qualquer loteria ou nas funções especiais da Mega da Virada.
            </AlertDescription>
          </Alert>
        </section>

        {/* Features disponíveis - SIMPLIFICAR */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Cards de features SEM badge de tokens */}
        </section>

        {/* Histórico de prêmios - MANTER */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Card com histórico 2009-2023 */}
        </section>

        {/* Impacto social e probabilidades - MANTER */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Cards informativos */}
        </section>

        {/* Regras - ATUALIZAR */}
        <section>
          <Card>
            <ul>
              <li>• Use seus créditos mensais em qualquer função do app</li>
              <li>• Cada ação premium consome 1 crédito</li>
              <li>• Créditos resetam todo dia 1º de cada mês</li>
              <li>• Suporte via WhatsApp durante o evento</li>
            </ul>
          </Card>
        </section>
      </main>
    </div>
  );
};
```

#### 5.2 Criar CreditsDisplayMega Component

**Arquivo:** `App/app/src/components/CreditsDisplayMega.tsx`

```typescript
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Calendar } from "lucide-react";
import { getDaysUntilReset } from "@/services/creditsService";

interface CreditsDisplayMegaProps {
  creditsRemaining: number;
  creditsTotal: number;
  isLoading?: boolean;
  lastResetAt?: string;
}

export const CreditsDisplayMega = ({
  creditsRemaining,
  creditsTotal,
  isLoading = false,
  lastResetAt,
}: CreditsDisplayMegaProps) => {
  const percentage = (creditsRemaining / creditsTotal) * 100;
  const daysUntilReset = lastResetAt ? getDaysUntilReset(lastResetAt) : null;

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-amber-500/20">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-amber-500/20 shadow-glow">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-200">
              Seus Créditos
            </span>
          </div>
          <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/40">
            Evento Mega da Virada
          </Badge>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-5xl font-black text-white">
              {creditsRemaining}
              <span className="text-2xl text-white/60">/{creditsTotal}</span>
            </p>
            <p className="text-sm text-white/60 mt-1">
              créditos disponíveis este mês
            </p>
          </div>

          {daysUntilReset !== null && (
            <div className="flex items-center gap-2 text-sm text-amber-200">
              <Calendar className="h-4 w-4" />
              <span>
                Reset em {daysUntilReset === 0 ? "hoje" : `${daysUntilReset} dias`}
              </span>
            </div>
          )}
        </div>

        <Progress value={percentage} className="h-2 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </Progress>

        <p className="text-xs text-white/50">
          1 crédito por ação: gerar jogos IA, analisar manual, regenerar ou criar variações
        </p>
      </div>
    </Card>
  );
};
```

#### 5.3 Atualizar MegaEventHero.tsx

**Mudanças:**
- ✅ Manter design dourado
- ✅ Manter contagem regressiva
- ✅ Atualizar copy para remover menção a "moedas exclusivas"
- ✅ CTA "Entrar no Evento" direciona para `/mega-da-virada`
- ❌ Remover texto sobre "20 moedas por ação"

```typescript
// Atualizar stats
const stats = useMemo(
  () => [
    { label: "Prêmio estimado", value: "R$ 850 Mi" },
    { label: "Disponível para", value: "Todos usuários" },
    { label: "Evento até", value: "07/01/2025" },
  ],
  []
);

// Atualizar copy
<h1 className="...">
  Análises especiais e estratégias inteligentes para disputar o prêmio histórico
</h1>
<p className="...">
  Geração IA otimizada, insights exclusivos e dados históricos da Mega da Virada.
  Use seus créditos mensais nas ferramentas especiais do evento.
</p>
```

#### 5.4 Remover TokenWalletCard.tsx
```bash
# Arquivo a deletar
App/src/components/TokenWalletCard.tsx
```

#### 5.5 Reverter Mudanças em RegenerateButton.tsx

**Remover:**
```typescript
// REMOVER imports
import { useMegaTokens } from '@/hooks/useMegaTokens';
import { CURRENCY_LABELS, type CurrencyMode } from '@/types/currency';
import { MEGA_TOKENS_PER_ACTION } from '@/config/megaEvent';
import { useMegaEvent } from '@/contexts/MegaEventContext';

// REMOVER prop
currencyMode?: CurrencyMode;

// REMOVER toda lógica de currency mode
const { currentCurrency } = useMegaEvent();
const resolvedCurrency = currencyMode ?? currentCurrency;
const isMegaCurrency = resolvedCurrency === 'mega';
const megaTokens = useMegaTokens(userId, isMegaCurrency);
```

**Simplificar para:**
```typescript
export function RegenerateButton({
  userId,
  lotteryType,
  contestNumber,
  statistics,
  numbersPerGame,
  maxNumber,
  numberOfGames = 10,
  onSuccess,
  disabled = false,
  variant = 'hero',
  size = 'default',
  showCreditsCount = false,
}: RegenerateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Apenas validação de créditos
  const {
    canRegenerate,
    cannotRegenerateReason,
    creditsRemaining,
    cooldownSeconds,
    isLoading: isLoadingCredits
  } = useCreditsStatus(userId);

  const { regenerateAsync, isGenerating } = useRegenerateCombinations();

  const handleClick = () => {
    if (!canRegenerate) {
      toast({
        variant: 'destructive',
        title: 'Não é possível regenerar',
        description: cannotRegenerateReason || 'Verifique seus créditos e tente novamente.'
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    setDialogOpen(false);

    try {
      const result = await regenerateAsync({
        userId,
        lotteryType,
        contestNumber,
        statistics,
        numbersPerGame,
        maxNumber,
        numberOfGames,
      });

      toast({
        title: 'Sucesso!',
        description: `${result.combinations.length} novas combinações geradas. Créditos restantes: ${result.creditsRemaining}`,
      });

      onSuccess?.(result.combinations);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao regenerar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  // ... resto do componente simplificado
}
```

#### 5.6 Reverter Mudanças em Step4_AnalysisResult.tsx

Similar ao RegenerateButton - remover props e lógica de `currencyMode`.

#### 5.7 Simplificar useRegenerateCombinations.ts

**Remover:**
```typescript
import { consumeMegaTokens } from '@/services/megaTokensService';
import type { CurrencyMode } from '@/types/currency';
import { MEGA_TOKENS_PER_ACTION } from '@/config/megaEvent';

// No interface
currencyMode?: CurrencyMode;
currencyBalance?: number;
```

**Simplificar função:**
```typescript
mutationFn: async (params: RegenerateParams): Promise<RegenerateResult> => {
  setIsGenerating(true);

  try {
    console.log('🔄 Iniciando regeneração...', {
      userId: params.userId,
      lotteryType: params.lotteryType,
      contestNumber: params.contestNumber
    });

    // 1. Consumir crédito (sempre)
    const creditResult = await consumeCredit(params.userId);

    if (!creditResult.success) {
      console.warn('⚠️ Crédito não consumido:', creditResult.message);
      throw new Error(creditResult.message);
    }

    console.log('✅ Crédito consumido. Restantes:', creditResult.credits_remaining);

    // 2. Gerar novas combinações
    const newCombinations = generateIntelligentCombinations(
      params.statistics,
      params.numbersPerGame,
      params.maxNumber,
      params.numberOfGames || 10
    );

    // 3. Salvar no histórico
    const { data: generationData, error: saveError } = await supabase
      .from('generation_history')
      .insert({
        user_id: params.userId,
        lottery_type: params.lotteryType,
        contest_number: params.contestNumber,
        combinations: newCombinations,
        generation_type: 'regenerate',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Erro ao salvar geração:', saveError);
      throw saveError;
    }

    console.log('✅ Regeneração salva:', generationData.id);

    return {
      success: true,
      generationId: generationData.id,
      combinations: newCombinations,
      creditsRemaining: creditResult.credits_remaining,
      message: 'Combinações regeneradas com sucesso!'
    };
  } catch (error) {
    console.error('❌ Erro na regeneração:', error);
    throw error;
  } finally {
    setIsGenerating(false);
  }
},
```

#### 5.8 Simplificar useManualGameCreation.ts

Mesmo processo - remover lógica de currency mode.

### FASE 6: Melhorias de UX/UI (1-2 horas)

#### 6.1 Navegação Direta
- Usuário clica no hero banner → vai direto para `/mega-da-virada`
- Página mostra créditos disponíveis imediatamente
- Sem modais de compra, sem friction

#### 6.2 Feedback Visual Aprimorado

**Cards de Features com Badge de Crédito:**
```typescript
const featureCards = [
  {
    title: "Gerar 3 jogos IA",
    description: "Geração inteligente treinada em dados históricos da Mega da Virada",
    creditCost: 1,
    icon: Sparkles,
  },
  {
    title: "Análise de jogos manuais",
    description: "Diagnóstico especial com insights sobre padrões históricos do evento",
    creditCost: 1,
    icon: Search,
  },
  // ...
];

// Renderização
{featureCards.map((feature) => (
  <Card key={feature.title} className="...">
    <div className="flex items-center gap-2 mb-2">
      <Badge variant="secondary" className="bg-amber-500/20 text-amber-200">
        1 crédito
      </Badge>
      <Badge variant="outline" className="border-amber-500/40 text-amber-200">
        Exclusivo Mega
      </Badge>
    </div>
    <div className="flex items-center gap-3">
      <feature.icon className="h-6 w-6 text-amber-400" />
      <div>
        <h3 className="text-xl font-semibold">{feature.title}</h3>
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      </div>
    </div>
  </Card>
))}
```

#### 6.3 Alertas Contextuais

**Quando créditos acabam:**
```typescript
{creditsRemaining === 0 && (
  <Alert className="border-amber-500/40 bg-amber-500/10">
    <AlertTriangle className="h-4 w-4 text-amber-500" />
    <AlertTitle>Créditos esgotados</AlertTitle>
    <AlertDescription>
      Você usou todos os seus créditos deste mês. Eles serão renovados no dia 1º.
      Até lá, você ainda pode visualizar o histórico e dados da Mega da Virada.
    </AlertDescription>
  </Alert>
)}
```

**Durante o cooldown:**
```typescript
{cooldownSeconds && cooldownSeconds > 0 && (
  <Alert className="border-blue-500/40 bg-blue-500/10">
    <Clock className="h-4 w-4 text-blue-400" />
    <AlertTitle>Aguarde {Math.ceil(cooldownSeconds)}s</AlertTitle>
    <AlertDescription>
      Para evitar uso excessivo, há um intervalo mínimo de 10 segundos entre ações.
    </AlertDescription>
  </Alert>
)}
```

#### 6.4 Animações e Micro-interações

Manter animações douradas:
```css
/* Efeito glow em cards importantes */
.shadow-glow {
  box-shadow: 0 0 20px rgba(247, 201, 72, 0.15);
}

/* Gradiente animado no hero */
@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-gradient {
  background-size: 200% 200%;
  animation: shimmer 8s ease infinite;
}
```

#### 6.5 Responsividade

Testar em:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

Garantir:
- Contagem regressiva legível em mobile
- Cards empilhados corretamente
- Botões com área de toque >= 44px
- Texto legível sem zoom

### FASE 7: Testes e Validação (2 horas)

#### 7.1 Checklist de Funcionalidades

**Página MegaEvent:**
- [ ] Hero section renderiza corretamente
- [ ] Contagem regressiva atualiza
- [ ] CreditsDisplayMega mostra saldo correto
- [ ] Cards de features exibem badge "1 crédito"
- [ ] Histórico de prêmios renderiza todos os anos
- [ ] Seção de impacto social exibe dados
- [ ] Seção de probabilidades mostra cálculos
- [ ] Botão WhatsApp abre link correto
- [ ] Sem erros de console

**Navegação:**
- [ ] Banner no dashboard é clicável
- [ ] Redirecionamento para `/mega-da-virada` funciona
- [ ] Rota protegida (apenas usuários autenticados)
- [ ] Volta ao dashboard sem problemas

**Sistema de Créditos:**
- [ ] Saldo inicial correto (20 créditos)
- [ ] Consumo de crédito funciona ao regenerar
- [ ] Cooldown de 10s é respeitado
- [ ] Toast mostra créditos restantes
- [ ] Alert exibido quando créditos zerados
- [ ] Reset mensal funcionando (testar no dia 1º)

**RegenerateButton:**
- [ ] Validação de créditos antes de abrir modal
- [ ] Modal de confirmação abre
- [ ] Regeneração consome 1 crédito
- [ ] Toast de sucesso mostra saldo atualizado
- [ ] Combinações geradas salvam em histórico
- [ ] Erro tratado graciosamente

**UX/UI:**
- [ ] Design dourado consistente
- [ ] Gradientes renderizam corretamente
- [ ] Badges de crédito visíveis
- [ ] Progress bar funciona
- [ ] Skeleton loader durante carregamento
- [ ] Responsivo em mobile/tablet/desktop

#### 7.2 Testes de Edge Cases

1. **Evento desabilitado:**
   - `VITE_MEGA_EVENT_ENABLED=false`
   - Banner não aparece no dashboard
   - Rota `/mega-da-virada` retorna 404

2. **Usuário sem créditos:**
   - Saldo = 0
   - Alert de créditos esgotados exibido
   - Botões de ação desabilitados
   - Histórico ainda acessível

3. **Durante cooldown:**
   - Alert de cooldown exibido
   - Contador regressivo funciona
   - Botão habilitado após cooldown

4. **Erro de API:**
   - Backend offline
   - Toast de erro exibido
   - Não trava UI
   - Retry manual possível

5. **Data do evento passou:**
   - Após 07/01/2025
   - `isMegaEventActive()` retorna `false`
   - Banner mostra mensagem "Evento encerrado"

#### 7.3 Performance

- [ ] Lighthouse Score >= 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Sem memory leaks
- [ ] Imagens otimizadas
- [ ] Bundle size aceitável

#### 7.4 Acessibilidade

- [ ] Contraste de cores >= 4.5:1
- [ ] Navegação por teclado funciona
- [ ] Screen readers conseguem ler conteúdo
- [ ] ARIA labels em botões
- [ ] Focus visible em elementos interativos

### FASE 8: Deploy e Monitoramento (1 hora)

#### 8.1 Checklist Pré-Deploy

**Banco de Dados:**
- [ ] Migration de remoção testada em staging
- [ ] Backup dos dados de mega_tokens (se necessário para auditoria)
- [ ] Migration rodada em produção
- [ ] Verificar que tabelas foram removidas

**Frontend:**
- [ ] Build sem erros
- [ ] Testes E2E passando
- [ ] Feature flag configurada corretamente
- [ ] Env vars configuradas em produção
- [ ] Assets otimizados

**Documentação:**
- [ ] README atualizado
- [ ] Changelog gerado
- [ ] Equipe de suporte informada
- [ ] Runbook de troubleshooting criado

#### 8.2 Estratégia de Deploy

**Opção 1: Deploy Gradual (Recomendado)**
1. Deploy em staging → validar 100%
2. Deploy em produção com feature flag OFF
3. Ativar para 10% dos usuários
4. Monitorar por 2-4 horas
5. Aumentar para 50%
6. Monitorar por 2-4 horas
7. Ativar 100%

**Opção 2: Deploy Direto**
1. Deploy em staging → validar 100%
2. Agendar deploy fora de horário de pico
3. Deploy completo em produção
4. Monitorar intensamente primeiras 2 horas

#### 8.3 Monitoramento

**Métricas a acompanhar:**
- Acessos à página `/mega-da-virada`
- Taxa de consumo de créditos
- Erros de API (rate 4xx/5xx)
- Tempo de resposta das funções
- Taxa de bounce
- Tempo médio na página

**Alertas configurar:**
- Taxa de erro > 5%
- Latência > 2s
- Créditos não sendo consumidos corretamente
- Spike inesperado de tráfego

**Ferramentas:**
- Supabase Dashboard (queries, errors)
- Vercel Analytics (pageviews, performance)
- Sentry (error tracking)
- LogRocket (session replay)

#### 8.4 Rollback Plan

Se algo der errado:

1. **Emergência (site quebrado):**
   - Reverter deploy imediatamente
   - Desabilitar feature flag
   - Comunicar usuários

2. **Problemas menores:**
   - Desabilitar feature flag
   - Investigar e corrigir
   - Reativar após fix

3. **Restaurar banco:**
   ```sql
   -- Se necessário, recriar tabelas temporariamente
   -- (usar backup da migration antiga)
   ```

---

## 4. IMPACTOS E CONSIDERAÇÕES

### 4.1 Impacto nos Usuários

**Positivo:**
- ✅ Simplicidade: um único sistema de créditos
- ✅ Sem fricção de compra adicional
- ✅ Todos podem participar do evento
- ✅ Experiência mais fluida

**Neutro:**
- ⚪ Limite de 20 créditos/mês se aplica ao evento
- ⚪ Sem "tokens ilimitados" disponíveis

**Negativo:**
- ❌ Usuários que esperavam comprar tokens específicos podem ficar confusos
- ❌ Documentação antiga pode gerar expectativas erradas

**Mitigação:**
- Comunicar claramente mudança no hero banner
- FAQ explicando que créditos servem para tudo
- Suporte WhatsApp preparado para dúvidas

### 4.2 Impacto Técnico

**Redução de Complexidade:**
- ❌ -2 tabelas no banco
- ❌ -2 funções SQL
- ❌ -4 arquivos de código
- ❌ -1 hook
- ❌ -1 serviço
- ❌ -1 type definition
- ✅ Menos lógica condicional
- ✅ Menos testes necessários

**Código mais Limpo:**
- Props simplificadas em componentes
- Menos branches condicionais
- Melhor legibilidade

**Manutenção:**
- Menos bugs potenciais
- Menos código para revisar em PRs
- Onboarding de devs mais rápido

### 4.3 Impacto no Negócio

**Monetização:**
- ❌ Não venderemos tokens exclusivos
- ❓ Possível venda de créditos extras no futuro (fora do escopo)

**Engajamento:**
- ✅ Mais usuários podem experimentar o evento
- ✅ Menos barreiras de entrada
- ✅ Foco em valor (análises), não em paywall

**Reputação:**
- ✅ Evento "democrático" e acessível
- ✅ Evita impressão de "cash grab"

---

## 5. CRONOGRAMA SUGERIDO

### Cenário Ideal (4-6 horas contínuas)
- **Fase 2 (DB):** 30 min
- **Fase 3 (Backend):** 1h
- **Fase 4 (Context):** 30 min
- **Fase 5 (Components):** 2-3h
- **Fase 6 (UX/UI):** 1-2h
- **Fase 7 (Testes):** 2h
- **Fase 8 (Deploy):** 1h

**Total:** 8-10 horas

### Cenário Dividido (2-3 dias)
- **Dia 1 (4h):** Fases 2, 3, 4 (infraestrutura)
- **Dia 2 (4h):** Fase 5 (componentes)
- **Dia 3 (3h):** Fases 6, 7, 8 (polish, testes, deploy)

---

## 6. PRÓXIMOS PASSOS

### 6.1 Aprovação e Alinhamento
- [ ] Revisar este documento com stakeholders
- [ ] Aprovar mudanças de produto (sem tokens exclusivos)
- [ ] Confirmar cronograma de implementação
- [ ] Alocar recursos (desenvolvedor + QA)

### 6.2 Preparação
- [ ] Criar branch `refactor/mega-event-unified-credits`
- [ ] Configurar ambiente de staging
- [ ] Preparar dados de teste
- [ ] Notificar equipe de suporte

### 6.3 Execução
- [ ] Seguir fases 2-8 deste documento
- [ ] Code review a cada fase
- [ ] Testes contínuos em staging
- [ ] Deploy gradual conforme plano

### 6.4 Pós-Deploy
- [ ] Monitorar métricas primeiras 48h
- [ ] Coletar feedback de usuários
- [ ] Ajustar conforme necessário
- [ ] Documentar lições aprendidas

---

## 7. REFERÊNCIAS

### Documentação Existente
- `Docs/Mega_virada/mega_da_virada_event_plan.md` - Plano original
- `Docs/Mega_virada/mega_tokens_expiration.md` - Sistema de expiração
- `Docs/Mega_virada/Pesquisa Detalhada Mega da Virada.txt` - Dados históricos

### Arquivos de Código Principais
- `App/app/src/pages/MegaEvent.tsx`
- `App/app/src/contexts/MegaEventContext.tsx`
- `App/app/src/hooks/useUserCredits.ts`
- `App/app/src/services/creditsService.ts`
- `App/supabase/migrations/20250210190000_add_mega_tokens.sql`

### Recursos Externos
- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Tailwind Gradients](https://tailwindcss.com/docs/gradient-color-stops)

---

## 8. APÊNDICE

### A. SQL Queries Úteis

**Verificar créditos de um usuário:**
```sql
select * from user_credits where user_id = 'uuid-aqui';
```

**Verificar consumo recente:**
```sql
select
  user_id,
  credits_remaining,
  last_generation_at,
  extract(epoch from (now() - last_generation_at)) as seconds_since_last
from user_credits
where user_id = 'uuid-aqui';
```

**Resetar créditos manualmente (teste):**
```sql
update user_credits
set credits_remaining = 20,
    last_reset_at = now()
where user_id = 'uuid-aqui';
```

### B. Comandos Úteis

**Build local:**
```bash
cd App
npm run build
```

**Rodar testes:**
```bash
npm run test
npm run test:e2e
```

**Verificar tipos:**
```bash
npm run typecheck
```

**Gerar types do Supabase:**
```bash
npx supabase gen types typescript --project-id xxx > src/integrations/supabase/types.ts
```

### C. Feature Flag Management

**Desabilitar evento:**
```bash
# .env.production
VITE_MEGA_EVENT_ENABLED=false
```

**Habilitar evento:**
```bash
# .env.production
VITE_MEGA_EVENT_ENABLED=true
```

**Verificar em runtime:**
```typescript
import { isMegaEventEnabled } from "@/config/features";

if (isMegaEventEnabled) {
  // Renderizar hero banner, rota, etc
}
```

---

**Documento criado em:** 2025-01-13
**Última atualização:** 2025-01-13
**Versão:** 1.0
**Autor:** Claude Code
