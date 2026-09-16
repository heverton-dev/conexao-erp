import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, ChevronRight, BookOpen, Map } from 'lucide-react';
import '../styles/theme.css';
import { WalkthroughDialog } from '~/core/onboarding/WalkthroughDialog';
import { useWalkthrough } from '~/core/onboarding/useWalkthrough';
import { CATALOGO_ONBOARDING_STEPS, CATALOGO_ONBOARDING_ROUTES } from '~/features/catalogo/onboarding';
import { ROUTE_ONBOARDING_STEPS } from '~/core/onboarding/route-steps';
import type { WalkthroughStep } from '~/core/onboarding/WalkthroughDialog';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeWalkthrough, setActiveWalkthrough] = useState<{ steps: WalkthroughStep[]; title: string; key: string } | null>(null)
  const { open: moduleOpen, setOpen: setModuleOpen, dismiss: moduleDismiss } = useWalkthrough("catalogo")
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function openModuleWalkthrough() {
    setMenuOpen(false)
    setActiveWalkthrough({ steps: CATALOGO_ONBOARDING_STEPS, title: "Tour: Módulo Catálogo", key: "catalogo" })
    setModuleOpen(true)
  }

  function openRouteWalkthrough(routeKey: string, label: string) {
    setMenuOpen(false)
    const steps = ROUTE_ONBOARDING_STEPS[routeKey] || CATALOGO_ONBOARDING_ROUTES.find((r) => r.key === routeKey)?.steps
    if (!steps) return
    localStorage.removeItem("walkthrough_dismissed_" + routeKey)
    setActiveWalkthrough({ steps, title: `Tour: ${label}`, key: routeKey })
  }

  const allRoutes = CATALOGO_ONBOARDING_ROUTES.map((r) => ({ ...r, source: "catalogo" as const }))

  return (
    <div className="catalogo-theme min-h-screen flex flex-col relative">
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

      <div className="fixed bottom-6 right-6 z-50" ref={menuRef}>
        {menuOpen && (
          <div className="mb-3 bg-[#0f172a] border border-[var(--color-border-subtle)] rounded-xl shadow-2xl overflow-hidden w-64">
            <div className="p-3 border-b border-[var(--color-border-subtle)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a655]">Tour guiado</p>
            </div>
            <button
              onClick={openModuleWalkthrough}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-[#c9a655] shrink-0" />
              <span className="text-sm text-white">Módulo Catálogo</span>
              <ChevronRight className="h-3 w-3 text-gray-500 ml-auto" />
            </button>
            {allRoutes.map((r) => (
              <button
                key={r.key}
                onClick={() => openRouteWalkthrough(r.key, r.label)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
              >
                <Map className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-300">{r.label}</span>
                <ChevronRight className="h-3 w-3 text-gray-500 ml-auto" />
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-all flex items-center justify-center ${menuOpen ? "bg-white text-[#0f172a]" : "bg-[#c9a655] text-[#0f172a]"}`}
          title="Ajuda - Tour guiado"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {activeWalkthrough && (
        <WalkthroughDialog
          open={activeWalkthrough.key === "catalogo" ? moduleOpen : !!activeWalkthrough}
          onOpenChange={(o) => {
            if (!o) setActiveWalkthrough(null)
          }}
          steps={activeWalkthrough.steps}
          title={activeWalkthrough.title}
          onDismiss={() => {
            localStorage.setItem("walkthrough_dismissed_" + activeWalkthrough.key, "true")
            setActiveWalkthrough(null)
          }}
        />
      )}
    </div>
  );
}
