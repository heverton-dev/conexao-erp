import { useMemo } from "react";
import { Users } from "lucide-react";
import MetricCard from "./MetricCard";

const RepeatCustomerCard = ({ data }: { data: any[] }) => {
  const rate = useMemo(() => {
    const keyOf = (r: any) =>
      (r.client_id && String(r.client_id).trim()) ||
      (r.client_name && String(r.client_name).trim().toLowerCase()) ||
      null;
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const k = keyOf(r);
      if (!k) return;
      counts[k] = (counts[k] || 0) + 1;
    });
    const totalClients = Object.keys(counts).length;
    if (!totalClients) return { pct: 0, repeats: 0, totalClients: 0 };
    const repeats = Object.values(counts).filter((c) => c > 1).length;
    return {
      pct: Math.round((repeats / totalClients) * 100),
      repeats,
      totalClients,
    };
  }, [data]);

  return (
    <MetricCard
      icon={Users}
      label="Clientes Recorrentes"
      value={`${rate.pct}%`}
      hint={`Clientes identificados (por client_id ou nome) que apareceram em mais de uma resposta dentro do recorte. Cálculo: clientes com 2+ respostas (${rate.repeats}) ÷ total de clientes únicos (${rate.totalClients}) × 100. Respostas sem identificação são ignoradas.`}
    />
  );
};

export default RepeatCustomerCard;
