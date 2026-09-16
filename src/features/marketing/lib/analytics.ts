import { supabase } from "~/core/supabase";

export type AnalyticsMetrica = {
  label: string;
  valor: number;
  variacao?: number;
};

export type EventoAgregado = {
  data: string;
  total: number;
  por_tipo: Record<string, number>;
};

export async function buscarEventosAgregados(
  empresaId: string,
  dias: number = 30,
): Promise<EventoAgregado[]> {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);
  const { data } = await supabase
    .from("mktg_eventos")
    .select("created_at, tipo")
    .eq("empresa_id", empresaId)
    .gte("created_at", dataLimite.toISOString())
    .order("created_at", { ascending: true });
  if (!data) return [];
  const agrupado: Record<
    string,
    { total: number; por_tipo: Record<string, number> }
  > = {};
  for (const e of data) {
    const dia = new Date(e.created_at).toISOString().slice(0, 10);
    if (!agrupado[dia]) agrupado[dia] = { total: 0, por_tipo: {} };
    agrupado[dia].total++;
    agrupado[dia].por_tipo[e.tipo] = (agrupado[dia].por_tipo[e.tipo] || 0) + 1;
  }
  return Object.entries(agrupado).map(([data, vals]) => ({ data, ...vals }));
}

export async function buscarMetricas(
  empresaId: string,
): Promise<AnalyticsMetrica[]> {
  const agregados = await buscarEventosAgregados(empresaId, 30);
  const total = agregados.reduce((acc, d) => acc + d.total, 0);
  const visualizacoes = agregados.reduce(
    (acc, d) => acc + (d.por_tipo?.visualizacao || 0),
    0,
  );
  const cliques = agregados.reduce(
    (acc, d) => acc + (d.por_tipo?.clique || 0),
    0,
  );
  const conversoes = agregados.reduce(
    (acc, d) => acc + (d.por_tipo?.conversao || 0),
    0,
  );
  const taxaClique =
    visualizacoes > 0 ? Math.round((cliques / visualizacoes) * 100) : 0;
  const taxaConversao =
    cliques > 0 ? Math.round((conversoes / cliques) * 100) : 0;
  return [
    { label: "Eventos (30d)", valor: total },
    { label: "Visualizações", valor: visualizacoes },
    { label: "Cliques", valor: cliques },
    { label: "Conversões", valor: conversoes },
    { label: "Taxa de Clique", valor: taxaClique, variacao: 0 },
    { label: "Taxa de Conversão", valor: taxaConversao, variacao: 0 },
  ];
}
