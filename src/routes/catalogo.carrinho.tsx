import { createRoute, Link } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { useCarrinho, removeFromCart, setQuantidade, clearCart, cartTotais, formatBRL } from "~/features/catalogo/services/carrinho.service"
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react"

export const catalogoCarrinhoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/carrinho",
  component: CarrinhoPage,
})

function CarrinhoPage() {
  const items = useCarrinho()
  const { qtd, total } = cartTotais(items)

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter text-white">Seu Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-32 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/30 backdrop-blur-md">
            <ShoppingBag className="h-16 w-16 mx-auto mb-6 opacity-20 text-white" />
            <p className="text-xl text-[var(--color-text-muted)] mb-8 font-semibold">Seu carrinho está vazio.</p>
            <Link 
              to="/catalogo" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[var(--color-accent)] text-[var(--color-accent)] font-bold uppercase tracking-widest text-sm hover:bg-[var(--color-accent)] hover:text-[#0f172a] transition-colors"
            >
              Continuar Explorando <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Lista de Itens */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)] px-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Produto</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Subtotal</span>
              </div>
              
              <div className="space-y-4 pt-4">
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className="group flex flex-col md:flex-row md:items-center gap-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-sm hover:border-[var(--color-accent)] transition-colors"
                  >
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-2" style={{ backgroundColor: `${item.cor}20`, color: item.cor }}>
                        {item.tipo}
                      </span>
                      <p className="font-bold text-lg text-white leading-tight mb-1">{item.nome}</p>
                      <p className="text-xs font-mono text-[var(--color-text-muted)]">SKU: {item.sku}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 md:ml-auto">
                      {/* Qtd Selector */}
                      <div className="flex items-center gap-3 bg-[#0f172a] rounded-full p-1 border border-[var(--color-border-subtle)]">
                        <button 
                          onClick={() => setQuantidade(item.sku, item.quantidade - 1)} 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantidade}</span>
                        <button 
                          onClick={() => setQuantidade(item.sku, item.quantidade + 1)} 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="w-28 text-right">
                        <span className="font-black text-lg text-gradient-gold block">{formatBRL(item.preco * item.quantidade)}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">{formatBRL(item.preco)} unid.</span>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.sku)} 
                        className="p-3 rounded-full text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 px-2">
                <button onClick={clearCart} className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Esvaziar Carrinho
                </button>
              </div>
            </div>

            {/* Sumário */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 p-8 backdrop-blur-xl shadow-2xl shadow-[rgba(201,166,85,0.05)]">
                <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6">Resumo do Pedido</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                    <span>Subtotal ({qtd} itens)</span>
                    <span>{formatBRL(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                    <span>Frete</span>
                    <span className="text-[var(--color-accent)] font-semibold">A calcular</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--color-border-subtle)] mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Total</span>
                    <span className="text-3xl font-black text-gradient-gold">{formatBRL(total)}</span>
                  </div>
                </div>

                <Link
                  to="/catalogo"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(201,166,85,0.3)]"
                  style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
                >
                  Finalizar Pedido <ArrowRight className="w-4 h-4" />
                </Link>
                
                <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-6">
                  Ambiente seguro e criptografado.
                </p>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </StoreLayout>
  )
}
