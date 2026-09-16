import { supabase } from "~/core/supabase"
import { createRoute, useParams, useNavigate, useSearch } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout, useCatalogoVisibility } from "~/features/catalogo/components/StoreLayout"
import { useImplanteDetalhe, useAbutmentDetalhe, useKitDetalhe, usePromocionalDetalhe, useItensPromocionalDetalhado, useProtocoloFresagem, useGuias, useImagensProduto, useImagensBatch, useChavesDoImplante, useCicatrizadoresDoImplante, useAbutmentsDoImplante, useKitsDoImplante, useKitsComChavesEmComum, useImplantesDoAbutment, useCatalogoConfig } from "~/features/catalogo/hooks/useCatalogo"
import { addToCart, formatBRL, getPrecoFromDB, mockPreco, resolveBOMItem } from "~/features/catalogo/services/carrinho.service"
import { resolvePreco } from "~/features/catalogo/services/precos-grupo.service"
import { useClienteAtivo } from "~/features/catalogo/contexts/cliente-ativo"
import { playCoinSound } from "~/features/catalogo/services/audio.service"
import { listarKitsRelacionadosDeChave, listarKitsRelacionadosDeCicatrizador } from "~/features/catalogo/services/kits.service"
import type { ProductSheetTipo } from "~/features/catalogo/types"
import { EstoqueBadge } from "~/features/catalogo/components/admin/produtos/EstoqueBadge"
import { useState, useEffect, lazy, Suspense } from "react"

// Componentes pesados (timeline de fresagem, sequência protética, modal de ficha técnica,
// tabela de BOM) só são necessários dentro de tabs específicas do detalhe — carregados sob demanda
// para não engordar o chunk principal da rota pública /catalogo/produto/$tipo/$sku.
const FresagemTimeline = lazy(() => import("~/features/catalogo/components/FresagemTimeline").then((m) => ({ default: m.FresagemTimeline })))
const SequenciaProtetica = lazy(() => import("~/features/catalogo/components/SequenciaProtetica").then((m) => ({ default: m.SequenciaProtetica })))
const FichaTecnicaModal = lazy(() => import("~/features/catalogo/components/FichaTecnicaModal").then((m) => ({ default: m.FichaTecnicaModal })))
const BomTable = lazy(() => import("~/features/catalogo/components/BomTable").then((m) => ({ default: m.BomTable })))
import toast from "react-hot-toast"
import { ArrowLeft, ShoppingCart, Box, Zap, ExternalLink, Check, TrendingDown, X, FileText, ListOrdered, ChevronDown, PackageX } from "lucide-react"
import { openImageViewer } from "~/features/catalogo/services/ui.service"
import { useTabIcons, TabIconsProvider } from "~/features/catalogo/contexts/TabIconsContext"

export const catalogoProdutoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/produto/$tipo/$sku",
  component: () => (
    <TabIconsProvider>
      <ProdutoPage />
    </TabIconsProvider>
  ),
})

function ProdutoPage() {
  const params = useParams({ strict: false })
  const tipo = (params as Record<string, string>).tipo
  const sku = (params as Record<string, string>).sku
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as Record<string, string | null>

  const backToFallback = () => {
    if (tipo === 'implante') return navigate({ to: '/catalogo/implantes/$conexaoId/$familiaId/$linhaId', params: { conexaoId: search.conexao!, familiaId: search.familia!, linhaId: search.linha! } })
    if (tipo === 'abutment') return navigate({ to: '/catalogo/componentes/$familiaId/$tipoReabId/$tipoAbutmentId', params: { familiaId: search.familia!, tipoReabId: search.tipoReab!, tipoAbutmentId: search.tipoAbutment! } })
    if (tipo === 'kit') return navigate({ to: '/catalogo/kits' })
    if (tipo === 'promocional') return navigate({ to: '/catalogo/promocionais' })
    navigate({ to: '/catalogo' })
  }

  const backTo = () => {
    // Prioriza o histórico real do navegador para voltar exatamente à página
    // anterior (ex.: produto de origem ao clicar em "Ver página completa" de
    // uma ficha técnica aninhada). Sem histórico próprio (acesso direto via
    // link), cai no destino genérico calculado por tipo.
    if (window.history.length > 1) return window.history.back()
    backToFallback()
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        <button
          onClick={backTo}
          className="group shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
        </button>

        {tipo === "implante" && <ImplanteDetail sku={sku} />}
        {tipo === "abutment" && <AbutmentDetail sku={sku} />}
        {tipo === "kit" && <KitDetail sku={sku} />}
        {tipo === "promocional" && <PromocionalDetail id={sku} />}
      </div>
    </StoreLayout>
  )
}

/* ─── Shared Components ────────────────────────────────────────────── */

function ProductImage({ cor, nome, onClick, imageUrl }: { cor: string; nome: string; onClick: () => void; imageUrl?: string | null }) {
  return (
    <div
      onClick={onClick}
      className="cursor-zoom-in w-full max-w-[480px] mx-auto aspect-square rounded-2xl bg-gradient-to-br from-[var(--color-surface)] to-[#0f172a] border border-[var(--color-border-subtle)] overflow-hidden relative flex flex-col items-center justify-center p-6 sm:p-8 group transition-all duration-300 hover:shadow-[0_0_60px_rgba(201,166,85,0.08)]"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={nome}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <>
          <div className="absolute inset-0 opacity-10 group-hover:opacity-25 mix-blend-screen transition-opacity duration-500" style={{ background: `radial-gradient(circle at 30% 30%, ${cor} 0%, transparent 60%)` }} />
          <Box className="w-24 h-24 sm:w-32 sm:h-32 opacity-[0.07] relative z-10 transition-transform group-hover:scale-110 duration-700" style={{ color: cor }} />
        </>
      )}
      <div className="absolute bottom-4 sm:bottom-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[var(--color-border-subtle)] bg-[#0f172a]/60 backdrop-blur-md">
        <p className="font-mono text-[10px] tracking-widest text-white flex items-center gap-2">
          <ExternalLink className="w-3 h-3" /> Toque para ampliar
        </p>
      </div>
    </div>
  )
}

function ProductHeader({ cor, badge, nome, sku, qtdDisponivel, qtdMinimaAviso }: { cor: string; badge?: string; nome: string; sku?: string; qtdDisponivel?: number | null; qtdMinimaAviso?: number | null }) {
  return (
    <div className="space-y-3 sm:space-y-4 rounded-2xl bg-gradient-to-br from-[var(--color-surface)]/40 to-transparent border border-[var(--color-border-subtle)]/60 p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        {badge && (
          <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border shadow-lg" style={{ borderColor: cor, backgroundColor: `${cor}1a`, color: cor, boxShadow: `0 0 24px ${cor}22` }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{badge}</span>
          </div>
        )}
        <EstoqueBadge qtdDisponivel={qtdDisponivel} qtdMinimaAviso={qtdMinimaAviso} exibirEstoque={useCatalogoConfig().data?.exibir_estoque ?? true} />
      </div>
      <h1 className="text-xl sm:text-3xl lg:text-4xl font-black leading-snug sm:leading-[0.95] text-white tracking-tight sm:tracking-tighter text-balance">{nome}</h1>
      {sku && (
        <p className="font-mono text-xs sm:text-sm text-[var(--color-text-muted)]">SKU: <span className="text-white/80">{sku}</span></p>
      )}
    </div>
  )
}

