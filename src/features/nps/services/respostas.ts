import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { NpsResposta } from "../types";

const MODULO_KEY = "nps";

type FiltrosRespostas = {
  dateFrom?: string;
  dateTo?: string;
  vendorFilter?: string;
  npsBucket?: string;
};

export async function listarRespostas(
  empresaId: string,
  filtros?: FiltrosRespostas,
): Promise<NpsResposta[]> {
  let query = supabase
    .from("nps_respostas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (filtros?.dateFrom) {
    query = query.gte("created_at", filtros.dateFrom);
  }
  if (filtros?.dateTo) {
    query = query.lte("created_at", filtros.dateTo + "T23:59:59");
  }
  if (filtros?.vendorFilter && filtros.vendorFilter !== "all") {
    query = query.eq("vendor_name", filtros.vendorFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  let results = (data as NpsResposta[]) || [];

  if (filtros?.npsBucket && filtros.npsBucket !== "all") {
    results = results.filter((r) => {
      if (r.nps_score === null || r.nps_score === undefined) return false;
      if (filtros.npsBucket === "detractors") return r.nps_score <= 6;
      if (filtros.npsBucket === "passives")
        return r.nps_score >= 7 && r.nps_score <= 8;
      if (filtros.npsBucket === "promoters") return r.nps_score >= 9;
      return true;
    });
  }

  return results;
}

export async function criarResposta(
  empresaId: string,
  resposta: Omit<NpsResposta, "id" | "empresa_id" | "created_at">,
): Promise<NpsResposta> {
  const { data, error } = await supabase
    .from("nps_respostas")
    .insert({ ...resposta, empresa_id: empresaId })
    .select()
    .single();

  if (error) throw error;

  dispararEventoModulo(MODULO_KEY, "nps.resposta_recebida", {
    resposta_id: data.id,
    nps_score: data.nps_score,
    csat: data.csat,
    empresa_id: empresaId,
  }).catch(() => {});

  if (data.nps_score !== null && data.nps_score <= 6) {
    dispararEventoModulo(MODULO_KEY, "nps.detrator_detectado", {
      resposta_id: data.id,
      nps_score: data.nps_score,
      comentario: data.nps_comment,
      empresa_id: empresaId,
    }).catch(() => {});
  }

  return data as NpsResposta;
}

export async function excluirRespostas(ids: string[]): Promise<void> {
  const { error } = await supabase.from("nps_respostas").delete().in("id", ids);

  if (error) throw error;
}

export function calcularNpsScore(respostas: NpsResposta[]): {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
} {
  const scored = respostas.filter(
    (r) => r.nps_score !== null && r.nps_score !== undefined,
  );
  if (!scored.length)
    return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };

  const promoters = scored.filter((r) => r.nps_score! >= 9).length;
  const detractors = scored.filter((r) => r.nps_score! <= 6).length;
  const passives = scored.length - promoters - detractors;
  const score = Math.round(((promoters - detractors) / scored.length) * 100);

  return { score, promoters, passives, detractors, total: scored.length };
}

export function distribuicaoNps(
  respostas: NpsResposta[],
): { score: string; count: number }[] {
  const counts = Array(11).fill(0);
  respostas.forEach((r) => {
    if (r.nps_score !== null && r.nps_score !== undefined) {
      counts[r.nps_score]++;
    }
  });
  return counts.map((count, score) => ({ score: String(score), count }));
}

export function mediaMatrix(
  respostas: NpsResposta[],
): { label: string; avg: number }[] {
  if (!respostas.length) return [];

  const items = [
    { key: "matrix_facilidade_pedido" as const, label: "Facilidade de Pedido" },
    { key: "matrix_clareza_condicoes" as const, label: "Clareza Comercial" },
    { key: "matrix_prazo_entrega" as const, label: "Prazo de Entrega" },
    {
      key: "matrix_disponibilidade_produtos" as const,
      label: "Disponibilidade",
    },
    { key: "matrix_comunicacao" as const, label: "Comunicação" },
  ];

  return items.map(({ key, label }) => {
    const vals = respostas.map((r) => r[key]).filter((v: number) => v > 0);
    const avg = vals.length
      ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length
      : 0;
    return { label, avg: Number(avg.toFixed(1)) };
  });
}

export function mediaMatrixGeral(respostas: NpsResposta[]): string {
  const keys = [
    "matrix_facilidade_pedido",
    "matrix_clareza_condicoes",
    "matrix_prazo_entrega",
    "matrix_disponibilidade_produtos",
    "matrix_comunicacao",
  ] as const;
  let sum = 0;
  let n = 0;
  respostas.forEach((r) => {
    keys.forEach((k) => {
      const v = r[k];
      if (typeof v === "number" && v > 0) {
        sum += v;
        n++;
      }
    });
  });
  return n ? (sum / n).toFixed(1) : "—";
}

export function distribuicaoCsat(
  respostas: NpsResposta[],
): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  respostas.forEach((r) => {
    if (r.csat) counts[r.csat] = (counts[r.csat] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function contarComentarios(respostas: NpsResposta[]): number {
  const TEXT_KEYS = [
    "nps_comment",
    "melhoria_atendimento",
    "expansao_produtos",
    "oportunidade",
    "pergunta_final",
  ];
  return respostas.filter((r) => {
    if (
      TEXT_KEYS.some(
        (k) =>
          typeof (r as any)[k] === "string" && (r as any)[k].trim().length > 0,
      )
    )
      return true;
    const dyn = r.dynamic_answers;
    if (dyn && typeof dyn === "object") {
      return Object.values(dyn).some(
        (v) => typeof v === "string" && (v as string).trim().length > 0,
      );
    }
    return false;
  }).length;
}

export function exportarCSV(respostas: NpsResposta[], filename?: string): void {
  if (!respostas.length) return;

  const headers = Object.keys(respostas[0]);
  const csv = [
    headers.join(","),
    ...respostas.map((r) =>
      headers
        .map((h) => {
          const val = (r as any)[h];
          return typeof val === "string"
            ? `"${val.replace(/"/g, '""')}"`
            : (val ?? "");
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename || `respostas_nps_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
