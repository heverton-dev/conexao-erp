import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

export function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-input-bg/40 p-4 border border-border-subtle">
      <h3 className="text-xs font-bold text-text-main mb-3 flex items-center gap-1.5">
        <Icon size={14} className="text-accent" /> {title}
      </h3>
      {children}
    </div>
  );
}

export function CollapsibleSection({
  icon: Icon,
  title,
  open,
  onToggle,
  children,
}: {
  icon: any;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-input-bg/40 border border-border-subtle overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 text-left transition-colors hover:bg-surface-hover"
      >
        <h3 className="text-xs font-bold text-text-main flex items-center gap-1.5">
          <Icon size={14} className="text-text-muted" /> {title}
        </h3>
        <ChevronDown
          size={14}
          className={cn(
            "text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type,
  required,
  fontMono,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  fontMono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
        {label}
        {required && " *"}
      </label>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-sm outline-none focus:border-accent",
          fontMono && "font-mono",
        )}
        required={required}
      />
    </div>
  );
}
