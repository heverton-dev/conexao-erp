import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState } from "react"
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft, Package, PackageX } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { ImageUploader } from "~/features/catalogo/components/admin/produtos/ImageUploader"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import toast from "react-hot-toast"
import { listarKitsDeChave, salvarKitsDeChave, listarKitsDeFresa, salvarKitsDeFresa } from "~/features/catalogo/services/kits.service"
import { CompositionSection } from "~/features/catalogo/components/admin/produtos/CompositionSection"
import { ImportTrigger, TemplatesDropdown, GlobalImportTrigger, IMPORT_TYPE_GROUPS } from "~/features/catalogo/import"
import {
  useTiposChaves, useTiposFresas, useTiposComplementares, useTiposOpcionais,
  useChaves, useFresas, useComplementares, useOpcionais, useTodosKits,
  useCriarTipoChave, useAtualizarTipoChave, useRemoverTipoChave, useToggleTipoChaveAtivo,
  useCriarTipoFresa, useAtualizarTipoFresa, useRemoverTipoFresa, useToggleTipoFresaAtivo,
  useCriarTipoComplementar, useAtualizarTipoComplementar, useRemoverTipoComplementar, useToggleTipoComplementarAtivo,
  useCriarTipoOpcional, useAtualizarTipoOpcional, useRemoverTipoOpcional, useToggleTipoOpcionalAtivo,
  useCriarChave, useAtualizarChave, useRemoverChave, useToggleChaveAtivo,
  useCriarFresa, useAtualizarFresa, useRemoverFresa, useToggleFresaAtivo,
  useCriarComplementar, useAtualizarComplementar, useRemoverComplementar, useToggleComplementarAtivo,
  useCriarOpcional, useAtualizarOpcional, useRemoverOpcional, useToggleOpcionalAtivo,
} from "~/features/catalogo/hooks/useCatalogo"

