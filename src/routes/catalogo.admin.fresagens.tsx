import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft, X, ChevronUp, ChevronDown, Package, PackageX } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import toast from "react-hot-toast"
import { ImportTrigger, TemplatesDropdown, GlobalImportTrigger, IMPORT_TYPE_GROUPS } from "~/features/catalogo/import"
import { useTiposOsso, useProtocolos, useFresas, useImplantesDiametros, useProtocoloFresas, useCriarTipoOsso, useAtualizarTipoOsso, useRemoverTipoOsso, useToggleTipoOssoAtivo, useCriarProtocolo, useAtualizarProtocolo, useRemoverProtocolo, useToggleProtocoloAtivo, useSalvarProtocoloFresas } from "~/features/catalogo/hooks/useCatalogo"

export const catalogoAdminFresagensRoute = createRoute({
  getParentRoute: () => authLayout, path: "/catalogo/admin/fresagens",
  component: () => (<RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_produtos"]}><EmpresaCrudGuard><AdminFresagensPage /></EmpresaCrudGuard></RequirePermission>),
})

const SUB_TABS = ["Tipos de Osso", "Protocolos de Fresagens"]
const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

function AdminFresagensPage() {
  const [subTab, setSubTab] = useState("Tipos de Osso")

  // Query hooks
  const { data: tiposOsso } = useTiposOsso()
  const { data: protocolos } = useProtocolos()
  const { data: fresasList } = useFresas()
  const { data: implantesDiametros } = useImplantesDiametros()

  // Mutation hooks - Tipos de Osso
  const criarTipoOsso = useCriarTipoOsso()
  const atualizarTipoOsso = useAtualizarTipoOsso()
  const removerTipoOsso = useRemoverTipoOsso()
  const toggleTipoOssoAtivo = useToggleTipoOssoAtivo()

  // Mutation hooks - Protocolos
  const criarProtocolo = useCriarProtocolo()
  const atualizarProtocolo = useAtualizarProtocolo()
  const removerProtocolo = useRemoverProtocolo()
  const toggleProtocoloAtivo = useToggleProtocoloAtivo()
  const salvarProtocoloFresas = useSalvarProtocoloFresas()

  // Tipo modal
  const [tipoModalOpen, setTipoModalOpen] = useState(false)
  const [tipoEditing, setTipoEditing] = useState<any>(null)
  const [tipoNome, setTipoNome] = useState("")
  const [tipoSigla, setTipoSigla] = useState("")
  const [tipoCategoria, setTipoCategoria] = useState<"hard" | "soft">("hard")
  const [tipoAtivo, setTipoAtivo] = useState(true)
  const [tipoError, setTipoError] = useState("")

  // Protocolo modal
  const [protoModalOpen, setProtoModalOpen] = useState(false)
  const [protoEditing, setProtoEditing] = useState<any>(null)
  const [protoData, setProtoData] = useState({ nome: "", tipo_osso: "", sigla: "", diametro_mm_aplicavel: 0, ativo: true })
  const [protoFresas, setProtoFresas] = useState<{ fresa_id: string; ordem: number }[]>([])
  const [protoError, setProtoError] = useState("")
  const [selFresa, setSelFresa] = useState("")

  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; table: string } | null>(null)

  // Query for editing protocolo fresas
  const editingProtoId = protoEditing?.id as string | undefined
  const { data: protocoloFresasData } = useProtocoloFresas(editingProtoId ?? "")

  // Seed protoFresas when protocoloFresasData loads for editing
  useEffect(() => {
    if (protocoloFresasData && protoEditing) {
      setProtoFresas(protocoloFresasData.map((r) => ({ fresa_id: r.fresa_id, ordem: r.ordem })))
    }
  }, [protocoloFresasData, protoEditing])

  // Tipo handlers
  function openNewTipo() { setTipoEditing(null); setTipoNome(""); setTipoSigla(""); setTipoCategoria("hard"); setTipoAtivo(true); setTipoError(""); setTipoModalOpen(true) }
  function openEditTipo(item: any) { setTipoEditing(item); setTipoNome(item.nome); setTipoSigla(item.sigla ?? ""); setTipoCategoria(item.categoria ?? "hard"); setTipoAtivo(item.ativo !== false); setTipoError(""); setTipoModalOpen(true) }

  async function handleSaveTipo() {
    setTipoError("")
    if (!tipoNome.trim()) { setTipoError("Nome é obrigatório"); return }
    const payload = { nome: tipoNome.trim(), sigla: tipoSigla.trim() || null, categoria: tipoCategoria, ativo: tipoAtivo }
    try {
      if (tipoEditing) { await atualizarTipoOsso.mutateAsync({ id: tipoEditing.id, input: payload }) }
      else { await criarTipoOsso.mutateAsync(payload) }
      toast.success(tipoEditing ? "Atualizado!" : "Criado!")
      setTipoModalOpen(false)
    } catch (err: unknown) { setTipoError(err instanceof Error ? err.message : "Erro ao salvar"); return }
  }

  // Protocolo handlers
  function openNewProto() { setProtoEditing(null); setProtoData({ nome: "", tipo_osso: tiposOsso?.[0]?.sigla ?? "", sigla: "", diametro_mm_aplicavel: 0, ativo: true }); setProtoFresas([]); setProtoError(""); setSelFresa(""); setProtoModalOpen(true) }

  async function openEditProto(item: any) {
    setProtoEditing(item); setProtoData({ nome: item.nome, tipo_osso: item.tipo_osso ?? "", sigla: item.sigla ?? "", diametro_mm_aplicavel: item.diametro_mm_aplicavel ?? 0, ativo: item.ativo !== false }); setProtoError(""); setSelFresa(""); setProtoFresas([])
    setProtoModalOpen(true)
  }

  async function handleSaveProto() {
    setProtoError("")
    if (!protoData.nome.trim()) { setProtoError("Nome é obrigatório"); return }
    if (!protoData.tipo_osso) { setProtoError("Tipo de Osso é obrigatório"); return }
    try {
      let protoId = protoEditing?.id as string | undefined
      if (protoEditing) { await atualizarProtocolo.mutateAsync({ id: protoEditing.id, input: protoData }) }
      else { const result = await criarProtocolo.mutateAsync({ nome: protoData.nome, tipo_osso: protoData.tipo_osso, sigla: protoData.sigla || undefined, diametro_mm_aplicavel: protoData.diametro_mm_aplicavel || undefined }); protoId = result.id }
      if (protoId) { await salvarProtocoloFresas.mutateAsync({ protocoloId: protoId, items: protoFresas.map((f, i) => ({ fresa_id: f.fresa_id, ordem: i + 1 })) }) }
      toast.success(protoEditing ? "Atualizado!" : "Criado!")
      setProtoModalOpen(false)
    } catch (err: unknown) { setProtoError(err instanceof Error ? err.message : "Erro ao salvar"); return }
  }

  function addFresagemFresa() {
    if (!selFresa) return
    setProtoFresas([...protoFresas, { fresa_id: selFresa, ordem: protoFresas.length + 1 }])
    setSelFresa("")
  }

  function moveFresa(idx: number, dir: -1 | 1) {
    const arr = [...protoFresas]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= arr.length) return
    ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    arr.forEach((f, i) => f.ordem = i + 1)
    setProtoFresas(arr)
  }

  async function handleDelete() {
    if (!deleteItem) return
    try {
      if (deleteItem.table === "catalogo_tipos_ossos") { await removerTipoOsso.mutateAsync(deleteItem.id) }
      else if (deleteItem.table === "catalogo_protocolos_fresagens") { await removerProtocolo.mutateAsync(deleteItem.id) }
      toast.success("Excluído!"); setDeleteItem(null)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro ao excluir") }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Fresagens</h1>
            <p className="text-sm mt-1" style={{color:"var(--color-text-muted, #94a3b8)"}}>Gerencie tipos de osso e protocolos de fresagem.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ImportTrigger types={IMPORT_TYPE_GROUPS.fresagens} />
            <TemplatesDropdown types={IMPORT_TYPE_GROUPS.fresagens} />
            <GlobalImportTrigger />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">{SUB_TABS.map(st => <button key={st} onClick={() => setSubTab(st)} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${subTab === st ? "bg-[#c9a655] text-[#0f172a]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-transparent hover:border-white/5"}`}>{st}</button>)}</div>
        <div className="rounded-2xl border bg-[var(--color-surface)]/50 p-6 shadow-xl" style={{borderColor:"rgba(201,166,85,0.15)"}}>
          <div className="flex justify-end mb-4">
            <button onClick={subTab === "Tipos de Osso" ? openNewTipo : openNewProto} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO</button>
          </div>

          {/* Tipos de Osso */}
          {subTab === "Tipos de Osso" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Categoria","Estoque","Mín. Aviso","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(tiposOsso??[]).map((item:any,i:number)=><TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.categoria==="hard"?"bg-blue-500/20 text-blue-400":"bg-emerald-500/20 text-emerald-400"}`}>{item.categoria==="hard"?"Hard":"Soft"}</span></TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">—</span></TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">—</span></TableCell>
              <TableCell><button onClick={()=>toggleTipoOssoAtivo.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditTipo(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_tipos_ossos"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(tiposOsso??[]).length===0&&<TableRow><TableCell colSpan={7} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Protocolos de Fresagens */}
          {subTab === "Protocolos de Fresagens" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Tipo Osso","Sigla","Estoque","Mín. Aviso","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(protocolos??[]).map((item:any,i:number)=><TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.tipo_osso??"—"}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">—</span></TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">—</span></TableCell>
              <TableCell><button onClick={()=>toggleProtocoloAtivo.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditProto(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_protocolos_fresagens"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(protocolos??[]).length===0&&<TableRow><TableCell colSpan={7} className="p-4 text-center text-text-muted">Nenhum protocolo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}
        </div>
      </div>

      {/* Modal Tipo de Osso */}
      <Dialog open={tipoModalOpen} onOpenChange={setTipoModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{tipoEditing?"Editar":"Novo"} Tipo de Osso</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2"><label className={labelCls}>Nome <span className="text-red-400">*</span></label><input type="text" value={tipoNome} onChange={e=>setTipoNome(e.target.value)} className={inputCls} placeholder="Ex: D1 - Muito Densa" /></div>
            <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={tipoSigla} onChange={e=>setTipoSigla(e.target.value)} className={inputCls} placeholder="Ex: D1" /></div>
            <div className="space-y-2"><label className={labelCls}>Categoria <span className="text-red-400">*</span></label><select value={tipoCategoria} onChange={e=>setTipoCategoria(e.target.value as "hard" | "soft")} className={selectCls}><option value="hard">Hard (I-II)</option><option value="soft">Soft (III-V)</option></select></div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{tipoAtivo?"Ativo":"Inativo"}</p></div>
              <Switch checked={tipoAtivo} onCheckedChange={setTipoAtivo} />
            </div>
            {tipoError&&<p className="text-sm text-red-400 text-center">{tipoError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setTipoModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveTipo} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Protocolo de Fresagem */}
      <Dialog open={protoModalOpen} onOpenChange={setProtoModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{protoEditing?"Editar":"Novo"} Protocolo de Fresagem</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Dados do Protocolo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Nome <span className="text-red-400">*</span></label><input type="text" value={protoData.nome} onChange={e=>setProtoData({...protoData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Tipo de Osso <span className="text-red-400">*</span></label><select value={protoData.tipo_osso} onChange={e=>setProtoData({...protoData,tipo_osso:e.target.value})} className={selectCls}><option value="">Selecione...</option>{tiposOsso?.filter((t:any)=>t.ativo).map((t:any)=><option key={t.id} value={t.sigla}>{t.nome}{t.sigla ? ` (${t.sigla})` : ''}{t.categoria ? ` — ${t.categoria==="hard"?"Hard":"Soft"}` : ''}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={protoData.sigla} onChange={e=>setProtoData({...protoData,sigla:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Ø Aplicável (mm)</label><select value={protoData.diametro_mm_aplicavel} onChange={e=>setProtoData({...protoData,diametro_mm_aplicavel:Number(e.target.value)})} className={selectCls}><option value={0}>Todos</option>{implantesDiametros?.map((d:number)=><option key={d} value={d}>{d} mm</option>)}</select></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{protoData.ativo?"Ativo":"Inativo"}</p></div>
              <Switch checked={protoData.ativo} onCheckedChange={v=>setProtoData({...protoData,ativo:v})} />
            </div>

            {/* Sequência de Fresas */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Sequência de Fresas</h3>
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <div className="flex gap-2">
                <select value={selFresa} onChange={e=>setSelFresa(e.target.value)} className={selectCls+" flex-1"}><option value="">Selecione uma fresa...</option>{fresasList?.map((f:any)=><option key={f.sku} value={f.sku}>{f.nome} (Ø{f.diametro_mm})</option>)}</select>
                <button onClick={addFresagemFresa} disabled={!selFresa} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
              </div>
              {protoFresas.length===0&&<p className="text-xs text-gray-500 italic">Nenhuma fresa adicionada.</p>}
              {protoFresas.map((f,i)=>(
                <div key={i} className="flex items-center gap-3 bg-[var(--color-background)] rounded-lg p-3 border border-white/5">
                  <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#c9a655]/10 text-[#c9a655] text-xs font-black shrink-0">{i+1}</span>
                  <span className="text-sm text-white flex-1">{fresasList?.find((fr:any)=>fr.sku===f.fresa_id)?.nome??f.fresa_id}</span>
                  <button onClick={()=>moveFresa(i,-1)} disabled={i===0} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 disabled:opacity-20"><ChevronUp className="h-4 w-4"/></button>
                  <button onClick={()=>moveFresa(i,1)} disabled={i===protoFresas.length-1} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 disabled:opacity-20"><ChevronDown className="h-4 w-4"/></button>
                  <button onClick={()=>setProtoFresas(protoFresas.filter((_,j)=>j!==i))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/10 text-red-400/60 hover:text-red-400"><X className="h-3.5 w-3.5"/></button>
                </div>
              ))}
            </div>

            {protoError&&<p className="text-sm text-red-400 text-center">{protoError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setProtoModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveProto} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Excluir */}
      <AlertDialog open={!!deleteItem} onOpenChange={o=>!o&&setDeleteItem(null)}>
        <AlertDialogContent style={{background:"var(--color-card, #1e293b)",borderColor:"rgba(201,166,85,0.15)"}}>
          <AlertDialogHeader><AlertDialogTitle className="text-white">Excluir?</AlertDialogTitle><AlertDialogDescription><strong>{deleteItem?.label}</strong> será removido.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
