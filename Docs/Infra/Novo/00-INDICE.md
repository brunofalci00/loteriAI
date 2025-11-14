# 📚 Documentação da Estrutura do Projeto LoteriAI

## Índice de Documentos

Este diretório contém a documentação completa da estrutura do projeto GitHub (brunofalci00/loteriAI).

### 📋 Documentos Disponíveis

1. **[01-VISAO-GERAL.md](./01-VISAO-GERAL.md)**
   - Resumo executivo do projeto
   - Estrutura geral do repositório
   - Estatísticas do projeto
   - Status atual

2. **[02-PROJETOS.md](./02-PROJETOS.md)**
   - Detalhamento de cada projeto/aplicação
   - Landing Page
   - App React Principal
   - Quiz App
   - Projeto Antigo (App/)

3. **[03-ESTRUTURA-PASTAS.md](./03-ESTRUTURA-PASTAS.md)**
   - Árvore completa de diretórios
   - Explicação de cada pasta
   - Padrão de organização
   - Arquivos importantes

4. **[04-BUILD-DEPLOY.md](./04-BUILD-DEPLOY.md)**
   - Fluxo completo de build
   - Pipeline de deployment (Vercel)
   - Scripts de organização
   - Configurações de deploy

5. **[05-ARQUITETURA.md](./05-ARQUITETURA.md)**
   - Arquitetura técnica da aplicação
   - Stack tecnológico
   - Features principais
   - Integrations (Supabase, etc)

6. **[06-COMPONENTES-HOOKS.md](./06-COMPONENTES-HOOKS.md)**
   - Lista completa de componentes
   - Custom hooks disponíveis
   - Serviços e utilidades
   - Tipos TypeScript

7. **[07-PADROES-CODIGO.md](./07-PADROES-CODIGO.md)**
   - Padrões de código
   - Convenções de naming
   - Estrutura de arquivos
   - Best practices

8. **[08-BRANCHES-GIT.md](./08-BRANCHES-GIT.md)**
   - Estrutura de branches
   - Estratégia de versionamento
   - Fluxo de features
   - Proteção de branches

9. **[09-DATABASE-SUPABASE.md](./09-DATABASE-SUPABASE.md)**
   - Estrutura do banco de dados
   - Tabelas e schemas
   - Migrações SQL
   - Cloud Functions

10. **[10-CONFIGURACOES.md](./10-CONFIGURACOES.md)**
    - Environment variables
    - Feature flags
    - Configurações de build
    - Variáveis de ambiente

11. **[11-DEPENDENCIAS.md](./11-DEPENDENCIAS.md)**
    - Dependências principais
    - Versões utilizadas
    - Dependências compartilhadas
    - Vulnerabilidades conhecidas

12. **[12-GUIA-RAPIDO.md](./12-GUIA-RAPIDO.md)**
    - Quick start para novos desenvolvedores
    - Comandos principais
    - Como adicionar features
    - Como fazer deploy

13. **[13-FEATURES-ATIVAS.md](./13-FEATURES-ATIVAS.md)**
    - Features implementadas
    - Features em desenvolvimento
    - Roadmap
    - Status de cada feature

14. **[14-TROUBLESHOOTING.md](./14-TROUBLESHOOTING.md)**
    - Problemas comuns
    - Soluções
    - Debug tips
    - Performance tips

---

## 🚀 Quick Navigation

### Para Iniciantes
1. Comece com [01-VISAO-GERAL.md](./01-VISAO-GERAL.md)
2. Entenda a estrutura em [02-PROJETOS.md](./02-PROJETOS.md)
3. Aprenda como contribuir em [12-GUIA-RAPIDO.md](./12-GUIA-RAPIDO.md)

### Para Desenvolvedores
1. [03-ESTRUTURA-PASTAS.md](./03-ESTRUTURA-PASTAS.md) - Entender a organização
2. [07-PADROES-CODIGO.md](./07-PADROES-CODIGO.md) - Padrões de código
3. [06-COMPONENTES-HOOKS.md](./06-COMPONENTES-HOOKS.md) - Componentes disponíveis
4. [05-ARQUITETURA.md](./05-ARQUITETURA.md) - Arquitetura geral

### Para DevOps/Infra
1. [04-BUILD-DEPLOY.md](./04-BUILD-DEPLOY.md) - Pipeline de deploy
2. [08-BRANCHES-GIT.md](./08-BRANCHES-GIT.md) - Git workflow
3. [09-DATABASE-SUPABASE.md](./09-DATABASE-SUPABASE.md) - Database setup
4. [10-CONFIGURACOES.md](./10-CONFIGURACOES.md) - Configurações

### Para QA/Testes
1. [13-FEATURES-ATIVAS.md](./13-FEATURES-ATIVAS.md) - O que testar
2. [14-TROUBLESHOOTING.md](./14-TROUBLESHOOTING.md) - Problemas conhecidos
3. [12-GUIA-RAPIDO.md](./12-GUIA-RAPIDO.md) - Como rodar local

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| **Total de Projetos** | 3 (2 ativos) |
| **Linguagem Principal** | TypeScript/React |
| **Arquivos TS/TSX** | 376 arquivos |
| **Componentes React** | 40+ |
| **Páginas/Rotas** | 12 |
| **Custom Hooks** | 14 |
| **Serviços** | 14 |
| **Linhas de Código** | ~50k+ |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Vercel |

---

## 🏗️ Estrutura Geral

```
loteriAI/
├── LP_loteri.AI/        ✅ Projeto Principal (Ativo)
│   ├── app/            (React App - Análise de loterias)
│   ├── quiz-app/       (React App - Quiz)
│   ├── public/         (Landing Page HTML)
│   └── dist/           (Build output)
├── App/                ⚠️ Projeto Antigo (Descontinuado)
├── Docs/               (Documentação)
├── supabase/           (Database & Cloud Functions)
└── scripts/            (Scripts utilitários)
```

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/brunofalci00/loteriAI
- **Deploy:** https://fqdigital.com.br
- **App:** https://fqdigital.com.br/app
- **Quiz:** https://fqdigital.com.br/quiz

---

## 📝 Última Atualização

**Data:** Novembro 2025
**Status:** ✅ Documentação Completa
**Versão:** 1.0

---

## 📞 Contato & Suporte

Para dúvidas sobre a documentação, abra uma issue no repositório ou entre em contato com o time de desenvolvimento.

---

**Desenvolvido por:** Bruno Falci & Claude Code
**Tecnologia:** Vite + React + TypeScript + Supabase + Vercel
