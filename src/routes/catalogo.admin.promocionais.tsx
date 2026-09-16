import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { useAuth } from "~/core/auth/useAuth"
import { usePromocionais, useCriarPromocional, useAtualizarPromocional, useRemoverPromocional, useTodosImplantes, useAbutments, useKitsAtivos, useFresas, useChavesFerramental, useAcessorios, useInstrumentais, useComponentes } from "~/features/catalogo/hooks/useCatalogo"
import { useMemo, useState } from "react"
import { Tag, Trash2, Plus, Pencil, Package } from "lucide-react"
import { formatBRL } from "~/features/catalogo/services/carrinho.service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { ImageUploader } from "~/features/catalogo/components/admin/produtos/ImageUploader"
import { ProdutoPickerInline, type PickerItem } from "~/features/catalogo/components/admin/produtos/ProdutoPickerInline"
import type { CatalogoPromocional } from "~/features/catalogo/types"
import { CATALOGO_TIPO_LABEL } from "~/features/catalogo/types"
import { ImportTrigger, TemplatesDropdown, GlobalImportTrigger, IMPORT_TYPE_GROUPS } from "~/features/catalogo/import"
import { EstoqueBadge } from "~/features/catalogo/components/admin/produtos/EstoqueBadge"

const FORM_INICIAL = { nome: "", descricao: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, expira_em: "" }

export const catalogoAdminPromocionaisRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/promocionais",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_promocionais"]}>
      <EmpresaCrudGuard>
        <AdminPromocionaisPage />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})

