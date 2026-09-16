import { createRoute, Link, useNavigate, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { DrillDown } from "~/features/catalogo/components/DrillDown"
import { ProductCard } from "~/features/catalogo/components/ProductCard"
import { useTiposKit, useKitsAtivos } from "~/features/catalogo/hooks/useCatalogo"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { listarImagensBatch } from "~/features/catalogo/services/imagens.service"
import { useMemo, useEffect, useState } from "react"
import { ShoppingBag, PackageOpen, ArrowLeft } from "lucide-react"
import { cn } from "~/lib/utils"
import type { CatalogoImagemProduto } from "~/features/catalogo/types"
import { useTranslation } from "react-i18next"

// Etapa 1: /catalogo/kits — Escolher Tipo de Kit
export const catalogoKitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/kits",
  component: CatalogoKitsPage,
})

// Etapa 2: /catalogo/kits/$tipoKitId — Lista de Kits
export const catalogoKitsTipoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/kits/$tipoKitId",
  component: CatalogoKitsPage,
})

function CatalogoKitsPage() {
  const { data: tiposKit, isLoading: loadingTipos } = useTiposKit()
  const { data: todosKits } = useKitsAtivos()
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as Record<string, string | undefined>
  const tipoKitId = params.tipoKitId ?? null
  const { t } = useTranslation()

  // Contagem de kits por tipo
  const countByTipo = useMemo(() => {
    const m: Record<string, number> = {}
    for (const k of todosKits ?? []) {
      if (k.tipo_kit_id) m[k.tipo_kit_id] = (m[k.tipo_kit_id] ?? 0) + 1
    }
    return m
  }, [todosKits])

  // Etapa 2: Lista de Kits
  if (tipoKitId) return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <KitsList
          tipoKitId={tipoKitId}
          onBack={() => navigate({ to: '/catalogo/kits' })}
        />
      </div>
    </StoreLayout>
  )

  // Etapa 1: Escolher Tipo de Kit
  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <DrillDown
          title="Tipos de Kits"
          subtitle="tipo de kit"
          step={1}
          totalSteps={2}
          options={(tiposKit ?? [])
            .filter((t) => t.ativo && (countByTipo[t.id] ?? 0) > 0)
            .map((t) => ({
              id: t.id,
              label: t.nome,
              sublabel: t.sigla ?? undefined,
              count: countByTipo[t.id] ?? 0,
            }))}
          onSelect={(id) => navigate({ to: '/catalogo/kits/$tipoKitId', params: { tipoKitId: id } })}
          onBack={() => navigate({ to: '/catalogo' })}
          isLoading={loadingTipos}
        />
      </div>
    </StoreLayout>
  )
}

function KitsList({ tipoKitId, onBack }: { tipoKitId: string; onBack: () => void }) {
  const { data: todosKits, isLoading } = useKitsAtivos()
  const { data: tiposKit } = useTiposKit()
  const tipoKit = (tiposKit ?? []).find((t) => t.id === tipoKitId)
  const empresaId = useCatalogoEmpresaId()
  const { t } = useTranslation()
  const [imagensMap, setImagensMap] = useState<Map<string, CatalogoImagemProduto[]>>(new Map())

  const kits = useMemo(() => {
    return (todosKits ?? []).filter((k) => k.tipo_kit_id === tipoKitId)
  }, [todosKits, tipoKitId])

  // Buscar imagens dos kits
  useEffect(() => {
    if (!kits || kits.length === 0) return
    const skus = kits.map((k) => k.sku)
    listarImagensBatch("kit", skus).then(setImagensMap).catch(() => {})
  }, [kits, empresaId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 rounded-full bg-[var(--color-surface)]/50 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border-subtle)] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Premium igual ao DrillDown */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-6">
        <button
          onClick={onBack}
          className="group shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all mt-1 sm:mt-0"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
        </button>
        <div>
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[0,1].map((i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i < 2 ? "w-8 bg-[var(--color-accent)]" : "w-2 bg-[var(--color-border-subtle)]")} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] ml-2">{t("catalogo.step", { current: 2, total: 2 })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter text-balance">Selecione o Kit</h1>
          <p className="text-sm sm:text-lg mt-1 sm:mt-2 text-[var(--color-text-muted)] text-balance">{kits.length} {t("catalogo.categories.productsFound")}</p>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-4">
        {kits.length} {t("catalogo.categories.results")}
      </p>

      {kits.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 backdrop-blur-md">
          <PackageOpen className="h-14 w-14 mx-auto mb-6 opacity-20 text-white" />
          <p className="text-xl font-black text-white tracking-tight">{t("catalogo.categories.noImplants")}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm mx-auto">Este tipo não possui kits cadastrados. Volte e selecione outro tipo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {kits.map((kit) => (
            <Link
              key={kit.sku}
              to="/catalogo/produto/$tipo/$sku"
              params={{ tipo: "kit", sku: kit.sku }}
              className="no-underline"
            >
              <ProductCard
                tipo="kit"
                sku={kit.sku}
                nome={kit.nome}
                badge={tipoKit?.nome}
                corIdentificacao="#c9a655"
                imageUrl={imagensMap.get(kit.sku)?.[0]?.url_imagem}
                qtdDisponivel={kit.qtd_disponivel}
                qtdMinimaAviso={kit.qtd_minima_aviso}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
