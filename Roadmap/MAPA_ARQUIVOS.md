# 🗺️ Mapa de Arquivos - LOTER.IA

**Última atualização:** 2025-01-04

---

## 📂 Estrutura de Pastas

```
C:\Users\bruno\Documents\Black\Loter.IA\Prod\
│
├── 📁 Roadmap\                          ← VOCÊ ESTÁ AQUI
│   │
│   ├── 🔵 SCHEMA DO BANCO DE DADOS
│   │   ├── MIGRATIONS_SQL_COMPLETAS.sql                    ⭐ PRINCIPAL (909 linhas)
│   │   ├── 20250103_fix_consume_credit_ambiguous_column.sql ⚠️ DEPLOY CRÍTICO
│   │   ├── 20250103_user_feedback_schema.sql
│   │   ├── FIX_saved_games_stats.sql
│   │   ├── ADD_CREDITS_TO_ALL_USERS.sql
│   │   ├── ADD_CREDITS_UPSERT.sql
│   │   └── MIGRATION_FIX_LOTTERY_CONSTRAINT.sql
│   │
│   ├── 💳 SISTEMA DE CRÉDITOS
│   │   ├── FEATURES_GRATUITAS_VS_CREDITOS.md               ⭐ DEFINIÇÃO OFICIAL
│   │   ├── SISTEMA_CREDITOS_IMPLEMENTACAO_COMPLETA.md
│   │   ├── FASE1_CREDITOS_COMPLETA.md                      ⭐ RESUMO EXECUTIVO
│   │   ├── RESET_AUTOMATICO_CREDITOS.md
│   │   └── COMO_ADICIONAR_CREDITOS.md
│   │
│   ├── 💬 SISTEMA DE FEEDBACK
│   │   ├── SISTEMA_FEEDBACK_SUGESTOES.md
│   │   ├── SISTEMA_FEEDBACK_FASE1_CONCLUIDA.md
│   │   └── SISTEMA_FEEDBACK_FASE2_CONCLUIDA.md             ⭐ ÚLTIMA IMPLEMENTAÇÃO
│   │
│   ├── 🔗 COMPARTILHAMENTO VIRAL
│   │   ├── ESTRATEGIA_VIRAL_COMPARTILHAMENTO.md
│   │   ├── FASE_1_COMPARTILHAMENTO_CONCLUIDA.md
│   │   └── FASE_2_TIER_A_MODALS_CONCLUIDA.md
│   │
│   ├── 💾 JOGOS SALVOS
│   │   ├── FASE2_SALVAR_JOGOS_SPEC.md
│   │   ├── FIXES_JOGOS_SALVOS.md
│   │   ├── RESUMO_MELHORIAS_JOGOS_SALVOS.md
│   │   └── IMPLEMENTACAO_COMPLETA_JOGOS_SALVOS.md
│   │
│   ├── 🎮 OUTRAS FEATURES
│   │   ├── FASE1_REGENERACAO_SPEC.md
│   │   ├── FASE3_CRIACAO_MANUAL_SPEC.md
│   │   └── WIREFRAMES_CONSOLIDADOS.md
│   │
│   └── 📚 ÍNDICES
│       ├── README_DOCUMENTACAO.md                           ⭐ ÍNDICE COMPLETO
│       └── MAPA_ARQUIVOS.md                                 ⭐ ESTE ARQUIVO
│
├── 📁 App\app\
│   │
│   ├── 📁 src\
│   │   ├── 📁 components\
│   │   │   ├── ConsumeCreditsConfirmation.tsx              ✅ NOVO (Fase 1)
│   │   │   ├── CreditsInfoPopover.tsx                      ✅ MODIFICADO (Fase 1)
│   │   │   └── Step4_AnalysisResult.tsx                    ✅ MODIFICADO (Fase 1)
│   │   │
│   │   └── 📁 services\
│   │       └── gameVariationsService.ts                     ✅ MODIFICADO (Fase 1)
│   │
│   └── 📁 supabase\
│       ├── 📁 functions\
│       │   ├── reset-monthly-credits\
│       │   │   └── index.ts                                 ✅ NOVO (Fase 1)
│       │   │
│       │   ├── share-reward\
│       │   │   └── index.ts                                 ✅ EXISTENTE
│       │   │
│       │   └── [outras functions...]
│       │
│       ├── 📁 migrations\
│       │   └── 20250103_fix_consume_credit_ambiguous_column.sql ⚠️ APLICAR
│       │
│       └── config.toml                                      ✅ MODIFICADO (Fase 1)
│
└── 📁 LP_loteri.AI\                     ← Landing Page (separado)
```

