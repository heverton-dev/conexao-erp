import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useAuth } from "~/core/auth/useAuth"
import { useState } from "react"
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft } from "lucide-react"
import { useCategorias, useCriarCategoria, useAtualizarCategoria, useRemoverCategoria, useToggleCategoriaAtivo } from "~/features/catalogo/hooks/useCatalogo"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import toast from "react-hot-toast"
import type { CatalogoCategoria } from "~/features/catalogo/types"

export const catalogoAdminCategoriasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/categorias",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_cadastros"]}>
      <EmpresaCrudGuard>
        <AdminCategoriasPage />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})

const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

function AdminCategoriasPage() {
  const { profile } = useAuth()
  const isSuperAdmin = profile?.is_super_admin === true

  const { data: categorias, isLoading } = useCategorias()
  const criarCategoria = useCriarCategoria()
  const atualizarCategoria = useAtualizarCategoria()
  const removerCategoria = useRemoverCategoria()
  const toggleCategoriaAtivo = useToggleCategoriaAtivo()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogoCategoria | null>(null)
  const [deleteItem, setDeleteItem] = useState<CatalogoCategoria | null>(null)

  // Form state
  const [nome, setNome] = useState("")
  const [sigla, setSigla] = useState("")
  const [locked, setLocked] = useState(false)
  const [ativo, setAtivo] = useState(true)

  function openNew() {
    setEditing(null)
    setNome(""); setSigla(""); setLocked(false); setAtivo(true)
    setModalOpen(true)
  }

  function openEdit(cat: CatalogoCategoria) {
    setEditing(cat)
    setNome(cat.nome); setSigla(cat.sigla ?? ""); setLocked(cat.locked); setAtivo(cat.ativo)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!nome.trim()) { toast.error("Nome é obrigatório"); return }
    try {
      if (editing) {
        await atualizarCategoria.mutateAsync({ id: editing.id, input: { nome: nome.trim(), sigla: sigla.trim() || undefined } })
      } else {
        await criarCategoria.mutateAsync({ nome: nome.trim(), sigla: sigla.trim() || undefined, locked, ativo })
      }
      toast.success(editing ? "Categoria atualizada!" : "Categoria criada!")
      setModalOpen(false)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!deleteItem) return
    try {
      await removerCategoria.mutateAsync(deleteItem.id)
      toast.success("Categoria excluída!")
      setDeleteItem(null)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function toggleAtivo(cat: CatalogoCategoria) {
    // Apenas SUPER ADMIN pode alterar categorias pré-definidas (locked)
    if (cat.locked && !isSuperAdmin) {
      toast.error("Apenas Super Admin pode alterar categorias pré-definidas")
      return
    }
    toggleCategoriaAtivo.mutate({ id: cat.id, ativo: !cat.ativo })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white">Categorias</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
              Cadastre e gerencie as categorias de produtos do catálogo.
            </p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105 shrink-0" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}>
            <Plus className="h-4 w-4" /> NOVA CATEGORIA
          </button>
        </div>

        <div className="rounded-2xl border bg-[var(--color-surface)]/50 backdrop-blur-md shadow-xl overflow-hidden" style={{ borderColor: "rgba(201,166,85,0.15)" }}>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#c9a655]/20">
                <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Nome</TableHead>
                <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Sigla</TableHead>
                <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Pré-definido</TableHead>
                <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Ativo</TableHead>
                <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="p-8 text-center text-text-muted">Carregando...</TableCell></TableRow>}
              {!isLoading && (categorias ?? []).map((cat, i) => {
                const bloqueado = cat.locked && !isSuperAdmin
                return (
                <TableRow key={cat.id} className={`${i % 2 === 0 ? "bg-[var(--color-surface)]/30" : "bg-transparent"} hover:bg-[#c9a655]/5 transition-colors border-b border-[var(--color-border-subtle)]/50 ${bloqueado ? "opacity-70" : ""}`}>
                  <TableCell className="text-sm font-medium text-white">{cat.nome}</TableCell>
                  <TableCell className="text-sm text-gray-300">{cat.sigla ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {cat.locked ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-[#c9a655]/10 text-[#c9a655] border border-[#c9a655]/20">Pré-definido</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleAtivo(cat)}
                      disabled={bloqueado}
                      className="transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={bloqueado ? "Apenas Super Admin pode alterar" : ""}
                    >
                      {cat.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        disabled={bloqueado}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={bloqueado ? "Apenas Super Admin pode editar" : "Editar"}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(cat)}
                        disabled={bloqueado}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={bloqueado ? "Apenas Super Admin pode excluir" : "Excluir"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
              {!isLoading && (!categorias || categorias.length === 0) && (
                <TableRow><TableCell colSpan={5} className="p-8 text-center text-text-muted">Nenhuma categoria cadastrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Criar/Editar Categoria */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-white">{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editing ? "Altere os campos abaixo." : "Preencha os dados para criar uma nova categoria."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Nome */}
            <div className="space-y-2">
              <label className={labelCls}>Nome <span className="text-red-400">*</span></label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} placeholder="Ex: Implantes, Componentes..." />
            </div>

            {/* Sigla */}
            <div className="space-y-2">
              <label className={labelCls}>Sigla</label>
              <input type="text" value={sigla} onChange={(e) => setSigla(e.target.value)} className={inputCls} placeholder="Ex: IMP, CPS..." />
            </div>

            {/* Locked (apenas Super Admin) */}
            {isSuperAdmin && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{locked ? "Pré-definido" : "Normal"}</p>
                  <p className="text-xs text-gray-400">Registros pré-definidos não podem ser alterados por usuários comuns</p>
                </div>
                <Switch checked={locked} onCheckedChange={setLocked} />
              </div>
            )}

            {/* Ativo */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">{ativo ? "Ativo" : "Inativo"}</p>
                <p className="text-xs text-gray-400">Categoria visível no catálogo</p>
              </div>
              <Switch checked={ativo} onCheckedChange={setAtivo} />
            </div>
          </div>

          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Excluir */}
      <AlertDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <AlertDialogContent style={{ background: "var(--color-card, #1e293b)", borderColor: "rgba(201,166,85,0.15)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteItem?.nome}</strong> será removida permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
