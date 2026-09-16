import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState } from "react"
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft, ChevronDown, ChevronRight } from "lucide-react"
import {
  useWorkflows, useEtapas, useTodasSeqProteticas, useAbutments, useComponentes,
  useToggleWorkflowAtivo, useToggleEtapaAtivo, useToggleSeqProteticaAtivo,
  useCriarTipoWorkflow, useAtualizarTipoWorkflow, useRemoverTipoWorkflow,
  useCriarEtapa, useAtualizarEtapa, useRemoverEtapa,
  useCriarSeqProtetica, useAtualizarSeqProtetica, useSalvarComposicaoSeq, useRemoverSeqProtetica,
  useRemoverWorkflowsItem,
} from "~/features/catalogo/hooks/useCatalogo"
import { listarAbutmentsDaSeq, listarEtapasComponentesDaSeq } from "~/features/catalogo/services/sequencia-protetica.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import toast from "react-hot-toast"
import { ImportTrigger, TemplatesDropdown, GlobalImportTrigger, IMPORT_TYPE_GROUPS } from "~/features/catalogo/import"

export const catalogoAdminWorkflowsRoute = createRoute({
  getParentRoute: () => authLayout, path: "/catalogo/admin/workflows",
  component: () => (<RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_produtos"]}><EmpresaCrudGuard><AdminWorkflowsPage /></EmpresaCrudGuard></RequirePermission>),
})

const SUB_TABS = ["Tipos de Workflow", "Etapas do Workflow", "Sequências Protéticas"]
const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

function AdminWorkflowsPage() {
  const [subTab, setSubTab] = useState("Tipos de Workflow")

  const { data: tiposWorkflow } = useWorkflows()
  const { data: etapas } = useEtapas()
  const { data: seqs } = useTodasSeqProteticas()
  const { data: abutmentsList } = useAbutments()
  const { data: componentesList } = useComponentes()

  // Tipo modal
  const [tipoModalOpen, setTipoModalOpen] = useState(false)
  const [tipoEditing, setTipoEditing] = useState<{ id: string; nome: string; sigla: string | null; ativo: boolean } | null>(null)
  const [tipoNome, setTipoNome] = useState("")
  const [tipoSigla, setTipoSigla] = useState("")
  const [tipoAtivo, setTipoAtivo] = useState(true)
  const [tipoError, setTipoError] = useState("")

  // Etapa modal
  const [etapaModalOpen, setEtapaModalOpen] = useState(false)
  const [etapaEditing, setEtapaEditing] = useState<{ id: string; tipo_workflow_id: string; nome: string; sigla: string | null; ordem: number; ativo: boolean } | null>(null)
  const [etapaData, setEtapaData] = useState({ tipo_workflow_id: "", nome: "", sigla: "", ordem: 1, ativo: true })
  const [etapaError, setEtapaError] = useState("")

  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; table: string } | null>(null)

  // Seq Protetica modal
  const [seqModalOpen, setSeqModalOpen] = useState(false)
  const [seqEditing, setSeqEditing] = useState<{ id: string; nome: string; sigla?: string | null; ativo?: boolean } | null>(null)
  const [seqData, setSeqData] = useState({ nome: "", sigla: "", ativo: true })
  const [seqError, setSeqError] = useState("")
  const [seqAbutmentSku, setSeqAbutmentSku] = useState("")
  const [seqEtapasComponentes, setSeqEtapasComponentes] = useState<Record<string, string[]>>({})
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set())

  // Mutation hooks
  const criarTipo = useCriarTipoWorkflow()
  const atualizarTipo = useAtualizarTipoWorkflow()
  const removerTipo = useRemoverTipoWorkflow()
  const toggleTipoAtivo = useToggleWorkflowAtivo()
  const criarEtapaHook = useCriarEtapa()
  const atualizarEtapaHook = useAtualizarEtapa()
  const removerEtapaHook = useRemoverEtapa()
  const toggleEtapaAtivoHook = useToggleEtapaAtivo()
  const criarSeq = useCriarSeqProtetica()
  const atualizarSeq = useAtualizarSeqProtetica()
  const toggleSeqAtivo = useToggleSeqProteticaAtivo()
  const removerSeq = useRemoverSeqProtetica()
  const salvarComposicaoSeq = useSalvarComposicaoSeq()
  const removerItem = useRemoverWorkflowsItem()

  function openNewSeq() {
    setSeqEditing(null)
    setSeqData({ nome: "", sigla: "", ativo: true })
    setSeqError("")
    setSeqAbutmentSku("")
    setSeqEtapasComponentes({})
    setExpandedEtapas(new Set())
    setSeqModalOpen(true)
  }

  async function openEditSeq(item: { id: string; nome: string; sigla?: string | null; ativo?: boolean }) {
    setSeqEditing(item)
    setSeqData({ nome: item.nome ?? "", sigla: item.sigla ?? "", ativo: item.ativo !== false })
    setSeqError("")

    const [abutmentSku] = await listarAbutmentsDaSeq(item.id)
    const etapasComp = await listarEtapasComponentesDaSeq(item.id)

    setSeqAbutmentSku(abutmentSku ?? "")
    setSeqEtapasComponentes(etapasComp)
    setExpandedEtapas(new Set(Object.keys(etapasComp)))
    setSeqModalOpen(true)
  }

  async function handleSaveSeq() {
    setSeqError("")
    if (!seqData.nome.trim()) { setSeqError("Nome é obrigatório"); return }
    if (!seqAbutmentSku) { setSeqError("Selecione um abutment"); return }

    let seqId = seqEditing?.id
    try {
      if (seqEditing) {
        await atualizarSeq.mutateAsync({ id: seqEditing.id, input: seqData })
      } else {
        const result = await criarSeq.mutateAsync(seqData)
        seqId = result.id
      }
      if (!seqId) { setSeqError("Erro ao salvar sequência"); return }
      await salvarComposicaoSeq.mutateAsync({ seqId, abutment_sku: seqAbutmentSku, etapasComponentes: seqEtapasComponentes })
      toast.success(seqEditing ? "Sequência atualizada!" : "Sequência criada!")
      setSeqModalOpen(false)
    } catch (e) {
      setSeqError((e as Error).message)
    }
  }

  // Tipo handlers
  function openNewTipo() { setTipoEditing(null); setTipoNome(""); setTipoSigla(""); setTipoAtivo(true); setTipoError(""); setTipoModalOpen(true) }
  function openEditTipo(item: { id: string; nome: string; sigla: string | null; ativo: boolean }) { setTipoEditing(item); setTipoNome(item.nome); setTipoSigla(item.sigla ?? ""); setTipoAtivo(item.ativo !== false); setTipoError(""); setTipoModalOpen(true) }

  async function handleSaveTipo() {
    setTipoError("")
    if (!tipoNome.trim()) { setTipoError("Nome é obrigatório"); return }
    try {
      if (tipoEditing) {
        await atualizarTipo.mutateAsync({ id: tipoEditing.id, input: { nome: tipoNome.trim(), sigla: tipoSigla.trim() || null, ativo: tipoAtivo } })
      } else {
        await criarTipo.mutateAsync({ nome: tipoNome.trim(), sigla: tipoSigla.trim() || null })
      }
      toast.success(tipoEditing ? "Atualizado!" : "Criado!")
      setTipoModalOpen(false)
    } catch (e) {
      setTipoError((e as Error).message)
    }
  }

  // Etapa handlers
  function openNewEtapa() { setEtapaEditing(null); setEtapaData({ tipo_workflow_id: "", nome: "", sigla: "", ordem: 1, ativo: true }); setEtapaError(""); setEtapaModalOpen(true) }
  function openEditEtapa(item: { id: string; tipo_workflow_id: string; nome: string; sigla: string | null; ordem: number; ativo: boolean }) { setEtapaEditing(item); setEtapaData({ tipo_workflow_id: item.tipo_workflow_id ?? "", nome: item.nome, sigla: item.sigla ?? "", ordem: item.ordem ?? 1, ativo: item.ativo !== false }); setEtapaError(""); setEtapaModalOpen(true) }

  async function handleSaveEtapa() {
    setEtapaError("")
    if (!etapaData.nome.trim()) { setEtapaError("Nome é obrigatório"); return }
    if (!etapaData.tipo_workflow_id) { setEtapaError("Tipo de Workflow é obrigatório"); return }
    try {
      if (etapaEditing) {
        await atualizarEtapaHook.mutateAsync({ id: etapaEditing.id, input: { ...etapaData } })
      } else {
        await criarEtapaHook.mutateAsync({ tipo_workflow_id: etapaData.tipo_workflow_id, nome: etapaData.nome, sigla: etapaData.sigla || undefined, ordem: etapaData.ordem })
      }
      toast.success(etapaEditing ? "Atualizada!" : "Criada!")
      setEtapaModalOpen(false)
    } catch (e) {
      setEtapaError((e as Error).message)
    }
  }

  async function handleDelete() {
    if (!deleteItem) return
    try {
      await removerItem.mutateAsync({ id: deleteItem.id, table: deleteItem.table })
      toast.success("Excluído!")
      setDeleteItem(null)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  // Composição helpers
  function addEtapaToSeq(etapaId: string) {
    if (!etapaId || seqEtapasComponentes[etapaId]) return
    setSeqEtapasComponentes({ ...seqEtapasComponentes, [etapaId]: [] })
    setExpandedEtapas(new Set([...expandedEtapas, etapaId]))
  }
  function removeEtapaFromSeq(etapaId: string) {
    const next = { ...seqEtapasComponentes }
    delete next[etapaId]
    setSeqEtapasComponentes(next)
    const exp = new Set(expandedEtapas)
    exp.delete(etapaId)
    setExpandedEtapas(exp)
  }
  function toggleEtapaExpand(etapaId: string) {
    const exp = new Set(expandedEtapas)
    if (exp.has(etapaId)) exp.delete(etapaId)
    else exp.add(etapaId)
    setExpandedEtapas(exp)
  }
  function addComponenteToEtapa(etapaId: string, sku: string) {
    if (!sku || seqEtapasComponentes[etapaId]?.includes(sku)) return
    setSeqEtapasComponentes({ ...seqEtapasComponentes, [etapaId]: [...(seqEtapasComponentes[etapaId] ?? []), sku] })
  }
  function removeComponenteFromEtapa(etapaId: string, sku: string) {
    setSeqEtapasComponentes({ ...seqEtapasComponentes, [etapaId]: (seqEtapasComponentes[etapaId] ?? []).filter((s) => s !== sku) })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Workflows</h1>
            <p className="text-sm mt-1" style={{color:"var(--color-text-muted, #94a3b8)"}}>Gerencie tipos de workflow, etapas e sequências protéticas.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ImportTrigger types={IMPORT_TYPE_GROUPS.workflows} />
            <TemplatesDropdown types={IMPORT_TYPE_GROUPS.workflows} />
            <GlobalImportTrigger />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">{SUB_TABS.map(st => <button key={st} onClick={() => setSubTab(st)} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${subTab === st ? "bg-[#c9a655] text-[#0f172a]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-transparent hover:border-white/5"}`}>{st}</button>)}</div>
        <div className="rounded-2xl border bg-[var(--color-surface)]/50 p-6 shadow-xl" style={{borderColor:"rgba(201,166,85,0.15)"}}>
          <div className="flex justify-end mb-4">
            <button onClick={subTab === "Tipos de Workflow" ? openNewTipo : subTab === "Etapas do Workflow" ? openNewEtapa : openNewSeq} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO</button>
          </div>

          {/* Tipos de Workflow */}
          {subTab === "Tipos de Workflow" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(tiposWorkflow??[]).map((item, i) => <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleTipoAtivo.mutate({id:item.id, ativo:!item.ativo})}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditTipo(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_cps_tipos_workflows"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(tiposWorkflow??[]).length===0&&<TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Etapas do Workflow */}
          {subTab === "Etapas do Workflow" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Ordem","Nome","Sigla","Tipo Workflow","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(etapas??[]).map((item, i) => <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-bold text-[#c9a655]">{item.ordem}</TableCell>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.tipo_workflow?.nome??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleEtapaAtivoHook.mutate({id:item.id, ativo:!item.ativo})}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditEtapa(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_cps_etapas_workflows"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(etapas??[]).length===0&&<TableRow><TableCell colSpan={6} className="p-4 text-center text-text-muted">Nenhuma etapa cadastrada</TableCell></TableRow>}</TableBody></Table>
          )}
          {/* Sequências Protéticas */}
          {subTab === "Sequências Protéticas" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(seqs??[]).map((item, i) => <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleSeqAtivo.mutate({id:item.id, ativo:!item.ativo})}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditSeq(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_seq_proteticas"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(seqs??[]).length===0&&<TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhuma sequência cadastrada</TableCell></TableRow>}</TableBody></Table>
          )}
        </div>
      </div>

      {/* Modal Tipo de Workflow */}
      <Dialog open={tipoModalOpen} onOpenChange={setTipoModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{tipoEditing?"Editar":"Novo"} Tipo de Workflow</DialogTitle></DialogHeader>
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

      {/* Modal Etapa do Workflow */}
      <Dialog open={etapaModalOpen} onOpenChange={setEtapaModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{etapaEditing?"Editar":"Nova"} Etapa do Workflow</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2"><label className={labelCls}>Tipo de Workflow <span className="text-red-400">*</span></label><select value={etapaData.tipo_workflow_id} onChange={e=>setEtapaData({...etapaData,tipo_workflow_id:e.target.value})} className={selectCls}><option value="">Selecione...</option>{tiposWorkflow?.map((t)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
            <div className="space-y-2"><label className={labelCls}>Nome <span className="text-red-400">*</span></label><input type="text" value={etapaData.nome} onChange={e=>setEtapaData({...etapaData,nome:e.target.value})} className={inputCls} /></div>
            <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={etapaData.sigla} onChange={e=>setEtapaData({...etapaData,sigla:e.target.value})} className={inputCls} /></div>
            <div className="space-y-2"><label className={labelCls}>Ordem</label><input type="number" min="1" value={etapaData.ordem} onChange={e=>setEtapaData({...etapaData,ordem:Number(e.target.value)})} className={inputCls} /></div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{etapaData.ativo?"Ativo":"Inativo"}</p></div>
              <Switch checked={etapaData.ativo} onCheckedChange={v=>setEtapaData({...etapaData,ativo:v})} />
            </div>
            {etapaError&&<p className="text-sm text-red-400 text-center">{etapaError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setEtapaModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveEtapa} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sequência Protética */}
      <Dialog open={seqModalOpen} onOpenChange={setSeqModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{seqEditing?"Editar":"Nova"} Sequência Protética</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* VINCULAÇÕES */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculações</h3>
            <div className="space-y-2">
              <label className={labelCls}>Abutment <span className="text-red-400">*</span></label>
              <select value={seqAbutmentSku} onChange={(e) => setSeqAbutmentSku(e.target.value)} className={selectCls}>
                <option value="">Selecione um abutment...</option>
                {abutmentsList?.map((a) => (
                  <option key={a.sku} value={a.sku}>{`${a.tipo_abutment?.nome ?? ""} ${a.nome ?? a.sku}`.trim()}</option>
                ))}
              </select>
            </div>

            {/* IDENTIFICAÇÃO */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Nome <span className="text-red-400">*</span></label><input type="text" value={seqData.nome} onChange={e=>setSeqData({...seqData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={seqData.sigla} onChange={e=>setSeqData({...seqData,sigla:e.target.value})} className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{seqData.ativo?"Ativo":"Inativo"}</p></div>
              <Switch checked={seqData.ativo} onCheckedChange={v=>setSeqData({...seqData,ativo:v})} />
            </div>

            {/* COMPOSIÇÃO DA SEQUÊNCIA */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Composição da Sequência</h3>
            <p className="text-xs text-gray-500">Adicione etapas e vincule os componentes de cada uma.</p>

            {/* Select para adicionar etapa */}
            <div className="flex gap-3">
              <select id="add-etapa-select" value="" onChange={(e) => { if (e.target.value) { addEtapaToSeq(e.target.value); e.target.value = "" } }} className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c9a655]/50 transition-colors">
                <option value="">Adicionar etapa...</option>
                {etapas?.filter((e) => !seqEtapasComponentes[e.id]).map((e) => (
                  <option key={e.id} value={e.id}>{`${e.ordem}. ${e.nome}`}</option>
                ))}
              </select>
            </div>

            {/* Acordeão de etapas */}
            {Object.keys(seqEtapasComponentes).length > 0 && (
              <div className="space-y-2">
                {Object.entries(seqEtapasComponentes).map(([etapaId, componentes]) => {
                  const etapa = etapas?.find((e) => e.id === etapaId)
                  const isExpanded = expandedEtapas.has(etapaId)
                  return (
                    <div key={etapaId} className="rounded-xl border border-white/10 bg-[var(--color-surface)]/30 overflow-hidden">
                      {/* Header do acordeão */}
                      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleEtapaExpand(etapaId)}>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-[#c9a655] shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{etapa?.nome ?? etapaId}</p>
                          <p className="text-[10px] text-gray-500">{componentes.length} componente(s)</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeEtapaFromSeq(etapaId) }} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Conteúdo expandível */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                          {/* Select para adicionar componente */}
                          <div className="flex gap-3 pt-3">
                            <select value="" onChange={(e) => { if (e.target.value) { addComponenteToEtapa(etapaId, e.target.value); e.target.value = "" } }} className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c9a655]/50 transition-colors">
                              <option value="">Adicionar componente...</option>
                              {componentesList?.filter((c) => !componentes.includes(c.sku)).map((c) => (
                                <option key={c.sku} value={c.sku}>{c.nome}</option>
                              ))}
                            </select>
                          </div>
                          {/* Lista de componentes vinculados */}
                          {componentes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {componentes.map((sku) => {
                                const comp = componentesList?.find((c) => c.sku === sku)
                                return (
                                  <span key={sku} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9a655]/10 border border-[#c9a655]/20 text-xs font-medium text-[#c9a655]">
                                    {comp?.nome ?? sku}
                                    <button type="button" onClick={() => removeComponenteFromEtapa(etapaId, sku)} className="ml-0.5 text-[#c9a655]/50 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                  </span>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">Nenhum componente vinculado a esta etapa</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {Object.keys(seqEtapasComponentes).length === 0 && (
              <div className="text-center py-6 rounded-xl border border-dashed border-white/10">
                <p className="text-xs text-gray-500">Nenhuma etapa adicionada</p>
              </div>
            )}

            {seqError&&<p className="text-sm text-red-400 text-center">{seqError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setSeqModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveSeq} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
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
