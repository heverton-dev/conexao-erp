import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table"
import { useAuth } from "~/lib/auth"
import { useEmpresaCrudId } from "../contexts/EmpresaCrudContext"
import {
  listarSolicitacoes, responderSolicitacao,
} from "../services/solicitacoes.service"
import type { CatalogoSolicitacaoAcesso, SolicitacaoStatus } from "../types/clientes"

const STATUS_LABEL: Record<SolicitacaoStatus, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
}

const STATUS_COLOR: Record<SolicitacaoStatus, string> = {
  pendente: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  aprovada: "bg-green-500/15 text-green-400 border border-green-500/20",
  rejeitada: "bg-red-500/15 text-red-400 border border-red-500/20",
}

export function SolicitacoesAdmin() {
  const { profile } = useAuth()
  const empresaId = useEmpresaCrudId()
  const userId = profile?.id ?? ""
  const [solicitacoes, setSolicitacoes] = useState<CatalogoSolicitacaoAcesso[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!empresaId) return
    setLoading(true)
    try {
      setSolicitacoes(await listarSolicitacoes())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [empresaId])

  async function handleResponder(id: string, status: "aprovada" | "rejeitada") {
    await responderSolicitacao(id, status, userId)
    load()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Solicitações de Acesso</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>Aprove ou rejeite solicitações de acesso de visitantes.</p>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : solicitacoes.length === 0 ? (
        <p className="text-gray-400">Nenhuma solicitação encontrada.</p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--color-border-subtle)]">
                <TableHead className="text-gray-400 font-bold">Nome</TableHead>
                <TableHead className="text-gray-400 font-bold">Email</TableHead>
                <TableHead className="text-gray-400 font-bold">Telefone</TableHead>
                <TableHead className="text-gray-400 font-bold">Mensagem</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="text-gray-400 font-bold">Data</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitacoes.map((s) => (
                <TableRow key={s.id} className="border-b border-[var(--color-border-subtle)]">
                  <TableCell className="font-medium text-white">{s.nome}</TableCell>
                  <TableCell className="text-gray-300">{s.email}</TableCell>
                  <TableCell className="text-gray-300">{s.telefone ?? "—"}</TableCell>
                  <TableCell className="text-gray-400 max-w-[200px] truncate">{s.mensagem ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLOR[s.status]}>
                      {STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {s.status === "pendente" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleResponder(s.id, "aprovada")}
                          title="Aprovar"
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResponder(s.id, "rejeitada")}
                          title="Rejeitar"
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
