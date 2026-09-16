import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Trash2 } from "lucide-react"
import type { CatalogoFamilia, CatalogoTipoReabilitacao, CatalogoTipoAbutment, CatalogoChave, CatalogoKit, CatalogoParafusoRetencao, CatalogoImplante, CatalogoIpsLinha } from "~/features/catalogo/types"
import type { CatalogoSeqProtetica } from "~/features/catalogo/services/sequencia-protetica.service"

const abutmentSchema = z.object({
  familia_id: z.string().min(1, "Família é obrigatória"),
  tipo_reabilitacao_id: z.string().min(1, "Tipo de reabilitação é obrigatório"),
  tipo_abutment_id: z.string().min(1, "Tipo de abutment é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  diametro_plataforma: z.string().optional(),
  angulacao_graus: z.coerce.number().optional(),
  altura_transmucoso: z.coerce.number().optional(),
  altura_corpo: z.coerce.number().optional(),
  torque_ncm: z.coerce.number().optional(),
  preco: z.coerce.number().min(0, "Preço não pode ser negativo").optional(),
  preco_euro: z.coerce.number().min(0).optional(),
  preco_dolar: z.coerce.number().min(0).optional(),
  // Estoque
  qtd_disponivel: z.coerce.number().int().min(0).optional(),
  qtd_minima_aviso: z.coerce.number().int().min(0).optional(),
})

export type AbutmentFormData = z.infer<typeof abutmentSchema>

interface Props {
  data: AbutmentFormData
  onChange: (data: AbutmentFormData) => void
  familias: CatalogoFamilia[] | undefined
  tiposReab: CatalogoTipoReabilitacao[] | undefined
  tiposAbutment: CatalogoTipoAbutment[] | undefined
  sequencias: CatalogoSeqProtetica[] | undefined
  sequenciasIds: string[]
  onSequenciasChange: (ids: string[]) => void
  // Composição
  chaves: CatalogoChave[] | undefined
  chavesIds: string[]
  onChavesChange: (ids: string[]) => void
  kits: CatalogoKit[] | undefined
  kitsIds: string[]
  onKitsChange: (ids: string[]) => void
  parafusos: CatalogoParafusoRetencao[] | undefined
  parafusosIds: string[]
  onParafusosChange: (ids: string[]) => void
  implantes: CatalogoImplante[] | undefined
  linhas: CatalogoIpsLinha[] | undefined
  implantesIds: string[]
  onImplantesChange: (ids: string[]) => void
}

export function AbutmentForm({
  data, onChange, familias, tiposReab, tiposAbutment,
  sequencias, sequenciasIds, onSequenciasChange,
  chaves, chavesIds, onChavesChange,
  kits, kitsIds, onKitsChange,
  parafusos, parafusosIds, onParafusosChange,
  implantes, linhas, implantesIds, onImplantesChange,
}: Props) {
  const { register, formState: { errors } } = useForm<AbutmentFormData>({
    resolver: zodResolver(abutmentSchema),
    defaultValues: data,
    values: data,
    mode: "onChange",
  })

  const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
  const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
  const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
      <div className="space-y-2">
        <label className={labelCls}>SKU *</label>
        <input type="text" {...register("sku")} value={data.sku} onChange={(e) => onChange({ ...data, sku: e.target.value })} className={inputCls} placeholder="Ex: AB1002" />
        {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Relacionamentos</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Família *</label>
          <select {...register("familia_id")} value={data.familia_id} onChange={(e) => onChange({ ...data, familia_id: e.target.value })} className={selectCls}>
            <option value="">Selecione...</option>
            {familias?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {errors.familia_id && <p className="text-xs text-red-400">{errors.familia_id.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Tipo Reabilitação *</label>
          <select {...register("tipo_reabilitacao_id")} value={data.tipo_reabilitacao_id} onChange={(e) => onChange({ ...data, tipo_reabilitacao_id: e.target.value })} className={selectCls}>
            <option value="">Selecione...</option>
            {tiposReab?.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          {errors.tipo_reabilitacao_id && <p className="text-xs text-red-400">{errors.tipo_reabilitacao_id.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Tipo Abutment *</label>
          <select {...register("tipo_abutment_id")} value={data.tipo_abutment_id} onChange={(e) => onChange({ ...data, tipo_abutment_id: e.target.value })} className={selectCls}>
            <option value="">Selecione...</option>
            {tiposAbutment?.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          {errors.tipo_abutment_id && <p className="text-xs text-red-400">{errors.tipo_abutment_id.message}</p>}
        </div>
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Especificações</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Ø Plataforma (mm)</label>
          <input type="text" {...register("diametro_plataforma")} value={data.diametro_plataforma} onChange={(e) => onChange({ ...data, diametro_plataforma: e.target.value })} className={inputCls} placeholder="Ex: 3.5" />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Angulação (graus)</label>
          <input type="number" {...register("angulacao_graus")} value={data.angulacao_graus} onChange={(e) => onChange({ ...data, angulacao_graus: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Altura Transmucoso (mm)</label>
          <input type="number" step="0.1" {...register("altura_transmucoso")} value={data.altura_transmucoso} onChange={(e) => onChange({ ...data, altura_transmucoso: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Altura Corpo (mm)</label>
          <input type="number" step="0.1" {...register("altura_corpo")} value={data.altura_corpo} onChange={(e) => onChange({ ...data, altura_corpo: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Torque (N·cm)</label>
          <input type="number" {...register("torque_ncm")} value={data.torque_ncm} onChange={(e) => onChange({ ...data, torque_ncm: Number(e.target.value) })} className={inputCls} />
        </div>
      </div>

      {/* ─── Estoque ─── */}
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

      {/* ─── Comercial ─── */}
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

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Composição do Abutment</h3>

      {/* Chaves */}
      <CompositionSection
        label="Chaves Compatíveis"
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

      {/* Parafusos */}
      <CompositionSection
        label="Parafusos"
        selectedIds={parafusosIds}
        options={parafusos?.map((p) => ({ id: p.sku, label: p.nome })) ?? []}
        placeholder="Selecione um parafuso..."
        onChange={onParafusosChange}
      />



      <CompositionSection
        label="Sequências Protéticas"
        selectedIds={sequenciasIds}
        options={sequencias?.map((s) => ({ id: s.id, label: s.sigla ? `${s.nome} (${s.sigla})` : s.nome })) ?? []}
        placeholder="Selecione uma sequência..."
        onChange={onSequenciasChange}
      />

      {/* Implantes Compatíveis */}
      <ImplantesCompativeisSection
        implantes={implantes}
        linhas={linhas}
        selectedIds={implantesIds}
        onChange={onImplantesChange}
      />
    </div>
  )
}

// ============================================================
// ImplantesCompativeisSection — agrupado por linha, com
// "Importar Todos" por linha e geral
// ============================================================

function ImplantesCompativeisSection({
  implantes, linhas, selectedIds, onChange,
}: {
  implantes: CatalogoImplante[] | undefined
  linhas: CatalogoIpsLinha[] | undefined
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const grupos = new Map<string, { linha: CatalogoIpsLinha | undefined; implantes: CatalogoImplante[] }>()
  for (const impl of implantes ?? []) {
    const linhaId = impl.linha_id ?? "sem-linha"
    if (!grupos.has(linhaId)) grupos.set(linhaId, { linha: linhas?.find((l) => l.id === linhaId), implantes: [] })
    grupos.get(linhaId)!.implantes.push(impl)
  }

  function toggle(sku: string) {
    onChange(selectedIds.includes(sku) ? selectedIds.filter((s) => s !== sku) : [...selectedIds, sku])
  }

  function importarTodos(skus: string[]) {
    const novos = skus.filter((s) => !selectedIds.includes(s))
    if (novos.length > 0) onChange([...selectedIds, ...novos])
  }

  const todosOsSkus = (implantes ?? []).map((i) => i.sku)

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--color-surface)]/50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Implantes Compatíveis</p>
        {todosOsSkus.length > 0 && (
          <button
            type="button"
            onClick={() => importarTodos(todosOsSkus)}
            className="text-[10px] font-black uppercase tracking-wider text-[#c9a655]/70 hover:text-[#c9a655] transition-colors"
          >
            Importar Todos
          </button>
        )}
      </div>

      {grupos.size === 0 && <p className="text-xs text-gray-500 italic">Nenhum implante cadastrado.</p>}

      {[...grupos.entries()].map(([linhaId, grupo]) => {
        const skusDoGrupo = grupo.implantes.map((i) => i.sku)
        return (
          <div key={linhaId} className="space-y-2 pt-1 border-t border-white/5 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-300">{grupo.linha?.nome ?? "Sem linha"}</p>
              <button
                type="button"
                onClick={() => importarTodos(skusDoGrupo)}
                className="text-[9px] font-bold uppercase tracking-wider text-[#c9a655]/60 hover:text-[#c9a655] transition-colors"
              >
                Importar Todos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {grupo.implantes.map((impl) => {
                const isSelected = selectedIds.includes(impl.sku)
                return (
                  <button
                    key={impl.sku}
                    type="button"
                    onClick={() => toggle(impl.sku)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                      isSelected ? "bg-[#c9a655]/20 text-[#c9a655] border-[#c9a655]/30" : "bg-[var(--color-surface)] text-gray-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {impl.nome}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
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
