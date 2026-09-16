import { supabase } from "~/lib/supabase"

export interface CatalogoDesignColors {
  accent: string
  accentHover: string
  accentFg: string
  bg: string
  surface: string
  surfaceHover: string
  card: string
  textMain: string
  textMuted: string
  borderSubtle: string
  inputBg: string
  inputBorder: string
  success: string
  error: string
}

export interface CatalogoDesignTypography {
  fontFamily: string
  fontFamilyMono: string
}

export interface CatalogoDesignTexts {
  storeName: string
  storeTagline: string
  heroTitle: string
  heroSubtitle: string
  footerText: string
}

export interface CatalogoDesignTranslationTexts {
  storeTagline: string
  heroTitle: string
  heroSubtitle: string
  cards: {
    implantes: { title: string; description: string }
    componentes: { title: string; description: string }
    kits: { title: string; description: string }
    promocionais: { title: string; description: string }
  }
}

export type CatalogoDesignTranslations = Record<string, CatalogoDesignTranslationTexts>

export interface CatalogoDesignFooter {
  text: string
  bgColor: string
  textColor: string
  borderColor: string
  iconColor: string
  iconBgColor: string
  iconBorderColor: string
  socialLinks: {
    instagram: string
    facebook: string
    twitter: string
    linkedin: string
    whatsapp: string
    youtube: string
    tiktok: string
    site: string
    email: string
    telefone: string
    endereco: string
  }
}

export interface CatalogoDesignVisibility {
  showPrices: boolean
  showStock: boolean
  showSearchBar: boolean
  showCartIcon: boolean
  showHeroSection: boolean
  showCategoryCards: boolean
  showWatermark: boolean
  showFooter: boolean
}

export interface CatalogoDesignImages {
  logoUrl: string
  faviconUrl: string
  heroBackgroundUrl: string
  heroBackgroundOpacity: number
  pageBackgroundUrl: string
}

export interface CatalogoDesignElementBackgrounds {
  headerBg: string
  cardBg: string
  buttonBg: string
  inputBg: string
}

export interface CatalogoDesignEffects {
  enableBlobs: boolean
  blobColor: string
  blobOpacity: number
  blobBlur: number
  enableGrainTexture: boolean
  headerBlur: boolean
}

export interface CatalogoCategoryCard {
  id: string
  title: string
  description: string
  icon: string
  iconColor: string
  cardBg: string
  cardBorder: string
  titleColor: string
  descColor: string
  watermarkColor: string
  enabled: boolean
}

export type WatermarkShape = "diamond" | "circle" | "hexagon" | "ring" | "square"

export interface CatalogoDesignCards {
  implantes: CatalogoCategoryCard
  componentes: CatalogoCategoryCard
  kits: CatalogoCategoryCard
  promocionais: CatalogoCategoryCard
  backgroundColor: string
  borderColor: string
  watermarkShape: WatermarkShape
}

export interface CatalogoDesignConfig {
  colors: CatalogoDesignColors
  typography: CatalogoDesignTypography
  texts: CatalogoDesignTexts
  visibility: CatalogoDesignVisibility
  images: CatalogoDesignImages
  elementBackgrounds: CatalogoDesignElementBackgrounds
  effects: CatalogoDesignEffects
  cards: CatalogoDesignCards
  footer: CatalogoDesignFooter
  translations?: CatalogoDesignTranslations
}

export const DEFAULT_COLORS: CatalogoDesignColors = {
  accent: "#c9a655",
  accentHover: "#d4b366",
  accentFg: "#0f172a",
  bg: "#0f172a",
  surface: "#1e293b",
  surfaceHover: "#334155",
  card: "#1e293b",
  textMain: "#f8fafc",
  textMuted: "#94a3b8",
  borderSubtle: "#1e293b",
  inputBg: "#0f172a",
  inputBorder: "#334155",
  success: "#22c55e",
  error: "#ef4444",
}

