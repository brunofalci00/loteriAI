/**
 * FB Parameter Builder (Lite)
 * Objetivo: Maximizar cobertura de fbp/fbc de forma compatível com a Meta.
 * - Gera _fbp no formato fb.1.{timestamp}.{random} caso o Pixel ainda não tenha criado
 * - Cria/atualiza _fbc a partir de fbclid presente na URL (fb.1.{timestamp}.{fbclid})
 * - Expira ambos em 90 dias (padrão Meta)
 * - Não bloqueia a página se algo falhar
 */
(function () {
  try {
    function setCookie(name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      const host = window.location.hostname;
      const rootDomain = host.includes('.') ? host.replace(/^[^.]+\./, '') : '';
      const parts = [
        `${name}=${value}`,
        `expires=${expires.toUTCString()}`,
        'path=/',
        'SameSite=Lax',
      ];
      if (rootDomain) parts.push(`domain=.${rootDomain}`);
      document.cookie = parts.join(';');
    }

    function getCookie(name) {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith(name + '='));
      return cookie ? cookie.split('=')[1] : null;
    }

    function ensureFbp() {
      let fbp = getCookie('_fbp');
      if (!fbp) {
        const ts = Date.now();
        const rand = Math.floor(Math.random() * 1e10);
        fbp = `fb.1.${ts}.${rand}`;
        setCookie('_fbp', fbp, 90);
        console.log('[FB-PBLite] _fbp gerado:', fbp);
      }
      return fbp;
    }

    function ensureFbcFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid');
      if (fbclid) {
        const fbc = `fb.1.${Date.now()}.${fbclid}`;
        setCookie('_fbc', fbc, 90);
        console.log('[FB-PBLite] _fbc atualizado de fbclid:', fbc);
        return fbc;
      }
      return getCookie('_fbc');
    }

    const fbp = ensureFbp();
    const fbc = ensureFbcFromUrl();

    // Expor para diagnósticos/uso opcional
    window.__fbParameterBuilder = { fbp, fbc, refresh: () => ({ fbp: ensureFbp(), fbc: ensureFbcFromUrl() }) };
  } catch (e) {
    console.warn('[FB-PBLite] Falha ao inicializar:', e);
  }
})();

