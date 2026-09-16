import { X, Search, Home, ShoppingBag, Box, Layers, Package, Percent } from "lucide-react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useUIState, toggleNavDrawer, toggleCartDrawer } from "../services/ui.service"
import { useTranslation } from "react-i18next"

export function NavDrawer() {
  const { navDrawerOpen } = useUIState()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const { t } = useTranslation()

  const CATEGORY_LINKS = [
    { to: "/catalogo/implantes", label: t("catalogo.categories.implants"), icon: Box },
    { to: "/catalogo/componentes", label: t("catalogo.categories.components"), icon: Layers },
    { to: "/catalogo/kits", label: t("catalogo.categories.kits"), icon: Package },
    { to: "/catalogo/promocionais", label: t("catalogo.categories.promotions"), icon: Percent },
  ] as const

  if (!navDrawerOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toggleNavDrawer(false)
    navigate({ to: "/catalogo/busca", search: { q: query } })
  }

  function closeAndNavigate() {
    toggleNavDrawer(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm transition-opacity"
        onClick={() => toggleNavDrawer(false)}
      />

      <div className="relative w-full max-w-xs h-full bg-[#0f172a] border-r border-[var(--color-border-subtle)] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
          <h2 className="font-bold text-lg text-white">{t("catalogo.nav.navigation")}</h2>
          <button onClick={() => toggleNavDrawer(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <input
              type="text"
              placeholder={t("catalogo.search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-full bg-[var(--color-surface)]/50 border border-[var(--color-input-border)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-all text-white placeholder-[var(--color-text-muted)]"
            />
          </form>

          <nav className="space-y-1">
            <Link
              to="/catalogo"
              onClick={closeAndNavigate}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-colors no-underline"
            >
              <Home className="w-4 h-4 text-[var(--color-accent)]" />
              {t("catalogo.nav.home")}
            </Link>
            {CATEGORY_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={closeAndNavigate}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-colors no-underline"
              >
                <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={() => { toggleNavDrawer(false); toggleCartDrawer(true) }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all hover:scale-[1.02] border border-[var(--color-accent)]/40 text-[var(--color-accent)]"
          >
            <ShoppingBag className="w-4 h-4" />
            {t("catalogo.nav.viewBag")}
          </button>
        </div>
      </div>
    </div>
  )
}