---

## 🎯 Arquivos Mais Importantes

### **1️⃣ Para Entender o Sistema**
```
📄 FEATURES_GRATUITAS_VS_CREDITOS.md
   └─ O que é grátis vs pago (OFICIAL)

📄 README_DOCUMENTACAO.md
   └─ Índice completo de toda documentação
```

### **2️⃣ Para Aplicar Changes no Banco**
```
📄 MIGRATIONS_SQL_COMPLETAS.sql
   └─ Schema completo (909 linhas)

📄 20250103_fix_consume_credit_ambiguous_column.sql
   └─ FIX CRÍTICO (aplicar AGORA)
```

### **3️⃣ Para Fazer Deploy**
```
📄 FASE1_CREDITOS_COMPLETA.md
   └─ Checklist de deploy

📄 RESET_AUTOMATICO_CREDITOS.md
   └─ Como deployar Edge Function + Cron
```

### **4️⃣ Para Ver O Que Foi Implementado**
```
📄 FASE1_CREDITOS_COMPLETA.md
   └─ Resumo da Fase 1

📄 SISTEMA_FEEDBACK_FASE2_CONCLUIDA.md
   └─ Resumo da Fase 2 Feedback
```

---

## 🚨 Ações Urgentes

### **⚠️ CRÍTICO - Aplicar AGORA**

```sql
-- Arquivo: Roadmap/20250103_fix_consume_credit_ambiguous_column.sql
-- Local: Supabase Dashboard → SQL Editor
-- Razão: Corrige erro "credits_remaining is ambiguous"
-- Impacto: Regeneração está quebrada sem isso
```

**Como aplicar:**
1. Abrir Supabase Dashboard
2. Ir em SQL Editor
3. Copiar conteúdo de `20250103_fix_consume_credit_ambiguous_column.sql`
4. Colar e clicar "Run"

---

## 📊 Tabelas no Supabase

```
public.generation_history          ← Histórico de gerações
public.user_credits                ← Créditos dos usuários ⭐ PRINCIPAL
public.saved_games                 ← Jogos salvos (limite 50)
public.saved_games_stats           ← Estatísticas (materialized view)
public.manual_creation_sessions    ← Sessões de criação manual
public.manual_game_variations      ← Variações geradas
public.user_feedback               ← Feedbacks dos usuários
public.feedback_stats              ← Estatísticas de feedback
```

---

## 🔧 Funções SQL Importantes

```sql
consume_credit(p_user_id UUID)
   └─ Consome 1 crédito
   └─ Valida cooldown de 10s
   └─ ✅ CORRIGIDO em 2025-01-04

reset_monthly_credits()
   └─ Reseta créditos para 50
   └─ Executado dia 1º do mês
   └─ ✅ ATUALIZADO em 2025-01-04

refresh_saved_games_stats()
   └─ Atualiza estatísticas de jogos salvos

cleanup_old_generations()
   └─ Limpa gerações antigas

get_user_activity_summary(p_user_id UUID)
   └─ Resumo de atividade do usuário
```

---

## 🎨 Componentes React Importantes

```tsx
// Sistema de Créditos
ConsumeCreditsConfirmation.tsx     ✅ NOVO - Modal de confirmação
CreditsInfoPopover.tsx             ✅ MODIFICADO - Info sobre créditos
Step4_AnalysisResult.tsx           ✅ MODIFICADO - Análise de jogos

// Sistema de Feedback
FeedbackModal.tsx                  ✅ EXISTENTE - Modal de feedback
FeedbackFAB.tsx                    ✅ EXISTENTE - Floating Action Button

// Compartilhamento
ShareButton.tsx                    ✅ EXISTENTE - Botão de compartilhar
ShareModal.tsx                     ✅ EXISTENTE - Modal de compartilhamento
```

