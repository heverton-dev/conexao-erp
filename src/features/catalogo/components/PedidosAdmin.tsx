import { useState, useEffect } from "react"
import { Eye, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/components/ui/dialog"
import toast from "react-hot-toast"
import { useAuth } from "~/lib/auth"
import { useEmpresaCrudId } from "../contexts/EmpresaCrudContext"
import { listarPedidos, atualizarStatusPedido } from "../services/pedidos.service"
import { confirmarPagamento, estornarPagamento } from "../services/pagamentos.service"
import type { CatalogoPedido, StatusPedido } from "../types/pedidos"
import { STATUS_PEDIDO_LABEL, STATUS_PEDIDO_COLOR } from "../types/pedidos"
import { invalidateStockCache } from "../services/carrinho.service"
export function PedidosAdmin() {
  const { profile } = useAuth()
  const empresaId = useEmpresaCrudId()
  const [pedidos, setPedidos] = useState<CatalogoPedido[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [detailPedido, setDetailPedido] = useState<CatalogoPedido | null>(null)

  async function load() {
    if (!empresaId) return
    setLoading(true)
    try {
      setPedidos(await listarPedidos({ search: search || undefined }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [empresaId, search])

  async function handleStatusChange(id: string, status: StatusPedido) {
    await atualizarStatusPedido(id, status)
    load()
    if (detailPedido?.id === id) {
      setDetailPedido({ ...detailPedido!, status })
    }
  }

  function formatBRL(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Pedidos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>Acompanhe e gerencie todos os pedidos do catálogo.</p>
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-4">
        <input
          placeholder="Buscar por nome ou email do cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : pedidos.length === 0 ? (
        <p className="text-gray-400">Nenhum pedido encontrado.</p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--color-border-subtle)]">
                <TableHead className="text-gray-400 font-bold">#</TableHead>
                <TableHead className="text-gray-400 font-bold">Cliente</TableHead>
                <TableHead className="text-gray-400 font-bold">Valor Total</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="text-gray-400 font-bold">Data</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((p) => (
                <TableRow key={p.id} className="border-b border-[var(--color-border-subtle)]">
                  <TableCell className="font-mono text-xs text-gray-300">{p.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-white">{p.cliente_nome ?? "—"}</TableCell>
                  <TableCell className="text-gray-300">{formatBRL(p.valor_total)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_PEDIDO_COLOR[p.status]}>
                      {STATUS_PEDIDO_LABEL[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => setDetailPedido(p)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de detalhe */}
      <Dialog open={!!detailPedido} onOpenChange={(o) => !o && setDetailPedido(null)}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-white">Pedido #{detailPedido?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {detailPedido && (
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Cliente</span>
                  <p className="text-white">{detailPedido.cliente_nome ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</span>
                  <p className="text-white">{detailPedido.cliente_email ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</span>
                  <Badge className={STATUS_PEDIDO_COLOR[detailPedido.status]}>
                    {STATUS_PEDIDO_LABEL[detailPedido.status]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total</span>
                  <p className="text-white font-bold">{formatBRL(detailPedido.valor_total)}</p>
                </div>
              </div>

              {detailPedido.itens && detailPedido.itens.length > 0 && (
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10">
                        <TableHead className="text-gray-400 font-bold">Produto</TableHead>
                        <TableHead className="text-gray-400 font-bold text-center">Qtd</TableHead>
                        <TableHead className="text-gray-400 font-bold text-right">Preço Unit.</TableHead>
                        <TableHead className="text-gray-400 font-bold text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailPedido.itens.map((item) => (
                        <TableRow key={item.id} className="border-b border-white/5">
                          <TableCell className="text-white">{item.produto_nome}</TableCell>
                          <TableCell className="text-center text-gray-300">{item.quantidade}</TableCell>
                          <TableCell className="text-right text-gray-300">{formatBRL(item.preco_unitario)}</TableCell>
                          <TableCell className="text-right text-gray-300">{formatBRL(item.preco_unitario * item.quantidade)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Ações de pagamento */}
              {detailPedido.status === "pendente" && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-400 font-bold mb-3">Pagamento Pendente</p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await confirmarPagamento(detailPedido.id)
                          toast.success("Pagamento confirmado! Estoque baixado.")
                          load()
                          setDetailPedido({ ...detailPedido, status: "pago" })
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Erro ao confirmar pagamento")
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-bold"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirmar Pagamento
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await estornarPagamento(detailPedido.id)
                          toast.success("Pagamento estornado!")
                          load()
                          setDetailPedido({ ...detailPedido, status: "cancelado" })
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Erro ao estornar pagamento")
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-bold"
                    >
                      <XCircle className="w-4 h-4" /> Estornar
                    </button>
                  </div>
                </div>
              )}

              {/* Tracking code */}
              {detailPedido.status === "enviado" && (
                <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <p className="text-sm text-cyan-400 font-bold mb-2">Código de Rastreio</p>
                  <p className="text-white font-mono">{detailPedido.tracking_code ?? "Não informado"}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-2">
                {(["confirmado", "separando", "enviado", "entregue", "cancelado"] as StatusPedido[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(detailPedido.id, s)}
                      disabled={detailPedido.status === s}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                        detailPedido.status === s
                          ? "bg-[#c9a655] text-[#0f172a]"
                          : "bg-[var(--color-surface)] border border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {STATUS_PEDIDO_LABEL[s]}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
