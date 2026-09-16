
import { EMPRESA_ID } from "~/config/empresa"
import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState, useEffect } from "react"
import { Settings, Save, Store, FileText, ToggleLeft, ToggleRight, Plus, Pencil, Trash2, Tag, Link2 } from "lucide-react"
import toast from "react-hot-toast"
import { useCategorias, useConexoes, useToggleCategoriaAtivo, useToggleConexaoAtivo } from "~/features/catalogo/hooks/useCatalogo"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { useAuth } from "~/lib/auth"
import { supabase } from "~/core/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { getConfiguracoes, saveConfiguracoes, DEFAULT_CONFIGURACOES, type CatalogoConfiguracoes } from "~/features/catalogo/services/configuracoes.service"
import type { CatalogoCategoria, CatalogoIpsConexao } from "~/features/catalogo/types"

export const catalogoAdminConfiguracoesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/configuracoes",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_dashboard"]}>
      <AdminConfiguracoesPage />
    </RequirePermission>
  ),
})

function AdminConfiguracoesPage() {
  const empresaId = useCatalogoEmpresaId()
  const [config, setConfig] = useState<CatalogoConfiguracoes>({
    ...DEFAULT_CONFIGURACOES, 
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!empresaId) return
    setLoading(true)
    getConfiguracoes()
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [empresaId])

  async function handleSave() {
    if (!empresaId) return
    setSaving(true)
    try {
      await saveConfiguracoes(config)
      toast.success("Configurações salvas com sucesso!")
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  function toggleField(field: keyof CatalogoConfiguracoes) {
    setConfig({ ...config, [field]: !config[field] })
  }

  const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white text-sm"
  const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Settings className="h-6 w-6 text-[#c9a655]" />
              Configurações Gerais
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
              Preferências gerais do catálogo e vitrine pública.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
          >
            <Save className="h-4 w-4" />
            {saving ? "SALVANDO..." : "SALVAR"}
          </button>
        </div>

        {/* Dados da Loja */}
        <div className="rounded-2xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Store className="h-5 w-5 text-[#c9a655]" />
            Dados da Loja
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c9a655] border-t-transparent" />
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Nome da Loja</label>
              <input
                type="text"
                value={config.nome_loja}
                onChange={(e) => setConfig({ ...config, nome_loja: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>CNPJ</label>
              <input
                type="text"
                value={config.cnpj}
                onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                className={inputCls}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>E-mail de Contato</label>
              <input
                type="email"
                value={config.email_contato}
                onChange={(e) => setConfig({ ...config, email_contato: e.target.value })}
                className={inputCls}
                placeholder="contato@odonto.com.br"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Telefone</label>
              <input
                type="text"
                value={config.telefone}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                className={inputCls}
                placeholder="+55 11 9999-9999"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className={labelCls}>Endereço</label>
              <input
                type="text"
                value={config.endereco}
                onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                className={inputCls}
                placeholder="Rua Exemplo, 123 - São Paulo, SP"
              />
            </div>
          </div>
          )}
        </div>

        {/* Modo Manutenção */}
        <div className="rounded-2xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-[#c9a655]" />
            Modo Manutenção
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div>
                <p className="font-bold text-white text-sm">Ativar Modo Manutenção</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
                  Quando ativo, a vitrine pública exibe uma mensagem de manutenção.
                </p>
              </div>
              <button
                onClick={() => toggleField("manutencao")}
                className="transition-colors"
              >
                {config.manutencao ? (
                  <ToggleRight className="h-8 w-8 text-green-400" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-500" />
                )}
              </button>
            </div>
            {config.manutencao && (
              <div className="space-y-2">
                <label className={labelCls}>Mensagem de Manutenção</label>
                <textarea
                  value={config.msg_manutencao}
                  onChange={(e) => setConfig({ ...config, msg_manutencao: e.target.value })}
                  className={inputCls + " min-h-[80px]"}
                  placeholder="Mensagem exibida na vitrine..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Preferências de Exibição */}
        <div className="rounded-2xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-[#c9a655]" />
            Preferências de Exibição
          </h2>
          <div className="space-y-3">
            {[
              { key: "exibir_precos" as const, label: "Exibir Preços", desc: "Mostra preços na vitrine pública" },
              { key: "exibir_estoque" as const, label: "Exibir Estoque", desc: "Mostra badge de quantidade. Badge \"Sem Estoque\" SEMPRE visível, independente desta opção." },
              { key: "checkout_habilitado" as const, label: "Checkout Habilitado", desc: "Permite finalização de compras" },
              { key: "cupons_habilitado" as const, label: "Cupons Habilitado", desc: "Permite aplicação de cupons de desconto" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-white/5"
              >
                <div>
                  <p className="font-bold text-white text-sm">{item.label}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted, #94a3b8)" }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleField(item.key)}
                  className="transition-colors"
                >
                  {config[item.key] ? (
                    <ToggleRight className="h-8 w-8 text-green-400" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-gray-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias e Conexões */}
        <CategoriasConexoesSection />
      </div>
    </AdminLayout>
  )
}

function CategoriasConexoesSection() {
  const { profile } = useAuth()
  const empresaId = useCatalogoEmpresaId()
  const qc = useQueryClient()
  const isSuperAdmin = profile?.is_super_admin === true

  const { data: categorias = [] } = useCategorias()
  const { data: conexoes = [] } = useConexoes()
  const toggleCategoria = useToggleCategoriaAtivo()
  const toggleConexao = useToggleConexaoAtivo()

  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState<"categoria" | "conexao">("categoria")
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; table: string } | null>(null)
  const [formNome, setFormNome] = useState("")
  const [formSigla, setFormSigla] = useState("")
  const [formCategoriaId, setFormCategoriaId] = useState("")
  const [saving, setSaving] = useState(false)

  function openNewCategoria() {
    setFormType("categoria")
    setEditingItem(null)
    setFormNome("")
    setFormSigla("")
    setFormCategoriaId("")
    setFormOpen(true)
  }

  function openNewConexao() {
    setFormType("conexao")
    setEditingItem(null)
    setFormNome("")
    setFormSigla("")
    setFormCategoriaId(categorias[0]?.id ?? "")
    setFormOpen(true)
  }

  function openEditCategoria(item: CatalogoCategoria) {
    setFormType("categoria")
    setEditingItem(item as unknown as Record<string, unknown>)
    setFormNome(String(item.nome ?? ""))
    setFormOpen(true)
  }

  function openEditConexao(item: CatalogoIpsConexao) {
    setFormType("conexao")
    setEditingItem(item as unknown as Record<string, unknown>)
    setFormNome(String(item.nome ?? ""))
    setFormSigla(String(item.sigla ?? ""))
    setFormCategoriaId(String(item.categoria_id ?? ""))
    setFormOpen(true)
  }

  async function handleSave() {
    if (!formNome.trim()) {
      toast.error("Nome é obrigatório")
      return
    }
    if (formType === "conexao" && !formCategoriaId) {
      toast.error("Categoria é obrigatória para conexão")
      return
    }
    setSaving(true)
    try {
      if (formType === "categoria") {
        const payload = { nome: formNome }
        if (editingItem) {
          const { error } = await supabase.from("catalogo_categorias").update({ nome: formNome }).eq("id", editingItem.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from("catalogo_categorias").insert(payload)
          if (error) throw error
        }
      } else {
        const payload = { nome: formNome, sigla: formSigla || null, categoria_id: formCategoriaId }
        if (editingItem) {
          const { error } = await supabase.from("catalogo_conexoes").update({ nome: formNome, sigla: formSigla || null, categoria_id: formCategoriaId }).eq("id", editingItem.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from("catalogo_conexoes").insert(payload)
          if (error) throw error
        }
      }
      qc.invalidateQueries({ queryKey: ["catalogo"] })
      setFormOpen(false)
      setEditingItem(null)
      setFormNome("")
      setFormSigla("")
      setFormCategoriaId("")
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar registro")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteItem) return
    const { error } = await supabase.from(deleteItem.table).delete().eq("id", deleteItem.id)
    if (!error) {
      qc.invalidateQueries({ queryKey: ["catalogo"] })
    }
    setDeleteItem(null)
  }

  return (
    <>
      {/* Seção Categorias */}
      <div className="rounded-2xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#c9a655]" />
            Categorias
          </h2>
          <button
            onClick={openNewCategoria}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
          >
            <Plus className="h-3.5 w-3.5" /> NOVA
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#c9a655]/20">
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Nome</TableHead>
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Status</TableHead>
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((cat, idx) => {
              const podeExcluir = !cat.locked || isSuperAdmin
              return (
                <TableRow key={cat.id} className={`${idx % 2 === 0 ? "bg-[var(--color-surface)]/30" : "bg-transparent"} hover:bg-[#c9a655]/5 transition-colors border-b border-[var(--color-border-subtle)]/50`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{cat.nome}</span>
                      {cat.locked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#c9a655]/15 text-[#c9a655] border border-[#c9a655]/20">
                          Padrão
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleCategoria.mutate({ id: cat.id, ativo: !cat.ativo })}
                      className="transition-colors"
                    >
                      {cat.ativo ? (
                        <ToggleRight className="h-7 w-7 text-green-400" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-gray-500" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCategoria(cat)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {podeExcluir && (
                        <button
                          onClick={() => setDeleteItem({ id: cat.id, label: cat.nome, table: "catalogo_categorias" })}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {categorias.length === 0 && (
              <TableRow><TableCell colSpan={3} className="p-4 text-center text-text-muted">Nenhuma categoria</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Seção Conexões */}
      <div className="rounded-2xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#c9a655]" />
            Conexões
          </h2>
          <button
            onClick={openNewConexao}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
          >
            <Plus className="h-3.5 w-3.5" /> NOVA
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#c9a655]/20">
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Nome</TableHead>
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Sigla</TableHead>
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Categoria</TableHead>
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Status</TableHead>
              <TableHead className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conexoes.map((conn, idx) => {
              const podeExcluir = !conn.locked || isSuperAdmin
              return (
                <TableRow key={conn.id} className={`${idx % 2 === 0 ? "bg-[var(--color-surface)]/30" : "bg-transparent"} hover:bg-[#c9a655]/5 transition-colors border-b border-[var(--color-border-subtle)]/50`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{conn.nome}</span>
                      {conn.locked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#c9a655]/15 text-[#c9a655] border border-[#c9a655]/20">
                          Padrão
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[var(--color-text-muted)] text-sm font-mono">{conn.sigla ?? "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[var(--color-text-muted)] text-sm">{conn.categoria?.nome ?? "—"}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleConexao.mutate({ id: conn.id, ativo: !conn.ativo })}
                      className="transition-colors"
                    >
                      {conn.ativo ? (
                        <ToggleRight className="h-7 w-7 text-green-400" />
                      ) : (
                        <ToggleLeft className="h-7 w-7 text-gray-500" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditConexao(conn)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {podeExcluir && (
                        <button
                          onClick={() => setDeleteItem({ id: conn.id, label: conn.nome, table: "catalogo_conexoes" })}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {conexoes.length === 0 && (
              <TableRow><TableCell colSpan={5} className="p-4 text-center text-text-muted">Nenhuma conexão</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Formulário */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-white">
              {editingItem ? "Editar" : "Nova"} {formType === "categoria" ? "Categoria" : "Conexão"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingItem ? "Altere os campos abaixo." : "Preencha os campos para criar."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nome <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                placeholder={`Nome da ${formType === "categoria" ? "categoria" : "conexão"}...`}
              />
            </div>
            {formType === "conexao" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Sigla</label>
                  <input
                    type="text"
                    value={formSigla}
                    onChange={(e) => setFormSigla(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white font-mono"
                    placeholder="Ex: CM, HE, HI"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Categoria <span className="text-red-400">*</span></label>
                  <select
                    value={formCategoriaId}
                    onChange={(e) => setFormCategoriaId(e.target.value)}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                  >
                    <option value="">Selecione...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button
              onClick={() => setFormOpen(false)}
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formNome.trim() || (formType === "conexao" && !formCategoriaId)}
              className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Exclusão */}
      <AlertDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <AlertDialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItem?.label} será removido permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