export const catalogoAdminInstrumentaisRoute = createRoute({
  getParentRoute: () => authLayout, path: "/catalogo/admin/instrumentais",
  component: () => (<RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_produtos"]}><EmpresaCrudGuard><AdminInstrumentaisPage /></EmpresaCrudGuard></RequirePermission>),
})

const SUB_TABS = ["Tipos de Chaves", "Tipos de Fresas", "Tipos Complementares", "Tipos Opcionais", "Chaves", "Fresas", "Complementares", "Opcionais"]
const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

function AdminInstrumentaisPage() {
  const [subTab, setSubTab] = useState("Tipos de Chaves")

  // Data — hooks from useCatalogo
  const { data: tiposChave } = useTiposChaves()
  const { data: tiposFresa } = useTiposFresas()
  const { data: chaves } = useChaves()
  const { data: fresas } = useFresas()
  const { data: tiposComplementar } = useTiposComplementares()
  const { data: complementares } = useComplementares()
  const { data: tiposOpcional } = useTiposOpcionais()
  const { data: opcionais } = useOpcionais()
  const { data: todosKits } = useTodosKits()

  // Mutations — tipos
  const criarTipoChave = useCriarTipoChave()
  const atualizarTipoChave = useAtualizarTipoChave()
  const removerTipoChave = useRemoverTipoChave()
  const toggleTipoChaveAtivo = useToggleTipoChaveAtivo()
  const criarTipoFresa = useCriarTipoFresa()
  const atualizarTipoFresa = useAtualizarTipoFresa()
  const removerTipoFresa = useRemoverTipoFresa()
  const toggleTipoFresaAtivo = useToggleTipoFresaAtivo()
  const criarTipoComplementar = useCriarTipoComplementar()
  const atualizarTipoComplementar = useAtualizarTipoComplementar()
  const removerTipoComplementar = useRemoverTipoComplementar()
  const toggleTipoComplementarAtivo = useToggleTipoComplementarAtivo()
  const criarTipoOpcional = useCriarTipoOpcional()
  const atualizarTipoOpcional = useAtualizarTipoOpcional()
  const removerTipoOpcional = useRemoverTipoOpcional()
  const toggleTipoOpcionalAtivo = useToggleTipoOpcionalAtivo()

  // Mutations — produtos
  const criarChave = useCriarChave()
  const atualizarChave = useAtualizarChave()
  const removerChave = useRemoverChave()
  const toggleChaveAtivo = useToggleChaveAtivo()
  const criarFresa = useCriarFresa()
  const atualizarFresa = useAtualizarFresa()
  const removerFresa = useRemoverFresa()
  const toggleFresaAtivoMut = useToggleFresaAtivo()
  const criarComplementar = useCriarComplementar()
  const atualizarComplementar = useAtualizarComplementar()
  const removerComplementar = useRemoverComplementar()
  const toggleComplementarAtivo = useToggleComplementarAtivo()
  const criarOpcional = useCriarOpcional()
  const atualizarOpcional = useAtualizarOpcional()
  const removerOpcional = useRemoverOpcional()
  const toggleOpcionalAtivo = useToggleOpcionalAtivo()

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [nome, setNome] = useState("")
  const [sigla, setSigla] = useState("")
  const [ativo, setAtivo] = useState(true)
  const [error, setError] = useState("")
  const [activeModal, setActiveModal] = useState<"tipo_chave" | "tipo_fresa" | "tipo_complementar" | "tipo_opcional">("tipo_chave")

  // Product modal state
  const [prodModalOpen, setProdModalOpen] = useState(false)
  const [prodEditing, setProdEditing] = useState<any>(null)
  const [prodData, setProdData] = useState({ sku: "", nome: "", sigla: "", descricao: "", tipo_chave_id: "", tipo_fresa_id: "", tipo_complementar_id: "", tipo_opcional_id: "", tipo: "", comprimento: "", diametro_mm: 0, material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
  const [prodError, setProdError] = useState("")
  const [prodKitsIds, setProdKitsIds] = useState<string[]>([])

  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; table: string } | null>(null)

  // Type handlers
  function openNew() {
    if (subTab === "Tipos de Chaves") { setActiveModal("tipo_chave"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Fresas") { setActiveModal("tipo_fresa"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos Complementares") { setActiveModal("tipo_complementar"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos Opcionais") { setActiveModal("tipo_opcional"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setError(""); setModalOpen(true) }
  }

  function openEdit(item: any) {
    if (subTab === "Tipos de Chaves") { setActiveModal("tipo_chave"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Fresas") { setActiveModal("tipo_fresa"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos Complementares") { setActiveModal("tipo_complementar"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos Opcionais") { setActiveModal("tipo_opcional"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setError(""); setModalOpen(true) }
  }

  async function handleSave() {
    setError("")
    if (!nome.trim()) { setError("Nome é obrigatório"); return }
    const payload = { nome: nome.trim(), sigla: sigla.trim() || undefined }
    try {
      if (editing) {
        if (activeModal === "tipo_chave") await atualizarTipoChave.mutateAsync({ id: editing.id, input: { ...payload, ativo } })
        else if (activeModal === "tipo_fresa") await atualizarTipoFresa.mutateAsync({ id: editing.id, input: { ...payload, ativo } })
        else if (activeModal === "tipo_complementar") await atualizarTipoComplementar.mutateAsync({ id: editing.id, input: { ...payload, ativo } })
        else await atualizarTipoOpcional.mutateAsync({ id: editing.id, input: { ...payload, ativo } })
      } else {
        if (activeModal === "tipo_chave") await criarTipoChave.mutateAsync({ ...payload })
        else if (activeModal === "tipo_fresa") await criarTipoFresa.mutateAsync({ ...payload })
        else if (activeModal === "tipo_complementar") await criarTipoComplementar.mutateAsync({ ...payload })
        else await criarTipoOpcional.mutateAsync({ ...payload })
      }
      toast.success(editing ? "Atualizado!" : "Criado!")
      setModalOpen(false)
    } catch (e: any) { setError(e.message) }
  }

  async function handleDelete() {
    if (!deleteItem) return
    try {
      const isProduct = ["catalogo_chaves", "catalogo_fresas", "catalogo_complementares", "catalogo_opcionais"].includes(deleteItem.table)
      if (isProduct) {
        if (deleteItem.table === "catalogo_chaves") await removerChave.mutateAsync(deleteItem.id)
        else if (deleteItem.table === "catalogo_fresas") await removerFresa.mutateAsync(deleteItem.id)
        else if (deleteItem.table === "catalogo_complementares") await removerComplementar.mutateAsync(deleteItem.id)
        else await removerOpcional.mutateAsync(deleteItem.id)
      } else {
        if (deleteItem.table === "catalogo_tipos_chaves") await removerTipoChave.mutateAsync(deleteItem.id)
        else if (deleteItem.table === "catalogo_tipos_fresas") await removerTipoFresa.mutateAsync(deleteItem.id)
        else if (deleteItem.table === "catalogo_tipos_complementares") await removerTipoComplementar.mutateAsync(deleteItem.id)
        else await removerTipoOpcional.mutateAsync(deleteItem.id)
      }
      toast.success("Excluído!"); setDeleteItem(null)
    } catch (e: any) { toast.error(e.message) }
  }

  // Product handlers
  function openNewProd() {
    if (subTab === "Chaves" || subTab === "Fresas" || subTab === "Complementares" || subTab === "Opcionais") { setProdEditing(null); setProdData({ sku: "", nome: "", sigla: "", descricao: "", tipo_chave_id: "", tipo_fresa_id: "", tipo_complementar_id: "", tipo_opcional_id: "", tipo: "", comprimento: "", diametro_mm: 0, material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true }); setProdKitsIds([]); setProdError(""); setProdModalOpen(true) }
  }

  async function openEditProd(item: any) {
    setProdEditing(item)
    setProdData({ sku: item.sku, nome: item.nome ?? "", sigla: item.sigla ?? "", descricao: item.descricao ?? "", tipo_chave_id: item.tipo_chave_id ?? "", tipo_fresa_id: item.tipo_fresa_id ?? "", tipo_complementar_id: item.tipo_complementar_id ?? "", tipo_opcional_id: item.tipo_opcional_id ?? "", tipo: item.tipo ?? "", comprimento: item.comprimento ?? "", diametro_mm: item.diametro_mm ?? 0, material: item.material ?? "", preco: item.preco ?? 0, preco_euro: item.preco_euro ?? 0, preco_dolar: item.preco_dolar ?? 0, qtd_disponivel: item.qtd_disponivel ?? 0, qtd_minima_aviso: item.qtd_minima_aviso ?? 0, ativo: item.ativo !== false })
    setProdError("")
    setProdModalOpen(true)
    if (subTab === "Chaves") setProdKitsIds(await listarKitsDeChave(item.sku))
    else if (subTab === "Fresas") setProdKitsIds(await listarKitsDeFresa(item.sku))
    else setProdKitsIds([])
  }

  async function handleSaveProd() {
    setProdError("")
    if (!prodData.sku.trim()) { setProdError("SKU é obrigatório"); return }
    if (!prodData.nome.trim()) { setProdError("Nome é obrigatório"); return }

    const base = {
      sigla: prodData.sigla?.trim() || undefined,
      descricao: prodData.descricao?.trim() || undefined,
      tipo: prodData.tipo?.trim() || undefined,
      comprimento: prodData.comprimento?.trim() || undefined,
      diametro_mm: prodData.diametro_mm || undefined,
      material: prodData.material?.trim() || undefined,
      preco: prodData.preco || 0,
      preco_euro: prodData.preco_euro || 0,
      preco_dolar: prodData.preco_dolar || 0,
      qtd_disponivel: prodData.qtd_disponivel || 0,
      qtd_minima_aviso: prodData.qtd_minima_aviso || 0,
      ativo: prodData.ativo,
    }
    try {
      if (subTab === "Chaves") {
        const input = { ...base, sku: prodData.sku.trim(), nome: prodData.nome.trim(), tipo_chave_id: prodData.tipo_chave_id || undefined }
        if (prodEditing) await atualizarChave.mutateAsync({ sku: prodEditing.sku, input })
        else await criarChave.mutateAsync(input)
        await salvarKitsDeChave(prodData.sku.trim(), prodKitsIds)
      } else if (subTab === "Fresas") {
        const input = { ...base, sku: prodData.sku.trim(), nome: prodData.nome.trim(), tipo_fresa_id: prodData.tipo_fresa_id || undefined }
        if (prodEditing) await atualizarFresa.mutateAsync({ sku: prodEditing.sku, input })
        else await criarFresa.mutateAsync(input)
        await salvarKitsDeFresa(prodData.sku.trim(), prodKitsIds)
      } else if (subTab === "Complementares") {
        const input = { ...base, sku: prodData.sku.trim(), nome: prodData.nome.trim(), tipo_complementar_id: prodData.tipo_complementar_id || undefined }
        if (prodEditing) await atualizarComplementar.mutateAsync({ sku: prodEditing.sku, input })
        else await criarComplementar.mutateAsync(input)
      } else {
        const input = { ...base, sku: prodData.sku.trim(), nome: prodData.nome.trim(), tipo_opcional_id: prodData.tipo_opcional_id || undefined }
        if (prodEditing) await atualizarOpcional.mutateAsync({ sku: prodEditing.sku, input })
        else await criarOpcional.mutateAsync(input)
      }
      toast.success(prodEditing ? "Atualizado!" : "Criado!")
      setProdModalOpen(false)
    } catch (e: unknown) { setProdError(e instanceof Error ? e.message : "Erro ao salvar") }
  }

  async function toggleProdAtivo(sku: string, val: boolean) {
    if (subTab === "Chaves") await toggleChaveAtivo.mutateAsync({ sku, ativo: val })
    else if (subTab === "Fresas") await toggleFresaAtivoMut.mutateAsync({ sku, ativo: val })
    else if (subTab === "Complementares") await toggleComplementarAtivo.mutateAsync({ sku, ativo: val })
    else await toggleOpcionalAtivo.mutateAsync({ sku, ativo: val })
  }

  async function toggleTypeAtivo(id: string, val: boolean) {
    if (subTab === "Tipos de Chaves") await toggleTipoChaveAtivo.mutateAsync({ id, ativo: val })
    else if (subTab === "Tipos de Fresas") await toggleTipoFresaAtivo.mutateAsync({ id, ativo: val })
    else if (subTab === "Tipos Complementares") await toggleTipoComplementarAtivo.mutateAsync({ id, ativo: val })
    else await toggleTipoOpcionalAtivo.mutateAsync({ id, ativo: val })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Instrumentais</h1>
            <p className="text-sm mt-1" style={{color:"var(--color-text-muted, #94a3b8)"}}>Gerencie tipos e produtos de instrumentais.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ImportTrigger types={IMPORT_TYPE_GROUPS.instrumentais} />
            <TemplatesDropdown types={IMPORT_TYPE_GROUPS.instrumentais} />
            <GlobalImportTrigger />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">{SUB_TABS.map(st => <button key={st} onClick={() => setSubTab(st)} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${subTab === st ? "bg-[#c9a655] text-[#0f172a]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-transparent hover:border-white/5"}`}>{st}</button>)}</div>
        <div className="rounded-2xl border bg-[var(--color-surface)]/50 p-6 shadow-xl" style={{borderColor:"rgba(201,166,85,0.15)"}}>
          <div className="flex justify-end mb-4">
            {(subTab === "Chaves" || subTab === "Fresas" || subTab === "Complementares" || subTab === "Opcionais") ? (
              <button onClick={openNewProd} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO</button>
            ) : (
              <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO</button>
            )}
          </div>

          {/* Tipos de Chaves */}
          {subTab === "Tipos de Chaves" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(tiposChave??[]).map((item:any,i:number)=><TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleTypeAtivo(item.id,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_tipos_chaves"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(tiposChave??[]).length===0&&<TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Tipos Opcionais */}
          {subTab === "Tipos Opcionais" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(tiposOpcional??[]).map((item:any,i:number)=><TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleTypeAtivo(item.id,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_tipos_opcionais"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(tiposOpcional??[]).length===0&&<TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Opcionais */}
          {subTab === "Opcionais" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["SKU","Nome","Tipo","Estoque","Mín. Aviso","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(opcionais??[]).map((item:any,i:number)=><TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-mono">{item.sku}</TableCell>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.tipo_opcional?.nome??"—"}</TableCell>
              <TableCell><span className={`inline-flex items-center gap-1 font-bold text-sm ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}{item.qtd_disponivel ?? 0}</span></TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">{item.qtd_minima_aviso ?? 0}</span></TableCell>
              <TableCell><button onClick={()=>toggleProdAtivo(item.sku,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditProd(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.sku,label:item.nome,table:"catalogo_opcionais"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(opcionais??[]).length===0&&<TableRow><TableCell colSpan={7} className="p-4 text-center text-text-muted">Nenhum opcional cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Chaves */}
          {subTab === "Chaves" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["SKU","Nome","Tipo","Estoque","Mín. Aviso","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(chaves??[]).map((item:any,i:number)=><TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-mono">{item.sku}</TableCell>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.tipo_chave?.nome??"—"}</TableCell>
              <TableCell><span className={`inline-flex items-center gap-1 font-bold text-sm ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}{item.qtd_disponivel ?? 0}</span></TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">{item.qtd_minima_aviso ?? 0}</span></TableCell>
              <TableCell><button onClick={()=>toggleProdAtivo(item.sku,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditProd(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.sku,label:item.nome,table:"catalogo_chaves"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(chaves??[]).length===0&&<TableRow><TableCell colSpan={7} className="p-4 text-center text-text-muted">Nenhuma chave cadastrada</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Tipos de Fresas */}
          {subTab === "Tipos de Fresas" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(tiposFresa??[]).map((item:any,i:number)=><TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleTypeAtivo(item.id,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_tipos_fresas"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(tiposFresa??[]).length===0&&<TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Tipos Complementares */}
          {subTab === "Tipos Complementares" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["Nome","Sigla","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(tiposComplementar??[]).map((item:any,i:number)=><TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.sigla??"—"}</TableCell>
              <TableCell><button onClick={()=>toggleTypeAtivo(item.id,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.id,label:item.nome,table:"catalogo_tipos_complementares"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(tiposComplementar??[]).length===0&&<TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Complementares */}
          {subTab === "Complementares" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["SKU","Nome","Tipo","Estoque","Mín. Aviso","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(complementares??[]).map((item:any,i:number)=><TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-mono">{item.sku}</TableCell>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.tipo_complementar?.nome??"—"}</TableCell>
              <TableCell><span className={`inline-flex items-center gap-1 font-bold text-sm ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}{item.qtd_disponivel ?? 0}</span></TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">{item.qtd_minima_aviso ?? 0}</span></TableCell>
              <TableCell><button onClick={()=>toggleProdAtivo(item.sku,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditProd(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.sku,label:item.nome,table:"catalogo_complementares"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(complementares??[]).length===0&&<TableRow><TableCell colSpan={7} className="p-4 text-center text-text-muted">Nenhum complementar cadastrado</TableCell></TableRow>}</TableBody></Table>
          )}

          {/* Fresas */}
          {subTab === "Fresas" && (
            <Table><TableHeader><TableRow className="border-b border-[#c9a655]/20">{["SKU","Nome","Tipo","Ø (mm)","Estoque","Mín. Aviso","Ativo","Ações"].map(h=><TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{(fresas??[]).map((item:any,i:number)=><TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
              <TableCell className="text-sm font-mono">{item.sku}</TableCell>
              <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.tipo_fresa?.nome??"—"}</TableCell>
              <TableCell className="text-sm text-gray-300">{item.diametro_mm??"—"}</TableCell>
              <TableCell><span className={`inline-flex items-center gap-1 font-bold text-sm ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}{item.qtd_disponivel ?? 0}</span></TableCell>
              <TableCell><span className="text-[var(--color-text-muted)] text-sm">{item.qtd_minima_aviso ?? 0}</span></TableCell>
              <TableCell><button onClick={()=>toggleProdAtivo(item.sku,!item.ativo)}>{item.ativo?<ToggleRight className="h-7 w-7 text-green-400"/>:<ToggleLeft className="h-7 w-7 text-gray-500"/>}</button></TableCell>
              <TableCell><div className="flex items-center gap-2"><button onClick={()=>openEditProd(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={()=>setDeleteItem({id:item.sku,label:item.nome,table:"catalogo_fresas"})} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
            </TableRow>)}{(fresas??[]).length===0&&<TableRow><TableCell colSpan={8} className="p-4 text-center text-text-muted">Nenhuma fresa cadastrada</TableCell></TableRow>}</TableBody></Table>
          )}
        </div>
      </div>

      {/* Modal Tipo */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{editing?"Editar":"Novo"} {activeModal==="tipo_chave"?"Tipo de Chave":activeModal==="tipo_fresa"?"Tipo de Fresa":activeModal==="tipo_complementar"?"Tipo Complementar":"Tipo Opcional"}</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-2"><label className={labelCls}>Nome <span className="text-red-400">*</span></label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className={inputCls} /></div>
            <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={sigla} onChange={e=>setSigla(e.target.value)} className={inputCls} /></div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{ativo?"Ativo":"Inativo"}</p></div>
              <Switch checked={ativo} onCheckedChange={setAtivo} />
            </div>
            {error&&<p className="text-sm text-red-400 text-center">{error}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Produto */}
      <Dialog open={prodModalOpen} onOpenChange={setProdModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{prodEditing?"Editar":"Novo"} {subTab==="Chaves"?"Chave":subTab==="Fresas"?"Fresa":subTab==="Complementares"?"Complementar":"Opcional"}</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculações</h3>
            <div className="space-y-2">
              <label className={labelCls}>Tipo {subTab==="Chaves"?"de Chave":subTab==="Fresas"?"de Fresa":subTab==="Complementares"?"Complementar":"Opcional"} *</label>
              <select value={subTab==="Chaves"?prodData.tipo_chave_id:subTab==="Fresas"?prodData.tipo_fresa_id:subTab==="Complementares"?prodData.tipo_complementar_id:prodData.tipo_opcional_id} onChange={e=>subTab==="Chaves"?setProdData({...prodData,tipo_chave_id:e.target.value}):subTab==="Fresas"?setProdData({...prodData,tipo_fresa_id:e.target.value}):subTab==="Complementares"?setProdData({...prodData,tipo_complementar_id:e.target.value}):setProdData({...prodData,tipo_opcional_id:e.target.value})} className={selectCls}>
                <option value="">Selecione...</option>
                {(subTab==="Chaves"?tiposChave:subTab==="Fresas"?tiposFresa:subTab==="Complementares"?tiposComplementar:tiposOpcional)?.map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            {(subTab === "Chaves" || subTab === "Fresas") && (
              <>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Composição</h3>
                <CompositionSection label="Kits" selectedIds={prodKitsIds} options={todosKits?.map((k:any)=>({id:k.sku,label:k.nome}))??[]} placeholder="Selecione um kit..." onChange={setProdKitsIds} />
              </>
            )}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>SKU *</label><input type="text" value={prodData.sku} onChange={e=>setProdData({...prodData,sku:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Nome *</label><input type="text" value={prodData.nome} onChange={e=>setProdData({...prodData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={prodData.sigla} onChange={e=>setProdData({...prodData,sigla:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2 col-span-2"><label className={labelCls}>Descrição</label><textarea value={prodData.descricao} onChange={e=>setProdData({...prodData,descricao:e.target.value})} className={inputCls+" min-h-[60px]"} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Especificações</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Tipo</label><input type="text" value={prodData.tipo} onChange={e=>setProdData({...prodData,tipo:e.target.value})} className={inputCls} placeholder="Ex: Hexagonal" /></div>
              <div className="space-y-2"><label className={labelCls}>Comprimento</label><input type="text" value={prodData.comprimento} onChange={e=>setProdData({...prodData,comprimento:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Ø (mm)</label><input type="number" step="0.1" value={prodData.diametro_mm} onChange={e=>setProdData({...prodData,diametro_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Material</label><input type="text" value={prodData.material} onChange={e=>setProdData({...prodData,material:e.target.value})} className={inputCls} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Estoque na Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Qtd Disponível</label><input type="number" min="0" value={prodData.qtd_disponivel} onChange={e=>setProdData({...prodData,qtd_disponivel:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Qtd Mínima (Aviso)</label><input type="number" min="0" value={prodData.qtd_minima_aviso} onChange={e=>setProdData({...prodData,qtd_minima_aviso:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Imagens do Produto</h3>
            <ImageUploader produtoTipo={subTab==="Chaves"?"chave":subTab==="Fresas"?"fresa":subTab==="Complementares"?"complementar":"opcional"} produtoSku={prodData.sku} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Comercial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className={labelCls}>Preço (R$)</label><input type="number" step="0.01" min="0" value={prodData.preco} onChange={e=>setProdData({...prodData,preco:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço (€)</label><input type="number" step="0.01" min="0" value={prodData.preco_euro} onChange={e=>setProdData({...prodData,preco_euro:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço ($)</label><input type="number" step="0.01" min="0" value={prodData.preco_dolar} onChange={e=>setProdData({...prodData,preco_dolar:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{prodData.ativo?"Ativo":"Inativo"}</p></div>
              <Switch checked={prodData.ativo} onCheckedChange={v=>setProdData({...prodData,ativo:v})} />
            </div>
            {prodError&&<p className="text-sm text-red-400 text-center">{prodError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setProdModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveProd} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
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
