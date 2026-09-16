import { createRoute, useNavigate, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { DrillDown } from "~/features/catalogo/components/DrillDown"
import { ProductCard } from "~/features/catalogo/components/ProductCard"
import { useFamilias, useTiposReabilitacao, useTiposAbutment, useAbutments } from "~/features/catalogo/hooks/useCatalogo"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { listarImagensBatch } from "~/features/catalogo/services/imagens.service"
import { useMemo, useEffect, useState } from "react"
import { ArrowLeft, PackageOpen } from "lucide-react"
import { cn } from "~/lib/utils"
import type { CatalogoImagemProduto } from "~/features/catalogo/types"
import { useTranslation } from "react-i18next"

// Etapa 1: /catalogo/componentes — Escolher Família
export const catalogoComponentesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/componentes",
  component: CatalogoComponentesPage,
})

// Etapa 2: /catalogo/componentes/$familiaId — Escolher Tipo Reabilitação
export const catalogoComponentesFamiliaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/componentes/$familiaId",
  component: CatalogoComponentesPage,
})

// Etapa 3: /catalogo/componentes/$familiaId/$tipoReabId — Escolher Tipo Abutment
export const catalogoComponentesTipoReabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/componentes/$familiaId/$tipoReabId",
  component: CatalogoComponentesPage,
})

// Etapa 4: /catalogo/componentes/$familiaId/$tipoReabId/$tipoAbutmentId — Lista de Abutments
export const catalogoComponentesTipoAbutmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/componentes/$familiaId/$tipoReabId/$tipoAbutmentId",
  component: CatalogoComponentesPage,
})

function CatalogoComponentesPage() {
  const { data: familias, isLoading: loadingFamilias } = useFamilias()
  const { data: todosAbutments } = useAbutments()
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as Record<string, string | undefined>
  const familiaId = params.familiaId ?? null
  const tipoReabId = params.tipoReabId ?? null
  const tipoAbutmentId = params.tipoAbutmentId ?? null
  const { t } = useTranslation()

  // Contagem por família
  const countByFamilia = useMemo(() => {
    const m: Record<string, number> = {}
    for (const a of todosAbutments ?? []) {
      if (a.familia_id) m[a.familia_id] = (m[a.familia_id] ?? 0) + 1
    }
    return m
  }, [todosAbutments])

  // Contagem por tipo de reabilitação (filtrada por família selecionada)
  const countByTipoReab = useMemo(() => {
    const m: Record<string, number> = {}
    for (const a of todosAbutments ?? []) {
      if (a.tipo_reabilitacao_id && (!familiaId || a.familia_id === familiaId)) {
        m[a.tipo_reabilitacao_id] = (m[a.tipo_reabilitacao_id] ?? 0) + 1
      }
    }
    return m
  }, [todosAbutments, familiaId])

  // Contagem por tipo de abutment (filtrada por família e tipo de reabilitação)
  const countByTipoAbutment = useMemo(() => {
    const m: Record<string, number> = {}
    for (const a of todosAbutments ?? []) {
      if (a.tipo_abutment_id && (!familiaId || a.familia_id === familiaId) && (!tipoReabId || a.tipo_reabilitacao_id === tipoReabId)) {
        m[a.tipo_abutment_id] = (m[a.tipo_abutment_id] ?? 0) + 1
      }
    }
    return m
  }, [todosAbutments, familiaId, tipoReabId])

  // Etapa 4: Lista de abutments
  if (familiaId && tipoReabId && tipoAbutmentId) return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <AbutmentList
          familiaId={familiaId}
          tipoAbutmentId={tipoAbutmentId}
          tipoReabId={tipoReabId}
          onBack={() => navigate({ to: '/catalogo/componentes/$familiaId/$tipoReabId', params: { familiaId, tipoReabId } })}
        />
      </div>
    </StoreLayout>
  )

  // Etapa 3: Escolher Tipo Abutment
  if (familiaId && tipoReabId) return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <TiposAbutmentList
          familiaId={familiaId}
          tipoReabId={tipoReabId}
          onSelect={(id) => navigate({ to: '/catalogo/componentes/$familiaId/$tipoReabId/$tipoAbutmentId', params: { familiaId, tipoReabId, tipoAbutmentId: id } })}
          onBack={() => navigate({ to: '/catalogo/componentes/$familiaId', params: { familiaId } })}
          countByTipoAbutment={countByTipoAbutment}
        />
      </div>
    </StoreLayout>
  )

  // Etapa 2: Escolher Tipo Reabilitação
  if (familiaId) return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <TiposReabList
          familiaId={familiaId}
          onSelect={(id) => navigate({ to: '/catalogo/componentes/$familiaId/$tipoReabId', params: { familiaId, tipoReabId: id } })}
          onBack={() => navigate({ to: '/catalogo/componentes' })}
          countByTipoReab={countByTipoReab}
        />
      </div>
    </StoreLayout>
  )

  // Etapa 1: Escolher Família
  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <DrillDown
          title={t("catalogo.categories.components")}
          subtitle={t("catalogo.categories.familySubtitle")}
          step={1}
          totalSteps={4}
          options={(familias ?? [])
            .filter((f) => (countByFamilia[f.id] ?? 0) > 0)
            .map((f) => ({
              id: f.id,
              label: f.nome,
              sublabel: f.conexao?.nome,
              color: f.cor_identificacao,
              count: countByFamilia[f.id] ?? 0,
            }))}
          onSelect={(id) => navigate({ to: '/catalogo/componentes/$familiaId', params: { familiaId: id } })}
          onBack={() => navigate({ to: '/catalogo' })}
          isLoading={loadingFamilias}
        />
      </div>
    </StoreLayout>
  )
}

