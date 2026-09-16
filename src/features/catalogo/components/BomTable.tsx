import { useState, useEffect } from "react"
import { Check, FileText, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"
import { addToCart, formatBRL, getPrecoFromDB } from "~/features/catalogo/services/carrinho.service"
import { playCoinSound } from "~/features/catalogo/services/audio.service"
import type { ProductSheetTipo, CatalogoImagemProduto } from "~/features/catalogo/types"
import { ProductThumb } from "./ProductThumb"
import { openImageViewer } from "~/features/catalogo/services/ui.service"
import { useImagensBatch, useCatalogoConfig } from "~/features/catalogo/hooks/useCatalogo"
import { listarKitsRelacionadosDeChave, listarKitsRelacionadosDeFresa, listarKitsRelacionadosDeCicatrizador } from "~/features/catalogo/services/kits.service"
import { FichaTecnicaModal } from "./FichaTecnicaModal"
import { EstoqueBadge } from "./admin/produtos/EstoqueBadge"
import { PackageX } from "lucide-react"

async function buscarKitsRelacionados(tipo: string, sku: string) {
  const kits = tipo === "chave" ? await listarKitsRelacionadosDeChave(sku)
    : tipo === "fresa" ? await listarKitsRelacionadosDeFresa(sku)
    : tipo === "cicatrizador" ? await listarKitsRelacionadosDeCicatrizador(sku)
    : []
  return kits.map((k) => ({ nome: k.nome, sku: k.sku, valor: k.preco, tipo: "kit" as ProductSheetTipo }))
}

const TIPO_LABEL: Record<string, string> = {
  fresa: "Fresa",
  chave: "Chave",
  acessorio: "Acessório",
  instrumental: "Instrumental",
  implante: "Implante",
  cicatrizador: "Cicatrizador",
  componente: "Componente",
  parafuso: "Parafuso",
}

interface BomTableProps {
  items: { tipo: string; sku: string; nome: string; quantidade: number; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null }[]
}

export function BomTable({ items }: BomTableProps) {
  const [fichaModal, setFichaModal] = useState<{ open: boolean; nome: string; sku: string; imagemUrl?: string | null; tipo?: ProductSheetTipo; preco?: number; sections: Array<{ title: string; specs: Array<{ label: string; value: string | number | null | undefined }> }>; vinculacoes?: Array<{ nome: string; sku: string; valor?: number | null; tipo?: ProductSheetTipo }> }>({ open: false, nome: "", sku: "", sections: [] })

  const skusByTipo = items.reduce((acc, item) => {
    if (!acc[item.tipo]) acc[item.tipo] = []
    acc[item.tipo].push(item.sku)
    return acc
  }, {} as Record<string, string[]>)

  // ── Agrupamento por categoria (tipo) — ordem = ordem de aparição no BOM ──
  const itemsByTipo = items.reduce((acc, item) => {
    if (!acc[item.tipo]) acc[item.tipo] = []
    acc[item.tipo].push(item)
    return acc
  }, {} as Record<string, typeof items>)
  const grupos = Object.keys(itemsByTipo).map((tipo) => ({ tipo, items: itemsByTipo[tipo] }))
  const gruposKey = grupos.map((g) => g.tipo).join("|")

  const [expandedTipos, setExpandedTipos] = useState<Set<string>>(() => new Set(grupos[0] ? [grupos[0].tipo] : []))
  const { data: config } = useCatalogoConfig()
  const exibirEstoque = config?.exibir_estoque ?? true
  // Ao trocar de kit (novo conjunto de categorias), volta ao padrão: só a primeira expandida
  useEffect(() => {
    setExpandedTipos(new Set(grupos[0] ? [grupos[0].tipo] : []))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gruposKey])

  function toggleTipo(tipo: string) {
    setExpandedTipos((prev) => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  const [imagensMap, setImagensMap] = useState<Map<string, string>>(new Map())

  // Buscar imagens para cada tipo
  const tipoEntries = Object.entries(skusByTipo)
  const fresaImgs = useImagensBatch("fresa", skusByTipo["fresa"] ?? [])
  const chaveImgs = useImagensBatch("chave", skusByTipo["chave"] ?? [])
  const implanteImgs = useImagensBatch("implante", skusByTipo["implante"] ?? [])
  const cicatrizadorImgs = useImagensBatch("cicatrizador", skusByTipo["cicatrizador"] ?? [])
  const componenteImgs = useImagensBatch("componente", skusByTipo["componente"] ?? [])
  const parafusoImgs = useImagensBatch("parafuso", skusByTipo["parafuso"] ?? [])

  useEffect(() => {
    const map = new Map<string, string>()
    const sources: Array<[string, Map<string, CatalogoImagemProduto[]> | undefined]> = [
      ["fresa", fresaImgs.data], ["chave", chaveImgs.data],
      ["implante", implanteImgs.data], ["cicatrizador", cicatrizadorImgs.data],
      ["componente", componenteImgs.data], ["parafuso", parafusoImgs.data],
    ]
    for (const [tipo, data] of sources) {
      if (data) {
        for (const [sku, imgs] of data) {
          if (imgs?.[0]?.url_imagem) map.set(`${tipo}:${sku}`, imgs[0].url_imagem)
        }
      }
    }
    setImagensMap(map)
  }, [fresaImgs.data, chaveImgs.data, implanteImgs.data, cicatrizadorImgs.data, componenteImgs.data, parafusoImgs.data])

  const getColor = (tipo: string) => {
    switch(tipo) {
      case 'instrumental': return '#8b5cf6'
      case 'fresa': return '#3b82f6'
      case 'chave': return '#eab308'
      case 'acessorio': return '#22c55e'
      case 'implante': return '#c9a655'
      case 'cicatrizador': return '#f97316'
      case 'componente': return '#06b6d4'
      case 'parafuso': return '#ec4899'
      default: return '#94a3b8'
    }
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {grupos.map((grupo) => {
        const isExpanded = expandedTipos.has(grupo.tipo)
        const groupColor = getColor(grupo.tipo)
        return (
          <div key={grupo.tipo} className="space-y-2.5 sm:space-y-3">
            <button
              type="button"
              onClick={() => toggleTipo(grupo.tipo)}
              className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/60 hover:border-[var(--color-accent)]/40 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: groupColor }} />
                <span className="text-xs font-black uppercase tracking-widest text-white truncate">{TIPO_LABEL[grupo.tipo] ?? grupo.tipo}</span>
                <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  {grupo.items.length}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
            </button>
            {isExpanded && (
              <div className="space-y-2.5 sm:space-y-3 pl-1">
                {grupo.items.map((item) => {
                  const color = getColor(item.tipo)
                  const preco = getPrecoFromDB(item.preco, item.tipo as ProductSheetTipo, item.sku)
                  const img = imagensMap.get(`${item.tipo}:${item.sku}`)
                  const semEstoque = (item.qtd_disponivel ?? 0) <= 0
                  return (
                    <div
                      key={`${item.tipo}-${item.sku}`}
                      className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 hover:border-[var(--color-accent)]/40 transition-all duration-200"
                    >
                      <div className="flex gap-3 sm:contents">
                        {/* Thumbnail */}
                        <div
                          onClick={() => openImageViewer(img ?? "", item.nome)}
                          className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden cursor-zoom-in bg-gradient-to-br from-[var(--color-surface)] to-[#0f172a] border border-[var(--color-border-subtle)] flex items-center justify-center"
                        >
                          {img ? (
                            <img src={img} alt={item.nome} className="w-full h-full object-contain" loading="lazy" />
                          ) : (
                            <ProductThumb tipo={item.tipo} size="sm" cor={color} />
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{item.nome}</h4>
                            <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                              ×{item.quantidade}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-[var(--color-text-muted)]">SKU: {item.sku}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <EstoqueBadge qtdDisponivel={item.qtd_disponivel} qtdMinimaAviso={item.qtd_minima_aviso} compacto exibirEstoque={exibirEstoque} />
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                              {TIPO_LABEL[item.tipo] ?? item.tipo}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* CTA */}
                      <div className="w-full sm:w-auto shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-normal gap-2">
                        <button
                          onClick={async () => {
                            setFichaModal({
                              open: true,
                              nome: item.nome,
                              sku: item.sku,
                              imagemUrl: img,
                              tipo: item.tipo as ProductSheetTipo,
                              preco,
                              sections: [
                                { title: "Identificação", specs: [
                                  { label: "SKU", value: item.sku },
                                  { label: "Nome", value: item.nome },
                                  { label: "Tipo", value: TIPO_LABEL[item.tipo] ?? item.tipo },
                                  { label: "Quantidade no kit", value: item.quantidade },
                                ]},
                                { title: "Comercial", specs: [
                                  { label: "Preço", value: preco ? formatBRL(preco) : null },
                                ]},
                              ],
                            })
                            const vinculacoes = await buscarKitsRelacionados(item.tipo, item.sku)
                            if (vinculacoes.length > 0) setFichaModal((p) => ({ ...p, vinculacoes }))
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)]/60 transition-all min-h-[32px]"
                        >
                          <FileText className="w-3 h-3" />
                          Ver Ficha
                        </button>
                        <div className="flex flex-col items-center gap-1">
                          {semEstoque ? (
                            <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2 min-h-[36px] flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                              <PackageX className="h-3.5 w-3.5 text-red-400" />
                              <span className="text-xs font-bold text-red-400">Sem Estoque</span>
                            </div>
                          ) : Number(preco) > 0 ? (
                            <button
                              onClick={() => {
                                const result = addToCart({ sku: item.sku, nome: item.nome, tipo: item.tipo as ProductSheetTipo, cor: "#c9a655", preco })
                                if (!result.success) {
                                  if (result.error === "quantidade_excedida") toast.error(`Máx: ${result.maxPermitido} un.`)
                                  return
                                }
                                playCoinSound()
                                toast.success(`${item.nome} adicionado`, {
                                  icon: <Check className="w-4 h-4" />,
                                  style: {
                                    background: "var(--color-surface)",
                                    color: "var(--color-text-main)",
                                    border: "1px solid var(--color-accent)",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                  },
                                  duration: 2000,
                                })
                              }}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-fg)] min-h-[36px]"
                            >
                              Add {formatBRL(preco)}
                            </button>
                          ) : null}
                          <span className="text-[9px] italic text-[var(--color-text-muted)]/60 text-center">Valor Unitário</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

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
    </div>
  )
}
