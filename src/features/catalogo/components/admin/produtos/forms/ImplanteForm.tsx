import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Trash2, Plus } from "lucide-react"
import type { CatalogoCategoria, CatalogoIpsConexao, CatalogoIpsFamilia, CatalogoIpsLinha, CatalogoFresa, CatalogoChave, CatalogoProtocoloFresagem, CatalogoKit, CatalogoAbutment, CatalogoCicatrizador } from "~/features/catalogo/types"
import { listarFresasProtocolo } from "~/features/catalogo/services/implantes.service"

const implanteSchema = z.object({
  // Categoria
  categoria_id: z.string().optional(),
  // Hierarquia
  conexao_id: z.string().min(1, "Conexão é obrigatória"),
  familia_id: z.string().min(1, "Família é obrigatória"),
  linha_id: z.string().min(1, "Linha é obrigatória"),
  // Identificação
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  descricao: z.string().optional(),
  // Protocolos
  osso_soft: z.string().optional(),
  osso_hard: z.string().optional(),
  // Especificações
  diametro_mm: z.coerce.number().positive("Ø deve ser positivo"),
  comprimento_mm: z.coerce.number().positive("Comp. deve ser positivo"),
  rosca_interna: z.string().optional(),
  regiao_apical: z.string().optional(),
  regiao_cervical: z.string().optional(),
  torque_insercao: z.coerce.number().optional(),
  macrogeometria: z.string().optional(),
  material: z.string().optional(),
  superficie: z.string().optional(),
  diametro_plataforma_mm: z.coerce.number().optional(),
  // Chaves
  chaves_ids: z.array(z.string()).optional(),
  // Estoque
  qtd_disponivel: z.coerce.number().int().min(0).optional(),
  qtd_minima_aviso: z.coerce.number().int().min(0).optional(),
  // Comercial
  preco: z.coerce.number().min(0, "Preço não pode ser negativo").optional(),
  preco_euro: z.coerce.number().min(0).optional(),
  preco_dolar: z.coerce.number().min(0).optional(),
  ativo: z.boolean(),
})

export type ImplanteFormData = z.infer<typeof implanteSchema>

interface Props {
  data: ImplanteFormData
  onChange: (data: ImplanteFormData) => void
  categorias: CatalogoCategoria[] | undefined
  conexoes: CatalogoIpsConexao[] | undefined
  familias: CatalogoIpsFamilia[] | undefined
  linhas: CatalogoIpsLinha[] | undefined
  fresas: CatalogoFresa[] | undefined
  chaves: CatalogoChave[] | undefined
  chavesIds: string[]
  onChavesChange: (ids: string[]) => void
  protocolos: CatalogoProtocoloFresagem[] | undefined
  tiposOsso: { sigla: string | null; categoria: string }[] | undefined
  onGerarSku: () => void
  // Composição
  kits: CatalogoKit[] | undefined
  kitsIds: string[]
  onKitsChange: (skus: string[]) => void
  abutments: CatalogoAbutment[] | undefined
  abutmentsIds: string[]
  onAbutmentsChange: (skus: string[]) => void
  cicatrizadores: CatalogoCicatrizador[] | undefined
  cicatrizadoresIds: string[]
  onCicatrizadoresChange: (skus: string[]) => void
}

