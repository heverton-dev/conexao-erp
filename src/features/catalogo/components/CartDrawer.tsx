import { X, ShoppingCart, Trash2, Plus, Minus, ChevronDown, ChevronRight } from "lucide-react"
import { useUIState, toggleCartDrawer } from "../services/ui.service"
import { useCarrinho, removeFromCart, setQuantidade, cartTotais, formatBRL } from "../services/carrinho.service"
import { Link } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"
import { CATALOGO_TIPO_LABEL, type ProductSheetTipo } from "../types"

export function CartDrawer() {
  const { cartDrawerOpen } = useUIState()
  const cart = useCarrinho()
  const { total } = useMemo(() => cartTotais(cart), [cart])
  const { t } = useTranslation()
  const [expandedCategories, setExpandedCategories] = useState<Set<ProductSheetTipo>>(new Set())

  const grouped = useMemo(() => {
    if (cart.length === 0) return []
    const grouped = Object.groupBy(cart, (item: { tipo: ProductSheetTipo }) => item.tipo) as Record<ProductSheetTipo, typeof cart>
    const tipoOrder: ProductSheetTipo[] = [
      "implante", "abutment", "kit", "fresa", "chave",
      "complementar", "opcional", "componente", "parafuso",
      "cicatrizador", "acessorio", "instrumental", "promocional"
    ]
    return Object.entries(grouped)
      .filter(([tipo]) => tipoOrder.includes(tipo as ProductSheetTipo))
      .sort(([a], [b]) => tipoOrder.indexOf(a as ProductSheetTipo) - tipoOrder.indexOf(b as ProductSheetTipo))
  }, [cart])

  const toggleCategory = (tipo: ProductSheetTipo) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(tipo)) {
        next.delete(tipo)
      } else {
        next.add(tipo)
      }
      return next
    })
  }

  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = "hidden"
      setExpandedCategories(new Set(grouped.map(([tipo]) => tipo as ProductSheetTipo)))
    } else {
      document.body.style.overflow = "auto"
    }
    return () => { document.body.style.overflow = "auto" }
  }, [cartDrawerOpen, grouped])

  if (!cartDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm transition-opacity"
        onClick={() => toggleCartDrawer(false)}
      />

      <div className="relative w-full max-w-md h-full bg-[#0f172a] border-l border-[var(--color-border-subtle)] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-bold text-lg text-white">{t("catalogo.cart.title")}</h2>
          </div>
          <button onClick={() => toggleCartDrawer(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-[var(--color-text-muted)] opacity-50" />
              </div>
              <p className="text-[var(--color-text-muted)] font-medium">{t("catalogo.cart.empty")}</p>
            </div>
          ) : (
            grouped.map(([tipo, items]) => {
              const tipoItem = tipo as ProductSheetTipo
              return (
                <div key={tipoItem} className="border border-[var(--color-border-subtle)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(tipoItem)}
                    className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface)]/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedCategories.has(tipoItem) ? (
                        <ChevronDown className="w-4 h-4 text-[var(--color-accent)]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
                        {CATALOGO_TIPO_LABEL[tipoItem]}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)]/50 px-2 py-1 rounded-full">
                      {items.length} {items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </button>

                  {expandedCategories.has(tipoItem) && (
                    <div className="p-4 space-y-3 bg-[var(--color-surface)]/30">
                      {items.map(item => (
                        <div key={item.sku} className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/50 flex flex-col gap-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-semibold text-white leading-snug">{item.nome}</h4>
                              <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">SKU: {item.sku}</p>
                            </div>
                            <p className="font-bold text-[#c9a655] whitespace-nowrap">{formatBRL(item.preco)}</p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]/50">
                            <div className="flex items-center gap-3 bg-[var(--color-surface)] rounded-lg p-1 border border-[var(--color-border-subtle)]">
                              <button
                                onClick={() => {
                                  const result = setQuantidade(item.sku, item.quantidade - 1)
                                  if (result.limitado) {
                                    toast("Quantidade ajustada para o máximo disponível", { icon: "📦" })
                                  }
                                }}
                                className="p-1 rounded-md hover:bg-white/10"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold w-6 text-center">{item.quantidade}</span>
                              <button
                                onClick={() => {
                                  const result = setQuantidade(item.sku, item.quantidade + 1)
                                  if (result.limitado) {
                                    toast(`Estoque máximo: ${result.quantidadeFinal} unidades`, { icon: "⚠️" })
                                  }
                                }}
                                disabled={item.qtd_disponivel != null && item.qtd_disponivel > 0 && item.quantidade >= item.qtd_disponivel}
                                className={`p-1 rounded-md transition-colors ${
                                  item.qtd_disponivel != null && item.qtd_disponivel > 0 && item.quantidade >= item.qtd_disponivel
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-white/10"
                                }`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            {item.qtd_disponivel != null && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.qtd_disponivel < 1
                                  ? "bg-red-500/15 text-red-400"
                                  : item.qtd_minima_aviso != null && item.qtd_disponivel <= item.qtd_minima_aviso
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "bg-emerald-500/15 text-emerald-400"
                              }`}>
                                {item.qtd_disponivel < 1 ? "Sem estoque" : `${item.qtd_disponivel} disp.`}
                              </span>
                            )}
                            <button onClick={() => removeFromCart(item.sku)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-sm text-[var(--color-text-muted)] uppercase tracking-widest font-bold">{t("catalogo.cart.estimatedTotal")}</span>
              <span className="text-3xl font-black text-gradient-gold">{formatBRL(total)}</span>
            </div>
            
            <Link 
              to="/catalogo/checkout"
              onClick={() => toggleCartDrawer(false)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
            >
              {t("catalogo.cart.checkout")}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
