import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState } from "react"
import { Plus, Pencil, Trash2, ToggleRight, ToggleLeft, Package, PackageX } from "lucide-react"
import { listarAbutmentChaves, listarAbutmentKits, listarAbutmentParafusos, salvarAbutmentChaves, salvarAbutmentKits, salvarAbutmentParafusos } from "~/features/catalogo/services/componentes.service"
import { listarKitsDeCicatrizador, salvarKitsDeCicatrizador } from "~/features/catalogo/services/kits.service"
import { listarSeqProteticasAbutment } from "~/features/catalogo/services/sequencia-protetica.service"
import { CompositionSection } from "~/features/catalogo/components/admin/produtos/CompositionSection"
import { useFamilias, useTiposReabilitacao, useTiposAbutment, useTiposComponente, useTiposParafuso, useTiposCicatrizador, useAbutments, useComponentes, useParafusosList, useChavesList, useReabFamilias, useTodasSequencias, useTodosKits, useTodosImplantes, useToggleTipoReabilitacaoAtivo, useToggleTipoAbutmentAtivo, useToggleTipoComponenteAtivo, useToggleTipoParafusoAtivo, useToggleTipoCicatrizadorAtivo, useToggleAbutmentAtivo, useToggleComponenteAtivo, useToggleParafusoAtivo, useToggleCicatrizadorAtivo, useCriarTipoReabilitacao, useAtualizarTipoReabilitacao, useRemoverTipoReabilitacao, useSalvarReabFamilias, useCriarTipoAbutment, useAtualizarTipoAbutment, useRemoverTipoAbutment, useCriarTipoComponente, useAtualizarTipoComponente, useRemoverTipoComponente, useCriarTipoParafuso, useAtualizarTipoParafuso, useRemoverTipoParafuso, useCriarTipoCicatrizador, useAtualizarTipoCicatrizador, useRemoverTipoCicatrizador, useCriarAbutment, useAtualizarAbutment, useRemoverAbutment, useCriarComponenteProduto, useAtualizarComponenteProduto, useRemoverComponenteProduto, useCriarParafuso, useAtualizarParafuso, useRemoverParafuso, useCriarCicatrizador, useAtualizarCicatrizador, useRemoverCicatrizador, useSalvarAbutmentSeqs, useCicatrizadores } from "~/features/catalogo/hooks/useCatalogo"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { ImageUploader } from "~/features/catalogo/components/admin/produtos/ImageUploader"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import toast from "react-hot-toast"
import { ImportTrigger, TemplatesDropdown, GlobalImportTrigger, IMPORT_TYPE_GROUPS } from "~/features/catalogo/import"

export const catalogoAdminComponentesRoute = createRoute({
  getParentRoute: () => authLayout, path: "/catalogo/admin/componentes",
  component: () => (<RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_produtos"]}><EmpresaCrudGuard><AdminComponentesPage /></EmpresaCrudGuard></RequirePermission>),
})

const SUB_TABS = ["Tipos de Reabilitação", "Tipos de Abutment", "Tipos de Componentes", "Tipos de Parafusos", "Tipos de Cicatrizadores", "Abutments", "Componentes", "Parafusos", "Cicatrizadores"]
const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

/** Converte strings vazias em null para colunas UUID */
function sanitizeUuids(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, keys.includes(k) && v === "" ? null : v]))
}

