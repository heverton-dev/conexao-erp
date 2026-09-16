import type { CatalogoDesignConfig } from "../../services/design.service"
import {
  Crosshair, ShieldCheck, Box, Tag,
  Package, Layers, ShoppingBag, Percent,
  Star, Heart, Diamond, Circle,
  Hexagon, Pentagon, Triangle, Square,
  Zap, Target, Award, Gem, Search, Menu,
  type LucideIcon,
} from "lucide-react"
import { IconImplante, IconComponente, IconKit, IconPromocao } from "../IconsOdonto"

const ICON_MAP: Record<string, any> = {
  IconImplante, IconComponente, IconKit, IconPromocao,
  Crosshair, ShieldCheck, Box, Tag,
  Package, Layers, ShoppingBag, Percent,
  Star, Heart, Diamond, Circle,
  Hexagon, Pentagon, Triangle, Square,
  Zap, Target, Award, Gem,
}

interface StoreMiniaturaProps {
  config: CatalogoDesignConfig
}

export function StoreMiniatura({ config }: StoreMiniaturaProps) {
  const { colors, texts, visibility, images, effects, elementBackgrounds, cards, footer } = config

  const cssVars: Record<string, string> = {
    "--color-accent": colors.accent,
    "--color-accent-hover": colors.accentHover,
    "--color-accent-fg": colors.accentFg,
    "--color-bg": colors.bg,
    "--color-surface": colors.surface,
    "--color-surface-hover": colors.surfaceHover,
    "--color-card": colors.card,
    "--color-text-main": colors.textMain,
    "--color-text-muted": colors.textMuted,
    "--color-border-subtle": colors.borderSubtle,
    "--color-input-bg": colors.inputBg,
    "--color-input-border": colors.inputBorder,
    "--color-success": colors.success,
    "--color-error": colors.error,
  }

  return (
    <div
      className="catalogo-theme h-full flex flex-col relative"
      style={{
        ...cssVars,
        backgroundImage: images.pageBackgroundUrl ? `url(${images.pageBackgroundUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header Fixo do Preview */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md h-12 px-4 flex items-center justify-between border-b border-border-subtle">
        <div className="h-5">
          {images.logoUrl ? (
            <img src={images.logoUrl as string} alt="Logo" className="h-full object-contain" />
          ) : (
            <span className="text-[10px] font-bold">Logo Oculta/Faltando</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {visibility.showSearchBar && <Search className="w-3.5 h-3.5 text-text-muted" />}
          <Menu className="w-3.5 h-3.5 text-text-muted" />
        </div>
      </header>

      {/* Area Central Flex para alinhamento Vertical */}
      <div className="flex-1 flex flex-col justify-center relative z-0">
        {/* Hero Section */}
        {visibility.showHeroSection && (
          <div className="relative px-4 py-6 text-center">
            {images.heroBackgroundUrl && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${images.heroBackgroundUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: images.heroBackgroundOpacity ?? 0.1,
                }}
              />
            )}
            {effects.enableBlobs && (
              <>
                <div
                  className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: effects.blobColor,
                    opacity: effects.blobOpacity,
                    filter: `blur(${effects.blobBlur}px)`,
                  }}
                />
                <div
                  className="absolute bottom-[10%] right-[10%] w-24 h-24 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: effects.blobColor,
                    opacity: effects.blobOpacity * 0.7,
                    filter: `blur(${effects.blobBlur * 0.8}px)`,
                  }}
                />
              </>
            )}
            <div className="relative z-10">
              <p
                className="text-[8px] font-bold uppercase tracking-widest mb-1"
                style={{ color: colors.accent }}
              >
                {texts.storeTagline}
              </p>
              <h2
                className="text-sm font-black leading-tight mb-1"
                style={{ color: colors.textMain }}
              >
                {texts.heroTitle}
              </h2>
              <p className="text-[9px]" style={{ color: colors.textMuted }}>
                {texts.heroSubtitle}
              </p>
            </div>
          </div>
        )}

        {/* Barra de Busca */}
        {visibility.showSearchBar && (
          <div className="mx-4 mb-3">
            <div
              className="h-8 rounded-full px-3 flex items-center text-[9px]"
              style={{
                backgroundColor: elementBackgrounds.inputBg || colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                color: colors.textMuted,
              }}
            >
              🔍 Buscar por SKU, Linha...
            </div>
          </div>
        )}

        {/* Category Cards */}
        {visibility.showCategoryCards && cards && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {(["implantes", "componentes", "kits", "promocionais"] as const).map((key) => {
              const card = cards[key]
              if (!card?.enabled) return null
              const Icon = ICON_MAP[card.icon]
              return (
                <div
                  key={key}
                  className="rounded-xl p-3 text-center"
                  style={{
                    backgroundColor: card.cardBg || colors.surface,
                    border: `1px solid ${card.cardBorder || colors.borderSubtle}`,
                  }}
                >
                  <div
                    className="w-8 h-8 shrink-0 rounded-lg bg-input-bg border border-border-subtle flex items-center justify-center mb-2"
                    style={{ color: card!.iconColor }}
                  >
                    {Icon ? <Icon size={16} /> : <span>?</span>}
                  </div>
                  <p className="text-[9px] font-bold" style={{ color: card.titleColor }}>
                    {card.title}
                  </p>
                  <p className="text-[7px]" style={{ color: card.descColor }}>
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>{/* Fim area central */}

      {/* Footer */}
      {visibility.showFooter && footer && (
        <div
          className="mt-auto py-3 text-center border-t"
          style={{ borderColor: colors.borderSubtle }}
        >
          <p className="text-[8px]" style={{ color: colors.textMuted }}>
            {texts.footerText}
          </p>
        </div>
      )}
    </div>
  )
}
