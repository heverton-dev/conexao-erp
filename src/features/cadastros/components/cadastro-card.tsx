import { cn } from "~/lib/utils";

export interface CadastroCardProps {
  /** Display name (falls back to nome_temporario, then "Sem nome") */
  nome: string;
  /** Status badge class string (from STATUS_COLOR) */
  statusColor: string;
  /** Status label (from STATUS_LABEL) */
  statusLabel: string;
  /** Optional document status badge */
  docStatusColor?: string;
  docStatusLabel?: string;
  /** Type of person (PF/PJ) — shown as uppercase tag in footer */
  tipoPessoa?: string | null;
  /** Internal customer code */
  codigoCliente?: string | null;
  /** Creator name (consultor) */
  createdBy?: string;
  /** Creation date */
  createdAt: string;
  /** Click handler — when provided, card becomes a <button> */
  onClick?: () => void;
  /** Extra actions (edit/delete buttons) rendered in top-right, hidden on mobile unless hovered */
  actions?: React.ReactNode;
  /** Avatar color: "accent" (default) or "green" (for approved clientes) */
  avatarColor?: "accent" | "green";
  /** Animation delay in ms (stagger) */
  animationDelay?: number;
  /** Index for stagger */
  index?: number;
  /** Optional Link component (from TanStack Router) — if not provided, uses onClick */
  className?: string;
}

/**
 * Card de cadastro padronizado — usado em solicitacoes, clientes, dashboard recentes, consultor, relatorios.
 * É um <button> se onClick é fornecido, senão é um <div>.
 */
export function CadastroCard({
  nome,
  statusColor,
  statusLabel,
  docStatusColor,
  docStatusLabel,
  tipoPessoa,
  codigoCliente,
  createdBy,
  createdAt,
  onClick,
  actions,
  avatarColor = "accent",
  animationDelay,
  index,
  className,
}: CadastroCardProps) {
  const Tag = onClick ? "button" : "div";
  const delay = animationDelay ?? (index !== undefined ? index * 30 : 0);
  const avatarBg =
    avatarColor === "green"
      ? "bg-green-500/15 group-hover:bg-green-500/25"
      : "bg-accent/15 group-hover:bg-accent/25";
  const avatarText = avatarColor === "green" ? "text-green-400" : "text-accent";

  return (
    <Tag
      {...(onClick ? { onClick } : {})}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "group flex flex-col gap-4 rounded-2xl bg-surface border border-border/60 p-5 text-left transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 active:scale-[0.99]",
        className,
      )}
    >
      {/* Top row: avatar + name + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
              avatarBg,
            )}
          >
            <span className={cn("text-sm font-bold", avatarText)}>
              {(nome || "S")[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-main truncate group-hover:text-accent transition-colors">
              {nome || "Sem nome"}
            </p>
            {createdBy && (
              <p className="text-xs text-text-muted mt-0.5">Por: {createdBy}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${statusColor}`}
        >
          {statusLabel}
        </span>
        {docStatusColor && docStatusLabel && (
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${docStatusColor}`}
          >
            {docStatusLabel}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <div className="flex items-center gap-2">
          {tipoPessoa && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent/60">
              {tipoPessoa}
            </span>
          )}
          {codigoCliente && (
            <span className="text-[10px] text-text-muted">
              Cód: {codigoCliente}
            </span>
          )}
        </div>
        <span className="text-[10px] text-text-muted/60">
          {new Date(createdAt).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </Tag>
  );
}
