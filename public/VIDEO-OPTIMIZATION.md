# 🎥 Guia de Otimização de Vídeos - Landing Page

## 📊 Status Atual

| Vídeo | Tamanho Atual | Uso |
|-------|---------------|-----|
| IMG_4762.mp4 | 29 MB | Depoimento testimonial |
| IMG_4783.mp4 | 29 MB | Demo da plataforma |
| IMG_4791.mp4 | 17 MB | (não usado no HTML atual) |
| IMG_4792.mp4 | 18 MB | (não usado no HTML atual) |

---

## ✅ FASE 1: COMPRESSÃO (OBRIGATÓRIO)

### Como Comprimir os Vídeos

**Opção A: Usar o Script Automático (Recomendado)**

1. **Instalar FFmpeg:**
   - Download: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
   - Extrair para `C:\ffmpeg`
   - Adicionar `C:\ffmpeg\bin` ao PATH do Windows

2. **Executar script:**
   ```bash
   cd C:\Users\bruno\Documents\Black\Loter.IA\Prod\LP_loteri.AI\public
   compress-videos.bat
   ```

3. **Aguardar:**
   - Processamento leva ~5-10 minutos
   - Originais salvos em `originals/`
   - Vídeos comprimidos substituem os originais

**Opção B: Compressão Online (Sem FFmpeg)**

Se não puder instalar FFmpeg:
- CloudConvert: https://cloudconvert.com/mp4-converter
- Configurações:
  - Codec: H.264
  - Resolução: 1280x720 (720p)
  - Bitrate: 1-2 Mbps
  - Audio: AAC 128 kbps

---

## ✅ FASE 2: LAZY LOADING (JÁ IMPLEMENTADO)

### O que foi feito:

**1. HTML Otimizado:**
```html
<!-- Vídeos agora carregam sob demanda -->
<video
  controls
  preload="metadata"
  playsinline
  data-lazy-video
  data-video-src="IMG_4762.mp4">
  <source data-src="IMG_4762.mp4" type="video/mp4">
  <p>Seu navegador não suporta reprodução de vídeo.
    <a href="IMG_4762.mp4" download>Baixar vídeo</a>
  </p>
</video>
```

**2. JavaScript (quiz.js):**
- `initVideoLazyLoading()`: Carrega vídeo quando slide fica visível
- `addVideoLoadingStates()`: Indicadores de loading/erro
- IntersectionObserver: Detecta visibilidade do vídeo

**3. CSS (quiz.css):**
- `.video-loading`: Spinner animado
- `.video-ready`: Fade-in suave
- `.video-error`: Mensagem de erro user-friendly

---

## 📊 Resultados Esperados

### Antes da Otimização:
| Métrica | Valor |
|---------|-------|
| Tamanho total | ~93 MB (4 vídeos) |
| Carregamento página | 2-4 minutos (1 Mbps) |
| Experiência mobile | ⚠️ Ruim |
| Taxa de rejeição | 🔴 Alta |

### Depois da Otimização:
| Métrica | Valor |
|---------|-------|
| Tamanho total | ~15 MB (85% redução) |
| Carregamento inicial | 0 MB (lazy load) |
| Carregamento vídeo | 30 segundos (1 Mbps) |
| Experiência mobile | ✅ Boa |
| Taxa de rejeição | 🟢 Baixa |

---

## 🎯 Benefícios Implementados

### 1. Lazy Loading
- ✅ Vídeos só carregam quando visíveis
- ✅ Página inicial rápida (0 MB de vídeo)
- ✅ Economiza banda se usuário não rolar até o vídeo

### 2. Loading States
- ✅ Spinner animado durante carregamento
- ✅ Fade-in suave quando pronto
- ✅ Mensagem de erro se falhar

### 3. Fallbacks
- ✅ Link de download se vídeo não carregar
- ✅ Mensagem clara sobre conexão lenta
- ✅ Compatibilidade cross-browser

### 4. Indicadores Visuais
```
[Carregando] → Spinner + "Carregando vídeo..."
[Pronto]     → Fade-in suave
[Erro]       → Mensagem + Link download
```

---

## 🔧 Manutenção

### Adicionar Novo Vídeo:

**1. Comprimir o vídeo:**
```bash
ffmpeg -i meu-video.mp4 -c:v libx264 -crf 28 -preset slow -vf "scale=1280:-2" -c:a aac -b:a 128k meu-video-compressed.mp4
```

**2. Adicionar no HTML:**
```html
<video
  controls
  preload="metadata"
  playsinline
  data-lazy-video
  data-video-src="meu-video.mp4">
  <source data-src="meu-video.mp4" type="video/mp4">
  <p>Fallback text aqui</p>
</video>
```

**3. Build e deploy:**
```bash
npm run build
git add .
git commit -m "feat: Add new video with optimization"
git push
```

### Verificar Performance:

**Console do navegador (F12):**
```javascript
// Deve ver:
📹 Video carregado: IMG_4762.mp4
🎬 Video optimization initialized
```

**Network tab:**
- Vídeos não devem aparecer no carregamento inicial
- Vídeos carregam apenas quando scroll chega no slide

---

## 🎓 Troubleshooting

### Vídeo não carrega:
1. Verificar console (F12) por erros
2. Checar se arquivo existe em `public/`
3. Verificar sintaxe HTML (`data-video-src` correto?)

### Vídeo muito lento:
1. Comprimir mais (CRF 30 em vez de 28)
2. Reduzir resolução (720p → 480p)
3. Considerar CDN (Cloudinary/Bunny)

### Script de compressão falha:
1. Verificar se FFmpeg está instalado: `ffmpeg -version`
2. Verificar PATH do Windows
3. Executar como administrador

---

## 📈 Próximas Otimizações (Futuro)

### Fase 3: CDN & Streaming
- [ ] Hospedar vídeos em Cloudinary/Bunny
- [ ] Streaming adaptativo (auto-adjust qualidade)
- [ ] Múltiplas resoluções (240p, 480p, 720p)
- [ ] Thumbnails automáticos

### Fase 4: Analytics
- [ ] Rastrear quantos % assistem o vídeo
- [ ] Tempo médio de visualização
- [ ] Taxa de conclusão
- [ ] A/B testing de thumbnails

---

## 📚 Recursos

- **FFmpeg Download:** https://www.gyan.dev/ffmpeg/builds/
- **Video Compression Guide:** https://trac.ffmpeg.org/wiki/Encode/H.264
- **Lazy Loading API:** https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
- **CloudConvert:** https://cloudconvert.com/mp4-converter

---

## ✅ Checklist de Deploy

Antes de fazer deploy:

- [ ] Vídeos comprimidos (< 5 MB cada)
- [ ] Build passou sem erros
- [ ] Testado em localhost
- [ ] Testado loading em Network Slow 3G (DevTools)
- [ ] Console sem erros
- [ ] Vídeos carregam sob demanda
- [ ] Spinner aparece durante loading
- [ ] Commit com mensagem descritiva

---

**Última atualização:** 2025-01-03
**Responsável:** Claude Code
