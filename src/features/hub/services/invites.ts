import { supabase } from "~/core/supabase/client";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { HubInviteToken } from "../types";

const MODULO_KEY = "hub";

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
}

export async function createHubInvite(
  role: string,
  createdBy: string,
  empresaId: string,
  expiresAt?: string,
) {
  const { data, error } = await supabase
    .from("hub_tokens_convite")
    .insert({
      token: generateToken(),
      role,
      created_by: createdBy,
      empresa_id: empresaId,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (error) throw error;

  dispararEventoModulo(
    MODULO_KEY,
    "convite.gerado",
    { invite_id: data.id, role, created_by: createdBy, empresa_id: empresaId },
  ).catch(() => {});

  return data as HubInviteToken;
}

export async function fetchHubInvites() {
  const { data, error } = await supabase
    .from("hub_tokens_convite")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as HubInviteToken[];
}

export async function validateHubInvite(token: string) {
  const { data, error } = await supabase
    .from("hub_tokens_convite")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();
  if (error) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data as HubInviteToken;
}

export async function useHubInvite(token: string, userId: string) {
  const { data, error } = await supabase
    .from("hub_tokens_convite")
    .update({
      status: "used",
      used_by: userId,
      used_at: new Date().toISOString(),
    })
    .eq("token", token)
    .eq("status", "pending")
    .select()
    .single();
  if (error) throw error;

  dispararEventoModulo(
    MODULO_KEY,
    "usuario.registrado",
    { invite_id: data.id, usuario_id: userId, role: data.role, empresa_id: data.empresa_id },
  ).catch(() => {});

  return data as HubInviteToken;
}

export async function deleteHubInvite(id: string) {
  const { error } = await supabase
    .from("hub_tokens_convite")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function updateHubInviteShare(
  id: string,
  whatsappMessage: string,
  shareLink: string,
) {
  const { data, error } = await supabase
    .from("hub_tokens_convite")
    .update({ share_whatsapp_message: whatsappMessage, share_link: shareLink })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HubInviteToken;
}
