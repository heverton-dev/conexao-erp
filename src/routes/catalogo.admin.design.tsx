
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Save, Loader2, ExternalLink, Copy, Check } from "lucide-react"
import toast from "react-hot-toast"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { PhoneMockup } from "~/features/catalogo/components/design/PhoneMockup"
import { ColorSection } from "~/features/catalogo/components/design/ColorSection"
import { TypographySection } from "~/features/catalogo/components/design/TypographySection"
import { TextsSection } from "~/features/catalogo/components/design/TextsSection"
import { VisibilitySection } from "~/features/catalogo/components/design/VisibilitySection"
import { ImagesSection } from "~/features/catalogo/components/design/ImagesSection"
import { EffectsSection } from "~/features/catalogo/components/design/EffectsSection"
import { CardsSection } from "~/features/catalogo/components/design/CardsSection"
import { FooterSection } from "~/features/catalogo/components/design/FooterSection"
import { ThemesSection } from "~/features/catalogo/components/design/ThemesSection"
import { TranslationsSection } from "~/features/catalogo/components/design/TranslationsSection"
import {
  getCatalogoDesign,
  saveCatalogoDesign,
  DEFAULT_CATALOGO_CONFIG,
  type CatalogoDesignConfig,
} from "~/features/catalogo/services/design.service"


export const catalogoAdminDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/design",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_design"]}>
      <AdminDesignPage />
    </RequirePermission>
  ),
})

type TabKey = "colors" | "typography" | "texts" | "visibility" | "images" | "effects" | "cards" | "themes" | "footer" | "translations"

const TABS: { key: TabKey; label: string }[] = [
  { key: "themes", label: "Temas" },
  { key: "colors", label: "Cores" },
  { key: "cards", label: "Cards" },
  { key: "typography", label: "Tipografia" },
  { key: "texts", label: "Textos" },
  { key: "translations", label: "Traduções" },
  { key: "visibility", label: "Visibilidade" },
  { key: "images", label: "Logos" },
  { key: "effects", label: "Efeitos" },
  { key: "footer", label: "Rodapé" },
]

function AdminDesignPage() {
  const queryClient = useQueryClient()
  const [config, setConfig] = useState<CatalogoDesignConfig>(DEFAULT_CATALOGO_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("colors")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    getCatalogoDesign()
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.title = config?.texts?.storeName ? `${config.texts.storeName} - Design da Loja` : "Design da Loja"
  }, [config?.texts?.storeName])

  async function handleSave() {
    setSaving(true)
    try {
      await saveCatalogoDesign(config)
      queryClient.invalidateQueries({ queryKey: ["catalogo", "design"] })
      toast.success("Design salvo com sucesso!")
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar design")
    } finally {
      setSaving(false)
    }
  }

  const storeUrl = `${window.location.origin}/catalogo`

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      toast.success("Link copiado!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Erro ao copiar link")
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-bold text-text-main">Design da Loja</h1>
          <p className="text-xs text-text-muted">
            Personalize a aparência da loja do catálogo
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Link da loja + Copiar */}
          <div className="flex items-center gap-2">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border-subtle text-text-muted text-xs hover:text-accent hover:border-accent/50 transition-colors"
            >
              <ExternalLink size={12} />
              <span className="max-w-[200px] truncate">Loja</span>
            </a>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border-subtle text-text-muted text-xs hover:text-accent hover:border-accent/50 transition-colors"
              title="Copiar link da loja"
            >
              {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar
          </button>
        </div>
      </div>


      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Coluna Esquerda — Painel de Edição */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-1 p-1 rounded-xl bg-card border border-border-subtle">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "bg-accent/15 text-accent"
                      : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === "colors" && (
                <ColorSection
                  colors={config.colors}
                  onChange={(colors) => setConfig({ ...config, colors })}
                />
              )}
              {activeTab === "typography" && (
                <TypographySection
                  typography={config.typography}
                  onChange={(typography) => setConfig({ ...config, typography })}
                />
              )}
              {activeTab === "texts" && (
                <TextsSection
                  texts={config.texts}
                  onChange={(texts) => setConfig({ ...config, texts })}
                />
              )}
              {activeTab === "visibility" && (
                <VisibilitySection
                  visibility={config.visibility}
                  onChange={(visibility) => setConfig({ ...config, visibility })}
                />
              )}
              {activeTab === "images" && (
                <ImagesSection
                  images={config.images}
                  onChange={(images) => setConfig({ ...config, images })}
                />
              )}
              {activeTab === "effects" && (
                <EffectsSection
                  effects={config.effects}
                  onChange={(effects) => setConfig({ ...config, effects })}
                />
              )}
              {activeTab === "cards" && (
                <CardsSection
                  cards={config.cards}
                  onChange={(cards) => setConfig({ ...config, cards })}
                  isSuperAdmin={true}
                />
              )}
              {activeTab === "footer" && (
                <FooterSection
                  footer={config.footer}
                  onChange={(footer) => setConfig({ ...config, footer })}
                />
              )}
              {activeTab === "themes" && (
                <ThemesSection
                  config={config}
                  onApply={(newConfig) => setConfig(newConfig)}
                />
              )}
              {activeTab === "translations" && (
                <TranslationsSection
                  config={config}
                  translations={config.translations}
                  onChange={(translations) => setConfig({ ...config, translations })}
                />
              )}
            </div>
          </div>

          {/* Coluna Direita — Preview Sticky */}
          <div className="hidden lg:block sticky top-24">
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-text-muted mb-4 uppercase tracking-wider">
                Preview ao Vivo
              </p>
              <PhoneMockup config={config} />
            </div>
          </div>

          {/* Mobile — Preview abaixo do painel */}
          <div className="lg:hidden flex flex-col items-center">
            <p className="text-xs font-bold text-text-muted mb-4 uppercase tracking-wider">
              Preview ao Vivo
            </p>
            <PhoneMockup config={config} />
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
