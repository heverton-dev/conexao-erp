// @ts-ignore - Deno import
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore - Deno import
import { createClient } from "npm:@supabase/supabase-js@2";

interface LatLng {
  lat: number;
  lng: number;
}

interface RequestBody {
  empresa_id: string;
  origem: LatLng;
  destino: LatLng;
}

interface DistanceResult {
  distancia_km: number;
  duracao_minutos: number;
}

serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { empresa_id, origem, destino }: RequestBody = await req.json();

    if (!empresa_id || !origem || !destino) {
      return new Response("Missing required fields", { status: 400 });
    }

    const { data: config, error: configError } = await supabase
      .from("rotas_config")
      .select("google_maps_api_key")
      .eq("empresa_id", empresa_id)
      .single();

    const apiKey = config?.google_maps_api_key ?? "";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ distancia_km: 0, duracao_minutos: 0 }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const url =
      "https://maps.googleapis.com/maps/api/distancematrix/json" +
      `?origins=${origem.lat},${origem.lng}` +
      `&destinations=${destino.lat},${destino.lng}` +
      `&key=${apiKey}&mode=driving`;

    const googleRes = await fetch(url);
    const googleData = await googleRes.json();

    if (
      googleData.status === "OK" &&
      googleData.rows?.[0]?.elements?.[0]?.status === "OK"
    ) {
      const element = googleData.rows[0].elements[0];
      const result: DistanceResult = {
        distancia_km: Math.round((element.distance.value / 1000) * 100) / 100,
        duracao_minutos: Math.round(element.duration.value / 60),
      };
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ distancia_km: 0, duracao_minutos: 0 }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
