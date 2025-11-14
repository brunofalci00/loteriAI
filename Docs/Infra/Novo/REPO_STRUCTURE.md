# Estrutura do Repositório `loteriAI`

Este documento descreve como o repositório está organizado atualmente, quais projetos vivem em cada pasta e como o deploy da branch **feat/mega-da-virada-refactoring** é gerado. Use-o como referência antes de abrir novas features ou preparar um deploy para `master`.

## Visão Geral

```
/
├── App/                  # Aplicação legacy (mantida por histórico)
├── LP_loteri.AI/         # Monorepo principal (landing + app React)
├── Docs/                 # Documentação interna
├── supabase/             # Scripts SQL e funções compartilhadas
├── scripts/              # Utilidades MCP/shadcn e auxiliares
└── vercel.json           # Configuração única de deploy
```

- **Branch atual de trabalho:** `feat/mega-da-virada-refactoring`.
- **Deploy:** configurado via `vercel.json` na raiz, sempre buildando `LP_loteri.AI`.

## Projetos Principais

### LP_loteri.AI (monorepo ativo)

- `package.json` define os scripts usados pelo Vercel:
  - `install:all` → instala `quiz-app` e `app`.
  - `build:quiz` + `build:app` → builds separados de cada produto.
  - `build:organize` → `scripts/organize-dist.js` move `app/dist` e `quiz-app/dist` para a raiz `LP_loteri.AI/dist`.
- **Estrutura interna:**
  - `app/` → o novo aplicativo React (a versão com Mega da Virada). Usa Vite + shadcn + Supabase. A build final fica em `LP_loteri.AI/app/dist` e depois é copiada para `LP_loteri.AI/dist/app`.
  - `quiz-app/` → landing/quiz estático (Vite). Build em `LP_loteri.AI/dist/quiz-assets`.
  - `public/` + `index.html` na raiz do monorepo hospedam recursos extras (scripts FB) referenciados nas rewrites.
- **Deploy:** Vercel roda na raiz `/` chamando `npm run build` dentro de `LP_loteri.AI`. A pasta final publicada é `LP_loteri.AI/dist` (contém `/app` e `/quiz`).

### App (legacy)

- Mantém uma versão anterior do aplicativo (estrutura semelhante a `LP_loteri.AI/app`). Não participa do build atual (Vercel ignora).
- Útil apenas para consulta/rollback. Evitar alterar a não ser que planejado.

### Docs

- `Docs/Infra` concentra guias de fluxo (`WORKFLOW-GIT-FEATURES.md`) e agora esta nova documentação em `Docs/Infra/Novo`.
- `Docs/Mega_virada` guarda todo o material do evento (planos, instruções Supabase, etc).

### Scripts & Ferramentas

- `scripts/shadcn-mcp-wrapper.mjs` + `package.json` raiz configuram o MCP do shadcn (usado no CLI).
- `supabase/` na raiz contém SQL compartilhado e funções utilizadas por ambos os apps. O monorepo `LP_loteri.AI` também tem uma pasta `supabase` própria para migrations específicas.

## Fluxo de Build/Deploy

1. **Install:** `npm run install:all` (dentro de `LP_loteri.AI`) instala `quiz-app` e `app`.
2. **Build:** `npm run build` executa `build:quiz`, `build:app` e `build:organize`. O script `organize` copia os arquivos para `LP_loteri.AI/dist`.
3. **Vercel rewrites (`vercel.json`):**
   - `/quiz` → `/quiz.html` (servido a partir de `LP_loteri.AI/dist/quiz.html`).
   - `/app/...` → `/app/index.html` (SPA React do aplicativo).
   - `/` → landing estática.

## Convenções & Boas Práticas

- **Branches:** trabalhar em features (como `feat/mega-da-virada-refactoring`) e só depois fazer merge em `master`.
- **Node version:** `package.json` em `LP_loteri.AI` define `"node": ">=18.0.0"`. Para evitar warnings no Vercel, considere travar para `"18.x"`.
- **Módulos externos (LP vs App):** qualquer mudança que impacte produção deve ocorrer no monorepo `LP_loteri.AI`. A pasta `App/` serve apenas como referência.
- **Documentação:** adicionar novos guias dentro de `Docs/Infra/Novo` seguindo este padrão.

## Próximos Passos Recomendados

1. Validar se ainda precisamos do diretório `App/`; se não, mover documentação para deixar claro que é legado.
2. Automatizar a cópia do `supabase/` entre raiz e `LP_loteri.AI` para evitar divergências.
3. Atualizar `README.md` na raiz com um resumo desta mesma estrutura para novos contribuidores.