export const DEFAULT_CARDS: CatalogoDesignCards = {
  implantes: {
    id: "implantes",
    title: "Implantes",
    description: "Cone Morse, HE, HI.",
    icon: "IconImplante",
    iconColor: "#c9a655",
    cardBg: "#1e293b",
    cardBorder: "#1e293b",
    titleColor: "#ffffff",
    descColor: "#94a3b8",
    watermarkColor: "#c9a655",
    enabled: true,
  },
  componentes: {
    id: "componentes",
    title: "Componentes",
    description: "Pilares e Motor Protético.",
    icon: "IconComponente",
    iconColor: "#c9a655",
    cardBg: "#1e293b",
    cardBorder: "#1e293b",
    titleColor: "#ffffff",
    descColor: "#94a3b8",
    watermarkColor: "#c9a655",
    enabled: true,
  },
  kits: {
    id: "kits",
    title: "Kits",
    description: "Maletas e Cirurgia Guiada.",
    icon: "IconKit",
    iconColor: "#c9a655",
    cardBg: "#1e293b",
    cardBorder: "#1e293b",
    titleColor: "#ffffff",
    descColor: "#94a3b8",
    watermarkColor: "#c9a655",
    enabled: true,
  },
  promocionais: {
    id: "promocionais",
    title: "Promoções",
    description: "Ofertas exclusivas e combos.",
    icon: "IconPromocao",
    iconColor: "#c9a655",
    cardBg: "#1e293b",
    cardBorder: "#1e293b",
    titleColor: "#ffffff",
    descColor: "#94a3b8",
    watermarkColor: "#c9a655",
    enabled: true,
  },
  backgroundColor: "",
  borderColor: "",
  watermarkShape: "diamond",
}

export const PREDEFINED_THEMES: { id: string; name: string; emoji: string; config: Partial<CatalogoDesignConfig> }[] = [
  {
    id: "natal",
    name: "Natal",
    emoji: "🎄",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#dc2626", accentHover: "#b91c1c", accentFg: "#ffffff" },
      effects: { enableBlobs: true, blobColor: "#dc2626", blobOpacity: 0.15, blobBlur: 120, enableGrainTexture: false, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#dc2626" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#dc2626" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#dc2626" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#dc2626" },
      },
    },
  },
  {
    id: "pascoa",
    name: "Páscoa",
    emoji: "🐰",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#a855f7", accentHover: "#9333ea", accentFg: "#ffffff" },
      effects: { enableBlobs: true, blobColor: "#a855f7", blobOpacity: 0.12, blobBlur: 120, enableGrainTexture: false, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#a855f7" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#a855f7" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#a855f7" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#a855f7" },
      },
    },
  },
  {
    id: "black-friday",
    name: "Black Friday",
    emoji: "🏷️",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#000000", accentHover: "#1a1a1a", accentFg: "#ffffff", bg: "#0a0a0a", surface: "#141414", surfaceHover: "#1f1f1f", card: "#141414", borderSubtle: "#262626", inputBg: "#0a0a0a", inputBorder: "#262626" },
      effects: { enableBlobs: true, blobColor: "#facc15", blobOpacity: 0.08, blobBlur: 150, enableGrainTexture: false, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#facc15" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#facc15" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#facc15" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#facc15" },
      },
    },
  },
  {
    id: "verao",
    name: "Verão",
    emoji: "☀️",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#f97316", accentHover: "#ea580c", accentFg: "#ffffff" },
      effects: { enableBlobs: true, blobColor: "#f97316", blobOpacity: 0.10, blobBlur: 120, enableGrainTexture: false, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#f97316" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#f97316" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#f97316" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#f97316" },
      },
    },
  },
  {
    id: "dia-dos-pais",
    name: "Dia dos Pais",
    emoji: "👨‍👧‍👦",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#2563eb", accentHover: "#1d4ed8", accentFg: "#ffffff" },
      effects: { enableBlobs: true, blobColor: "#2563eb", blobOpacity: 0.10, blobBlur: 120, enableGrainTexture: false, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#2563eb" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#2563eb" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#2563eb" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#2563eb" },
      },
    },
  },
  {
    id: "dia-das-maes",
    name: "Dia das Mães",
    emoji: "💐",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#ec4899", accentHover: "#db2777", accentFg: "#ffffff" },
      effects: { enableBlobs: true, blobColor: "#ec4899", blobOpacity: 0.10, blobBlur: 120, enableGrainTexture: false, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#ec4899" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#ec4899" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#ec4899" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#ec4899" },
      },
    },
  },
  {
    id: "carnaval",
    name: "Carnaval",
    emoji: "🎭",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#8b5cf6", accentHover: "#7c3aed", accentFg: "#ffffff" },
      effects: { enableBlobs: true, blobColor: "#eab308", blobOpacity: 0.12, blobBlur: 100, enableGrainTexture: false, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#eab308" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#22c55e" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#ef4444" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#3b82f6" },
      },
    },
  },
  {
    id: "ano-novo",
    name: "Ano Novo",
    emoji: "🎆",
    config: {
      colors: { ...DEFAULT_COLORS, accent: "#d4af37", accentHover: "#c9a655", accentFg: "#0f172a" },
      effects: { enableBlobs: true, blobColor: "#d4af37", blobOpacity: 0.15, blobBlur: 140, enableGrainTexture: true, headerBlur: true },
      cards: {
        ...DEFAULT_CARDS,
        backgroundColor: "",
        borderColor: "",
        implantes: { ...DEFAULT_CARDS.implantes, iconColor: "#d4af37" },
        componentes: { ...DEFAULT_CARDS.componentes, iconColor: "#d4af37" },
        kits: { ...DEFAULT_CARDS.kits, iconColor: "#d4af37" },
        promocionais: { ...DEFAULT_CARDS.promocionais, iconColor: "#d4af37" },
      },
    },
  },
]

