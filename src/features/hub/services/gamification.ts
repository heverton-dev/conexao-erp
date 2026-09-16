import { supabase } from "~/core/supabase/client";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { HubGamificationLevel, HubBadge, HubUserBadge } from "../types";

const MODULO_KEY = "hub";

export async function fetchHubLevels() {
  const { data, error } = await supabase
    .from("hub_niveis_gamificacao")
    .select("*")
    .order("order_index");
  if (error) throw error;
  return data as HubGamificationLevel[];
}

export async function upsertHubLevel(level: Partial<HubGamificationLevel>) {
  const { data, error } = await supabase
    .from("hub_niveis_gamificacao")
    .upsert(level, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data as HubGamificationLevel;
}

export async function fetchHubBadges() {
  const { data, error } = await supabase
    .from("hub_emblemas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as HubBadge[];
}

export async function createHubBadge(badge: Partial<HubBadge>) {
  const { data, error } = await supabase
    .from("hub_emblemas")
    .insert(badge)
    .select()
    .single();
  if (error) throw error;
  return data as HubBadge;
}

export async function updateHubBadge(id: string, updates: Partial<HubBadge>) {
  const { data, error } = await supabase
    .from("hub_emblemas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HubBadge;
}

export async function deleteHubBadge(id: string) {
  const { error } = await supabase.from("hub_emblemas").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchHubUserBadges(userId: string, empresaId: string) {
  const { data, error } = await supabase
    .from("hub_emblemas_usuario")
    .select("*, hub_badges(*)")
    .eq("user_id", userId)
  if (error) throw error;
  return data as (HubUserBadge & { hub_badges: HubBadge })[];
}

export async function awardHubBadge(
  userId: string,
  badgeId: string,
  empresaId: string,
) {
  const { data, error } = await supabase
    .from("hub_emblemas_usuario")
    .insert({ user_id: userId, badge_id: badgeId, empresa_id: empresaId })
    .select()
    .single();
  if (error) throw error;

  const { data: badge } = await supabase
    .from("hub_emblemas")
    .select("nome")
    .eq("id", badgeId)
    .single();

  dispararEventoModulo(
    MODULO_KEY,
    "badge.conquistado",
    { badge_id: badgeId, badge_nome: badge?.nome, usuario_id: userId, empresa_id: empresaId },
  ).catch(() => {});

  return data as HubUserBadge;
}

export async function fetchHubRanking() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, hub_points, hub_status, avatar_url")
    .gt("hub_points", 0)
    .order("hub_points", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function addHubPoints(userId: string, points: number) {
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("hub_points, empresa_id")
    .eq("id", userId)
    .single();
  if (fetchError) throw fetchError;

  const newPoints = (profile.hub_points || 0) + points;
  const { data, error } = await supabase
    .from("profiles")
    .update({ hub_points: newPoints })
    .eq("id", userId)
    .select("hub_points")
    .single();
  if (error) throw error;

  dispararEventoModulo(
    MODULO_KEY,
    "gamification.level_up",
    { usuario_id: userId, pontos: newPoints, pontos_adicionados: points, empresa_id: profile.empresa_id },
  ).catch(() => {});

  return data.hub_points;
}
