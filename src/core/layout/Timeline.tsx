import { useEffect, useState } from "react";
import { listarAtividades, type Atividade } from "~/core/services";
import {
  Loader2,
  Clock,
  User,
  Plus,
  Pencil,
  ArrowRight,
  Check,
  X,
  FileText,
} from "lucide-react";

type Props = {
  entidade_tipo: "lead" | "contrato" | "cadastro";
  entidade_id: string;
};

const acaoIcons: Record<string, typeof Plus> = {
  criado: Plus,
  atualizado: Pencil,
  movido: ArrowRight,
  fechado: Check,
  perdido: X,
};

export function Timeline({ entidade_tipo, entidade_id }: Props) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarAtividades(entidade_tipo, entidade_id)
      .then(setAtividades)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [entidade_tipo, entidade_id]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 size={16} className="animate-spin text-accent" />
      </div>
    );
  }

  if (atividades.length === 0) return null;

  return (
    <div className="rounded-xl bg-card p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <Clock size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-text-main">Atividades</h2>
      </div>
      <div className="flex flex-col gap-3">
        {atividades.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 border-b border-border-subtle pb-3 last:border-0"
          >
            <span className="mt-0.5 text-sm">
              {(() => {
                const Icon = acaoIcons[a.acao] || FileText;
                return <Icon size={14} className="text-text-muted" />;
              })()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-main">{a.descricao || a.acao}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-muted">
                <span>{new Date(a.created_at).toLocaleString("pt-BR")}</span>
                {a.profiles?.nome && (
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    {a.profiles.nome}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
