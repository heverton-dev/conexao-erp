import { BookOpen, Star, CheckCircle } from "lucide-react";
import type { HubCollection, HubLanguage } from "../../types";

interface Props {
  collection: HubCollection;
  language?: HubLanguage;
  itemCount?: number;
  completedCount?: number;
  onClick?: () => void;
}

export function CollectionCard({
  collection,
  language = "pt-br",
  itemCount = 0,
  completedCount = 0,
  onClick,
}: Props) {
  const title = collection.title?.[language] || collection.title?.["pt-br"] || "Sem título";
  const description = collection.description?.[language] || collection.description?.["pt-br"] || "";
  const progress = itemCount > 0 ? Math.round((completedCount / itemCount) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40 cursor-pointer h-full flex flex-col"
    >
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 text-accent group-hover:scale-110 transition-transform duration-500">
            <BookOpen size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-accent/20 rounded-lg bg-accent/10 text-accent">
            Trilha
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight text-text-main">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm mb-4 line-clamp-2 text-text-muted">
            {description}
          </p>
        )}

        {/* Progress + footer */}
        <div className="mt-auto">
          {itemCount > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-text-muted">{completedCount} de {itemCount} concluídos</span>
                <span className="text-accent font-bold">{progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-1 text-xs font-bold text-text-muted">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              {collection.points} XP
            </div>
            {progress === 100 && itemCount > 0 ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                <CheckCircle size={12} /> Concluída
              </span>
            ) : (
              <span className="text-xs font-bold text-accent transition-all group-hover:translate-x-1">
                Ver trilha →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
