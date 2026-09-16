import { useState, useEffect } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table"
import { buscarOrcamentoPorToken, atualizarStatusOrcamentoPorToken } from "../services/orcamentos.service"
import { STATUS_ORCAMENTO_LABEL, STATUS_ORCAMENTO_COLOR, type CatalogoOrcamento, type StatusOrcamento } from "../types/orcamentos"
import { useTranslation } from "react-i18next"
import { PublicLangWrapper } from "./PublicLangWrapper"

interface OrcamentoPublicoProps {
  token: string
}

function OrcamentoPublicoContent({ token }: OrcamentoPublicoProps) {
  const [orcamento, setOrcamento] = useState<CatalogoOrcamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { t } = useTranslation()

  useEffect(() => {
    async function load() {
      try {
        const data = await buscarOrcamentoPorToken(token)
        if (!data) {
          setError(t("catalogo.quote.notFound"))
        } else {
          setOrcamento(data)
        }
      } catch {
        setError(t("catalogo.quote.errorLoad"))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, t])

  async function handleAprovar() {
    if (!orcamento) return
    setActionLoading(true)
    try {
      await atualizarStatusOrcamentoPorToken(token, "aprovado")
      setSuccess(t("catalogo.quote.approved"))
      setOrcamento({ ...orcamento, status: "aprovado" })
    } catch {
      setError(t("catalogo.quote.errorApprove"))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReprovar() {
    if (!orcamento) return
    setActionLoading(true)
    try {
      await atualizarStatusOrcamentoPorToken(token, "reprovado")
      setSuccess(t("catalogo.quote.rejected"))
      setOrcamento({ ...orcamento, status: "reprovado" })
    } catch {
      setError(t("catalogo.quote.errorReject"))
    } finally {
      setActionLoading(false)
    }
  }
  function formatBRL(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
    )
  }

  if (error && !orcamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  if (!orcamento) return null

  const isPending = orcamento.status === "rascunho" || orcamento.status === "enviado"
  const isTerminal = ["aprovado", "reprovado", "pedido", "expirado"].includes(orcamento.status)

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{t("catalogo.quote.title")}</h1>
          <p className="text-[var(--color-text-muted)]">
            {orcamento.cliente_nome && `Olá, ${orcamento.cliente_nome}! `}
            {t("catalogo.quote.checkItems")}
          </p>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border-subtle)] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[var(--color-text-muted)]">
              {t("catalogo.quote.title")} #{orcamento.id.slice(0, 8)}
            </span>
            <Badge className={STATUS_ORCAMENTO_COLOR[orcamento.status]}>
              {STATUS_ORCAMENTO_LABEL[orcamento.status]}
            </Badge>
          </div>

          {orcamento.itens && orcamento.itens.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("catalogo.quote.product")}</TableHead>
                  <TableHead className="text-center">{t("catalogo.quote.qty")}</TableHead>
                  <TableHead className="text-right">{t("catalogo.quote.unitPrice")}</TableHead>
                  <TableHead className="text-right">{t("catalogo.quote.subtotal")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamento.itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.produto_nome}</TableCell>
                    <TableCell className="text-center">{item.quantidade}</TableCell>
                    <TableCell className="text-right">{formatBRL(item.preco_unitario)}</TableCell>
                    <TableCell className="text-right">{formatBRL(item.preco_unitario * item.quantidade)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="text-right">
              <p className="text-sm text-[var(--color-text-muted)]">{t("catalogo.quote.total")}</p>
              <p className="text-2xl font-bold text-[var(--color-accent)]">
                {formatBRL(orcamento.valor_total)}
              </p>
            </div>
          </div>

          {orcamento.observacoes && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <p className="text-sm text-[var(--color-text-muted)]">{t("catalogo.quote.observations")}</p>
              <p className="text-sm">{orcamento.observacoes}</p>
            </div>
          )}
        </div>

        {success && (
          <div className="bg-green-900/30 border border-green-500/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {isPending && (
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleAprovar}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {t("catalogo.quote.approve")}
            </Button>
            <Button
              onClick={handleReprovar}
              disabled={actionLoading}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-900/20"
            >
              <X className="w-4 h-4 mr-2" />
              {t("catalogo.quote.reject")}
            </Button>
          </div>
        )}

        {isTerminal && !success && (
          <div className="text-center">
            <p className="text-[var(--color-text-muted)]">
              {orcamento.status === "aprovado" && t("catalogo.quote.approvedStatus")}
              {orcamento.status === "reprovado" && t("catalogo.quote.rejectedStatus")}
              {orcamento.status === "pedido" && t("catalogo.quote.convertedStatus")}
              {orcamento.status === "expirado" && t("catalogo.quote.expiredStatus")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function OrcamentoPublico({ token }: OrcamentoPublicoProps) {
  return (
    <PublicLangWrapper>
      <OrcamentoPublicoContent token={token} />
    </PublicLangWrapper>
  )
}
