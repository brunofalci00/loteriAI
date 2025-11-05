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

  /**
   * Obter cookies do Facebook
   */
  function getFacebookCookies() {
    const cookies = document.cookie.split(';');
    const fbc = cookies.find(c => c.trim().startsWith('_fbc='))?.split('=')[1];
    const fbp = cookies.find(c => c.trim().startsWith('_fbp='))?.split('=')[1];
    return { fbc, fbp };
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
      const { fbc, fbp } = getFacebookCookies();
      const eventId = generateEventId();

      const payload = {
        event_name: eventName,
        user_data: {
          ...userData,
          fbc: fbc || undefined,
          fbp: fbp || undefined,
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

  console.log('[FB-CAPI] Helper carregado e pronto para uso');
})();
