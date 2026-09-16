import { createRoute, Link, useNavigate, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { DrillDown } from "~/features/catalogo/components/DrillDown"
import { ProductCard } from "~/features/catalogo/components/ProductCard"
import { useConexoes, useFamilias, useLinhas, useImplantesPorLinha, useImplantesAtivos } from "~/features/catalogo/hooks/useCatalogo"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { listarImagensBatch } from "~/features/catalogo/services/imagens.service"
import { useMemo, useEffect, useState } from "react"
import { ArrowLeft, PackageOpen } from "lucide-react"
import { cn } from "~/lib/utils"
import type { CatalogoImagemProduto } from "~/features/catalogo/types"
import { useTranslation } from "react-i18next"

// Etapa 1: /catalogo/implantes — Escolher Conexão
export const catalogoImplantesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/implantes",
  component: CatalogoImplantesPage,
})

// Etapa 2: /catalogo/implantes/$conexaoId — Escolher Família
export const catalogoImplantesConexaoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/implantes/$conexaoId",
  component: CatalogoImplantesPage,
})

// Etapa 3: /catalogo/implantes/$conexaoId/$familiaId — Escolher Linha
export const catalogoImplantesFamiliaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/implantes/$conexaoId/$familiaId",
  component: CatalogoImplantesPage,
})

// Etapa 4: /catalogo/implantes/$conexaoId/$familiaId/$linhaId — Lista de Implantes
export const catalogoImplantesLinhaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/implantes/$conexaoId/$familiaId/$linhaId",
  component: CatalogoImplantesPage,
})

function CatalogoImplantesPage() {
  const { data: conexoes, isLoading: loadingConexoes } = useConexoes()
  const { data: todasFamilias } = useFamilias()
  const { data: todasLinhas } = useLinhas()
  const { data: todosImplantes } = useImplantesAtivos()
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as Record<string, string | undefined>
  const conexaoId = params.conexaoId ?? null
  const familiaId = params.familiaId ?? null
  const linhaId = params.linhaId ?? null
  const { t } = useTranslation()

  // Contagem de implantes por linha
  const countByLinha = useMemo(() => {
    const m: Record<string, number> = {}
    for (const i of todosImplantes ?? []) {
      if (i.linha_id) m[i.linha_id] = (m[i.linha_id] ?? 0) + 1
    }
    return m
  }, [todosImplantes])

  // Contagem de linhas por família (que têm implantes)
  const countLinhasByFamilia = useMemo(() => {
    const m: Record<string, number> = {}
    for (const l of todasLinhas ?? []) {
      if (l.familia_id && (countByLinha[l.id] ?? 0) > 0) {
        m[l.familia_id] = (m[l.familia_id] ?? 0) + 1
      }
    }
    return m
  }, [todasLinhas, countByLinha])

  // Contagem de famílias por conexão (que têm linhas com implantes)
  const countFamiliasByConexao = useMemo(() => {
    const m: Record<string, number> = {}
    for (const f of todasFamilias ?? []) {
      if (f.conexao_id && (countLinhasByFamilia[f.id] ?? 0) > 0) {
        m[f.conexao_id] = (m[f.conexao_id] ?? 0) + 1
      }
    }
    return m
  }, [todasFamilias, countLinhasByFamilia])

  // Etapa 4: Lista de implantes
  if (linhaId) return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <ImplantList
          linhaId={linhaId}
          conexaoId={conexaoId!}
          familiaId={familiaId!}
          onBack={() => navigate({ to: '/catalogo/implantes/$conexaoId/$familiaId', params: { conexaoId: conexaoId!, familiaId: familiaId! } })}
        />
      </div>
    </StoreLayout>
  )

  // Etapa 3: Escolher Linha
  if (familiaId) return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <LinhasList
          familiaId={familiaId}
          onSelect={(id) => navigate({ to: '/catalogo/implantes/$conexaoId/$familiaId/$linhaId', params: { conexaoId: conexaoId!, familiaId, linhaId: id } })}
          onBack={() => navigate({ to: '/catalogo/implantes/$conexaoId', params: { conexaoId: conexaoId! } })}
        />
      </div>
    </StoreLayout>
  )

  // Etapa 2: Escolher Família
  if (conexaoId) return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <FamiliasList
          conexaoId={conexaoId}
          onSelect={(id) => navigate({ to: '/catalogo/implantes/$conexaoId/$familiaId', params: { conexaoId, familiaId: id } })}
          onBack={() => navigate({ to: '/catalogo/implantes' })}
          countLinhasByFamilia={countLinhasByFamilia}
        />
      </div>
    </StoreLayout>
  )

  // Etapa 1: Escolher Conexão
  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <DrillDown
          title={t("catalogo.categories.implants")}
          subtitle={t("catalogo.categories.connectionType")}
          step={1}
          totalSteps={4}
          options={(conexoes ?? [])
            .filter((c) => (countFamiliasByConexao[c.id] ?? 0) > 0)
            .map((c) => ({
              id: c.id,
              label: c.nome,
              sublabel: c.sigla ?? undefined,
              count: countFamiliasByConexao[c.id] ?? 0,
            }))}
          onSelect={(id) => navigate({ to: '/catalogo/implantes/$conexaoId', params: { conexaoId: id } })}
          onBack={() => navigate({ to: '/catalogo' })}
          isLoading={loadingConexoes}
        />
      </div>
    </StoreLayout>
  )
}