---

## 🔗 Edge Functions (Supabase)

```
reset-monthly-credits              ✅ NOVO - Reset automático mensal
   └─ Deploy: npx supabase functions deploy reset-monthly-credits
   └─ Cron: 0 0 1 * * (dia 1 do mês, 00:00 UTC)

share-reward                       ✅ EXISTENTE - Recompensa por compartilhar
   └─ Concede +1 a +3 créditos

lottery-proxy                      ✅ EXISTENTE - Proxy para API da loteria
hubla-webhook                      ✅ EXISTENTE - Webhook de pagamentos
facebook-capi                      ✅ EXISTENTE - Facebook Conversions API
```

---

## 📝 Convenções de Nomenclatura

### **Documentos**
```
FASE[N]_[NOME]_SPEC.md            → Especificação de feature
FASE[N]_[NOME]_CONCLUIDA.md       → Resumo de implementação
FIXES_[NOME].md                   → Correções aplicadas
RESUMO_[NOME].md                  → Resumo de melhorias
SISTEMA_[NOME].md                 → Plano de sistema
[DATA]_[nome]_schema.sql          → Schema SQL com data
```

### **Arquivos SQL**
```
MIGRATIONS_SQL_COMPLETAS.sql       → Schema completo
[DATA]_[descrição].sql            → Migration específica
FIX_[descrição].sql               → Correção de bug
ADD_[descrição].sql               → Adição de feature
```

---

## 🔍 Como Navegar

### **Quer fazer algo?**

| Tarefa | Vá para |
|--------|---------|
| Aplicar migrations | `Roadmap/20250103_fix_consume_credit_ambiguous_column.sql` |
| Entender sistema de créditos | `Roadmap/FEATURES_GRATUITAS_VS_CREDITOS.md` |
| Ver schema completo | `Roadmap/MIGRATIONS_SQL_COMPLETAS.sql` |
| Deploy Edge Function | `Roadmap/RESET_AUTOMATICO_CREDITOS.md` |
| Ver resumo da Fase 1 | `Roadmap/FASE1_CREDITOS_COMPLETA.md` |
| Procurar qualquer coisa | `Roadmap/README_DOCUMENTACAO.md` |

---

## ✅ Checklist Visual

```
✅ Sistema de Créditos - Fase 1 Implementada
   ├─ ✅ Bug SQL corrigido
   ├─ ✅ Modal de confirmação criado
   ├─ ✅ Consumo em variações implementado
   ├─ ✅ Popover atualizado
   ├─ ✅ Reset automático implementado
   ├─ ✅ Build com sucesso
   ├─ ⏳ SQL migration aguardando deploy
   └─ ⏳ Edge Function aguardando deploy

✅ Sistema de Feedback - Fase 2 Completa
   ├─ ✅ Rate limiting (5/dia)
   ├─ ✅ Global events
   ├─ ✅ Toast pós-share
   ├─ ✅ FAB component
   └─ ✅ Em produção

✅ Compartilhamento Viral - Completo
   ├─ ✅ Recompensas (+1 a +3)
   ├─ ✅ Gatilhos emocionais
   └─ ✅ Em produção

✅ Jogos Salvos - Completo
   ├─ ✅ Limite de 50 jogos
   ├─ ✅ Estatísticas
   └─ ✅ Em produção
```

---

## 🎯 Próximos Passos

1. **Deploy SQL Migration** ⚠️ URGENTE
   ```bash
   # Dashboard → SQL Editor → Colar e executar
   # Arquivo: 20250103_fix_consume_credit_ambiguous_column.sql
   ```

2. **Deploy Edge Function**
   ```bash
   cd App/app
   npx supabase functions deploy reset-monthly-credits
   ```

3. **Verificar Cron Job**
   ```
   Dashboard → Edge Functions → Cron Jobs
   Confirmar: reset-monthly-credits ativo
   ```

4. **Deploy Aplicação**
   ```bash
   npm run build  # ✅ Já testado
   # Deploy via Vercel/Netlify
   ```

---

**Documento criado por:** Claude Code
**Data:** 2025-01-04
**Versão:** 1.0
