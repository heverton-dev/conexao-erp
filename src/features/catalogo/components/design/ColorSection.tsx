import type { CatalogoDesignColors } from "../../services/design.service"

interface ColorSectionProps {
  colors: CatalogoDesignColors
  onChange: (colors: CatalogoDesignColors) => void
}

const COLOR_FIELDS: { key: keyof CatalogoDesignColors; label: string }[] = [
  { key: "accent", label: "Destaque (Principal)" },
  { key: "accentHover", label: "Destaque (Hover)" },
  { key: "accentFg", label: "Texto sobre Destaque" },
  { key: "bg", label: "Fundo da Página" },
  { key: "surface", label: "Superfície / Cards" },
  { key: "surfaceHover", label: "Hover de Superfícies" },
  { key: "card", label: "Background Cards" },
  { key: "textMain", label: "Texto Principal" },
  { key: "textMuted", label: "Texto Secundário" },
  { key: "borderSubtle", label: "Bordas" },
  { key: "inputBg", label: "Fundo dos Inputs" },
  { key: "inputBorder", label: "Borda dos Inputs" },
  { key: "success", label: "Cor Sucesso" },
  { key: "error", label: "Cor Erro" },
]

export function ColorSection({ colors, onChange }: ColorSectionProps) {
  function handleColorChange(key: keyof CatalogoDesignColors, value: string) {
    onChange({ ...colors, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Cores da Loja</h3>
        <p className="text-xs text-text-muted">Personalize todas as cores da loja</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border-subtle">
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => handleColorChange(key, e.target.value)}
              className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent shrink-0"
            />
            <div className="flex-1 min-w-0">
              <label className="text-xs text-text-muted font-medium block truncate">{label}</label>
              <input
                type="text"
                value={colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-full mt-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
