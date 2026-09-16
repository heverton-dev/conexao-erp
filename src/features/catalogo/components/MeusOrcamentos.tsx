import { useState } from "react"
import { FileText, ShoppingCart, Send, ArrowRightCircle } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { useAuth, useCan } from "~/lib/auth"
import { useCarrinho, cartTotais, formatBRL, clearCart } from "../services/carrinho.service"
import { useClienteAtivo } from "../contexts/cliente-ativo"
import {
  useMeusOrcamentosCatalogo,
  useCriarOrcamentoCatalogo,
  useAtualizarStatusOrcamento,
  useConverterOrcamentoPedido,
} from "../hooks/useCatalogo"
import { STATUS_ORCAMENTO_LABEL, STATUS_ORCAMENTO_COLOR, type CatalogoOrcamento } from "../types/orcamentos"
import toast from "react-hot-toast"

export function MeusOrcamentos() {
  const { profile } = useAuth()
  const { clienteAtivo } = useClienteAtivo()
  const cart = useCarrinho()
  const { total } = cartTotais(cart)
  const { data: orcamentos, isLoading } = useMeusOrcamentosCatalogo(profile?.id)
  const criarMut = useCriarOrcamentoCatalogo()
  const statusMut = useAtualizarStatusOrcamento()
  const converterMut = useConverterOrcamentoPedido()
  const [detalhe, setDetalhe] = useState<CatalogoOrcamento | null>(null)

  const podeCriar = useCan("catalogo_colab_criar_orcamento")
  const podeConverter = useCan("catalogo_colab_converter_pedido")

  function handleGerarOrcamento() {
    if (!profile) return
    if (!clienteAtivo) {
      toast.error("Selecione um cliente da carteira antes de gerar o orçamento")
      return
    }
    if (cart.length === 0) {
      toast.error("Adicione produtos ao carrinho antes de gerar o orçamento")
      return
    }
    criarMut.mutate(
      {
        colaboradorId: profile.id,
        input: {
          cliente_crm_id: clienteAtivo.id,
          itens: cart.map((item) => ({
            produto_sku: item.sku,
            produto_tipo: item.tipo,
            produto_nome: item.nome,
            quantidade: item.quantidade,
            preco_unitario: item.preco,
          })),
        },
      },
      {
        onSuccess: () => {
          clearCart()
          toast.success(`Orçamento gerado para ${clienteAtivo.nomeDoutor}`)
        },
        onError: () => toast.error("Erro ao gerar orçamento"),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Meus Orçamentos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
            Orçamentos que você criou pra clientes da sua carteira.
          </p>
        </div>
        {podeCriar && (
          <button
            onClick={handleGerarOrcamento}
            disabled={criarMut.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
          >
            <ShoppingCart className="h-4 w-4" />
            Gerar do carrinho {cart.length > 0 ? `(${cart.length} · ${formatBRL(total)})` : ""}
          </button>
        )}
      </div>

      {!clienteAtivo && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Selecione um cliente da carteira no topo da página pra montar um orçamento com o desconto do grupo dele aplicado.
        </p>
      )}

      {isLoading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : !orcamentos || orcamentos.length === 0 ? (
        <p className="text-gray-400">Você ainda não criou nenhum orçamento.</p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--color-border-subtle)]">
                <TableHead className="text-gray-400 font-bold">Cliente</TableHead>
                <TableHead className="text-gray-400 font-bold">Valor Total</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="text-gray-400 font-bold">Data</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentos.map((o) => (
                <TableRow key={o.id} className="border-b border-[var(--color-border-subtle)]">
                  <TableCell className="text-white cursor-pointer" onClick={() => setDetalhe(o)}>
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      {o.cliente_nome ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">{formatBRL(o.valor_total)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_ORCAMENTO_COLOR[o.status]}>{STATUS_ORCAMENTO_LABEL[o.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {o.status === "rascunho" && (
                        <button
                          title="Enviar pro cliente"
                          onClick={() => statusMut.mutate({ id: o.id, status: "enviado" })}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {podeConverter && o.status === "aprovado" && (
                        <button
                          title="Converter em pedido"
                          onClick={() => converterMut.mutate(o.id, { onSuccess: () => toast.success("Pedido criado") })}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655] transition-colors"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-white">Orçamento — {detalhe?.cliente_nome ?? "—"}</DialogTitle>
          </DialogHeader>
          {detalhe?.itens && (
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10">
                    <TableHead className="text-gray-400 font-bold">Produto</TableHead>
                    <TableHead className="text-gray-400 font-bold text-center">Qtd</TableHead>
                    <TableHead className="text-gray-400 font-bold text-right">Preço Unit.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalhe.itens.map((item) => (
                    <TableRow key={item.id} className="border-b border-white/5">
                      <TableCell className="text-white">{item.produto_nome}</TableCell>
                      <TableCell className="text-center text-gray-300">{item.quantidade}</TableCell>
                      <TableCell className="text-right text-gray-300">{formatBRL(item.preco_unitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