function AddButton({ tipo, sku, nome, cor, precoDB, qtdDisponivel, qtdMinimaAviso }: { tipo: ProductSheetTipo; sku: string; nome: string; cor: string; precoDB?: number | null; qtdDisponivel?: number | null; qtdMinimaAviso?: number | null }) {
  const [added, setAdded] = useState(false)
  const { showPrices } = useCatalogoVisibility()
  const { isConsultor, clienteAtivo } = useClienteAtivo()
  const precoBase = Number(precoDB)
  const [preco, setPreco] = useState(precoBase)

  // Quando o consultor tem um cliente da carteira selecionado, o preço já
  // sai com o desconto de grupo desse cliente aplicado automaticamente.
  useEffect(() => {
    if (!Number.isFinite(precoBase) || precoBase <= 0) return
    if (!isConsultor || !clienteAtivo) {
      setPreco(precoBase)
      return
    }
    let cancelled = false
    resolvePreco("colaborador", sku, tipo, precoBase, { crmClienteId: clienteAtivo.id }).then((p) => {
      if (!cancelled && p != null) setPreco(p)
    })
    return () => {
      cancelled = true
    }
  }, [precoBase, isConsultor, clienteAtivo?.id, sku, tipo])

  const semEstoque = (qtdDisponivel ?? 0) <= 0
  if (semEstoque) {
    return (
      <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 min-h-[44px] flex items-center justify-center gap-2.5 cursor-not-allowed opacity-70">
        <PackageX className="h-4 w-4 text-red-400 transition-transform group-hover:scale-110" />
        <span className="text-sm font-bold text-red-400">Sem Estoque</span>
      </div>
    )
  }
  if (!Number.isFinite(precoBase) || precoBase <= 0) return null
  const handleAdd = () => {
    addToCart({ sku, nome, tipo, cor, preco })
    playCoinSound()
    setAdded(true)
    toast.success(`${nome} adicionado ao carrinho`, {
      icon: <Check className="w-4 h-4" />,
      style: {
        background: "var(--color-surface)",
        color: "var(--color-text-main)",
        border: "1px solid var(--color-accent)",
        fontSize: "13px",
        fontWeight: 600,
      },
      duration: 2500,
    })
    setTimeout(() => setAdded(false), 2000)
  }

  if (semEstoque) {
    return (
      <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 min-h-[44px] flex items-center justify-center gap-2.5 cursor-not-allowed opacity-70">
        <PackageX className="h-4 w-4 text-red-400" />
        <span className="text-sm font-bold text-red-400">Sem Estoque</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full group relative overflow-hidden rounded-xl font-bold text-sm transition-all duration-300 min-h-[44px] ${
        added
          ? "bg-[var(--color-success)] text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          : "border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-fg)] hover:shadow-[0_0_30px_rgba(201,166,85,0.15)]"
      } px-5 py-2.5`}
    >
      <span className="flex items-center justify-center gap-2.5">
        {added ? (
          <>
            <Check className="h-4 w-4" />
            ADICIONADO
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
            {showPrices ? `Add ${formatBRL(preco)}` : "ADICIONAR"}
          </>
        )}
      </span>
    </button>
  )
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border-subtle)] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[var(--color-accent)]/20">
      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-1 text-[var(--color-text-muted)]">{label}</span>
      <span className="block text-base sm:text-lg font-bold text-white">{value}</span>
    </div>
  )
}
type SectionTab = { key: string; label: string; count?: number }

function SectionTabs({ tabs, active, onChange, renderIcon }: { tabs: SectionTab[]; active: string; onChange: (key: string) => void; renderIcon: (key: string) => React.ReactNode }) {
  return (
    <div
      className="grid gap-2 sm:gap-2.5 [grid-template-columns:repeat(var(--cols-xs),minmax(0,1fr))] sm:[grid-template-columns:repeat(var(--cols-sm),minmax(0,1fr))]"
      style={{ "--cols-xs": Math.min(tabs.length, 3), "--cols-sm": Math.min(tabs.length, 6) } as React.CSSProperties}
    >
      {tabs.map((t) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`group flex flex-col items-center gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 min-h-[44px] ${
              isActive
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_20px_rgba(201,166,85,0.1)]"
                : "border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 hover:border-white/20 hover:bg-[var(--color-surface)]/60"
            }`}
          >
            <span className={`transition-colors ${isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] group-hover:text-white/70"}`}>
              {renderIcon(t.key)}
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider leading-tight text-center transition-colors ${isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] group-hover:text-white/70"}`}>
              {t.label}
            </span>
            {t.count != null && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"}`}>
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
function EmptyState({ msg, hint }: { msg: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center">
      <p className="text-sm font-semibold text-[var(--color-text-muted)]">{msg}</p>
      {hint && <p className="text-xs text-[var(--color-text-muted)]/60 mt-1.5">{hint}</p>}
    </div>
  )
}


/* ─── Implante Detail ──────────────────────────────────────────────── */


/** Small product card for related items in tabs (cicatrizadores, abutments, kits, chaves) */
function RelatedProductCard({
  nome, sku, cor, preco, tipo, imageUrl, onImageClick, onVerFicha, onSeqProtetica, fichaData, qtdDisponivel, qtdMinimaAviso, children,
}: {
  nome: string; sku: string; cor: string; preco?: number | null
  tipo: ProductSheetTipo; imageUrl?: string | null
  onImageClick: () => void; onVerFicha?: () => void; onSeqProtetica?: () => void; fichaData?: Record<string, string | number | null | undefined>; qtdDisponivel?: number | null; qtdMinimaAviso?: number | null; children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 hover:border-[var(--color-accent)]/40 transition-all duration-200">
      <div className="flex gap-3 sm:contents">
        {/* Thumbnail — vai para a esquerda no desktop */}
        <div
          onClick={onImageClick}
          className="sm:order-1 shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden cursor-zoom-in bg-gradient-to-br from-[var(--color-surface)] to-[#0f172a] border border-[var(--color-border-subtle)] flex items-center justify-center"
        >
          {imageUrl ? (
            <img src={imageUrl} alt={nome} className="w-full h-full object-contain" loading="lazy" />
          ) : (
            <Box className="w-7 h-7 sm:w-8 sm:h-8 opacity-10" style={{ color: cor }} />
          )}
        </div>
        {/* Info */}
        <div className="sm:order-2 flex-1 min-w-0 space-y-1">
          <h4 className="text-sm font-bold text-white truncate">{nome}</h4>
          <p className="font-mono text-[10px] text-[var(--color-text-muted)]">SKU: {sku}</p>
          <EstoqueBadge qtdDisponivel={qtdDisponivel} qtdMinimaAviso={qtdMinimaAviso} compacto exibirEstoque={useCatalogoConfig().data?.exibir_estoque ?? true} />
          <div className="flex flex-wrap items-center gap-1.5 mt-1">{children}</div>
        </div>
      </div>
      {/* CTA */}
      {(fichaData && Object.keys(fichaData).length > 0 || Number(preco) > 0 || onSeqProtetica) && (
        <div className={`sm:order-3 w-full sm:w-auto shrink-0 flex gap-2 ${onSeqProtetica ? "flex-col items-stretch" : "flex-row sm:flex-col items-center justify-between sm:justify-normal"}`}>
          {fichaData && Object.keys(fichaData).length > 0 && (
            <button
              onClick={onVerFicha}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)]/60 transition-all min-h-[32px]"
            >
              <FileText className="w-3 h-3" />
              Ver Ficha
            </button>
          )}
          {onSeqProtetica && (
            <button
              onClick={onSeqProtetica}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)]/60 transition-all min-h-[32px]"
            >
              <ListOrdered className="w-3 h-3" />
              Seq. Protética
            </button>
          )}
          <AddButton tipo={tipo} sku={sku} nome={nome} cor={cor} precoDB={preco} qtdDisponivel={qtdDisponivel} qtdMinimaAviso={qtdMinimaAviso} />
        </div>
      )}
    </div>
  )
}

