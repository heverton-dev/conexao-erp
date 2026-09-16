import { createRoute, useParams, Link } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { useCatalogoCliente } from "~/features/catalogo/hooks/useCatalogoCliente"
import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase"
import type { CatalogoPedido } from "~/features/catalogo/types/pedidos"
import { STATUS_PEDIDO_LABEL, STATUS_PEDIDO_COLOR } from "~/features/catalogo/types/pedidos"
import { Badge } from "~/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"

export const catalogoLojaPedidoDetalheRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loja/$slug/pedidos/$pedidoId",
  component: LojaPedidoDetalhePage,
})

function LojaPedidoDetalhePage() {
  const { slug, pedidoId } = useParams({ from: "/loja/$slug/pedidos/$pedidoId" })
  const { cliente, isLogado, loading: authLoading } = useCatalogoCliente()
  const [pedido, setPedido] = useState<CatalogoPedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { t } = useTranslation()

  useEffect(() => {
    if (!isLogado || !cliente) return
    async function load() {
      try {
        const { data, error: err } = await supabase
          .from("catalogo_pedidos")
          .select("*, itens:catalogo_pedido_itens(*)")
          .eq("id", pedidoId)
          .eq("cliente_id", cliente!.id)
          .single()

        if (err || !data) {
          setError("Pedido não encontrado")
        } else {
          setPedido(data as CatalogoPedido)
        }
      } catch {
        setError("Erro ao carregar pedido")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isLogado, cliente, pedidoId])

  if (authLoading || loading) {
    return (
      <StoreLayout>
        <div className="p-8 text-center text-[var(--color-text-muted)]">{t("common.loading")}</div>
      </StoreLayout>
    )
  }

  if (!isLogado) {
    return (
      <StoreLayout>
        <div className="p-8 text-center">
          <p className="text-[var(--color-text-muted)] mb-4">Faça login para acompanhar seus pedidos.</p>
          <Link to="/loja/$slug/login" params={{ slug }} className="text-[var(--color-accent)] hover:underline">
            Entrar
          </Link>
        </div>
      </StoreLayout>
    )
  }

  if (error || !pedido) {
    return (
      <StoreLayout>
        <div className="p-8 text-center">
          <p className="text-red-400 mb-4">{error || "Pedido não encontrado"}</p>
          <Link to="/loja/$slug/pedidos" params={{ slug }} className="text-[var(--color-accent)] hover:underline">
            ← Voltar para meus pedidos
          </Link>
        </div>
      </StoreLayout>
    )
  }

  function formatBRL(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  const statusSteps = ["pendente", "pago", "confirmado", "separando", "enviado", "entregue"] as const
  const currentStepIndex = statusSteps.indexOf(pedido.status as any)

  return (
    <StoreLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/loja/$slug/pedidos"
            params={{ slug }}
            className="p-2 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Pedido #{pedido.id.slice(0, 8)}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Timeline de status */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Acompanhamento</h2>
          <div className="flex items-center justify-between relative">
            {/* Linha de fundo */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-[var(--color-border-subtle)]" />
            {/* Linha progresso */}
            <div
              className="absolute top-4 left-0 h-0.5 bg-[var(--color-accent)] transition-all"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />

            {statusSteps.map((step, i) => {
              const isActive = i <= currentStepIndex
              const isCurrent = i === currentStepIndex
              const Icon = i === 0 ? Clock : i === 1 ? Package : i < 4 ? Package : i === 4 ? Truck : CheckCircle
              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-[var(--color-accent)] text-[#0f172a]"
                      : "bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]"
                  } ${isCurrent ? "ring-2 ring-[var(--color-accent)]/50" : ""}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"
                  }`}>
                    {STATUS_PEDIDO_LABEL[step]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tracking */}
        {pedido.tracking_code && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Código de Rastreio</h2>
            </div>
            <p className="text-white font-mono text-lg">{pedido.tracking_code}</p>
          </div>
        )}

        {/* Endereço */}
        {pedido.endereco_entrega && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Endereço de Entrega</h2>
            </div>
            <p className="text-white">
              {(pedido.endereco_entrega as any)?.logradouro}, {(pedido.endereco_entrega as any)?.bairro}
            </p>
            <p className="text-[var(--color-text-muted)]">
              {(pedido.endereco_entrega as any)?.cidade} - {(pedido.endereco_entrega as any)?.estado}
            </p>
          </div>
        )}

        {/* Itens */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Itens do Pedido</h2>
          {pedido.itens && pedido.itens.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--color-border-subtle)]">
                  <TableHead className="text-[var(--color-text-muted)] font-bold">Produto</TableHead>
                  <TableHead className="text-[var(--color-text-muted)] font-bold text-center">Qtd</TableHead>
                  <TableHead className="text-[var(--color-text-muted)] font-bold text-right">Preço Unit.</TableHead>
                  <TableHead className="text-[var(--color-text-muted)] font-bold text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedido.itens.map((item) => (
                  <TableRow key={item.id} className="border-b border-[var(--color-border-subtle)]/50">
                    <TableCell className="text-white">{item.produto_nome}</TableCell>
                    <TableCell className="text-center text-[var(--color-text-muted)]">{item.quantidade}</TableCell>
                    <TableCell className="text-right text-[var(--color-text-muted)]">{formatBRL(item.preco_unitario)}</TableCell>
                    <TableCell className="text-right text-[var(--color-text-muted)]">{formatBRL(item.preco_unitario * item.quantidade)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-[var(--color-text-muted)]">Nenhum item encontrado.</p>
          )}
        </div>

        {/* Resumo */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Subtotal</span>
              <span className="text-white">{formatBRL(pedido.valor_subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Frete</span>
              <span className="text-white">{formatBRL(pedido.valor_frete)}</span>
            </div>
            {pedido.valor_desconto > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Desconto</span>
                <span className="text-green-400">-{formatBRL(pedido.valor_desconto)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[var(--color-border-subtle)]">
              <span className="text-white font-bold">Total</span>
              <span className="text-[var(--color-accent)] font-bold text-lg">{formatBRL(pedido.valor_total)}</span>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}
