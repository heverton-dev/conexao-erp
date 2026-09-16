import { createRoute, Link } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { usePromocionaisAtivos } from "~/features/catalogo/hooks/useCatalogo"
import { formatBRL } from "~/features/catalogo/services/carrinho.service"
import { listarImagensBatch } from "~/features/catalogo/services/imagens.service"
import { Tag, Clock, ArrowLeft, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import type { CatalogoImagemProduto } from "~/features/catalogo/types"
import { useTranslation } from "react-i18next"

export const catalogoPromocionaisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/promocionais",
  component: CatalogoPromocionaisPage,
})

function CatalogoPromocionaisPage() {
  const { data: promos, isLoading } = usePromocionaisAtivos()
  const [imagensMap, setImagensMap] = useState<Map<string, CatalogoImagemProduto[]>>(new Map())
  const { t } = useTranslation()

  useEffect(() => {
    if (!promos || promos.length === 0) return
    const ids = promos.map((p) => p.id)
    listarImagensBatch("promocional", ids).then(setImagensMap).catch(() => {})
  }, [promos])

  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 sm:space-y-12 w-full">
        {/* Header */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Link to="/catalogo" className="group shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all mt-1 sm:mt-0">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter text-balance">Promocionais</h1>
            <p className="text-sm sm:text-lg mt-1 sm:mt-2 text-[var(--color-text-muted)] text-balance">Pacotes fechados com preços especiais.</p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border-subtle)] overflow-hidden animate-pulse">
                <div className="h-32 bg-[var(--color-surface-hover)]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 rounded bg-[var(--color-surface-hover)]" />
                  <div className="h-5 w-40 rounded bg-[var(--color-surface-hover)]" />
                  <div className="h-4 w-full rounded bg-[var(--color-surface-hover)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(promos ?? []).map((promo) => {
            const imagemUrl = imagensMap.get(promo.id)?.[0]?.url_imagem
            const semEstoque = promo.qtd_disponivel <= 0
            return (
            <Link
              key={promo.id}
              to="/catalogo/produto/$tipo/$sku"
              params={{ tipo: "promocional", sku: promo.id }}
              className="group rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/50 overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)]/40 hover:shadow-[0_8px_30px_rgba(201,166,85,0.08)]"
            >
              {/* Imagem — 30% */}
              <div className="relative h-32 bg-gradient-to-br from-[var(--color-surface)] to-[#0f172a] overflow-hidden">
                {imagemUrl ? (
                  <img
                    src={imagemUrl}
                    alt={promo.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-25 mix-blend-screen transition-opacity duration-500" style={{ background: "radial-gradient(circle at 30% 30%, #c9a655 0%, transparent 60%)" }} />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 opacity-10 group-hover:opacity-20 transition-opacity" style={{ color: "#c9a655" }} />
                  </>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0f172a]/60 backdrop-blur-md border border-[var(--color-border-subtle)]">
                  <Tag className="h-3 w-3 text-[var(--color-accent)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">Pacote</span>
                </div>
                {semEstoque && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a]/70 backdrop-blur-sm">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/30 bg-red-500/20 text-red-400">
                      <Tag className="h-3 w-3" /> Sem Estoque
                    </span>
                  </div>
                )}
              </div>

              {/* Info — 70% */}
              <div className="p-5 flex flex-col justify-between min-h-[180px] group-hover:bg-[var(--color-surface)]/30 transition-colors">
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight mb-2 group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                    {promo.nome}
                  </h3>
                  {promo.descricao && (
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{promo.descricao}</p>
                  )}
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-[var(--color-border-subtle)] mt-4">
                  <span className="text-xl font-black text-gradient-gold">{formatBRL(promo.preco)}</span>
                  {promo.expira_em && (
                    <span className="text-xs flex items-center gap-1 text-[var(--color-text-muted)]">
                      <Clock className="h-3 w-3" />
                      {new Date(promo.expira_em).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            )
          })}

          {promos?.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30">
              <Tag className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" />
              <p className="text-lg text-[var(--color-text-muted)] font-semibold">{t("catalogo.categories.noImplants")}</p>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  )
}
