import { supabase } from "~/core/supabase/client";
import type { HubSystemConfig } from "../types";

export async function fetchHubConfig() {
  const { data, error } = await supabase
    .from("hub_config_sistema")
    .select("*")
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data as HubSystemConfig | null;
}

export async function upsertHubConfig(config: Partial<HubSystemConfig>) {
  const { data, error } = await supabase
    .from("hub_config_sistema")
    .upsert(config, { onConflict: "empresa_id" })
    .select()
    .single();
  if (error) throw error;
  return data as HubSystemConfig;
}

export async function updateHubTheme(
  empresaId: string,
  themeDark: Record<string, string>,
  environmentThemes?: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("hub_config_sistema")
    .upsert(
      {
        empresa_id: empresaId,
        theme_dark: themeDark,
        environment_themes: environmentThemes || {},
      },
      { onConflict: "empresa_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as HubSystemConfig;
}