function ImplanteDetail({ sku }: { sku: string }) {
  const { getIcon } = useTabIcons()
  const navigate = useNavigate()
  const { data: impl, isLoading } = useImplanteDetalhe(sku)
  const { data: protocolos } = useProtocoloFresagem(sku)
  const { data: imagens } = useImagensProduto("implante", sku)
  const { data: chaves } = useChavesDoImplante(sku)
  const { data: cicatrizadores } = useCicatrizadoresDoImplante(sku)
  const { data: abutments } = useAbutmentsDoImplante(sku)
  const { data: kits } = useKitsDoImplante(sku)
  const [activeTab, setActiveTab] = useState("ficha")
  const [fichaModal, setFichaModal] = useState<{ open: boolean; nome: string; sku: string; imagemUrl?: string | null; tipo?: ProductSheetTipo; preco?: number | null; onVerCompleto?: () => void; sections: Array<{ title: string; specs: Array<{ label: string; value: string | number | null | undefined }> }>; vinculacoes?: Array<{ nome: string; sku: string; valor?: number | null; tipo?: ProductSheetTipo }>; qtdDisponivel?: number | null; qtdMinimaAviso?: number | null }>({ open: false, nome: "", sku: "", sections: [] })
  const chavesSkus = (chaves ?? []).map((c) => c.sku)
  const cicSkus = (cicatrizadores ?? []).map((c) => c.sku)
  const abSkus = (abutments ?? []).map((a) => a.sku)
  const kitSkus = (kits ?? []).map((k) => k.sku)
  const { data: imagensChaves } = useImagensBatch("chave", chavesSkus)
  const { data: imagensCic } = useImagensBatch("cicatrizador", cicSkus)
  const { data: imagensAb } = useImagensBatch("abutment", abSkus)
  const { data: imagensKits } = useImagensBatch("kit", kitSkus)

  if (isLoading) return <LoadingState />
  if (!impl) return <EmptyState msg="Implante não encontrado" hint="Verifique se o SKU está correto e a empresa está selecionada." />

  // ── Inativo: não renderiza ──
  if (!impl.ativo) return null

  const cor = impl.linha?.familia?.cor_identificacao ?? "#c9a655"
  const nome = impl.nome
  const imageUrl = imagens?.[0]?.url_imagem ?? null

  // ── Filtra dados nulos/vazios ──
  const specs: Array<{ label: string; value: string }> = [
    { label: "Diâmetro", value: `${impl.diametro_mm} mm` },
    { label: "Comprimento", value: `${impl.comprimento_mm} mm` },
    impl.diametro_plataforma_mm != null ? { label: "Ø Plataforma", value: `${impl.diametro_plataforma_mm} mm` } : null,
    impl.rosca_interna ? { label: "Rosca Interna", value: impl.rosca_interna } : null,
    impl.torque_insercao != null ? { label: "Torque Recomendado", value: `${impl.torque_insercao} N·cm` } : null,
    impl.regiao_apical ? { label: "Região Apical", value: impl.regiao_apical } : null,
    impl.regiao_cervical ? { label: "Região Cervical", value: impl.regiao_cervical } : null,
    impl.macrogeometria ? { label: "Macrogeometria", value: impl.macrogeometria } : null,
    (impl.detalhes_extras as Record<string, unknown>)?.material
      ? { label: "Material", value: String((impl.detalhes_extras as Record<string, unknown>).material) } : null,
    (impl.detalhes_extras as Record<string, unknown>)?.superficie
      ? { label: "Superfície", value: String((impl.detalhes_extras as Record<string, unknown>).superficie) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  // ── Filtra itens ativos ──
  const chavesAtivas = chaves?.filter((c) => c.ativo) ?? []
  const cicatAtivos = cicatrizadores?.filter((c) => c.ativo) ?? []
  const abutAtivos = abutments?.filter((a) => a.ativo) ?? []
  const kitsAtivos = kits?.filter((k) => k.ativo) ?? []

  // ── Tabs (só inclui se tiver dados) ──
  const tabs: SectionTab[] = [
    { key: "ficha", label: "Ficha", count: specs.length },
    { key: "fresagem", label: "Protocolos", count: protocolos?.length ?? 0 },
    { key: "chaves", label: "Chaves", count: chavesAtivas.length },
    { key: "kits", label: "Kits", count: kitsAtivos.length },
    { key: "cicatrizadores", label: "Cicatriz.", count: cicatAtivos.length },
    { key: "abutments", label: "Abutments", count: abutAtivos.length },
  ]

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
      {/* Sidebar — Imagem + CTA */}
      <div className="lg:col-span-4 xl:col-span-5">
        <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-5">
          <ProductImage cor={cor} nome={nome} onClick={() => openImageViewer(imageUrl ?? "", nome)} imageUrl={imageUrl} />
          {/* Miniaturas */}
          {imagens && imagens.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagens.map((img) => (
                <button
                  key={img.id}
                  onClick={() => openImageViewer(img.url_imagem, nome)}
                  className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] transition-colors"
                >
                  <img src={img.url_imagem} alt="" className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="hidden lg:block">
            <AddButton tipo="implante" sku={impl.sku} nome={nome} cor={cor} precoDB={impl.preco} qtdDisponivel={impl.qtd_disponivel} />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="lg:col-span-8 xl:col-span-7 space-y-6 sm:space-y-8">
        <ProductHeader cor={cor} badge={impl.linha?.familia?.nome} nome={nome} sku={impl.sku} qtdDisponivel={impl.qtd_disponivel} qtdMinimaAviso={impl.qtd_minima_aviso} />

        <div className="lg:hidden">
          <AddButton tipo="implante" sku={impl.sku} nome={nome} cor={cor} precoDB={impl.preco} qtdDisponivel={impl.qtd_disponivel} />
        </div>

        {/* Tabs */}
        <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} renderIcon={(key) => { const I = getIcon(key); return <I className="w-5 h-5" /> }} />

        {/* ─── Ficha Técnica ─── */}
        {activeTab === "ficha" && (
          <div className="space-y-5 sm:space-y-6">
            {/* Breadcrumb hierárquico — usa dados do join aninhado OU colunas diretas */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {impl.linha?.familia?.conexao?.categoria?.nome && <span>{impl.linha.familia.conexao.categoria.nome}</span>}
              {impl.linha?.familia?.conexao?.nome && (
                <>
                  {impl.linha?.familia?.conexao?.categoria?.nome && <span className="opacity-40">/</span>}
                  <span>{impl.linha.familia.conexao.nome}</span>
                </>
              )}
              {impl.linha?.familia?.nome && (
                <>
                  {(impl.linha?.familia?.conexao?.categoria?.nome || impl.linha?.familia?.conexao?.nome) && <span className="opacity-40">/</span>}
                  <span>{impl.linha.familia.nome}</span>
                </>
              )}
              {impl.linha?.nome && (
                <>
                  <span className="opacity-40">/</span>
                  <span>{impl.linha.nome}</span>
                </>
              )}
            </div>

            {/* Descrição */}
            {impl.descricao && (
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-5">
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{impl.descricao}</p>
              </div>
            )}

            {/* Specs — só renderiza não nulos */}
            {specs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {specs.map((s) => (
                  <SpecCard key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Protocolos de Fresagem ─── */}
        {activeTab === "fresagem" && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            {protocolos && protocolos.length > 0 ? (
              <Suspense fallback={null}>
                <FresagemTimeline implanteSku={impl.sku} protocolos={protocolos} />
              </Suspense>
            ) : (
              <EmptyState msg="Nenhum protocolo de fresagem cadastrado" hint="Adicione uma sequência de fresagem na edição do implante." />
            )}
          </div>
        )}

        {/* ─── Chaves ─── */}
        {activeTab === "chaves" && (
          <div className="space-y-2.5 sm:space-y-3">
            {chavesAtivas.length > 0 ? chavesAtivas.map((chave) => {
              const img = imagensChaves?.get(chave.sku)?.[0]?.url_imagem
              return (
                <RelatedProductCard
                  key={chave.sku}
                  nome={chave.nome}
                  sku={chave.sku}
                  cor={cor}
                  preco={chave.preco}
                  tipo="chave"
                  imageUrl={img}
                  onImageClick={() => openImageViewer(img ?? "", chave.nome)}
                  qtdDisponivel={chave.qtd_disponivel}
                  qtdMinimaAviso={chave.qtd_minima_aviso}
                  onVerFicha={async () => {
                    setFichaModal({ open: true, nome: chave.nome, sku: chave.sku, imagemUrl: img, tipo: "chave", preco: chave.preco, sections: [
                      { title: "Identificação", specs: [
                        { label: "SKU", value: chave.sku },
                        { label: "Nome", value: chave.nome },
                        { label: "Sigla", value: chave.sigla },
                        { label: "Descrição", value: chave.descricao },
                        { label: "Tipo", value: chave.tipo_chave?.nome },
                        { label: "Comprimento", value: chave.comprimento },
                        { label: "Diâmetro", value: chave.diametro_mm ? `${chave.diametro_mm} mm` : null },
                        { label: "Material", value: chave.material },
                      ]},
                      { title: "Comercial", specs: [
                        { label: "Preço", value: chave.preco ? formatBRL(chave.preco) : null },
                      ]},
                    ] })
                    const kits = await listarKitsRelacionadosDeChave(chave.sku)
                    if (kits.length > 0) setFichaModal((p) => ({ ...p, vinculacoes: kits.map((k) => ({ nome: k.nome, sku: k.sku, valor: k.preco, tipo: "kit" as ProductSheetTipo })) }))
                  }}
                  fichaData={{ tipo: chave.tipo_chave?.nome, diametro: chave.diametro_mm }}
                >
                  {chave.tipo_chave?.nome && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {chave.tipo_chave.nome}
                    </span>
                  )}
                </RelatedProductCard>
              )
            })
          : <EmptyState msg="Nenhuma chave vinculada" hint="Vincule chaves na edição do implante." />}
          </div>
        )}

        {/* ─── Kits ─── */}
        {activeTab === "kits" && (
          <div className="space-y-2.5 sm:space-y-3">
            {kitsAtivos.length > 0 ? kitsAtivos.map((kit) => {
              const img = imagensKits?.get(kit.sku)?.[0]?.url_imagem
              return (
                <RelatedProductCard
                  key={kit.sku}
                  nome={kit.nome}
                  sku={kit.sku}
                  cor={cor}
                  preco={kit.preco}
                  tipo="kit"
                  imageUrl={img}
                  onImageClick={() => openImageViewer(img ?? "", kit.nome)}
                  qtdDisponivel={kit.qtd_disponivel}
                  qtdMinimaAviso={kit.qtd_minima_aviso}
                  onVerFicha={() => setFichaModal({ open: true, nome: kit.nome, sku: kit.sku, imagemUrl: img, tipo: "kit", preco: kit.preco, onVerCompleto: () => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "kit", sku: kit.sku } }), sections: [
                    { title: "Identificação", specs: [
                      { label: "SKU", value: kit.sku },
                      { label: "Nome", value: kit.nome },
                      { label: "Sigla", value: kit.sigla },
                      { label: "Descrição", value: kit.descricao },
                      { label: "Tipo", value: kit.tipo_kit?.nome },
                    ]},
                    { title: "Comercial", specs: [
                      { label: "Preço", value: kit.preco ? formatBRL(kit.preco) : null },
                    ]},
                  ] })}
                  fichaData={{ tipo: kit.tipo_kit?.nome, descricao: kit.descricao }}
                >
                  {kit.tipo_kit?.nome && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {kit.tipo_kit.nome}
                    </span>
                  )}
                </RelatedProductCard>
              )
            })
          : <EmptyState msg="Nenhum kit vinculado" hint="Vincule kits na edição do implante." />}
          </div>
        )}

        {/* ─── Cicatrizadores ─── */}
        {activeTab === "cicatrizadores" && (
          <div className="space-y-2.5 sm:space-y-3">
            {cicatAtivos.length > 0 ? cicatAtivos.map((cic) => {
              const img = imagensCic?.get(cic.sku)?.[0]?.url_imagem
              return (
                <RelatedProductCard
                  key={cic.sku}
                  nome={cic.nome}
                  sku={cic.sku}
                  cor={cor}
                  preco={cic.preco}
                  tipo="cicatrizador"
                  imageUrl={img}
                  onImageClick={() => openImageViewer(img ?? "", cic.nome)}
                  qtdDisponivel={cic.qtd_disponivel}
                  qtdMinimaAviso={cic.qtd_minima_aviso}
                  onVerFicha={async () => {
                    const vinculacoesBase = [
                      ...(cic.implante ? [{ nome: cic.implante.nome ?? cic.implante.sku, sku: cic.implante.sku, valor: getPrecoFromDB(cic.implante.preco, "implante", cic.implante.sku), tipo: "implante" as ProductSheetTipo }] : []),
                      ...(cic.chave ? [{ nome: cic.chave.nome, sku: cic.chave.sku, valor: getPrecoFromDB(cic.chave.preco, "chave", cic.chave.sku), tipo: "chave" as ProductSheetTipo }] : []),
                    ]
                    setFichaModal({ open: true, nome: cic.nome, sku: cic.sku, imagemUrl: img, tipo: "cicatrizador", preco: cic.preco, sections: [
                      { title: "Identificação", specs: [
                        { label: "SKU", value: cic.sku },
                        { label: "Nome", value: cic.nome },
                        { label: "Sigla", value: cic.sigla },
                        { label: "Descrição", value: cic.descricao },
                        { label: "Material", value: cic.material },
                        { label: "Diâm. Plataforma", value: cic.diametro_plataforma_mm ? `${cic.diametro_plataforma_mm} mm` : null },
                        { label: "Alt. Transmucoso", value: cic.altura_transmucoso_mm ? `${cic.altura_transmucoso_mm} mm` : null },
                        { label: "Alt. Corpo", value: cic.altura_corpo_mm ? `${cic.altura_corpo_mm} mm` : null },
                        { label: "Torque", value: cic.torque_ncm ? `${cic.torque_ncm} N.cm` : null },
                      ]},
                      { title: "Comercial", specs: [
                        { label: "Preço", value: cic.preco ? formatBRL(cic.preco) : null },
                      ]},
                    ], vinculacoes: vinculacoesBase })
                    const kits = await listarKitsRelacionadosDeCicatrizador(cic.sku)
                    if (kits.length > 0) setFichaModal((p) => ({ ...p, vinculacoes: [...vinculacoesBase, ...kits.map((k) => ({ nome: k.nome, sku: k.sku, valor: k.preco, tipo: "kit" as ProductSheetTipo }))] }))
                  }}
                  fichaData={{ sigla: cic.sigla, material: cic.material }}
                >
                  {cic.sigla && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {cic.sigla}
                    </span>
                  )}
                </RelatedProductCard>
              )
            })
          : <EmptyState msg="Nenhum cicatrizador vinculado" hint="Vincule cicatrizadores na edição do implante." />}
          </div>
        )}

        {/* ─── Abutments ─── */}
        {activeTab === "abutments" && (
          <div className="space-y-2.5 sm:space-y-3">
            {abutAtivos.length > 0 ? abutAtivos.map((ab) => {
              const img = imagensAb?.get(ab.sku)?.[0]?.url_imagem
              return (
                <RelatedProductCard
                  key={ab.sku}
                  nome={`${ab.tipo_abutment?.nome ?? ""} ${ab.familia?.nome ?? ""}`.trim()}
                  sku={ab.sku}
                  cor={cor}
                  preco={ab.preco}
                  tipo="abutment"
                  imageUrl={img}
                  onImageClick={() => openImageViewer(img ?? "", ab.nome ?? ab.sku)}
                  qtdDisponivel={ab.qtd_disponivel}
                  qtdMinimaAviso={ab.qtd_minima_aviso}
                  onSeqProtetica={() => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "abutment", sku: ab.sku }, search: { tab: "sequencia" } })}
                  onVerFicha={() => setFichaModal({ open: true, nome: `${ab.tipo_abutment?.nome ?? ""} ${ab.familia?.nome ?? ""}`.trim(), sku: ab.sku, imagemUrl: img, tipo: "abutment", preco: ab.preco, onVerCompleto: () => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "abutment", sku: ab.sku } }), sections: [
                    { title: "Identificação", specs: [
                      { label: "SKU", value: ab.sku },
                      { label: "Nome", value: `${ab.tipo_abutment?.nome ?? ""} ${ab.familia?.nome ?? ""}`.trim() },
                      { label: "Sigla", value: ab.sigla },
                      { label: "Descrição", value: ab.descricao },
                      { label: "Material", value: ab.material },
                      { label: "Família", value: ab.familia?.nome },
                      { label: "Tipo Abutment", value: ab.tipo_abutment?.nome },
                      { label: "Diâm. Plataforma", value: ab.diametro_plataforma_mm ? `${ab.diametro_plataforma_mm} mm` : null },
                      { label: "Alt. Transmucoso", value: ab.altura_transmucoso_mm ? `${ab.altura_transmucoso_mm} mm` : null },
                      { label: "Alt. Corpo", value: ab.altura_corpo_mm ? `${ab.altura_corpo_mm} mm` : null },
                      { label: "Angulação", value: ab.angulacao_graus ? `${ab.angulacao_graus}°` : null },
                      { label: "Torque", value: ab.torque_ncm ? `${ab.torque_ncm} N.cm` : null },
                    ]},
                    { title: "Comercial", specs: [
                      { label: "Preço", value: ab.preco ? formatBRL(ab.preco) : null },
                    ]},
                  ], vinculacoes: [
                    ...(ab.parafuso ? [{ nome: ab.parafuso.nome, sku: ab.parafuso.sku, valor: getPrecoFromDB(ab.parafuso.preco, "parafuso", ab.parafuso.sku), tipo: "parafuso" as ProductSheetTipo }] : []),
                    ...(ab.chave ? [{ nome: ab.chave.nome, sku: ab.chave.sku, valor: getPrecoFromDB(ab.chave.preco, "chave", ab.chave.sku), tipo: "chave" as ProductSheetTipo }] : []),
                  ] })}
                  fichaData={{ tipo: ab.tipo_abutment?.nome, familia: ab.familia?.nome }}
                >
                  {ab.tipo_abutment?.nome && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {ab.tipo_abutment.nome}
                    </span>
                  )}
                </RelatedProductCard>
              )
            })
          : <EmptyState msg="Nenhum abutment vinculado" hint="Vincule abutments na edição do implante." />}
          </div>
        )}
      </div>
    </div>

    {/* Modal Ficha Tecnica */}
    <Suspense fallback={null}>
      <FichaTecnicaModal
        open={fichaModal.open}
        onClose={() => setFichaModal((p) => ({ ...p, open: false }))}
        nome={fichaModal.nome}
        sku={fichaModal.sku}
        cor={cor}
        imagemUrl={fichaModal.imagemUrl}
        tipo={fichaModal.tipo}
        preco={fichaModal.preco}
        onVerCompleto={fichaModal.onVerCompleto}
        sections={fichaModal.sections}
        vinculacoes={fichaModal.vinculacoes}
        qtdDisponivel={fichaModal.qtdDisponivel}
        qtdMinimaAviso={fichaModal.qtdMinimaAviso}
      />
    </Suspense>
    </>
  )
}
/* ─── Abutment Detail ──────────────────────────────────────────────── */

