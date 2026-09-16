import { supabase } from "~/core/supabase";

type LatLng = { lat: number; lng: number };

export type DistanciaResult = {
  distancia_km: number;
  duracao_minutos: number;
};

export async function calcularDistanciaGoogle(
  empresaId: string,
  origem: LatLng,
  destino: LatLng,
): Promise<DistanciaResult> {
  const { data, error } = await supabase.functions.invoke<DistanciaResult>(
    "calcular-distancia",
    {
      body: { empresa_id: empresaId, origem, destino },
    },
  );

  if (error) throw error;

  return data ?? { distancia_km: 0, duracao_minutos: 0 };
}
