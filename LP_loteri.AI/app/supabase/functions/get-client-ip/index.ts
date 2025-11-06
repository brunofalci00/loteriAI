import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Endpoint para retornar IP do cliente
 * Prioriza IPv6 conforme recomendação Meta
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Tentar obter IP dos headers (Supabase Edge Functions)
    // Priorizar IPv6 se disponível
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const xRealIp = req.headers.get('x-real-ip');
    const remoteAddr = req.headers.get('x-real-ip') || '0.0.0.0';

    let clientIp = xForwardedFor?.split(',')[0].trim() || xRealIp || remoteAddr;

    // Detectar se é IPv6 (contém ":")
    const isIPv6 = clientIp.includes(':');

    // Se x-forwarded-for tem múltiplos IPs, priorizar IPv6
    if (xForwardedFor && xForwardedFor.includes(',')) {
      const ips = xForwardedFor.split(',').map(ip => ip.trim());

      // Procurar primeiro por IPv6
      const ipv6 = ips.find(ip => ip.includes(':'));
      if (ipv6) {
        clientIp = ipv6;
      }
    }

    console.log('[get-client-ip] IP detectado:', clientIp, '| IPv6:', isIPv6);

    return new Response(
      JSON.stringify({
        ip: clientIp,
        isIPv6: isIPv6,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[get-client-ip] Erro:', error);
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