function AbutmentDetail({ sku }: { sku: string }) {
  const { getIcon } = useTabIcons()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as Record<string, string | undefined>
  const { data: ab } = useAbutmentDetalhe(sku)
  const { data: guias } = useGuias({ familia_id: ab?.familia_id })
  const { data: implantesCompat } = useImplantesDoAbutment(sku)
  const implCompatSkus = (implantesCompat ?? []).map((i) => i.sku)
  const { data: imagensImplCompat } = useImagensBatch("implante", implCompatSkus)

  // ── Compatibilidade agrupada por linha (accordion — só a primeira linha nasce expandida) ──
  const implantesCompatAtivos = implantesCompat?.filter((i) => i.ativo) ?? []
  const implantesCompatPorLinha = new Map<string, { linha: typeof implantesCompatAtivos[number]["linha"]; implantes: typeof implantesCompatAtivos }>()
  for (const impl of implantesCompatAtivos) {
    const linhaId = impl.linha_id ?? "sem-linha"
    if (!implantesCompatPorLinha.has(linhaId)) implantesCompatPorLinha.set(linhaId, { linha: impl.linha, implantes: [] })
    implantesCompatPorLinha.get(linhaId)!.implantes.push(impl)
  }
  const linhasCompatKey = [...implantesCompatPorLinha.keys()].join("|")
  const [expandedLinhasCompat, setExpandedLinhasCompat] = useState<Set<string>>(new Set())
  useEffect(() => {
    const primeira = [...implantesCompatPorLinha.keys()][0]
    setExpandedLinhasCompat(new Set(primeira ? [primeira] : []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linhasCompatKey])
  function toggleLinhaCompat(linhaId: string) {
    setExpandedLinhasCompat((prev) => {
      const next = new Set(prev)
      if (next.has(linhaId)) next.delete(linhaId)
      else next.add(linhaId)
      return next
    })
  }
  const { data: imagens } = useImagensProduto("abutment", sku)
  const [kits, setKits] = useState<any[]>([])
  const [abChaves, setAbChaves] = useState<any[]>([])
  const [abParafusos, setAbParafusos] = useState<any[]>([])
  const [abChavesImagens, setAbChavesImagens] = useState<Map<string, any[]>>(new Map())
  const [abParafusosImagens, setAbParafusosImagens] = useState<Map<string, any[]>>(new Map())
  const [seqCount, setSeqCount] = useState(0)
  const kitSkus = kits.map((k: any) => k.sku)
  const { data: imagensKits } = useImagensBatch("kit", kitSkus)
  const [fichaModal, setFichaModal] = useState<{ open: boolean; nome: string; sku: string; imagemUrl?: string | null; tipo?: ProductSheetTipo; preco?: number | null; onVerCompleto?: () => void; sections: Array<{ title: string; specs: Array<{ label: string; value: string | number | null | undefined }> }>; vinculacoes?: Array<{ nome: string; sku: string; valor?: number | null; tipo?: ProductSheetTipo }>; qtdDisponivel?: number | null; qtdMinimaAviso?: number | null }>({ open: false, nome: "", sku: "", sections: [] })
  useEffect(() => {
    if (!sku) return
    Promise.resolve(
      supabase.from("catalogo_seq_protetica_abutments").select("seq_id", { count: "exact", head: true }).eq("abutment_sku", sku)
    )
      .then(({ count }) => setSeqCount(count ?? 0))
      .catch(() => setSeqCount(0))
  }, [sku])
  useEffect(() => {
    if (!sku) return
    Promise.resolve(
      supabase.from("catalogo_abutment_chaves").select("chave_id").eq("abutment_sku", sku)
    )
      .then(async ({ data, error }) => {
        if (error) { console.error("Erro chaves:", error); return }
        const ids = (data ?? []).map((r: any) => r.chave_id)
        if (ids.length === 0) { setAbChaves([]); return }
        const { data: chaves } = await supabase.from("catalogo_chaves").select("sku, nome, preco, sigla, ativo").in("sku", ids)
        setAbChaves(chaves ?? [])
        const skus = (chaves ?? []).map((c: any) => c.sku)
        if (skus.length > 0) {
          supabase.from("catalogo_imagens_produto").select("*").eq("produto_tipo", "chave").in("produto_sku", skus)
            .then(({ data: imgs }) => {
              const map = new Map<string, any[]>()
              ;(imgs ?? []).forEach((img: any) => { const arr = map.get(img.produto_sku) ?? []; arr.push(img); map.set(img.produto_sku, arr) })
              setAbChavesImagens(map)
            })
        }
      }).catch((e) => console.error("Erro chaves:", e))
    Promise.resolve(
      supabase.from("catalogo_abutment_parafusos").select("parafuso_sku").eq("abutment_sku", sku)
    )
      .then(async ({ data, error }) => {
        if (error) { console.error("Erro parafusos:", error); return }
        const skus = (data ?? []).map((r: any) => r.parafuso_sku)
        if (skus.length === 0) { setAbParafusos([]); return }
        const { data: parafusos } = await supabase.from("catalogo_parafusos").select("sku, nome, preco, ativo").in("sku", skus)
        setAbParafusos(parafusos ?? [])
        if (skus.length > 0) {
          supabase.from("catalogo_imagens_produto").select("*").eq("produto_tipo", "parafuso").in("produto_sku", skus)
            .then(({ data: imgs }) => {
              const map = new Map<string, any[]>()
              ;(imgs ?? []).forEach((img: any) => { const arr = map.get(img.produto_sku) ?? []; arr.push(img); map.set(img.produto_sku, arr) })
              setAbParafusosImagens(map)
            })
        }
      }).catch((e) => console.error("Erro parafusos:", e))
    // Carregar kits via pivot + chave do abutment
    Promise.all([
      supabase.from("catalogo_abutment_kits").select("kit_sku").eq("abutment_sku", sku),
      supabase.from("catalogo_abutments").select("chave_id").eq("sku", sku).single(),
    ]).then(async ([{ data: pivotKits }, { data: abData }]) => {
      const pivotSkus = (pivotKits ?? []).map((r: any) => r.kit_sku)
      let kitSkus = pivotSkus
      if (kitSkus.length === 0 && abData?.chave_id) {
        const { data: kk } = await supabase.from("catalogo_kit_chaves").select("kit_sku").eq("chave_id", abData.chave_id)
        kitSkus = [...new Set((kk ?? []).map((r: any) => r.kit_sku))]
      }
      if (kitSkus.length === 0) { setKits([]); return }
      const { data: kitsData } = await supabase.from("catalogo_kits").select("*, tipo_kit:catalogo_tipos_kits(*)").in("sku", kitSkus).eq("ativo", true)
      setKits(kitsData ?? [])
    }).catch((e) => { console.error("Erro kits:", e); setKits([]) })
  }, [sku])
  const [activeTab, setActiveTab] = useState(search.tab === "sequencia" ? "sequencia" : "ficha")

  if (!ab) return <LoadingState />

  // ── Inativo: não renderiza ──
  if (!ab.ativo) return null

  const cor = ab.familia?.cor_identificacao ?? "#c9a655"
  const nome = `${ab.tipo_abutment?.nome ?? ""} ${ab.familia?.nome ?? ""}`
  const imageUrl = imagens?.[0]?.url_imagem ?? null

  // ── Filtra dados nulos/vazios ──
  const specs = [
    { label: "Plataforma", value: ab.diametro_plataforma_mm ? `${ab.diametro_plataforma_mm} mm` : null },
    { label: "Angulação", value: ab.angulacao_graus != null ? `${ab.angulacao_graus}°` : null },
    { label: "Transmucoso", value: ab.altura_transmucoso_mm != null ? `${ab.altura_transmucoso_mm} mm` : null },
    { label: "Altura Corpo", value: ab.altura_corpo_mm != null ? `${ab.altura_corpo_mm} mm` : null },
    { label: "Torque", value: ab.torque_ncm != null ? `${ab.torque_ncm} N·cm` : null },
  ].filter((s): s is { label: string; value: string } => s.value != null)
  // ── Filtra kits ativos ──
  const kitsAtivos = kits?.filter((k) => k.ativo) ?? []
  // ── Combina dados das pivots + colunas antigas FK ──
  const allChaves = abChaves.length > 0 ? abChaves : (ab.chave ? [ab.chave] : [])
  const allParafusos = abParafusos.length > 0 ? abParafusos : (ab.parafuso ? [ab.parafuso] : [])
  const abChavesAtivas = allChaves.filter((c: any) => c.ativo !== false)
  const abParafusosAtivos = allParafusos.filter((p: any) => p.ativo !== false)

  // ── Tabs ──
  const tabs: SectionTab[] = [
    { key: "ficha", label: "Ficha", count: specs.length },
    { key: "chaves", label: "Chaves", count: abChavesAtivas.length },
    { key: "parafusos", label: "Parafusos", count: abParafusosAtivos.length },
    { key: "sequencia", label: "Sequência", count: seqCount },
    { key: "kits", label: "Kits", count: kitsAtivos.length },
    { key: "compatibilidade", label: "Compatibilidade", count: implantesCompatAtivos.length },
  ]


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
      {/* Sidebar — Imagem + CTA */}
      <div className="lg:col-span-4 xl:col-span-5">
        <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-5">
          <ProductImage cor={cor} nome={nome} onClick={() => openImageViewer(imageUrl ?? "", nome)} imageUrl={imageUrl} />
          {/* Miniaturas */}
          {imagens && imagens.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagens.map((img) => (
                <button
                  key={img.id}
                  onClick={() => openImageViewer(img.url_imagem, nome)}
                  className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] transition-colors"
                >
                  <img src={img.url_imagem} alt="" className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="hidden lg:block">
            <AddButton tipo="abutment" sku={ab.sku} nome={nome} cor={cor} precoDB={ab.preco} qtdDisponivel={ab.qtd_disponivel} />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="lg:col-span-8 xl:col-span-7 space-y-6 sm:space-y-8">
        <ProductHeader cor={cor} badge={ab.familia?.nome} nome={nome} sku={ab.sku} qtdDisponivel={ab.qtd_disponivel} qtdMinimaAviso={ab.qtd_minima_aviso} />

        <div className="lg:hidden">
          <AddButton tipo="abutment" sku={ab.sku} nome={nome} cor={cor} precoDB={ab.preco} qtdDisponivel={ab.qtd_disponivel} />
        </div>

        {/* Tabs */}
        <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} renderIcon={(key) => { const I = getIcon(key); return <I className="w-5 h-5" /> }} />

        {/* ─── Ficha Técnica ─── */}
        {activeTab === "ficha" && (
          <div className="space-y-5 sm:space-y-6">
            {/* Breadcrumb hierárquico */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              <span>Componentes</span>
              {ab.familia?.nome && (
                <>
                  <span className="opacity-40">/</span>
                  <span>{ab.familia.nome}</span>
                </>
              )}
              {ab.tipo_abutment?.tipo_reabilitacao?.nome && (
                <>
                  <span className="opacity-40">/</span>
                  <span>{ab.tipo_abutment.tipo_reabilitacao.nome}</span>
                </>
              )}
              {ab.tipo_abutment?.nome && (
                <>
                  <span className="opacity-40">/</span>
                  <span>{ab.tipo_abutment.nome}</span>
                </>
              )}
            </div>

            {/* Descrição */}
            {ab.descricao && (
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-5">
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{ab.descricao}</p>
              </div>
            )}

            {/* Specs — só renderiza não nulos */}
            {specs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {specs.map((s) => (
                  <SpecCard key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Chaves ─── */}
        {activeTab === "chaves" && (
          <div className="space-y-2.5 sm:space-y-3">
            {abChavesAtivas.length > 0 ? abChavesAtivas.map((chave: any) => {
              const img = abChavesImagens.get(chave.sku)?.[0]?.url_imagem
              return (
                <RelatedProductCard
                  key={chave.sku}
                  nome={chave.nome}
                  sku={chave.sku}
                  cor={cor}
                  preco={chave.preco}
                  tipo="chave"
                  imageUrl={img}
                  onImageClick={() => openImageViewer(img ?? "", chave.nome)}
                  onVerFicha={async () => {
                    setFichaModal({ open: true, nome: chave.nome, sku: chave.sku, imagemUrl: img, tipo: "chave", preco: chave.preco, sections: [
                      { title: "Identificação", specs: [
                        { label: "SKU", value: chave.sku },
                        { label: "Nome", value: chave.nome },
                        { label: "Sigla", value: chave.sigla },
                        { label: "Descrição", value: chave.descricao },
                      ]},
                      { title: "Comercial", specs: [
                        { label: "Preço", value: chave.preco ? formatBRL(chave.preco) : null },
                      ]},
                    ] })
                    const kits = await listarKitsRelacionadosDeChave(chave.sku)
                    if (kits.length > 0) setFichaModal((p) => ({ ...p, vinculacoes: kits.map((k) => ({ nome: k.nome, sku: k.sku, valor: k.preco, tipo: "kit" as ProductSheetTipo })) }))
                  }}
                  fichaData={{ sigla: chave.sigla }}
                  qtdDisponivel={chave.qtd_disponivel}
                  qtdMinimaAviso={chave.qtd_minima_aviso}
                />
              )
            }) : <EmptyState msg="Nenhuma chave vinculada" hint="Vincule chaves na edição do abutment." />}
          </div>
        )}

        {/* ─── Parafusos ─── */}
        {activeTab === "parafusos" && (
          <div className="space-y-2.5 sm:space-y-3">
            {abParafusosAtivos.length > 0 ? abParafusosAtivos.map((parafuso: any) => {
              const img = abParafusosImagens.get(parafuso.sku)?.[0]?.url_imagem
              return (
                <RelatedProductCard
                  key={parafuso.sku}
                  nome={parafuso.nome}
                  sku={parafuso.sku}
                  cor={cor}
                  preco={Number(parafuso.preco) || 0}
                  tipo="parafuso"
                  imageUrl={img}
                  onImageClick={() => openImageViewer(img ?? "", parafuso.nome)}
                  onVerFicha={() => setFichaModal({ open: true, nome: parafuso.nome, sku: parafuso.sku, imagemUrl: img, tipo: "parafuso", preco: Number(parafuso.preco) || 0, sections: [
                    { title: "Identificação", specs: [
                      { label: "SKU", value: parafuso.sku },
                      { label: "Nome", value: parafuso.nome },
                      { label: "Descrição", value: parafuso.descricao },
                      { label: "Tipo", value: parafuso.tipo_parafuso?.nome },
                      { label: "Torque", value: parafuso.torque_ncm ? `${parafuso.torque_ncm} N.cm` : null },
                      { label: "Material", value: parafuso.material },
                    ]},
                    { title: "Comercial", specs: [
                      { label: "Preço", value: parafuso.preco ? formatBRL(parafuso.preco) : null },
                    ]},
                  ], vinculacoes: [
                    ...(parafuso.chave ? [{ nome: parafuso.chave.nome, sku: parafuso.chave.sku, valor: getPrecoFromDB(parafuso.chave.preco, "chave", parafuso.chave.sku), tipo: "chave" as ProductSheetTipo }] : []),
                  ] })}
                  fichaData={{ torque: parafuso.torque_ncm, material: parafuso.material }}
                  qtdDisponivel={parafuso.qtd_disponivel}
                  qtdMinimaAviso={parafuso.qtd_minima_aviso}
                />
              )
            }) : <EmptyState msg="Nenhum parafuso vinculado" hint="Vincule parafusos na edição do abutment." />}
          </div>
        )}
        {/* ─── Sequência Protética ─── */}
        {activeTab === "sequencia" && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            <Suspense fallback={null}>
              <SequenciaProtetica
                familiaId={ab.familia_id ?? ""}
                tipoAbutmentId={ab.tipo_abutment_id}
                familiaNome={ab.familia?.nome ?? ""}
                tipoAbutmentNome={ab.tipo_abutment?.nome ?? ""}
                abutmentSku={ab.sku}
              />
            </Suspense>
          </div>
        )}

        {/* ─── Kits ─── */}
        {activeTab === "kits" && (
          <div className="space-y-2.5 sm:space-y-3">
            {kitsAtivos.length > 0 ? (
              kitsAtivos.map((kit) => {
                const img = imagensKits?.get(kit.sku)?.[0]?.url_imagem
                return (
                <RelatedProductCard
                  key={kit.sku}
                  nome={kit.nome}
                  sku={kit.sku}
                  cor={cor}
                  preco={kit.preco}
                  tipo="kit"
                  imageUrl={img}
                  onImageClick={() => openImageViewer(img ?? "", kit.nome)}
                  onVerFicha={() => setFichaModal({ open: true, nome: kit.nome, sku: kit.sku, imagemUrl: img, tipo: "kit", preco: kit.preco, onVerCompleto: () => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "kit", sku: kit.sku } }), sections: [
                    { title: "Identificação", specs: [
                      { label: "SKU", value: kit.sku },
                      { label: "Nome", value: kit.nome },
                      { label: "Sigla", value: kit.sigla },
                      { label: "Descrição", value: kit.descricao },
                      { label: "Tipo", value: kit.tipo_kit?.nome },
                    ]},
                    { title: "Comercial", specs: [
                      { label: "Preço", value: kit.preco ? formatBRL(kit.preco) : null },
                    ]},
                  ] })}
                  fichaData={{ tipo: kit.tipo_kit?.nome }}
                  qtdDisponivel={kit.qtd_disponivel}
                  qtdMinimaAviso={kit.qtd_minima_aviso}
                >
                  {kit.tipo_kit?.nome && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      {kit.tipo_kit.nome}
                    </span>
                  )}
                </RelatedProductCard>
              )})
            ) : (
              <EmptyState msg="Nenhum kit disponível" hint="Nenhum kit com chaves em comum foi encontrado." />
            )}
          </div>
        )}

        {/* ─── Compatibilidade ─── */}
        {activeTab === "compatibilidade" && (
          <div className="space-y-5 sm:space-y-6">
            {implantesCompatPorLinha.size > 0 ? (
              [...implantesCompatPorLinha.entries()].map(([linhaId, grupo]) => {
                const isExpanded = expandedLinhasCompat.has(linhaId)
                return (
                <div key={linhaId} className="space-y-2.5 sm:space-y-3">
                  <button
                    type="button"
                    onClick={() => toggleLinhaCompat(linhaId)}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/60 hover:border-[var(--color-accent)]/40 transition-all"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                      {grupo.linha?.nome ?? "Linha não informada"}
                      {grupo.linha?.familia?.nome && <span className="opacity-60 normal-case font-normal"> · {grupo.linha.familia.nome}</span>}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                        {grupo.implantes.length}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {isExpanded && grupo.implantes.map((impl) => {
                    const img = imagensImplCompat?.get(impl.sku)?.[0]?.url_imagem
                    return (
                      <RelatedProductCard
                        key={impl.sku}
                        nome={impl.nome}
                        sku={impl.sku}
                        cor={cor}
                        preco={impl.preco}
                        tipo="implante"
                        imageUrl={img}
                        onImageClick={() => openImageViewer(img ?? "", impl.nome)}
                        onVerFicha={() => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "implante", sku: impl.sku } })}
                        fichaData={{ diametro: `${impl.diametro_mm}×${impl.comprimento_mm}mm` }}
                        qtdDisponivel={impl.qtd_disponivel}
                        qtdMinimaAviso={impl.qtd_minima_aviso}
                      />
                    )
                  })}
                </div>
                )
              })
            ) : (
              <EmptyState msg="Nenhum implante compatível vinculado" hint="Vincule implantes compatíveis na edição do abutment." />
            )}
          </div>
        )}
      </div>
      <Suspense fallback={null}>
        <FichaTecnicaModal open={fichaModal.open} onClose={() => setFichaModal({ ...fichaModal, open: false })} nome={fichaModal.nome} sku={fichaModal.sku} cor={cor} imagemUrl={fichaModal.imagemUrl} tipo={fichaModal.tipo} preco={fichaModal.preco} onVerCompleto={fichaModal.onVerCompleto} sections={fichaModal.sections} vinculacoes={fichaModal.vinculacoes} qtdDisponivel={fichaModal.qtdDisponivel} qtdMinimaAviso={fichaModal.qtdMinimaAviso} />
      </Suspense>
    </div>
  )
}

