import { Link } from "@tanstack/react-router"
import { ChevronRight, ArrowLeft, PackageOpen } from "lucide-react"
import { cn } from "~/lib/utils"
import { useTranslation } from "react-i18next"

interface DrillDownOption {
  id: string
  label: string
  sublabel?: string
  count?: number
  color?: string
  disabled?: boolean
}

interface DrillDownProps {
  title: string
  subtitle: string
  step: number
  totalSteps: number
  options: DrillDownOption[]
  onSelect: (id: string) => void
  onBack?: () => void
  backLabel?: string
  isLoading?: boolean
}

export function DrillDown({ title, subtitle, step, totalSteps, options, onSelect, onBack, backLabel, isLoading }: DrillDownProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header Premium */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-6">
        {onBack && (
          <button 
            onClick={onBack} 
            className="group shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all mt-1 sm:mt-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </button>
        )}
        <div>
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn("h-1.5 rounded-full transition-all duration-500", i < step ? "w-8 bg-[var(--color-accent)]" : "w-2 bg-[var(--color-border-subtle)]")} 
                />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] ml-2">{t("catalogo.step", { current: step, total: totalSteps })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter text-balance">{title}</h1>
          <p className="text-sm sm:text-lg mt-1 sm:mt-2 text-[var(--color-text-muted)] text-balance">{subtitle}</p>
        </div>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-4">
          {options.length} {t("catalogo.categories.results")}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-[var(--color-surface)]/50 border border-[var(--color-border-subtle)] animate-pulse" />
          ))}
        </div>
      ) : options.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 backdrop-blur-md">
          <PackageOpen className="h-14 w-14 mx-auto mb-6 opacity-20 text-white" />
          <p className="text-xl font-black text-white tracking-tight">{t("catalogo.categories.noImplants")}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm mx-auto">{t("catalogo.categories.noImplantsLine")}</p>
        </div>
      ) : (
      /* Options Grid */
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {options.map((opt) => {
          const cor = opt.color || "var(--color-accent)"
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              disabled={opt.disabled}
              style={{
                borderWidth: "0.5px",
                "--card-color": cor,
              } as React.CSSProperties}
              className={cn(
                "group relative text-left rounded-2xl border-solid p-5 transition-all duration-300 overflow-hidden min-h-[88px]",
                opt.disabled
                  ? "opacity-40 cursor-not-allowed bg-[var(--color-surface)] border-[var(--color-border-subtle)]"
                  : "bg-[var(--color-surface)]/50 border-[var(--color-border-subtle)] hover:border-[var(--card-color)]/40"
              )}
            >
              {/* Background gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${cor}10 0%, transparent 70%)` }}
              />

              <div className="flex items-center gap-4 relative z-10">
                {/* Ícone */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{ backgroundColor: `${cor}12` }}
                >
                  <div className="w-3 h-3 rounded-full transition-all" style={{ backgroundColor: cor, boxShadow: `0 0 6px ${cor}40` }} />
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-white transition-colors">
                    {opt.label}
                  </h3>
                  {opt.sublabel && (
                    <p className="text-xs mt-1 text-[var(--color-text-muted)] line-clamp-2 group-hover:text-white/60 transition-colors">
                      {opt.sublabel}
                    </p>
                  )}
                </div>

                {/* Badge + Setinha */}
                <div className="flex items-center gap-2 shrink-0">
                  {opt.count !== undefined && (
                    <span
                      className="text-[10px] font-black min-w-[24px] h-6 flex items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: `${cor}10`,
                        color: cor,
                        border: `0.5px solid ${cor}20`,
                      }}
                    >
                      {opt.count}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-white transition-colors" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
      )}
    </div>
  )
}
