import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft, ExternalLink, Package, PackageX } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useCategorias, useConexoes, useFamilias, useLinhas, useToggleConexaoAtivo, useToggleFamiliaAtivo, useToggleLinhaAtivo, useTodosKits, useAbutments, useCicatrizadores, useTodosImplantes, useChavesFerramental, useProtocolos, useTiposOsso, useCriarImplante, useAtualizarImplante, useToggleImplanteAtivo, useRemoverImplante, useRemoverConexao, useRemoverFamilia, useRemoverLinha, useCriarConexao, useAtualizarConexao, useCriarFamilia, useAtualizarFamilia, useCriarLinha, useAtualizarLinha } from "~/features/catalogo/hooks/useCatalogo"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { salvarImplanteChaves, salvarImplanteKits, salvarImplanteAbutments, salvarImplanteCicatrizadores, listarFresasProtocolo } from "~/features/catalogo/services/implantes.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { ImageUploader } from "~/features/catalogo/components/admin/produtos/ImageUploader"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import type { CatalogoImplante } from "~/features/catalogo/types"
import { ImportTrigger, TemplatesDropdown, GlobalImportTrigger, IMPORT_TYPE_GROUPS } from "~/features/catalogo/import"

export const catalogoAdminImplantesRoute = createRoute({
  getParentRoute: () => authLayout, path: "/catalogo/admin/implantes",
  component: () => (<RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_produtos"]}><EmpresaCrudGuard><AdminImplantesPage /></EmpresaCrudGuard></RequirePermission>),
})

const SUB_TABS = ["Conexões", "Famílias", "Linhas", "Implantes"]
const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

function AdminImplantesPage() {
  const [subTab, setSubTab] = useState("Conexões")
  const empresaId = useCatalogoEmpresaId()
  const qc = useQueryClient()
  const { data: categorias } = useCategorias()
  const { data: conexoes } = useConexoes()
  const { data: familias } = useFamilias()
  const { data: linhas } = useLinhas()
  const toggleConexao = useToggleConexaoAtivo()
  const toggleFamilia = useToggleFamiliaAtivo()
  const toggleLinha = useToggleLinhaAtivo()
  const criarImplante = useCriarImplante()
  const atualizarImplante = useAtualizarImplante()
  const toggleImplanteAtivo = useToggleImplanteAtivo()
  const removerImplante = useRemoverImplante()
  const removerConexao = useRemoverConexao()
  const removerFamilia = useRemoverFamilia()
  const removerLinha = useRemoverLinha()
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; table: string; pkColumn: string } | null>(null)

  // Implante modal state
  const [implModalOpen, setImplModalOpen] = useState(false)
  const [implEditing, setImplEditing] = useState<CatalogoImplante | null>(null)
  const [implData, setImplData] = useState({ categoria_id: "", conexao_id: "", familia_id: "", linha_id: "", sku: "", nome: "", sigla: "", descricao: "", osso_soft: "", osso_hard: "", diametro_mm: 0, comprimento_mm: 0, rosca_interna: "", macrogeometria: "", torque_insercao: 0, material: "", superficie: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
  const [implChaves, setImplChaves] = useState<string[]>([])
  const [implKits, setImplKits] = useState<string[]>([])
  const [implAbutments, setImplAbutments] = useState<string[]>([])
  const [implCicatrizadores, setImplCicatrizadores] = useState<string[]>([])
  const [implError, setImplError] = useState("")

  // Protocolo de fresagem — preview de fresas
  type FresaProto = { ordem: number; fresa_nome: string; fresa_sku: string; diametro_mm: number | null }
  const [fresasSoft, setFresasSoft] = useState<FresaProto[]>([])
  const [fresasHard, setFresasHard] = useState<FresaProto[]>([])
  useEffect(() => {
    if (implData.osso_soft) { listarFresasProtocolo(implData.osso_soft).then(setFresasSoft).catch(() => setFresasSoft([])) }
    else { setFresasSoft([]) }
  }, [implData.osso_soft])
  useEffect(() => {
    if (implData.osso_hard) { listarFresasProtocolo(implData.osso_hard).then(setFresasHard).catch(() => setFresasHard([])) }
    else { setFresasHard([]) }
  }, [implData.osso_hard])

  const { data: implantes } = useTodosImplantes()
  const { data: allChaves } = useChavesFerramental()
  const { data: protocolos } = useProtocolos()
  const { data: tiposOsso } = useTiposOsso()
  const { data: allKits } = useTodosKits()
  const { data: allAbutments } = useAbutments()
  const { data: allCicatrizadores } = useCicatrizadores()

  function protoCategoria(protoTipoOsso: string): string | undefined {
    return tiposOsso?.find((t: any) => t.sigla === protoTipoOsso)?.categoria
  }

  function openNewImpl() {
    setImplEditing(null)
    setImplData({ categoria_id: categorias?.[0]?.id ?? "", conexao_id: "", familia_id: "", linha_id: "", sku: "", nome: "", sigla: "", descricao: "", osso_soft: "", osso_hard: "", diametro_mm: 0, comprimento_mm: 0, rosca_interna: "", macrogeometria: "", torque_insercao: 0, material: "", superficie: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
    setImplChaves([]); setImplKits([]); setImplAbutments([]); setImplCicatrizadores([]); setImplError(""); setImplModalOpen(true)
  }
  function openEditImpl(impl: CatalogoImplante) {
    setImplEditing(impl)
    setImplData({ categoria_id: impl.categoria_id ?? "", conexao_id: impl.conexao_id ?? "", familia_id: impl.familia_id ?? "", linha_id: impl.linha_id ?? "", sku: impl.sku, nome: impl.nome ?? "", sigla: impl.sigla ?? "", descricao: impl.descricao ?? "", osso_soft: impl.osso_soft ?? "", osso_hard: impl.osso_hard ?? "", diametro_mm: impl.diametro_mm ?? 0, comprimento_mm: impl.comprimento_mm ?? 0, rosca_interna: impl.rosca_interna ?? "", macrogeometria: impl.macrogeometria ?? "", torque_insercao: impl.torque_insercao ?? 0, material: impl.material ?? "", superficie: impl.superficie ?? "", preco: impl.preco ?? 0, preco_euro: impl.preco_euro ?? 0, preco_dolar: impl.preco_dolar ?? 0, qtd_disponivel: impl.qtd_disponivel ?? 0, qtd_minima_aviso: impl.qtd_minima_aviso ?? 0, ativo: impl.ativo !== false })
    setImplChaves([]); setImplKits([]); setImplAbutments([]); setImplCicatrizadores([]); setImplError(""); setImplModalOpen(true)
    // Carregar dados vinculados
    import("~/features/catalogo/services/implantes.service").then((svc) => {
      svc.listarImplanteChaves(impl.sku).then(setImplChaves).catch(() => setImplChaves([]))
      svc.listarImplanteKits(impl.sku).then(setImplKits).catch(() => setImplKits([]))
      svc.listarImplanteAbutments(impl.sku).then(setImplAbutments).catch(() => setImplAbutments([]))
      svc.listarImplanteCicatrizadores(impl.sku).then(setImplCicatrizadores).catch(() => setImplCicatrizadores([]))
    })
  }

  async function handleSaveImpl() {
    setImplError("")
    if (!implData.sku.trim()) { setImplError("SKU é obrigatório"); return }
    if (!implData.nome.trim()) { setImplError("Nome é obrigatório"); return }
    if (!implData.conexao_id) { setImplError("Conexão é obrigatória"); return }
    if (!implData.familia_id) { setImplError("Família é obrigatória"); return }
    if (!implData.linha_id) { setImplError("Linha é obrigatória"); return }

    // UUID columns: converter "" para null (Postgres rejeita string vazia em uuid)
    const UUID_COLS = ["categoria_id", "conexao_id", "familia_id", "linha_id", "osso_soft", "osso_hard"] as const
    const sanitized = Object.fromEntries(
      Object.entries(implData).map(([k, v]) => [k, UUID_COLS.includes(k as typeof UUID_COLS[number]) && v === "" ? null : v])
    )
    const payload = { ...sanitized }
    try {
      if (implEditing) {
        await atualizarImplante.mutateAsync({ sku: implEditing.sku, input: payload })
      } else {
        await criarImplante.mutateAsync(payload as Parameters<typeof criarImplante.mutateAsync>[0])
      }
    } catch (err: unknown) { setImplError(err instanceof Error ? err.message : String(err)); return }
    // Salvar chaves, kits, abutments e cicatrizadores vinculados
    if (implData.sku) {
      await salvarImplanteChaves(implData.sku, implChaves)
      await salvarImplanteKits(implData.sku, implKits)
      await salvarImplanteAbutments(implData.sku, implAbutments)
      await salvarImplanteCicatrizadores(implData.sku, implCicatrizadores)
    }
    setImplModalOpen(false); qc.invalidateQueries({ queryKey: ["catalogo"] })
  }

  async function handleDelete() {
    if (!deleteItem) return
    try {
      if (deleteItem.table === "catalogo_implantes") {
        await removerImplante.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_ips_conexoes") {
        await removerConexao.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_ips_familias") {
        await removerFamilia.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_ips_linhas") {
        await removerLinha.mutateAsync(deleteItem.id)
      }
    } catch { /* handled by hooks */ }
    qc.invalidateQueries({ queryKey: ["catalogo"] })
    setDeleteItem(null)
  }

  // Filtered selects for cascading
  const filteredConexoes = conexoes?.filter(c => !implData.conexao_id || true) ?? []
  const filteredFamilias = familias?.filter(f => f.conexao_id === implData.conexao_id) ?? []
  const filteredLinhas = linhas?.filter(l => l.familia_id === implData.familia_id) ?? []

  function getSimpleConfig() {
    if (subTab === "Conexões") return { headers: ["Nome", "Sigla", "Categoria", "Ativo", "Ações"], rows: (conexoes ?? []) as unknown as Record<string,unknown>[], table: "catalogo_ips_conexoes", pk: "id" as const, toggle: (row: Record<string,unknown>) => toggleConexao.mutate({ id: row.id as string, ativo: !row.ativo }) }
    if (subTab === "Famílias") return { headers: ["Nome", "Cor", "Conexão", "Ativo", "Ações"], rows: (familias ?? []) as unknown as Record<string,unknown>[], table: "catalogo_ips_familias", pk: "id" as const, toggle: (row: Record<string,unknown>) => toggleFamilia.mutate({ id: row.id as string, ativo: !row.ativo }) }
    if (subTab === "Linhas") return { headers: ["Nome", "Família", "Ativo", "Ações"], rows: (linhas ?? []) as unknown as Record<string,unknown>[], table: "catalogo_ips_linhas", pk: "id" as const, toggle: (row: Record<string,unknown>) => toggleLinha.mutate({ id: row.id as string, ativo: !row.ativo }) }
    return null
  }

  const simpleConfig = getSimpleConfig()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Implantes</h1>
            <p className="text-sm mt-1" style={{color:"var(--color-text-muted, #94a3b8)"}}>Gerencie a estrutura e produtos de implantes.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ImportTrigger types={IMPORT_TYPE_GROUPS.implantes} />
            <TemplatesDropdown types={IMPORT_TYPE_GROUPS.implantes} />
            <GlobalImportTrigger />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">{SUB_TABS.map(st => <button key={st} onClick={() => setSubTab(st)} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${subTab === st ? "bg-[#c9a655] text-[#0f172a]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-transparent hover:border-white/5"}`}>{st}</button>)}</div>

        <div className="rounded-2xl border bg-[var(--color-surface)]/50 p-6 shadow-xl" style={{borderColor:"rgba(201,166,85,0.15)"}}>
          <div className="flex justify-end mb-4">
            {subTab === "Implantes" ? (
              <button onClick={openNewImpl} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO IMPLANTE</button>
            ) : (
              <button onClick={() => { setEditingItem(null); setFormOpen(true) }} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO</button>
            )}
          </div>

          {/* Simple structure tables */}
          {simpleConfig && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">{simpleConfig.headers.map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {simpleConfig.rows.map((row,i) => (
                  <TableRow key={i} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    {simpleConfig.headers.filter(h=>h!=="Ações").map(h => {
                      if(h==="Ativo") return <TableCell key={h}><button onClick={()=>simpleConfig.toggle(row)}>{row.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
                      let v=""; if(h==="Nome")v=String(row.nome??""); else if(h==="Sigla")v=String(row.sigla??""); else if(h==="Categoria")v=String((row as any).categoria?.nome??""); else if(h==="Cor")v=String(row.cor_identificacao??""); else if(h==="Conexão")v=String((row as any).conexao?.nome??""); else if(h==="Família")v=String((row as any).familia?.nome??""); return <TableCell key={h} className="text-sm">{v}</TableCell>
                    })}
                    <TableCell><div className="flex items-center gap-2"><button onClick={()=>{setEditingItem(row);setFormOpen(true)}} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:String(row[simpleConfig.pk]),label:String(row.nome??row[simpleConfig.pk]),table:simpleConfig.table,pkColumn:simpleConfig.pk})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {simpleConfig.rows.length===0&&<TableRow><TableCell colSpan={simpleConfig.headers.length} className="p-4 text-center text-text-muted">Nenhum registro</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Implantes table */}
          {subTab === "Implantes" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["SKU","Nome","Ø (mm)","Comp. mm","Conexão","Família","Linha","Estoque","Mín. Aviso","Ativo","Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(implantes ?? []).map((impl,i) => (
                  <TableRow key={impl.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-mono">{impl.sku}</TableCell>
                    <TableCell className="text-sm">{impl.nome}</TableCell>
                    <TableCell className="text-sm">{impl.diametro_mm}</TableCell>
                    <TableCell className="text-sm">{impl.comprimento_mm}</TableCell>
                    <TableCell className="text-sm">{impl.linha?.familia?.conexao?.nome ?? ""}</TableCell>
                    <TableCell className="text-sm">{impl.linha?.familia?.nome ?? ""}</TableCell>
                    <TableCell className="text-sm">{impl.linha?.nome ?? ""}</TableCell>
                    <TableCell className="text-sm"><div className="flex items-center gap-1.5">{(impl.qtd_disponivel ?? 0) === 0 ? <PackageX className="h-4 w-4 text-red-400" /> : <Package className="h-4 w-4 text-green-400" />}<span className={(impl.qtd_disponivel ?? 0) === 0 ? "text-red-400" : (impl.qtd_disponivel ?? 0) <= (impl.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-green-400"}>{impl.qtd_disponivel ?? 0}</span></div></TableCell>
                    <TableCell className="text-sm text-[var(--color-text-muted)]">{impl.qtd_minima_aviso ?? 0}</TableCell>
                    <TableCell><button onClick={()=>toggleImplanteAtivo.mutate({ sku: impl.sku, ativo: !impl.ativo })}>{impl.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={()=>window.open(`/catalogo/produto/implante/${impl.sku}?empresa=${empresaId}`,'_blank')} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-500/20 text-[var(--color-text-muted)] hover:text-green-400" title="Ver Ficha Técnica"><ExternalLink className="h-3.5 w-3.5"/></button><button onClick={()=>openEditImpl(impl)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:impl.sku,label:impl.nome??impl.sku,table:"catalogo_implantes",pkColumn:"sku"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(!implantes||implantes.length===0)&&<TableRow><TableCell colSpan={11} className="p-4 text-center text-text-muted">Nenhum implante</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Simple structure modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{editingItem ? "Editar" : "Novo"} {subTab.replace(/s$/,"").replace(/ç/g,"c")}</DialogTitle></DialogHeader>
          <SimpleForm subTab={subTab} editingItem={editingItem} table={simpleConfig?.table ?? ""} empresaId={empresaId} onClose={()=>setFormOpen(false)} onSuccess={()=>{setFormOpen(false);qc.invalidateQueries({queryKey:["catalogo"]})}} />
        </DialogContent>
      </Dialog>

      {/* Implante modal com todos os campos */}
      <Dialog open={implModalOpen} onOpenChange={setImplModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{implEditing ? "Editar" : "Novo"} Implante</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">

            {/* Hierarquia em Cascata */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Hierarquia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Conexão *</label><select value={implData.conexao_id} onChange={e=>setImplData({...implData,conexao_id:e.target.value,familia_id:"",linha_id:""})} className={selectCls}><option value="">Selecione...</option>{filteredConexoes.map(c=><option key={c.id} value={c.id}>{c.nome} ({c.sigla})</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Família *</label><select value={implData.familia_id} onChange={e=>setImplData({...implData,familia_id:e.target.value,linha_id:""})} className={selectCls} disabled={!implData.conexao_id}><option value="">Selecione...</option>{filteredFamilias.map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Linha *</label><select value={implData.linha_id} onChange={e=>setImplData({...implData,linha_id:e.target.value})} className={selectCls} disabled={!implData.familia_id}><option value="">Selecione...</option>{filteredLinhas.map(l=><option key={l.id} value={l.id}>{l.nome}</option>)}</select></div>
            </div>

            {/* Identificação */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>SKU *</label><input type="text" value={implData.sku} onChange={e=>setImplData({...implData,sku:e.target.value})} className={inputCls} placeholder="Ex: 524385" /></div>
              <div className="space-y-2"><label className={labelCls}>Nome *</label><input type="text" value={implData.nome} onChange={e=>setImplData({...implData,nome:e.target.value})} className={inputCls} placeholder="Nome do implante" /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={implData.sigla} onChange={e=>setImplData({...implData,sigla:e.target.value})} className={inputCls} placeholder="Ex: IMP" /></div>
              <div className="space-y-2 col-span-2"><label className={labelCls}>Descrição</label><textarea value={implData.descricao} onChange={e=>setImplData({...implData,descricao:e.target.value})} className={inputCls+" min-h-[60px]"} placeholder="Descrição do implante..." /></div>
            </div>

            {/* Protocolos de Fresagem */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Protocolos de Fresagem</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Protocolo Osso Soft (III-IV)</label>
                <select value={implData.osso_soft} onChange={e=>setImplData({...implData,osso_soft:e.target.value})} className={selectCls}><option value="">Nenhum</option>{protocolos?.filter((p:any)=>protoCategoria(p.tipo_osso)==="soft").map((p:any)=><option key={p.id} value={p.id}>{p.nome}</option>)}</select>
                {fresasSoft.length > 0 && (
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2 space-y-1">
                    {fresasSoft.map((f) => (
                      <div key={f.fresa_sku} className="flex items-center gap-2 text-[11px]">
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-[#c9a655]/10 text-[#c9a655] font-black shrink-0">{f.ordem}</span>
                        <span className="text-white truncate">{f.fresa_nome}</span>
                        {f.diametro_mm != null && <span className="text-gray-500 shrink-0">Ø {f.diametro_mm}mm</span>}
                      </div>
                    ))}
                  </div>
                )}
                {implData.osso_soft && fresasSoft.length === 0 && <p className="text-[10px] text-gray-500 italic">Nenhuma fresa neste protocolo</p>}
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Protocolo Osso Hard (I-II)</label>
                <select value={implData.osso_hard} onChange={e=>setImplData({...implData,osso_hard:e.target.value})} className={selectCls}><option value="">Nenhum</option>{protocolos?.filter((p:any)=>protoCategoria(p.tipo_osso)==="hard").map((p:any)=><option key={p.id} value={p.id}>{p.nome}</option>)}</select>
                {fresasHard.length > 0 && (
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2 space-y-1">
                    {fresasHard.map((f) => (
                      <div key={f.fresa_sku} className="flex items-center gap-2 text-[11px]">
                        <span className="w-5 h-5 flex items-center justify-center rounded bg-[#c9a655]/10 text-[#c9a655] font-black shrink-0">{f.ordem}</span>
                        <span className="text-white truncate">{f.fresa_nome}</span>
                        {f.diametro_mm != null && <span className="text-gray-500 shrink-0">Ø {f.diametro_mm}mm</span>}
                      </div>
                    ))}
                  </div>
                )}
                {implData.osso_hard && fresasHard.length === 0 && <p className="text-[10px] text-gray-500 italic">Nenhuma fresa neste protocolo</p>}
              </div>
            </div>

            {/* Composição do Implante */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Composição do Implante</h3>

            <CompositionSection
              label="CHAVES COMPATÍVEIS"
              selectedIds={implChaves}
              options={allChaves?.map((ch: any) => ({ id: ch.sku, label: `${ch.nome} (${ch.sku})` })) ?? []}
              placeholder="Selecione uma chave..."
              onChange={setImplChaves}
            />

            <CompositionSection
              label="KITS"
              selectedIds={implKits}
              options={allKits?.map((k: any) => ({ id: k.sku, label: k.nome })) ?? []}
              placeholder="Selecione um kit..."
              onChange={setImplKits}
            />

            <CompositionSection
              label="ABUTMENTS / COMPONENTES"
              selectedIds={implAbutments}
              options={allAbutments?.map((a: any) => ({ id: a.sku, label: `${a.nome} (${a.sku})` })) ?? []}
              placeholder="Selecione um abutment..."
              onChange={setImplAbutments}
            />

            <CompositionSection
              label="CICATRIZADORES"
              selectedIds={implCicatrizadores}
              options={allCicatrizadores?.map((c: any) => ({ id: c.sku, label: `${c.nome} (${c.sku})` })) ?? []}
              placeholder="Selecione um cicatrizador..."
              onChange={setImplCicatrizadores}
            />

            {/* Especificações Técnicas */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Especificações Técnicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Ø Diâmetro (mm)</label><input type="number" step="0.1" value={implData.diametro_mm} onChange={e=>setImplData({...implData,diametro_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Comprimento (mm)</label><input type="number" step="0.1" value={implData.comprimento_mm} onChange={e=>setImplData({...implData,comprimento_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Rosca Interna</label><input type="text" value={implData.rosca_interna} onChange={e=>setImplData({...implData,rosca_interna:e.target.value})} className={inputCls} placeholder="Ex: M 1.6" /></div>
              <div className="space-y-2"><label className={labelCls}>Macrogeometria</label><input type="text" value={implData.macrogeometria} onChange={e=>setImplData({...implData,macrogeometria:e.target.value})} className={inputCls} placeholder="Ex: Taper" /></div>
              <div className="space-y-2"><label className={labelCls}>Torque (N·cm)</label><input type="number" value={implData.torque_insercao} onChange={e=>setImplData({...implData,torque_insercao:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Material</label><input type="text" value={implData.material} onChange={e=>setImplData({...implData,material:e.target.value})} className={inputCls} placeholder="Ex: Titânio Grau 4" /></div>
              <div className="space-y-2"><label className={labelCls}>Superfície</label><input type="text" value={implData.superficie} onChange={e=>setImplData({...implData,superficie:e.target.value})} className={inputCls} placeholder="Ex: Porous" /></div>
            </div>

            {/* Imagens do Produto */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Imagens do Produto</h3>
            <ImageUploader produtoTipo="implante" produtoSku={implData.sku} />

            {/* Estoque na Loja */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Estoque na Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Qtd Disponível</label><input type="number" min="0" value={implData.qtd_disponivel} onChange={e=>setImplData({...implData,qtd_disponivel:Number(e.target.value)})} className={inputCls} placeholder="0" /></div>
              <div className="space-y-2"><label className={labelCls}>Qtd Mínima (Aviso)</label><input type="number" min="0" value={implData.qtd_minima_aviso} onChange={e=>setImplData({...implData,qtd_minima_aviso:Number(e.target.value)})} className={inputCls} placeholder="0" /></div>
            </div>

            {/* Comercial */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Comercial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className={labelCls}>Preço (R$)</label><input type="number" step="0.01" min="0" value={implData.preco} onChange={e=>setImplData({...implData,preco:Number(e.target.value)})} className={inputCls} placeholder="0,00" /></div>
              <div className="space-y-2"><label className={labelCls}>Preço (€)</label><input type="number" step="0.01" min="0" value={implData.preco_euro} onChange={e=>setImplData({...implData,preco_euro:Number(e.target.value)})} className={inputCls} placeholder="0,00" /></div>
              <div className="space-y-2"><label className={labelCls}>Preço ($)</label><input type="number" step="0.01" min="0" value={implData.preco_dolar} onChange={e=>setImplData({...implData,preco_dolar:Number(e.target.value)})} className={inputCls} placeholder="0,00" /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5 mt-2">
              <div><p className="text-sm font-bold text-white">{implData.ativo ? "Ativo" : "Inativo"}</p><p className="text-xs text-gray-400">Produto visível no catálogo</p></div>
              <Switch checked={implData.ativo} onCheckedChange={v=>setImplData({...implData,ativo:v})} />
            </div>

            {implError && <p className="text-sm text-red-400 text-center">{implError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setImplModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveImpl} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={o=>!o&&setDeleteItem(null)}>
        <AlertDialogContent style={{background:"var(--color-card, #1e293b)",borderColor:"rgba(201,166,85,0.15)"}}>
          <AlertDialogHeader><AlertDialogTitle className="text-white">Excluir?</AlertDialogTitle><AlertDialogDescription>{deleteItem?.label} será removido.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}

function SimpleForm({ subTab, editingItem, table, empresaId, onClose, onSuccess }: { subTab: string; editingItem: Record<string,unknown>|null; table: string; empresaId: string; onClose: () => void; onSuccess: () => void }) {
  const [nome, setNome] = useState("")
  const [sigla, setSigla] = useState("")
  const [cor, setCor] = useState("#c9a655")
  const [parentId, setParentId] = useState("")
  const [ativo, setAtivo] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editingItem) {
      setNome(String(editingItem.nome??""))
      setSigla(String(editingItem.sigla??""))
      setCor(String(editingItem.cor_identificacao??"#c9a655"))
      setParentId(String(editingItem.categoria_id??editingItem.conexao_id??editingItem.familia_id??""))
      setAtivo(editingItem.ativo !== false)
    } else {
      setNome(""); setSigla(""); setCor("#c9a655"); setParentId(""); setAtivo(true)
    }
  }, [editingItem])

  const { data: cats } = useCategorias()
  const { data: concs } = useConexoes()
  const { data: fams } = useFamilias()

  const criarConexao = useCriarConexao()
  const atualizarConexao = useAtualizarConexao()
  const criarFamilia = useCriarFamilia()
  const atualizarFamilia = useAtualizarFamilia()
  const criarLinha = useCriarLinha()
  const atualizarLinha = useAtualizarLinha()

  const isConexao = subTab === "Conexões"
  const isFamilia = subTab === "Famílias"
  const isLinha = subTab === "Linhas"

  async function save() {
    setError("")
    // Validação
    if (!nome.trim()) { setError("Nome é obrigatório"); return }
    if (isConexao && !sigla.trim()) { setError("Sigla é obrigatória"); return }
    if (isConexao && !parentId) { setError("Categoria é obrigatória"); return }
    if (isFamilia && !parentId) { setError("Conexão é obrigatória"); return }
    if (isFamilia && !cor.trim()) { setError("Cor de identificação é obrigatória"); return }
    if (isLinha && !parentId) { setError("Família é obrigatória"); return }

    try {
      if (isConexao) {
        if (editingItem) {
          await atualizarConexao.mutateAsync({ id: editingItem.id as string, input: { nome: nome.trim(), sigla: sigla.trim(), categoria_id: parentId } })
        } else {
          await criarConexao.mutateAsync({ categoria_id: parentId, nome: nome.trim(), sigla: sigla.trim() })
        }
      } else if (isFamilia) {
        if (editingItem) {
          await atualizarFamilia.mutateAsync({ id: editingItem.id as string, input: { nome: nome.trim(), cor_identificacao: cor } })
        } else {
          await criarFamilia.mutateAsync({ conexao_id: parentId, nome: nome.trim(), cor_identificacao: cor })
        }
      } else if (isLinha) {
        if (editingItem) {
          await atualizarLinha.mutateAsync({ id: editingItem.id as string, input: { nome: nome.trim() } })
        } else {
          await criarLinha.mutateAsync({ familia_id: parentId, nome: nome.trim() })
        }
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : String(err)); return }
    onSuccess()
  }

  return (
    <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
      {/* Conexões: Categoria primeiro */}
      {isConexao && (
        <div className="space-y-2">
          <label className={labelCls}>Categoria <span className="text-red-400">*</span></label>
          <select value={parentId} onChange={e => setParentId(e.target.value)} className={selectCls}>
            <option value="">Selecione a categoria...</option>
            {(cats ?? []).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      )}

      {/* Nome */}
      <div className="space-y-2">
        <label className={labelCls}>Nome <span className="text-red-400">*</span></label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)} className={inputCls} placeholder="Ex: Conexão hexagonal" />
      </div>

      {/* Sigla - apenas para Conexões */}
      {isConexao && (
        <div className="space-y-2">
          <label className={labelCls}>Sigla <span className="text-red-400">*</span></label>
          <input type="text" value={sigla} onChange={e => setSigla(e.target.value)} className={inputCls} placeholder="Ex: HEX" />
        </div>
      )}

      {/* Famílias: Conexão */}
      {isFamilia && (
        <div className="space-y-2">
          <label className={labelCls}>Conexão <span className="text-red-400">*</span></label>
          <select value={parentId} onChange={e => setParentId(e.target.value)} className={selectCls}>
            <option value="">Selecione a conexão...</option>
            {(concs ?? []).map(c => <option key={c.id} value={c.id}>{c.nome} ({c.sigla})</option>)}
          </select>
        </div>
      )}

      {/* Famílias: Cor */}
      {isFamilia && (
        <div className="space-y-2">
          <label className={labelCls}>Cor de Identificação</label>
          <div className="flex items-center gap-3">
            <input type="color" value={cor} onChange={e => setCor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border-0" />
            <input type="text" value={cor} onChange={e => setCor(e.target.value)} className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white font-mono text-sm" />
          </div>
        </div>
      )}

      {/* Linhas: Família */}
      {isLinha && (
        <div className="space-y-2">
          <label className={labelCls}>Família <span className="text-red-400">*</span></label>
          <select value={parentId} onChange={e => setParentId(e.target.value)} className={selectCls}>
            <option value="">Selecione a família...</option>
            {(fams ?? []).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
      )}

      {/* Ativo */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
        <div>
          <p className="text-sm font-bold text-white">{ativo ? "Ativo" : "Inativo"}</p>
          <p className="text-xs text-gray-400">Registro visível no sistema</p>
        </div>
        <Switch checked={ativo} onCheckedChange={setAtivo} />
      </div>

      {/* Erro */}
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <DialogFooter className="border-t border-[var(--color-border-subtle)] pt-4">
        <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
        <button onClick={save} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
      </DialogFooter>
    </div>
  )
}

// ============================================================
// CompositionSection — select + Adicionar button pattern
// ============================================================

function CompositionSection({
  label, selectedIds, options, placeholder, onChange,
}: {
  label: string
  selectedIds: string[]
  options: { id: string; label: string }[]
  placeholder: string
  onChange: (ids: string[]) => void
}) {
  const [selected, setSelected] = useState("")

  function handleAdd() {
    if (selected && !selectedIds.includes(selected)) {
      onChange([...selectedIds, selected])
      setSelected("")
    }
  }

  function handleRemove(id: string) {
    onChange(selectedIds.filter((s) => s !== id))
  }

  const allOptions = options.length > 0 ? options : []
  const selectedLabels = selectedIds.map((id) => {
    const found = allOptions.find((o) => o.id === id)
    return { id, label: found?.label ?? id }
  })

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--color-surface)]/50 p-4 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
      <div className="flex gap-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c9a655]/50 transition-colors"
        >
          <option value="">{placeholder}</option>
          {allOptions.filter((o) => !selectedIds.includes(o.id)).map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected}
          className="px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider text-[#0f172a] bg-gradient-to-r from-[#c9a655] to-[#e8d48b] hover:from-[#e8d48b] hover:to-[#c9a655] transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Adicionar
        </button>
      </div>
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedLabels.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9a655]/10 border border-[#c9a655]/20 text-xs font-medium text-[#c9a655]">
              {item.label}
              <button type="button" onClick={() => handleRemove(item.id)} className="ml-0.5 text-[#c9a655]/50 hover:text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
