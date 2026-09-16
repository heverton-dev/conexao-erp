import { createRoute, Link, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase"
import { EMPRESA_ID } from "~/config/empresa"
import { Loader2, Crosshair, ShieldCheck, Box, Tag, Package, Layers, ShoppingBag, Percent, Star, Heart, Diamond, Circle, Zap, Target, Award, Gem, Hexagon, Pentagon, Triangle, Square, type LucideIcon } from "lucide-react"
import { getCatalogoDesign, mergeWithDefaults, type CatalogoDesignConfig } from "~/features/catalogo/services/design.service"
import { WatermarkShape } from "~/features/catalogo/components/WatermarkShape"

const ICON_MAP: Record<string, LucideIcon> = {
  Crosshair, ShieldCheck, Box, Tag,
  Package, Layers, ShoppingBag, Percent,
  Star, Heart, Diamond, Circle,
  Hexagon, Pentagon, Triangle, Square,
  Zap, Target, Award, Gem,
}

function withProtocol(url: string): string {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`
  return url
}

export const catalogoEmpresaSlugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/$slug",
  component: CatalogoEmpresaPage,
})

interface EmpresaData {
  id: string
  nome: string
  slug: string
}

function CatalogoEmpresaPage() {
  const { slug } = useParams({ strict: false }) as { slug: string }
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Single-tenant: empresa fixa via config
    setEmpresa({ id: EMPRESA_ID, nome: "Conexão Implant", slug: slug })
    setLoading(false)
  }, [slug])

  if (loading) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={24} className="animate-spin text-[var(--color-accent)]" />
        </div>
      </StoreLayout>
    )
  }

  if (notFound || !empresa) {
    return (
      <StoreLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <h1 className="text-4xl font-black text-white mb-4">Loja não encontrada</h1>
          <p className="text-[var(--color-text-muted)]">Esta loja não existe ou está desativada.</p>
          <Link to="/" className="mt-6 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-fg)] font-bold text-sm hover:opacity-90 transition-opacity">
            Voltar ao início
          </Link>
        </div>
      </StoreLayout>
    )
  }

  return <CatalogoStoreContent empresaId={empresa.id} />
}

function CatalogoStoreContent({ empresaId }: { empresaId: string }) {
  const [config, setConfig] = useState<CatalogoDesignConfig | null>(null)

  useEffect(() => {
    getCatalogoDesign().then(setConfig)
  }, [empresaId])

  if (!config) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={24} className="animate-spin text-[var(--color-accent)]" />
        </div>
      </StoreLayout>
    )
  }

  const { texts, cards, visibility, effects, footer } = config
  const cardKeys = ["implantes", "componentes", "kits", "promocionais"] as const
  const visibleCards = cardKeys.filter((key) => cards[key]?.enabled)
  const visibleCount = visibleCards.length

  const gridColsClass = visibleCount <= 1
    ? "grid-cols-1 max-w-xs mx-auto"
    : visibleCount === 2
      ? "grid-cols-2 max-w-2xl mx-auto"
      : visibleCount === 3
        ? "grid-cols-3 max-w-5xl mx-auto"
        : "grid-cols-2 lg:grid-cols-4"

  return (
    <StoreLayout fullHeight zoom={0.85}>
      <div className="flex flex-col overflow-hidden flex-1">
        {visibility.showHeroSection && (
          <div className="relative shrink-0">
            {effects.enableBlobs && (
              <div
                className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{ backgroundColor: effects.blobColor, opacity: effects.blobOpacity, filter: `blur(${effects.blobBlur}px)` }}
              />
            )}
            <div className="px-5 sm:px-6 lg:px-16 pt-8 pb-4 sm:pt-12 sm:pb-6 lg:pt-16 lg:pb-8 max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[var(--color-accent-muted)] bg-[var(--color-surface)]/50 backdrop-blur-md mb-3 sm:mb-4 lg:mb-4">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  {texts.storeTagline}
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-2 sm:mb-3 lg:mb-4 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-tight">
                {texts.heroTitle}
              </h2>
              <p className="text-xs sm:text-base lg:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                {texts.heroSubtitle}
              </p>
            </div>
          </div>
        )}

        {visibility.showCategoryCards && visibleCount > 0 && (
          <div className="flex-1 px-4 sm:px-6 lg:px-16 pt-2 pb-4 max-w-7xl mx-auto w-full flex flex-col justify-center">
            <div className={`grid ${gridColsClass} gap-3 sm:gap-4 lg:gap-6 auto-rows-fr relative z-20 w-full`}>
              {visibleCards.map((key) => {
                const card = cards[key]
                const Icon = ICON_MAP[card!.icon]
                return (
                  <Link
                    key={key}
                    to={`/catalogo/${key}` as any}
                    className="card-catalogo group relative rounded-2xl sm:rounded-3xl backdrop-blur-xl transition-all overflow-hidden flex flex-col items-center justify-end p-3 sm:p-5 lg:p-8 no-underline shadow-2xl hover:-translate-y-2"
                    style={{
                      backgroundColor: card!.cardBg || "var(--color-surface)",
                      border: "0.7px solid var(--color-border-subtle)",
                    }}
                  >
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-[var(--color-accent-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {visibility.showWatermark !== false && (
                      <WatermarkShape
                        shape={cards.watermarkShape || "diamond"}
                        color={card!.watermarkColor || card!.iconColor}
                        className="-bottom-4 -right-4 sm:bottom-auto sm:top-1/2 sm:right-4 sm:-translate-y-1/2 lg:right-6 w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36"
                      />
                    )}
                    <div
                      className="w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-[var(--color-input-bg)] border border-[var(--color-border-subtle)] flex items-center justify-center mb-2 sm:mb-4 lg:mb-6 relative z-10 group-hover:border-[var(--color-accent)] transition-colors shadow-xl"
                      style={{ color: card!.iconColor }}
                    >
                      {Icon && <Icon size={20} className="sm:hidden" />}
                      {Icon && <Icon size={28} className="hidden sm:block lg:hidden" />}
                      {Icon && <Icon size={32} className="hidden lg:block" />}
                    </div>
                    <h3 className="text-sm sm:text-lg lg:text-3xl font-bold mb-0.5 sm:mb-1.5 lg:mb-3 relative z-10 text-center leading-tight" style={{ color: card!.titleColor }}>{card!.title}</h3>
                    <p className="text-[9px] sm:text-xs lg:text-sm relative z-10 group-hover:opacity-80 transition-colors text-center leading-snug hidden sm:block" style={{ color: card!.descColor }}>{card!.description}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  )
}
