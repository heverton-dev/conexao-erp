import { supabase } from "~/core/supabase/client";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { HubUserProgress, HubCollectionProgress } from "../types";

const MODULO_KEY = "hub";

export async function fetchHubUserProgress(userId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("hub_progresso_usuario")
    .select("*")
    .eq("user_id", userId)
  if (error) throw error;
  return data as HubUserProgress[];
}

export async function upsertHubUserProgress(
  progress: Partial<HubUserProgress>,
) {
  const { data, error } = await supabase
    .from("hub_progresso_usuario")
    .upsert(progress, { onConflict: "user_id,material_id" })
    .select()
    .single();
  if (error) throw error;
  return data as HubUserProgress;
}

export async function completeHubMaterial(
  userId: string,
  materialId: string,
  empresaId: string,
) {
  const { data, error } = await supabase
    .from("hub_progresso_usuario")
    .upsert(
      {
        user_id: userId,
        material_id: materialId,
        empresa_id: empresaId,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,material_id" },
    )
    .select()
    .single();
  if (error) throw error;

  dispararEventoModulo(
    MODULO_KEY,
    "material.concluido",
    { material_id: materialId, usuario_id: userId, empresa_id: empresaId },
  ).catch(() => {});

  return data as HubUserProgress;
}

export async function fetchHubCollectionProgress(
  userId: string,
  empresaId: string,
) {
  const { data, error } = await supabase
    .from("hub_progresso_colecao")
    .select("*")
    .eq("user_id", userId)
  if (error) throw error;
  return data as HubCollectionProgress[];
}

export async function upsertHubCollectionProgress(
  progress: Partial<HubCollectionProgress>,
) {
  const { data, error } = await supabase
    .from("hub_progresso_colecao")
    .upsert(progress, { onConflict: "user_id,collection_id" })
    .select()
    .single();
  if (error) throw error;
  return data as HubCollectionProgress;
}

export async function completeHubCollection(
  userId: string,
  collectionId: string,
  empresaId: string,
) {
  const { data, error } = await supabase
    .from("hub_progresso_colecao")
    .upsert(
      {
        user_id: userId,
        collection_id: collectionId,
        empresa_id: empresaId,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,collection_id" },
    )
    .select()
    .single();
  if (error) throw error;

  dispararEventoModulo(
    MODULO_KEY,
    "trilha.concluida",
    { collection_id: collectionId, usuario_id: userId, empresa_id: empresaId },
  ).catch(() => {});

  return data as HubUserProgress;
}
