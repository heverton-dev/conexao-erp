import { PREDEFINED_THEMES, type CatalogoDesignConfig, DEFAULT_CATALOGO_CONFIG } from "../../services/design.service"

interface ThemesSectionProps {
  config: CatalogoDesignConfig
  onApply: (config: CatalogoDesignConfig) => void
}

export function ThemesSection({ config, onApply }: ThemesSectionProps) {
  function handleApplyTheme(themeConfig: Partial<CatalogoDesignConfig>) {
    const merged = { ...config }
    if (themeConfig.colors) merged.colors = { ...config.colors, ...themeConfig.colors }
    if (themeConfig.effects) merged.effects = { ...config.effects, ...themeConfig.effects }
    if (themeConfig.cards) {
      merged.cards = {
        ...config.cards,
        ...themeConfig.cards,
        implantes: { ...config.cards.implantes, ...themeConfig.cards.implantes },
        componentes: { ...config.cards.componentes, ...themeConfig.cards.componentes },
        kits: { ...config.cards.kits, ...themeConfig.cards.kits },
        promocionais: { ...config.cards.promocionais, ...themeConfig.cards.promocionais },
      }
    }
    onApply(merged)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Temas Pré-Definidos</h3>
        <p className="text-xs text-text-muted">Aplique um tema para datas comemorativas</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PREDEFINED_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleApplyTheme(theme.config)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border-subtle hover:border-accent/50 hover:bg-surface-hover transition-all group"
          >
            <span className="text-3xl">{theme.emoji}</span>
            <span className="text-xs font-medium text-text-main group-hover:text-accent transition-colors">{theme.name}</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.config.colors?.accent }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.config.effects?.blobColor }} />
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => onApply(DEFAULT_CATALOGO_CONFIG)}
        className="w-full p-3 rounded-xl bg-card border border-border-subtle hover:border-accent/50 text-xs text-text-muted hover:text-accent transition-colors"
      >
        ↩ Reverter para tema padrão (Dourado)
      </button>
    </div>
  )
}
