import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/components/ui/dialog"
import { useAuth } from "~/lib/auth"
import { useEmpresaCrudId } from "../contexts/EmpresaCrudContext"
import { listarOrcamentos } from "../services/orcamentos.service"
import type { CatalogoOrcamento } from "../types/orcamentos"
import { STATUS_ORCAMENTO_LABEL, STATUS_ORCAMENTO_COLOR } from "../types/orcamentos"

export function OrcamentosAdmin() {
  const { profile } = useAuth()
  const empresaId = useEmpresaCrudId()
  const [orcamentos, setOrcamentos] = useState<CatalogoOrcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [detailOrc, setDetailOrc] = useState<CatalogoOrcamento | null>(null)

  async function load() {
    if (!empresaId) return
    setLoading(true)
    try {
      setOrcamentos(await listarOrcamentos({ search: search || undefined }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [empresaId, search])

  function formatBRL(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Orçamentos</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>Visualize e gerencie orçamentos criados por colaboradores.</p>
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-4">
        <input
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : orcamentos.length === 0 ? (
        <p className="text-gray-400">Nenhum orçamento encontrado.</p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--color-border-subtle)]">
                <TableHead className="text-gray-400 font-bold">#</TableHead>
                <TableHead className="text-gray-400 font-bold">Cliente</TableHead>
                <TableHead className="text-gray-400 font-bold">Colaborador</TableHead>
                <TableHead className="text-gray-400 font-bold">Valor Total</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="text-gray-400 font-bold">Data</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentos.map((o) => (
                <TableRow key={o.id} className="border-b border-[var(--color-border-subtle)]">
                  <TableCell className="font-mono text-xs text-gray-300">{o.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-white">{o.cliente_nome ?? "—"}</TableCell>
                  <TableCell className="text-gray-300">{(o.colaborador as any)?.nome ?? "—"}</TableCell>
                  <TableCell className="text-gray-300">{formatBRL(o.valor_total)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_ORCAMENTO_COLOR[o.status]}>
                      {STATUS_ORCAMENTO_LABEL[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => setDetailOrc(o)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
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
      <Dialog open={!!detailOrc} onOpenChange={(o) => !o && setDetailOrc(null)}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-white">Orçamento #{detailOrc?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {detailOrc && (
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Cliente</span>
                  <p className="text-white">{detailOrc.cliente_nome ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</span>
                  <p className="text-white">{detailOrc.cliente_email ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</span>
                  <Badge className={STATUS_ORCAMENTO_COLOR[detailOrc.status]}>
                    {STATUS_ORCAMENTO_LABEL[detailOrc.status]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total</span>
                  <p className="text-white font-bold">{formatBRL(detailOrc.valor_total)}</p>
                </div>
              </div>

              {detailOrc.itens && detailOrc.itens.length > 0 && (
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
                      {detailOrc.itens.map((item) => (
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

              {detailOrc.observacoes && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Observações</span>
                  <p className="text-gray-300 text-sm">{detailOrc.observacoes}</p>
                </div>
              )}

              <div className="space-y-1 pt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Token de Acesso</span>
                <code className="block bg-[var(--color-surface)] border border-white/10 px-3 py-2 rounded-lg text-xs text-gray-300 break-all">{detailOrc.token_acesso}</code>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