/* ─── Kit Detail ───────────────────────────────────────────────────── */

function KitDetail({ sku }: { sku: string }) {
  const { getIcon } = useTabIcons()
  const navigate = useNavigate()
  const { data: kit } = useKitDetalhe(sku)
  const { data: imagens } = useImagensProduto("kit", sku)
  const [activeTab, setActiveTab] = useState("ficha")
  const [compatData, setCompatData] = useState<any[]>([])
  const [relatedKits, setRelatedKits] = useState<any[]>([])
  const [complementKits, setComplementKits] = useState<any[]>([])
  const { data: relatedImagens } = useImagensBatch("kit", relatedKits.map((k) => k.sku))
  const { data: complementImagens } = useImagensBatch("kit", complementKits.map((k) => k.sku))
  const [fichaModal, setFichaModal] = useState<{ open: boolean; nome: string; sku: string; imagemUrl?: string | null; tipo?: ProductSheetTipo; preco?: number | null; onVerCompleto?: () => void; sections: Array<{ title: string; specs: Array<{ label: string; value: string | number | null | undefined }> }>; vinculacoes?: Array<{ nome: string; sku: string; valor?: number | null; tipo?: ProductSheetTipo }>; qtdDisponivel?: number | null; qtdMinimaAviso?: number | null }>({ open: false, nome: "", sku: "", sections: [] })

  // Buscar dados de compatibilidade e relacionados
  useEffect(() => {
    if (!kit?.sku) return

    // Compatibilidade: buscar sentinela "todos_diametros" E implantes específicos separadamente
    Promise.all([
      supabase.from("catalogo_kit_implantes").select("implante_sku, todos_diametros").eq("kit_sku", sku),
      supabase.from("catalogo_kit_implantes").select("implante_sku, implante:catalogo_implantes(sku, nome, preco, ativo, linha:catalogo_ips_linhas(*, familia:catalogo_ips_familias(*)))").eq("kit_sku", sku).neq("implante_sku", "*"),
    ]).then(([{ data: allRows }, { data: specificRows }]) => {
      const isAll = (allRows ?? []).some((r: any) => r.todos_diametros || r.implante_sku === "*")
      if (isAll) {
        // Buscar todos os implantes ativos
        supabase.from("catalogo_implantes").select("sku, nome, preco, ativo, linha:catalogo_ips_linhas(*, familia:catalogo_ips_familias(*))").eq("ativo", true).order("nome")
          .then(({ data: allImpls }) => {
            const wrapped = (allImpls ?? []).map((impl: any) => ({ implante_sku: impl.sku, todos_diametros: true, implante: impl }))
            setCompatData(wrapped)
          })
      } else {
        setCompatData(specificRows ?? [])
      }
    })

    // Kits relacionados: vínculo explícito (catalogo_kit_kits_relacionados) + kits que compartilham chaves
    Promise.all([
      supabase.from("catalogo_kit_kits_relacionados").select("relacionado_sku").eq("kit_sku", sku),
      supabase.from("catalogo_kit_chaves").select("chave_id").eq("kit_sku", sku),
    ]).then(async ([{ data: relacionados }, { data: chaves }]) => {
      const explicitSkus = (relacionados ?? []).map((r) => r.relacionado_sku)
      let sharedSkus: string[] = []
      if (chaves && chaves.length > 0) {
        const chaveIds = chaves.map((c) => c.chave_id)
        const { data: otherKits } = await supabase.from("catalogo_kit_chaves").select("kit_sku").in("chave_id", chaveIds).neq("kit_sku", sku)
        sharedSkus = (otherKits ?? []).map((k) => k.kit_sku)
      }
      const uniqueSkus = [...new Set([...explicitSkus, ...sharedSkus])]
      if (uniqueSkus.length === 0) { setRelatedKits([]); return }
      const { data: kitsData } = await supabase.from("catalogo_kits").select("sku, nome, preco, tipo_kit:catalogo_tipos_kits(nome)").in("sku", uniqueSkus).eq("ativo", true)
      setRelatedKits(kitsData ?? [])
    })

    // Kits complementares: vínculo explícito (catalogo_kit_kits_complementares) + kits que compartilham fresas
    Promise.all([
      supabase.from("catalogo_kit_kits_complementares").select("complementar_sku").eq("kit_sku", sku),
      supabase.from("catalogo_kit_fresas").select("fresa_id").eq("kit_sku", sku),
    ]).then(async ([{ data: complementares }, { data: fresas }]) => {
      const explicitSkus = (complementares ?? []).map((c) => c.complementar_sku)
      let sharedSkus: string[] = []
      if (fresas && fresas.length > 0) {
        const fresaIds = fresas.map((f) => f.fresa_id)
        const { data: otherKits } = await supabase.from("catalogo_kit_fresas").select("kit_sku").in("fresa_id", fresaIds).neq("kit_sku", sku)
        sharedSkus = (otherKits ?? []).map((k) => k.kit_sku)
      }
      const uniqueSkus = [...new Set([...explicitSkus, ...sharedSkus])]
      if (uniqueSkus.length === 0) { setComplementKits([]); return }
      const { data: kitsData } = await supabase.from("catalogo_kits").select("sku, nome, preco, tipo_kit:catalogo_tipos_kits(nome)").in("sku", uniqueSkus).eq("ativo", true)
      setComplementKits(kitsData ?? [])
    })
  }, [kit?.sku])

  // ── Compatibilidade agrupada por linha (accordion — só a primeira linha nasce expandida) ──
  const compatAtivos = compatData.filter((c: any) => c.implante?.ativo !== false && c.implante)
  const compatPorLinha = new Map<string, { linha: any; implantes: any[] }>()
  for (const c of compatAtivos) {
    const linhaId = c.implante.linha_id ?? "sem-linha"
    if (!compatPorLinha.has(linhaId)) compatPorLinha.set(linhaId, { linha: c.implante.linha, implantes: [] })
    compatPorLinha.get(linhaId)!.implantes.push(c.implante)
  }
  const { data: imagensCompatImpl } = useImagensBatch("implante", compatAtivos.map((c) => c.implante.sku))
  const compatLinhasKey = [...compatPorLinha.keys()].join("|")
  const [expandedLinhasKit, setExpandedLinhasKit] = useState<Set<string>>(new Set())
  useEffect(() => {
    const primeira = [...compatPorLinha.keys()][0]
    setExpandedLinhasKit(new Set(primeira ? [primeira] : []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compatLinhasKey])
  function toggleLinhaKit(linhaId: string) {
    setExpandedLinhasKit((prev) => {
      const next = new Set(prev)
      if (next.has(linhaId)) next.delete(linhaId)
      else next.add(linhaId)
      return next
    })
  }

  if (!kit) return <LoadingState />

  // ── Inativo: não renderiza ──
  if (!kit.ativo) return null

  const cor = "#c9a655"
  const nome = kit.nome
  const imageUrl = imagens?.[0]?.url_imagem ?? null

  // ── Specs da ficha técnica ──
  const specs: Array<{ label: string; value: string }> = [
    { label: "Nome do Kit", value: kit.nome },
    kit.tipo_kit?.nome ? { label: "Tipo", value: kit.tipo_kit.nome } : null,
    { label: "SKU", value: kit.sku },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  // ── Filtra itens inativos do BOM ──
  const qtds = (kit as any)._quantidades as Record<string, number> | undefined
  const rawBom: Record<string, unknown>[] = [
    ...(kit.chaves ?? []).map((c) => ({ chave: c, chave_sku: c.sku, quantidade: qtds?.[c.sku] ?? 1 })),
    ...(kit.fresas ?? []).map((f) => ({ fresa: f, fresa_sku: f.sku, quantidade: qtds?.[f.sku] ?? 1 })),
    ...(kit.complementares ?? []).map((c) => ({ acessorio: c, acessorio_sku: c.sku, quantidade: qtds?.[c.sku] ?? 1 })),
    ...(kit.opcionais ?? []).map((o) => ({ acessorio: o, acessorio_sku: o.sku, quantidade: qtds?.[o.sku] ?? 1 })),
  ]
  const bomItems = rawBom
    .filter((item) => {
      const related = item.fresa ?? item.chave ?? item.acessorio ?? item.instrumental ?? item.implante
      if (related && typeof related === "object" && "ativo" in (related as Record<string, unknown>)) {
        return (related as Record<string, unknown>).ativo !== false
      }
      return true
    })
    .map((item) => resolveBOMItem(item as Parameters<typeof resolveBOMItem>[0]))
    .filter(Boolean) as { tipo: string; sku: string; nome: string; quantidade: number; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null }[]

  // ── Verificar se é "todos os diâmetros" ──
  const isAllDiametros = compatData.some((d: any) => d.todos_diametros)

  const tabs: SectionTab[] = [
    { key: "ficha", label: "Ficha", count: specs.length },
    { key: "composicao", label: "Composição", count: bomItems.length },
    { key: "compatibilidade", label: "Compatibilidade", count: isAllDiametros ? 1 : compatData.length },
    { key: "relacionados", label: "Relacionados", count: relatedKits.length },
    { key: "complementares", label: "Complementares", count: complementKits.length },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
      {/* Sidebar — Imagem + CTA */}
      <div className="lg:col-span-4 xl:col-span-5">
        <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-5">
          <ProductImage cor={cor} nome={nome} onClick={() => openImageViewer(imageUrl ?? "", nome)} imageUrl={imageUrl} />
          {/* Miniaturas */}
          {imagens && imagens.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagens.map((img) => (
                <button
                  key={img.id}
                  onClick={() => openImageViewer(img.url_imagem, nome)}
                  className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] transition-colors"
                >
                  <img src={img.url_imagem} alt="" className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="hidden lg:block">
            <AddButton tipo="kit" sku={kit.sku} nome={nome} cor={cor} precoDB={kit.preco} qtdDisponivel={kit.qtd_disponivel} />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="lg:col-span-8 xl:col-span-7 space-y-6 sm:space-y-8">
        <ProductHeader cor={cor} badge={kit.tipo_kit?.nome} nome={nome} sku={kit.sku} qtdDisponivel={kit.qtd_disponivel} qtdMinimaAviso={kit.qtd_minima_aviso} />

        <div className="lg:hidden">
          <AddButton tipo="kit" sku={kit.sku} nome={nome} cor={cor} precoDB={kit.preco} qtdDisponivel={kit.qtd_disponivel} />
        </div>

        {/* Tabs */}
        <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} renderIcon={(key) => { const I = getIcon(key); return <I className="w-5 h-5" /> }} />

        {/* ─── Ficha Técnica ─── */}
        {activeTab === "ficha" && (
          <div className="space-y-5 sm:space-y-6">
            {/* Breadcrumb hierárquico */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              <span>Kits</span>
              {kit.tipo_kit?.nome && (
                <>
                  <span className="opacity-40">/</span>
                  <span>{kit.tipo_kit.nome}</span>
                </>
              )}
              {kit.nome && (
                <>
                  <span className="opacity-40">/</span>
                  <span>{kit.nome}</span>
                </>
              )}
            </div>

            {/* Descrição */}
            {kit.descricao && (
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-5">
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{kit.descricao}</p>
              </div>
            )}

            {/* Specs — só renderiza não nulos */}
            {specs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {specs.map((s) => (
                  <SpecCard key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            ) : (
              <EmptyState msg="Nenhuma especificação cadastrada" hint="Preencha os dados técnicos na edição do kit." />
            )}
            <button
              onClick={() => setFichaModal({ open: true, nome: kit.nome, sku: kit.sku, imagemUrl: imageUrl, tipo: "kit", preco: kit.preco, sections: [
                { title: "Identificação", specs: [
                  { label: "SKU", value: kit.sku },
                  { label: "Nome", value: kit.nome },
                  { label: "Sigla", value: kit.sigla },
                  { label: "Descrição", value: kit.descricao },
                  { label: "Tipo", value: kit.tipo_kit?.nome },
                ]},
                { title: "Comercial", specs: [
                  { label: "Preço", value: kit.preco ? formatBRL(kit.preco) : null },
                ]},
              ] })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)]/60 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Ver Ficha Completa
            </button>
          </div>
        )}

        {/* ─── Composição ─── */}
        {activeTab === "composicao" && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            {bomItems.length > 0 ? (
              <Suspense fallback={null}>
                <BomTable items={bomItems} />
              </Suspense>
            ) : (
              <EmptyState msg="Nenhum item na composição" hint="Adicione itens à composição na edição do kit." />
            )}
          </div>
        )}

        {/* ─── Compatibilidade ─── */}
        {activeTab === "compatibilidade" && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            {isAllDiametros ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c9a655]/10 mb-4">
                  <Check className="h-8 w-8 text-[#c9a655]" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Compatível com todos os diâmetros</h3>
                <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                  Este kit é compatível com <strong className="text-[#c9a655]">todos os diâmetros e linhas</strong> de implantes desta empresa.
                </p>
              </div>
            ) : compatPorLinha.size > 0 ? (
              <div className="space-y-2.5 sm:space-y-3">
                {[...compatPorLinha.entries()].map(([linhaId, grupo]) => {
                  const isExpanded = expandedLinhasKit.has(linhaId)
                  return (
                    <div key={linhaId} className="space-y-2.5 sm:space-y-3">
                      <button
                        type="button"
                        onClick={() => toggleLinhaKit(linhaId)}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/60 hover:border-[#c9a655]/40 transition-all"
                      >
                        <span className="text-xs font-black uppercase tracking-widest text-white">
                          {grupo.linha?.nome ?? "Linha não informada"}
                          {grupo.linha?.familia?.nome && <span className="opacity-60 normal-case font-normal"> · {grupo.linha.familia.nome}</span>}
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#c9a655]/15 text-[#c9a655]">
                            {grupo.implantes.length}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </span>
                      </button>
                      {isExpanded && grupo.implantes.map((impl: any) => {
                        const img = imagensCompatImpl?.get(impl.sku)?.[0]?.url_imagem
                        return (
                          <RelatedProductCard
                            key={impl.sku}
                            nome={impl.nome ?? impl.sku}
                            sku={impl.sku}
                            cor="#c9a655"
                            preco={impl.preco}
                            tipo="implante"
                            imageUrl={img}
                            onImageClick={() => openImageViewer(img ?? "", impl.nome ?? impl.sku)}
                            onVerFicha={() => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "implante", sku: impl.sku } })}
                            fichaData={{ tipo: "Implante" }}
                            qtdDisponivel={impl.qtd_disponivel}
                            qtdMinimaAviso={impl.qtd_minima_aviso}
                          />
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState msg="Nenhuma compatibilidade definida" hint="Associe implantes na edição do kit." />
            )}
          </div>
        )}

        {/* ─── Relacionados ─── */}
        {activeTab === "relacionados" && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            {relatedKits.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Kits Relacionados</h3>
                <p className="text-xs text-gray-400">Kits que compartilham as mesmas chaves compatíveis.</p>
                <div className="grid grid-cols-1 gap-3">
                  {relatedKits.map((rk: any) => {
                    const img = relatedImagens?.get(rk.sku)?.[0]?.url_imagem ?? null
                    return (
                      <RelatedProductCard
                        key={rk.sku}
                        nome={rk.nome}
                        sku={rk.sku}
                        cor="#c9a655"
                        preco={rk.preco}
                        tipo="kit"
                        imageUrl={img}
                        onImageClick={() => openImageViewer(img ?? "", rk.nome ?? rk.sku)}
                        onVerFicha={() => setFichaModal({
                          open: true,
                          nome: rk.nome,
                          sku: rk.sku,
                          imagemUrl: img,
                          tipo: "kit",
                          preco: rk.preco,
                          onVerCompleto: () => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "kit", sku: rk.sku } }),
                          sections: [
                            { title: "Identificação", specs: [
                              { label: "SKU", value: rk.sku },
                              { label: "Nome", value: rk.nome },
                              { label: "Tipo", value: rk.tipo_kit?.nome },
                            ]},
                            { title: "Comercial", specs: [
                              { label: "Preço", value: rk.preco ? formatBRL(rk.preco) : null },
                            ]},
                          ],
                        })}
                        fichaData={{ tipo: rk.tipo_kit?.nome ?? "Kit" }}
                        qtdDisponivel={rk.qtd_disponivel}
                        qtdMinimaAviso={rk.qtd_minima_aviso}
                      >
                        {rk.tipo_kit?.nome && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#c9a655]/10 text-[#c9a655]">
                            {rk.tipo_kit.nome}
                          </span>
                        )}
                      </RelatedProductCard>
                    )
                  })}
                </div>
              </div>
            ) : (
              <EmptyState msg="Nenhum kit relacionado" hint="Kits que compartilham chaves aparecerão aqui." />
            )}
          </div>
        )}

        {/* ─── Complementares ─── */}
        {activeTab === "complementares" && (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            {complementKits.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Kits Complementares</h3>
                <p className="text-xs text-gray-400">Kits que compartilham as mesmas fresas compatíveis.</p>
                <div className="grid grid-cols-1 gap-3">
                  {complementKits.map((ck: any) => {
                    const img = complementImagens?.get(ck.sku)?.[0]?.url_imagem ?? null
                    return (
                      <RelatedProductCard
                        key={ck.sku}
                        nome={ck.nome}
                        sku={ck.sku}
                        cor="#c9a655"
                        preco={ck.preco}
                        tipo="kit"
                        imageUrl={img}
                        onImageClick={() => openImageViewer(img ?? "", ck.nome ?? ck.sku)}
                        onVerFicha={() => setFichaModal({
                          open: true,
                          nome: ck.nome,
                          sku: ck.sku,
                          imagemUrl: img,
                          tipo: "kit",
                          preco: ck.preco,
                          onVerCompleto: () => navigate({ to: "/catalogo/produto/$tipo/$sku", params: { tipo: "kit", sku: ck.sku } }),
                          sections: [
                            { title: "Identificação", specs: [
                              { label: "SKU", value: ck.sku },
                              { label: "Nome", value: ck.nome },
                              { label: "Tipo", value: ck.tipo_kit?.nome },
                            ]},
                            { title: "Comercial", specs: [
                              { label: "Preço", value: ck.preco ? formatBRL(ck.preco) : null },
                            ]},
                          ],
                        })}
                        fichaData={{ tipo: ck.tipo_kit?.nome ?? "Kit" }}
                        qtdDisponivel={ck.qtd_disponivel}
                        qtdMinimaAviso={ck.qtd_minima_aviso}
                      >
                        {ck.tipo_kit?.nome && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#c9a655]/10 text-[#c9a655]">
                            {ck.tipo_kit.nome}
                          </span>
                        )}
                      </RelatedProductCard>
                    )
                  })}
                </div>
              </div>
            ) : (
              <EmptyState msg="Nenhum kit complementar" hint="Kits que compartilham fresas aparecerão aqui." />
            )}
          </div>
        )}
      </div>
      <Suspense fallback={null}>
        <FichaTecnicaModal
          open={fichaModal.open}
          onClose={() => setFichaModal((p) => ({ ...p, open: false }))}
          nome={fichaModal.nome}
          sku={fichaModal.sku}
          cor={cor}
          imagemUrl={fichaModal.imagemUrl}
          tipo={fichaModal.tipo}
          preco={fichaModal.preco}
          onVerCompleto={fichaModal.onVerCompleto}
          sections={fichaModal.sections}
          vinculacoes={fichaModal.vinculacoes}
          composicao={fichaModal.sku === kit.sku ? bomItems.map((item) => ({ nome: item.nome, quantidade: item.quantidade, sku: item.sku, tipo: item.tipo as ProductSheetTipo, preco: getPrecoFromDB(item.preco, item.tipo as ProductSheetTipo, item.sku) })) : undefined}
          qtdDisponivel={fichaModal.qtdDisponivel}
          qtdMinimaAviso={fichaModal.qtdMinimaAviso}
        />
      </Suspense>
    </div>
  )
}

