import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState } from "react"
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft, X, CheckSquare, Square, Package, PackageX } from "lucide-react"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { ImageUploader } from "~/features/catalogo/components/admin/produtos/ImageUploader"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import toast from "react-hot-toast"
import { ImportTrigger, TemplatesDropdown, GlobalImportTrigger, IMPORT_TYPE_GROUPS } from "~/features/catalogo/import"
import { useTiposKit, useTodosKits, useChaves, useFresas, useComplementares, useOpcionais, useImplantesParaKit, useCriarTipoKit, useAtualizarTipoKit, useRemoverTipoKit, useToggleTipoKitAtivo, useCriarKit, useAtualizarKit, useToggleKitAtivo, useRemoverKit, useSalvarKitComposition } from "~/features/catalogo/hooks/useCatalogo"
import * as kits from "~/features/catalogo/services/kits.service"

export const catalogoAdminKitsRoute = createRoute({
  getParentRoute: () => authLayout, path: "/catalogo/admin/kits",
  component: () => (<RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_produtos"]}><EmpresaCrudGuard><AdminKitsPage /></EmpresaCrudGuard></RequirePermission>),
})

const SUB_TABS = ["Tipos de Kit", "Kits"]
const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"
function AdminKitsPage() {
  const [subTab, setSubTab] = useState("Tipos de Kit")
  const empresaId = useCatalogoEmpresaId()

  // Data — query hooks
  const { data: tiposKit } = useTiposKit()
  const { data: kitsList } = useTodosKits()
  const { data: chavesList } = useChaves()
  const { data: fresasList } = useFresas()
  const { data: complementaresList } = useComplementares()
  const { data: opcionaisList } = useOpcionais()
  const { data: implantesList } = useImplantesParaKit()

  // Mutations — tipo kit
  const criarTipoKitMut = useCriarTipoKit()
  const atualizarTipoKitMut = useAtualizarTipoKit()
  const removerTipoKitMut = useRemoverTipoKit()
  const toggleTipoKitMut = useToggleTipoKitAtivo()

  // Mutations — kit
  const criarKitMut = useCriarKit()
  const atualizarKitMut = useAtualizarKit()
  const toggleKitMut = useToggleKitAtivo()
  const removerKitMut = useRemoverKit()
  const salvarCompositionMut = useSalvarKitComposition()

  // Type modal
  const [tipoModalOpen, setTipoModalOpen] = useState(false)
  const [tipoEditing, setTipoEditing] = useState<any>(null)
  const [tipoNome, setTipoNome] = useState("")
  const [tipoSigla, setTipoSigla] = useState("")
  const [tipoAtivo, setTipoAtivo] = useState(true)
  const [tipoError, setTipoError] = useState("")

  // Kit modal
  const [kitModalOpen, setKitModalOpen] = useState(false)
  const [kitEditing, setKitEditing] = useState<any>(null)
  const [kitData, setKitData] = useState({ sku: "", nome: "", sigla: "", descricao: "", tipo_kit_id: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
  const [kitChaves, setKitChaves] = useState<string[]>([])
  const [kitFresas, setKitFresas] = useState<string[]>([])
  const [kitComplementares, setKitComplementares] = useState<string[]>([])
  const [kitOpcionais, setKitOpcionais] = useState<string[]>([])
  const [kitImplantes, setKitImplantes] = useState<string[]>([])
  const [kitTodosDiametros, setKitTodosDiametros] = useState(false)
  const [kitKitsComplementares, setKitKitsComplementares] = useState<string[]>([])
  const [kitKitsRelacionados, setKitKitsRelacionados] = useState<string[]>([])
  const [kitError, setKitError] = useState("")

  // Select helpers for composition
  const [selChave, setSelChave] = useState("")
  const [selFresa, setSelFresa] = useState("")
  const [selComplementar, setSelComplementar] = useState("")
  const [selOpcional, setSelOpcional] = useState("")
  const [selImplante, setSelImplante] = useState("")
  const [selKitComplementar, setSelKitComplementar] = useState("")
  const [selKitRelacionado, setSelKitRelacionado] = useState("")

  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; table: string } | null>(null)

  // Type handlers
  function openNewTipo() { setTipoEditing(null); setTipoNome(""); setTipoSigla(""); setTipoAtivo(true); setTipoError(""); setTipoModalOpen(true) }
  function openEditTipo(item: any) { setTipoEditing(item); setTipoNome(item.nome); setTipoSigla(item.sigla ?? ""); setTipoAtivo(item.ativo !== false); setTipoError(""); setTipoModalOpen(true) }

  async function handleSaveTipo() {
    setTipoError("")
    if (!tipoNome.trim()) { setTipoError("Nome é obrigatório"); return }
    const payload = { nome: tipoNome.trim(), sigla: tipoSigla.trim() || undefined, ativo: tipoAtivo }
    if (tipoEditing) { await atualizarTipoKitMut.mutateAsync({ id: tipoEditing.id, input: payload }).catch((e: any) => { setTipoError(e.message); throw e }) }
    else { await criarTipoKitMut.mutateAsync(payload).catch((e: any) => { setTipoError(e.message); throw e }) }
    toast.success(tipoEditing ? "Atualizado!" : "Criado!")
    setTipoModalOpen(false)
  }

  // Kit handlers
  function openNewKit() { setKitEditing(null); setKitData({ sku: "", nome: "", sigla: "", descricao: "", tipo_kit_id: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true }); setKitChaves([]); setKitFresas([]); setKitComplementares([]); setKitOpcionais([]); setKitImplantes([]); setKitTodosDiametros(false); setKitKitsComplementares([]); setKitKitsRelacionados([]); setKitError(""); setSelChave(""); setSelFresa(""); setSelComplementar(""); setSelOpcional(""); setSelImplante(""); setSelKitComplementar(""); setSelKitRelacionado(""); setKitModalOpen(true) }

  async function openEditKit(item: any) {
    setKitEditing(item); setKitData({ sku: item.sku, nome: item.nome ?? "", sigla: item.sigla ?? "", descricao: item.descricao ?? "", tipo_kit_id: item.tipo_kit_id ?? "", preco: item.preco ?? 0, preco_euro: (item as Record<string, unknown>).preco_euro as number ?? 0, preco_dolar: (item as Record<string, unknown>).preco_dolar as number ?? 0, qtd_disponivel: (item as Record<string, unknown>).qtd_disponivel as number ?? 0, qtd_minima_aviso: (item as Record<string, unknown>).qtd_minima_aviso as number ?? 0, ativo: item.ativo !== false }); setKitError("")
    // Load composition via service methods
    const [chaves, fresas, complementares, opcionais, implantesDetalhe, kc, kr] = await Promise.all([
      kits.listarKitChaves(item.sku),
      kits.listarKitFresas(item.sku),
      kits.listarKitComplementares(item.sku),
      kits.listarKitOpcionais(item.sku),
      kits.listarKitImplantesDetalhe(item.sku),
      kits.listarKitKitsComplementares(item.sku),
      kits.listarKitKitsRelacionados(item.sku),
    ])
    setKitChaves(chaves)
    setKitFresas(fresas)
    setKitComplementares(complementares)
    setKitOpcionais(opcionais)
    const todosD = implantesDetalhe.some((r) => r.todos_diametros)
    setKitTodosDiametros(todosD)
    setKitImplantes(todosD ? [] : implantesDetalhe.map((r) => r.implante_sku))
    setKitKitsComplementares(kc)
    setKitKitsRelacionados(kr)
    setSelChave(""); setSelFresa(""); setSelComplementar(""); setSelOpcional(""); setSelImplante("")
    setSelKitComplementar(""); setSelKitRelacionado("")
    setKitModalOpen(true)
  }

  async function handleSaveKit() {
    setKitError("")
    if (!kitData.sku.trim()) { setKitError("SKU é obrigatório"); return }
    if (!kitData.nome.trim()) { setKitError("Nome é obrigatório"); return }
    // Create or update kit
    if (kitEditing) { await atualizarKitMut.mutateAsync({ sku: kitEditing.sku, input: kitData }).catch((e: any) => { setKitError(e.message); throw e }) }
    else { await criarKitMut.mutateAsync(kitData).catch((e: any) => { setKitError(e.message); throw e }) }
    // Save N:M composition
    const sku = kitData.sku
    const implantesData = kitTodosDiametros
      ? [{ implante_sku: "*", todos_diametros: true }]
      : kitImplantes.map((s) => ({ implante_sku: s, todos_diametros: false }))
    await salvarCompositionMut.mutateAsync({
      kitSku: sku,
      chaves: kitChaves,
      fresas: kitFresas,
      complementares: kitComplementares,
      opcionais: kitOpcionais,
      kitsComplementares: kitKitsComplementares,
      kitsRelacionados: kitKitsRelacionados,
      implantes: implantesData,
    })
    toast.success(kitEditing ? "Kit atualizado!" : "Kit criado!")
    setKitModalOpen(false)
  }

  async function handleDelete() {
    if (!deleteItem) return
    if (deleteItem.table === "catalogo_kits") {
      await removerKitMut.mutateAsync(deleteItem.id)
    } else {
      await removerTipoKitMut.mutateAsync(deleteItem.id)
    }
    toast.success("Excluído!"); setDeleteItem(null)
  }
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Kits</h1>
            <p className="text-sm mt-1" style={{color:"var(--color-text-muted, #94a3b8)"}}>Gerencie tipos e composição de kits.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ImportTrigger types={IMPORT_TYPE_GROUPS.kits} />
            <TemplatesDropdown types={IMPORT_TYPE_GROUPS.kits} />
            <GlobalImportTrigger />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">{SUB_TABS.map(st => <button key={st} onClick={() => setSubTab(st)} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${subTab === st ? "bg-[#c9a655] text-[#0f172a]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-transparent hover:border-white/5"}`}>{st}</button>)}</div>
        <div className="rounded-2xl border bg-[var(--color-surface)]/50 p-6 shadow-xl" style={{borderColor:"rgba(201,166,85,0.15)"}}>
          <div className="flex justify-end mb-4">
            {subTab === "Kits" ? (
              <button onClick={openNewKit} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO KIT</button>
            ) : (
              <button onClick={openNewTipo} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO</button>
            )}
          </div>

          {/* Tipos de Kit */}
          {subTab === "Tipos de Kit" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(tiposKit??[]).map((item:any,i:number)=><TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleTipoKitMut.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditTipo(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_tipos_kits"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(tiposKit??[]).length===0&&<TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Kits */}
          {subTab === "Kits" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["SKU","Nome","Tipo","Preço","Estoque","Mín. Aviso","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(kitsList??[]).map((item:any,i:number)=>{ const estoque=item.qtd_disponivel??0; const minAviso=item.qtd_minima_aviso??0; const estoqueCor=estoque===0?"text-red-400":estoque<=minAviso&&minAviso>0?"text-amber-400":"text-green-400"; return <TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-mono">{item.sku}</TableCell>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.tipo_kit?.nome??"—"}</TableCell>
              <TableCell className="text-sm text-gray-300">R$ {item.preco?.toFixed(2) ?? "0,00"}</TableCell>
              <TableCell className="text-sm"><div className={`flex items-center gap-1.5 ${estoqueCor}`}>{estoque===0?<PackageX className="h-4 w-4"/>:<Package className="h-4 w-4"/>}<span className="font-mono font-bold">{estoque}</span></div></TableCell>
              <TableCell className="text-sm"><span className="font-mono font-bold text-gray-300">{minAviso}</span></TableCell>
              <TableCell><button onClick={()=>toggleKitMut.mutate({sku:item.sku,ativo:!item.ativo})}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditKit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.sku,label:item.nome,table:"catalogo_kits"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>})}{(kitsList??[]).length===0&&<TableRow><TableCell colSpan={8} className="p-4 text-center text-text-muted">Nenhum kit cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}
        </div>
      </div>

      {/* Modal Tipo de Kit */}
      <Dialog open={tipoModalOpen} onOpenChange={setTipoModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{tipoEditing?"Editar":"Novo"} Tipo de Kit</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2"><label className={labelCls}>Nome <span className="text-red-400">*</span></label><input type="text" value={tipoNome} onChange={e=>setTipoNome(e.target.value)} className={inputCls} /></div>
            <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={tipoSigla} onChange={e=>setTipoSigla(e.target.value)} className={inputCls} /></div>
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

      {/* Modal Kit */}
      <Dialog open={kitModalOpen} onOpenChange={setKitModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{kitEditing?"Editar":"Novo"} Kit</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* ─── 1. VINCULAÇÃO ─── */}
            {tiposKit && tiposKit.length > 0 && (
              <>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculação</h3>
                <div className="space-y-2"><label className={labelCls}>Tipo de Kit *</label><select value={kitData.tipo_kit_id} onChange={e=>setKitData({...kitData,tipo_kit_id:e.target.value})} className={selectCls}><option value="">Selecione...</option>{tiposKit?.map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
              </>
            )}

            {/* ─── 2. IDENTIFICAÇÃO ─── */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>SKU *</label><input type="text" value={kitData.sku} onChange={e=>setKitData({...kitData,sku:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Nome *</label><input type="text" value={kitData.nome} onChange={e=>setKitData({...kitData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={kitData.sigla} onChange={e=>setKitData({...kitData,sigla:e.target.value})} className={inputCls} /></div>
            </div>
            <div className="space-y-2"><label className={labelCls}>Descrição</label><textarea value={kitData.descricao} onChange={e=>setKitData({...kitData,descricao:e.target.value})} className={inputCls+" min-h-[60px]"} /></div>

            {/* ─── 3. COMPOSIÇÃO ─── */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Composição</h3>

            {/* Chaves */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Chaves</p>
              <div className="flex gap-2">
                <select value={selChave} onChange={e=>setSelChave(e.target.value)} className={selectCls+" flex-1"}><option value="">Selecione uma chave...</option>{chavesList?.filter((c:any)=>!kitChaves.includes(c.sku)).map((c:any)=><option key={c.sku} value={c.sku}>{c.nome}</option>)}</select>
                <button onClick={()=>{if(selChave){setKitChaves([...kitChaves,selChave]);setSelChave("")}}} disabled={!selChave} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
              </div>
              {kitChaves.map((sku,i)=><div key={i} className="flex items-center justify-between bg-[var(--color-background)] rounded-lg px-3 py-2 border border-white/5"><span className="text-sm text-white">{chavesList?.find((c:any)=>c.sku===sku)?.nome??sku}</span><button onClick={()=>setKitChaves(kitChaves.filter(s=>s!==sku))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4"/></button></div>)}
            </div>

            {/* Fresas */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fresas</p>
              <div className="flex gap-2">
                <select value={selFresa} onChange={e=>setSelFresa(e.target.value)} className={selectCls+" flex-1"}><option value="">Selecione uma fresa...</option>{fresasList?.filter((f:any)=>!kitFresas.includes(f.sku)).map((f:any)=><option key={f.sku} value={f.sku}>{f.nome}</option>)}</select>
                <button onClick={()=>{if(selFresa){setKitFresas([...kitFresas,selFresa]);setSelFresa("")}}} disabled={!selFresa} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
              </div>
              {kitFresas.map((sku,i)=><div key={i} className="flex items-center justify-between bg-[var(--color-background)] rounded-lg px-3 py-2 border border-white/5"><span className="text-sm text-white">{fresasList?.find((f:any)=>f.sku===sku)?.nome??sku}</span><button onClick={()=>setKitFresas(kitFresas.filter(s=>s!==sku))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4"/></button></div>)}
            </div>

            {/* Complementares */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Instrumentais Complementares</p>
              <div className="flex gap-2">
                <select value={selComplementar} onChange={e=>setSelComplementar(e.target.value)} className={selectCls+" flex-1"}><option value="">Selecione...</option>{complementaresList?.filter((c:any)=>!kitComplementares.includes(c.sku)).map((c:any)=><option key={c.sku} value={c.sku}>{c.nome}</option>)}</select>
                <button onClick={()=>{if(selComplementar){setKitComplementares([...kitComplementares,selComplementar]);setSelComplementar("")}}} disabled={!selComplementar} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
              </div>
              {kitComplementares.map((sku,i)=><div key={i} className="flex items-center justify-between bg-[var(--color-background)] rounded-lg px-3 py-2 border border-white/5"><span className="text-sm text-white">{complementaresList?.find((c:any)=>c.sku===sku)?.nome??sku}</span><button onClick={()=>setKitComplementares(kitComplementares.filter(s=>s!==sku))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4"/></button></div>)}
            </div>

            {/* Opcionais */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Instrumentais Opcionais</p>
              <div className="flex gap-2">
                <select value={selOpcional} onChange={e=>setSelOpcional(e.target.value)} className={selectCls+" flex-1"}><option value="">Selecione...</option>{opcionaisList?.filter((o:any)=>!kitOpcionais.includes(o.sku)).map((o:any)=><option key={o.sku} value={o.sku}>{o.nome}</option>)}</select>
                <button onClick={()=>{if(selOpcional){setKitOpcionais([...kitOpcionais,selOpcional]);setSelOpcional("")}}} disabled={!selOpcional} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
              </div>
              {kitOpcionais.map((sku,i)=><div key={i} className="flex items-center justify-between bg-[var(--color-background)] rounded-lg px-3 py-2 border border-white/5"><span className="text-sm text-white">{opcionaisList?.find((o:any)=>o.sku===sku)?.nome??sku}</span><button onClick={()=>setKitOpcionais(kitOpcionais.filter(s=>s!==sku))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4"/></button></div>)}
            </div>

            {/* Kits Complementares */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Kits Complementares</p>
              <div className="flex gap-2">
                <select value={selKitComplementar} onChange={e=>setSelKitComplementar(e.target.value)} className={selectCls+" flex-1"}><option value="">Selecione um kit...</option>{kitsList?.filter((k:any)=>k.sku!==kitData.sku && !kitKitsComplementares.includes(k.sku)).map((k:any)=><option key={k.sku} value={k.sku}>{k.nome}</option>)}</select>
                <button onClick={()=>{if(selKitComplementar){setKitKitsComplementares([...kitKitsComplementares,selKitComplementar]);setSelKitComplementar("")}}} disabled={!selKitComplementar} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
              </div>
              {kitKitsComplementares.map((sku,i)=><div key={i} className="flex items-center justify-between bg-[var(--color-background)] rounded-lg px-3 py-2 border border-white/5"><span className="text-sm text-white">{kitsList?.find((k:any)=>k.sku===sku)?.nome??sku}</span><button onClick={()=>setKitKitsComplementares(kitKitsComplementares.filter(s=>s!==sku))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4"/></button></div>)}
            </div>

            {/* Kits Relacionados */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Kits Relacionados</p>
              <div className="flex gap-2">
                <select value={selKitRelacionado} onChange={e=>setSelKitRelacionado(e.target.value)} className={selectCls+" flex-1"}><option value="">Selecione um kit...</option>{kitsList?.filter((k:any)=>k.sku!==kitData.sku && !kitKitsRelacionados.includes(k.sku)).map((k:any)=><option key={k.sku} value={k.sku}>{k.nome}</option>)}</select>
                <button onClick={()=>{if(selKitRelacionado){setKitKitsRelacionados([...kitKitsRelacionados,selKitRelacionado]);setSelKitRelacionado("")}}} disabled={!selKitRelacionado} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
              </div>
              {kitKitsRelacionados.map((sku,i)=><div key={i} className="flex items-center justify-between bg-[var(--color-background)] rounded-lg px-3 py-2 border border-white/5"><span className="text-sm text-white">{kitsList?.find((k:any)=>k.sku===sku)?.nome??sku}</span><button onClick={()=>setKitKitsRelacionados(kitKitsRelacionados.filter(s=>s!==sku))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4"/></button></div>)}
            </div>

            {/* ─── 4. COMPATIBILIDADE ─── */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Implantes Compatíveis</h3>

            {/* Toggle Todos os Diâmetros */}
            <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
              <button
                type="button"
                onClick={() => { setKitTodosDiametros(!kitTodosDiametros); if (!kitTodosDiametros) setKitImplantes([]) }}
                className="flex items-center gap-3 w-full text-left"
              >
                {kitTodosDiametros ? (
                  <CheckSquare className="h-5 w-5 text-[#c9a655] shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-white">Todos os diâmetros e linhas</p>
                  <p className="text-xs text-gray-400">Compatível com todos os implantes da empresa</p>
                </div>
              </button>
            </div>

            {/* Seleção manual de implantes (só aparece se NÃO está "todos") */}
            {!kitTodosDiametros && (
              <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Selecionar implantes específicos</p>
                <div className="flex gap-2">
                  <select value={selImplante} onChange={e=>setSelImplante(e.target.value)} className={selectCls+" flex-1"}>
                    <option value="">Selecione um implante...</option>
                    {implantesList?.filter((imp:any)=>!kitImplantes.includes(imp.sku)).map((imp:any)=>
                      <option key={imp.sku} value={imp.sku}>{imp.nome} — Ø{imp.diametro_mm}mm ({imp.conexao?.nome} / {imp.familia?.nome} / {imp.linha?.nome})</option>
                    )}
                  </select>
                  <button onClick={()=>{if(selImplante){setKitImplantes([...kitImplantes,selImplante]);setSelImplante("")}}} disabled={!selImplante} className="px-4 py-2 rounded-lg bg-[#c9a655]/20 text-[#c9a655] font-bold text-sm hover:bg-[#c9a655]/30 transition-colors disabled:opacity-30 shrink-0">Adicionar</button>
                </div>
                {kitImplantes.map((sku,i)=>{
                  const imp = implantesList?.find((x:any)=>x.sku===sku)
                  return (
                    <div key={i} className="flex items-center justify-between bg-[var(--color-background)] rounded-lg px-3 py-2 border border-white/5">
                      <span className="text-sm text-white">{imp?.nome??sku} <span className="text-xs text-gray-400">— Ø{imp?.diametro_mm}mm ({imp?.conexao?.nome} / {imp?.familia?.nome} / {imp?.linha?.nome})</span></span>
                      <button onClick={()=>setKitImplantes(kitImplantes.filter(s=>s!==sku))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4"/></button>
                    </div>
                  )
                })}
                {kitImplantes.length === 0 && <p className="text-xs text-gray-500 italic">Nenhum implante selecionado</p>}
              </div>
            )}

            {/* ─── 5. IMAGENS DO PRODUTO ─── */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Imagens do Produto</h3>
            <ImageUploader produtoTipo="kit" produtoSku={kitData.sku} />

            {/* ─── 6. ESTOQUE NA LOJA ─── */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Estoque na Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Qtd Disponível</label>
                <input type="number" step="1" min="0" value={kitData.qtd_disponivel} onChange={e=>setKitData({...kitData,qtd_disponivel:Number(e.target.value)})} className={inputCls} placeholder="0" />
                {kitData.qtd_disponivel > 0 && kitData.qtd_minima_aviso > 0 && kitData.qtd_disponivel <= kitData.qtd_minima_aviso && (
                  <p className="text-xs text-amber-400 font-medium">⚠ Estoque baixo!</p>
                )}
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Qtd Mínima (aviso)</label>
                <input type="number" step="1" min="0" value={kitData.qtd_minima_aviso} onChange={e=>setKitData({...kitData,qtd_minima_aviso:Number(e.target.value)})} className={inputCls} placeholder="0" />
              </div>
            </div>

            {/* ─── 7. COMERCIAL ─── */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Comercial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Preço Fixo (R$)</label>
                <input type="number" step="0.01" min="0" value={kitData.preco} onChange={e=>setKitData({...kitData,preco:Number(e.target.value)})} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Preço (€ Euro)</label>
                <input type="number" step="0.01" min="0" value={kitData.preco_euro} onChange={e=>setKitData({...kitData,preco_euro:Number(e.target.value)})} className={inputCls} placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Preço ($ Dólar)</label>
                <input type="number" step="0.01" min="0" value={kitData.preco_dolar} onChange={e=>setKitData({...kitData,preco_dolar:Number(e.target.value)})} className={inputCls} placeholder="0,00" />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{kitData.ativo?"Ativo":"Inativo"}</p></div>
              <Switch checked={kitData.ativo} onCheckedChange={v=>setKitData({...kitData,ativo:v})} />
            </div>
            {kitError&&<p className="text-sm text-red-400 text-center">{kitError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setKitModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveKit} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
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
