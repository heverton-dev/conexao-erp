import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

interface RequestBody {
  acao: "testar" | "modelos";
  provedorUrl: string;
  apiKey: string;
  modelo?: string;
}

serve(async (req: Request) => {
  const allowedOrigin = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: RequestBody = await req.json();
    const { acao, provedorUrl, apiKey, modelo } = body;

    if (!provedorUrl || !apiKey) {
      return new Response(JSON.stringify({ error: "provedorUrl e apiKey são obrigatórios" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const url = provedorUrl.replace(/\/+$/, "");

    if (acao === "modelos") {
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        return new Response(JSON.stringify({ modelos: [] }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const json = await res.json();
      const raw = json.data ?? json.models ?? [];
      const modelos = (raw as Array<{ id?: string; name?: string } | string>)
        .map((m) => (typeof m === "string" ? m : (m.id ?? m.name)))
        .filter((id): id is string => typeof id === "string")
        .sort();
      return new Response(JSON.stringify({ modelos }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!modelo) {
      return new Response(JSON.stringify({ error: "modelo é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const res = await fetch(`${url}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelo,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ ok: false, erro: `HTTP ${res.status}: ${text.slice(0, 200)}` }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