function AdminComponentesPage() {
  const [subTab, setSubTab] = useState("Tipos de Reabilitação")

  // Data via hooks
  const { data: tiposReab } = useTiposReabilitacao()
  const { data: tiposAbutment } = useTiposAbutment()
  const { data: tiposComponente } = useTiposComponente()
  const { data: tiposParafuso } = useTiposParafuso()
  const { data: tiposCicatrizador } = useTiposCicatrizador()
  const { data: abutments } = useAbutments()
  const { data: parafusosList } = useParafusosList()
  const { data: chavesList } = useChavesList()
  const { data: componentesList } = useComponentes()
  const { data: cicatrizadoresProdutos } = useCicatrizadores()
  const { data: implantesList } = useTodosImplantes()
  const { data: familias } = useFamilias()
  const { data: reabFamilias } = useReabFamilias()
  const { data: todosKits } = useTodosKits()
  const { data: todasSequencias } = useTodasSequencias()

  // Toggles
  const toggleTipoReab = useToggleTipoReabilitacaoAtivo()
  const toggleTipoAbutment = useToggleTipoAbutmentAtivo()
  const toggleTipoComp = useToggleTipoComponenteAtivo()
  const toggleTipoPar = useToggleTipoParafusoAtivo()
  const toggleTipoCic = useToggleTipoCicatrizadorAtivo()
  const toggleAbut = useToggleAbutmentAtivo()
  const toggleComp = useToggleComponenteAtivo()
  const togglePar = useToggleParafusoAtivo()
  const toggleCic = useToggleCicatrizadorAtivo()

  // Mutations - Tipos
  const criarTipoReab = useCriarTipoReabilitacao()
  const atualizarTipoReab = useAtualizarTipoReabilitacao()
  const removerTipoReab = useRemoverTipoReabilitacao()
  const salvarFamiliasReab = useSalvarReabFamilias()
  const criarTipoAbut = useCriarTipoAbutment()
  const atualizarTipoAbut = useAtualizarTipoAbutment()
  const removerTipoAbut = useRemoverTipoAbutment()
  const criarTipoComp = useCriarTipoComponente()
  const atualizarTipoComp = useAtualizarTipoComponente()
  const removerTipoComp = useRemoverTipoComponente()
  const criarTipoPar = useCriarTipoParafuso()
  const atualizarTipoPar = useAtualizarTipoParafuso()
  const removerTipoPar = useRemoverTipoParafuso()
  const criarTipoCic = useCriarTipoCicatrizador()
  const atualizarTipoCic = useAtualizarTipoCicatrizador()
  const removerTipoCic = useRemoverTipoCicatrizador()

  // Mutations - Produtos
  const criarAbut = useCriarAbutment()
  const atualizarAbut = useAtualizarAbutment()
  const removerAbut = useRemoverAbutment()
  const criarComp = useCriarComponenteProduto()
  const atualizarComp = useAtualizarComponenteProduto()
  const removerComp = useRemoverComponenteProduto()
  const criarPar = useCriarParafuso()
  const atualizarPar = useAtualizarParafuso()
  const removerPar = useRemoverParafuso()
  const criarCic = useCriarCicatrizador()
  const atualizarCic = useAtualizarCicatrizador()
  const removerCic = useRemoverCicatrizador()
  const salvarSeqsAbut = useSalvarAbutmentSeqs()
  // Abutment modal
  const [abutModalOpen, setAbutModalOpen] = useState(false)
  const [abutEditing, setAbutEditing] = useState<any>(null)
  const [abutData, setAbutData] = useState({ sku: "", nome: "", sigla: "", descricao: "", familia_id: "", tipo_reabilitacao_id: "", tipo_abutment_id: "", parafuso_id: "", chave_id: "", diametro_plataforma: 0, altura_transmucoso: 0, altura_corpo: 0, angulacao_graus: 0, torque_ncm: 0, preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
  const [abutError, setAbutError] = useState("")
  const [abtChavesIds, setAbtChavesIds] = useState<string[]>([])
  const [abtParafusosIds, setAbtParafusosIds] = useState<string[]>([])
  const [abtKitsIds, setAbtKitsIds] = useState<string[]>([])
  const [abtSeqsIds, setAbtSeqsIds] = useState<string[]>([])
  function openNewAbut() { setAbutEditing(null); setAbutData({ sku: "", nome: "", sigla: "", descricao: "", familia_id: "", tipo_reabilitacao_id: "", tipo_abutment_id: "", parafuso_id: "", chave_id: "", diametro_plataforma: 0, altura_transmucoso: 0, altura_corpo: 0, angulacao_graus: 0, torque_ncm: 0, preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true }); setAbutError(""); setAbtChavesIds([]); setAbtParafusosIds([]); setAbtKitsIds([]); setAbtSeqsIds([]); setAbutModalOpen(true) }

  function openEditAbut(item: any) {
    setAbutEditing(item)
    setAbutData({ sku: item.sku, nome: item.nome ?? "", sigla: item.sigla ?? "", descricao: item.descricao ?? "", familia_id: item.familia_id ?? "", tipo_reabilitacao_id: item.tipo_reabilitacao_id ?? "", tipo_abutment_id: item.tipo_abutment_id ?? "", parafuso_id: item.parafuso_id ?? "", chave_id: item.chave_id ?? "", diametro_plataforma: item.diametro_plataforma ?? 0, altura_transmucoso: item.altura_transmucoso ?? 0, altura_corpo: item.altura_corpo ?? 0, angulacao_graus: item.angulacao_graus ?? 0, torque_ncm: item.torque_ncm ?? 0, preco: item.preco ?? 0, preco_euro: item.preco_euro ?? 0, preco_dolar: item.preco_dolar ?? 0, qtd_disponivel: item.qtd_disponivel ?? 0, qtd_minima_aviso: item.qtd_minima_aviso ?? 0, ativo: item.ativo !== false })
    setAbutError("")
    listarAbutmentChaves(item.sku).then(setAbtChavesIds).catch(() => setAbtChavesIds([]))
    listarAbutmentKits(item.sku).then(setAbtKitsIds).catch(() => setAbtKitsIds([]))
    listarAbutmentParafusos(item.sku).then(setAbtParafusosIds).catch(() => setAbtParafusosIds([]))
    listarSeqProteticasAbutment(item.sku).then(setAbtSeqsIds).catch(() => setAbtSeqsIds([]))
    setAbutModalOpen(true)
  }

  async function handleSaveAbut() {
    setAbutError("")
    if (!abutData.sku.trim()) { setAbutError("SKU é obrigatório"); return }
    if (!abutData.nome.trim()) { setAbutError("Nome é obrigatório"); return }
    const UUID_KEYS = ["familia_id", "tipo_reabilitacao_id", "tipo_abutment_id", "parafuso_id", "chave_id"]
    const payload = sanitizeUuids({ ...abutData }, UUID_KEYS)
    try {
      if (abutEditing) {
        await atualizarAbut.mutateAsync({ sku: abutEditing.sku, input: payload as Parameters<typeof atualizarAbut.mutateAsync>[0]["input"] })
      } else {
        await criarAbut.mutateAsync(payload as Parameters<typeof criarAbut.mutateAsync>[0])
      }
    } catch (err) { setAbutError((err as Error).message); return }
    // Salvar composição N:M
    const sku = abutData.sku
    await salvarAbutmentChaves(sku, abtChavesIds).catch(() => {})
    await salvarAbutmentKits(sku, abtKitsIds).catch(() => {})
    await salvarAbutmentParafusos(sku, abtParafusosIds).catch(() => {})
    await salvarSeqsAbut.mutateAsync({ abutmentSku: sku, seqIds: abtSeqsIds }).catch(() => {})
    toast.success(abutEditing ? "Abutment atualizado!" : "Abutment criado!")
    setAbutModalOpen(false)
  }

  // Componente modal
  const [compModalOpen, setCompModalOpen] = useState(false)
  const [compEditing, setCompEditing] = useState<any>(null)
  const [compData, setCompData] = useState({ sku: "", nome: "", sigla: "", descricao: "", tipo_componente_id: "", tipo_abutment_id: "", parafuso_id: "", chave_id: "", diametro_plataforma_mm: 0, altura_transmucoso_mm: 0, altura_corpo_mm: 0, angulacao_graus: 0, tipo: "", tipo_travamento: "", material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
  const [compError, setCompError] = useState("")

  function openNewComp() { setCompEditing(null); setCompData({ sku: "", nome: "", sigla: "", descricao: "", tipo_componente_id: "", tipo_abutment_id: "", parafuso_id: "", chave_id: "", diametro_plataforma_mm: 0, altura_transmucoso_mm: 0, altura_corpo_mm: 0, angulacao_graus: 0, tipo: "", tipo_travamento: "", material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true }); setCompError(""); setCompModalOpen(true) }
  function openEditComp(item: unknown) { const it = item as Record<string, unknown>; setCompEditing(item); setCompData({ sku: (it.sku as string) ?? "", nome: (it.nome as string) ?? "", sigla: (it.sigla as string) ?? "", descricao: (it.descricao as string) ?? "", tipo_componente_id: (it.tipo_componente_id as string) ?? "", tipo_abutment_id: (it.tipo_abutment_id as string) ?? "", parafuso_id: (it.parafuso_id as string) ?? "", chave_id: (it.chave_id as string) ?? "", diametro_plataforma_mm: (it.diametro_plataforma_mm as number) ?? 0, altura_transmucoso_mm: (it.altura_transmucoso_mm as number) ?? 0, altura_corpo_mm: (it.altura_corpo_mm as number) ?? 0, angulacao_graus: (it.angulacao_graus as number) ?? 0, tipo: (it.tipo as string) ?? "", tipo_travamento: (it.tipo_travamento as string) ?? "", material: (it.material as string) ?? "", preco: (it.preco as number) ?? 0, preco_euro: (it.preco_euro as number) ?? 0, preco_dolar: (it.preco_dolar as number) ?? 0, qtd_disponivel: (it.qtd_disponivel as number) ?? 0, qtd_minima_aviso: (it.qtd_minima_aviso as number) ?? 0, ativo: it.ativo !== false }); setCompError(""); setCompModalOpen(true) }

  async function handleSaveComp() {
    setCompError("")
    if (!compData.sku.trim()) { setCompError("SKU é obrigatório"); return }
    if (!compData.nome.trim()) { setCompError("Nome é obrigatório"); return }
    const UUID_KEYS = ["tipo_componente_id", "tipo_abutment_id", "parafuso_id", "chave_id"]
    const payload = sanitizeUuids({ ...compData }, UUID_KEYS)
    try {
      if (compEditing) {
        await atualizarComp.mutateAsync({ sku: compEditing.sku, input: payload as Parameters<typeof atualizarComp.mutateAsync>[0]["input"] })
      } else {
        await criarComp.mutateAsync(payload as Parameters<typeof criarComp.mutateAsync>[0])
      }
    } catch (err) { setCompError((err as Error).message); return }
    toast.success(compEditing ? "Componente atualizado!" : "Componente criado!")
    setCompModalOpen(false)
  }

  // Parafuso modal
  const [parModalOpen, setParModalOpen] = useState(false)
  const [parEditing, setParEditing] = useState<any>(null)
  const [parData, setParData] = useState({ sku: "", nome: "", sigla: "", descricao: "", tipo_parafuso_id: "", chave_id: "", torque_ncm: 0, material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
  const [parError, setParError] = useState("")

  function openNewPar() { setParEditing(null); setParData({ sku: "", nome: "", sigla: "", descricao: "", tipo_parafuso_id: "", chave_id: "", torque_ncm: 0, material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true }); setParError(""); setParModalOpen(true) }
  function openEditPar(item: unknown) { const it = item as Record<string, unknown>; setParEditing(item); setParData({ sku: (it.sku as string) ?? "", nome: (it.nome as string) ?? "", sigla: (it.sigla as string) ?? "", descricao: (it.descricao as string) ?? "", tipo_parafuso_id: (it.tipo_parafuso_id as string) ?? "", chave_id: (it.chave_id as string) ?? "", torque_ncm: (it.torque_ncm as number) ?? 0, material: (it.material as string) ?? "", preco: (it.preco as number) ?? 0, preco_euro: (it.preco_euro as number) ?? 0, preco_dolar: (it.preco_dolar as number) ?? 0, qtd_disponivel: (it.qtd_disponivel as number) ?? 0, qtd_minima_aviso: (it.qtd_minima_aviso as number) ?? 0, ativo: it.ativo !== false }); setParError(""); setParModalOpen(true) }

  async function handleSavePar() {
    setParError("")
    if (!parData.sku.trim()) { setParError("SKU é obrigatório"); return }
    if (!parData.nome.trim()) { setParError("Nome é obrigatório"); return }
    const UUID_KEYS = ["tipo_parafuso_id", "chave_id"]
    const payload = sanitizeUuids({ ...parData }, UUID_KEYS)
    try {
      if (parEditing) {
        await atualizarPar.mutateAsync({ sku: parEditing.sku, input: payload as Parameters<typeof atualizarPar.mutateAsync>[0]["input"] })
      } else {
        await criarPar.mutateAsync(payload as Parameters<typeof criarPar.mutateAsync>[0])
      }
    } catch (err) { setParError((err as Error).message); return }
    toast.success(parEditing ? "Parafuso atualizado!" : "Parafuso criado!")
    setParModalOpen(false)
  }
  const [cicModalOpen, setCicModalOpen] = useState(false)
  const [cicEditing, setCicEditing] = useState<any>(null)
  const [cicData, setCicData] = useState({ sku: "", nome: "", sigla: "", descricao: "", implante_id: "", chave_id: "", diametro_plataforma_mm: 0, altura_transmucoso_mm: 0, altura_corpo_mm: 0, torque_ncm: 0, material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true })
  const [cicError, setCicError] = useState("")
  const [cicKitsIds, setCicKitsIds] = useState<string[]>([])

  function openNewCic() { setCicEditing(null); setCicData({ sku: "", nome: "", sigla: "", descricao: "", implante_id: "", chave_id: "", diametro_plataforma_mm: 0, altura_transmucoso_mm: 0, altura_corpo_mm: 0, torque_ncm: 0, material: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, ativo: true }); setCicKitsIds([]); setCicError(""); setCicModalOpen(true) }
  async function openEditCic(item: unknown) {
    setCicEditing(item)
    const it = item as Record<string, unknown>
    setCicData({ sku: (it.sku as string) ?? "", nome: (it.nome as string) ?? "", sigla: (it.sigla as string) ?? "", descricao: (it.descricao as string) ?? "", implante_id: (it.implante_id as string) ?? "", chave_id: (it.chave_id as string) ?? "", diametro_plataforma_mm: (it.diametro_plataforma_mm as number) ?? 0, altura_transmucoso_mm: (it.altura_transmucoso_mm as number) ?? 0, altura_corpo_mm: (it.altura_corpo_mm as number) ?? 0, torque_ncm: (it.torque_ncm as number) ?? 0, material: (it.material as string) ?? "", preco: (it.preco as number) ?? 0, preco_euro: (it.preco_euro as number) ?? 0, preco_dolar: (it.preco_dolar as number) ?? 0, qtd_disponivel: (it.qtd_disponivel as number) ?? 0, qtd_minima_aviso: (it.qtd_minima_aviso as number) ?? 0, ativo: it.ativo !== false })
    setCicError("")
    setCicModalOpen(true)
    setCicKitsIds(await listarKitsDeCicatrizador(it.sku as string))
  }

  async function handleSaveCic() {
    setCicError("")
    if (!cicData.sku.trim()) { setCicError("SKU é obrigatório"); return }
    if (!cicData.nome.trim()) { setCicError("Nome é obrigatório"); return }
    const UUID_KEYS = ["implante_id", "chave_id"]
    const payload = sanitizeUuids({ ...cicData }, UUID_KEYS)
    try {
      if (cicEditing) {
        await atualizarCic.mutateAsync({ sku: cicEditing.sku, input: payload as Parameters<typeof atualizarCic.mutateAsync>[0]["input"] })
      } else {
        await criarCic.mutateAsync(payload as Parameters<typeof criarCic.mutateAsync>[0])
      }
    } catch (err) { setCicError((err as Error).message); return }
    await salvarKitsDeCicatrizador(cicData.sku, cicKitsIds)
    toast.success(cicEditing ? "Cicatrizador atualizado!" : "Cicatrizador criado!")
    setCicModalOpen(false)
  }

  // Modal state - Tipos de Reabilitação
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [nome, setNome] = useState("")
  const [sigla, setSigla] = useState("")
  const [ativo, setAtivo] = useState(true)
  const [familiasIds, setFamiliasIds] = useState<string[]>([])
  const [parentId, setParentId] = useState("")
  const [error, setError] = useState("")
  const [activeModal, setActiveModal] = useState<"reab" | "abutment" | "componente" | "parafuso" | "cicatrizador">("reab")

  // Delete
  const [deleteItem, setDeleteItem] = useState<{ id: string; label: string; table: string; pkColumn?: string } | null>(null)

  function openNew() {
    if (subTab === "Tipos de Abutment") { setActiveModal("abutment"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setParentId(""); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Componentes") { setActiveModal("componente"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Parafusos") { setActiveModal("parafuso"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Cicatrizadores") { setActiveModal("cicatrizador"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setError(""); setModalOpen(true) }
    else { setActiveModal("reab"); setEditing(null); setNome(""); setSigla(""); setAtivo(true); setFamiliasIds([]); setError(""); setModalOpen(true) }
  }

  function openEdit(item: any) {
    if (subTab === "Tipos de Abutment") { setActiveModal("abutment"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setParentId(item.tipo_reabilitacao_id ?? ""); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Componentes") { setActiveModal("componente"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Parafusos") { setActiveModal("parafuso"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setError(""); setModalOpen(true) }
    else if (subTab === "Tipos de Cicatrizadores") { setActiveModal("cicatrizador"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setError(""); setModalOpen(true) }
    else { setActiveModal("reab"); setEditing(item); setNome(item.nome); setSigla(item.sigla ?? ""); setAtivo(item.ativo !== false); setFamiliasIds([]); setError(""); setModalOpen(true) }
  }

  async function handleSave() {
    setError("")
    if (!nome.trim()) { setError("Nome é obrigatório"); return }
    try {
      if (activeModal === "abutment") {
        if (editing) {
          await atualizarTipoAbut.mutateAsync({ id: editing.id, input: { nome: nome.trim(), sigla: sigla.trim() || null, ativo, tipo_reabilitacao_id: parentId || null } })
        } else {
          await criarTipoAbut.mutateAsync({ nome: nome.trim(), sigla: sigla.trim() || undefined, tipo_reabilitacao_id: parentId || undefined })
        }
        toast.success(editing ? "Tipo de Abutment atualizado!" : "Tipo de Abutment criado!")
      } else if (activeModal === "componente") {
        if (editing) {
          await atualizarTipoComp.mutateAsync({ id: editing.id, input: { nome: nome.trim(), sigla: sigla.trim() || null, ativo } })
        } else {
          await criarTipoComp.mutateAsync({ nome: nome.trim(), sigla: sigla.trim() || undefined })
        }
        toast.success(editing ? "Tipo de Componente atualizado!" : "Tipo de Componente criado!")
      } else if (activeModal === "parafuso") {
        if (editing) {
          await atualizarTipoPar.mutateAsync({ id: editing.id, input: { nome: nome.trim(), sigla: sigla.trim() || null, ativo } })
        } else {
          await criarTipoPar.mutateAsync({ nome: nome.trim(), sigla: sigla.trim() || undefined })
        }
        toast.success(editing ? "Tipo de Parafuso atualizado!" : "Tipo de Parafuso criado!")
      } else if (activeModal === "cicatrizador") {
        if (editing) {
          await atualizarTipoCic.mutateAsync({ id: editing.id, input: { nome: nome.trim(), sigla: sigla.trim() || null, ativo } })
        } else {
          await criarTipoCic.mutateAsync({ nome: nome.trim(), sigla: sigla.trim() || undefined })
        }
        toast.success(editing ? "Tipo de Cicatrizador atualizado!" : "Tipo de Cicatrizador criado!")
      } else {
        if (editing) {
          await atualizarTipoReab.mutateAsync({ id: editing.id, input: { nome: nome.trim(), sigla: sigla.trim() || null, ativo } })
        } else {
          const data = await criarTipoReab.mutateAsync({ nome: nome.trim(), sigla: sigla.trim() || undefined })
          if (data && familiasIds.length > 0) {
            await salvarFamiliasReab.mutateAsync({ tipoReabId: data.id, familiaIds: familiasIds })
          }
        }
        toast.success(editing ? "Tipo de Reabilitação atualizado!" : "Tipo de Reabilitação criado!")
      }
    } catch (err) { setError((err as Error).message); return }
    setModalOpen(false)
  }

  async function handleDelete() {
    if (!deleteItem) return
    try {
      if (deleteItem.table === "catalogo_cps_tipos_reabilitacao") {
        await removerTipoReab.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_cps_tipos_abutments") {
        await removerTipoAbut.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_cps_tipos_componentes") {
        await removerTipoComp.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_cps_tipos_parafusos") {
        await removerTipoPar.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_cps_tipos_cicatrizadores") {
        await removerTipoCic.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_abutments") {
        await removerAbut.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_componentes") {
        await removerComp.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_parafusos") {
        await removerPar.mutateAsync(deleteItem.id)
      } else if (deleteItem.table === "catalogo_cicatrizadores") {
        await removerCic.mutateAsync(deleteItem.id)
      }
    } catch (err) { toast.error((err as Error).message); return }
    toast.success("Excluído!"); setDeleteItem(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">Componentes</h1>
            <p className="text-sm mt-1" style={{color:"var(--color-text-muted, #94a3b8)"}}>Gerencie tipos e produtos de componentes protéticos.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ImportTrigger types={IMPORT_TYPE_GROUPS.componentes} />
            <TemplatesDropdown types={IMPORT_TYPE_GROUPS.componentes} />
            <GlobalImportTrigger />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {SUB_TABS.map(st => <button key={st} onClick={() => setSubTab(st)} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${subTab === st ? "bg-[#c9a655] text-[#0f172a]" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-transparent hover:border-white/5"}`}>{st}</button>)}
        </div>
        <div className="rounded-2xl border bg-[var(--color-surface)]/50 p-6 shadow-xl" style={{borderColor:"rgba(201,166,85,0.15)"}}>
          <div className="flex justify-end mb-4">
            {subTab === "Abutments" ? (
              <button onClick={openNewAbut} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO ABUTMENT</button>
            ) : subTab === "Componentes" ? (
              <button onClick={openNewComp} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO COMPONENTE</button>
            ) : subTab === "Parafusos" ? (
              <button onClick={openNewPar} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO PARAFUSO</button>
            ) : subTab === "Cicatrizadores" ? (
              <button onClick={openNewCic} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO CICATRIZADOR</button>
            ) : (
              <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)",color:"#0f172a"}}><Plus className="h-4 w-4" /> NOVO</button>
            )}
          </div>

          {/* Tabela de Tipos de Reabilitação */}
          {subTab === "Tipos de Reabilitação" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["Nome", "Sigla", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(tiposReab ?? []).map((item, i) => (
                  <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.sigla ?? "—"}</TableCell>
                    <TableCell><button onClick={() => toggleTipoReab.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.id, label: item.nome, table: "catalogo_cps_tipos_reabilitacao" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(tiposReab ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Tipos de Abutment */}
          {subTab === "Tipos de Abutment" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["Nome", "Sigla", "Tipo de Reabilitação", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(tiposAbutment ?? []).map((item: any, i: number) => (
                  <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.sigla ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.tipo_reabilitacao?.nome ?? "—"}</TableCell>
                    <TableCell><button onClick={() => toggleTipoAbutment.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.id, label: item.nome, table: "catalogo_cps_tipos_abutments" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(tiposAbutment ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Tipos de Componentes */}
          {subTab === "Tipos de Componentes" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["Nome", "Sigla", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(tiposComponente ?? []).map((item: any, i: number) => (
                  <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.sigla ?? "—"}</TableCell>
                    <TableCell><button onClick={() => toggleTipoComp.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.id, label: item.nome, table: "catalogo_cps_tipos_componentes" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(tiposComponente ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Tipos de Parafusos */}
          {subTab === "Tipos de Parafusos" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["Nome", "Sigla", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(tiposParafuso ?? []).map((item: any, i: number) => (
                  <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.sigla ?? "—"}</TableCell>
                    <TableCell><button onClick={() => toggleTipoPar.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.id, label: item.nome, table: "catalogo_cps_tipos_parafusos" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(tiposParafuso ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Tipos de Cicatrizadores */}
          {subTab === "Tipos de Cicatrizadores" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["Nome", "Sigla", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(tiposCicatrizador ?? []).map((item: any, i: number) => (
                  <TableRow key={item.id} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.sigla ?? "—"}</TableCell>
                    <TableCell><button onClick={() => toggleTipoCic.mutate({ id: item.id, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.id, label: item.nome, table: "catalogo_cps_tipos_cicatrizadores" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(tiposCicatrizador ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="p-4 text-center text-text-muted">Nenhum tipo cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Abutments */}
          {subTab === "Abutments" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["SKU", "Nome", "Tipo", "Ø (mm)", "Estoque", "Mín. Aviso", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(abutments ?? []).map((item: any, i: number) => (
                  <TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-mono">{item.sku}</TableCell>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.tipo_abutment?.nome ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.diametro_plataforma ?? "—"}</TableCell>
                    <TableCell className="text-sm"><span className={`flex items-center gap-1 ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-4 w-4" /> : <Package className="h-4 w-4" />}{item.qtd_disponivel ?? 0}</span></TableCell>
                    <TableCell className="text-sm text-[var(--color-text-muted)]">{item.qtd_minima_aviso ?? 0}</TableCell>
                    <TableCell><button onClick={() => toggleAbut.mutate({ sku: item.sku, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEditAbut(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.sku, label: item.nome, table: "catalogo_abutments", pkColumn: "sku" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(abutments ?? []).length === 0 && <TableRow><TableCell colSpan={8} className="p-4 text-center text-text-muted">Nenhum abutment cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Componentes */}
          {subTab === "Componentes" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["SKU", "Nome", "Tipo Comp.", "Tipo Abut.", "Ø (mm)", "Estoque", "Mín. Aviso", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(componentesList ?? []).map((item: any, i: number) => (
                  <TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-mono">{item.sku}</TableCell>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.tipo_componente?.nome ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.tipo_abutment?.nome ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.diametro_plataforma_mm ?? "—"}</TableCell>
                    <TableCell className="text-sm"><span className={`flex items-center gap-1 ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-4 w-4" /> : <Package className="h-4 w-4" />}{item.qtd_disponivel ?? 0}</span></TableCell>
                    <TableCell className="text-sm text-[var(--color-text-muted)]">{item.qtd_minima_aviso ?? 0}</TableCell>
                    <TableCell><button onClick={() => toggleComp.mutate({ sku: item.sku, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEditComp(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.sku, label: item.nome, table: "catalogo_componentes", pkColumn: "sku" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(componentesList ?? []).length === 0 && <TableRow><TableCell colSpan={9} className="p-4 text-center text-text-muted">Nenhum componente cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Parafusos */}
          {subTab === "Parafusos" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["SKU", "Nome", "Tipo", "Torque", "Estoque", "Mín. Aviso", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(parafusosList ?? []).map((item: any, i: number) => (
                  <TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-mono">{item.sku}</TableCell>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.tipo_parafuso?.nome ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.torque_ncm ?? "—"}</TableCell>
                    <TableCell className="text-sm"><span className={`flex items-center gap-1 ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-4 w-4" /> : <Package className="h-4 w-4" />}{item.qtd_disponivel ?? 0}</span></TableCell>
                    <TableCell className="text-sm text-[var(--color-text-muted)]">{item.qtd_minima_aviso ?? 0}</TableCell>
                    <TableCell><button onClick={() => togglePar.mutate({ sku: item.sku, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEditPar(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.sku, label: item.nome, table: "catalogo_parafusos", pkColumn: "sku" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(parafusosList ?? []).length === 0 && <TableRow><TableCell colSpan={8} className="p-4 text-center text-text-muted">Nenhum parafuso cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Tabela de Cicatrizadores */}
          {subTab === "Cicatrizadores" && (
            <Table>
              <TableHeader><TableRow className="border-b border-[#c9a655]/20">
                {["SKU", "Nome", "Implante", "Ø (mm)", "Estoque", "Mín. Aviso", "Ativo", "Ações"].map(h => <TableHead key={h} className="bg-gradient-to-r from-[#c9a655]/10 to-transparent text-[#c9a655] font-black uppercase tracking-wider text-[10px]">{h}</TableHead>)}
              </TableRow></TableHeader>
              <TableBody>
                {(cicatrizadoresProdutos ?? []).map((item: any, i: number) => (
                  <TableRow key={item.sku} className={`${i%2===0?"bg-[var(--color-surface)]/30":""} hover:bg-[#c9a655]/5 border-b border-[var(--color-border-subtle)]/50`}>
                    <TableCell className="text-sm font-mono">{item.sku}</TableCell>
                    <TableCell className="text-sm font-medium text-white">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.implante?.nome ?? item.implante?.sku ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-300">{item.diametro_plataforma_mm ?? "—"}</TableCell>
                    <TableCell className="text-sm"><span className={`flex items-center gap-1 ${(item.qtd_disponivel ?? 0) < 1 ? "text-red-400" : (item.qtd_disponivel ?? 0) <= (item.qtd_minima_aviso ?? 0) ? "text-amber-400" : "text-emerald-400"}`}>{(item.qtd_disponivel ?? 0) < 1 ? <PackageX className="h-4 w-4" /> : <Package className="h-4 w-4" />}{item.qtd_disponivel ?? 0}</span></TableCell>
                    <TableCell className="text-sm text-[var(--color-text-muted)]">{item.qtd_minima_aviso ?? 0}</TableCell>
                    <TableCell><button onClick={() => toggleCic.mutate({ sku: item.sku, ativo: !item.ativo })}>{item.ativo ? <ToggleRight className="h-7 w-7 text-green-400" /> : <ToggleLeft className="h-7 w-7 text-gray-500" />}</button></TableCell>
                    <TableCell><div className="flex items-center gap-2"><button onClick={() => openEditCic(item)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#c9a655]/20 text-[var(--color-text-muted)] hover:text-[#c9a655]"><Pencil className="h-3.5 w-3.5"/></button><button onClick={() => setDeleteItem({ id: item.sku, label: item.nome, table: "catalogo_cicatrizadores", pkColumn: "sku" })} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-3.5 w-3.5"/></button></div></TableCell>
                  </TableRow>
                ))}
                {(cicatrizadoresProdutos ?? []).length === 0 && <TableRow><TableCell colSpan={8} className="p-4 text-center text-text-muted">Nenhum cicatrizador cadastrado</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}

          {/* Outras sub-abas (placeholder) */}
          {subTab !== "Tipos de Reabilitação" && subTab !== "Tipos de Abutment" && subTab !== "Tipos de Componentes" && subTab !== "Tipos de Parafusos" && subTab !== "Tipos de Cicatrizadores" && subTab !== "Abutments" && subTab !== "Componentes" && subTab !== "Parafusos" && subTab !== "Cicatrizadores" && (
            <p className="text-center text-text-muted py-8">Em desenvolvimento...</p>
          )}
        </div>
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-white">
              {editing ? "Editar" : "Novo"} {activeModal === "abutment" ? "Tipo de Abutment" : activeModal === "componente" ? "Tipo de Componente" : activeModal === "parafuso" ? "Tipo de Parafuso" : activeModal === "cicatrizador" ? "Tipo de Cicatrizador" : "Tipo de Reabilitação"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha os dados do tipo.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Tipo de Reabilitação (apenas para Abutment) */}
            {activeModal === "abutment" && (
              <div className="space-y-2">
                <label className={labelCls}>Tipo de Reabilitação</label>
                <select value={parentId} onChange={e => setParentId(e.target.value)} className={selectCls}>
                  <option value="">Selecione...</option>
                  {(tiposReab ?? []).map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            )}
            {/* Nome */}
            <div className="space-y-2">
              <label className={labelCls}>Nome <span className="text-red-400">*</span></label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} className={inputCls} placeholder={activeModal === "abutment" ? "Ex: hexagonal, abutment..." : "Ex: Coroa, Ponte..."} />
            </div>
            {/* Sigla */}
            <div className="space-y-2">
              <label className={labelCls}>Sigla</label>
              <input type="text" value={sigla} onChange={e => setSigla(e.target.value)} className={inputCls} placeholder="Ex: HEX, CRP" />
            </div>
            {/* Famílias (apenas para Tipos de Reabilitação) */}
            {activeModal === "reab" && (
              <div className="space-y-2">
                <label className={labelCls}>Famílias Compatíveis <span className="text-red-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {(familias ?? []).map(f => {
                    const sel = familiasIds.includes(f.id)
                    return <button key={f.id} type="button" onClick={() => setFamiliasIds(sel ? familiasIds.filter(id => id !== f.id) : [...familiasIds, f.id])} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${sel ? "bg-[#c9a655]/20 text-[#c9a655] border-[#c9a655]/30" : "bg-[var(--color-surface)] text-gray-400 border-white/10 hover:border-white/20"}`}>{f.nome}</button>
                  })}
                </div>
              </div>
            )}
            {/* Ativo */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{ativo ? "Ativo" : "Inativo"}</p><p className="text-xs text-gray-400">Tipo visível no sistema</p></div>
              <Switch checked={ativo} onCheckedChange={setAtivo} />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Excluir */}
      <AlertDialog open={!!deleteItem} onOpenChange={o => !o && setDeleteItem(null)}>
        <AlertDialogContent style={{background:"var(--color-card, #1e293b)",borderColor:"rgba(201,166,85,0.15)"}}>
          <AlertDialogHeader><AlertDialogTitle className="text-white">Excluir tipo?</AlertDialogTitle><AlertDialogDescription><strong>{deleteItem?.label}</strong> será removido permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Abutment */}
      <Dialog open={abutModalOpen} onOpenChange={setAbutModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{abutEditing ? "Editar" : "Novo"} Abutment</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculações</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Família</label><select value={abutData.familia_id} onChange={e=>setAbutData({...abutData,familia_id:e.target.value,tipo_reabilitacao_id:"",tipo_abutment_id:""})} className={selectCls}><option value="">Selecione...</option>{(familias ?? []).map((f:any)=><option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Tipo de Reabilitação</label><select value={abutData.tipo_reabilitacao_id} onChange={e=>setAbutData({...abutData,tipo_reabilitacao_id:e.target.value,tipo_abutment_id:""})} className={selectCls} disabled={!abutData.familia_id}><option value="">Selecione...</option>{tiposReab?.filter((t:any)=>reabFamilias?.some(rf=>rf.tipo_reabilitacao_id===t.id && rf.familia_id===abutData.familia_id)).map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Tipo de Abutment</label><select value={abutData.tipo_abutment_id} onChange={e=>setAbutData({...abutData,tipo_abutment_id:e.target.value})} className={selectCls} disabled={!abutData.tipo_reabilitacao_id}><option value="">Selecione...</option>{tiposAbutment?.filter((t:any)=>t.tipo_reabilitacao_id===abutData.tipo_reabilitacao_id).map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>SKU *</label><input type="text" value={abutData.sku} onChange={e=>setAbutData({...abutData,sku:e.target.value})} className={inputCls} placeholder="Ex: ABT-001" /></div>
              <div className="space-y-2"><label className={labelCls}>Nome *</label><input type="text" value={abutData.nome} onChange={e=>setAbutData({...abutData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={abutData.sigla} onChange={e=>setAbutData({...abutData,sigla:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2 col-span-2"><label className={labelCls}>Descrição</label><textarea value={abutData.descricao} onChange={e=>setAbutData({...abutData,descricao:e.target.value})} className={inputCls+" min-h-[60px]"} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Especificações Técnicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Ø Plataforma (mm)</label><input type="number" step="0.1" value={abutData.diametro_plataforma} onChange={e=>setAbutData({...abutData,diametro_plataforma:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Altura Transmucoso (mm)</label><input type="number" step="0.1" value={abutData.altura_transmucoso} onChange={e=>setAbutData({...abutData,altura_transmucoso:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Altura Corpo (mm)</label><input type="number" step="0.1" value={abutData.altura_corpo} onChange={e=>setAbutData({...abutData,altura_corpo:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Ângulo (graus)</label><input type="number" value={abutData.angulacao_graus} onChange={e=>setAbutData({...abutData,angulacao_graus:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Torque (N·cm)</label><input type="number" value={abutData.torque_ncm} onChange={e=>setAbutData({...abutData,torque_ncm:Number(e.target.value)})} className={inputCls} /></div>
              
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Composição do Abutment</h3>
            <CompositionSection label="Chaves Compatíveis" selectedIds={abtChavesIds} options={chavesList?.map((c:any)=>({id:c.sku,label:`${c.nome} (${c.sku})`}))??[]} placeholder="Selecione uma chave..." onChange={setAbtChavesIds} />
            <CompositionSection label="Parafusos" selectedIds={abtParafusosIds} options={parafusosList?.map((p:any)=>({id:p.sku,label:p.nome}))??[]} placeholder="Selecione um parafuso..." onChange={setAbtParafusosIds} />
            <CompositionSection label="Kits" selectedIds={abtKitsIds} options={todosKits?.map((k:any)=>({id:k.sku,label:k.nome}))??[]} placeholder="Selecione um kit..." onChange={setAbtKitsIds} />
            <CompositionSection label="Sequências Protéticas" selectedIds={abtSeqsIds} options={todasSequencias?.map((s:any)=>({id:s.id,label:`${s.nome}${s.sigla?` (${s.sigla})`:""}`}))??[]} placeholder="Selecione uma sequência..." onChange={setAbtSeqsIds} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Imagens do Produto</h3>
            <ImageUploader produtoTipo="abutment" produtoSku={abutData.sku} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Estoque na Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Qtd Disponível</label><input type="number" min="0" value={abutData.qtd_disponivel} onChange={e=>setAbutData({...abutData,qtd_disponivel:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Qtd Mínima Aviso</label><input type="number" min="0" value={abutData.qtd_minima_aviso} onChange={e=>setAbutData({...abutData,qtd_minima_aviso:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Comercial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className={labelCls}>Preço (R$)</label><input type="number" step="0.01" min="0" value={abutData.preco} onChange={e=>setAbutData({...abutData,preco:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço (€)</label><input type="number" step="0.01" min="0" value={abutData.preco_euro} onChange={e=>setAbutData({...abutData,preco_euro:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço ($)</label><input type="number" step="0.01" min="0" value={abutData.preco_dolar} onChange={e=>setAbutData({...abutData,preco_dolar:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{abutData.ativo ? "Ativo" : "Inativo"}</p></div>
              <Switch checked={abutData.ativo} onCheckedChange={v=>setAbutData({...abutData,ativo:v})} />
            </div>
            {abutError && <p className="text-sm text-red-400 text-center">{abutError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setAbutModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveAbut} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Componente */}
      <Dialog open={compModalOpen} onOpenChange={setCompModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{compEditing ? "Editar" : "Novo"} Componente</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculações</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Tipo de Componente</label><select value={compData.tipo_componente_id} onChange={e=>setCompData({...compData,tipo_componente_id:e.target.value})} className={selectCls}><option value="">Selecione...</option>{tiposComponente?.map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Tipo de Abutment</label><select value={compData.tipo_abutment_id} onChange={e=>setCompData({...compData,tipo_abutment_id:e.target.value})} className={selectCls}><option value="">Selecione...</option>{tiposAbutment?.map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Parafuso</label><select value={compData.parafuso_id} onChange={e=>setCompData({...compData,parafuso_id:e.target.value})} className={selectCls}><option value="">Selecione...</option>{parafusosList?.map((p:any)=><option key={p.sku} value={p.sku}>{p.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Chave</label><select value={compData.chave_id} onChange={e=>setCompData({...compData,chave_id:e.target.value})} className={selectCls}><option value="">Nenhuma</option>{chavesList?.map((c:any)=><option key={c.sku} value={c.sku}>{c.nome}</option>)}</select></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>SKU *</label><input type="text" value={compData.sku} onChange={e=>setCompData({...compData,sku:e.target.value})} className={inputCls} placeholder="Ex: CPS-001" /></div>
              <div className="space-y-2"><label className={labelCls}>Nome *</label><input type="text" value={compData.nome} onChange={e=>setCompData({...compData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={compData.sigla} onChange={e=>setCompData({...compData,sigla:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2 col-span-2"><label className={labelCls}>Descrição</label><textarea value={compData.descricao} onChange={e=>setCompData({...compData,descricao:e.target.value})} className={inputCls+" min-h-[60px]"} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Especificações Técnicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Ø Plataforma (mm)</label><input type="number" step="0.1" value={compData.diametro_plataforma_mm} onChange={e=>setCompData({...compData,diametro_plataforma_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Altura Transmucoso (mm)</label><input type="number" step="0.1" value={compData.altura_transmucoso_mm} onChange={e=>setCompData({...compData,altura_transmucoso_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Altura Corpo (mm)</label><input type="number" step="0.1" value={compData.altura_corpo_mm} onChange={e=>setCompData({...compData,altura_corpo_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Ângulo (graus)</label><input type="number" value={compData.angulacao_graus} onChange={e=>setCompData({...compData,angulacao_graus:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Tipo</label><input type="text" value={compData.tipo} onChange={e=>setCompData({...compData,tipo:e.target.value})} className={inputCls} placeholder="Ex: Hexagonal" /></div>
              <div className="space-y-2"><label className={labelCls}>Tipo Travamento</label><input type="text" value={compData.tipo_travamento} onChange={e=>setCompData({...compData,tipo_travamento:e.target.value})} className={inputCls} placeholder="Ex: Rosca" /></div>
              <div className="space-y-2"><label className={labelCls}>Material</label><input type="text" value={compData.material} onChange={e=>setCompData({...compData,material:e.target.value})} className={inputCls} placeholder="Ex: Titânio" /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Imagens do Produto</h3>
            <ImageUploader produtoTipo="componente" produtoSku={compData.sku} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Estoque na Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Qtd Disponível</label><input type="number" min="0" value={compData.qtd_disponivel} onChange={e=>setCompData({...compData,qtd_disponivel:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Qtd Mínima Aviso</label><input type="number" min="0" value={compData.qtd_minima_aviso} onChange={e=>setCompData({...compData,qtd_minima_aviso:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Comercial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className={labelCls}>Preço (R$)</label><input type="number" step="0.01" min="0" value={compData.preco} onChange={e=>setCompData({...compData,preco:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço (€)</label><input type="number" step="0.01" min="0" value={compData.preco_euro} onChange={e=>setCompData({...compData,preco_euro:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço ($)</label><input type="number" step="0.01" min="0" value={compData.preco_dolar} onChange={e=>setCompData({...compData,preco_dolar:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{compData.ativo ? "Ativo" : "Inativo"}</p></div>
              <Switch checked={compData.ativo} onCheckedChange={v=>setCompData({...compData,ativo:v})} />
            </div>
            {compError && <p className="text-sm text-red-400 text-center">{compError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setCompModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveComp} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Parafuso */}
      <Dialog open={parModalOpen} onOpenChange={setParModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{parEditing ? "Editar" : "Novo"} Parafuso</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculações</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Tipo de Parafuso</label><select value={parData.tipo_parafuso_id} onChange={e=>setParData({...parData,tipo_parafuso_id:e.target.value})} className={selectCls}><option value="">Selecione...</option>{tiposParafuso?.map((t:any)=><option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Chave</label><select value={parData.chave_id} onChange={e=>setParData({...parData,chave_id:e.target.value})} className={selectCls}><option value="">Nenhuma</option>{chavesList?.map((c:any)=><option key={c.sku} value={c.sku}>{c.nome}</option>)}</select></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>SKU *</label><input type="text" value={parData.sku} onChange={e=>setParData({...parData,sku:e.target.value})} className={inputCls} placeholder="Ex: PAR-001" /></div>
              <div className="space-y-2"><label className={labelCls}>Nome *</label><input type="text" value={parData.nome} onChange={e=>setParData({...parData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={parData.sigla} onChange={e=>setParData({...parData,sigla:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2 col-span-2"><label className={labelCls}>Descrição</label><textarea value={parData.descricao} onChange={e=>setParData({...parData,descricao:e.target.value})} className={inputCls+" min-h-[60px]"} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Especificações Técnicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Torque (N·cm)</label><input type="number" value={parData.torque_ncm} onChange={e=>setParData({...parData,torque_ncm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Material</label><input type="text" value={parData.material} onChange={e=>setParData({...parData,material:e.target.value})} className={inputCls} placeholder="Ex: Titânio" /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Imagens do Produto</h3>
            <ImageUploader produtoTipo="parafuso" produtoSku={parData.sku} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Estoque na Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Qtd Disponível</label><input type="number" min="0" value={parData.qtd_disponivel} onChange={e=>setParData({...parData,qtd_disponivel:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Qtd Mínima Aviso</label><input type="number" min="0" value={parData.qtd_minima_aviso} onChange={e=>setParData({...parData,qtd_minima_aviso:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Comercial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className={labelCls}>Preço (R$)</label><input type="number" step="0.01" min="0" value={parData.preco} onChange={e=>setParData({...parData,preco:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço (€)</label><input type="number" step="0.01" min="0" value={parData.preco_euro} onChange={e=>setParData({...parData,preco_euro:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço ($)</label><input type="number" step="0.01" min="0" value={parData.preco_dolar} onChange={e=>setParData({...parData,preco_dolar:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{parData.ativo ? "Ativo" : "Inativo"}</p></div>
              <Switch checked={parData.ativo} onCheckedChange={v=>setParData({...parData,ativo:v})} />
            </div>
            {parError && <p className="text-sm text-red-400 text-center">{parError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setParModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSavePar} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cicatrizador */}
      <Dialog open={cicModalOpen} onOpenChange={setCicModalOpen}>
        <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0"><DialogTitle className="text-white">{cicEditing ? "Editar" : "Novo"} Cicatrizador</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculações</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Implante</label><select value={cicData.implante_id} onChange={e=>setCicData({...cicData,implante_id:e.target.value})} className={selectCls}><option value="">Selecione...</option>{implantesList?.map((im:any)=><option key={im.sku} value={im.sku}>{im.sku} - {im.nome}</option>)}</select></div>
              <div className="space-y-2"><label className={labelCls}>Chave</label><select value={cicData.chave_id} onChange={e=>setCicData({...cicData,chave_id:e.target.value})} className={selectCls}><option value="">Nenhuma</option>{chavesList?.map((c:any)=><option key={c.sku} value={c.sku}>{c.nome}</option>)}</select></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Composição</h3>
            <CompositionSection label="Kits" selectedIds={cicKitsIds} options={todosKits?.map((k:any)=>({id:k.sku,label:k.nome}))??[]} placeholder="Selecione um kit..." onChange={setCicKitsIds} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>SKU *</label><input type="text" value={cicData.sku} onChange={e=>setCicData({...cicData,sku:e.target.value})} className={inputCls} placeholder="Ex: CIC-001" /></div>
              <div className="space-y-2"><label className={labelCls}>Nome *</label><input type="text" value={cicData.nome} onChange={e=>setCicData({...cicData,nome:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Sigla</label><input type="text" value={cicData.sigla} onChange={e=>setCicData({...cicData,sigla:e.target.value})} className={inputCls} /></div>
              <div className="space-y-2 col-span-2"><label className={labelCls}>Descrição</label><textarea value={cicData.descricao} onChange={e=>setCicData({...cicData,descricao:e.target.value})} className={inputCls+" min-h-[60px]"} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Especificações Técnicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Ø Plataforma (mm)</label><input type="number" step="0.1" value={cicData.diametro_plataforma_mm} onChange={e=>setCicData({...cicData,diametro_plataforma_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Altura Transmucoso (mm)</label><input type="number" step="0.1" value={cicData.altura_transmucoso_mm} onChange={e=>setCicData({...cicData,altura_transmucoso_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Altura Corpo (mm)</label><input type="number" step="0.1" value={cicData.altura_corpo_mm} onChange={e=>setCicData({...cicData,altura_corpo_mm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Torque (N·cm)</label><input type="number" value={cicData.torque_ncm} onChange={e=>setCicData({...cicData,torque_ncm:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Material</label><input type="text" value={cicData.material} onChange={e=>setCicData({...cicData,material:e.target.value})} className={inputCls} placeholder="Ex: Titânio" /></div>
            </div>
            {/* Imagens do Produto */}
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Imagens do Produto</h3>
            <ImageUploader produtoTipo="cicatrizador" produtoSku={cicData.sku} />
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Estoque na Loja</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelCls}>Qtd Disponível</label><input type="number" min="0" value={cicData.qtd_disponivel} onChange={e=>setCicData({...cicData,qtd_disponivel:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Qtd Mínima Aviso</label><input type="number" min="0" value={cicData.qtd_minima_aviso} onChange={e=>setCicData({...cicData,qtd_minima_aviso:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Comercial</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className={labelCls}>Preço (R$)</label><input type="number" step="0.01" min="0" value={cicData.preco} onChange={e=>setCicData({...cicData,preco:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço (€)</label><input type="number" step="0.01" min="0" value={cicData.preco_euro} onChange={e=>setCicData({...cicData,preco_euro:Number(e.target.value)})} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Preço ($)</label><input type="number" step="0.01" min="0" value={cicData.preco_dolar} onChange={e=>setCicData({...cicData,preco_dolar:Number(e.target.value)})} className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
              <div><p className="text-sm font-bold text-white">{cicData.ativo ? "Ativo" : "Inativo"}</p></div>
              <Switch checked={cicData.ativo} onCheckedChange={v=>setCicData({...cicData,ativo:v})} />
            </div>
            {cicError && <p className="text-sm text-red-400 text-center">{cicError}</p>}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button onClick={()=>setCicModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">Cancelar</button>
            <button onClick={handleSaveCic} className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg, #c9a655, #e8d48b)"}}>Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