export function ImplanteForm({
  data, onChange, categorias, conexoes, familias, linhas,
  fresas, chaves, chavesIds, onChavesChange, protocolos, tiposOsso, onGerarSku,
  kits, kitsIds, onKitsChange, abutments, abutmentsIds, onAbutmentsChange,
  cicatrizadores, cicatrizadoresIds, onCicatrizadoresChange,
}: Props) {
  const { register, formState: { errors } } = useForm<ImplanteFormData>({
    resolver: zodResolver(implanteSchema),
    defaultValues: data,
    values: data,
    mode: "onChange",
  })

  // Protocolo de fresagem — preview de fresas
  type FresaProto = { ordem: number; fresa_nome: string; fresa_sku: string; diametro_mm: number | null }
  const [fresasSoft, setFresasSoft] = useState<FresaProto[]>([])
  const [fresasHard, setFresasHard] = useState<FresaProto[]>([])

  useEffect(() => {
    if (data.osso_soft) { listarFresasProtocolo(data.osso_soft).then(setFresasSoft).catch(() => setFresasSoft([])) }
    else { setFresasSoft([]) }
  }, [data.osso_soft])

  useEffect(() => {
    if (data.osso_hard) { listarFresasProtocolo(data.osso_hard).then(setFresasHard).catch(() => setFresasHard([])) }
    else { setFresasHard([]) }
  }, [data.osso_hard])

  const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
  const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
  const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

  return (
    <div className="space-y-4">
      {/* ─── 1. Vinculações ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Vinculações</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Categoria</label>
          <select {...register("categoria_id")} value={data.categoria_id} onChange={(e) => onChange({ ...data, categoria_id: e.target.value })} className={selectCls}>
            <option value="">Nenhuma</option>
            {categorias?.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Conexão *</label>
          <select {...register("conexao_id")} value={data.conexao_id} onChange={(e) => onChange({ ...data, conexao_id: e.target.value, familia_id: "", linha_id: "" })} className={selectCls}>
            <option value="">Selecione...</option>
            {conexoes?.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.sigla})</option>)}
          </select>
          {errors.conexao_id && <p className="text-xs text-red-400">{errors.conexao_id.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Família *</label>
          <select {...register("familia_id")} value={data.familia_id} onChange={(e) => onChange({ ...data, familia_id: e.target.value, linha_id: "" })} className={selectCls} disabled={!data.conexao_id}>
            <option value="">Selecione...</option>
            {familias?.filter((f) => f.conexao_id === data.conexao_id).map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {errors.familia_id && <p className="text-xs text-red-400">{errors.familia_id.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Linha *</label>
          <select {...register("linha_id")} value={data.linha_id} onChange={(e) => onChange({ ...data, linha_id: e.target.value })} className={selectCls} disabled={!data.familia_id}>
            <option value="">Selecione...</option>
            {linhas?.filter((l) => l.familia_id === data.familia_id).map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
          {errors.linha_id && <p className="text-xs text-red-400">{errors.linha_id.message}</p>}
        </div>
      </div>

      {/* ─── 2. Identificação ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Identificação</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>SKU *</label>
          <div className="flex gap-2">
            <input type="text" {...register("sku")} value={data.sku} onChange={(e) => onChange({ ...data, sku: e.target.value })} className={inputCls + " flex-1"} placeholder="Ex: 524385" />
            <button type="button" onClick={onGerarSku} className="px-3 py-2 rounded-lg text-xs font-bold bg-[#c9a655]/20 text-[#c9a655] border border-[#c9a655]/30 hover:bg-[#c9a655]/30 transition-colors shrink-0" title="Gerar SKU automaticamente">Gerar</button>
          </div>
          {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Nome *</label>
          <input type="text" {...register("nome")} value={data.nome} onChange={(e) => onChange({ ...data, nome: e.target.value })} className={inputCls} placeholder="Nome do implante" />
          {errors.nome && <p className="text-xs text-red-400">{errors.nome.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Sigla</label>
          <input type="text" {...register("sigla")} value={data.sigla} onChange={(e) => onChange({ ...data, sigla: e.target.value })} className={inputCls} placeholder="Ex: IMP" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Descrição</label>
          <textarea rows={3} {...register("descricao")} value={data.descricao} onChange={(e) => onChange({ ...data, descricao: e.target.value })} className={inputCls} placeholder="Descrição do implante" />
        </div>
      </div>

      {/* ─── 3. Composição ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Protocolos de Fresagem</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Protocolo Osso Soft (III-IV)</label>
          <select {...register("osso_soft")} value={data.osso_soft} onChange={(e) => onChange({ ...data, osso_soft: e.target.value })} className={selectCls}>
            <option value="">Nenhum</option>
            {protocolos?.filter((p) => { const cat = tiposOsso?.find((t) => t.sigla === p.tipo_osso)?.categoria; return cat === "soft" }).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
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
          {data.osso_soft && fresasSoft.length === 0 && (
            <p className="text-[10px] text-gray-500 italic">Nenhuma fresa neste protocolo</p>
          )}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Protocolo Osso Hard (I-II)</label>
          <select {...register("osso_hard")} value={data.osso_hard} onChange={(e) => onChange({ ...data, osso_hard: e.target.value })} className={selectCls}>
            <option value="">Nenhum</option>
            {protocolos?.filter((p) => { const cat = tiposOsso?.find((t) => t.sigla === p.tipo_osso)?.categoria; return cat === "hard" }).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
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
          {data.osso_hard && fresasHard.length === 0 && (
            <p className="text-[10px] text-gray-500 italic">Nenhuma fresa neste protocolo</p>
          )}
        </div>
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Composição do Implante</h3>

      {/* Chaves */}
      <CompositionSection
        label="Chaves"
        selectedIds={chavesIds}
        options={chaves?.map((c) => ({ id: c.sku, label: `${c.nome} (${c.sigla ?? c.sku})` })) ?? []}
        placeholder="Selecione uma chave..."
        onChange={onChavesChange}
      />

      {/* Kits */}
      <CompositionSection
        label="Kits"
        selectedIds={kitsIds}
        options={kits?.map((k) => ({ id: k.sku, label: k.nome })) ?? []}
        placeholder="Selecione um kit..."
        onChange={onKitsChange}
      />

      {/* Abutments */}
      <CompositionSection
        label="Abutments / Componentes"
        selectedIds={abutmentsIds}
        options={abutments?.map((a) => ({ id: a.sku, label: `${a.nome} (${a.sku})` })) ?? []}
        placeholder="Selecione um abutment..."
        onChange={onAbutmentsChange}
      />

      {/* Cicatrizadores */}
      <CompositionSection
        label="Cicatrizadores"
        selectedIds={cicatrizadoresIds}
        options={cicatrizadores?.map((c) => ({ id: c.sku, label: `${c.nome} (${c.sku})` })) ?? []}
        placeholder="Selecione um cicatrizador..."
        onChange={onCicatrizadoresChange}
      />

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Especificações Cirúrgicas</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Ø mm *</label>
          <input type="number" step="0.1" {...register("diametro_mm")} value={data.diametro_mm} onChange={(e) => onChange({ ...data, diametro_mm: Number(e.target.value) })} className={inputCls} />
          {errors.diametro_mm && <p className="text-xs text-red-400">{errors.diametro_mm.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Comp. mm *</label>
          <input type="number" step="0.1" {...register("comprimento_mm")} value={data.comprimento_mm} onChange={(e) => onChange({ ...data, comprimento_mm: Number(e.target.value) })} className={inputCls} />
          {errors.comprimento_mm && <p className="text-xs text-red-400">{errors.comprimento_mm.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Torque N·cm</label>
          <input type="number" {...register("torque_insercao")} value={data.torque_insercao} onChange={(e) => onChange({ ...data, torque_insercao: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Rosca Interna</label>
          <input type="text" {...register("rosca_interna")} value={data.rosca_interna} onChange={(e) => onChange({ ...data, rosca_interna: e.target.value })} className={inputCls} placeholder="Ex: M 1.6" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Macrogeometria</label>
          <input type="text" {...register("macrogeometria")} value={data.macrogeometria} onChange={(e) => onChange({ ...data, macrogeometria: e.target.value })} className={inputCls} placeholder="Ex: Taper" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Ø Plataforma mm</label>
          <input type="number" step="0.1" {...register("diametro_plataforma_mm")} value={data.diametro_plataforma_mm} onChange={(e) => onChange({ ...data, diametro_plataforma_mm: Number(e.target.value) })} className={inputCls} placeholder="Ex: 4.5" />
        </div>
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Material & Superfície</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Material</label>
          <input type="text" {...register("material")} value={data.material} onChange={(e) => onChange({ ...data, material: e.target.value })} className={inputCls} placeholder="Ex: Titânio Grau 4" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Superfície</label>
          <input type="text" {...register("superficie")} value={data.superficie} onChange={(e) => onChange({ ...data, superficie: e.target.value })} className={inputCls} placeholder="Ex: Porous" />
        </div>
      </div>

      {/* ─── 5. Estoque ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Estoque na Loja</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Qtd Disponível</label>
          <input type="number" step="1" min="0" {...register("qtd_disponivel")} value={data.qtd_disponivel ?? 0} onChange={(e) => onChange({ ...data, qtd_disponivel: Number(e.target.value) })} className={inputCls} placeholder="0" />
          {data.qtd_disponivel != null && data.qtd_minima_aviso != null && data.qtd_disponivel > 0 && data.qtd_disponivel <= data.qtd_minima_aviso && (
            <p className="text-xs text-amber-400 font-medium">⚠ Estoque baixo!</p>
          )}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Qtd Mínima (aviso)</label>
          <input type="number" step="1" min="0" {...register("qtd_minima_aviso")} value={data.qtd_minima_aviso ?? 0} onChange={(e) => onChange({ ...data, qtd_minima_aviso: Number(e.target.value) })} className={inputCls} placeholder="0" />
        </div>
      </div>

      {/* ─── 6. Comercial ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Comercial</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Preço (R$)</label>
          <input type="number" step="0.01" min="0" {...register("preco")} value={data.preco} onChange={(e) => onChange({ ...data, preco: Number(e.target.value) })} className={inputCls} placeholder="0,00" />
          {errors.preco && <p className="text-xs text-red-400">{errors.preco.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Preço (€ Euro)</label>
          <input type="number" step="0.01" min="0" {...register("preco_euro")} value={data.preco_euro ?? 0} onChange={(e) => onChange({ ...data, preco_euro: Number(e.target.value) })} className={inputCls} placeholder="0,00" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Preço ($ Dólar)</label>
          <input type="number" step="0.01" min="0" {...register("preco_dolar")} value={data.preco_dolar ?? 0} onChange={(e) => onChange({ ...data, preco_dolar: Number(e.target.value) })} className={inputCls} placeholder="0,00" />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <label className={labelCls}>Ativo</label>
        <button
          type="button"
          onClick={() => onChange({ ...data, ativo: !data.ativo })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            data.ativo ? "bg-[#c9a655]" : "bg-white/10"
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            data.ativo ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
      </div>
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

  function handleImportAll() {
    const novos = allOptions.filter((o) => !selectedIds.includes(o.id)).map((o) => o.id)
    if (novos.length > 0) onChange([...selectedIds, ...novos])
  }

  const allOptions = options.length > 0 ? options : []
  const restantes = allOptions.filter((o) => !selectedIds.includes(o.id))
  const selectedLabels = selectedIds.map((id) => {
    const found = allOptions.find((o) => o.id === id)
    return { id, label: found?.label ?? id }
  })

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--color-surface)]/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
        {restantes.length > 0 && (
          <button
            type="button"
            onClick={handleImportAll}
            className="text-[10px] font-black uppercase tracking-wider text-[#c9a655]/70 hover:text-[#c9a655] transition-colors"
          >
            Importar Todos
          </button>
        )}
      </div>
      <div className="flex gap-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c9a655]/50 transition-colors"
        >
          <option value="">{placeholder}</option>
          {restantes.map((o) => (
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
