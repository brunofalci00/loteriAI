# ⏰ Ativar Mega da Virada no Dia 31 de Dezembro

**Status:** Evento **DESATIVADO** até 31 de dezembro de 2025

---

## Por que desativado agora?

- O evento real começa em 31 de dezembro (faltam ~48 dias)
- Um countdown de 48 dias não faz sentido
- Melhor ativar próxima semana (25-26 de dezembro) com countdown de 5-6 dias

---

## Como Ativar no Dia 31 de Dezembro

### PASSO 1: Abrir `Dashboard.tsx`
```
App/app/src/pages/Dashboard.tsx
```

### PASSO 2: Descomenta a importação (linha 7)
**Procure por:**
```typescript
// import { MegaEventHero } from "@/components/MegaEventHero";
```

**Mude para:**
```typescript
import { MegaEventHero } from "@/components/MegaEventHero";
```

### PASSO 3: Descomenta a renderização (linha 172)
**Procure por:**
```typescript
{/* TODO: Ativar MegaEventHero no dia 31 de dezembro (próxima semana antes da data) */}
```

**Mude para:**
```typescript
<MegaEventHero />
```

### PASSO 4: Build e commit
```bash
cd App
npm run build
```

Se passou (2748 modules, zero errors):
```bash
cd ..
git add -A
git commit -m "feat: Ativar Mega da Virada no dia 31 de dezembro"
git push origin feat/mega-da-virada-refactoring
```

### PASSO 5: Deploy
- Fazer PR para master
- Merge em staging
- Deploy em produção antes das 23:59 do dia 31

---

## Componente Está Pronto?

✅ **SIM!** O componente `MegaEventHero.tsx` já está 100% pronto:
- ✅ Countdown ao vivo (atualiza a cada 60s)
- ✅ Golden gradient dourado
- ✅ Responsive (mobile, tablet, desktop)
- ✅ 2 CTAs: "Entrar no evento" + "Construir jogo manual"
- ✅ Créditos unificados (1 crédito por ação)

---

## Dates Já Corretas?

✅ **SIM!** Os dates já foram atualizados:
- eventDate: 2025-12-31 23:59:59
- endDate: 2026-01-07 23:59:59

---

## Próximos Passos

1. **Dia 25 de dezembro:** Relembrar para ativar
2. **Dia 31 de dezembro (antes das 23:59):** Descomentaras linhas em Dashboard.tsx
3. **Dia 01 de janeiro:** Banner mostra countdown "00:00:00"
4. **Dia 07 de janeiro:** Banner desaparece automaticamente (evento encerrado)

---

## Suporte

Se algo der errado:
1. Verifique se o import está correto
2. Verifique se a renderização está sendo feita
3. Rode `npm run build` para validar
4. Cheque o console do navegador (F12 → Console)

---

**Salvo em:** `Docs/Mega_virada/ATIVAR_EVENTO_NO_DIA_31.md`
**Status:** Evento pronto, apenas esperar a data
