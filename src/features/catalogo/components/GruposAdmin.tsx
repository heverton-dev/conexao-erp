import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Search, X, Copy, Package } from "lucide-react"
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
  listarGrupos, criarGrupo, atualizarGrupo, deletarGrupo,
  listarPrecosGrupo, salvarPrecosGrupo, copiarPrecosGrupo,
  listarProdutosEmpresa,
} from "../services/grupos.service"
import type {
  CatalogoGrupoCliente, CatalogoGrupoClienteInput, CatalogoGrupoPreco,
  PrecoTipo, ProdutoDisponivel,
} from "../types/clientes"
import { CATALOGO_TIPO_LABEL } from "../types"
import type { ProductSheetTipo } from "../types"

const TIPO_OPTIONS: ProductSheetTipo[] = ["implante", "abutment", "fresa", "chave", "acessorio", "instrumental", "kit"]

export function GruposAdmin() {
  const { profile } = useAuth()
  const empresaId = useEmpresaCrudId()
  const [grupos, setGrupos] = useState<CatalogoGrupoCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogoGrupoCliente | null>(null)
  const [itemParaDeletar, setItemParaDeletar] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"dados" | "precos">("dados")

  // Dados do grupo
  const [formDados, setFormDados] = useState<CatalogoGrupoClienteInput>({
    nome: "",
    descricao: "",
    preco_tipo: "percentual",
    desconto_percentual: 0,
  })

  // Preços por produto
  const [precosGrupo, setPrecosGrupo] = useState<CatalogoGrupoPreco[]>([])
  const [produtosEmpresa, setProdutosEmpresa] = useState<ProdutoDisponivel[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)

  // Dialog produto
  const [dialogProdutoOpen, setDialogProdutoOpen] = useState(false)
  const [editingPreco, setEditingPreco] = useState<CatalogoGrupoPreco | null>(null)
  const [buscaProduto, setBuscaProduto] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [precoForm, setPrecoForm] = useState<{
    produto: ProdutoDisponivel | null
    preco_tipo: PrecoTipo
    preco: number
    desconto_percentual: number
  }>({ produto: null, preco_tipo: "fixo", preco: 0, desconto_percentual: 0 })

  // Dialog copiar
  const [dialogCopiarOpen, setDialogCopiarOpen] = useState(false)
  const [grupoOrigemCopiar, setGrupoOrigemCopiar] = useState<string>("")

  async function load() {
    if (!empresaId) return
    setLoading(true)
    try {
      setGrupos(await listarGrupos())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [empresaId])

  // Carregar produtos da empresa
  const loadProdutos = useCallback(async () => {
    if (!empresaId) return
    setLoadingProdutos(true)
    try {
      setProdutosEmpresa(await listarProdutosEmpresa())
    } finally {
      setLoadingProdutos(false)
    }
  }, [empresaId])

  // Carregar preços do grupo ao editar
  const loadPrecos = useCallback(async (grupoId: string) => {
    if (!empresaId) return
    try {
      setPrecosGrupo(await listarPrecosGrupo(grupoId))
    } catch {
      setPrecosGrupo([])
    }
  }, [empresaId])

  function openNew() {
    setEditing(null)
    setActiveTab("dados")
    setFormDados({ nome: "", descricao: "", preco_tipo: "percentual", desconto_percentual: 0 })
    setPrecosGrupo([])
    setDialogOpen(true)
    loadProdutos()
  }

  function openEdit(g: CatalogoGrupoCliente) {
    setEditing(g)
    setActiveTab("dados")
    setFormDados({
      nome: g.nome,
      descricao: g.descricao,
      preco_tipo: g.preco_tipo,
      desconto_percentual: g.desconto_percentual,
    })
    setPrecosGrupo([])
    setDialogOpen(true)
    loadProdutos()
    loadPrecos(g.id)
  }

  // ========== Preços por Produto ==========

  function abrirAdicionarPreco() {
    setEditingPreco(null)
    setPrecoForm({ produto: null, preco_tipo: "fixo", preco: 0, desconto_percentual: 0 })
    setBuscaProduto("")
    setFiltroTipo("todos")
    setDialogProdutoOpen(true)
  }

  function abrirEditarPreco(p: CatalogoGrupoPreco) {
    const produto = produtosEmpresa.find((pr) => pr.sku === p.produto_sku) ?? null
    setEditingPreco(p)
    setPrecoForm({
      produto,
      preco_tipo: p.preco_tipo ?? "fixo",
      preco: p.preco,
      desconto_percentual: p.desconto_percentual ?? 0,
    })
    setBuscaProduto("")
    setDialogProdutoOpen(true)
  }

  function selecionarProduto(produto: ProdutoDisponivel) {
    setPrecoForm((prev) => ({
      ...prev,
      produto,
      preco: produto.preco_base ?? 0,
      desconto_percentual: 0,
    }))
    setBuscaProduto("")
  }

  function calcularPrecoFinal(): number {
    if (!precoForm.produto) return 0
    const base = precoForm.produto.preco_base ?? 0
    if (precoForm.preco_tipo === "fixo") return precoForm.preco
    return Math.round(base * (1 - precoForm.desconto_percentual / 100) * 100) / 100
  }

  function confirmarAdicionarPreco() {
    if (!precoForm.produto) return
    const precoFinal = calcularPrecoFinal()

    if (editingPreco) {
      // Editar existente
      setPrecosGrupo((prev) =>
        prev.map((p) =>
          p.produto_sku === editingPreco.produto_sku && p.produto_tipo === editingPreco.produto_tipo
            ? { ...p, preco: precoFinal, preco_tipo: precoForm.preco_tipo, desconto_percentual: precoForm.desconto_percentual }
            : p,
        ),
      )
    } else {
      // Verificar duplicata
      const duplicado = precosGrupo.some(
        (p) => p.produto_sku === precoForm.produto!.sku && p.produto_tipo === precoForm.produto!.tipo,
      )
      if (duplicado) return

      setPrecosGrupo((prev) => [
        ...prev,
        {
          id: `local_${Date.now()}`,
          grupo_id: editing?.id ?? "",
          produto_sku: precoForm.produto!.sku,
          produto_tipo: precoForm.produto!.tipo,
          preco: precoFinal,
          preco_tipo: precoForm.preco_tipo,
          desconto_percentual: precoForm.desconto_percentual,
          created_at: new Date().toISOString(),
        },
      ])
    }
    setDialogProdutoOpen(false)
  }

  function removerPreco(sku: string, tipo: string) {
    setPrecosGrupo((prev) => prev.filter((p) => !(p.produto_sku === sku && p.produto_tipo === tipo)))
  }

  // ========== Copiar Preços ==========

  async function handleCopiarPrecos() {
    if (!grupoOrigemCopiar || !editing) return
    try {
      const qtd = await copiarPrecosGrupo(grupoOrigemCopiar, editing.id)
      await loadPrecos(editing.id)
      setDialogCopiarOpen(false)
      setGrupoOrigemCopiar("")
    } catch {
      // silently fail
    }
  }

  // ========== Salvar Tudo ==========

  async function handleSaveAll() {
    if (!formDados.nome.trim()) return

    let grupoId = editing?.id
    if (editing) {
      await atualizarGrupo(editing.id, formDados)
    } else {
      const grupo = await criarGrupo(formDados)
      grupoId = grupo.id
    }

    if (grupoId) {
      await salvarPrecosGrupo(
        grupoId,
        precosGrupo.map((p) => ({
          produto_sku: p.produto_sku,
          produto_tipo: p.produto_tipo,
          preco: p.preco,
          preco_tipo: p.preco_tipo ?? "fixo",
          desconto_percentual: p.desconto_percentual ?? 0,
        })),
      )
    }

    setDialogOpen(false)
    load()
  }

  // ========== Filtros ==========

  const produtosFiltrados = produtosEmpresa.filter((p) => {
    const matchBusca = !buscaProduto ||
      p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) ||
      p.sku.toLowerCase().includes(buscaProduto.toLowerCase())
    const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo
    const jaAdicionado = precosGrupo.some((pr) => pr.produto_sku === p.sku && pr.produto_tipo === p.tipo)
    return matchBusca && matchTipo && !jaAdicionado
  })

  function formatBRL(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white">Grupos de Clientes</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #94a3b8)" }}>Gerencie grupos de pricing e regras de desconto por produto.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}>
              <Plus className="h-4 w-4" /> NOVO GRUPO
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>{editing ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure o grupo de clientes e preços por produto.
              </DialogDescription>
            </DialogHeader>

            {/* Tabs */}
            <div className="shrink-0 flex border-b border-white/10">
              <button
                onClick={() => setActiveTab("dados")}
                className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "dados"
                    ? "text-[#c9a655] border-b-2 border-[#c9a655]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Dados do Grupo
              </button>
              <button
                onClick={() => setActiveTab("precos")}
                className={`flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "precos"
                    ? "text-[#c9a655] border-b-2 border-[#c9a655]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Preços por Produto
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              {activeTab === "dados" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nome *</label>
                    <input
                      value={formDados.nome}
                      onChange={(e) => setFormDados({ ...formDados, nome: e.target.value })}
                      placeholder="Ex: VIP, Parceiro, Revendedor"
                      className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Descrição</label>
                    <input
                      value={formDados.descricao ?? ""}
                      onChange={(e) => setFormDados({ ...formDados, descricao: e.target.value })}
                      placeholder="Descrição do grupo"
                      className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tipo de Preço</label>
                      <select
                        value={formDados.preco_tipo}
                        onChange={(e) => setFormDados({ ...formDados, preco_tipo: e.target.value as PrecoTipo })}
                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                      >
                        <option value="percentual">Percentual (%)</option>
                        <option value="fixo">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {formDados.preco_tipo === "percentual" ? "Desconto %" : "Valor Fixo (R$)"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formDados.desconto_percentual ?? 0}
                        onChange={(e) => setFormDados({ ...formDados, desconto_percentual: Number(e.target.value) })}
                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Esta regra é aplicada quando o produto NÃO tem preço específico definido na aba "Preços por Produto".
                  </p>
                </>
              ) : (
                <>
                  {/* Cabeçalho da aba */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {precosGrupo.length} produto(s) com preço específico
                    </p>
                    <div className="flex gap-2">
                      {editing && (
                        <button
                          onClick={() => setDialogCopiarOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" /> Copiar de outro grupo
                        </button>
                      )}
                      <button
                        onClick={abrirAdicionarPreco}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0f172a] transition-colors"
                        style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}
                      >
                        <Plus className="h-3.5 w-3.5" /> Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Tabela de preços */}
                  {precosGrupo.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">Nenhum preço específico configurado</p>
                      <p className="text-xs text-gray-500 mt-1">Adicione produtos para definir preços individuais</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-white/10">
                            <TableHead className="text-gray-400 font-bold">Produto</TableHead>
                            <TableHead className="text-gray-400 font-bold">SKU</TableHead>
                            <TableHead className="text-gray-400 font-bold">Tipo</TableHead>
                            <TableHead className="text-gray-400 font-bold">Preço Base</TableHead>
                            <TableHead className="text-gray-400 font-bold">Preço Grupo</TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {precosGrupo.map((p) => {
                            const produto = produtosEmpresa.find((pr) => pr.sku === p.produto_sku)
                            return (
                              <TableRow key={`${p.produto_tipo}_${p.produto_sku}`} className="border-b border-white/5">
                                <TableCell className="text-white text-sm">{produto?.nome ?? p.produto_sku}</TableCell>
                                <TableCell className="text-gray-400 font-mono text-xs">{p.produto_sku}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-white/20 text-gray-300 text-xs">
                                    {CATALOGO_TIPO_LABEL[p.produto_tipo as ProductSheetTipo] ?? p.produto_tipo}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400 text-sm">
                                  {produto?.preco_base != null ? formatBRL(produto.preco_base) : "—"}
                                </TableCell>
                                <TableCell className="text-white text-sm font-bold">
                                  {p.preco_tipo === "percentual" ? (
                                    <span className="text-green-400">{p.desconto_percentual}% OFF</span>
                                  ) : (
                                    formatBRL(p.preco)
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <button onClick={() => abrirEditarPreco(p)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => removerPreco(p.produto_sku, p.produto_tipo)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter className="shrink-0">
              <button onClick={handleSaveAll} className="w-full px-6 py-3 rounded-xl text-[#0f172a] font-black" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}>
                {editing ? "Salvar" : "Criar"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de grupos */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : grupos.length === 0 ? (
        <p className="text-gray-400">Nenhum grupo criado.</p>
      ) : (
        <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--color-border-subtle)]">
                <TableHead className="text-gray-400 font-bold">Nome</TableHead>
                <TableHead className="text-gray-400 font-bold">Descrição</TableHead>
                <TableHead className="text-gray-400 font-bold">Tipo Preço</TableHead>
                <TableHead className="text-gray-400 font-bold">Valor</TableHead>
                <TableHead className="text-gray-400 font-bold">Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.map((g) => (
                <TableRow key={g.id} className="border-b border-[var(--color-border-subtle)]">
                  <TableCell className="font-medium text-white">{g.nome}</TableCell>
                  <TableCell className="text-gray-400">{g.descricao ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 text-gray-300">
                      {g.preco_tipo === "percentual" ? "Percentual" : "Fixo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {g.preco_tipo === "percentual" ? `${g.desconto_percentual}%` : formatBRL(g.desconto_percentual)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={g.ativo ? "default" : "secondary"} className={g.ativo ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}>
                      {g.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(g)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setItemParaDeletar(g.id)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
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

      {/* Dialog: Adicionar/Editar Produto */}
      <Dialog open={dialogProdutoOpen} onOpenChange={setDialogProdutoOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editingPreco ? "Editar Preço" : "Adicionar Produto ao Grupo"}</DialogTitle>
            <DialogDescription className="text-gray-400">Selecione um produto e defina o preço para este grupo.</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {!precoForm.produto ? (
              <>
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    autoFocus
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    placeholder="Buscar por nome ou SKU..."
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 pl-9 text-white placeholder-gray-500 text-sm"
                  />
                </div>
                {/* Filtro tipo */}
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setFiltroTipo("todos")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filtroTipo === "todos" ? "bg-[#c9a655] text-[#0f172a]" : "bg-white/5 text-gray-400 hover:text-white"}`}
                  >
                    Todos
                  </button>
                  {TIPO_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setFiltroTipo(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filtroTipo === t ? "bg-[#c9a655] text-[#0f172a]" : "bg-white/5 text-gray-400 hover:text-white"}`}
                    >
                      {CATALOGO_TIPO_LABEL[t]}
                    </button>
                  ))}
                </div>
                {/* Lista */}
                <div className="max-h-60 overflow-y-auto rounded-lg border border-white/10">
                  {loadingProdutos ? (
                    <p className="p-3 text-sm text-gray-400 text-center">Carregando produtos...</p>
                  ) : produtosFiltrados.length === 0 ? (
                    <p className="p-3 text-sm text-gray-400 text-center">Nenhum produto encontrado</p>
                  ) : (
                    produtosFiltrados.slice(0, 50).map((p) => (
                      <button
                        key={`${p.tipo}_${p.sku}`}
                        onClick={() => selecionarProduto(p)}
                        className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{p.nome}</p>
                          <p className="text-xs text-gray-400">{p.sku} · {CATALOGO_TIPO_LABEL[p.tipo]}</p>
                        </div>
                        {p.preco_base != null && (
                          <span className="text-xs text-gray-400 shrink-0 ml-2">{formatBRL(p.preco_base)}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Produto selecionado */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
                  <Package className="h-5 w-5 text-[#c9a655] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{precoForm.produto.nome}</p>
                    <p className="text-xs text-gray-400">{precoForm.produto.sku} · {CATALOGO_TIPO_LABEL[precoForm.produto.tipo]}</p>
                  </div>
                  {!editingPreco && (
                    <button onClick={() => setPrecoForm((prev) => ({ ...prev, produto: null }))} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Preço base</span>
                  <p className="text-white font-bold">{precoForm.produto.preco_base != null ? formatBRL(precoForm.produto.preco_base) : "Não definido"}</p>
                </div>

                {/* Modo de preço */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Modo de preço</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPrecoForm((prev) => ({ ...prev, preco_tipo: "fixo" }))}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${precoForm.preco_tipo === "fixo" ? "bg-[#c9a655] text-[#0f172a]" : "bg-white/5 text-gray-400 hover:text-white border border-white/10"}`}
                    >
                      Preço Fixo
                    </button>
                    <button
                      onClick={() => setPrecoForm((prev) => ({ ...prev, preco_tipo: "percentual" }))}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${precoForm.preco_tipo === "percentual" ? "bg-[#c9a655] text-[#0f172a]" : "bg-white/5 text-gray-400 hover:text-white border border-white/10"}`}
                    >
                      Desconto %
                    </button>
                  </div>
                </div>

                {precoForm.preco_tipo === "fixo" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Preço para o grupo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={precoForm.preco}
                      onChange={(e) => setPrecoForm((prev) => ({ ...prev, preco: Number(e.target.value) }))}
                      className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Desconto (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={precoForm.desconto_percentual}
                        onChange={(e) => setPrecoForm((prev) => ({ ...prev, desconto_percentual: Number(e.target.value) }))}
                        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Preço final</span>
                      <p className="text-green-400 font-bold">{formatBRL(calcularPrecoFinal())}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter className="shrink-0">
            <button
              onClick={confirmarAdicionarPreco}
              disabled={!precoForm.produto}
              className="w-full px-6 py-3 rounded-xl text-[#0f172a] font-black disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}
            >
              {editingPreco ? "Salvar" : "Adicionar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Copiar Preços */}
      <Dialog open={dialogCopiarOpen} onOpenChange={setDialogCopiarOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-md flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Copiar Preços de Outro Grupo</DialogTitle>
            <DialogDescription className="text-gray-400">
              Os preços atuais deste grupo serão substituídos.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Grupo de origem</label>
              <select
                value={grupoOrigemCopiar}
                onChange={(e) => setGrupoOrigemCopiar(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
              >
                <option value="">Selecione um grupo...</option>
                {grupos
                  .filter((g) => g.id !== editing?.id)
                  .map((g) => (
                    <option key={g.id} value={g.id}>{g.nome}</option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <button
              onClick={handleCopiarPrecos}
              disabled={!grupoOrigemCopiar}
              className="w-full px-6 py-3 rounded-xl text-[#0f172a] font-black disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}
            >
              Copiar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de exclusão */}
      <AlertDialog open={!!itemParaDeletar} onOpenChange={(o) => !o && setItemParaDeletar(null)}>
        <AlertDialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">Esta ação não pode ser desfeita. Clientes vinculados perderão o grupo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[var(--color-surface)] border border-white/10 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!itemParaDeletar) return
              await deletarGrupo(itemParaDeletar)
              setItemParaDeletar(null)
              load()
            }} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
