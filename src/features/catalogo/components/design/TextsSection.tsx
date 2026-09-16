import type { CatalogoDesignTexts } from "../../services/design.service"

interface TextsSectionProps {
  texts: CatalogoDesignTexts
  onChange: (texts: CatalogoDesignTexts) => void
}

const TEXT_FIELDS: { key: keyof CatalogoDesignTexts; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "storeName", label: "Nome da Loja", placeholder: "ERP Odonto" },
  { key: "storeTagline", label: "Tagline", placeholder: "Novo Padrão Odontológico" },
  { key: "heroTitle", label: "Título do Hero", placeholder: "Performance & Precisão Absoluta", multiline: true },
  { key: "heroSubtitle", label: "Subtítulo do Hero", placeholder: "Explore nossa linha completa...", multiline: true },
  { key: "footerText", label: "Texto do Footer", placeholder: "ERP Odonto" },
]

export function TextsSection({ texts, onChange }: TextsSectionProps) {
  function handleTextChange(key: keyof CatalogoDesignTexts, value: string) {
    onChange({ ...texts, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Textos da Loja</h3>
        <p className="text-xs text-text-muted">Personalize os textos exibidos na loja</p>
      </div>

      <div className="space-y-3">
        {TEXT_FIELDS.map(({ key, label, placeholder, multiline }) => (
          <div key={key} className="p-4 rounded-xl bg-card border border-border-subtle">
            <label className="text-xs text-text-muted font-medium block mb-2">{label}</label>
            {multiline ? (
              <textarea
                value={texts[key]}
                onChange={(e) => handleTextChange(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm resize-none"
              />
            ) : (
              <input
                type="text"
                value={texts[key]}
                onChange={(e) => handleTextChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
