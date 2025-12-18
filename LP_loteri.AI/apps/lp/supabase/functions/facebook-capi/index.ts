import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createHash } from 'https://deno.land/std@0.140.0/hash/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Facebook CAPI Configuration
const FACEBOOK_API_VERSION = 'v18.0';
const FACEBOOK_PIXEL_ID = '369969430611939';
const FACEBOOK_API_BASE_URL = Deno.env.get('FACEBOOK_API_BASE_URL') || Deno.env.get('SIGNALS_GATEWAY_URL') || 'https://rzagub.fqdigital.com.br';
const DEFAULT_FACEBOOK_ACCESS_TOKEN =
  'EAAUGxPD9l0ABP0vTmpD9iKSzFtuM2JZABZAJBGRmDVnZBdXkEF2ZCiB10Br8i8i9g9IifmNzX2HVe1FRRQZA6OdYRPleeUs9dqBQkYSEgOfEa0CqJKJHrTB8FRFZBhaelCnbWrqa4HmEZCUQSP01SLohNvfCOVTKQyMaF5WrubWV1Cd8PzsbvTtJsJ0TJnHIgZDZD';
const FACEBOOK_ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN') || DEFAULT_FACEBOOK_ACCESS_TOKEN;

if (!Deno.env.get('FACEBOOK_ACCESS_TOKEN')) {
  console.warn('[facebook-capi] FACEBOOK_ACCESS_TOKEN não definido. Utilizando token padrão do repositório.');
}

interface UserData {
  em?: string[];      // email
  ph?: string[];      // phone
  fn?: string[];      // first name
  ln?: string[];      // last name
  ct?: string[];      // city
  st?: string[];      // state
  zp?: string[];      // zip
  country?: string[]; // country
  external_id?: string[]; // external ID
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;       // Facebook click ID cookie
  fbp?: string;       // Facebook browser ID cookie
  fbi?: string;       // Facebook IP cookie (stored client IP)
}

interface CustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
}

interface FacebookEvent {
  event_name: string;
  event_time: number;
  event_source_url: string;
  action_source: string;
  user_data: UserData;
  custom_data?: CustomData;
  event_id?: string;
}

interface FacebookCAPIPayload {
  data: FacebookEvent[];
  test_event_code?: string;
}

/**
 * Normalizar email seguindo padrão oficial Meta
 * - Remover plus addressing (john+promo@example.com → john@example.com)
 * - Remover pontos em Gmail/Googlemail (john.doe@gmail.com → johndoe@gmail.com)
 * - Converter para lowercase
 */
function normalizeEmail(email: string): string {
  let normalized = email.toLowerCase().trim();

  const parts = normalized.split('@');
  if (parts.length !== 2) return normalized; // Email inválido

  let [localPart, domain] = parts;

  // Remover plus addressing
  if (localPart.includes('+')) {
    localPart = localPart.split('+')[0];
  }

  // Remover pontos APENAS para Gmail/Googlemail
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    localPart = localPart.replace(/\./g, '');
  }

  return `${localPart}@${domain}`;
}

/**
 * Normalizar telefone seguindo padrão oficial Meta
 * - Remover caracteres não-numéricos
 * - Adicionar código do país (55 para Brasil)
 */
function normalizePhone(phone: string, countryCode: string = '55'): string {
  // Remover tudo exceto números
  let normalized = phone.replace(/\D/g, '');

  // Remover prefixo 00
  if (normalized.startsWith('00')) {
    normalized = normalized.substring(2);
  }

  // Adicionar código do país se necessário
  if (!normalized.startsWith(countryCode)) {
    // Números brasileiros: 10 ou 11 dígitos (DDD + número)
    if (normalized.length === 10 || normalized.length === 11) {
      normalized = countryCode + normalized;
    }
  }

  return normalized;
}

/**
 * Normalizar nome seguindo padrão oficial Meta
 * - Remover acentos
 * - Remover números e caracteres especiais
 * - Converter para lowercase
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas
    .replace(/[^a-z\s]/g, '') // Remover números e especiais
    .replace(/\s+/g, ' '); // Normalizar espaços
}

/**
 * Hash data using SHA256 (as required by Facebook)
 * IMPORTANTE: Não converter para lowercase aqui - normalização já foi feita
 */
function hashSHA256(data: string): string {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.toString();
}

/**
 * Normalize and hash user data
 */
