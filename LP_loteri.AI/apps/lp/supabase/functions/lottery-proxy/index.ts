import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

const lotteryEndpoints: Record<string, string> = {
  "mega-sena": "megasena",
  "quina": "quina",
  "lotofacil": "lotofacil",
  "lotomania": "lotomania",
  "dupla-sena": "duplasena",
  "timemania": "timemania",
};

interface RequestBody {
  lotteryType: string;
  action: "latest" | "history" | "byNumber";
  contestNumber?: number;
  maxDraws?: number;
}

const formatBrazilianDate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}T00:00:00.000Z`;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { lotteryType, action, contestNumber, maxDraws = 100 } = body;

    console.log(`[lottery-proxy] Request: ${action} for ${lotteryType}`);

    const endpoint = lotteryEndpoints[lotteryType];
    if (!endpoint) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Tipo de loteria não suportado: ${lotteryType}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Action: latest
    if (action === "latest") {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            numero: data.numero,
            dataApuracao: formatBrazilianDate(data.dataApuracao),
            listaDezenas: data.listaDezenas.map((n: string) => parseInt(n)),
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: byNumber
    if (action === "byNumber" && contestNumber) {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${contestNumber}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ success: false, error: "Concurso não encontrado" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            contestNumber: data.numero,
            drawDate: formatBrazilianDate(data.dataApuracao),
            numbers: data.listaDezenas.map((n: string) => parseInt(n)),
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: history
    if (action === "history") {
      // Get latest contest number
      const latestResponse = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!latestResponse.ok) {
        throw new Error(`API Error: ${latestResponse.status}`);
      }

      const latestData = await latestResponse.json();
      const latestContestNumber = latestData.numero;

      console.log(`[lottery-proxy] Fetching history from ${latestContestNumber - maxDraws + 1} to ${latestContestNumber}`);

      const draws = [];
      const startContest = Math.max(1, latestContestNumber - maxDraws + 1);
      
      // Fetch in batches to avoid overwhelming the API
      const batchSize = 10;
      for (let i = startContest; i <= latestContestNumber; i += batchSize) {
        const batchPromises = [];
        
        for (let j = i; j < Math.min(i + batchSize, latestContestNumber + 1); j++) {
          batchPromises.push(
            fetch(`${API_BASE_URL}/${endpoint}/${j}`, {
              method: "GET",
              headers: { "Accept": "application/json" },
            })
              .then(res => res.ok ? res.json() : null)
              .then(data => {
                if (data && data.listaDezenas) {
                  return {
                    contestNumber: data.numero,
                    drawDate: formatBrazilianDate(data.dataApuracao),
                    numbers: data.listaDezenas.map((n: string) => parseInt(n)),
                  };
                }
                return null;
              })
              .catch(() => null)
          );
        }

        const batchResults = await Promise.all(batchPromises);
        draws.push(...batchResults.filter((d: any) => d !== null));
        
        // Small delay between batches
        if (i + batchSize <= latestContestNumber) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`[lottery-proxy] Successfully fetched ${draws.length} draws`);

      return new Response(
        JSON.stringify({
          success: true,
          data: draws.sort((a: any, b: any) => b.contestNumber - a.contestNumber),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação inválida" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error("[lottery-proxy] Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
