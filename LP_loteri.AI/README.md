# Loter.IA Multifunil

Este repositório agora está organizado como um monorepo npm (workspaces) que centraliza a landing page principal e três funis React distintos: o quiz clássico (backup), o novo quiz da Mega da Virada e o quiz da Lotofácil/Lotozap.

## Estrutura

```
apps/
  lp/              → Landing page / app principal
  quiz-classic/    → Quiz original preservado como backup
  mega-quiz/       → Nova copy Mega da Virada (mesmo produto)
  lotozap-quiz/    → Funil Lotofácil com oferta Lotozap
packages/
  quiz-core/       → Espaço para componentes/estilos compartilhados
  quiz-config/     → Configurações de copy/tema por funil
public/            → Assets estáticos legados (HTMLs e CSS puros)
scripts/           → Scripts utilitários (organizar builds, etc.)
```

## Pré-requisitos

- Node.js 18+
- npm 10+ (necessário para workspaces)

## Instalação

```bash
npm install
```

Este comando não instala dependências duplicadas; cada workspace mantém seu `package-lock.json` local apenas como referência/backup.

## Scripts principais

| Comando | Descrição |
| --- | --- |
| `npm run dev:lp` | Inicia a landing page |
| `npm run dev:quiz-classic` | Inicia o quiz original (somente referência) |
| `npm run dev:mega` | Inicia o novo funil da Mega da Virada |
| `npm run dev:lotozap` | Inicia o funil Lotozap/WhatsApp |
| `npm run build` | Executa build de todos os apps e organiza a saída em `dist/` |

Os scripts `build:*` individuais também estão disponíveis caso você queira publicar apenas um funil.

## Saída de build (`scripts/organize-dist.js`)

Após `npm run build`, a pasta `dist/` fica assim:

```
dist/
  lp/                → Build da landing page/app principal
  funnels/
    classic/         → Quiz backup
    mega/            → Quiz Mega da Virada
    lotozap/         → Quiz Lotozap (WhatsApp)
  quiz.html          → Alias do quiz clássico para manter compatibilidade com o link antigo
  ...arquivos da pasta public/ (campanhas estáticas, etc.)
```

Cada funil pode ser versionado/deployado de forma independente apontando para o subdiretório correspondente.

## Próximos passos

1. Evoluir `packages/quiz-core` com componentes reutilizáveis (slides, CTA, métricas).
2. Usar `packages/quiz-config` para centralizar todas as copies/cores por tema.
3. Personalizar `apps/mega-quiz` e `apps/lotozap-quiz` com as novas copies e integrações específicas.

Com isso você pode trabalhar em cada funil no detalhe sem perder a referência do quiz original. Se precisar de ajuda para ajustar o funil da Mega na sequência, é só pedir! 😉
