import { createRoute, Link } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { useCarrinho, cartTotais, formatBRL, clearCart } from "~/features/catalogo/services/carrinho.service"
import { useState } from "react"
import toast from "react-hot-toast"
import { consultarViaCEP, consultarFrete } from "~/features/catalogo/services/frete.service"
import { validarCupom, aplicarCupom } from "~/features/catalogo/services/cupons.service"
import { useAuth } from "~/lib/auth"
import { useClienteAtivo } from "~/features/catalogo/contexts/cliente-ativo"
import { useCatalogoCliente } from "~/features/catalogo/hooks/useCatalogoCliente"
import { useCriarPedidoCatalogo } from "~/features/catalogo/hooks/useCatalogo"
import { criarPagamento, confirmarPagamento } from "~/features/catalogo/services/pagamentos.service"
import type { CatalogoCupom, CatalogoFrete } from "~/features/catalogo/types"
import { CheckCircle, Truck, MapPin, Tag, ShieldCheck, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
export const catalogoCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/checkout",
  component: CheckoutPage,
})

function CheckoutPage() {
  const items = useCarrinho()
  const { profile } = useAuth()
  const { isConsultor, clienteAtivo } = useClienteAtivo()
  const { cliente: catalogoCliente } = useCatalogoCliente()
  const criarPedido = useCriarPedidoCatalogo()
  const { total } = cartTotais(items)
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState<{ logradouro: string; bairro: string; cidade: string; estado: string } | null>(null)
  const [frete, setFrete] = useState<CatalogoFrete | null>(null)
  const [freteErro, setFreteErro] = useState("")
  const [cupomCodigo, setCupomCodigo] = useState("")
  const [cupom, setCupom] = useState<CatalogoCupom | null>(null)
  const [cupomErro, setCupomErro] = useState("")
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [processando, setProcessando] = useState(false)
  const { t } = useTranslation()

  async function handleBuscarCep() {
    setBuscandoCep(true)
    setFreteErro("")
    setFrete(null)
    const result = await consultarViaCEP(cep.replace(/\D/g, ""))
    setEndereco(result)
    // Buscar frete real para este CEP
    const freteResult = await consultarFrete(cep)
    if (freteResult) {
      setFrete(freteResult)
    } else {
      setFreteErro("CEP fora da área de entrega")
    }
    setBuscandoCep(false)
  }

  async function handleAplicarCupom() {
    if (!cupomCodigo.trim()) return
    setCupomErro("")
    try {
      const valido = await validarCupom(cupomCodigo.trim())
      if (!valido) {
        setCupomErro("Cupom inválido ou expirado")
        return
      }
      setCupom(valido as CatalogoCupom)
      toast.success("Cupom aplicado!", { icon: "✅" })
    } catch {
      setCupomErro("Erro ao validar cupom")
    }
  }

  async function handleFinalizar() {
    if (!profile) return
    if (isConsultor && !clienteAtivo) return
    if (!isConsultor && !catalogoCliente) return
    if (freteErro) return
    // Validar estoque antes de finalizar
    const semEstoque = items.filter((item) => item.qtd_disponivel != null && item.quantidade > item.qtd_disponivel)
    if (semEstoque.length > 0) {
      const nomes = semEstoque.map((i) => `${i.nome} (máx: ${i.qtd_disponivel})`).join(', ')
      toast.error(`Estoque insuficiente: ${nomes}`)
      return
    }
    setProcessando(true)
    try {
      // 1. Criar pedido
      const pedido = await criarPedido.mutateAsync({
        cliente_id: isConsultor ? null : catalogoCliente?.id ?? null,
        cliente_crm_id: isConsultor ? clienteAtivo?.id ?? null : null,
        colaborador_id: profile.id,
        valor_frete: frete?.valor ?? 0,
        cupom_codigo: cupom?.codigo ?? null,
        cupom_desconto: desconto > 0 ? desconto : undefined,
        itens: items.map((item) => ({
          produto_sku: item.sku,
          produto_tipo: item.tipo,
          produto_nome: item.nome,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
        })),
      })

      // 2. Criar registro de pagamento (manual por enquanto)
      await criarPagamento(pedido.id, "manual", totalFinal)

      // 3. Confirmar pagamento → baixa estoque
      await confirmarPagamento(pedido.id)

      setProtocolo(pedido.id)
      clearCart()
      toast.success("Pedido realizado com sucesso!", { icon: "✅" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao finalizar pedido"
      setFreteErro(msg)
      toast.error(msg)
    } finally {
      setProcessando(false)
    }
  }

  if (protocolo) {
    return (
      <StoreLayout>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(52,211,153,0.3)]">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4 text-white">{t("catalogo.checkout.orderSuccess")}</h1>
          <p className="text-lg text-[var(--color-text-muted)] mb-8">
            Seu pedido foi recebido e está sendo processado. O protocolo de acompanhamento é:
          </p>
          <div className="inline-block px-8 py-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-accent)] mb-12 shadow-[0_0_30px_rgba(201,166,85,0.1)]">
            <span className="text-3xl font-mono font-black text-gradient-gold tracking-widest">{protocolo}</span>
          </div>
          <br/>
          <Link 
            to="/catalogo"
            className="inline-block px-8 py-3 rounded-full border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)] transition-all font-bold uppercase tracking-widest text-sm"
          >
            Voltar ao Catálogo
          </Link>
        </div>
      </StoreLayout>
    )
  }

  const desconto = cupom ? total - aplicarCupom(total, cupom) : 0
  const totalFinal = total - desconto + (frete?.valor ?? 0)

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link 
          to="/catalogo/carrinho" 
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Carrinho
        </Link>
        
        <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter text-white">Checkout</h1>

        {!profile && (
          <div className="rounded-2xl border border-red-400/40 bg-red-400/10 px-6 py-5 mb-12 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-red-400 shrink-0" />
            <p className="text-sm font-semibold text-white">
              É necessário estar <span className="text-red-400">logado</span> para finalizar a compra. Cada usuário possui seu próprio carrinho de produtos.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Formulário / Ações */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Seção Frete */}
            <div className="rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/50 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-input-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                  <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-xl font-bold text-white">Endereço de Entrega</h3>
              </div>
              
              <div className="flex gap-4">
                <input 
                  value={cep} 
                  onChange={(e) => setCep(e.target.value)} 
                  placeholder={t("catalogo.checkout.cepPlaceholder")} 
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-all text-white placeholder-[var(--color-text-muted)]"
                />
                <button 
                  onClick={handleBuscarCep} 
                  disabled={buscandoCep} 
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-[var(--color-surface-hover)] text-white hover:text-[var(--color-accent)] disabled:opacity-50 transition-colors"
                >
                  {buscandoCep ? t("common.loading") : t("catalogo.checkout.searchCep")}
                </button>
              </div>
              {endereco && (
                <div className="mt-6 p-4 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border-subtle)] flex items-start gap-3">
                  <Truck className="w-5 h-5 text-[var(--color-accent)] mt-1" />
                  <div>
                    <p className="font-semibold text-white">{endereco.logradouro}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{endereco.bairro}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{endereco.cidade} - {endereco.estado}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Seção Cupom */}
            <div className="rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/50 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-input-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                  <Tag className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-xl font-bold text-white">{t("catalogo.checkout.coupon")}</h3>
              </div>
              
              <div className="flex gap-4">
                <input 
                  value={cupomCodigo} 
                  onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())} 
                  placeholder="Código do cupom..." 
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-all text-white uppercase placeholder:normal-case placeholder-[var(--color-text-muted)]"
                />
                <button 
                  onClick={handleAplicarCupom} 
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-[var(--color-surface-hover)] text-white hover:text-[var(--color-accent)] transition-colors"
                >
                  Aplicar
                </button>
              </div>
              {cupomErro && <p className="text-sm font-bold text-red-400 mt-3">{cupomErro}</p>}
              {cupom && <p className="text-sm font-bold text-green-400 mt-3">Cupom {cupom.codigo} aplicado com sucesso!</p>}
            </div>

          </div>

          {/* Resumo Final */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/80 p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6 border-b border-[var(--color-border-subtle)] pb-4">{t("catalogo.checkout.summary")}</h3>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.sku} className="flex justify-between items-center text-sm">
                    <span className="text-[var(--color-text-muted)]">
                      <span className="text-white font-semibold">{item.quantidade}x</span> {item.nome}
                    </span>
                    <span className="font-mono text-white">{formatBRL(item.preco * item.quantidade)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-y border-[var(--color-border-subtle)] mb-6">
                <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                  <span>Subtotal</span>
                  <span className="text-white">{formatBRL(total)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-400">
                    <span>Desconto ({cupom?.codigo})</span>
                    <span>-{formatBRL(desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
                  <span>Frete{frete?.prazo_dias ? ` (${frete.prazo_dias} dias úteis)` : ""}</span>
                  {frete ? (
                    <span className="text-[var(--color-accent)] font-semibold">{formatBRL(frete.valor)}</span>
                  ) : freteErro ? (
                    <span className="text-red-400 font-semibold text-xs">{freteErro}</span>
                  ) : (
                    <span className="text-[var(--color-text-muted)]">Aguardando CEP</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{t("catalogo.checkout.total")}</span>
                <span className="text-4xl font-black text-gradient-gold">{formatBRL(totalFinal)}</span>
              </div>

              <button
                onClick={handleFinalizar}
                disabled={items.length === 0 || !profile || processando || !!freteErro || (isConsultor && !clienteAtivo) || (!isConsultor && !catalogoCliente)}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(201,166,85,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
              >
                <ShieldCheck className="w-5 h-5" /> {processando ? t("catalogo.checkout.processing") : t("catalogo.checkout.placeOrder")}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </StoreLayout>
  )
}
