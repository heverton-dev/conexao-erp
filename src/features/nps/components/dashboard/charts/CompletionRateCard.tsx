import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import MetricCard from "./MetricCard";

const OPTIONAL_FIELDS = [
  "nps_comment",
  "melhoria_atendimento",
  "expansao_produtos",
  "oportunidade",
  "pergunta_final",
  "atendimento_comercial",
  "entendimento_consultor",
  "experiencia_compra",
  "csat",
];

const CompletionRateCard = ({ data }: { data: any[] }) => {
  const rate = useMemo(() => {
    if (!data.length) return 0;
    let filled = 0;
    let total = 0;
    data.forEach((r) => {
      OPTIONAL_FIELDS.forEach((f) => {
        total++;
        const v = r[f];
        if (typeof v === "string" && v.trim().length > 0) filled++;
      });
    });
    return total ? Math.round((filled / total) * 100) : 0;
  }, [data]);

  return (
    <MetricCard
      icon={CheckCircle2}
      label="Taxa de Preenchimento"
      value={`${rate}%`}
      hint={`Média de campos opcionais preenchidos por resposta. Considera ${OPTIONAL_FIELDS.length} campos (texto livre + escolhas qualitativas). Cálculo: campos preenchidos ÷ (respostas × campos opcionais) × 100.`}
    />
  );
};

export default CompletionRateCard;
