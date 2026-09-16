import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  FileText, Ruler, Zap, Key, Package, Heart, Link,
  Eye, ShoppingCart, Box, Star, Tag, Layers, Settings,
  Users, Activity, Clock, Calendar, Search, Filter,
  Download, Upload, Share2, Printer, Archive, Bookmark,
  type LucideIcon,
} from "lucide-react"
import {
  IconFicha, IconProtocolo, IconChave, IconKit, IconCicatrizador, IconAbutment,
} from "~/features/catalogo/components/icons/CatalogoIcons"

// ── Tipos ────────────────────────────────────────────────────
type IconComponent = React.ComponentType<{ className?: string }>

// ── Ícones customizados odontológicos (defaults) ─────────────
const DENTAL_ICONS: Record<string, IconComponent> = {
  ficha: IconFicha,
  protocolos: IconProtocolo,
  chaves: IconChave,
  kits: IconKit,
  cicatrizadores: IconCicatrizador,
  abutments: IconAbutment,
  parafusos: Settings,
  sequencia: Layers,
}

// ── Icon registry (Lucide — para customização admin) ─────────
const LUCIDE_REGISTRY: Record<string, LucideIcon> = {
  FileText, Ruler, Zap, Key, Package, Heart, Link,
  Eye, ShoppingCart, Box, Star, Tag, Layers, Settings,
  Users, Activity, Clock, Calendar, Search, Filter,
  Download, Upload, Share2, Printer, Archive, Bookmark,
}

export type TabIconKey = keyof typeof LUCIDE_REGISTRY

// "dental:<chave>" para ícones customizados odontológicos, ou uma chave Lucide direta
type IconRef = `dental:${string}` | TabIconKey

// ── Default tab icons ────────────────────────────────────────
// "dental:" prefix = custom icon; bare key = Lucide
const DEFAULT_TAB_ICONS: Record<string, IconRef> = {
  ficha: "dental:ficha",
  protocolos: "dental:protocolos",
  chaves: "dental:chaves",
  kits: "dental:kits",
  cicatrizadores: "dental:cicatrizadores",
  abutments: "dental:abutments",
  parafusos: "dental:parafusos",
  sequencia: "dental:sequencia",
  compatibilidade: "Link",
}

// ── Context ──────────────────────────────────────────────────
interface TabIconsContextValue {
  getIcon: (tabKey: string) => IconComponent
  setIcon: (tabKey: string, iconKey: TabIconKey) => void
  resetIcons: () => void
  availableIcons: Array<{ key: string; icon: IconComponent }>
}

const TabIconsContext = createContext<TabIconsContextValue | null>(null)

const STORAGE_KEY = "catalogo_tab_icons"

function loadPersistedIcons(): Record<string, IconRef> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_TAB_ICONS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_TAB_ICONS }
}

function persistIcons(icons: Record<string, IconRef>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(icons))
  } catch {}
}

function resolveIcon(ref: IconRef): IconComponent {
  if (ref.startsWith("dental:")) return DENTAL_ICONS[ref.slice(7)] ?? Box
  return LUCIDE_REGISTRY[ref] ?? Box
}

export function TabIconsProvider({ children }: { children: ReactNode }) {
  const [icons, setIcons] = useState<Record<string, IconRef>>(loadPersistedIcons)

  const getIcon = useCallback(
    (tabKey: string): IconComponent => {
      const ref = icons[tabKey] ?? DEFAULT_TAB_ICONS[tabKey] ?? "Box"
      return resolveIcon(ref)
    },
    [icons],
  )

  const setIcon = useCallback((tabKey: string, iconKey: TabIconKey) => {
    setIcons((prev) => {
      const next = { ...prev, [tabKey]: iconKey }
      persistIcons(next)
      return next
    })
  }, [])

  const resetIcons = useCallback(() => {
    setIcons({ ...DEFAULT_TAB_ICONS })
    persistIcons(DEFAULT_TAB_ICONS)
  }, [])

  const availableIcons = [
    ...Object.entries(DENTAL_ICONS).map(([key, icon]) => ({ key: `dental:${key}`, icon })),
    ...Object.entries(LUCIDE_REGISTRY).map(([key, icon]) => ({ key, icon })),
  ]

  return (
    <TabIconsContext.Provider value={{ getIcon, setIcon, resetIcons, availableIcons }}>
      {children}
    </TabIconsContext.Provider>
  )
}

export function useTabIcons() {
  const ctx = useContext(TabIconsContext)
  if (!ctx) throw new Error("useTabIcons must be used within TabIconsProvider")
  return ctx
}