function AdminPromocionaisPage() {
  const { profile } = useAuth()
  const isSuperAdmin = profile?.is_super_admin === true
  const { data: promos } = usePromocionais()
  const criarMut = useCriarPromocional()
  const atualizarMut = useAtualizarPromocional()
  const removerMut = useRemoverPromocional()

  const { data: implantes } = useTodosImplantes()
  const { data: abutments } = useAbutments()
  const { data: kits } = useKitsAtivos()
  const { data: fresas } = useFresas()
  const { data: chaves } = useChavesFerramental()
  const { data: acessorios } = useAcessorios()
  const { data: instrumentais } = useInstrumentais()
  const { data: componentes } = useComponentes()

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoPromocional | null>(null)
  const [itemParaDeletar, setItemParaDeletar] = useState<string | null>(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [itens, setItens] = useState<PickerItem[]>([])

  const todosProdutos = useMemo<PickerItem[]>(() => [
    ...(implantes ?? []).map((p) => ({ sku: p.sku, tipo: "implante" as const, nome: p.nome || p.sku })),
    ...(abutments ?? []).map((p) => ({ sku: p.sku, tipo: "abutment" as const, nome: p.nome || p.sku })),
    ...(fresas ?? []).map((p) => ({ sku: p.sku, tipo: "fresa" as const, nome: p.nome })),
    ...(chaves ?? []).map((p) => ({ sku: p.sku, tipo: "chave" as const, nome: p.nome })),
    ...(acessorios ?? []).map((p) => ({ sku: p.sku, tipo: "acessorio" as const, nome: p.nome })),
    ...(instrumentais ?? []).map((p) => ({ sku: p.sku, tipo: "instrumental" as const, nome: p.nome })),
    ...(componentes ?? []).map((p) => ({ sku: p.sku, tipo: "componente" as const, nome: p.nome })),
    ...(kits ?? []).map((p) => ({ sku: p.sku, tipo: "kit" as const, nome: p.nome })),
  ], [implantes, abutments, fresas, chaves, acessorios, instrumentais, componentes, kits])

  function fecharDialog() {
    setFormOpen(false)
    setEditingItem(null)
    setForm(FORM_INICIAL)
    setItens([])
  }

  function openNew() {
    setEditingItem(null)
    setForm(FORM_INICIAL)
    setItens([])
    setFormOpen(true)
  }

  function openEdit(item: CatalogoPromocional) {
    setEditingItem(item)
    setForm({
      nome: item.nome,
      descricao: item.descricao ?? "",
      preco: item.preco,
      preco_euro: (item as unknown as Record<string, unknown>).preco_euro as number ?? 0,
      preco_dolar: (item as unknown as Record<string, unknown>).preco_dolar as number ?? 0,
      qtd_disponivel: (item as unknown as Record<string, unknown>).qtd_disponivel as number ?? 0,
      qtd_minima_aviso: (item as unknown as Record<string, unknown>).qtd_minima_aviso as number ?? 0,
      expira_em: item.expira_em ?? "",
    })
    setItens(item.itens?.map((i) => {
      const produto = todosProdutos.find((p) => p.sku === i.sku && p.tipo === i.tipo)
      return { sku: i.sku, tipo: i.tipo as PickerItem["tipo"], nome: produto?.nome ?? i.sku }
    }) ?? [])
    setFormOpen(true)
  }

  const salvando = criarMut.isPending || atualizarMut.isPending
  const precoInvalido = form.preco < 0
  const dataExpiradaAviso = !!form.expira_em && form.expira_em < new Date().toISOString().slice(0, 10)

  async function handleSave() {
    if (!form.nome.trim() || precoInvalido) return
    const payload: Parameters<typeof criarMut.mutateAsync>[0] = {
      nome: form.nome,
      descricao: form.descricao || undefined,
      preco: form.preco,
      preco_euro: form.preco_euro || undefined,
      preco_dolar: form.preco_dolar || undefined,
      qtd_disponivel: form.qtd_disponivel || undefined,
      qtd_minima_aviso: form.qtd_minima_aviso || undefined,
      expira_em: form.expira_em || undefined,
      itens: itens.map((i) => ({ sku: i.sku, tipo: i.tipo })),
    }
    if (editingItem) {
      await atualizarMut.mutateAsync({ id: editingItem.id, input: payload })
      fecharDialog()
    } else {
      // Pacote precisa existir (id gerado pelo banco) antes de aceitar upload de imagem — mantém o dialog
      // aberto e entra em modo edição para liberar a seção de imagem, em vez de fechar como no update normal.
      const criado = await criarMut.mutateAsync(payload)
      setEditingItem(criado)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Pacotes Promocionais</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>Crie pacotes (kits) com preços especiais e prazo de expiração.</p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <ImportTrigger types={IMPORT_TYPE_GROUPS.promocionais} />
          <TemplatesDropdown types={IMPORT_TYPE_GROUPS.promocionais} />
          <GlobalImportTrigger />

          <Dialog open={formOpen} onOpenChange={(o) => { if (!o) fecharDialog(); else setFormOpen(o) }}>
            <DialogTrigger asChild>
              <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-mid))", color: "var(--color-accent-fg)" }}>
                <Plus className="h-4 w-4" /> NOVO PACOTE
              </button>
            </DialogTrigger>
          <DialogContent className="bg-[var(--color-background)] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>{editingItem ? "Editar Pacote Promocional" : "Criar Pacote Promocional"}</DialogTitle>
              <DialogDescription className="text-gray-400">Monte seu pacote de produtos com preço especial.</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nome do Pacote *</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Combo Implante + Componente" className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Estoque na Loja</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Qtd Disponível</label>
                    <input type="number" step="1" min="0" value={form.qtd_disponivel} onChange={(e) => setForm({ ...form, qtd_disponivel: Number(e.target.value) })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white" placeholder="0" />
                    {form.qtd_disponivel > 0 && form.qtd_minima_aviso > 0 && form.qtd_disponivel <= form.qtd_minima_aviso && (
                      <p className="text-xs text-amber-400 font-medium">⚠ Estoque baixo!</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Qtd Mínima (aviso)</label>
                    <input type="number" step="1" min="0" value={form.qtd_minima_aviso} onChange={(e) => setForm({ ...form, qtd_minima_aviso: Number(e.target.value) })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white" placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Comercial</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Preço Fixo (R$)</label>
                    <input type="number" step="0.01" min="0" value={form.preco} onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white" />
                    {precoInvalido && <p className="text-xs text-red-400">Preço não pode ser negativo.</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Preço (€ Euro)</label>
                    <input type="number" step="0.01" min="0" value={form.preco_euro} onChange={(e) => setForm({ ...form, preco_euro: Number(e.target.value) })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white" placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Preço ($ Dólar)</label>
                    <input type="number" step="0.01" min="0" value={form.preco_dolar} onChange={(e) => setForm({ ...form, preco_dolar: Number(e.target.value) })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white" placeholder="0,00" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Expiração</label>
                <input type="date" value={form.expira_em} onChange={(e) => setForm({ ...form, expira_em: e.target.value })} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white [color-scheme:dark]" />
                {dataExpiradaAviso && <p className="text-xs text-amber-400">Data já passou — o pacote ficará expirado.</p>}
              </div>

              <ProdutoPickerInline
                produtosDisponiveis={todosProdutos}
                itensSelecionados={itens}
                onAdicionar={(item) => setItens((prev) => prev.some((i) => i.sku === item.sku && i.tipo === item.tipo) ? prev : [...prev, item])}
                onRemover={(sku, tipo) => setItens((prev) => prev.filter((i) => !(i.sku === sku && i.tipo === tipo)))}
              />

              <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">Imagem do Pacote</h3>
                {editingItem ? (
                  <ImageUploader produtoTipo="promocional" produtoSku={editingItem.id} />
                ) : (
                  <p className="text-xs text-gray-500 italic">Cadastre o pacote primeiro — a imagem é liberada assim que ele for salvo.</p>
                )}
              </div>
            </div>
            <DialogFooter className="shrink-0 gap-2">
              {editingItem && (
                <button onClick={fecharDialog} className="px-6 py-3 rounded-xl font-black text-sm border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">Concluir</button>
              )}
              <button onClick={handleSave} disabled={!form.nome.trim() || precoInvalido || salvando} className="w-full px-6 py-3 rounded-xl text-[var(--color-accent-fg)] font-black disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-mid))" }}>
                {salvando ? "Salvando..." : editingItem ? "Salvar" : "Cadastrar Pacote"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos?.map((p) => (
          <PromocionalCard key={p.id} promo={p} isSuperAdmin={isSuperAdmin} onEdit={openEdit} onDelete={setItemParaDeletar} />
        ))}
        {promos?.length === 0 && <p className="col-span-full text-[var(--color-text-muted)] text-center py-8 font-mono tracking-widest text-sm uppercase">Nenhum pacote criado</p>}
      </div>

      <AlertDialog open={!!itemParaDeletar} onOpenChange={(o) => !o && setItemParaDeletar(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader><AlertDialogTitle>Excluir pacote promocional?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (itemParaDeletar) removerMut.mutate(itemParaDeletar); setItemParaDeletar(null) }} className="bg-destructive">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function PromocionalCard({ promo, isSuperAdmin, onEdit, onDelete }: {
  promo: CatalogoPromocional
  isSuperAdmin: boolean
  onEdit: (p: CatalogoPromocional) => void
  onDelete: (id: string) => void
}) {
  const qtd = (promo as unknown as Record<string, unknown>).qtd_disponivel as number ?? 0
  const minima = (promo as unknown as Record<string, unknown>).qtd_minima_aviso as number ?? 0
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] p-5 shadow-sm hover:border-[var(--color-accent)]/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
             <Tag className="h-4 w-4 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="font-bold text-white text-md leading-tight">{promo.nome}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${promo.ativo ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>
              {promo.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(promo)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--color-accent)]/20 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => onDelete(promo.id)} disabled={!isSuperAdmin} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title={isSuperAdmin ? "Excluir" : "Apenas super admin pode excluir"}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      {promo.itens && promo.itens.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {promo.itens.slice(0, 4).map((i) => (
            <span key={i.id} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 text-gray-400 border border-white/10">
              {CATALOGO_TIPO_LABEL[i.tipo as keyof typeof CATALOGO_TIPO_LABEL] ?? i.tipo}
            </span>
          ))}
          {promo.itens.length > 4 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 text-gray-400">+{promo.itens.length - 4}</span>
          )}
        </div>
      )}

      <div className="pt-3 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Package className="h-3 w-3 text-[var(--color-text-muted)]" />
            <span className="text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Estoque</span>
            <span className={`font-bold ${qtd < 1 ? "text-red-400" : qtd <= minima ? "text-amber-400" : "text-emerald-400"}`}>{qtd}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Mín. Aviso</span>
            <span className="text-[var(--color-text-muted)]">{minima}</span>
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
             <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-bold mb-1">Preço do Pacote</p>
             <p className="text-xl font-black text-gradient-gold leading-none">{formatBRL(promo.preco)}</p>
          </div>
          {promo.expira_em && (
            <div className="text-right">
               <p className="text-[10px] uppercase tracking-widest text-red-400/70 mb-0.5">Expira em</p>
               <p className="text-xs font-mono text-red-400">{new Date(promo.expira_em).toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </div>
        <EstoqueBadge qtdDisponivel={qtd} qtdMinimaAviso={minima} />
      </div>
    </div>
  )
}
