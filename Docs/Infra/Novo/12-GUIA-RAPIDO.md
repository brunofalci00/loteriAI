# 🚀 Guia Rápido para Desenvolvedores

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Clonar Repositório

```bash
git clone https://github.com/brunofalci00/loteriAI.git
cd loteriAI
```

### 2️⃣ Instalar Dependências

```bash
cd LP_loteri.AI
npm run install:all
```

### 3️⃣ Configurar Environment Variables

Criar arquivo `LP_loteri.AI/.env`:

```
VITE_SUPABASE_URL=https://aaqthgqsuhyagsrlnyqk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MEGA_EVENT_ENABLED=true
```

> Peça as credenciais para o team lead

### 4️⃣ Rodar Localmente

```bash
# Terminal 1 - App React
cd LP_loteri.AI/app
npm run dev
# Abre: http://localhost:5173

# Terminal 2 - Quiz App
cd LP_loteri.AI/quiz-app
npm run dev
# Abre: http://localhost:5174
```

✅ **Pronto!** Você tem a aplicação rodando localmente.

---

## 📝 Workflow de Desenvolvimento

### 1. Criar Feature Branch

```bash
git checkout -b feat/sua-feature-descritiva
```

**Padrão de naming:**
- `feat/` - Nova feature
- `fix/` - Bug fix
- `refactor/` - Refactoring
- `docs/` - Documentação

### 2. Fazer Alterações

Trabalhe no código, commit frequentemente:

```bash
git add .
git commit -m "feat: descrição clara do que fez"
```

**Padrão de commit:**
```
feat: Adicionar novo componente de analysis modal
fix: Corrigir bug em autenticação
refactor: Melhorar performance de query
docs: Atualizar documentação de setup
```

### 3. Fazer Push

```bash
git push origin feat/sua-feature-descritiva
```

### 4. Criar Pull Request

No GitHub, criar PR:
- **Base:** `master`
- **Compare:** `feat/sua-feature-descritiva`
- **Descrição:** Explicar o que foi feito e por quê

### 5. Review & Merge

- Aguardar reviews
- Resolver comentários
- Merge depois de aprovação

---

## 🏗️ Estrutura de Pastas (Rápido)

```
LP_loteri.AI/
├── app/                    ← App React Principal
│   └── src/
│       ├── components/    ← Componentes reutilizáveis
│       ├── pages/         ← Páginas/Rotas
│       ├── hooks/         ← Custom hooks
│       ├── services/      ← Lógica de negócio
│       ├── contexts/      ← React Context
│       ├── types/         ← TypeScript types
│       ├── config/        ← Configurações
│       └── App.tsx        ← Root component
│
├── quiz-app/              ← Quiz React
│   └── src/
│
├── public/                ← Landing Page (HTML/CSS)
├── supabase/              ← Database & Cloud Functions
├── scripts/               ← Scripts de build
└── dist/                  ← Build output (gerado)
```

---

## 💡 Tarefas Comuns

### ➕ Adicionar Novo Componente

```bash
# 1. Criar arquivo
LP_loteri.AI/app/src/components/MeuComponente.tsx

# 2. Código template
export const MeuComponente = () => {
  return <div>Meu Componente</div>;
};

# 3. Usar em outra página
import { MeuComponente } from '@/components/MeuComponente';
```

**Padrão:**
- Nome em PascalCase
- Props tipadas com TypeScript
- Shadcn-ui para UI base
- Tailwind para styling

### ➕ Adicionar Nova Página/Rota

```bash
# 1. Criar arquivo
LP_loteri.AI/app/src/pages/MinhaPage.tsx

# 2. Adicionar em App.tsx
<Route path="/minha-page" element={<ProtectedRoute><MinhaPage /></ProtectedRoute>} />

# 3. Linkar de outra página
<Link to="/minha-page">Ir para Minha Page</Link>
```

### ➕ Criar Custom Hook

```bash
# 1. Criar arquivo
LP_loteri.AI/app/src/hooks/useMyHook.ts

# 2. Implementar
export const useMyHook = () => {
  // lógica aqui
  return { /* valores */ };
};

# 3. Usar
const { valor } = useMyHook();
```

### ➕ Criar Serviço

```bash
# 1. Criar arquivo
LP_loteri.AI/app/src/services/myService.ts

# 2. Implementar
export const myFunction = async () => {
  // lógica aqui
};

# 3. Usar
import { myFunction } from '@/services/myService';
```

### ➕ Adicionar Tipo TypeScript

```bash
# 1. Criar em
LP_loteri.AI/app/src/types/myTypes.ts

# 2. Definir
export interface MyType {
  id: string;
  name: string;
}

# 3. Usar
import { MyType } from '@/types/myTypes';
const obj: MyType = { id: '1', name: 'Test' };
```

---

## 🧪 Testar Localmente

### App React

```bash
cd LP_loteri.AI/app
npm run dev

# Abre em http://localhost:5173
# Testa todas as páginas
```

### Quiz App

