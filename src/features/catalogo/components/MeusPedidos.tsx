import { Package } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { useAuth } from "~/lib/auth"
import { formatBRL } from "../services/carrinho.service"
import { useMeusPedidosCatalogo } from "../hooks/useCatalogo"
import { STATUS_PEDIDO_LABEL, STATUS_PEDIDO_COLOR } from "../types/pedidos"

export function MeusPedidos() {
  const { profile } = useAuth()
  const { data: pedidos, isLoading } = useMeusPedidosCatalogo(profile?.id)

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <h1 className="text-2xl font-black text-white">Meus Pedidos</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
          Pedidos da sua carteira, gerados a partir de orçamentos aprovados.
        </p>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : !pedidos || pedidos.length === 0 ? (
        <p className="text-gray-400">Nenhum pedido da sua carteira ainda.</p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--color-border-subtle)]">
                <TableHead className="text-gray-400 font-bold">Cliente</TableHead>
                <TableHead className="text-gray-400 font-bold">Valor Total</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="text-gray-400 font-bold">Rastreio</TableHead>
                <TableHead className="text-gray-400 font-bold">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((p) => (
                <TableRow key={p.id} className="border-b border-[var(--color-border-subtle)]">
                  <TableCell className="text-white">
                    <span className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      {p.cliente_nome ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">{formatBRL(p.valor_total)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_PEDIDO_COLOR[p.status]}>{STATUS_PEDIDO_LABEL[p.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-xs font-mono">{p.tracking_code ?? "—"}</TableCell>
                  <TableCell className="text-gray-400 text-sm">{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
