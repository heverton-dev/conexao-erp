import { Wrench, Clock } from "lucide-react";

type MaintenanceScreenProps = {
  mensagem: string;
  dataFim: string | null;
  escopo?: string;
};

function formatarDataFim(dataFim: string): string {
  const d = new Date(dataFim);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MaintenanceScreen({
  mensagem,
  dataFim,
  escopo,
}: MaintenanceScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-dark p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-card p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Wrench size={32} />
        </div>
        <h1 className="text-xl font-bold text-text-main">
          Em manutenção
        </h1>
        {escopo && (
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            {escopo}
          </p>
        )}
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
          {mensagem}
        </p>
        {dataFim && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-input-bg px-4 py-3 text-sm text-text-main">
            <Clock size={16} className="text-accent" />
            <span>
              Previsão de retorno:{" "}
              <span className="font-semibold">
                {formatarDataFim(dataFim)}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
