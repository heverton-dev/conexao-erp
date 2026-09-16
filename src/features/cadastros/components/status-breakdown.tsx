import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";

/** Classes de ring literais (Tailwind precisa achá-las como string exata no código-fonte) */
const RING_BY_COLOR: Record<string, string> = {
  accent: "ring-accent/50",
  "blue-500": "ring-blue-500/50",
  "cyan-500": "ring-cyan-500/50",
  "yellow-500": "ring-yellow-500/50",
  "orange-500": "ring-orange-500/50",
  "green-500": "ring-green-500/50",
  "red-500": "ring-red-500/50",
};

function ringClassFor(border: string): string {
  const match = /^border-(.+?)\/\d+$/.exec(border);
  const key = match?.[1];
  return (key && RING_BY_COLOR[key]) || "ring-accent/50";
}

export interface StatusBreakdownItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  /** Value to set when clicked; if undefined, item is not clickable (display-only) */
  filter?: string;
}

interface StatusBreakdownProps {
  items: StatusBreakdownItem[];
  /** Currently active filter value */
  activeFilter?: string | null;
  /** Called when an item is clicked; toggles between the filter value and "" / null */
  onSelect?: (filter: string | null) => void;
  /** Number of columns at lg+ breakpoint */
  cols?: "5" | "6";
}

/**
 * Grid de botões de breakdown de status.
 * Quando onSelect é fornecido, items viram botões clicáveis (toggle filtro).
 * Sem onSelect, items são display-only (cards estáticos).
 */
export function StatusBreakdown({
  items,
  activeFilter,
  onSelect,
  cols = "6",
}: StatusBreakdownProps) {
  const colsClass =
    cols === "6"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

  return (
    <div className={cn("grid gap-3", colsClass)}>
      {items.map((item) => {
        const isActive = onSelect && item.filter !== undefined && activeFilter === item.filter;
        const Tag = onSelect && item.filter !== undefined ? "button" : "div";
        return (
          <Tag
            key={item.label}
            {...(onSelect && item.filter !== undefined
              ? {
                  onClick: () =>
                    onSelect(isActive ? null : (item.filter as string)),
                }
              : {})}
            className={cn(
              `flex items-center gap-3 rounded-xl ${item.bg} border ${item.border} p-3 transition-all duration-200`,
              onSelect && item.filter !== undefined && "hover:scale-[1.02] cursor-pointer",
              isActive && ["ring-2", ringClassFor(item.border)],
            )}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg ${item.bg}`}
            >
              <item.icon size={16} className={item.color} />
            </div>
            <div>
              <p className={`text-lg font-bold ${item.color}`}>
                {item.value}
              </p>
              <p className="text-[11px] text-text-muted font-medium">
                {item.label}
              </p>
            </div>
          </Tag>
        );
      })}
    </div>
  );
}
