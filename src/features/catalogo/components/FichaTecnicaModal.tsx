import { useEffect, useRef, useState } from "react"
import { X, FileText, Package, Link2, Copy, Check, ShoppingCart, ArrowUpRight, PackageX } from "lucide-react"
import { createPortal } from "react-dom"
import toast from "react-hot-toast"
import { addToCart, formatBRL } from "~/features/catalogo/services/carrinho.service"
import { playCoinSound } from "~/features/catalogo/services/audio.service"
import { openImageViewer } from "~/features/catalogo/services/ui.service"
import type { ProductSheetTipo } from "~/features/catalogo/types"

export interface FichaTecnicaSection {
  title: string
  specs: Array<{ label: string; value: string | number | null | undefined }>
}

export interface FichaTecnicaVinculo {
  nome: string
  sku: string
  valor?: number | null
  /** Tipo do produto vinculado (para o botão discreto de adicionar). */
  tipo?: ProductSheetTipo
}

export interface FichaTecnicaComposicaoItem {
  nome: string
  quantidade?: number
  sku?: string
  /** Tipo do item da composição (para o botão discreto de adicionar). */
  tipo?: ProductSheetTipo
  preco?: number | null
}

interface FichaTecnicaModalProps {
  open: boolean
  onClose: () => void
  nome: string
  sku: string
  cor: string
  imagemUrl?: string | null
  sections?: FichaTecnicaSection[]
  vinculacoes?: FichaTecnicaVinculo[]
  composicao?: FichaTecnicaComposicaoItem[]
  /** Tipo do produto (para "Adicionar ao carrinho"). Omitir esconde o CTA. */
  tipo?: ProductSheetTipo
  /** Preço numérico bruto (para "Adicionar ao carrinho"). Omitir ou <= 0 esconde o CTA. */
  preco?: number | null
  /** Ex.: navegar para a página completa do produto. Omitir esconde o link. */
  onVerCompleto?: () => void
  /** Estoque disponível. Se <= 0, botão "Add" é desabilitado. */
  qtdDisponivel?: number | null
  qtdMinimaAviso?: number | null
}

const LONG_VALUE_THRESHOLD = 24

