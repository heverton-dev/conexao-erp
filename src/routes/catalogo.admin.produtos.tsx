import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useAuth } from "~/core/auth/useAuth"
import {
  useTodosImplantes, useTodosKits, useAbutments,
  useToggleImplanteAtivo, useToggleKitAtivo, useToggleAbutmentAtivo,
  useRemoverImplante, useRemoverKit, useRemoverAbutment,
} from "~/features/catalogo/hooks/useCatalogo"
import { useState } from "react"
import { useDebounce } from "~/hooks/useDebounce"
import { Trash2, Plus, Pencil, Search, Package, ToggleRight, ToggleLeft } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { ProdutoFormModal } from "~/features/catalogo/components/admin/produtos/ProdutoFormModal"
import { ImportTrigger } from "~/features/catalogo/import/components/ImportTrigger"
import { TemplatesDropdown } from "~/features/catalogo/import/components/TemplatesDropdown"
import { Badge } from "~/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"

export const catalogoAdminProdutosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/produtos",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_produtos"]}>
      <EmpresaCrudGuard>
        <AdminProdutosPage />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})

function AdminProdutosPage() {
  const { profile } = useAuth()
  const isSuperAdmin = profile?.is_super_admin === true

  // Dados
  const { data: implantes, isLoading: loadingImplantes } = useTodosImplantes()
  const { data: abutments, isLoading: loadingAbutments } = useAbutments()
  const { data: kits, isLoading: loadingKits } = useTodosKits()

  // Mutations
  const toggleImplante = useToggleImplanteAtivo()
  const toggleKit = useToggleKitAtivo()
  const toggleAbutment = useToggleAbutmentAtivo()
  const removeImplante = useRemoverImplante()
  const removeKit = useRemoverKit()
  const removeAbutment = useRemoverAbutment()

  // UI State
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [itemParaDeletar, setItemParaDeletar] = useState<{ sku: string; tipoKey: string; nome: string } | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ sku: string; tipo: string } | null>(null)

  const loading = loadingImplantes || loadingAbutments || loadingKits

  // Montar lista unificada
  const allItems = [
    ...(implantes ?? []).map((i) => ({
      sku: i.sku,
      nome: `${i.linha?.familia?.nome ?? ""} ${i.diametro_mm}×${i.comprimento_mm}`,
      tipo: "Implante",
      tipoKey: "implante",
      ativo: i.ativo,
      preco: (i as any).preco ?? null,
    })),
    ...(abutments ?? []).map((a) => ({
      sku: a.sku,
      nome: `${a.tipo_abutment?.nome ?? ""} ${a.familia?.nome ?? ""}`,
      tipo: "Componente",
      tipoKey: "abutment",
      ativo: a.ativo,
      preco: (a as any).preco ?? null,
    })),
    ...(kits ?? []).map((k) => ({
      sku: k.sku,
      nome: k.nome,
      tipo: "Kit",
      tipoKey: "kit",
      ativo: k.ativo,
      preco: (k as any).preco ?? null,
    })),
  ]

  // Filtros (com debounce)
  const itensFiltrados = allItems.filter((item) => {
    const matchBusca = !debouncedSearch ||
      item.sku.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.nome.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchTipo = filtroTipo === "todos" || item.tipoKey === filtroTipo
    return matchBusca && matchTipo
  })

  function handleDelete() {
    if (!itemParaDeletar) return
    const { sku, tipoKey } = itemParaDeletar
    if (tipoKey === "implante") removeImplante.mutate(sku)
    else if (tipoKey === "kit") removeKit.mutate(sku)
    else removeAbutment.mutate(sku)
    setItemParaDeletar(null)
  }

  function handleToggle(sku: string, tipoKey: string, ativo: boolean) {
    if (tipoKey === "implante") toggleImplante.mutate({ sku, ativo: !ativo })
    else if (tipoKey === "abutment") toggleAbutment.mutate({ sku, ativo: !ativo })
    else if (tipoKey === "kit") toggleKit.mutate({ sku, ativo: !ativo })
  }

  function handleEdit(sku: string, tipoKey: string) {
    setEditingItem({ sku, tipo: tipoKey })
    setFormOpen(true)
  }

  function handleNew() {
    setEditingItem(null)
    setFormOpen(true)
  }

  const tipoBadgeColor: Record<string, string> = {
    implante: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    abutment: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    kit: "bg-green-500/15 text-green-400 border border-green-500/20",
  }

  const tipoLabel: Record<string, string> = {
    implante: "Implante",
    abutment: "Componente",
    kit: "Kit",
  }

  function formatBRL(v: number | null) {
    if (v == null) return "—"
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white">Gestão de Produtos</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
              Crie, edite, ative/inative ou exclua itens do catálogo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TemplatesDropdown />
            <ImportTrigger />
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
            >
              <Plus className="h-4 w-4" /> NOVO PRODUTO
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              placeholder="Buscar por SKU ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 pl-9 text-white placeholder-gray-500"
            />
          </div>
          <div className="flex gap-1">
            {[
              { key: "todos", label: "Todos" },
              { key: "implante", label: "Implantes" },
              { key: "abutment", label: "Componentes" },
              { key: "kit", label: "Kits" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltroTipo(f.key)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  filtroTipo === f.key
                    ? "bg-[#c9a655] text-[#0f172a]"
                    : "bg-[var(--color-surface)] text-gray-400 border border-white/10 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando produtos...</p>
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)]">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#c9a655]/20">
                  <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">SKU</TableHead>
                  <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Produto</TableHead>
                  <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Tipo</TableHead>
                  <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Preço</TableHead>
                  <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Ativo</TableHead>
                  <TableHead className="w-28 bg-gradient-to-r from-[#c9a655]/10 to-transparent"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensFiltrados.map((item, idx) => (
                  <TableRow
                    key={`${item.tipoKey}_${item.sku}`}
                    className={`${!item.ativo ? "opacity-40" : ""} ${idx % 2 === 0 ? "bg-[var(--color-surface)]/30" : "bg-transparent"} hover:bg-[#c9a655]/5 transition-colors border-b border-[var(--color-border-subtle)]/50`}
                  >
                    <TableCell className="font-mono text-xs text-[#c9a655]/80 tracking-wider">{item.sku}</TableCell>
                    <TableCell className="font-semibold text-white">{item.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${tipoBadgeColor[item.tipoKey] ?? "border-white/20 text-gray-300"} font-bold text-[10px] uppercase tracking-wider`}>
                        {tipoLabel[item.tipoKey] ?? item.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-bold text-sm">{formatBRL(item.preco)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggle(item.sku, item.tipoKey, item.ativo)}
                        className="transition-all hover:scale-110"
                        title={item.ativo ? "Desativar" : "Ativar"}
                      >
                        {item.ativo ? (
                          <ToggleRight className="h-7 w-7 text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                        ) : (
                          <ToggleLeft className="h-7 w-7 text-gray-500" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(item.sku, item.tipoKey)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#c9a655]/15 text-gray-400 hover:text-[#c9a655] transition-all hover:scale-110"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemParaDeletar(item)}
                          disabled={!isSuperAdmin}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isSuperAdmin ? "Excluir" : "Apenas super admin pode excluir"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Contador */}
        <div className="text-xs text-gray-500 text-right">
          {itensFiltrados.length} de {allItems.length} produtos
        </div>

        {/* AlertDialog de exclusão */}
        <AlertDialog open={!!itemParaDeletar} onOpenChange={(o) => !o && setItemParaDeletar(null)}>
          <AlertDialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Esta ação não pode ser desfeita. O produto <strong className="text-white">{itemParaDeletar?.sku}</strong> será removido permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[var(--color-surface)] border border-white/10 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de formulário */}
        <ProdutoFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          editingItem={editingItem}
          implantes={implantes}
        />
      </div>
    </AdminLayout>
  )
}

