import { supabase } from "~/core/supabase";
import { EMPRESA_ID } from "~/config/empresa"
import { registerActionExecutor } from "~/registry";

export type ApiConnectorType = "api_call" | "webhook";

export type ApiConnector = {
  id: string;
  name: string;
  type: ApiConnectorType;
  method: string;
  url: string;
  headers: Record<string, string>;
  query_params: Record<string, string>;
  body_template: string | null;
  response_schema: any | null;
  evento: string | null;
  tipo_evento: "status_change" | "button_action" | null;
  is_active: boolean;
  ordem?: number;
  created_at: string;
  updated_at: string;
  empresa_id?: string | null;
  modulo_key?: string | null;
};

export type ApiConnectorInput = Omit<
  ApiConnector,
  "id" | "created_at" | "updated_at"
>;

export async function listApiConnectors(
  type?: ApiConnectorType,
  moduloKey?: string | null,
) {
  let query = supabase
    .from("conectores_api")
    .select("*")
    .order("name", { ascending: true });
  if (type) {
    query = query.eq("type", type);
  }
  if (moduloKey) {
    query = query.eq("modulo_key", moduloKey);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as ApiConnector[];
}

export async function createApiConnector(input: ApiConnectorInput) {
  const { data, error } = await supabase
    .from("conectores_api")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as ApiConnector;
}

export async function updateApiConnector(
  id: string,
  input: Partial<ApiConnectorInput>,
) {
  const { data, error } = await supabase
    .from("conectores_api")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ApiConnector;
}

export async function deleteApiConnector(id: string) {
  const { error } = await supabase.from("conectores_api").delete().eq("id", id);
  if (error) throw error;
}

export async function executeApiConnector(
  connector_id: string,
  variables: Record<string, any> = {},
) {
  const startTime = Date.now();
  try {
    const vars: Record<string, string> = {};
    for (const [k, v] of Object.entries(variables)) {
      if (v !== undefined && v !== null) {
        vars[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
      }
    }

    const { data, error } = await supabase.rpc(
      "executar_api_connector_server",
      {
        p_connector_id: connector_id,
        p_variables: vars,
      },
    );

    const duration = Date.now() - startTime;

    if (error) {
      console.error("Erro RPC executar_api_connector_server:", error);
      return {
        status: 500,
        duration,
        headers: {},
        data: { error: "Erro na RPC server-side", message: error.message },
      };
    }

    return {
      status: (data as any)?.status ?? 200,
      duration,
      headers: {},
      data,
    };
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error("Erro em executeApiConnector:", err);
    return {
      status: 500,
      duration,
      headers: {},
      data: {
        error: "Falha na chamada da API",
        message: err.message || String(err),
      },
    };
  }
}

registerActionExecutor(
  "api_connector",
  async (id: string, payload: Record<string, any>) => {
    return executeApiConnector(id, payload);
  },
);
