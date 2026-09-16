import { createRoute, Link } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { Loader2, Crosshair, ShieldCheck, Box, Tag, Package, Layers, ShoppingBag, Percent, Star, Heart, Diamond, Circle, Zap, Target, Award, Gem, Hexagon, Pentagon, Triangle, Square, type LucideIcon } from "lucide-react"
import { useCatalogoDesign } from "~/features/catalogo/hooks/useCatalogo"
import { WatermarkShape } from "~/features/catalogo/components/WatermarkShape"
import { IconImplante, IconComponente, IconKit, IconPromocao } from "~/features/catalogo/components/IconsOdonto"
import { useTranslation } from "react-i18next"
import { useCatalogoLang } from "~/features/catalogo/contexts/language-context"
import { getTranslatedText, getTranslatedCard } from "~/features/catalogo/services/design.service"

const ICON_MAP: Record<string, any> = {
  IconImplante, IconComponente, IconKit, IconPromocao,
  Crosshair, ShieldCheck, Box, Tag,
  Package, Layers, ShoppingBag, Percent,
  Star, Heart, Diamond, Circle,
  Hexagon, Pentagon, Triangle, Square,
  Zap, Target, Award, Gem,
}

function handleCardTilt(e: React.MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  el.style.setProperty("--tilt-x", `${(0.5 - py) * 8}deg`)
  el.style.setProperty("--tilt-y", `${(px - 0.5) * 8}deg`)
  el.style.setProperty("--spot-x", `${px * 100}%`)
  el.style.setProperty("--spot-y", `${py * 100}%`)
}

function resetCardTilt(e: React.MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget
  el.style.setProperty("--tilt-x", "0deg")
  el.style.setProperty("--tilt-y", "0deg")
}

export const catalogoIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo",
  component: CatalogoIndexPage,
})

function CatalogoIndexPage() {
  return <CatalogoStoreContent />
}

function CatalogoStoreContent() {
  const { data: config } = useCatalogoDesign()
  const { t } = useTranslation()
  const { language } = useCatalogoLang()

  if (!config) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={24} className="animate-spin text-[var(--color-accent)]" />
        </div>
      </StoreLayout>
    )
  }

  const { cards, visibility, effects } = config
  const cardKeys = ["implantes", "componentes", "kits", "promocionais"] as const
  const visibleCards = cardKeys.filter((key) => cards[key]?.enabled)
  const visibleCount = visibleCards.length

  const gridColsClass = visibleCount <= 1
    ? "grid-cols-1 max-w-xs mx-auto"
    : visibleCount === 2
      ? "grid-cols-2 max-w-md mx-auto"
      : visibleCount === 3
        ? "grid-cols-2 sm:grid-cols-3 max-w-3xl mx-auto"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto"

  const heroTagline = getTranslatedText(config, language, "storeTagline")
  const heroTitle = getTranslatedText(config, language, "heroTitle")
  const heroSubtitle = getTranslatedText(config, language, "heroSubtitle")

  return (
    <StoreLayout>
      <div className="flex-1 flex flex-col justify-center relative">
      {visibility.showHeroSection && (
        <div className="relative shrink-0 z-0">
          {config.images.heroBackgroundUrl && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${config.images.heroBackgroundUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: config.images.heroBackgroundOpacity ?? 0.1,
              }}
            />
          )}
          {effects.enableBlobs && (
            <div
              className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
              style={{ backgroundColor: effects.blobColor, opacity: effects.blobOpacity, filter: `blur(${effects.blobBlur}px)` }}
            />
          )}
          <div className="px-5 sm:px-6 lg:px-16 pt-10 pb-6 sm:pt-12 sm:pb-6 lg:pt-16 lg:pb-8 max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[var(--color-accent-muted)] bg-[var(--color-surface)]/50 backdrop-blur-md mb-4 sm:mb-4 lg:mb-4">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                {heroTagline}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-3 sm:mb-3 lg:mb-4 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-[1.1]">
              {heroTitle}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </div>
        </div>
      )}

      {visibility.showCategoryCards && visibleCount > 0 && (
        <div className="px-4 sm:px-6 lg:px-16 pt-4 pb-8 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-16 max-w-7xl mx-auto w-full">
          <div className={`grid ${gridColsClass} gap-3 sm:gap-5 lg:gap-8 auto-rows-fr w-full`}>
            {visibleCards.map((key) => {
              const card = cards[key]
              const Icon = ICON_MAP[card!.icon]
              const isPromo = key === "promocionais"
              const translated = getTranslatedCard(config, language, key)
              return (
                <Link
                  key={key}
                  to={`/catalogo/${key}` as any}
                  onMouseMove={handleCardTilt}
                  onMouseLeave={resetCardTilt}
                  className={`card-catalogo group relative rounded-2xl sm:rounded-3xl backdrop-blur-xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 no-underline shadow-xl h-full min-h-[180px] sm:min-h-[200px] lg:min-h-[220px] ${isPromo ? "ring-2 ring-[var(--color-accent)]/40" : ""}`}
                  style={{
                    backgroundColor: card!.cardBg || "var(--color-surface)",
                    border: `1px solid ${isPromo ? "var(--color-accent)" : (card!.cardBorder || "var(--color-border-subtle)")}`,
                  }}
                >
                  {isPromo && (
                    <span className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--color-accent)] text-[#0f172a] text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(201,166,85,0.5)]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0f172a] opacity-60" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0f172a]" />
                      </span>
                      {t("catalogo.categories.promotions")}
                    </span>
                  )}
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-[var(--color-accent-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {visibility.showWatermark !== false && (
                    <WatermarkShape
                      shape={cards.watermarkShape || "diamond"}
                      color={card!.watermarkColor || card!.iconColor}
                      className="bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-36 lg:h-36 absolute"
                    />
                  )}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 shrink-0 rounded-xl sm:rounded-2xl bg-[var(--color-input-bg)] border border-[var(--color-border-subtle)] flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 relative z-10 group-hover:border-[var(--color-accent)] transition-colors shadow-xl"
                    style={{ color: card!.iconColor }}
                  >
                    {Icon && <Icon size={26} className="sm:hidden" />}
                    {Icon && <Icon size={28} className="hidden sm:block lg:hidden" />}
                    {Icon && <Icon size={32} className="hidden lg:block" />}
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-2xl font-bold relative z-10 text-center leading-tight mb-1 sm:mb-2" style={{ color: card!.titleColor }}>{translated.title}</h3>
                  <div className="h-8 sm:h-10 flex items-start justify-center px-1">
                    <p className="text-[10px] sm:text-xs lg:text-sm relative z-10 group-hover:opacity-80 transition-colors text-center leading-snug line-clamp-2" style={{ color: card!.descColor }}>{translated.description}</p>
                  </div>
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
