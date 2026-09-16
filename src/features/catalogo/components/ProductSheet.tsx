import { X, ExternalLink, ShoppingCart, Box, PackageX } from "lucide-react"
import { useUIState, closeProductSheet } from "../services/ui.service"
import { useImplanteDetalhe, useAbutmentDetalhe, useKitDetalhe, usePromocionalDetalhe } from "../hooks/useCatalogo"
import { addToCart, formatBRL, mockPreco } from "../services/carrinho.service"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { ProductThumb } from "./ProductThumb"
import { useTranslation } from "react-i18next"

export function ProductSheet() {
  const { productSheet } = useUIState()
  const [startY, setStartY] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    if (productSheet.isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "auto"
    return () => { document.body.style.overflow = "auto" }
  }, [productSheet.isOpen])

  if (!productSheet.isOpen || !productSheet.tipo) return null

  const handleTouchStart = (e: React.TouchEvent) => setStartY(e.touches[0].clientY)
  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY
    if (delta > 0) setTranslateY(delta)
  }
  const handleTouchEnd = () => {
    if (translateY > 150) closeProductSheet()
    setTranslateY(0)
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end lg:justify-center lg:items-center">
      <div className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-md transition-opacity" onClick={closeProductSheet} />

      <div 
        className="relative w-full max-w-2xl bg-[var(--color-background)] lg:rounded-3xl rounded-t-3xl border border-[var(--color-border-subtle)] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] lg:shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-transform"
        style={{ transform: `translateY(${translateY}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-8 flex items-center justify-center lg:hidden">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        <div className="absolute top-4 right-4 z-10 hidden lg:block">
          <button onClick={closeProductSheet} className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <SheetContent sku={productSheet.sku} tipo={productSheet.tipo} />
        </div>
      </div>
    </div>
  )
}

function SheetContent({ sku, tipo }: { sku: string; tipo: string }) {
  const imp = useImplanteDetalhe(tipo === "implante" ? sku : "")
  const ab = useAbutmentDetalhe(tipo === "abutment" ? sku : "")
  const kit = useKitDetalhe(tipo === "kit" ? sku : "")
  const promo = usePromocionalDetalhe(tipo === "promocional" ? sku : "")
  const { t } = useTranslation()

  let data: any = null
  let cor = "#c9a655"
  let nome = ""

  if (tipo === "implante" && imp.data) {
    data = imp.data; cor = data.linha?.familia?.cor_identificacao || cor
    nome = `${data.linha?.familia?.nome || ""} ${data.diametro_mm}×${data.comprimento_mm}`
  }
  if (tipo === "abutment" && ab.data) {
    data = ab.data; cor = data.familia?.cor_identificacao || cor
    nome = `${data.tipo_abutment?.nome || ""} ${data.familia?.nome || ""}`
  }
  if (tipo === "kit" && kit.data) {
    data = kit.data; nome = data.nome
  }
  if (tipo === "promocional" && promo.data) {
    data = promo.data; nome = data.nome
  }

  if (!data && (tipo === 'fresa' || tipo === 'chave' || tipo === 'instrumental' || tipo === 'acessorio')) {
    data = { sku, nome: `Peça ${sku}`, diametro_mm: tipo === 'fresa' ? '2.0' : null }
    nome = `Peça ${sku}`
    cor = tipo === 'fresa' ? '#3b82f6' : tipo === 'instrumental' ? '#8b5cf6' : '#eab308'
  }

  if (!data) return <div className="h-64 flex items-center justify-center font-bold text-[var(--color-accent)] animate-pulse">{t("catalogo.product.loading")}</div>

  const preco = tipo === "promocional" ? data.preco : mockPreco(tipo as any, sku)
  const semEstoque = (data?.qtd_disponivel ?? 0) <= 0
  const imagemPrincipal = data?.imagens?.[0]?.url_imagem

  return (
    <div className="p-6 md:p-8 flex flex-col h-full bg-[#0f172a]">

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div
          className="w-32 h-32 shrink-0 rounded-2xl bg-[var(--color-surface)] border border-white/5 flex items-center justify-center overflow-hidden"
        >
          <ProductThumb tipo={tipo} cor={cor} imageUrl={imagemPrincipal} size="lg" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: cor }}>{tipo}</p>
          <h2 className="text-2xl font-black text-white leading-tight mb-1 truncate">{nome}</h2>
          <p className="text-xs font-mono text-[var(--color-text-muted)] mb-4">SKU: {sku}</p>

          <div className="grid grid-cols-2 gap-3">
            {data.diametro_mm && (
              <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-transparent">
                 <span className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Ø (MM)</span>
                 <span className="text-sm font-semibold text-white">{data.diametro_mm}</span>
              </div>
            )}
            <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-transparent">
               <span className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)]">{t("catalogo.product.singleSale")}</span>
               <span className="text-sm font-semibold text-white">{t("catalogo.product.yes")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col md:flex-row gap-3">
        {semEstoque ? (
          <div className="flex-1 w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-red-500/30 bg-red-500/10 cursor-not-allowed opacity-70">
            <PackageX className="w-5 h-5 text-red-400" />
            <span className="font-bold text-sm text-red-400">Sem Estoque</span>
          </div>
        ) : (
          <button
            onClick={() => {
              const result = addToCart({
                sku,
                nome,
                tipo: tipo as any,
                cor,
                preco,
                qtd_disponivel: data?.qtd_disponivel ?? null,
                qtd_minima_aviso: data?.qtd_minima_aviso ?? null,
              })
              if (result.success) {
                toast("Adicionado ao carrinho", { icon: "✅" })
              } else if (result.error === "quantidade_excedida") {
                toast.error(`Quantidade máxima permitida: ${result.maxPermitido} unidades (estoque disponível)`)
              } else if (result.error === "sem_estoque") {
                toast("Produto sem estoque", { icon: "❌" })
              }
            }}
            className="flex-1 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-[#0f172a] hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #e8d48b, #c9a655)" }}
          >
            <ShoppingCart className="w-5 h-5" /> {t("catalogo.product.addToCart")} - {formatBRL(preco)}
          </button>
        )}
        <button
          onClick={closeProductSheet}
          className="w-full md:w-32 py-4 rounded-xl border border-white/10 font-bold text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
        >
          {t("catalogo.product.close")}
        </button>
      </div>

    </div>
  )
}