/* ─── Promocional Detail ───────────────────────────────────────────── */

const TIPO_NOME_MAP: Record<string, string> = {
  implante: "Implante",
  abutment: "Abutment",
  fresa: "Fresa",
  chave: "Chave",
  acessorio: "Acessório",
  instrumental: "Instrumental",
  kit: "Kit",
  componente: "Componente",
  parafuso: "Parafuso",
  cicatrizador: "Cicatrizador",
  complementar: "Complementar",
  opcional: "Opcional",
}

/** Campos técnicos conhecidos entre as tabelas de produto — usados para enriquecer a Ficha Técnica dos itens de um pacote promocional. Preço fica de fora de propósito (item de pacote fechado não é vendido separadamente). */
const CAMPOS_SPEC_ITEM: Array<{ campo: string; label: string; unidade?: string }> = [
  { campo: "sigla", label: "Sigla" },
  { campo: "material", label: "Material" },
  { campo: "superficie", label: "Superfície" },
  { campo: "macrogeometria", label: "Macrogeometria" },
  { campo: "diametro_mm", label: "Diâmetro", unidade: "mm" },
  { campo: "diametro_plataforma_mm", label: "Diâmetro Plataforma", unidade: "mm" },
  { campo: "diametro_plataforma", label: "Diâmetro Plataforma", unidade: "mm" },
  { campo: "comprimento_mm", label: "Comprimento", unidade: "mm" },
  { campo: "comprimento", label: "Comprimento", unidade: "mm" },
  { campo: "altura_transmucoso_mm", label: "Altura Transmucoso", unidade: "mm" },
  { campo: "altura_transmucoso", label: "Altura Transmucoso", unidade: "mm" },
  { campo: "altura_corpo_mm", label: "Altura Corpo", unidade: "mm" },
  { campo: "altura_corpo", label: "Altura Corpo", unidade: "mm" },
  { campo: "angulacao_graus", label: "Angulação", unidade: "°" },
  { campo: "torque_ncm", label: "Torque", unidade: "Ncm" },
  { campo: "torque_insercao", label: "Torque de Inserção", unidade: "Ncm" },
  { campo: "rosca_interna", label: "Rosca Interna" },
  { campo: "regiao_apical", label: "Região Apical" },
  { campo: "regiao_cervical", label: "Região Cervical" },
  { campo: "tipo_travamento", label: "Tipo de Travamento" },
  { campo: "descricao", label: "Descrição" },
]