export const AVAILABLE_ICONS = [
  "IconImplante", "IconComponente", "IconKit", "IconPromocao",
  "Crosshair", "ShieldCheck", "Box", "Tag",
  "Package", "Layers", "ShoppingBag", "Percent",
  "Star", "Heart", "Diamond", "Circle",
  "Hexagon", "Pentagon", "Triangle", "Square",
  "Zap", "Target", "Award", "Gem",
]

export const DEFAULT_CATALOGO_CONFIG: CatalogoDesignConfig = {
  colors: DEFAULT_COLORS,
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontFamilyMono: "'JetBrains Mono', monospace",
  },
  texts: {
    storeName: "ERP Odonto",
    storeTagline: "Novo Padrão Odontológico",
    heroTitle: "Performance & Precisão Absoluta",
    heroSubtitle: "Explore nossa linha completa de implantes Cone Morse, componentes protéticos e instrumentais cirúrgicos com padrão mundial.",
    footerText: "ERP Odonto",
  },
  visibility: {
    showPrices: true,
    showStock: false,
    showSearchBar: true,
    showCartIcon: true,
    showHeroSection: true,
    showCategoryCards: true,
    showWatermark: true,
    showFooter: true,
  },
  images: {
    logoUrl: "",
    faviconUrl: "",
    heroBackgroundUrl: "",
    heroBackgroundOpacity: 0.1,
    pageBackgroundUrl: "",
  },
  elementBackgrounds: {
    headerBg: "",
    cardBg: "",
    buttonBg: "",
    inputBg: "",
  },
  effects: {
    enableBlobs: true,
    blobColor: "#c9a655",
    blobOpacity: 0.10,
    blobBlur: 120,
    enableGrainTexture: false,
    headerBlur: true,
  },
  cards: DEFAULT_CARDS,
  footer: {
    text: "ERP Odonto",
    bgColor: "#0f172a",
    textColor: "#94a3b8",
    borderColor: "#1e293b",
    iconColor: "#94a3b8",
    iconBgColor: "transparent",
    iconBorderColor: "transparent",
    socialLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      whatsapp: "",
      youtube: "",
      tiktok: "",
      site: "",
      email: "",
      telefone: "",
      endereco: "",
    },
  },
}

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      // Deep merge para objetos como cards.implantes, cards.componentes, etc.
      if (target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = deepMerge(target[key] ?? {}, source[key])
      }
    } else if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      result[key] = source[key]
    }
  }
  return result
}

export function mergeWithDefaults(saved: Record<string, any> | null): CatalogoDesignConfig {
  if (!saved) return DEFAULT_CATALOGO_CONFIG
  return deepMerge(DEFAULT_CATALOGO_CONFIG as Record<string, any>, saved) as CatalogoDesignConfig
}

