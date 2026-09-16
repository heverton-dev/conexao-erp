import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Search, X, Link2 } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "~/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { useAuth } from "~/lib/auth"
import { useEmpresaCrudId } from "../contexts/EmpresaCrudContext"
import {
  listarClientes, criarCliente, atualizarCliente, deletarCliente,
  listarCadastrosDisponiveis, type CadastroDisponivel,
} from "../services/clientes.service"
import { listarGrupos } from "../services/grupos.service"
import type {
  CatalogoCliente, CatalogoClienteInput, CatalogoGrupoCliente, ClienteTipo,
} from "../types/clientes"

export function ClientesAdmin() {
  const { profile } = useAuth()
  const empresaId = useEmpresaCrudId()
  const [clientes, setClientes] = useState<CatalogoCliente[]>([])
  const [grupos, setGrupos] = useState<CatalogoGrupoCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogoCliente | null>(null)
  const [itemParaDeletar, setItemParaDeletar] = useState<string | null>(null)

  // Cadastros disponíveis para vinculação
  const [cadastros, setCadastros] = useState<CadastroDisponivel[]>([])
  const [cadastroSearch, setCadastroSearch] = useState("")
  const [cadastroSearchOpen, setCadastroSearchOpen] = useState(false)
  const [loadingCadastros, setLoadingCadastros] = useState(false)
  const [cadastroVinculado, setCadastroVinculado] = useState<CadastroDisponivel | null>(null)

  const [form, setForm] = useState<CatalogoClienteInput & { cadastro_id?: string | null }>({
    nome: "",
    email: "",
    telefone: "",
    tipo: "cliente",
    grupo_id: null,
    senha: "",
    cadastro_id: null,
  })

  async function load() {
    if (!empresaId) return
    setLoading(true)
    try {
      const [c, g] = await Promise.all([
        listarClientes({ search: search || undefined }),
        listarGrupos(),
      ])
      setClientes(c)
      setGrupos(g)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [empresaId, search])

  // Buscar cadastros disponíveis
  const buscarCadastros = useCallback(async (termo: string) => {
    if (!empresaId) return
    setLoadingCadastros(true)
    try {
      const data = await listarCadastrosDisponiveis(termo || undefined)
      setCadastros(data)
    } finally {
      setLoadingCadastros(false)
    }
  }, [empresaId])

  useEffect(() => {
    if (cadastroSearchOpen) {
      buscarCadastros(cadastroSearch)
    }
  }, [cadastroSearch, cadastroSearchOpen, buscarCadastros])

  // Extrair nome do cadastro (PF/PJ/lead)
  function getCadastroNome(cad: CadastroDisponivel): string {
    return cad.pf?.nome ?? cad.pj?.razao_social ?? cad.lead_nome ?? "Sem nome"
  }

  // Extrair email do cadastro
  function getCadastroEmail(cad: CadastroDisponivel): string {
    return cad.pf?.email_comunicacao ?? cad.pj?.email_comunicacao ?? cad.lead_email ?? ""
  }

  // Extrair telefone do cadastro
  function getCadastroTelefone(cad: CadastroDisponivel): string {
    return cad.pf?.celular1 ?? cad.pj?.celular1 ?? cad.lead_whatsapp ?? ""
  }

  // Selecionar cadastro e preencher form
  function selecionarCadastro(cad: CadastroDisponivel) {
    setCadastroVinculado(cad)
    setForm((prev) => ({
      ...prev,
      cadastro_id: cad.id,
      nome: getCadastroNome(cad),
      email: getCadastroEmail(cad),
      telefone: getCadastroTelefone(cad),
    }))
    setCadastroSearchOpen(false)
    setCadastroSearch("")
  }

  // Remover vínculo
  function removerVinculo() {
    setCadastroVinculado(null)
    setForm((prev) => ({
      ...prev,
      cadastro_id: null,
      nome: "",
      email: "",
      telefone: "",
    }))
  }

  function openNew() {
    setEditing(null)
    setCadastroVinculado(null)
    setCadastroSearchOpen(false)
    setCadastroSearch("")
    setForm({ nome: "", email: "", telefone: "", tipo: "cliente", grupo_id: null, senha: "", cadastro_id: null })
    setDialogOpen(true)
  }

  function openEdit(c: CatalogoCliente) {
    setEditing(c)
    setCadastroVinculado((c.cadastro as unknown as CadastroDisponivel | null) ?? null)
    setForm({
      nome: c.nome,
      email: c.email,
      telefone: c.telefone ?? "",
      tipo: c.tipo,
      grupo_id: c.grupo_id,
      senha: "",
      cadastro_id: c.cadastro_id,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nome.trim() || !form.email.trim()) return
    if (!editing && (!form.senha || form.senha.length < 6)) return
    if (editing) {
      await atualizarCliente(editing.id, form)
    } else {
      await criarCliente(form)
    }
    setDialogOpen(false)
    load()
  }

  async function handleConfirmDelete() {
    if (!itemParaDeletar) return
    await deletarCliente(itemParaDeletar)
    setItemParaDeletar(null)
    load()
  }

  const tipoLabel: Record<ClienteTipo, string> = {
    cliente: "Cliente",
    parceiro: "Parceiro",
    revendedor: "Revendedor",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Clientes do Catálogo</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>Gerencie credenciais de acesso dos clientes à loja.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}>
              <Plus className="h-4 w-4" /> NOVA CREDENCIAL
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>{editing ? "Editar Credencial" : "Nova Credencial"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editing ? "Atualize os dados da credencial." : "Vincule a um cadastro existente ou crie uma nova credencial."}
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* Vincular Cadastro (apenas criação) */}
              {!editing && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Vincular Cadastro</label>
                  {cadastroVinculado ? (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <Link2 className="h-4 w-4 text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-300 truncate">{getCadastroNome(cadastroVinculado)}</p>
                        <p className="text-xs text-green-400/70 truncate">{getCadastroEmail(cadastroVinculado)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={removerVinculo}
                        className="p-1 rounded hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : cadastroSearchOpen ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                          autoFocus
                          value={cadastroSearch}
                          onChange={(e) => setCadastroSearch(e.target.value)}
                          placeholder="Buscar por nome ou email..."
                          className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 pl-9 text-white placeholder-gray-500 text-sm"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10">
                        {loadingCadastros ? (
                          <p className="p-3 text-sm text-gray-400 text-center">Buscando...</p>
                        ) : cadastros.length === 0 ? (
                          <p className="p-3 text-sm text-gray-400 text-center">Nenhum cadastro encontrado</p>
                        ) : (
                          cadastros.map((cad) => (
                            <button
                              key={cad.id}
                              type="button"
                              onClick={() => selecionarCadastro(cad)}
                              className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                            >
                              <p className="text-sm font-medium text-white truncate">{getCadastroNome(cad)}</p>
                              <p className="text-xs text-gray-400 truncate">{getCadastroEmail(cad)}</p>
                            </button>
                          ))
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCadastroSearchOpen(false); setCadastroSearch("") }}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCadastroSearchOpen(true)}
                      className="w-full flex items-center gap-2 bg-[var(--color-surface)] border border-dashed border-white/20 rounded-lg p-3 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      <span className="text-sm">Buscar cadastro existente...</span>
                    </button>
                  )}
                  <p className="text-xs text-gray-500">Opcional — vincula os dados do cadastro automaticamente</p>
                </div>
              )}

              {/* Edição: mostrar cadastro vinculado (somente leitura) */}
              {editing && cadastroVinculado && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Cadastro Vinculado</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3">
                    <Link2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-300 truncate">{getCadastroNome(cadastroVinculado)}</p>
                      <p className="text-xs text-blue-400/70 truncate">{getCadastroEmail(cadastroVinculado)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nome *</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Telefone</label>
                <input
                  value={form.telefone ?? ""}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as ClienteTipo })}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="parceiro">Parceiro</option>
                    <option value="revendedor">Revendedor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Grupo</label>
                  <select
                    value={form.grupo_id ?? ""}
                    onChange={(e) => setForm({ ...form, grupo_id: e.target.value || null })}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                  >
                    <option value="">Sem grupo</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>{g.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              {!editing && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Senha Inicial *</label>
                  <input
                    type="password"
                    value={form.senha ?? ""}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                  />
                </div>
              )}
            </div>
            <DialogFooter className="shrink-0">
              <button onClick={handleSave} className="w-full px-6 py-3 rounded-xl text-[#0f172a] font-black" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}>
                {editing ? "Salvar" : "Criar"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-4">
        <input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : clientes.length === 0 ? (
        <p className="text-gray-400">Nenhum cliente cadastrado.</p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--color-border-subtle)]">
                <TableHead className="text-gray-400 font-bold">Nome</TableHead>
                <TableHead className="text-gray-400 font-bold">Email</TableHead>
                <TableHead className="text-gray-400 font-bold">Tipo</TableHead>
                <TableHead className="text-gray-400 font-bold">Grupo</TableHead>
                <TableHead className="text-gray-400 font-bold">Cadastro</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((c) => (
                <TableRow key={c.id} className="border-b border-[var(--color-border-subtle)]">
                  <TableCell className="font-medium text-white">{c.nome}</TableCell>
                  <TableCell className="text-gray-300">{c.email}</TableCell>
                  <TableCell><Badge variant="outline" className="border-white/20 text-gray-300">{tipoLabel[c.tipo]}</Badge></TableCell>
                  <TableCell className="text-gray-300">{c.grupo?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {c.cadastro_id ? (
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                        <Link2 className="h-3 w-3 mr-1" />
                        Vinculado
                      </Badge>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.ativo ? "default" : "secondary"} className={c.ativo ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}>
                      {c.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setItemParaDeletar(c.id)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* AlertDialog de exclusão */}
      <AlertDialog open={!!itemParaDeletar} onOpenChange={(o) => !o && setItemParaDeletar(null)}>
        <AlertDialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir credencial?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[var(--color-surface)] border border-white/10 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
