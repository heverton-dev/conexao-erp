import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent?: string;
}

const SectionHeader = ({
  id,
  icon: Icon,
  title,
  subtitle,
  accent = "text-accent",
}: SectionHeaderProps) => {
  return (
    <div id={id} className="scroll-mt-24 flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-accent/10 ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-main tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
