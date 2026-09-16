import { createRoute, Link, useNavigate, useSearch } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { useMemo, useState } from "react"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { ProductCard } from "~/features/catalogo/components/ProductCard"
import { useImplantesAtivos, useAbutments, useKitsAtivos, usePromocionaisAtivos } from "~/features/catalogo/hooks/useCatalogo"
import { Search, ArrowLeft, PackageOpen } from "lucide-react"
import { useTranslation } from "react-i18next"

export const catalogoBuscaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/busca",
  component: CatalogoBuscaPage,
})

interface ResultadoBusca {
  key: string
  tipo: "implante" | "abutment" | "kit" | "promocional"
  sku: string
  nome: string
  cor: string
  linkParams: { tipo: string; sku: string }
}

function normaliza(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

function CatalogoBuscaPage() {
  const search = useSearch({ strict: false }) as { q?: string }
  const navigate = useNavigate()
  const [query, setQuery] = useState(search.q ?? "")
  const { t } = useTranslation()

  const { data: implantes, isLoading: loadingImplantes } = useImplantesAtivos()
  const { data: abutments, isLoading: loadingAbutments } = useAbutments()
  const { data: kits, isLoading: loadingKits } = useKitsAtivos()
  const { data: promocionais, isLoading: loadingPromocionais } = usePromocionaisAtivos()

  const isLoading = loadingImplantes || loadingAbutments || loadingKits || loadingPromocionais

  const resultados = useMemo<ResultadoBusca[]>(() => {
    const q = normaliza(search.q ?? "")
    if (!q) return []

    const all: ResultadoBusca[] = [
      ...(implantes ?? []).map((i) => ({
        key: `implante-${i.sku}`,
        tipo: "implante" as const,
        sku: i.sku,
        nome: `${i.nome} — ${i.diametro_mm}×${i.comprimento_mm} mm`,
        cor: "#c9a655",
        linkParams: { tipo: "implante", sku: i.sku },
      })),
      ...(abutments ?? []).map((a) => ({
        key: `abutment-${a.sku}`,
        tipo: "abutment" as const,
        sku: a.sku,
        nome: a.nome,
        cor: "#c9a655",
        linkParams: { tipo: "abutment", sku: a.sku },
      })),
      ...(kits ?? []).map((k) => ({
        key: `kit-${k.sku}`,
        tipo: "kit" as const,
        sku: k.sku,
        nome: k.nome,
        cor: "#c9a655",
        linkParams: { tipo: "kit", sku: k.sku },
      })),
      ...(promocionais ?? []).map((p) => ({
        key: `promocional-${p.id}`,
        tipo: "promocional" as const,
        sku: p.id,
        nome: p.nome,
        cor: "#c9a655",
        linkParams: { tipo: "promocional", sku: p.id },
      })),
    ]

    return all.filter((r) => normaliza(r.nome).includes(q) || normaliza(r.sku).includes(q))
  }, [search.q, implantes, abutments, kits, promocionais])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate({ to: "/catalogo/busca", search: { q: query } })
  }

  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          <Link
            to="/catalogo"
            className="group shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all mt-1 sm:mt-0 no-underline"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter text-balance">{t("catalogo.search.placeholder").split(",")[0]}</h1>
            <p className="text-sm sm:text-lg mt-1 sm:mt-2 text-[var(--color-text-muted)] text-balance">
              {search.q ? `Resultados para "${search.q}"` : t("catalogo.search.placeholder")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
          <input
            type="text"
            autoFocus
            placeholder={t("catalogo.search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-12 pr-4 rounded-full bg-[var(--color-surface)]/50 border border-[var(--color-input-border)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-all text-white placeholder-[var(--color-text-muted)]"
          />
        </form>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border-subtle)] animate-pulse" />
            ))}
          </div>
        ) : !search.q ? null : resultados.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 backdrop-blur-md">
            <PackageOpen className="h-14 w-14 mx-auto mb-6 opacity-20 text-white" />
            <p className="text-xl font-black text-white tracking-tight">{t("catalogo.search.noResults")}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm mx-auto">Tente buscar por outro SKU, nome ou dimensão.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {resultados.map((r) => (
              <Link key={r.key} to="/catalogo/produto/$tipo/$sku" params={r.linkParams} className="no-underline">
                <ProductCard tipo={r.tipo} sku={r.sku} nome={r.nome} corIdentificacao={r.cor} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  )
}
