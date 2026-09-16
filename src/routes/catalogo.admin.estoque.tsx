import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { RequirePermission } from "~/components/guards"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState } from "react"
import { useListaEstoque, useAtualizarEstoque } from "~/features/catalogo/hooks/useCatalogo"
import { EstoqueBadge } from "~/features/catalogo/components/admin/produtos/EstoqueBadge"
import type { EstoqueItem } from "~/features/catalogo/services/estoque.service"
import { Package, Search, AlertTriangle } from "lucide-react"
import { CATALOGO_TIPO_LABEL, type ProductSheetTipo } from "~/features/catalogo/types"

export const catalogoAdminEstoqueRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/estoque",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_dashboard"]}>
      <AdminEstoquePage />
    </RequirePermission>
  ),
})

function AdminEstoquePage() {
  const [filtroTipo, setFiltroTipo] = useState<string>("")
  const [busca, setBusca] = useState("")
  const [editando, setEditando] = useState<string | null>(null)
  const [qtdTemp, setQtdTemp] = useState<number>(0)
  const [minimaTemp, setMinimaTemp] = useState<number>(0)

  const { data: itens = [], isLoading } = useListaEstoque(filtroTipo || undefined)
  const atualizarEstoque = useAtualizarEstoque()

  const itensFiltrados = itens.filter((item) =>
    busca ? item.nome.toLowerCase().includes(busca.toLowerCase()) || item.sku.toLowerCase().includes(busca.toLowerCase()) : true,
  )

  const estoqueBaixo = itensFiltrados.filter(
    (item) => item.qtd_minima_aviso > 0 && item.qtd_disponivel <= item.qtd_minima_aviso,
  )

  function iniciarEdicao(item: EstoqueItem) {
    setEditando(item.sku)
    setQtdTemp(item.qtd_disponivel)
    setMinimaTemp(item.qtd_minima_aviso)
  }

  function cancelarEdicao() {
    setEditando(null)
  }

  async function salvarEdicao(item: EstoqueItem) {
    await atualizarEstoque.mutateAsync({
      sku: item.sku,
      tipo: item.tipo,
      qtdDisponivel: qtdTemp,
      qtdMinimaAviso: minimaTemp,
    })
    setEditando(null)
  }

  const tipos = [...new Set(itens.map((i) => i.tipo))].sort()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-[var(--color-accent)]" />
            <div>
              <h1 className="text-2xl font-black text-white">Gestão de Estoque</h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
                Gerencie quantidades disponíveis e alertas mínimos.
              </p>
            </div>
          </div>
          {estoqueBaixo.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{estoqueBaixo.length} produtos com estoque baixo</span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              placeholder="Buscar por nome ou SKU..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface)] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-3 bg-[var(--color-surface)] border border-white/10 rounded-lg text-white text-sm"
          >
            <option value="">Todos os tipos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>{CATALOGO_TIPO_LABEL[t as ProductSheetTipo] ?? t}</option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <p className="text-[var(--color-text-muted)]">Carregando...</p>
        ) : itensFiltrados.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">Nenhum produto encontrado.</p>
        ) : (
          <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Tipo</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Qtd Disponível</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Mín. Aviso</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensFiltrados.map((item) => (
                  <tr key={item.sku} className="border-b border-[var(--color-border-subtle)]/50 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white text-sm font-medium">{item.nome}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs font-mono">{item.sku}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--color-surface)] border border-white/10 text-[var(--color-text-muted)]">
                        {CATALOGO_TIPO_LABEL[item.tipo as ProductSheetTipo] ?? item.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editando === item.sku ? (
                        <input
                          type="number"
                          value={qtdTemp}
                          onChange={(e) => setQtdTemp(Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-[var(--color-surface)] border border-white/20 rounded text-white text-center text-sm"
                        />
                      ) : (
                        <span className={`font-bold ${item.qtd_disponivel < 1 ? "text-red-400" : item.qtd_disponivel <= item.qtd_minima_aviso ? "text-amber-400" : "text-emerald-400"}`}>
                          {item.qtd_disponivel}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editando === item.sku ? (
                        <input
                          type="number"
                          value={minimaTemp}
                          onChange={(e) => setMinimaTemp(Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-[var(--color-surface)] border border-white/20 rounded text-white text-center text-sm"
                        />
                      ) : (
                        <span className="text-[var(--color-text-muted)] text-sm">{item.qtd_minima_aviso}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EstoqueBadge qtdDisponivel={item.qtd_disponivel} qtdMinimaAviso={item.qtd_minima_aviso} compacto />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editando === item.sku ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => salvarEdicao(item)}
                            disabled={atualizarEstoque.isPending}
                            className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-xs font-bold"
                          >
                            {atualizarEstoque.isPending ? "..." : "Salvar"}
                          </button>
                          <button
                            onClick={cancelarEdicao}
                            className="px-3 py-1 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors text-xs font-bold"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => iniciarEdicao(item)}
                          className="px-3 py-1 rounded-lg bg-[var(--color-surface)] border border-white/10 text-gray-300 hover:bg-white/10 transition-colors text-xs font-bold"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
