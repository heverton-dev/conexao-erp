import { supabase } from "~/core/supabase";
import type { MarketingPixel, MarketingPixelInput } from "../types";

export async function listarPixels(
  empresaId: string,
): Promise<MarketingPixel[]> {
  const { data } = await supabase
    .from("mktg_pixels")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  return (data as MarketingPixel[]) ?? [];
}

export async function criarPixel(
  input: MarketingPixelInput & { empresa_id: string },
): Promise<MarketingPixel | null> {
  const { data } = await supabase
    .from("mktg_pixels")
    .insert([input])
    .select()
    .single();

  return data as MarketingPixel | null;
}

export async function atualizarPixel(
  id: string,
  input: Partial<MarketingPixelInput>,
): Promise<MarketingPixel | null> {
  const { data } = await supabase
    .from("mktg_pixels")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return data as MarketingPixel | null;
}

export async function deletarPixel(id: string): Promise<boolean> {
  const { error } = await supabase.from("mktg_pixels").delete().eq("id", id);

  return !error;
}
