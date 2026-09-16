import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import MetricCard from "./MetricCard";
import { extractAllText } from "~/lib/sentiment";

const CommentRateCard = ({ data }: { data: any[] }) => {
  const rate = useMemo(() => {
    if (!data.length) return 0;
    const withText = data.filter(
      (r) => extractAllText(r).trim().length > 0,
    ).length;
    return Math.round((withText / data.length) * 100);
  }, [data]);

  return (
    <MetricCard
      icon={MessageSquare}
      label="Taxa de Comentários"
      value={`${rate}%`}
      hint="Percentual de respostas que contêm ao menos um comentário em qualquer campo de texto livre (NPS, melhoria, expansão, oportunidade, pergunta final ou perguntas dinâmicas) dividido pelo total de respostas filtradas."
    />
  );
};

export default CommentRateCard;
