import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtitle: string;
  /** Tailwind classes for the gradient/border color family */
  colorClass: {
    text: string;
    bg: string;
    border: string;
    hoverBorder: string;
    gradient: string;
    shadow: string;
  };
  loading?: boolean;
}

/**
 * KPI card padrão do módulo cadastros.
 * Renderiza número grande, ícone, label e subtítulo com gradient.
 */
export function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  colorClass,
  loading,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        colorClass.gradient,
        "border",
        colorClass.border,
        colorClass.hoverBorder,
        `hover:${colorClass.shadow}`,
      )}
    >
      <div
        className={cn(
          "absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl group-hover:scale-110 transition-transform duration-300",
          colorClass.bg,
          colorClass.text,
        )}
      >
        <Icon size={22} />
      </div>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wider",
          colorClass.text,
          "opacity-80",
        )}
      >
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
        {loading ? "—" : value}
      </p>
      <p className="text-xs text-text-muted mt-2">{subtitle}</p>
    </div>
  );
}

/** Presets de cores para os 4 KPIs padrão do módulo */
export const KPI_PRESETS = {
  total: {
    text: "text-accent",
    bg: "bg-accent/15",
    border: "border-accent/20",
    hoverBorder: "hover:border-accent/40",
    gradient: "from-accent/20 via-accent/10 to-transparent",
    shadow: "shadow-accent/10",
  },
  pendentes: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/20",
    hoverBorder: "hover:border-yellow-500/40",
    gradient: "from-yellow-500/20 via-yellow-500/10 to-transparent",
    shadow: "shadow-yellow-500/10",
  },
  aprovados: {
    text: "text-green-400",
    bg: "bg-green-500/15",
    border: "border-green-500/20",
    hoverBorder: "hover:border-green-500/40",
    gradient: "from-green-500/20 via-green-500/10 to-transparent",
    shadow: "shadow-green-500/10",
  },
  taxa: {
    text: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
    shadow: "shadow-blue-500/10",
  },
  links: {
    text: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
    shadow: "shadow-blue-500/10",
  },
  correcao: {
    text: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/40",
    gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
    shadow: "shadow-orange-500/10",
  },
} as const;
