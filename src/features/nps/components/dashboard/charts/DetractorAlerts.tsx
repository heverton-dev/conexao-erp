import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { COLORS } from "./chart-colors";

interface SurveyResponse {
  id: string;
  created_at: string;
  nps_score: number | null;
  nps_comment: string;
  client_id: string | null;
  client_name?: string | null;
  source: string | null;
}

const DetractorAlerts = ({ data }: { data: SurveyResponse[] }) => {
  const detractors = useMemo(() => {
    return data
      .filter((r) => r.nps_score !== null && r.nps_score <= 6)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [data]);

  if (!detractors.length) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${COLORS.error}33, ${COLORS.error}1a, transparent)`,
        border: `1px solid ${COLORS.error}33`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${COLORS.error}26`, color: COLORS.errorLight }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.error }}>
              Alertas — Detratores Recentes
            </h3>
            <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
              {detractors.length} mais recente{detractors.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {detractors.map((r) => (
          <div
            key={r.id}
            className="rounded-xl p-3 flex flex-col gap-2 min-h-[120px] transition-colors"
            style={{
              backgroundColor: `${COLORS.error}0d`,
              border: `1px solid ${COLORS.error}26`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0"
                style={{ backgroundColor: `${COLORS.error}26`, color: COLORS.errorLight }}
              >
                {r.nps_score}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate font-medium" style={{ color: COLORS.textMain }}>
                  {r.client_name || r.client_id || "Cliente anônimo"}
                </p>
                <p className="text-[10px]" style={{ color: COLORS.textMuted }}>
                  {new Date(r.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                  {r.source && ` · ${r.source}`}
                </p>
              </div>
            </div>
            <p className="text-xs line-clamp-3 leading-snug flex-1" style={{ color: `${COLORS.textMain}e6` }}>
              {r.nps_comment || (
                <span className="italic" style={{ color: COLORS.textMuted }}>Sem comentário</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetractorAlerts;
