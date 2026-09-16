
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { useAuth } from "~/core/auth/useAuth"
import { useCupons, useCriarCupom, useAtualizarCupom, useRemoverCupom, useGruposClientes } from "~/features/catalogo/hooks/useCatalogo"
import { useState } from "react"
import { Percent, Trash2, Plus, Pencil } from "lucide-react"
import { formatBRL } from "~/features/catalogo/services/carrinho.service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import type { CatalogoCupom } from "~/features/catalogo/types"

export const catalogoAdminCuponsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/cupons",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_cupons"]}>
      <EmpresaCrudGuard>
        <AdminCuponsPage />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})

function AdminCuponsPage() {
  const { profile } = useAuth()
  const isSuperAdmin = profile?.is_super_admin === true
  const { data: cupons } = useCupons()
  const { data: grupos } = useGruposClientes()
  const criarMut = useCriarCupom()
  const atualizarMut = useAtualizarCupom()
  const removerMut = useRemoverCupom()
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoCupom | null>(null)
  const [itemParaDeletar, setItemParaDeletar] = useState<string | null>(null)
  const FORM_INICIAL = { codigo: "", tipo: "percentual" as "percentual" | "fixo", valor: 0, validade: "", grupo_id: "" }
  const [form, setForm] = useState(FORM_INICIAL)

  function openNew() {
    setEditingItem(null)
    setForm(FORM_INICIAL)
    setFormOpen(true)
  }

  function openEdit(item: CatalogoCupom) {
    setEditingItem(item)
    setForm({ codigo: item.codigo, tipo: item.tipo, valor: item.valor, validade: item.validade ?? "", grupo_id: item.grupo_id ?? "" })
    setFormOpen(true)
  }

  function handleSave() {
    if (!form.codigo.trim()) return
    const duplicado = cupons?.some((c) => c.codigo.toUpperCase() === form.codigo.toUpperCase() && c.id !== editingItem?.id)
    if (duplicado) return
    const input = {
      codigo: form.codigo.toUpperCase(),
      tipo: form.tipo,
      valor: form.valor,
      validade: form.validade || undefined,
      grupo_id: form.grupo_id || null,
    }
    if (editingItem) {
      atualizarMut.mutate({ id: editingItem.id, input })
    } else {
      criarMut.mutate(input)
    }
    setFormOpen(false)
    setEditingItem(null)
    setForm(FORM_INICIAL)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Cupons de Desconto</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>Gerencie cupons percentuais ou de valor fixo.</p>
        </div>
        
        <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setEditingItem(null); setForm(FORM_INICIAL) } setFormOpen(o) }}>
          <DialogTrigger asChild>
            <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}>
              <Plus className="h-4 w-4" /> NOVO CUPOM
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white flex flex-col max-h-[85vh] overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>{editingItem ? "Editar Cupom" : "Cadastrar Cupom"}</DialogTitle>
              <DialogDescription className="text-gray-400">Configure as regras de abatimento e validade.</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Código</label>
                <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="EX: VERAO20" className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as "percentual" | "fixo" })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white">
                    <option value="percentual">Percentual (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Valor</label>
                  <input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Validade (Opcional)</label>
                <input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white [color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Restringir a grupo (Opcional)</label>
                <select value={form.grupo_id} onChange={(e) => setForm({ ...form, grupo_id: e.target.value })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white">
                  <option value="">Global — qualquer cliente</option>
                  {grupos?.map((g) => (
                    <option key={g.id} value={g.id}>{g.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="shrink-0">
              <button onClick={handleSave} className="w-full px-6 py-3 rounded-xl text-[#0f172a] font-black" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}>{editingItem ? "Salvar" : "Criar Cupom"}</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cupons?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] p-4 shadow-sm hover:border-[#c9a655]/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#c9a655]/10 flex items-center justify-center shrink-0">
                 <Percent className="h-4 w-4 text-[#c9a655]" />
              </div>
              <div>
                <p className="font-mono font-black text-white text-lg tracking-widest leading-none mb-1">{c.codigo}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gradient-gold">
                    {c.tipo === "percentual" ? `${c.valor}% OFF` : `${formatBRL(c.valor)} OFF`}
                  </span>
                  {c.validade && <span className="text-[10px] text-[var(--color-text-muted)]">Até {new Date(c.validade).toLocaleDateString("pt-BR")}</span>}
                </div>
                {c.grupo_id && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">Restrito: {grupos?.find((g) => g.id === c.grupo_id)?.nome ?? "grupo"}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${c.ativo ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>
                {c.ativo ? "Ativo" : "Inativo"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(c)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655] transition-colors"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => setItemParaDeletar(c.id)} disabled={!isSuperAdmin} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title={isSuperAdmin ? "Excluir" : "Apenas super admin pode excluir"}><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!itemParaDeletar} onOpenChange={(o) => !o && setItemParaDeletar(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Excluir cupom?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (itemParaDeletar) removerMut.mutate(itemParaDeletar); setItemParaDeletar(null) }} className="bg-destructive">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
