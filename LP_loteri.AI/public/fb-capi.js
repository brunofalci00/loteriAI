/**
 * Facebook Conversions API (CAPI) Helper
 * Para Landing Page Estática
 *
 * Este script envia eventos server-side para Facebook via Edge Function do Supabase
 */

(function() {
  'use strict';

  // Configuração
  const EDGE_FUNCTION_URL = 'https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/facebook-capi';
  const IP_ENDPOINT_URL = 'https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/get-client-ip';

  /**
   * Definir cookie com expiry
   */
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

  /**
   * Obter cookie específico
   */
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
  }

  /**
   * Processar fbclid da URL e criar/atualizar cookie _fbc
   * Seguindo boas práticas da Meta: fb.1.{timestamp}.{fbclid}
   * IMPORTANTE: _fbc é case-sensitive, não converter para lowercase
   */
  function processFbclid() {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');

    if (fbclid) {
      const timestamp = Date.now();
      const fbc = `fb.1.${timestamp}.${fbclid}`;
      // Cookie _fbc expira em 90 dias (padrão Meta)
      setCookie('_fbc', fbc, 90);
      console.log('[FB-CAPI] Cookie _fbc criado:', fbc);
      return fbc;
    }

    // Retornar _fbc existente se não há fbclid na URL
    return getCookie('_fbc');
  }

  /**
   * Buscar IP do cliente (IPv6 prioritário) e armazenar em _fbi
   * Seguindo recomendação Meta: tentar IPv6 primeiro, fallback para IPv4
   */
  async function fetchAndStoreClientIp() {
    try {
      // Verificar se já temos IP armazenado (válido por 24h)
      const existingIp = getCookie('_fbi');
      if (existingIp) {
        console.log('[FB-CAPI] IP já armazenado em _fbi:', existingIp);
        return existingIp;
      }

      // Buscar IP do servidor
      const response = await fetch(IP_ENDPOINT_URL);
      if (response.ok) {
        const data = await response.json();
        const clientIp = data.ip;

        if (clientIp) {
          // Armazenar IP em cookie _fbi por 24 horas
          setCookie('_fbi', clientIp, 1);
          console.log('[FB-CAPI] IP armazenado em _fbi:', clientIp, '(IPv6:', data.isIPv6 + ')');
          return clientIp;
        }
      }
    } catch (error) {
      console.error('[FB-CAPI] Erro ao buscar IP do cliente:', error);
    }
    return null;
  }

  /**
   * Aguardar Pixel da Meta inicializar e criar _fbp
   * Importante: _fbp é criado pelo Pixel de forma assíncrona
   */
  function waitForPixelInit(maxWaitMs = 2000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        const fbp = getCookie('_fbp');

        // Se _fbp existe, Pixel inicializou
        if (fbp) {
          clearInterval(checkInterval);
          console.log('[FB-CAPI] Pixel inicializado, _fbp detectado:', fbp);
          resolve(fbp);
          return;
        }

        // Timeout: continuar sem _fbp após 2 segundos
        if (Date.now() - startTime > maxWaitMs) {
          clearInterval(checkInterval);
          console.warn('[FB-CAPI] Timeout aguardando _fbp, continuando sem cookie');
          resolve(null);
        }
      }, 100); // Verificar a cada 100ms
    });
  }

  /**
   * Garantir existência de _fbp mesmo sem Pixel (SDK leve / Parameter Builder)
   * Formato recomendado: fb.1.{timestamp}.{random}
   */
  function ensureFbp() {
    let fbp = getCookie('_fbp');
    if (!fbp) {
      const ts = Date.now();
      const rand = Math.floor(Math.random() * 1e10);
      fbp = `fb.1.${ts}.${rand}`;
      // Persistir por 90 dias para consistência com Pixel
      setCookie('_fbp', fbp, 90);
      console.log('[FB-CAPI] _fbp gerado (fallback):', fbp);
    }
    return fbp;
  }

  /**
   * Obter cookies do Facebook (incluindo _fbi)
   */
  function getFacebookCookies() {
    const fbc = getCookie('_fbc');
    const fbp = getCookie('_fbp') || null;
    const fbi = getCookie('_fbi');
    return { fbc, fbp, fbi };
  }

  /**
   * Gerar external_id baseado em session
   * Usado para melhorar Event Match Quality (+12%)
   * Formato: hash simples de navegador + timestamp de sessão
   */
  function getOrCreateExternalId() {
    let externalId = getCookie('_external_id');

    if (!externalId) {
      // Gerar ID único de sessão: timestamp + random
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      externalId = 'lp_' + sessionId;

      // Armazenar por 24 horas
      setCookie('_external_id', externalId, 1);
      console.log('[FB-CAPI] external_id criado:', externalId);
    }

    return externalId;
  }

  /**
   * Obter parâmetros UTM da URL
   */
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
    };
  }

  /**
   * Gerar event_id único para deduplicação
   * Usa o mesmo formato do pixel browser-side
   */
  function generateEventId() {
    return 'lp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Enviar evento para Facebook CAPI via Edge Function
   */
  async function sendFacebookEvent(eventName, userData, customData) {
    try {
      // Garantir melhor cobertura de fbp: se ainda não existir, aguardar Pixel
      let { fbc, fbp, fbi } = getFacebookCookies();
      if (!fbp) {
        await waitForPixelInit(4000);
        // Re-ler cookies após aguardar
        let cookies = getFacebookCookies();
        fbc = cookies.fbc;
        fbp = cookies.fbp;
        fbi = cookies.fbi;
        // Se ainda não houver _fbp, gerar fallback compatível (Parameter Builder leve)
        if (!fbp) {
          fbp = ensureFbp();
        }
      }
      const eventId = generateEventId();
      const externalId = getOrCreateExternalId();

      const payload = {
        event_name: eventName,
        user_data: {
          ...userData,
          fbc: fbc || undefined,
          fbp: fbp || undefined,
          fbi: fbi || undefined,
          external_id: userData.external_id || externalId, // Sempre incluir external_id
        },
        custom_data: customData,
        event_source_url: window.location.href,
        event_id: eventId,
      };

      console.log('[FB-CAPI] Enviando evento:', eventName, payload);

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[FB-CAPI] Evento enviado com sucesso:', result);

        // IMPORTANTE: Também disparar pixel browser-side com MESMO event_id
        // para que Facebook faça deduplicação correta
        if (typeof fbq === 'function') {
          fbq('track', eventName, customData, { eventID: eventId });
        }
      } else {
        const error = await response.text();
        console.error('[FB-CAPI] Erro ao enviar evento:', error);
      }
    } catch (error) {
      console.error('[FB-CAPI] Erro na requisição:', error);
      // Não bloquear a página se CAPI falhar
    }
  }

  /**
   * Track ViewContent
   * Usar quando: Usuário carrega página importante (index.html)
   */
  window.fbCAPI_trackViewContent = function(options = {}) {
    const utm = getUTMParams();

    sendFacebookEvent('ViewContent', {
      em: options.email || undefined,
      external_id: options.userId || undefined,
    }, {
      content_name: options.contentName || document.title,
      content_type: options.contentType || 'landing_page',
      value: options.value || undefined,
      currency: options.currency || 'BRL',
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
    });
  };

  /**
   * Track Lead
   * Usar quando: Usuário inicia quiz ou fornece informações
   */
  window.fbCAPI_trackLead = function(options = {}) {
    const utm = getUTMParams();

    sendFacebookEvent('Lead', {
      em: options.email || undefined,
      external_id: options.userId || undefined,
    }, {
      content_name: options.contentName || 'Quiz Iniciado',
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
    });
  };

  /**
   * Track CompleteRegistration
   * Usar quando: Usuário completa quiz
   */
  window.fbCAPI_trackCompleteRegistration = function(options = {}) {
    const utm = getUTMParams();

    sendFacebookEvent('CompleteRegistration', {
      em: options.email || undefined,
      external_id: options.userId || undefined,
    }, {
      content_name: options.contentName || 'Quiz Completo',
      status: options.status || 'completed',
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
    });
  };

  /**
   * Track AddToCart
   * Usar quando: Usuário clica em CTA de compra (antes do checkout)
   */
  window.fbCAPI_trackAddToCart = function(options = {}) {
    const utm = getUTMParams();

    sendFacebookEvent('AddToCart', {
      em: options.email || undefined,
      external_id: options.userId || undefined,
    }, {
      content_name: options.contentName || 'Plano Básico',
      value: options.value || 37.00,
      currency: options.currency || 'BRL',
      num_items: options.numItems || 1,
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
    });
  };

  /**
   * Track InitiateCheckout
   * Usar quando: Usuário clica no CTA de compra
   */
  window.fbCAPI_trackInitiateCheckout = function(options = {}) {
    const utm = getUTMParams();

    sendFacebookEvent('InitiateCheckout', {
      em: options.email || undefined,
      external_id: options.userId || undefined,
    }, {
      content_name: options.contentName || 'Plano Básico',
      value: options.value || 37.00,
      currency: options.currency || 'BRL',
      num_items: options.numItems || 1,
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
    });
  };

  /**
   * Track Purchase
   * Usar quando: Pagamento confirmado (thanks.html)
   */
  window.fbCAPI_trackPurchase = function(options = {}) {
    const utm = getUTMParams();

    sendFacebookEvent('Purchase', {
      em: options.email || undefined,
      ph: options.phone || undefined,
      fn: options.firstName || undefined,
      ln: options.lastName || undefined,
      external_id: options.userId || undefined,
    }, {
      content_name: options.contentName || 'Plano Básico',
      value: options.value || 37.00,
      currency: options.currency || 'BRL',
      num_items: options.numItems || 1,
      transaction_id: options.transactionId || undefined,
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
    });
  };

  /**
   * Inicialização: Processar parâmetros automaticamente
   * Seguindo boas práticas Meta: processar cookies o quanto antes
   */
  (async function init() {
    // 1. Aguardar Pixel da Meta inicializar e criar _fbp
    await waitForPixelInit();

    // 2. Processar fbclid da URL e criar/atualizar _fbc
    processFbclid();

    // 3. Buscar e armazenar IP do cliente (IPv6 prioritário) em _fbi
    fetchAndStoreClientIp();

    // 4. Gerar/obter external_id para melhor match
    getOrCreateExternalId();

    console.log('[FB-CAPI] Helper carregado e inicializado');
    console.log('[FB-CAPI] Cookies Facebook:', getFacebookCookies());
  })();
})();