function TiposReabList({ familiaId, onSelect, onBack, countByTipoReab }: { familiaId: string; onSelect: (id: string) => void; onBack: () => void; countByTipoReab: Record<string, number> }) {
  const { data: tiposReab, isLoading } = useTiposReabilitacao()
  const { data: familias } = useFamilias()
  const familia = (familias ?? []).find((f) => f.id === familiaId)
  const corFamilia = familia?.cor_identificacao

  const options = (tiposReab ?? [])
    .filter((t) => (countByTipoReab[t.id] ?? 0) > 0)
    .map((t) => ({
      id: t.id,
      label: t.nome,
      color: corFamilia,
      count: countByTipoReab[t.id] ?? 0,
    }))

  return (
    <DrillDown
      title="Reabilitação"
      subtitle="unitária, múltipla ou híbrida"
      step={2}
      totalSteps={4}
      options={options}
      onSelect={onSelect}
      onBack={onBack}
      isLoading={isLoading}
    />
  )
}

function TiposAbutmentList({ familiaId, tipoReabId, onSelect, onBack, countByTipoAbutment }: { familiaId: string; tipoReabId: string; onSelect: (id: string) => void; onBack: () => void; countByTipoAbutment: Record<string, number> }) {
  const { data: tipos, isLoading } = useTiposAbutment()
  const { data: familias } = useFamilias()
  const familia = (familias ?? []).find((f) => f.id === familiaId)
  const corFamilia = familia?.cor_identificacao

  const options = (tipos ?? [])
    .filter((t) => (countByTipoAbutment[t.id] ?? 0) > 0)
    .map((t) => ({
      id: t.id,
      label: t.nome,
      sublabel: t.sigla ?? undefined,
      color: corFamilia,
      count: countByTipoAbutment[t.id] ?? 0,
    }))

  return (
    <DrillDown
      title="Tipos de Abutment"
      subtitle="modelo/família do pilar"
      step={3}
      totalSteps={4}
      options={options}
      onSelect={onSelect}
      onBack={onBack}
      isLoading={isLoading}
    />
  )
}

function AbutmentList({ familiaId, tipoAbutmentId, tipoReabId, onBack }: { familiaId: string; tipoAbutmentId: string; tipoReabId: string; onBack: () => void }) {
  const { data: abutments, isLoading } = useAbutments(familiaId)
  const { data: tiposAbutment } = useTiposAbutment()
  const tipoAbutment = (tiposAbutment ?? []).find((t) => t.id === tipoAbutmentId)
  const filtered = (abutments ?? []).filter((a) => a.tipo_abutment_id === tipoAbutmentId && a.tipo_reabilitacao_id === tipoReabId)
  const empresaId = useCatalogoEmpresaId()
  const [imagensMap, setImagensMap] = useState<Map<string, CatalogoImagemProduto[]>>(new Map())
  const navigate = useNavigate()

  // Buscar imagens dos abutments
  useEffect(() => {
    if (filtered.length === 0) return
    const skus = filtered.map((a) => a.sku)
    listarImagensBatch("abutment", skus).then(setImagensMap).catch(() => {})
  }, [filtered, empresaId])

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
              {[0,1,2,3].map((i) => (
                <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i < 4 ? "w-8 bg-[var(--color-accent)]" : "w-2 bg-[var(--color-border-subtle)]")} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] ml-2">Etapa 4 de 4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter text-balance">Selecione o Abutment</h1>
          <p className="text-sm sm:text-lg mt-1 sm:mt-2 text-[var(--color-text-muted)] text-balance">{filtered.length} componente(s) encontrado(s).</p>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-4">
        {filtered.length} resultado(s)
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 backdrop-blur-md">
          <PackageOpen className="h-14 w-14 mx-auto mb-6 opacity-20 text-white" />
          <p className="text-xl font-black text-white tracking-tight">Nenhum componente encontrado</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm mx-auto">Este tipo de abutment não possui itens cadastrados. Volte e selecione outra opção.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <ProductCard
            key={a.sku}
            tipo="abutment"
            sku={a.sku}
            nome={`${a.tipo_abutment?.nome ?? ""} ${a.familia?.nome ?? ""}`}
            badge={tipoAbutment?.nome}
            corIdentificacao={a.familia?.cor_identificacao || ''}
            imageUrl={imagensMap.get(a.sku)?.[0]?.url_imagem}
            onClick={() => navigate({ to: '/catalogo/produto/$tipo/$sku', params: { tipo: 'abutment', sku: a.sku }, search: { familia: familiaId, tipoAbutment: tipoAbutmentId, tipoReab: tipoReabId } })}
            qtdDisponivel={a.qtd_disponivel}
            qtdMinimaAviso={a.qtd_minima_aviso}
          />
        ))}
      </div>
      )}
    </div>
  )
}