function FamiliasList({ conexaoId, onSelect, onBack, countLinhasByFamilia }: { conexaoId: string; onSelect: (id: string) => void; onBack: () => void; countLinhasByFamilia: Record<string, number> }) {
  const { data: familias, isLoading } = useFamilias(conexaoId)
  const { t } = useTranslation()

  const options = (familias ?? [])
    .filter((f) => (countLinhasByFamilia[f.id] ?? 0) > 0)
    .map((f) => ({
      id: f.id,
      label: f.nome,
      sublabel: f.conexao?.nome,
      color: f.cor_identificacao,
      count: countLinhasByFamilia[f.id] ?? 0,
    }))

  return (
    <DrillDown
      title={t("catalogo.categories.family")}
      subtitle={t("catalogo.categories.familySubtitle")}
      step={2}
      totalSteps={4}
      options={options}
      onSelect={onSelect}
      onBack={onBack}
      isLoading={isLoading}
    />
  )
}

function LinhasList({ familiaId, onSelect, onBack }: { familiaId: string; onSelect: (id: string) => void; onBack: () => void }) {
  const { data: linhas, isLoading } = useLinhas(familiaId)
  const { data: implantesAtivos } = useImplantesAtivos()
  const { data: familias } = useFamilias()
  const familia = (familias ?? []).find((f) => f.id === familiaId)
  const corFamilia = familia?.cor_identificacao ?? "#c9a655"
  const { t } = useTranslation()
  const countByLinha = useMemo(() => {
    const m: Record<string, number> = {}
    for (const i of implantesAtivos ?? []) {
      if (i.linha_id) m[i.linha_id] = (m[i.linha_id] ?? 0) + 1
    }
    return m
  }, [implantesAtivos])

  const options = (linhas ?? [])
    .filter((l) => (countByLinha[l.id] ?? 0) > 0)
    .map((l) => ({
      id: l.id,
      label: l.nome,
      sublabel: familia?.nome,
      count: countByLinha[l.id] ?? 0,
      color: corFamilia,
      disabled: !l.ativo,
    }))

  return (
    <DrillDown
      title={t("catalogo.categories.lines")}
      subtitle={t("catalogo.categories.linesSubtitle")}
      step={3}
      totalSteps={4}
      options={options}
      onSelect={onSelect}
      onBack={onBack}
      isLoading={isLoading}
    />
  )
}