function normalizeUserData(userData: Partial<UserData>): UserData {
  const normalized: UserData = {};

  // Email: normalizar + hash
  if (userData.em && userData.em.length > 0) {
    normalized.em = userData.em.map(email => {
      const normalizedEmail = normalizeEmail(email);
      return hashSHA256(normalizedEmail);
    });
  }

  // Phone: normalizar + hash
  if (userData.ph && userData.ph.length > 0) {
    normalized.ph = userData.ph.map(phone => {
      const normalizedPhone = normalizePhone(phone, '55'); // Código BR
      return hashSHA256(normalizedPhone);
    });
  }

  // First name: normalizar + hash
  if (userData.fn && userData.fn.length > 0) {
    normalized.fn = userData.fn.map(name => {
      const normalizedName = normalizeName(name);
      return hashSHA256(normalizedName);
    });
  }

  // Last name: normalizar + hash
  if (userData.ln && userData.ln.length > 0) {
    normalized.ln = userData.ln.map(name => {
      const normalizedName = normalizeName(name);
      return hashSHA256(normalizedName);
    });
  }

  // City: normalizar + hash
  if (userData.ct && userData.ct.length > 0) {
    normalized.ct = userData.ct.map(city => {
      const normalizedCity = normalizeName(city); // Mesma lógica de nome
      return hashSHA256(normalizedCity);
    });
  }

  // State: normalizar + hash
  if (userData.st && userData.st.length > 0) {
    normalized.st = userData.st.map(state => {
      const normalizedState = state.toLowerCase().trim();
      return hashSHA256(normalizedState);
    });
  }

  // Zip: normalizar + hash
  if (userData.zp && userData.zp.length > 0) {
    normalized.zp = userData.zp.map(zip => {
      const normalizedZip = zip.replace(/\D/g, ''); // Apenas números
      return hashSHA256(normalizedZip);
    });
  }

  // Country: normalizar + hash
  if (userData.country && userData.country.length > 0) {
    normalized.country = userData.country.map(c => {
      const normalizedCountry = c.toLowerCase().trim();
      return hashSHA256(normalizedCountry);
    });
  }

  // External ID doesn't need hashing
  if (userData.external_id) {
    normalized.external_id = userData.external_id;
  }

  // These should NOT be hashed
  if (userData.client_ip_address) {
    normalized.client_ip_address = userData.client_ip_address;
  }

  if (userData.client_user_agent) {
    normalized.client_user_agent = userData.client_user_agent;
  }

  if (userData.fbc) {
    normalized.fbc = userData.fbc;
  }

  if (userData.fbp) {
    normalized.fbp = userData.fbp;
  }

  // _fbi (Facebook IP cookie) should NOT be hashed
  if (userData.fbi) {
    normalized.fbi = userData.fbi;
  }

  return normalized;
}

/**
 * Send event to Facebook Conversions API
 */
async function sendToFacebookCAPI(payload: FacebookCAPIPayload): Promise<Response> {
  const url = `${FACEBOOK_API_BASE_URL}/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events`;

  console.log('[facebook-capi] 🚀 Enviando evento para Facebook CAPI');
  console.log('[facebook-capi] 📦 Payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      access_token: FACEBOOK_ACCESS_TOKEN,
    }),
  });

  const result = await response.json();

  console.log('[facebook-capi] 📬 Resposta do Facebook:', JSON.stringify(result, null, 2));

  if (!response.ok) {
    throw new Error(`Facebook CAPI Error: ${JSON.stringify(result)}`);
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  console.log('[facebook-capi] 🚀 === INÍCIO DA REQUISIÇÃO ===');
  console.log('[facebook-capi] 🔍 Method:', req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { event_name, user_data, custom_data, event_source_url, event_id, test_event_code } = body;

    // Validate required fields
    if (!event_name) {
      throw new Error('event_name is required');
    }

    if (!user_data) {
      throw new Error('user_data is required');
    }

    // Get client info from headers
    const headerIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const clientUserAgent = req.headers.get('user-agent');

    // Priorizar IP do cookie _fbi (já capturado no cliente) sobre header IP
    // Seguindo recomendação Meta: usar melhor IP disponível
    const clientIp = user_data.fbi || headerIp;

    console.log('[facebook-capi] 📍 IP Source:', user_data.fbi ? '_fbi cookie' : 'headers', '| IP:', clientIp);

    // Normalize and hash user data
    const normalizedUserData = normalizeUserData({
      ...user_data,
      client_ip_address: clientIp || undefined,
      client_user_agent: clientUserAgent || undefined,
    });

    // Build event
    const event: FacebookEvent = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: event_source_url || req.headers.get('referer') || 'https://www.fqdigital.com.br',
      action_source: 'website',
      user_data: normalizedUserData,
      event_id: event_id || crypto.randomUUID(),
    };

    // Add custom data if provided
    if (custom_data) {
      event.custom_data = custom_data;
    }

    // Build payload
    const payload: FacebookCAPIPayload = {
      data: [event],
    };

    // Add test event code if in development
    if (test_event_code) {
      payload.test_event_code = test_event_code;
    }

    // Send to Facebook
    return await sendToFacebookCAPI(payload);

  } catch (error) {
    console.error('[facebook-capi] 💥 Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
