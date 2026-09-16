// Agregações por vendedor para o dashboard.

export interface SellerMetric {
  vendor: string;
  total: number;
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  matrixAvg: number;
  criteria: Record<string, number>;
}

const MATRIX_KEYS = [
  { key: "matrix_facilidade_pedido", label: "Facilidade" },
  { key: "matrix_clareza_condicoes", label: "Clareza" },
  { key: "matrix_prazo_entrega", label: "Prazo" },
  { key: "matrix_disponibilidade_produtos", label: "Disponib." },
  { key: "matrix_comunicacao", label: "Comunicação" },
];

export const MATRIX_CRITERIA_LABELS = MATRIX_KEYS;

export function computeSellerMetrics(rows: any[]): SellerMetric[] {
  const groups: Record<string, any[]> = {};
  rows.forEach((r) => {
    const v = (r.vendor_name || "").trim();
    if (!v) return;
    (groups[v] = groups[v] || []).push(r);
  });

  return Object.entries(groups)
    .map(([vendor, items]) => {
      const scored = items.filter(
        (r) => r.nps_score !== null && r.nps_score !== undefined,
      );
      const promoters = scored.filter((r) => r.nps_score >= 9).length;
      const detractors = scored.filter((r) => r.nps_score <= 6).length;
      const passives = scored.length - promoters - detractors;
      const nps = scored.length
        ? Math.round(((promoters - detractors) / scored.length) * 100)
        : 0;

      const criteria: Record<string, number> = {};
      let sum = 0,
        n = 0;
      MATRIX_KEYS.forEach(({ key }) => {
        const vals = items
          .map((r) => r[key])
          .filter((v: number) => typeof v === "number" && v > 0);
        const avg = vals.length
          ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length
          : 0;
        criteria[key] = Number(avg.toFixed(2));
        sum += vals.reduce((a: number, b: number) => a + b, 0);
        n += vals.length;
      });
      const matrixAvg = n ? Number((sum / n).toFixed(2)) : 0;

      return {
        vendor,
        total: items.length,
        nps,
        promoters,
        passives,
        detractors,
        matrixAvg,
        criteria,
      };
    })
    .sort((a, b) => b.nps - a.nps);
}
