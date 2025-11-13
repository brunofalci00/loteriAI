# Workflows Automáticos - Guia Rápido em Português

Seu repositório está configurado com **3 workflows inteligentes** baseados nos workflows do repositório `claude-code-workflows`. Cada um é implementado como subagentes do Claude Code + slash commands.

---

## 🚀 Quick Start - Use Imediatamente

### Comando 1: Revisão de Código

```bash
/review
```

Analisa as mudanças na sua branch atual verificando:
- **Arquitetura e Design** - Padrões arquiteturais, modularidade
- **Funcionalidade** - Lógica de negócio, tratamento de erros
- **Segurança** - Validação de entrada, autenticação
- **Manutenibilidade** - Clareza, naming, documentação
- **Testes** - Cobertura e qualidade
- **Performance** - Eficiência, escalabilidade

**Exemplo:**
```
Implementei um novo endpoint de autenticação. Por favor, revise usando /review
```

---

### Comando 2: Revisão de Segurança

```bash
/security-review
```

Análise focada em vulnerabilidades com alto grau de confiança (>80%):
- **SQL Injection, Command Injection, XXE**
- **Autenticação e Autorização** - Bypass, escalação de privilégio
- **Gerenciamento de Secrets** - Chaves hardcoded, criptografia fraca
- **Code Execution** - RCE, desserialização, XSS
- **Vazamento de Dados** - Logging de dados sensíveis, PII

**Exemplo:**
```
Adicionei um endpoint para exportar dados dos usuários. Revise para vulnerabilidades com /security-review
```

---

### Comando 3: Revisão de Design

```bash
/design-review
```

Análise visual e de UX/Acessibilidade (testa UI em tempo real):
- **Interatividade** - Fluxos de usuário, estados interativos
- **Responsividade** - Mobile (375px), Tablet (768px), Desktop (1440px)
- **Acessibilidade** - WCAG 2.1 AA, navegação por teclado, contraste
- **Polish Visual** - Alinhamento, espaçamento, tipografia, cores
- **Robustez** - Validação de formulários, edge cases, estados de erro

**Exemplo:**
```
Redesenhei o dashboard. Por favor, revise o design com /design-review
```

---

## 📂 Estrutura de Arquivos

```
.
├── claude.md                              # 📘 Documentação completa dos workflows
├── WORKFLOWS.pt.md                        # Este arquivo
│
├── .claude/
│   ├── commands/                          # Slash commands (/review, /security-review, etc.)
│   │   ├── review.md
│   │   ├── security-review.md
│   │   └── design-review.md
│   │
│   ├── subagents/                         # Agentes especializados
│   │   ├── pragmatic-code-review.md       # Código (usa Opus)
│   │   ├── security-review.md             # Segurança (usa Opus)
│   │   └── design-review.md               # Design (usa Sonnet + Playwright)
│   │
│   └── context/
│       └── design-principles.md           # 🎨 Customize seus design principles aqui
│
└── claude-code-workflows/                 # Repositório original (referência)
```

---

## 🎯 Quando Usar Cada Workflow

### Revisão de Código (`/review`)

Use **após implementar**:
- ✅ Uma nova feature
- ✅ Um refactor significativo
- ✅ Antes de fazer merge para main
- ✅ Quando quer feedback em decisões arquiteturais

**Não use para**: issues triviais ou comentários rápidos

---

### Revisão de Segurança (`/security-review`)

Use **antes de mergear**:
- ✅ Qualquer código que toca autenticação/autorização
- ✅ APIs que aceitam entrada de usuário
- ✅ Operações de criptografia ou secrets
- ✅ Código que será deployado em produção
- ✅ Mudanças em dados sensíveis (pagamentos, PII)

**O que NÃO analisa**:
- ❌ DoS vulnerabilities (handled separately)
- ❌ Rate limiting concerns
- ❌ Secrets em disk (já gerenciado)
- ❌ Issues em testes

---

### Revisão de Design (`/design-review`)

Use **para mudanças UI/UX**:
- ✅ Novos componentes visuais
- ✅ Redesigns de páginas
- ✅ Mudanças em forms e inputs
- ✅ Qualquer coisa visual que precisa de validação

**Requer**: A mudança deve estar visível em um preview URL (dev server rodando)

---

## 🧠 Como os Agentes Funcionam

### Pragmatic Code Review Agent

Usa framework **"Pragmatic Quality"** que prioriza:

1. **Net Positive > Perfeição** - Se melhora a saúde geral do código, é bom
2. **Substância > Estilo** - Foca em arquitetura, design, lógica de negócio
3. **Princípios Fundamentados** - SOLID, DRY, KISS, YAGNI
4. **Comunicação Clara** - Dicas menores começam com "Nit:"

