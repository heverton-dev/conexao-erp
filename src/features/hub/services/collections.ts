import { supabase } from "~/core/supabase/client";
import type { HubCollection, HubCollectionItem } from "../types";

export async function fetchHubCollections() {
  const { data, error } = await supabase
    .from("hub_colecoes")
    .select("*, hub_collection_items(count)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as (HubCollection & {
    hub_collection_items: { count: number }[];
  })[];
}

export async function fetchHubCollectionById(id: string) {
  const { data, error } = await supabase
    .from("hub_colecoes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as HubCollection;
}

export async function createHubCollection(collection: Partial<HubCollection>) {
  const { data, error } = await supabase
    .from("hub_colecoes")
    .insert(collection)
    .select()
    .single();
  if (error) throw error;
  return data as HubCollection;
}

export async function updateHubCollection(
  id: string,
  updates: Partial<HubCollection>,
) {
  const { data, error } = await supabase
    .from("hub_colecoes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as HubCollection;
}

export async function deleteHubCollection(id: string) {
  const { error } = await supabase
    .from("hub_colecoes")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function fetchHubCollectionItems(collectionId: string) {
  const { data, error } = await supabase
    .from("hub_itens_colecao")
    .select("*, hub_materials(*)")
    .eq("collection_id", collectionId)
    .order("order_index");
  if (error) throw error;
  return data as (HubCollectionItem & {
    hub_materials: import("../types").HubMaterial;
  })[];
}

export async function addHubCollectionItem(item: Partial<HubCollectionItem>) {
  const { data, error } = await supabase
    .from("hub_itens_colecao")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as HubCollectionItem;
}

export async function removeHubCollectionItem(id: string) {
  const { error } = await supabase
    .from("hub_itens_colecao")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reorderHubCollectionItems(
  items: { id: string; order_index: number }[],
) {
  const { error } = await supabase
    .from("hub_itens_colecao")
    .upsert(items, { onConflict: "id" });
  if (error) throw error;
}