function ImplantList({ linhaId, conexaoId, familiaId, onBack }: { linhaId: string; conexaoId: string; familiaId: string; onBack: () => void }) {
  const { data: implantes, isLoading } = useImplantesPorLinha(linhaId)
  const { data: familias } = useFamilias()
  const { data: linhas } = useLinhas(familiaId)
  const linha = (linhas ?? []).find((l) => l.id === linhaId)
  const familia = (familias ?? []).find((f) => f.id === familiaId)
  const corFamilia = familia?.cor_identificacao ?? "#c9a655"
  const empresaId = useCatalogoEmpresaId()
  const [imagensMap, setImagensMap] = useState<Map<string, CatalogoImagemProduto[]>>(new Map())
  const [diametroFiltro, setDiametroFiltro] = useState<number | null>(null)
  const { t } = useTranslation()

  // Diâmetros únicos desta linha
  const diametrosUnicos = useMemo(() => {
    const set = new Set<number>()
    for (const i of implantes ?? []) {
      if (i.diametro_mm) set.add(i.diametro_mm)
    }
    return Array.from(set).sort((a, b) => a - b)
  }, [implantes])

  // Implantes filtrados por diâmetro
  const implantesFiltrados = useMemo(() => {
    if (diametroFiltro === null) return implantes ?? []
    return (implantes ?? []).filter((i) => i.diametro_mm === diametroFiltro)
  }, [implantes, diametroFiltro])

  // Buscar imagens dos implantes
  useEffect(() => {
    if (!implantes || implantes.length === 0) return
    const skus = implantes.map((i) => i.sku)
    listarImagensBatch("implante", skus).then(setImagensMap).catch(() => {})
  }, [implantes, empresaId])

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
                <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i < 4 ? "w-8 bg-[var(--color-accent)]" : "w-2 bg-[var(--color-border-subtle)]") } />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] ml-2">{t("catalogo.step", { current: 4, total: 4 })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white tracking-tighter text-balance">{t("catalogo.categories.selectImplant")}</h1>
          <p className="text-sm sm:text-lg mt-1 sm:mt-2 text-[var(--color-text-muted)] text-balance">{implantes?.length ?? 0} {t("catalogo.categories.productsFound")}</p>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)] pb-4">
        {implantesFiltrados.length} {t("catalogo.categories.results")}
      </p>

      {/* Filtro por Diâmetro */}
      {diametrosUnicos.length > 1 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">{t("catalogo.categories.selectDiameter")}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDiametroFiltro(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200",
                diametroFiltro === null
                  ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                  : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              )}
            >
              {t("catalogo.categories.all")}
            </button>
            {diametrosUnicos.map((d) => (
              <button
                key={d}
                onClick={() => setDiametroFiltro(d === diametroFiltro ? null : d)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200",
                  diametroFiltro === d
                    ? "bg-[var(--color-accent)] text-black border-[var(--color-accent)]"
                    : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                )}
              >
                Ø {d} mm
              </button>
            ))}
          </div>
        </div>
      )}

      {implantesFiltrados.length === 0 ? (
        <div className="text-center py-24 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 backdrop-blur-md">
          <PackageOpen className="h-14 w-14 mx-auto mb-6 opacity-20 text-white" />
          <p className="text-xl font-black text-white tracking-tight">{t("catalogo.categories.noImplants")}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm mx-auto">{diametroFiltro !== null ? `Nenhum implante com diâmetro Ø ${diametroFiltro} mm nesta linha.` : t("catalogo.categories.noImplantsLine")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {implantesFiltrados.map((impl) => (
            <Link
              to="/catalogo/produto/$tipo/$sku"
              params={{ tipo: 'implante', sku: impl.sku }}
              search={{ conexao: conexaoId, familia: familiaId, linha: linhaId }}
              className="no-underline"
              key={impl.sku}
            >
              <ProductCard
                tipo="implante"
                sku={impl.sku}
                nome={`${impl.diametro_mm}×${impl.comprimento_mm} mm`}
                badge={linha?.nome}
                corIdentificacao={impl.linha?.familia?.cor_identificacao || corFamilia}
                imageUrl={imagensMap.get(impl.sku)?.[0]?.url_imagem}
                qtdDisponivel={impl.qtd_disponivel}
                qtdMinimaAviso={impl.qtd_minima_aviso}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