**Output típico:**

```markdown
### Code Review Summary
A implementação do auth melhora a saúde do código através de separação clara.

### Findings

#### Critical Issues
- `auth.ts:45`: Input não é validado antes de hash. Adicione validação.

#### Suggested Improvements
- `auth.ts:60`: Considere tornar token TTL configurável via env.

#### Nitpicks
- Nit: `types.ts:8`: Remove prefixo deprecated 'I' do nome da interface.
```

---

### Security Review Agent

Usa análise em **3 fases**:

1. **Phase 1** - Identifica vulnerabilidades em potencial
2. **Phase 2** - Filtra false positives (>80% confiança)
3. **Phase 3** - Reporta apenas HIGH/MEDIUM com evidência

**Output típico:**

```markdown
# Vuln 1: SQL Injection: `api.ts:156`

* Severity: HIGH
* Description: Email parameter diretamente concatenado em SQL
* Exploit: Attacker envia `' OR '1'='1` para bypass
* Recommendation: Use parameterized queries
```

---

### Design Review Agent

Testa a **UI ao vivo** em 7 fases:

1. **Interaction** - Fluxos de usuário, estados interativos
2. **Responsividade** - 3 viewports (mobile/tablet/desktop)
3. **Visual Polish** - Alinhamento, espaçamento, tipografia
4. **Acessibilidade** - WCAG 2.1 AA (teclado, contraste, labels)
5. **Robustez** - Validação, edge cases, estados de erro
6. **Code Health** - Reutilização de componentes, design tokens
7. **Content** - Gramática, erros no console

---

## 🎨 Customizando Design Principles

Edite `.claude/context/design-principles.md` com:

- ✏️ Suas cores e paleta
- ✏️ Typography standards
- ✏️ Spacing scale
- ✏️ Component patterns
- ✏️ Accessibility requirements
- ✏️ Dark mode specs

O agent de design referencia esse arquivo automaticamente!

---

## 📊 Exemplo de Uso Completo

**Seu workflow típico:**

```bash
# 1. Você implementa uma feature
git commit -m "Add user dashboard"

# 2. Pede revisão de código
/review

# 3. Se toca segurança, pede revisão de segurança
/security-review

# 4. Se tem mudanças visuais, valida design
/design-review

# 5. Resolve feedback dos agents

# 6. Faz merge
git push origin feature/dashboard
```

---

## 🔧 Invocando Agents Diretamente

Você também pode invocar agents diretamente em mensagens:

```
"Implementei um novo sistema de cache. Por favor, revise com @agent-pragmatic-code-review"

"Essa API endpoint trata dados de pagamento. Verifique com @agent-security-review"

"Redesenhei o mobile UI. Avalie acessibilidade com @agent-design-review"
```

---

## 🚨 Importante: Configuração de Design Review

O agent de design precisa de um **preview URL** rodando. Isso significa:

1. ✅ Você tem um dev server rodando (e.g., `localhost:3000`)
2. ✅ As mudanças estão visíveis nesse preview
3. ✅ O agent usa Playwright para testar o UI ao vivo

**Se design-review não funcionar**: Certifique-se de que tem um preview disponível!

---

## 📚 Documentação Completa

Veja `claude.md` para:
- Detalhes completos de cada workflow
- Framework de revisão completo
- Guia de customização
- Best practices
- Referências e recursos

---

## 🤔 Troubleshooting

### "Slash command não funciona"
- Confirme que o arquivo está em `.claude/commands/`
- Reinicie Claude Code se necessário

### "Agent não roda"
- Verifique que o arquivo do subagent está em `.claude/subagents/`
- Confirme que o nome está correto (ex: `@agent-pragmatic-code-review`)

### "Design review falha"
- Confirme que seu dev server está rodando
- Verifique que o preview URL é acessível
- Veja se há erros no console do browser

---

## 💡 Pro Tips

1. **Use `/review` frequentemente** - Feedback rápido durante desenvolvimento
2. **Sempre use `/security-review` antes de merge** - Catch issues cedo
3. **Customize `design-principles.md`** - Seus design standards são consultados
4. **Verifique a confiança do agent** - HIGH/MEDIUM são sempre reportados
5. **Não ignore findings** - Cada um tem evidência concreta

---

## 📞 Suporte

- **Issues no Claude Code**: https://github.com/anthropics/claude-code/issues
- **Documentação oficial**: https://docs.claude.com/en/docs/claude-code
- **Repositories originals**:
  - https://github.com/OneRedOak/claude-code-workflows
  - https://github.com/anthropics/claude-code-action
  - https://github.com/anthropics/claude-code-security-review

---

**Setup completo!** Seus 3 workflows estão prontos. Comece com `/review` na próxima mudança que fizer! 🎉
