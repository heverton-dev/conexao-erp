import { supabase } from "~/core/supabase/client";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { HubMaterial, HubMaterialAsset, HubLanguage } from "../types";

const MODULO_KEY = "hub";

export async function fetchHubMaterials(empresaId?: string) {
  let query = supabase.from("hub_materiais").select("*");
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as HubMaterial[];
}

export async function fetchHubMaterialById(id: string) {
  const { data, error } = await supabase
    .from("hub_materiais")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as HubMaterial;
}

export async function createHubMaterial(material: Partial<HubMaterial>) {
  const { data, error } = await supabase
    .from("hub_materiais")
    .insert(material)
    .select()
    .single();
  if (error) throw error;
  return data as HubMaterial;
}

export async function updateHubMaterial(
  id: string,
  updates: Partial<HubMaterial>,
) {
  const { data, error } = await supabase
    .from("hub_materiais")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HubMaterial;
}

export async function deleteHubMaterial(id: string) {
  const { error } = await supabase.from("hub_materiais").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchHubMaterialAssets(materialId: string) {
  const { data, error } = await supabase
    .from("hub_ativos_material")
    .select("*")
    .eq("material_id", materialId)
    .order("language");
  if (error) throw error;
  return data as HubMaterialAsset[];
}

export async function upsertHubMaterialAsset(asset: Partial<HubMaterialAsset>) {
  const { data, error } = await supabase
    .from("hub_ativos_material")
    .upsert(asset, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as HubMaterialAsset;
}

export async function deleteHubMaterialAsset(id: string) {
  const { error } = await supabase
    .from("hub_ativos_material")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function logHubAccess(log: {
  material_id: string;
  material_title?: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  language: HubLanguage;
  empresa_id?: string;
}) {
  const { error } = await supabase.from("hub_logs_acesso").insert(log);
  if (error) throw error;

  dispararEventoModulo(
    MODULO_KEY,
    "material.acessado",
    { material_id: log.material_id, material_title: log.material_title, usuario_id: log.user_id, empresa_id: log.empresa_id },
  ).catch(() => {});
}

export async function fetchHubAccessLogs(
  materialId: string,
  empresaId: string,
) {
  const { data, error } = await supabase
    .from("hub_logs_acesso")
    .select("*")
    .eq("material_id", materialId)
    .order("timestamp", { ascending: false });
  if (error) throw error;
  return data as import("../types").HubAccessLog[];
}
