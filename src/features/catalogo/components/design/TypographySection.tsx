import type { CatalogoDesignTypography } from "../../services/design.service"

interface TypographySectionProps {
  typography: CatalogoDesignTypography
  onChange: (typography: CatalogoDesignTypography) => void
}

const FONT_OPTIONS = [
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Raleway', sans-serif", label: "Raleway" },
  { value: "'Nunito', sans-serif", label: "Nunito" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
]

export function TypographySection({ typography, onChange }: TypographySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Tipografia</h3>
        <p className="text-xs text-text-muted">Escolha as fontes da loja</p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border-subtle space-y-4">
        <div>
          <label className="text-xs text-text-muted font-medium block mb-2">Fonte Principal</label>
          <select
            value={typography.fontFamily}
            onChange={(e) => onChange({ ...typography, fontFamily: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <p className="mt-3 text-lg font-bold" style={{ fontFamily: typography.fontFamily }}>
            Preview: Aa Bb Cc 123
          </p>
          <p className="text-sm text-text-muted" style={{ fontFamily: typography.fontFamily }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border-subtle">
        <div>
          <label className="text-xs text-text-muted font-medium block mb-2">Fonte Monoespaçada</label>
          <select
            value={typography.fontFamilyMono}
            onChange={(e) => onChange({ ...typography, fontFamilyMono: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm"
          >
            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
            <option value="'Fira Code', monospace">Fira Code</option>
            <option value="'Source Code Pro', monospace">Source Code Pro</option>
            <option value="'Roboto Mono', monospace">Roboto Mono</option>
          </select>
          <p className="mt-3 text-sm" style={{ fontFamily: typography.fontFamilyMono }}>
            SKU: acd05716-e3d9-4a32
          </p>
        </div>
      </div>
    </div>
  )
}
