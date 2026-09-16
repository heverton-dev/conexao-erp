import type { CatalogoDesignVisibility } from "../../services/design.service"

interface VisibilitySectionProps {
  visibility: CatalogoDesignVisibility
  onChange: (visibility: CatalogoDesignVisibility) => void
}

const TOGGLE_FIELDS: { key: keyof CatalogoDesignVisibility; label: string; description: string }[] = [
  { key: "showPrices", label: "Exibir Preços", description: "Mostrar preços dos produtos na loja" },
  { key: "showStock", label: "Exibir Estoque", description: "Mostrar quantidade em estoque" },
  { key: "showSearchBar", label: "Barra de Busca", description: "Exibir barra de pesquisa no header" },
  { key: "showCartIcon", label: "Ícone do Carrinho", description: "Exibir ícone de carrinho no header" },
  { key: "showHeroSection", label: "Seção Hero", description: "Exibir banner principal com título e subtítulo" },
  { key: "showCategoryCards", label: "Cards de Categoria", description: "Exibir grid de categorias (Implantes, Componentes, etc.)" },
  { key: "showWatermark", label: "Watermark nos Cards", description: "Exibir forma decorativa nos cards de categoria" },
  { key: "showFooter", label: "Footer", description: "Exibir rodapé da loja" },
]

export function VisibilitySection({ visibility, onChange }: VisibilitySectionProps) {
  function handleToggle(key: keyof CatalogoDesignVisibility) {
    onChange({ ...visibility, [key]: !visibility[key] })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Visibilidade</h3>
        <p className="text-xs text-text-muted">Controle quais elementos aparecem na loja</p>
      </div>

      <div className="space-y-2">
        {TOGGLE_FIELDS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border-subtle">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-text-main">{label}</p>
              <p className="text-xs text-text-muted">{description}</p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                visibility[key] ? "bg-accent" : "bg-input-border"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  visibility[key] ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
