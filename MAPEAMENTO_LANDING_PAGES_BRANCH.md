# 📋 Mapeamento: Landing Pages na Branch Mega da Virada

## Resumo Executivo

**Status:** ⚠️ **PROBLEMA ENCONTRADO**

Existem **2 cópias desatualizadas** da landing page no repositório:
1. ❌ **App/public/** - DESATUALIZADA (projeto descontinuado)
2. ✅ **LP_loteri.AI/public/** - ATUALIZADA (branch sincronizada)

A **branch feat/mega-da-virada-refactoring** está **sincronizada com LP_loteri.AI/public/** (a versão correta).

---

## 🗂️ Estrutura de Landing Pages

```
loteriAI/
├── App/public/                    ❌ DESATUALIZADA
│   ├── index.html                 (Versão velha)
│   ├── thanks.html                (Versão velha)
│   ├── quiz.html                  (ANTIGO - Quiz estático)
│   ├── quiz.js                    (ANTIGO - 632 linhas)
│   ├── quiz.head.js               (ANTIGO - 682 linhas)
│   ├── quiz.css                   (ANTIGO)
│   ├── fb-capi.js                 (362 linhas - DESATUALIZADO)
│   ├── styles.css                 (Desatualizado)
│   └── thanks.css                 (Desatualizado)
│
└── LP_loteri.AI/public/           ✅ ATUALIZADA
    ├── index.html                 (Versão atual com Mega da Virada)
    ├── thanks.html                (Versão atual)
    ├── quiz.html                  (NÃO EXISTE - substituído por React)
    ├── fb-capi.js                 (399 linhas - ATUALIZADO)
    ├── fb-parameter-builder-lite.js (NOVO - 64 linhas)
    ├── styles.css                 (Atualizado)
    └── thanks.css                 (Atualizado)
```

---

## 📊 Comparação Detalhada

### App/public/index.html (DESATUALIZADA)
```html
<!-- Antigo - sem referência a Mega da Virada -->
<title>Ferramenta Estatística para Lotofácil</title>
<h1>URGENTE: EMPRESA REVELA PADRÕES ESCONDIDOS DAS LOTERIAS</h1>
<!-- Sem menção específica à Mega da Virada no título -->
```

**Problemas:**
- ❌ Não menciona Mega da Virada de forma destaque
- ❌ Quiz estático (não React)
- ❌ Facebook CAPI desatualizado
- ❌ Sem fb-parameter-builder-lite.js

### LP_loteri.AI/public/index.html (ATUALIZADA)
```html
<!-- Novo - menção clara à Mega da Virada -->
<title>Ferramenta Estatística para Lotofácil</title>
<p>Com a Mega da Virada se aproximando, uma inteligência artificial
   brasileira promete ensinar apostadores a montar jogos...</p>
```

**Benefícios:**
- ✅ Menção explícita à Mega da Virada
- ✅ Quiz integrado via React (dist/quiz.html)
- ✅ Facebook CAPI atualizado (399 linhas)
- ✅ fb-parameter-builder-lite.js incluído (nova funcionalidade)

---

## 🔧 Mudanças de Arquivo

### JavaScript (fb-capi.js)
| Aspecto | App/public | LP_loteri.AI/public |
|---------|-----------|-------------------|
| **Linhas** | 362 | 399 |
| **CAPI Pixel** | ✅ Básico | ✅✅ Completo |
| **Parameter Builder** | ❌ Não | ✅ Separado em arquivo |
| **Tracking** | ⚠️ Simples | ✅ Avançado |

### HTML (index.html)
| Item | App/public | LP_loteri.AI/public |
|------|-----------|-------------------|
| **Meta tags** | Básicas | Completas com CAPI |
| **Mega da Virada** | Não menciona | Mencionada |
| **Quiz** | HTML estático | React renderizado |
| **Scripts** | fb-capi.js | fb-capi.js + fb-parameter-builder-lite.js |

---

## 🌳 Como Funciona na Branch

### Estrutura Atual
```
master (produção)
  ├── App/public/                  (DESATUALIZADA - ignorada)
  └── LP_loteri.AI/public/         (ATUALIZADA - em uso)

feat/mega-da-virada-refactoring (nova feature)
  ├── App/public/                  (SEM MUDANÇAS)
  └── LP_loteri.AI/public/         (SEM MUDANÇAS)
       └── index.html              (Já tinha Mega da Virada)
```

### Por que a Branch NÃO tem mudanças na Landing Page?

A branch **feat/mega-da-virada-refactoring** foi criada para adicionar:
- ✅ MegaEventHero component (novo banner no App)
- ✅ /mega-da-virada route (nova página no App)
- ✅ Sistema de créditos atualizado
- ✅ Database migrations

**A landing page já tinha:**
- ✅ Referências à Mega da Virada (já no index.html)
- ✅ Facebook CAPI moderno (já atualizado)
- ✅ Quiz React (já substituído)

**Por isso não há commits** no branch tocando em LP_loteri.AI/public/

---

## ⚠️ Problema: App/public Ficou para Trás

A razão pela qual você notou "informações desatualizadas":

### Timeline
```
📅 Commit 1: "feat: substituir quiz estático por quiz React"
   └─ Atualizou LP_loteri.AI/public/
   └─ App/public/ ficou com quiz estático

📅 Commit 2: "feat: Atualizar alterações de pixel na Landing Page"
   └─ Atualizou LP_loteri.AI/public/
   └─ App/public/ ficou desatualizado

📅 Branch criada: feat/mega-da-virada-refactoring
   └─ Não toca em landing page (já estava atualizada)
   └─ Apenas adiciona app features
```

### O que ficou desatualizado em App/public/

| Arquivo | Estado | Por que |
|---------|--------|--------|
| **index.html** | ❌ Desatualizado | Sem menção à Mega, sem CAPI moderno |
| **quiz.html** | ❌ Antigo | Substituído por React em LP |
| **quiz.js** | ❌ Antigo | Substituído por React em LP |
| **fb-capi.js** | ⚠️ Parcial | Tem versão de 362 linhas vs 399 em LP |
| **styles.css** | ⚠️ Desatualizado | CSS antigo sem Mega da Virada |

---

## 🚀 Solução: Sincronizar App/public com LP_loteri.AI/public

### Opção 1: Deletar App/public (RECOMENDADO)
```bash
# App/ é projeto descontinuado
# Deletar App/public/ evita confusão futura
rm -rf App/public/

# Criar commit
git add -A
git commit -m "refactor: remove obsolete App/public folder (use LP_loteri.AI/public instead)"
git push origin feat/mega-da-virada-refactoring
```

**Benefício:** Evita duplicação e confusão

### Opção 2: Sincronizar App/public com LP_loteri.AI/public
```bash
# Copiar arquivos novos
cp -r LP_loteri.AI/public/* App/public/

# Commit
git add App/public/
git commit -m "refactor: sync App/public with LP_loteri.AI/public (remove obsolete files)"
git push origin feat/mega-da-virada-refactoring
```

**Benefício:** App/public fica atualizado

---

## 📋 Checklist para Migração

### Antes de fazer merge para master

- [ ] Decidir se mantém ou remove App/public
- [ ] Se sincronizar: copiar LP_loteri.AI/public/* → App/public/
- [ ] Deletar arquivos obsoletos:
  - [ ] App/public/quiz.html
  - [ ] App/public/quiz.js
  - [ ] App/public/quiz.head.js
  - [ ] App/public/quiz.css
- [ ] Verificar que index.html menciona Mega da Virada
- [ ] Testar landing page em: https://fqdigital.com.br/
- [ ] Testar quiz em: https://fqdigital.com.br/quiz

---

## 🔍 Como Verificar Qual Landing Page Está em Produção

```bash
# Verificar qual pasta é servida no build
cd LP_loteri.AI

# Ver vercel.json para entender roteamento
cat vercel.json

# Ver organize-dist.js para entender estrutura final
cat scripts/organize-dist.js
```

**Resultado esperado:**
- Landing page de **LP_loteri.AI/public/** está em produção
- App/public/ é ignorado (projeto descontinuado)

---

## 📢 Recomendação

**Ação recomendada para a branch feat/mega-da-virada-refactoring:**

```bash
# 1. Limpar projeto removendo duplicação
rm -rf App/public/

# 2. Deixar claro que App/ é descontinuado
echo "# DEPRECATED - Use LP_loteri.AI instead" > App/README.md

# 3. Commit
git add -A
git commit -m "refactor: remove deprecated App/public folder"
git push origin feat/mega-da-virada-refactoring
```

Isso deixa a estrutura do repositório muito mais clara: **LP_loteri.AI/ é o projeto ativo, App/ é legado.**

---

**Última atualização:** Novembro 2025
