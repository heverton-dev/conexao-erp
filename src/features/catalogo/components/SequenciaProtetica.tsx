import { supabase } from "~/lib/supabase"
import { useState, useEffect, useMemo } from "react"
import toast from "react-hot-toast"
import { Check, Box, ShoppingCart, FileText, ChevronDown, PackageX } from "lucide-react"
import { addToCart, formatBRL, getPrecoFromDB } from "~/features/catalogo/services/carrinho.service"
import { playCoinSound } from "~/features/catalogo/services/audio.service"
import { EstoqueBadge } from "./admin/produtos/EstoqueBadge"
import { openImageViewer } from "~/features/catalogo/services/ui.service"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { useCatalogoConfig } from "~/features/catalogo/hooks/useCatalogo"
import { FichaTecnicaModal } from "./FichaTecnicaModal"
import type { ProductSheetTipo } from "~/features/catalogo/types"

interface SequenciaProteticaProps {
  familiaId: string
  tipoAbutmentId: string
  familiaNome: string
  tipoAbutmentNome: string
  abutmentSku?: string
}

interface CompItem { sku: string; nome: string; preco?: number; descricao?: string; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null; parafuso?: { sku: string; nome: string; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null; chave?: { sku: string; nome: string; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null; tipo_componente?: { nome: string } | null; tipo_abutment?: { nome: string } | null }

interface EtapaItem {
  id: string
  nome: string
  ordem: number
  componentes: CompItem[]
}

interface WorkflowGroup {
  id: string
  nome: string
  etapas: EtapaItem[]
}

export function SequenciaProtetica({ familiaId, tipoAbutmentId, familiaNome, tipoAbutmentNome, abutmentSku }: SequenciaProteticaProps) {
  const empresaId = useCatalogoEmpresaId()
  const [addedSkus, setAddedSkus] = useState<Set<string>>(new Set())
  const [workflows, setWorkflows] = useState<WorkflowGroup[]>([])
  const [selectedTab, setSelectedTab] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [imagensMap, setImagensMap] = useState<Map<string, string>>(new Map())
  const [fichaModal, setFichaModal] = useState<{ open: boolean; nome: string; sku: string; imagemUrl?: string | null; tipo?: ProductSheetTipo; preco?: number; sections: Array<{ title: string; specs: Array<{ label: string; value: string | number | null | undefined }> }>; vinculacoes?: Array<{ nome: string; sku: string; valor?: number | null; tipo?: ProductSheetTipo }> }>({ open: false, nome: "", sku: "", sections: [] })
  const { data: config } = useCatalogoConfig()
  const exibirEstoque = config?.exibir_estoque ?? true

  useEffect(() => {
    if (!abutmentSku || !empresaId) return
    setLoading(true)
    Promise.resolve(supabase.from("catalogo_seq_protetica_abutments").select("seq_id").eq("abutment_sku", abutmentSku))
      .then(async ({ data: pivots }) => {
        const seqIds = (pivots ?? []).map((r: { seq_id: string }) => r.seq_id)
        if (seqIds.length === 0) { setWorkflows([]); return }

        const [{ data: etapasData }, { data: etapaCompData }, { data: seqInfo }] = await Promise.all([
          supabase.from("catalogo_seq_protetica_etapas").select("seq_id, etapa_id, etapa:catalogo_cps_etapas_workflows(id, nome, ordem, tipo_workflow:catalogo_cps_tipos_workflows(nome))").in("seq_id", seqIds),
          supabase.from("catalogo_seq_protetica_etapa_componentes").select("seq_id, etapa_id, componente_sku, componente:catalogo_componentes(sku, nome, preco, descricao, qtd_disponivel, qtd_minima_aviso, parafuso:catalogo_parafusos(sku, nome, preco, qtd_disponivel, qtd_minima_aviso), chave:catalogo_chaves(sku, nome, preco, qtd_disponivel, qtd_minima_aviso), tipo_componente:catalogo_cps_tipos_componentes(nome), tipo_abutment:catalogo_cps_tipos_abutments(nome))").in("seq_id", seqIds),
          supabase.from("catalogo_seq_proteticas").select("id, nome").in("id", seqIds),
        ])

        // Montar grupos com etapas — usar NOME DA SEQUÊNCIA como nome do grupo
        const groups: Record<string, WorkflowGroup> = {}
        for (const s of seqInfo ?? []) {
          groups[s.id] = { id: s.id, nome: s.nome || "Sem nome", etapas: [] }
        }
        for (const e of etapasData ?? []) {
          const seqId = (e as { seq_id: string }).seq_id
          const etapa = (e as unknown as { etapa: { id: string; nome: string; ordem: number; tipo_workflow: { nome: string } | null } | null }).etapa
          if (!groups[seqId]) {
            const wfName = etapa?.tipo_workflow?.nome ?? "Workflow"
            groups[seqId] = { id: seqId, nome: wfName, etapas: [] }
          }
          groups[seqId].etapas.push({ id: etapa?.id ?? (e as { etapa_id: string }).etapa_id, nome: etapa?.nome ?? "", ordem: etapa?.ordem ?? 0, componentes: [] })
        }

        // Vincular componentes às etapas via nova tabela pivô
        for (const c of etapaCompData ?? []) {
          const seqId = (c as { seq_id: string }).seq_id
          const etapaId = (c as { etapa_id: string }).etapa_id
          const comp = (c as unknown as { componente: { sku: string; nome: string; preco: number | null; descricao: string | null; qtd_disponivel: number | null; qtd_minima_aviso: number | null; parafuso: { sku: string; nome: string; preco: number | null; qtd_disponivel: number | null; qtd_minima_aviso: number | null } | null; chave: { sku: string; nome: string; preco: number | null; qtd_disponivel: number | null; qtd_minima_aviso: number | null } | null; tipo_componente: { nome: string } | null; tipo_abutment: { nome: string } | null } | null }).componente
          if (!groups[seqId]) {
            const wfName = seqInfo?.find((s: { id: string }) => s.id === seqId)?.nome ?? "Workflow"
            groups[seqId] = { id: seqId, nome: wfName, etapas: [] }
          }
          const etapa = groups[seqId].etapas.find((e) => e.id === etapaId)
          if (etapa) {
            etapa.componentes.push({
              sku: comp?.sku ?? (c as { componente_sku: string }).componente_sku,
              nome: comp?.nome ?? "",
              preco: Number(comp?.preco) || undefined,
              descricao: comp?.descricao ?? undefined,
              qtd_disponivel: comp?.qtd_disponivel ?? null,
              qtd_minima_aviso: comp?.qtd_minima_aviso ?? null,
              parafuso: comp?.parafuso ? { sku: comp.parafuso.sku, nome: comp.parafuso.nome, preco: comp.parafuso.preco ?? undefined, qtd_disponivel: comp.parafuso.qtd_disponivel ?? null, qtd_minima_aviso: comp.parafuso.qtd_minima_aviso ?? null } : undefined,
              chave: comp?.chave ? { sku: comp.chave.sku, nome: comp.chave.nome, preco: comp.chave.preco ?? undefined, qtd_disponivel: comp.chave.qtd_disponivel ?? null, qtd_minima_aviso: comp.chave.qtd_minima_aviso ?? null } : undefined,
              tipo_componente: comp?.tipo_componente ?? undefined,
              tipo_abutment: comp?.tipo_abutment ?? undefined,
            })
          }
        }

        for (const g of Object.values(groups)) g.etapas.sort((a, b) => a.ordem - b.ordem)
        setWorkflows(Object.values(groups))

        // Buscar imagens dos componentes
        const allCompSkus = (etapaCompData ?? [])
          .map((c: any) => c.componente?.sku)
          .filter((sku: string | undefined): sku is string => !!sku)
        if (allCompSkus.length > 0) {
          const { data: imgs } = await supabase.from("catalogo_imagens_produto").select("produto_sku, url_imagem").eq("produto_tipo", "componente").in("produto_sku", allCompSkus)
          const map = new Map<string, string>()
          for (const img of imgs ?? []) {
            if (!map.has(img.produto_sku)) map.set(img.produto_sku, img.url_imagem)
          }
          setImagensMap(map)
        }
      })
      .catch(() => setWorkflows([]))
      .finally(() => setLoading(false))
  }, [abutmentSku, empresaId])

  // Tabs = nomes únicos dos workflows
  const uniqueTabs = useMemo(() => {
    const seen = new Set<string>()
    return workflows.map((w) => w.nome).filter((n) => { if (seen.has(n)) return false; seen.add(n); return true })
  }, [workflows])

  // Workflow selecionado pela tab
  const activeWorkflow = useMemo(() => {
    return workflows.find((w) => w.nome === selectedTab) ?? workflows[0] ?? null
  }, [workflows, selectedTab])

  // Selecionar primeira tab quando dados carregam
  useEffect(() => {
    if (uniqueTabs.length > 0 && !selectedTab) {
      setSelectedTab(uniqueTabs[0])
    }
  }, [uniqueTabs, selectedTab])

  // Etapas expansíveis — por padrão só a primeira etapa do workflow ativo vem aberta
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set())
  const etapasKey = activeWorkflow?.etapas.map((e) => e.id).join("|") ?? ""
  useEffect(() => {
    setExpandedEtapas(new Set(activeWorkflow?.etapas[0] ? [activeWorkflow.etapas[0].id] : []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapasKey])

  function toggleEtapa(id: string) {
    setExpandedEtapas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-white">Sequência Protética</h3>
      <p className="text-sm text-[var(--color-text-muted)]">Carregando...</p>
    </div>
  )

  if (workflows.length === 0) return (
    <div className="text-center px-6 py-12 rounded-xl bg-[var(--color-surface)]/30 border border-[var(--color-border-subtle)]">
      <p className="text-sm font-bold text-[var(--color-text-muted)]">Nenhuma sequência protética cadastrada</p>
      <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">Vincule uma sequência na edição do abutment.</p>
    </div>
  )

  return (
    <>
    <div className="flex flex-col gap-4">
      {/* Header com Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Sequência Protética</h3>
        <div className="flex gap-2">
          {uniqueTabs.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTab(t)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                selectedTab === t ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[var(--color-border-subtle)]" />

      {/* Etapas + Componentes */}
      {activeWorkflow && activeWorkflow.etapas.length === 0 && (
        <p className="text-sm text-center py-6 text-[var(--color-text-muted)]">
          Nenhuma etapa configurada nesta sequência.
        </p>
      )}
      {activeWorkflow?.etapas.map((etapa) => {
        const isExpanded = expandedEtapas.has(etapa.id)
        return (
        <div key={etapa.id} className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => toggleEtapa(etapa.id)}
            className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 hover:border-[var(--color-accent)]/40 transition-all"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Etapa {etapa.ordem}{etapa.nome ? `: ${etapa.nome}` : ""}
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                {etapa.componentes.length}
              </span>
              <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
            </span>
          </button>
          {isExpanded && (etapa.componentes.length > 0 ? etapa.componentes.map((comp) => {
            const isAdded = addedSkus.has(comp.sku)
            const preco = Number(comp.preco)
            const temPreco = Number.isFinite(preco) && preco > 0
            const img = imagensMap.get(comp.sku)
            const semEstoque = (comp.qtd_disponivel ?? 0) <= 0
            return (
              <div key={comp.sku} className="w-full box-border flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 hover:border-[var(--color-accent)]/40 transition-all duration-200">
                <div className="flex gap-3 sm:contents">
                  {/* Thumbnail */}
                  <div
                    onClick={() => openImageViewer(img ?? "", comp.nome)}
                    className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden cursor-zoom-in bg-gradient-to-br from-[var(--color-surface)] to-[#0f172a] border border-[var(--color-border-subtle)] flex items-center justify-center"
                  >
                    {img ? (
                      <img src={img} alt={comp.nome} className="w-full h-full object-contain" loading="lazy" />
                    ) : (
                      <Box className="w-7 h-7 sm:w-8 sm:h-8 opacity-10 text-[var(--color-accent)]" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <p className="font-mono text-[10px] text-[var(--color-text-muted)]">SKU: {comp.sku}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EstoqueBadge qtdDisponivel={comp.qtd_disponivel} qtdMinimaAviso={comp.qtd_minima_aviso} compacto exibirEstoque={exibirEstoque} />
                    </div>
                  </div>
                </div>
                {/* CTA — largura fixa para consistência */}
                <div className="shrink-0 w-full sm:w-[180px] flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2">
                  <button
                    onClick={() => setFichaModal({ open: true, nome: comp.nome, sku: comp.sku, imagemUrl: img, tipo: "acessorio", preco, sections: [
                      { title: "Identificação", specs: [
                        { label: "SKU", value: comp.sku },
                        { label: "Nome", value: comp.nome },
                        { label: "Descrição", value: comp.descricao },
                        { label: "Tipo Componente", value: comp.tipo_componente?.nome },
                        { label: "Tipo Abutment", value: comp.tipo_abutment?.nome },
                      ]},
                      { title: "Comercial", specs: [
                        { label: "Preço", value: preco ? formatBRL(preco) : null },
                      ]},
                    ], vinculacoes: [
                      ...(comp.parafuso ? [{ nome: comp.parafuso.nome, sku: comp.parafuso.sku, valor: getPrecoFromDB(comp.parafuso.preco, "parafuso", comp.parafuso.sku), tipo: "parafuso" as ProductSheetTipo }] : []),
                      ...(comp.chave ? [{ nome: comp.chave.nome, sku: comp.chave.sku, valor: getPrecoFromDB(comp.chave.preco, "chave", comp.chave.sku), tipo: "chave" as ProductSheetTipo }] : []),
                    ] })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)]/60 transition-all h-8"
                  >
                    <FileText className="w-3 h-3" />
                    Ver Ficha
                  </button>
                  {semEstoque ? (
                    <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2 min-h-[36px] flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                      <PackageX className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs font-bold text-red-400">Sem Estoque</span>
                    </div>
                  ) : temPreco && (
                    <button
                      onClick={() => {
                        const result = addToCart({ sku: comp.sku, nome: comp.nome, tipo: "acessorio", cor: "#c9a655", preco })
                        if (!result.success) {
                          if (result.error === "quantidade_excedida") toast.error(`Máx: ${result.maxPermitido} un.`)
                          return
                        }
                        playCoinSound()
                        setAddedSkus((prev) => new Set(prev).add(comp.sku))
                        toast.success(`${comp.nome} adicionado ao carrinho`, { icon: <Check className="w-4 h-4" />, duration: 2500 })
                        setTimeout(() => setAddedSkus((prev) => { const next = new Set(prev); next.delete(comp.sku); return next }), 2000)
                      }}
                      className={`group relative overflow-hidden rounded-xl font-bold text-sm transition-all duration-300 h-11 px-5 whitespace-nowrap ${
                        isAdded
                          ? "bg-[var(--color-success)] text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                          : "border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-fg)] hover:shadow-[0_0_30px_rgba(201,166,85,0.15)]"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2.5">
                        {isAdded ? (
                          <><Check className="h-4 w-4" />ADICIONADO</>
                        ) : (
                          <><ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />Add {formatBRL(preco)}</>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          }) : <p className="text-xs text-[var(--color-text-muted)] italic pl-2">Nenhum componente nesta etapa</p>)}
        </div>
        )
      })}

      {activeWorkflow && activeWorkflow.etapas.length === 0 && (
        <p className="text-sm text-center py-8 text-[var(--color-text-muted)]">
          Nenhuma etapa cadastrada para {selectedTab}
        </p>
      )}
    </div>
    <FichaTecnicaModal
      open={fichaModal.open}
      onClose={() => setFichaModal((p) => ({ ...p, open: false }))}
      nome={fichaModal.nome}
      sku={fichaModal.sku}
      cor="#c9a655"
      imagemUrl={fichaModal.imagemUrl}
      tipo={fichaModal.tipo}
      preco={fichaModal.preco}
      sections={fichaModal.sections}
      vinculacoes={fichaModal.vinculacoes}
    />
    </>
  )
}
