import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createHash } from 'https://deno.land/std@0.140.0/hash/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Facebook CAPI Configuration
const FACEBOOK_API_VERSION = 'v18.0';
const FACEBOOK_PIXEL_ID = '369969430611939';
const FACEBOOK_ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN') || '';

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
 * Hash data using SHA256 (as required by Facebook)
 */
function hashSHA256(data: string): string {
  const hash = createHash('sha256');
  hash.update(data.toLowerCase().trim());
  return hash.toString();
}

/**
 * Normalize and hash user data
 */
function normalizeUserData(userData: Partial<UserData>): UserData {
  const normalized: UserData = {};

  // Hash email
  if (userData.em && userData.em.length > 0) {
    normalized.em = userData.em.map(email => hashSHA256(email));
  }

  // Hash phone (remove non-numeric first, then hash)
  if (userData.ph && userData.ph.length > 0) {
    normalized.ph = userData.ph.map(phone =>
      hashSHA256(phone.replace(/\D/g, ''))
    );
  }

  // Hash first name
  if (userData.fn && userData.fn.length > 0) {
    normalized.fn = userData.fn.map(name => hashSHA256(name));
  }

  // Hash last name
  if (userData.ln && userData.ln.length > 0) {
    normalized.ln = userData.ln.map(name => hashSHA256(name));
  }

  // Hash city
  if (userData.ct && userData.ct.length > 0) {
    normalized.ct = userData.ct.map(city => hashSHA256(city));
  }

  // Hash state
  if (userData.st && userData.st.length > 0) {
    normalized.st = userData.st.map(state => hashSHA256(state));
  }

  // Hash zip
  if (userData.zp && userData.zp.length > 0) {
    normalized.zp = userData.zp.map(zip => hashSHA256(zip.replace(/\D/g, '')));
  }

  // Hash country (lowercase 2-letter country code)
  if (userData.country && userData.country.length > 0) {
    normalized.country = userData.country.map(c => hashSHA256(c));
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

  return normalized;
}

/**
 * Send event to Facebook Conversions API
 */
async function sendToFacebookCAPI(payload: FacebookCAPIPayload): Promise<Response> {
  const url = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events`;

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
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const clientUserAgent = req.headers.get('user-agent');

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