function extrairSpecsProduto(row: Record<string, unknown> | undefined): { label: string; value: string | number }[] {
  if (!row) return []
  const specs: { label: string; value: string | number }[] = []
  for (const { campo, label, unidade } of CAMPOS_SPEC_ITEM) {
    const valor = row[campo]
    if (valor === null || valor === undefined || valor === "") continue
    // Campos com unidade física (mm, °, Ncm) em 0 são dado de seed sem medida real, não uma medida de verdade — omitir.
    if (unidade && Number(valor) === 0) continue
    specs.push({ label, value: unidade ? `${valor} ${unidade}` : String(valor) })
  }
  return specs
}

function PromocionalDetail({ id }: { id: string }) {
  const { getIcon } = useTabIcons()
  const { data: promo } = usePromocionalDetalhe(id)
  const { data: imagensPromo } = useImagensBatch("promocional", [id])
  const [activeTab, setActiveTab] = useState("ficha")
  const [fichaModal, setFichaModal] = useState<{ open: boolean; nome: string; sku: string; imagemUrl?: string | null; tipo?: ProductSheetTipo; sections: Array<{ title: string; specs: Array<{ label: string; value: string | number | null | undefined }> }>; qtdDisponivel?: number | null; qtdMinimaAviso?: number | null }>({ open: false, nome: "", sku: "", sections: [] })

  const itens = promo?.itens ?? []
  const skusByTipo = itens.reduce((acc, item) => {
    if (!acc[item.tipo]) acc[item.tipo] = []
    acc[item.tipo].push(item.sku)
    return acc
  }, {} as Record<string, string[]>)
  const { data: imgImplante } = useImagensBatch("implante", skusByTipo["implante"] ?? [])
  const { data: imgAbutment } = useImagensBatch("abutment", skusByTipo["abutment"] ?? [])
  const { data: imgKit } = useImagensBatch("kit", skusByTipo["kit"] ?? [])
  const { data: imgParafuso } = useImagensBatch("parafuso", skusByTipo["parafuso"] ?? [])
  const { data: imgCicatrizador } = useImagensBatch("cicatrizador", skusByTipo["cicatrizador"] ?? [])
  const { data: imgChave } = useImagensBatch("chave", skusByTipo["chave"] ?? [])
  const { data: imgFresa } = useImagensBatch("fresa", skusByTipo["fresa"] ?? [])
  const { data: imgComplementar } = useImagensBatch("complementar", skusByTipo["complementar"] ?? [])
  const { data: imgOpcional } = useImagensBatch("opcional", skusByTipo["opcional"] ?? [])
  const { data: imgComponente } = useImagensBatch("componente", skusByTipo["componente"] ?? [])

  const { data: detImplante } = useItensPromocionalDetalhado("implante", skusByTipo["implante"] ?? [])
  const { data: detAbutment } = useItensPromocionalDetalhado("abutment", skusByTipo["abutment"] ?? [])
  const { data: detKit } = useItensPromocionalDetalhado("kit", skusByTipo["kit"] ?? [])
  const { data: detParafuso } = useItensPromocionalDetalhado("parafuso", skusByTipo["parafuso"] ?? [])
  const { data: detCicatrizador } = useItensPromocionalDetalhado("cicatrizador", skusByTipo["cicatrizador"] ?? [])
  const { data: detChave } = useItensPromocionalDetalhado("chave", skusByTipo["chave"] ?? [])
  const { data: detFresa } = useItensPromocionalDetalhado("fresa", skusByTipo["fresa"] ?? [])
  const { data: detComplementar } = useItensPromocionalDetalhado("complementar", skusByTipo["complementar"] ?? [])
  const { data: detOpcional } = useItensPromocionalDetalhado("opcional", skusByTipo["opcional"] ?? [])
  const { data: detComponente } = useItensPromocionalDetalhado("componente", skusByTipo["componente"] ?? [])

  if (!promo) return <LoadingState />

  if (!promo.ativo) return null

  const imagemUrl = imagensPromo?.get(id)?.[0]?.url_imagem

  const imagensPorTipo: Record<string, Map<string, { url_imagem: string }[]> | undefined> = {
    implante: imgImplante, abutment: imgAbutment, kit: imgKit, parafuso: imgParafuso,
    cicatrizador: imgCicatrizador, chave: imgChave, fresa: imgFresa,
    complementar: imgComplementar, opcional: imgOpcional, componente: imgComponente,
  }
  const getImagemItem = (tipo: string, sku: string) => imagensPorTipo[tipo]?.get(sku)?.[0]?.url_imagem

  const detalhesPorTipo: Record<string, Map<string, Record<string, unknown>> | undefined> = {
    implante: detImplante, abutment: detAbutment, kit: detKit, parafuso: detParafuso,
    cicatrizador: detCicatrizador, chave: detChave, fresa: detFresa,
    complementar: detComplementar, opcional: detOpcional, componente: detComponente,
  }
  const getDetalheItem = (tipo: string, sku: string) => detalhesPorTipo[tipo]?.get(sku)

  const itensResolvidos = itens.map((item) => {
    const preco = mockPreco(item.tipo as ProductSheetTipo, item.sku)
    const nomeTipo = TIPO_NOME_MAP[item.tipo] ?? item.tipo
    const detalhe = getDetalheItem(item.tipo, item.sku)
    const nomeReal = detalhe?.nome as string | undefined
    return {
      ...item,
      precoResolvido: preco,
      nomeResolvido: nomeReal ?? `${nomeTipo} — ${item.sku}`,
      imagemUrl: getImagemItem(item.tipo, item.sku),
      specs: extrairSpecsProduto(detalhe),
      qtdDisponivel: (detalhe as Record<string, unknown>)?.qtd_disponivel as number | null,
      qtdMinimaAviso: (detalhe as Record<string, unknown>)?.qtd_minima_aviso as number | null,
    }
  })
  const totalItens = itensResolvidos.reduce((acc, i) => acc + i.precoResolvido, 0)
  const economia = totalItens - promo.preco
  const percentualEconomia = totalItens > 0 ? Math.round((economia / totalItens) * 100) : 0

  const cor = "#c9a655"

  const tipoColor = (tipo: string) => {
    switch (tipo) {
      case "implante": return "#c9a655"
      case "abutment": return "#8b5cf6"
      case "fresa": return "#3b82f6"
      case "chave": return "#eab308"
      case "acessorio": return "#22c55e"
      case "instrumental": return "#f43f5e"
      default: return "#94a3b8"
    }
  }

  const tabs: SectionTab[] = [
    { key: "ficha", label: "Ficha", count: 3 },
    { key: "itens", label: "Itens", count: itensResolvidos.length },
  ]

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
      {/* Sidebar — Imagem + CTA */}
      <div className="lg:col-span-4 xl:col-span-5">
        <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-5">
          <ProductImage cor={cor} nome={promo.nome} imageUrl={imagemUrl} onClick={() => openImageViewer(imagemUrl ?? "", promo.nome)} />
          <div className="hidden lg:block">
            <AddButton tipo={"promocional" as ProductSheetTipo} sku={promo.id} nome={promo.nome} cor={cor} precoDB={promo.preco} qtdDisponivel={(promo as unknown as Record<string, unknown>).qtd_disponivel as number} />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="lg:col-span-8 xl:col-span-7 space-y-6 sm:space-y-8">
        <ProductHeader cor={cor} badge="Oferta Especial" nome={promo.nome} qtdDisponivel={(promo as unknown as Record<string, unknown>).qtd_disponivel as number} qtdMinimaAviso={(promo as unknown as Record<string, unknown>).qtd_minima_aviso as number} />

        <div className="lg:hidden">
          <AddButton tipo={"promocional" as ProductSheetTipo} sku={promo.id} nome={promo.nome} cor={cor} precoDB={promo.preco} qtdDisponivel={(promo as unknown as Record<string, unknown>).qtd_disponivel as number} />
        </div>

        {/* Tabs */}
        <SectionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} renderIcon={(key) => { const I = getIcon(key); return <I className="w-5 h-5" /> }} />

        {/* ─── Ficha Técnica ─── */}
        {activeTab === "ficha" && (
          <div className="space-y-5 sm:space-y-6">
            {/* Breadcrumb hierárquico */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              <span>Promocionais</span>
              {promo.nome && (
                <>
                  <span className="opacity-40">/</span>
                  <span>{promo.nome}</span>
                </>
              )}
            </div>

            {promo.descricao && (
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 p-4 sm:p-5">
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{promo.descricao}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <SpecCard label="Preço Original" value={formatBRL(totalItens)} />
              <SpecCard label="Preço Promocional" value={formatBRL(promo.preco)} />
              <SpecCard label="Economia" value={economia > 0 ? `${percentualEconomia}%` : "—"} />
            </div>
          </div>
        )}

        {/* ─── Itens do Pacote ─── */}
        {activeTab === "itens" && (
          <div className="space-y-3">
            {itensResolvidos.length > 0 ? (
              itensResolvidos.map((item, idx) => (
                <RelatedProductCard
                  key={item.id ?? idx}
                  nome={item.nomeResolvido}
                  sku={item.sku}
                  cor={tipoColor(item.tipo)}
                  tipo={item.tipo as ProductSheetTipo}
                  imageUrl={item.imagemUrl}
                  onImageClick={() => openImageViewer(item.imagemUrl ?? "", item.nomeResolvido)}
                  fichaData={{ tipo: TIPO_NOME_MAP[item.tipo] ?? item.tipo }}
                  qtdDisponivel={item.qtdDisponivel}
                  qtdMinimaAviso={item.qtdMinimaAviso}
                  onVerFicha={() => setFichaModal({
                    open: true,
                    nome: item.nomeResolvido,
                    sku: item.sku,
                    imagemUrl: item.imagemUrl,
                    tipo: item.tipo as ProductSheetTipo,
                    sections: [
                      { title: "Identificação", specs: [
                        { label: "SKU", value: item.sku },
                        { label: "Nome", value: item.nomeResolvido },
                        { label: "Tipo", value: TIPO_NOME_MAP[item.tipo] ?? item.tipo },
                      ]},
                      ...(item.specs.length > 0 ? [{ title: "Especificações Técnicas", specs: item.specs }] : []),
                    ],
                  })}
                >
                  {/* Item de pacote fechado — sem preço/Add individual: só vende junto */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    {TIPO_NOME_MAP[item.tipo] ?? item.tipo}
                  </span>
                </RelatedProductCard>
              ))
            ) : (
              <EmptyState msg="Nenhum item neste pacote" hint="Adicione itens ao pacote na edição." />
            )}
          </div>
        )}
      </div>
    </div>
    <Suspense fallback={null}>
      <FichaTecnicaModal
        open={fichaModal.open}
        onClose={() => setFichaModal((p) => ({ ...p, open: false }))}
        nome={fichaModal.nome}
        sku={fichaModal.sku}
        cor={cor}
        imagemUrl={fichaModal.imagemUrl}
        tipo={fichaModal.tipo}
        sections={fichaModal.sections}
        qtdDisponivel={fichaModal.qtdDisponivel}
        qtdMinimaAviso={fichaModal.qtdMinimaAviso}
      />
    </Suspense>
    </>
  )
}

/* ─── Loading State ────────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
      <div className="lg:col-span-4 xl:col-span-5">
        <div className="aspect-square rounded-2xl bg-[var(--color-surface)]/50 border border-[var(--color-border-subtle)] animate-pulse" />
      </div>
      <div className="lg:col-span-8 xl:col-span-7 space-y-5 sm:space-y-6">
        <div className="h-4 w-24 rounded-full bg-[var(--color-surface)]/50 animate-pulse" />
        <div className="h-8 sm:h-10 w-48 sm:w-64 rounded-lg bg-[var(--color-surface)]/50 animate-pulse" />
        <div className="h-4 w-40 sm:w-48 rounded bg-[var(--color-surface)]/50 animate-pulse" />
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-6 sm:mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 sm:h-20 rounded-xl bg-[var(--color-surface)]/50 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
