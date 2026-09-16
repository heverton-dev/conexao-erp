import { useState, useEffect } from "react"
import { Package, Layers, ShoppingBag, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import toast from "react-hot-toast"

import { useQueryClient } from "@tanstack/react-query"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import {
  useCriarImplante, useAtualizarImplante,
  useCriarAbutment, useAtualizarAbutment,
  useCriarKit, useAtualizarKit,
  useCategorias, useConexoes, useFamilias, useLinhas,
  useFresas, useChavesFerramental,
  useTiposReabilitacao, useTiposAbutment,
  useTodosKits, useAbutments, useTiposKit, useComplementares, useOpcionais, useSeqProteticas,
  useParafusosRetensao, useCriarParafusoRetencao, useAtualizarParafusoRetencao,
  useCicatrizadores, useCriarCicatrizador, useAtualizarCicatrizador,
  useImplanteDetalhe, useAbutmentDetalhe, useKitDetalhe,
  useProtocolos,
  useTiposOsso,
} from "~/features/catalogo/hooks/useCatalogo"
import { listarSeqProteticasAbutment, salvarSeqProteticasAbutment } from "~/features/catalogo/services/sequencia-protetica.service"
import { salvarImplanteChaves, listarImplanteChaves, salvarImplanteKits, listarImplanteKits, salvarImplanteAbutments, listarImplanteAbutments, listarImplanteCicatrizadores, salvarImplanteCicatrizadores } from "~/features/catalogo/services/implantes.service"
import {
  salvarKitChaves, listarKitChaves, salvarKitFresas, listarKitFresas,
  salvarKitComplementares, listarKitComplementares, salvarKitOpcionais, listarKitOpcionais,
  salvarKitKitsComplementares, listarKitKitsComplementares, salvarKitKitsRelacionados, listarKitKitsRelacionados,
  salvarKitImplantes, listarKitImplantes,
} from "~/features/catalogo/services/kits.service"
import { listarImagens } from "~/features/catalogo/services/imagens.service"
import { salvarAbutmentChaves, listarAbutmentChaves, salvarAbutmentKits, listarAbutmentKits, salvarAbutmentParafusos, listarAbutmentParafusos, salvarAbutmentImplantes, listarAbutmentImplantes } from "~/features/catalogo/services/componentes.service"
import { ImplanteForm } from "./forms/ImplanteForm"
import { AbutmentForm } from "./forms/AbutmentForm"
import { KitForm } from "./forms/KitForm"
import { ParafusoRetencaoForm } from "./forms/ParafusoRetencaoForm"
import { CicatrizadorForm } from "./forms/CicatrizadorForm"
import { ImageUploader } from "./ImageUploader"
import type { CatalogoImplante, CatalogoImagemProduto, ProdutoTipoImagem } from "~/features/catalogo/types"

type ProdutoTipo = "implante" | "abutment" | "kit" | "parafuso_retensao" | "cicatrizador"

export function ProdutoFormModal({
  open, onOpenChange, editingItem, implantes,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: { sku: string; tipo: string } | null
  implantes?: CatalogoImplante[]
}) {
  const empresaId = useCatalogoEmpresaId()
  const qc = useQueryClient()
  const criarImplante = useCriarImplante()
  const atualizarImplante = useAtualizarImplante()
  const criarAbutment = useCriarAbutment()
  const atualizarAbutment = useAtualizarAbutment()
  const criarKit = useCriarKit()
  const atualizarKit = useAtualizarKit()
  const criarParafusoRetencao = useCriarParafusoRetencao()
  const atualizarParafusoRetencao = useAtualizarParafusoRetencao()
  const criarCicatrizador = useCriarCicatrizador()
  const atualizarCicatrizador = useAtualizarCicatrizador()

  const { data: categorias } = useCategorias()
  const { data: conexoes } = useConexoes()
  const { data: familias } = useFamilias()
  const { data: linhas } = useLinhas()
  const { data: fresas } = useFresas()
  const { data: tiposKit } = useTiposKit()
  const { data: complementares } = useComplementares()
  const { data: opcionais } = useOpcionais()
  const { data: chaves } = useChavesFerramental()
  const { data: tiposReab } = useTiposReabilitacao()
  const { data: tiposAbutment } = useTiposAbutment()
  const { data: sequencias } = useSeqProteticas()
  const { data: parafusosRetensao } = useParafusosRetensao()
  const { data: cicatrizadoresData } = useCicatrizadores()
  const { data: protocolos } = useProtocolos()
  const { data: tiposOsso } = useTiposOsso()
  const { data: todosKits } = useTodosKits()
  const { data: todosAbutments } = useAbutments()

  const { data: implDetalhe } = useImplanteDetalhe(editingItem?.tipo === "implante" ? editingItem.sku : "")
  const { data: abDetalhe } = useAbutmentDetalhe(editingItem?.tipo === "abutment" ? editingItem.sku : "")
  const { data: kitDetalhe } = useKitDetalhe(editingItem?.tipo === "kit" ? editingItem.sku : "")

  const [tipo, setTipo] = useState<ProdutoTipo>(
    editingItem?.tipo === "implante" ? "implante" :
    editingItem?.tipo === "abutment" ? "abutment" :
    editingItem?.tipo === "parafuso_retensao" ? "parafuso_retensao" :
    editingItem?.tipo === "cicatrizador" ? "cicatrizador" : "kit"
  )
  const [saving, setSaving] = useState(false)

  const [implante, setImplante] = useState({
    categoria_id: "", conexao_id: "", familia_id: "", linha_id: "",
    sku: "", nome: "", sigla: "", descricao: "",
    diametro_mm: 0, comprimento_mm: 0, torque_insercao: 0,
    rosca_interna: "", regiao_apical: "", regiao_cervical: "",
    material: "", superficie: "", tratamento: "", chave_sku: "", preco: 0,
    preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0,
    macrogeometria: "", osso_soft: "", osso_hard: "",
    diametro_plataforma_mm: 0, ativo: true,
  })

  const [abutment, setAbutment] = useState({
    familia_id: "", tipo_reabilitacao_id: "", tipo_abutment_id: "",
    sku: "", diametro_plataforma: "", angulacao_graus: 0,
    altura_transmucoso: 0, altura_corpo: 0, torque_ncm: 0, preco: 0,
    preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0,
  })

  const [kit, setKit] = useState({
    tipo_kit_id: "", sku: "", nome: "", sigla: "", descricao: "", preco: 0,
    preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0,
  })

  const [parafusoRetencao, setParafusoRetencao] = useState({
    sku: "", nome: "", torque_ncm: 0, vinculo_tipo: "" as "abutment" | "componente" | "",
    vinculo_sku: "", chave_sku: "", preco: 0,
    preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0,
  })

  const [cicatrizador, setCicatrizador] = useState({
    sku: "", nome: "", altura_transmucoso: 0, diametro_plataforma: "",
    torque_ncm: 0, familia_id: "", chave_sku: "", preco: 0,
    preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0,
  })

  const [seqProteticasIds, setSeqProteticasIds] = useState<string[]>([])
  const [imagens, setImagens] = useState<CatalogoImagemProduto[]>([])
  const [chavesIds, setChavesIds] = useState<string[]>([])
  const [kitsIds, setKitsIds] = useState<string[]>([])
  const [abutmentsIds, setAbutmentsIds] = useState<string[]>([])
  const [cicatrizadoresIds, setCicatrizadoresIds] = useState<string[]>([])
  const [abtChavesIds, setAbtChavesIds] = useState<string[]>([])
  const [abtKitsIds, setAbtKitsIds] = useState<string[]>([])
  const [abtParafusosIds, setAbtParafusosIds] = useState<string[]>([])
  const [abtImplantesIds, setAbtImplantesIds] = useState<string[]>([])
  const [kitChaves, setKitChaves] = useState<string[]>([])
  const [kitFresas, setKitFresas] = useState<string[]>([])
  const [kitComplementares, setKitComplementares] = useState<string[]>([])
  const [kitOpcionais, setKitOpcionais] = useState<string[]>([])
  const [kitKitsComplementares, setKitKitsComplementares] = useState<string[]>([])
  const [kitKitsRelacionados, setKitKitsRelacionados] = useState<string[]>([])
  const [kitImplantes, setKitImplantes] = useState<string[]>([])

  function toggleInArray(arr: string[], setArr: (v: string[]) => void, sku: string) {
    setArr(arr.includes(sku) ? arr.filter((s) => s !== sku) : [...arr, sku])
  }

  function resetForms() {
    setImplante({ categoria_id: "", conexao_id: "", familia_id: "", linha_id: "", sku: "", nome: "", sigla: "", descricao: "", diametro_mm: 0, comprimento_mm: 0, torque_insercao: 0, rosca_interna: "", regiao_apical: "", regiao_cervical: "", material: "", superficie: "", tratamento: "", chave_sku: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0, macrogeometria: "", osso_soft: "", osso_hard: "", diametro_plataforma_mm: 0, ativo: true })
    setAbutment({ familia_id: "", tipo_reabilitacao_id: "", tipo_abutment_id: "", sku: "", diametro_plataforma: "", angulacao_graus: 0, altura_transmucoso: 0, altura_corpo: 0, torque_ncm: 0, preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0 })
    setKit({ tipo_kit_id: "", sku: "", nome: "", sigla: "", descricao: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0 })
    setParafusoRetencao({ sku: "", nome: "", torque_ncm: 0, vinculo_tipo: "", vinculo_sku: "", chave_sku: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0 })
    setCicatrizador({ sku: "", nome: "", altura_transmucoso: 0, diametro_plataforma: "", torque_ncm: 0, familia_id: "", chave_sku: "", preco: 0, preco_euro: 0, preco_dolar: 0, qtd_disponivel: 0, qtd_minima_aviso: 0 })
    setSeqProteticasIds([])
    setImagens([])
    setChavesIds([])
    setKitsIds([])
    setAbutmentsIds([])
    setCicatrizadoresIds([])
    setAbtChavesIds([])
    setAbtKitsIds([])
    setAbtParafusosIds([])
    setAbtImplantesIds([])
    setKitChaves([])
    setKitFresas([])
    setKitComplementares([])
    setKitOpcionais([])
    setKitKitsComplementares([])
    setKitKitsRelacionados([])
    setKitImplantes([])
  }

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setTipo(editingItem.tipo as ProdutoTipo)
      } else {
        setTipo("implante")
        resetForms()
      }
    }
  }, [open, editingItem])

  // Carregar imagens ao editar
  useEffect(() => {
    if (!open || !editingItem) {
      setImagens([])
      return
    }
    const tipoItem = editingItem.tipo as ProdutoTipoImagem
    listarImagens(tipoItem, editingItem.sku)
      .then(setImagens)
      .catch(() => setImagens([]))
  }, [open, editingItem, empresaId])

  useEffect(() => {
    if (!open || !editingItem) return
    if (editingItem.tipo === "implante" && implDetalhe) {
      const d = implDetalhe
      const extras = (d.detalhes_extras ?? {}) as Record<string, string>
      setImplante({
        categoria_id: (d as any).categoria_id ?? extras.categoria_id ?? "",
        conexao_id: (d as any).conexao_id ?? extras.conexao_id ?? "",
        familia_id: (d as any).familia_id ?? extras.familia_id ?? "",
        linha_id: d.linha_id ?? "",
        sku: d.sku ?? "",
        nome: d.nome ?? "",
        sigla: d.sigla ?? "",
        descricao: d.descricao ?? "",
        diametro_mm: d.diametro_mm ?? 0,
        comprimento_mm: d.comprimento_mm ?? 0,
        torque_insercao: d.torque_insercao ?? 0,
        rosca_interna: d.rosca_interna ?? "",
        regiao_apical: d.regiao_apical ?? "",
        regiao_cervical: d.regiao_cervical ?? "",
        material: extras.material ?? "",
        superficie: extras.superficie ?? "",
        tratamento: extras.tratamento ?? "",
        chave_sku: extras.chave_sku ?? "",
        preco: d.preco ?? 0,
        preco_euro: (d as any).preco_euro ?? 0,
        preco_dolar: (d as any).preco_dolar ?? 0,
        qtd_disponivel: (d as any).qtd_disponivel ?? 0,
        qtd_minima_aviso: (d as any).qtd_minima_aviso ?? 0,
        macrogeometria: (d as unknown as Record<string, unknown>).macrogeometria as string ?? "",
        osso_soft: (d as any).osso_soft ?? extras.osso_soft ?? "",
        osso_hard: (d as any).osso_hard ?? extras.osso_hard ?? "",
        diametro_plataforma_mm: (d as any).diametro_plataforma_mm ?? 0,
        ativo: d.ativo ?? true,
      })
      // Carregar chaves vinculadas ao implante
      listarImplanteChaves(d.sku)
        .then(setChavesIds)
        .catch(() => setChavesIds([]))
      // Carregar kits vinculados ao implante
      listarImplanteKits(d.sku)
        .then(setKitsIds)
        .catch(() => setKitsIds([]))
      // Carregar abutments vinculados ao implante
      listarImplanteAbutments(d.sku)
        .then(setAbutmentsIds)
        .catch(() => setAbutmentsIds([]))
      // Carregar cicatrizadores vinculados ao implante
      listarImplanteCicatrizadores(d.sku)
        .then(setCicatrizadoresIds)
        .catch(() => setCicatrizadoresIds([]))
    }
    if (editingItem.tipo === "abutment" && abDetalhe) {
      const d = abDetalhe
      setAbutment({
        familia_id: d.familia_id ?? "",
        tipo_reabilitacao_id: d.tipo_reabilitacao_id ?? "",
        tipo_abutment_id: d.tipo_abutment_id ?? "",
        sku: d.sku ?? "",
        diametro_plataforma: d.diametro_plataforma_mm != null ? String(d.diametro_plataforma_mm) : "",
        angulacao_graus: d.angulacao_graus ?? 0,
        altura_transmucoso: d.altura_transmucoso_mm ?? 0,
        altura_corpo: d.altura_corpo_mm ?? 0,
        torque_ncm: d.torque_ncm ?? 0,
        preco: d.preco ?? 0,
        preco_euro: d.preco_euro ?? 0,
        preco_dolar: d.preco_dolar ?? 0,
        qtd_disponivel: d.qtd_disponivel ?? 0,
        qtd_minima_aviso: d.qtd_minima_aviso ?? 0,
      })
      // Carregar composição do abutment
      listarAbutmentChaves(d.sku)
        .then(setAbtChavesIds)
        .catch(() => setAbtChavesIds([]))
      listarAbutmentKits(d.sku)
        .then(setAbtKitsIds)
        .catch(() => setAbtKitsIds([]))
      listarAbutmentParafusos(d.sku)
        .then(setAbtParafusosIds)
        .catch(() => setAbtParafusosIds([]))
      listarSeqProteticasAbutment(d.sku)
        .then(setSeqProteticasIds)
        .catch(() => setSeqProteticasIds([]))
      listarAbutmentImplantes(d.sku)
        .then(setAbtImplantesIds)
        .catch(() => setAbtImplantesIds([]))
    }
    if (editingItem.tipo === "kit" && kitDetalhe) {
      const d = kitDetalhe as any
      setKit({
        tipo_kit_id: d.tipo_kit_id ?? "",
        sku: d.sku ?? "",
        nome: d.nome ?? "",
        sigla: d.sigla ?? "",
        descricao: d.descricao ?? "",
        preco: d.preco ?? 0,
        preco_euro: d.preco_euro ?? 0,
        preco_dolar: d.preco_dolar ?? 0,
        qtd_disponivel: d.qtd_disponivel ?? 0,
        qtd_minima_aviso: d.qtd_minima_aviso ?? 0,
      })
      listarKitChaves(d.sku).then(setKitChaves).catch(() => setKitChaves([]))
      listarKitFresas(d.sku).then(setKitFresas).catch(() => setKitFresas([]))
      listarKitComplementares(d.sku).then(setKitComplementares).catch(() => setKitComplementares([]))
      listarKitOpcionais(d.sku).then(setKitOpcionais).catch(() => setKitOpcionais([]))
      listarKitKitsComplementares(d.sku).then(setKitKitsComplementares).catch(() => setKitKitsComplementares([]))
      listarKitKitsRelacionados(d.sku).then(setKitKitsRelacionados).catch(() => setKitKitsRelacionados([]))
      listarKitImplantes(d.sku).then(setKitImplantes).catch(() => setKitImplantes([]))
    }
  }, [open, editingItem, implDetalhe, abDetalhe, kitDetalhe])

  function gerarSkuSugerido() {
    if (tipo !== "implante") return
    const conn = conexoes?.find((c) => c.id === implante.conexao_id)
    const fam = familias?.find((f) => f.id === implante.familia_id)
    if (conn?.sigla && fam?.nome && implante.diametro_mm && implante.comprimento_mm) {
      const sug = `IMP-${conn.sigla}-${fam.nome}-${String(implante.diametro_mm).replace(".", "")}${String(implante.comprimento_mm).replace(".", "")}`
      setImplante((prev) => ({ ...prev, sku: sug }))
    }
  }

  function validateRequired() {
    if (tipo === "implante") {
      if (!implante.sku) return "SKU é obrigatório"
      if (!implante.linha_id) return "Linha é obrigatória"
      if (!implante.diametro_mm || implante.diametro_mm <= 0) return "Diâmetro deve ser positivo"
      if (!implante.comprimento_mm || implante.comprimento_mm <= 0) return "Comprimento deve ser positivo"
    } else if (tipo === "abutment") {
      if (!abutment.sku) return "SKU é obrigatório"
      if (!abutment.familia_id) return "Família é obrigatória"
      if (!abutment.tipo_reabilitacao_id) return "Tipo de reabilitação é obrigatório"
      if (!abutment.tipo_abutment_id) return "Tipo de abutment é obrigatório"
    } else if (tipo === "parafuso_retensao") {
      if (!parafusoRetencao.sku) return "SKU é obrigatório"
      if (!parafusoRetencao.nome) return "Nome é obrigatório"
      if (!parafusoRetencao.vinculo_tipo) return "Tipo de vínculo é obrigatório"
      if (!parafusoRetencao.vinculo_sku) return "SKU do vínculo é obrigatório"
    } else if (tipo === "cicatrizador") {
      if (!cicatrizador.sku) return "SKU é obrigatório"
      if (!cicatrizador.nome) return "Nome é obrigatório"
    } else if (tipo === "kit") {
      if (!kit.sku) return "SKU é obrigatório"
      if (!kit.nome) return "Nome é obrigatório"
    }
    return null
  }

  function makeImplantePayload() {
    const fam = familias?.find((f) => f.id === implante.familia_id)
    const nome = fam ? `${fam.nome} ${implante.diametro_mm}×${implante.comprimento_mm}` : `${implante.diametro_mm}×${implante.comprimento_mm}`
    return {
      sku: implante.sku,
      nome,
      linha_id: implante.linha_id,
      diametro_mm: implante.diametro_mm,
      comprimento_mm: implante.comprimento_mm,
      torque_insercao: implante.torque_insercao || undefined,
      rosca_interna: implante.rosca_interna || undefined,
      regiao_apical: implante.regiao_apical || undefined,
      regiao_cervical: implante.regiao_cervical || undefined,
      preco: implante.preco || undefined,
      preco_euro: implante.preco_euro || undefined,
      preco_dolar: implante.preco_dolar || undefined,
      qtd_disponivel: implante.qtd_disponivel || undefined,
      qtd_minima_aviso: implante.qtd_minima_aviso || undefined,
      macrogeometria: implante.macrogeometria || undefined,
      sigla: implante.sigla || undefined,
      descricao: implante.descricao || undefined,
      categoria_id: implante.categoria_id || undefined,
      conexao_id: implante.conexao_id || undefined,
      familia_id: implante.familia_id || undefined,
      osso_soft: implante.osso_soft || undefined,
      osso_hard: implante.osso_hard || undefined,
      diametro_plataforma_mm: implante.diametro_plataforma_mm || undefined,
      ativo: implante.ativo,
      detalhes_extras: {
        material: implante.material || undefined,
        superficie: implante.superficie || undefined,
        tratamento: implante.tratamento || undefined,
        chave_sku: implante.chave_sku || undefined,
      },
    }
  }

  function makeAbutmentPayload() {
    const tipoAb = tiposAbutment?.find((t) => t.id === abutment.tipo_abutment_id)
    const fam = familias?.find((f) => f.id === abutment.familia_id)
    const nome = tipoAb ? (fam ? `${tipoAb.nome} ${fam.nome}` : tipoAb.nome) : abutment.sku
    return {
      sku: abutment.sku,
      nome,
      tipo_abutment_id: abutment.tipo_abutment_id,
      diametro_plataforma_mm: abutment.diametro_plataforma ? Number(abutment.diametro_plataforma) : undefined,
      angulacao_graus: abutment.angulacao_graus || undefined,
      altura_transmucoso_mm: abutment.altura_transmucoso || undefined,
      altura_corpo_mm: abutment.altura_corpo || undefined,
      torque_ncm: abutment.torque_ncm || undefined,
      preco: abutment.preco || undefined,
      preco_euro: abutment.preco_euro || undefined,
      preco_dolar: abutment.preco_dolar || undefined,
      qtd_disponivel: abutment.qtd_disponivel || undefined,
      qtd_minima_aviso: abutment.qtd_minima_aviso || undefined,
    }
  }

  function makeKitPayload() {
    return {
      sku: kit.sku,
      tipo_kit_id: kit.tipo_kit_id || undefined,
      nome: kit.nome,
      sigla: kit.sigla || undefined,
      descricao: kit.descricao || undefined,
      preco: kit.preco || undefined,
      preco_euro: kit.preco_euro || undefined,
      preco_dolar: kit.preco_dolar || undefined,
      qtd_disponivel: kit.qtd_disponivel || undefined,
      qtd_minima_aviso: kit.qtd_minima_aviso || undefined,
    }
  }


  async function handleSave() {
    const erro = validateRequired()
    if (erro) {
      toast.error(erro, {
        style: { background: "var(--color-surface)", color: "#fff", border: "1px solid rgba(239,68,68,0.3)" },
        duration: 4000,
      })
      return
    }
    setSaving(true)
    try {
      if (tipo === "implante") {
        const payload = makeImplantePayload()
        if (editingItem) {
          await atualizarImplante.mutateAsync({ sku: editingItem.sku, input: payload })
        } else {
          await criarImplante.mutateAsync(payload)
        }
        await salvarImplanteChaves(implante.sku, chavesIds)
        await salvarImplanteKits(implante.sku, kitsIds)
        await salvarImplanteAbutments(implante.sku, abutmentsIds)
        await salvarImplanteCicatrizadores(implante.sku, cicatrizadoresIds)
      } else if (tipo === "abutment") {
        const payload = makeAbutmentPayload()
        if (editingItem) {
          await atualizarAbutment.mutateAsync({ sku: editingItem.sku, input: payload })
        } else {
          await criarAbutment.mutateAsync(payload)
        }
        await salvarSeqProteticasAbutment(abutment.sku, seqProteticasIds)
        // Salvar composição do abutment
        await salvarAbutmentChaves(abutment.sku, abtChavesIds)
        await salvarAbutmentKits(abutment.sku, abtKitsIds)
        await salvarAbutmentParafusos(abutment.sku, abtParafusosIds)
        await salvarAbutmentImplantes(abutment.sku, abtImplantesIds)
      } else if (tipo === "parafuso_retensao") {
        if (!parafusoRetencao.vinculo_tipo || !parafusoRetencao.vinculo_sku) {
          throw new Error("Vínculo é obrigatório")
        }
        const payload = {
          sku: parafusoRetencao.sku,
          nome: parafusoRetencao.nome,
          torque_ncm: parafusoRetencao.torque_ncm || undefined,
          vinculo_tipo: parafusoRetencao.vinculo_tipo,
          vinculo_sku: parafusoRetencao.vinculo_sku,
          chave_sku: parafusoRetencao.chave_sku || undefined,
          preco: parafusoRetencao.preco || undefined,
          preco_euro: parafusoRetencao.preco_euro || undefined,
          preco_dolar: parafusoRetencao.preco_dolar || undefined,
          qtd_disponivel: parafusoRetencao.qtd_disponivel || undefined,
          qtd_minima_aviso: parafusoRetencao.qtd_minima_aviso || undefined,
        }
        if (editingItem) {
          await atualizarParafusoRetencao.mutateAsync({ sku: editingItem.sku, input: payload })
        } else {
          await criarParafusoRetencao.mutateAsync(payload)
        }
      } else if (tipo === "cicatrizador") {
        const payload = {
          sku: cicatrizador.sku,
          nome: cicatrizador.nome,
          altura_transmucoso_mm: cicatrizador.altura_transmucoso || undefined,
          diametro_plataforma: cicatrizador.diametro_plataforma || undefined,
          torque_ncm: cicatrizador.torque_ncm || undefined,
          familia_id: cicatrizador.familia_id || undefined,
          chave_sku: cicatrizador.chave_sku || undefined,
          preco: cicatrizador.preco || undefined,
          preco_euro: cicatrizador.preco_euro || undefined,
          preco_dolar: cicatrizador.preco_dolar || undefined,
          qtd_disponivel: cicatrizador.qtd_disponivel || undefined,
          qtd_minima_aviso: cicatrizador.qtd_minima_aviso || undefined,
        }
        if (editingItem) {
          await atualizarCicatrizador.mutateAsync({ sku: editingItem.sku, input: payload })
        } else {
          await criarCicatrizador.mutateAsync(payload)
        }
      } else {
        const payload = makeKitPayload()
        if (editingItem) {
          await atualizarKit.mutateAsync({ sku: editingItem.sku, input: payload })
        } else {
          await criarKit.mutateAsync(payload)
        }
        await salvarKitChaves(kit.sku, kitChaves)
        await salvarKitFresas(kit.sku, kitFresas)
        await salvarKitComplementares(kit.sku, kitComplementares)
        await salvarKitOpcionais(kit.sku, kitOpcionais)
        await salvarKitKitsComplementares(kit.sku, kitKitsComplementares)
        await salvarKitKitsRelacionados(kit.sku, kitKitsRelacionados)
        await salvarKitImplantes(kit.sku, kitImplantes)
      }

      qc.invalidateQueries({ queryKey: ["catalogo"] })
      onOpenChange(false)
      resetForms()
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err)
      const code = err?.code || err?.error?.code
      const msg = code === "23505"
        ? "Já existe um produto cadastrado com esse SKU. Use outro SKU."
        : err?.message || err?.error?.message || err?.details || "Erro ao salvar produto"
      toast.error(code && code !== "23505" ? `[${code}] ${msg}` : msg, {
        style: { background: "var(--color-surface)", color: "#fff", border: "1px solid rgba(239,68,68,0.3)" },
        duration: 6000,
      })
    } finally {
      setSaving(false)
    }
  }

  const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{editingItem ? `Editar ${editingItem.tipo}` : "Novo Produto"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {editingItem ? `Editando ${editingItem.sku}` : "Preencha as informações para cadastrar um novo produto."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-2">
            <label className={labelCls}>Tipo de Produto</label>
            <div className="flex gap-2">
              {(["implante", "abutment", "parafuso_retensao", "cicatrizador", "kit"] as ProdutoTipo[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  disabled={!!editingItem}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    tipo === t
                      ? "bg-[#c9a655] text-[#0f172a]"
                      : "bg-[var(--color-surface)] text-gray-400 border border-white/5 hover:border-white/10"
                  }`}
                >
                  {t === "implante" && <Package className="h-4 w-4" />}
                  {t === "abutment" && <Layers className="h-4 w-4" />}
                  {t === "parafuso_retensao" && <AlertTriangle className="h-4 w-4" />}
                  {t === "cicatrizador" && <AlertTriangle className="h-4 w-4" />}
                  {t === "kit" && <ShoppingBag className="h-4 w-4" />}
                  {t === "implante" ? "Implante" : t === "abutment" ? "Componente" : t === "parafuso_retensao" ? "Parafuso Retenção" : t === "cicatrizador" ? "Cicatrizador" : "Kit"}
                </button>
              ))}
            </div>
          </div>

          {tipo === "implante" && (
            <ImplanteForm
              data={implante}
              onChange={(d) => setImplante((prev) => ({ ...prev, ...d }))}
              categorias={categorias}
              conexoes={conexoes}
              familias={familias}
              linhas={linhas}
              fresas={fresas}
              chaves={chaves}
              protocolos={protocolos}
              tiposOsso={tiposOsso}
              onGerarSku={gerarSkuSugerido}
              chavesIds={chavesIds}
              onChavesChange={setChavesIds}
              kits={todosKits}
              kitsIds={kitsIds}
              onKitsChange={setKitsIds}
              abutments={todosAbutments}
              abutmentsIds={abutmentsIds}
              onAbutmentsChange={setAbutmentsIds}
              cicatrizadores={cicatrizadoresData}
              cicatrizadoresIds={cicatrizadoresIds}
              onCicatrizadoresChange={setCicatrizadoresIds}
            />
          )}

          {tipo === "abutment" && (
            <AbutmentForm
              data={abutment}
              onChange={(d) => setAbutment((prev) => ({ ...prev, ...d }))}
              familias={familias}
              tiposReab={tiposReab}
              tiposAbutment={tiposAbutment}
              sequencias={sequencias}
              sequenciasIds={seqProteticasIds}
              onSequenciasChange={setSeqProteticasIds}
              chaves={chaves}
              chavesIds={abtChavesIds}
              onChavesChange={setAbtChavesIds}
              kits={todosKits}
              kitsIds={abtKitsIds}
              onKitsChange={setAbtKitsIds}
              parafusos={parafusosRetensao}
              parafusosIds={abtParafusosIds}
              onParafusosChange={setAbtParafusosIds}
              implantes={implantes}
              linhas={linhas}
              implantesIds={abtImplantesIds}
              onImplantesChange={setAbtImplantesIds}
            />
          )}

          {tipo === "kit" && (
            <KitForm
              data={kit}
              onChange={(d) => setKit((prev) => ({ ...prev, ...d }))}
              tiposKit={tiposKit}
              fresas={fresas}
              chaves={chaves}
              complementares={complementares}
              opcionais={opcionais}
              kitChaves={kitChaves}
              kitFresas={kitFresas}
              kitComplementares={kitComplementares}
              kitOpcionais={kitOpcionais}
              onToggleChave={(sku) => toggleInArray(kitChaves, setKitChaves, sku)}
              onToggleFresa={(sku) => toggleInArray(kitFresas, setKitFresas, sku)}
              onToggleComplementar={(sku) => toggleInArray(kitComplementares, setKitComplementares, sku)}
              onToggleOpcional={(sku) => toggleInArray(kitOpcionais, setKitOpcionais, sku)}
              todosKits={todosKits?.filter((k) => k.sku !== kit.sku)}
              kitKitsComplementares={kitKitsComplementares}
              kitKitsRelacionados={kitKitsRelacionados}
              onToggleKitComplementar={(sku) => toggleInArray(kitKitsComplementares, setKitKitsComplementares, sku)}
              onToggleKitRelacionado={(sku) => toggleInArray(kitKitsRelacionados, setKitKitsRelacionados, sku)}
              implantes={implantes}
              kitImplantes={kitImplantes}
              onToggleImplante={(sku) => toggleInArray(kitImplantes, setKitImplantes, sku)}
            />
          )}

          {tipo === "parafuso_retensao" && (
            <ParafusoRetencaoForm
              data={{ ...parafusoRetencao, vinculo_tipo: parafusoRetencao.vinculo_tipo as "abutment" | "componente" }}
              onChange={(d) => setParafusoRetencao((prev) => ({ ...prev, ...d }))}
              chaves={chaves}
            />
          )}

          {tipo === "cicatrizador" && (
            <CicatrizadorForm
              data={cicatrizador}
              onChange={(d) => setCicatrizador((prev) => ({ ...prev, ...d }))}
              familias={familias}
              chaves={chaves}
            />
          )}

          {/* ─── Imagens do produto ─── */}
          <ImageUploader
            produtoTipo={tipo === "parafuso_retensao" ? "parafuso" : tipo}
            produtoSku={editingItem?.sku || implante.sku || abutment.sku || kit.sku || parafusoRetencao.sku || cicatrizador.sku}
            imagensExistentes={imagens}
            onImagensChange={setImagens}
          />
        </div>

        <DialogFooter className="shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}
          >
            {saving ? "Salvando..." : editingItem ? "Salvar" : "Criar Produto"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