export function getTranslatedText(
  config: CatalogoDesignConfig,
  lang: string | null,
  key: "storeTagline" | "heroTitle" | "heroSubtitle",
): string {
  if (!lang || lang === "pt-BR" || !config.translations?.[lang]) return config.texts[key]
  return config.translations[lang][key] || config.texts[key]
}

export function getTranslatedCard(
  config: CatalogoDesignConfig,
  lang: string | null,
  cardKey: "implantes" | "componentes" | "kits" | "promocionais",
): { title: string; description: string } {
  const card = config.cards[cardKey]
  if (!lang || lang === "pt-BR" || !config.translations?.[lang]) {
    return { title: card.title, description: card.description }
  }
  const t = config.translations[lang].cards?.[cardKey]
  return { title: t?.title || card.title, description: t?.description || card.description }
}

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get"
const TRANSLATABLE_CARD_KEYS = ["implantes", "componentes", "kits", "promocionais"] as const

async function traduzirTexto(texto: string, targetLang: "en-US" | "es-ES"): Promise<string> {
  const textoTrim = texto.trim()
  if (!textoTrim) return ""
  try {
    const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(textoTrim)}&langpair=pt-BR|${targetLang}`
    const res = await fetch(url)
    if (!res.ok) return ""
    const data = await res.json()
    const traduzido = data?.responseData?.translatedText
    if (!traduzido || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(traduzido)) return ""
    return traduzido
  } catch {
    return ""
  }
}

/** Traduz os textos do hero/cards via MyMemory (API pública, gratuita, sem chave). Campos que falharem voltam vazios — quem consome já cai no fallback PT-BR. */
export async function traduzirTextosDesign(
  config: CatalogoDesignConfig,
  targetLang: "en-US" | "es-ES",
): Promise<CatalogoDesignTranslationTexts> {
  const [storeTagline, heroTitle, heroSubtitle, ...cardTextos] = await Promise.all([
    traduzirTexto(config.texts.storeTagline, targetLang),
    traduzirTexto(config.texts.heroTitle, targetLang),
    traduzirTexto(config.texts.heroSubtitle, targetLang),
    ...TRANSLATABLE_CARD_KEYS.flatMap((key) => [
      traduzirTexto(config.cards[key].title, targetLang),
      traduzirTexto(config.cards[key].description, targetLang),
    ]),
  ])

  const cards = {} as CatalogoDesignTranslationTexts["cards"]
  TRANSLATABLE_CARD_KEYS.forEach((key, i) => {
    cards[key] = { title: cardTextos[i * 2], description: cardTextos[i * 2 + 1] }
  })

  return { storeTagline, heroTitle, heroSubtitle, cards }
}

export async function getCatalogoDesign(): Promise<CatalogoDesignConfig> {
  try {
    const { data, error } = await supabase
      .from("catalogo_design_config")
      .select("config")
      .limit(1)
      .maybeSingle()

    if (error || !data?.config) return DEFAULT_CATALOGO_CONFIG

    const config = data.config as Record<string, any>

    // Lidar com config corrompido (char-by-char storage bug antigo)
    if (config && typeof config === "object" && !Array.isArray(config) && config["0"] === "{") {
      try {
        const reconstructed = Object.values(config).join("")
        const parsed = JSON.parse(reconstructed)
        return mergeWithDefaults(parsed)
      } catch {
        return DEFAULT_CATALOGO_CONFIG
      }
    }

    return mergeWithDefaults(config)
  } catch {
    return DEFAULT_CATALOGO_CONFIG
  }
}

export async function saveCatalogoDesign(config: CatalogoDesignConfig): Promise<void> {
  // Deletar todos os rows existentes antes de inserir (single-tenant sem PK)
  const { error: delError } = await supabase
    .from("catalogo_design_config")
    .delete()
    .neq("updated_at", "1900-01-01")

  if (delError) throw delError

  // Inserir novo row
  const { error } = await supabase
    .from("catalogo_design_config")
    .insert({
      config: config as unknown as Record<string, any>,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
}
