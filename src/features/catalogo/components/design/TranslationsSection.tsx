import { useState } from "react"
import { Globe, Plus, Trash2, Sparkles, Loader2 } from "lucide-react"
import type { CatalogoDesignConfig, CatalogoDesignTranslations, CatalogoDesignTranslationTexts } from "../../services/design.service"
import { traduzirTextosDesign } from "../../services/design.service"

interface TranslationsSectionProps {
  config: CatalogoDesignConfig
  translations: CatalogoDesignTranslations | undefined
  onChange: (translations: CatalogoDesignTranslations) => void
}

const LANGUAGES = [
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
]

function createEmptyTranslation(): CatalogoDesignTranslationTexts {
  return {
    storeTagline: "",
    heroTitle: "",
    heroSubtitle: "",
    cards: {
      implantes: { title: "", description: "" },
      componentes: { title: "", description: "" },
      kits: { title: "", description: "" },
      promocionais: { title: "", description: "" },
    },
  }
}

function mergeTranslation(
  base: CatalogoDesignTranslationTexts,
  incoming: CatalogoDesignTranslationTexts,
): CatalogoDesignTranslationTexts {
  const cards = {} as CatalogoDesignTranslationTexts["cards"]
  ;(["implantes", "componentes", "kits", "promocionais"] as const).forEach((key) => {
    cards[key] = {
      title: incoming.cards[key].title || base.cards[key].title,
      description: incoming.cards[key].description || base.cards[key].description,
    }
  })
  return {
    storeTagline: incoming.storeTagline || base.storeTagline,
    heroTitle: incoming.heroTitle || base.heroTitle,
    heroSubtitle: incoming.heroSubtitle || base.heroSubtitle,
    cards,
  }
}

export function TranslationsSection({ config, translations, onChange }: TranslationsSectionProps) {
  const [activeLang, setActiveLang] = useState<string>("en-US")
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState("")

  const current = translations?.[activeLang] || createEmptyTranslation()

  function updateLang(lang: string, data: CatalogoDesignTranslationTexts) {
    onChange({ ...translations, [lang]: data })
  }

  async function handleAutoTranslate() {
    setTranslating(true)
    setTranslateError("")
    try {
      const result = await traduzirTextosDesign(config, activeLang as "en-US" | "es-ES")
      const merged = mergeTranslation(current, result)
      if (!merged.storeTagline && !merged.heroTitle && !merged.heroSubtitle) {
        setTranslateError("Não foi possível traduzir agora. Tente novamente ou preencha manualmente.")
        return
      }
      updateLang(activeLang, merged)
    } catch {
      setTranslateError("Não foi possível traduzir agora. Tente novamente ou preencha manualmente.")
    } finally {
      setTranslating(false)
    }
  }

  function handleTextChange(field: keyof Omit<CatalogoDesignTranslationTexts, "cards">, value: string) {
    updateLang(activeLang, { ...current, [field]: value })
  }

  function handleCardChange(cardKey: "implantes" | "componentes" | "kits" | "promocionais", field: "title" | "description", value: string) {
    updateLang(activeLang, {
      ...current,
      cards: {
        ...current.cards,
        [cardKey]: { ...current.cards[cardKey], [field]: value },
      },
    })
  }

  function removeLang(lang: string) {
    const next = { ...translations }
    delete next[lang]
    onChange(next)
  }

  const availableLangs = LANGUAGES.filter((l) => !translations?.[l.code])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1 flex items-center gap-2">
          <Globe size={14} />
          Traduções
        </h3>
        <p className="text-xs text-text-muted">Adicione traduções para os textos da loja em outros idiomas</p>
      </div>

      {/* Language tabs */}
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const exists = !!translations?.[lang.code]
          return (
            <button
              key={lang.code}
              onClick={() => setActiveLang(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeLang === lang.code
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : exists
                    ? "bg-card border border-border-subtle text-text-muted hover:text-text-main"
                    : "bg-card border border-border-subtle text-text-muted/50"
              }`}
            >
              <span>{lang.flag}</span>
              {lang.label}
              {exists && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeLang(lang.code) }}
                  className="ml-1 text-text-muted hover:text-red-400"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </button>
          )
        })}
      </div>

      {/* Auto-translate */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">Traduz automaticamente a partir do texto em PT-BR (revise depois)</p>
        <button
          onClick={handleAutoTranslate}
          disabled={translating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors disabled:opacity-50 shrink-0"
        >
          {translating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          Traduzir automaticamente
        </button>
      </div>
      {translateError && <p className="text-xs text-red-400">{translateError}</p>}

      {/* Fields for active language */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-card border border-border-subtle">
          <label className="text-xs text-text-muted font-medium block mb-2">Tagline</label>
          <input
            type="text"
            value={current.storeTagline}
            onChange={(e) => handleTextChange("storeTagline", e.target.value)}
            placeholder="Ex: New Dental Standard"
            className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm"
          />
        </div>

        <div className="p-4 rounded-xl bg-card border border-border-subtle">
          <label className="text-xs text-text-muted font-medium block mb-2">Título do Hero</label>
          <textarea
            value={current.heroTitle}
            onChange={(e) => handleTextChange("heroTitle", e.target.value)}
            placeholder="Ex: Precision & Absolute Performance"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm resize-none"
          />
        </div>

        <div className="p-4 rounded-xl bg-card border border-border-subtle">
          <label className="text-xs text-text-muted font-medium block mb-2">Subtítulo do Hero</label>
          <textarea
            value={current.heroSubtitle}
            onChange={(e) => handleTextChange("heroSubtitle", e.target.value)}
            placeholder="Ex: Explore our complete line of implants..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm resize-none"
          />
        </div>

        {/* Card translations */}
        <div className="p-4 rounded-xl bg-card border border-border-subtle space-y-3">
          <p className="text-xs text-text-muted font-medium">Cards da Loja</p>
          {(["implantes", "componentes", "kits", "promocionais"] as const).map((cardKey) => (
            <div key={cardKey} className="space-y-2 pl-3 border-l-2 border-border-subtle">
              <p className="text-xs font-bold text-text-main capitalize">{cardKey}</p>
              <input
                type="text"
                value={current.cards[cardKey].title}
                onChange={(e) => handleCardChange(cardKey, "title", e.target.value)}
                placeholder={`Título (${cardKey})`}
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm"
              />
              <input
                type="text"
                value={current.cards[cardKey].description}
                onChange={(e) => handleCardChange(cardKey, "description", e.target.value)}
                placeholder={`Descrição (${cardKey})`}
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