```bash
cd LP_loteri.AI/quiz-app
npm run dev

# Abre em http://localhost:5174
```

### Build Local

```bash
cd LP_loteri.AI
npm run build

# Verifica se tudo builda corretamente
# Resultado em LP_loteri.AI/dist/
```

---

## 🔍 Debug

### Browser DevTools

```javascript
// F12 para abrir DevTools
// Console: Ver logs
console.log('Debug:', variable);

// Network: Ver requisições
// Verificar status 200, 400, 500, etc

// Application: Ver localStorage, cookies
// Storage tab → ver dados salvos
```

### React DevTools

1. Instalar extensão: React Developer Tools
2. Abrir DevTools → "Components" tab
3. Inspecionar componentes, ver props e state

### VS Code Debug

Adicionar em `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMapPathOverride": {
        "webpack:///*": "${webRoot}/*"
      }
    }
  ]
}
```

---

## 📚 Stack Tecnológico (Referência Rápida)

| Lib | Versão | Uso |
|-----|--------|-----|
| React | 18.3 | UI Framework |
| TypeScript | 5.8 | Tipagem |
| Vite | 5.4 | Build tool |
| TailwindCSS | 3.4 | Estilização |
| Shadcn-ui | latest | Componentes UI |
| React Router | 6.30 | Roteamento |
| Supabase | 2.76 | Backend/Auth |
| React Hook Form | 7.61 | Formulários |
| React Query | 5.83 | State management |
| Zod | 3.25 | Validação |

---

## 🔑 Variáveis de Ambiente

**Arquivo:** `LP_loteri.AI/.env`

```
VITE_SUPABASE_URL=...        # URL do Supabase
VITE_SUPABASE_ANON_KEY=...   # Chave pública
VITE_MEGA_EVENT_ENABLED=true # Flag do evento
```

**Acessar no código:**

```typescript
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## 🐛 Problemas Comuns & Soluções

### "Module not found" error

```bash
# Solução
npm run install:all
npm run build
```

### "Port already in use"

```bash
# Usar porta diferente
npm run dev -- --port 3000
```

### "VITE environment variables not working"

```bash
# Verifique:
# 1. Arquivo .env existe?
# 2. Variáveis têm prefixo VITE_?
# 3. Reiniciou o dev server?
```

### "Supabase connection failed"

```bash
# Verifique:
# 1. .env tem VITE_SUPABASE_URL?
# 2. .env tem VITE_SUPABASE_ANON_KEY?
# 3. Internet está conectada?
# 4. Supabase projeto está online?
```

### Build falha com "TypeScript error"

```bash
# Solução
npm run build -- --force
```

---

## 📋 Checklist Antes de Push

- [ ] Código testado localmente
- [ ] Sem console.log de debug
- [ ] Sem hard-coded values
- [ ] TypeScript sem errors
- [ ] Componentes reutilizáveis
- [ ] Props bem tipadas
- [ ] Comentários claros
- [ ] Commit message descritivo
- [ ] Branch atualizada com main/master

---

## 🚀 Fazer Deploy

### Preview (Antes de merge)

1. Push para seu branch
2. Vercel cria preview URL automaticamente
3. Compartilhar link para review

### Produção (Após merge em master)

1. Merge PR em master
2. Vercel faz deploy automático
3. Verificar em https://fqdigital.com.br

**Tempo:** ~2-3 minutos

---

## 📞 Perguntas Frequentes

**P: Como adiciono uma dependency?**
```bash
cd LP_loteri.AI/app
npm install nova-dependency
```

**P: Como removo uma dependency?**
```bash
npm uninstall package-name
```

**P: Como forço um rebuild?**
```bash
npm run build -- --force
```

**P: Como limpo cache?**
```bash
rm -rf node_modules
npm run install:all
```

**P: Posso modificar vercel.json?**
Sim, mas cuidado! Afeta o deploy.

**P: Como vejo logs de deploy?**
https://vercel.com/dashboard → Projeto → Deployments

---

## 🎓 Próximos Passos

1. **Setup:** Siga o "Setup Rápido" acima
2. **Estrutura:** Leia [02-PROJETOS.md](./02-PROJETOS.md)
3. **Padrões:** Leia [07-PADROES-CODIGO.md](./07-PADROES-CODIGO.md)
4. **Componentes:** Veja [06-COMPONENTES-HOOKS.md](./06-COMPONENTES-HOOKS.md)
5. **Contribuir:** Siga o "Workflow de Desenvolvimento"

---

## 🆘 Suporte

**Dúvidas?**

1. Procure no índice: [00-INDICE.md](./00-INDICE.md)
2. Pergunte no Slack/Discord do time
3. Abra uma issue no GitHub

**Links úteis:**
- Repositório: https://github.com/brunofalci00/loteriAI
- Deploy: https://fqdigital.com.br
- Docs Vite: https://vitejs.dev
- Docs React: https://react.dev
- Docs Supabase: https://supabase.com/docs

---

**Última atualização:** Novembro 2025

**Boa codificação!** 🎉
