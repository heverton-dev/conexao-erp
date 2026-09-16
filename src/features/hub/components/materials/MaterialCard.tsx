import {
  FileText,
  Image as ImageIcon,
  Video,
  Eye,
  Lock,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Star,
  Tag,
  Headphones,
  Globe,
} from "lucide-react";
import type { HubMaterial, HubLanguage, HubUserProgress } from "../../types";

const typeIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  pdf: FileText,
  image: ImageIcon,
  video: Video,
  audio: Headphones,
  html: Globe,
};

const typeColor: Record<string, { from: string; border: string; shadow: string; iconBg: string; iconText: string; tag: string }> = {
  pdf:   { from: "from-amber-500/20",    border: "border-amber-500/20",    shadow: "hover:shadow-amber-500/10",    iconBg: "bg-amber-500/15",    iconText: "text-amber-400",    tag: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  image: { from: "from-yellow-500/20",   border: "border-yellow-500/20",   shadow: "hover:shadow-yellow-500/10",   iconBg: "bg-yellow-500/15",   iconText: "text-yellow-400",   tag: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  video: { from: "from-orange-500/20",   border: "border-orange-500/20",   shadow: "hover:shadow-orange-500/10",   iconBg: "bg-orange-500/15",   iconText: "text-orange-400",   tag: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  audio: { from: "from-cyan-500/20",     border: "border-cyan-500/20",     shadow: "hover:shadow-cyan-500/10",     iconBg: "bg-cyan-500/15",     iconText: "text-cyan-400",     tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  html:  { from: "from-teal-500/20",     border: "border-teal-500/20",     shadow: "hover:shadow-teal-500/10",     iconBg: "bg-teal-500/15",     iconText: "text-teal-400",     tag: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

const fallbackColor = { from: "from-accent/20", border: "border-accent/20", shadow: "hover:shadow-accent/10", iconBg: "bg-accent/15", iconText: "text-accent", tag: "bg-accent/10 text-accent border-accent/20" };

interface Props {
  material: HubMaterial;
  language?: HubLanguage;
  progress?: HubUserProgress;
  onView?: (m: HubMaterial, l: HubLanguage) => void;
}

export function MaterialCard({
  material,
  language = "pt-br",
  progress,
  onView,
}: Props) {
  const Icon = typeIcons[material.type] || FileText;
  const title = material.title?.[language] || material.title?.["pt-br"] || "Sem título";
  const c = typeColor[material.type] || fallbackColor;
  const langs: HubLanguage[] = ["pt-br", "en-us", "es-es"];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.from} via-transparent to-transparent ${c.border} border p-5 transition-all duration-300 hover:shadow-lg ${c.shadow} hover:border-opacity-40 min-h-[320px] flex flex-col`}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden transition-opacity duration-700">
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 animate-shimmer" style={{ left: "-150%" }} />
      </div>

      <div className="p-0 relative z-10 flex flex-col flex-1">
        {/* Header: icon + type badge */}
        <div className="flex justify-between items-start mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.iconBg} ${c.iconText} relative group-hover:scale-110 transition-transform duration-500`}>
              <Icon size={24} />
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-lg ${c.tag}`}>
            {material.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight text-text-main h-[3.25rem]" title={title}>
          {title}
        </h3>

        {/* Metadata area */}
        <div className="min-h-[3.5rem] mb-1">
          {progress && (
            <div className="mb-2">
              {progress.status === "completed" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                  <CheckCircle size={10} /> Concluído
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                  <PlayCircle size={10} /> Em andamento
                </span>
              )}
            </div>
          )}
          {material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {material.tags.slice(0, 3).map((t) => (
                <span key={t} className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/8 text-text-muted border border-accent/10">
                  <Tag size={8} /> {t}
                </span>
              ))}
            </div>
          )}
          {material.points > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold mb-2 text-text-muted">
              <Star size={10} className="fill-yellow-400 text-yellow-400" /> {material.points} XP
            </div>
          )}
        </div>

        {/* Footer: languages */}
        <div className="mt-auto pt-4 border-t border-border/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted opacity-70">Versões</p>
            <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-accent">
              <ChevronRight size={16} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {langs.map((lang) => {
              const hasAsset = false;
              return (
                <button
                  key={lang}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasAsset && onView) onView(material, lang);
                  }}
                  disabled={!hasAsset}
                  className={`relative overflow-hidden px-3 py-1.5 text-xs rounded-lg transition-all duration-300 flex items-center gap-1.5 font-bold ${hasAsset ? "bg-surface border border-border text-text-main hover:border-accent/30 hover:shadow-lg cursor-pointer" : "bg-surface/30 border border-border/30 text-text-muted opacity-30 cursor-not-allowed"}`}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {lang.toUpperCase().split("-")[0]}
                    {hasAsset ? <Eye size={10} /> : <Lock size={10} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