export function FichaTecnicaModal({
  open, onClose, nome, sku, cor, imagemUrl, sections, vinculacoes, composicao,
  tipo, preco, onVerCompleto, qtdDisponivel, qtdMinimaAviso,
}: FichaTecnicaModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [added, setAdded] = useState(false)
  const [addedRowSkus, setAddedRowSkus] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return

    dialogRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab") return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const resolvedSections = sections ?? []
  const hasVinculacoes = vinculacoes && vinculacoes.length > 0
  const hasComposicao = composicao && composicao.length > 0
  const precoNum = Number(preco)
  const hasAddCta = !!tipo && Number.isFinite(precoNum) && precoNum > 0
  const hasFooter = hasAddCta || !!onVerCompleto

  function handleCopySku() {
    navigator.clipboard.writeText(sku).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }
  const semEstoque = (qtdDisponivel ?? 0) <= 0
  function handleAdd() {
    if (!tipo || semEstoque) return
    const result = addToCart({ sku, nome, tipo, cor, preco: precoNum })
    if (!result.success) {
      if (result.error === "quantidade_excedida") toast.error(`Máx: ${result.maxPermitido} un.`)
      return
    }
    playCoinSound()
    setAdded(true)
    toast.success(`${nome} adicionado`, {
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
    setTimeout(() => setAdded(false), 2000)
  }

  function handleAddRow(rowTipo: ProductSheetTipo | undefined, rowSku: string, rowNome: string, rowPreco: number | null | undefined) {
    if (!rowTipo) return
    const rowPrecoNum = Number(rowPreco)
    if (!Number.isFinite(rowPrecoNum) || rowPrecoNum <= 0) return
    const result = addToCart({ sku: rowSku, nome: rowNome, tipo: rowTipo, cor, preco: rowPrecoNum })
    if (!result.success) {
      if (result.error === "quantidade_excedida") toast.error(`Máx: ${result.maxPermitido} un.`)
      return
    }
    playCoinSound()
    setAddedRowSkus((prev) => new Set(prev).add(rowSku))
    toast.success(`${rowNome} adicionado`, {
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
    setTimeout(() => setAddedRowSkus((prev) => { const next = new Set(prev); next.delete(rowSku); return next }), 2000)
  }

  function renderMiniAddButton(rowTipo: ProductSheetTipo | undefined, rowSku: string, rowNome: string, rowPreco: number | null | undefined) {
    const rowPrecoNum = Number(rowPreco)
    if (!rowTipo || !Number.isFinite(rowPrecoNum) || rowPrecoNum <= 0) return null
    const isAdded = addedRowSkus.has(rowSku)
    return (
      <button
        onClick={() => handleAddRow(rowTipo, rowSku, rowNome, rowPreco)}
        title={`Adicionar ${rowNome} — ${formatBRL(rowPrecoNum)}`}
        className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
          isAdded ? "bg-[var(--color-success)]/15 text-[var(--color-success)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
        }`}
      >
        {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
      </button>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-tecnica-titulo"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--color-border-subtle)]/50 bg-[#0f172a] shadow-2xl shadow-black/40 overflow-hidden max-h-[90dvh] flex flex-col outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--color-accent)]/20 via-[var(--color-accent)]/10 to-transparent px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6 border-b border-[var(--color-border-subtle)]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: `${cor}1a`, color: cor }}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 id="ficha-tecnica-titulo" className="text-base sm:text-lg font-bold text-white truncate">{nome}</h3>
                <button
                  onClick={handleCopySku}
                  className="flex items-center gap-1 mt-0.5 group"
                  title="Copiar SKU"
                >
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)] group-hover:text-white transition-colors">SKU: {sku}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-[var(--color-success)]" />
                  ) : (
                    <Copy className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
            </div>
            <button onClick={onClose} aria-label="Fechar" className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 sm:py-6 flex-1 overflow-y-auto space-y-5">
          {/* Imagem */}
          {imagemUrl && (
            <div
              onClick={() => openImageViewer(imagemUrl, nome)}
              className="w-full h-36 sm:h-40 rounded-xl overflow-hidden cursor-zoom-in bg-gradient-to-br from-[var(--color-surface)] to-[#0f172a] border border-[var(--color-border-subtle)] flex items-center justify-center"
            >
              <img src={imagemUrl} alt={nome} className="w-full h-full object-contain py-6" loading="lazy" />
            </div>
          )}

          {/* Seções */}
          {resolvedSections.length > 0 ? (
            resolvedSections.map((section) => {
              const validSpecs = section.specs.filter((s) => s.value != null && s.value !== "")
              if (validSpecs.length === 0) return null
              return (
                <div key={section.title} className="space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">{section.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {validSpecs.map((s) => {
                      const isLong = typeof s.value === "string" && s.value.length > LONG_VALUE_THRESHOLD
                      return (
                        <div key={s.label} className={`p-3 rounded-lg bg-[var(--color-surface)]/60 border border-[var(--color-border-subtle)] ${isLong ? "sm:col-span-2" : ""}`}>
                          <span className="block text-[9px] font-bold uppercase tracking-[0.15em] mb-1 text-[var(--color-text-muted)]">{s.label}</span>
                          <span className="block text-sm font-bold text-white">{s.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            !hasVinculacoes && !hasComposicao && <p className="text-xs text-[var(--color-text-muted)] text-center py-4">Nenhuma especificação disponível</p>
          )}

          {/* Vinculações */}
          {hasVinculacoes && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Vinculações</h4>
              {/* Header da tabela */}
              <div className="grid grid-cols-[1fr_80px_70px_28px] gap-2 px-3 text-[8px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                <span>Nome</span>
                <span className="text-right">SKU</span>
                <span className="text-right">Valor</span>
                <span />
              </div>
              <div className="space-y-1">
                {vinculacoes!.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_70px_28px] gap-2 items-center p-2.5 rounded-lg bg-[var(--color-surface)]/60 border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md shrink-0" style={{ backgroundColor: `${cor}15`, color: cor }}>
                        <Link2 className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-bold text-white truncate">{v.nome}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] text-right truncate">{v.sku}</span>
                    <span className="text-xs font-bold text-white text-right">{v.valor != null ? formatBRL(v.valor) : "—"}</span>
                    {renderMiniAddButton(v.tipo, v.sku, v.nome, v.valor)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Composição */}
          {hasComposicao && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Composição</h4>
              <div className="space-y-1.5">
                {composicao!.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--color-surface)]/60 border border-[var(--color-border-subtle)]">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${cor}15`, color: cor }}>
                      <Package className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{item.nome}</p>
                      {item.sku && <p className="font-mono text-[9px] text-[var(--color-text-muted)]">{item.sku}</p>}
                    </div>
                    {item.quantidade != null && item.quantidade > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] shrink-0">
                        ×{item.quantidade}
                      </span>
                    )}
                    {item.sku && renderMiniAddButton(item.tipo, item.sku, item.nome, item.preco)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasFooter && (
          <div className="px-5 sm:px-6 py-4 border-t border-[var(--color-border-subtle)]/50 flex items-center gap-3 shrink-0">
            {onVerCompleto && (
              <button
                onClick={() => {
                  onClose()
                  onVerCompleto()
                }}
                className="flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                Ver página completa
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
            {hasAddCta && (
              semEstoque ? (
                <div className="ml-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 cursor-not-allowed opacity-70">
                  <PackageX className="h-4 w-4 text-red-400" />
                  <span className="font-bold text-sm text-red-400">Sem Estoque</span>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className={`ml-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    added
                      ? "bg-[var(--color-success)] text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                      : "border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-fg)]"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" />
                      ADICIONADO
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add {formatBRL(precoNum)}
                    </>
                  )}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
