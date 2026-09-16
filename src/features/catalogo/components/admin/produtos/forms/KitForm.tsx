import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CatalogoTipoKit, CatalogoFresa, CatalogoChave, CatalogoComplementar, CatalogoOpcional, CatalogoImplante } from "~/features/catalogo/types"

const kitSchema = z.object({
  tipo_kit_id: z.string().optional(),
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  descricao: z.string().optional(),
  // Estoque
  qtd_disponivel: z.coerce.number().int().min(0).optional(),
  qtd_minima_aviso: z.coerce.number().int().min(0).optional(),
  // Comercial
  preco: z.coerce.number().min(0, "Preço não pode ser negativo").optional(),
  preco_euro: z.coerce.number().min(0).optional(),
  preco_dolar: z.coerce.number().min(0).optional(),
})

export type KitFormData = z.infer<typeof kitSchema>

interface Props {
  data: KitFormData
  onChange: (data: KitFormData) => void
  tiposKit: CatalogoTipoKit[] | undefined
  fresas: CatalogoFresa[] | undefined
  chaves: CatalogoChave[] | undefined
  complementares: CatalogoComplementar[] | undefined
  opcionais: CatalogoOpcional[] | undefined
  kitChaves: string[]
  kitFresas: string[]
  kitComplementares: string[]
  kitOpcionais: string[]
  onToggleChave: (sku: string) => void
  onToggleFresa: (sku: string) => void
  onToggleComplementar: (sku: string) => void
  onToggleOpcional: (sku: string) => void
  // Kits complementares e relacionados
  todosKits: { sku: string; nome: string }[] | undefined
  kitKitsComplementares: string[]
  kitKitsRelacionados: string[]
  onToggleKitComplementar: (sku: string) => void
  onToggleKitRelacionado: (sku: string) => void
  // Implantes compatíveis
  implantes: CatalogoImplante[] | undefined
  kitImplantes: string[]
  onToggleImplante: (sku: string) => void
}

export function KitForm({
  data, onChange, tiposKit,
  fresas, chaves, complementares, opcionais,
  kitChaves, kitFresas, kitComplementares, kitOpcionais,
  onToggleChave, onToggleFresa, onToggleComplementar, onToggleOpcional,
  todosKits, kitKitsComplementares, kitKitsRelacionados,
  onToggleKitComplementar, onToggleKitRelacionado,
  implantes, kitImplantes, onToggleImplante,
}: Props) {
  const { register, formState: { errors } } = useForm<KitFormData>({
    resolver: zodResolver(kitSchema),
    defaultValues: data,
    values: data,
    mode: "onChange",
  })

  const inputCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
  const selectCls = "w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
  const labelCls = "text-xs font-bold uppercase tracking-widest text-gray-400"

  function renderToggleList(
    items: { sku: string; nome: string }[] | undefined,
    selected: string[],
    onToggle: (sku: string) => void,
  ) {
    if (!items?.length) return <p className="text-xs text-gray-500 italic">Nenhum item disponível.</p>
    const restantes = items.filter((item) => !selected.includes(item.sku))
    return (
      <div className="space-y-2">
        {restantes.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => restantes.forEach((item) => onToggle(item.sku))}
              className="text-[10px] font-black uppercase tracking-wider text-[#c9a655]/70 hover:text-[#c9a655] transition-colors"
            >
              Importar Todos
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const isSelected = selected.includes(item.sku)
            return (
              <button
                key={item.sku}
                type="button"
                onClick={() => onToggle(item.sku)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  isSelected ? "bg-[#c9a655]/20 text-[#c9a655] border-[#c9a655]/30" : "bg-[var(--color-surface)] text-gray-400 border-white/10 hover:border-white/20"
                }`}
              >
                {item.nome}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ─── 1. IDENTIFICAÇÃO ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655]">Identificação</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>SKU *</label>
          <input type="text" {...register("sku")} value={data.sku} onChange={(e) => onChange({ ...data, sku: e.target.value })} className={inputCls} placeholder="Ex: 950000-KIT" />
          {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Nome *</label>
          <input type="text" {...register("nome")} value={data.nome} onChange={(e) => onChange({ ...data, nome: e.target.value })} className={inputCls} placeholder="Ex: Kit Master Flex" />
          {errors.nome && <p className="text-xs text-red-400">{errors.nome.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Sigla</label>
          <input type="text" {...register("sigla")} value={data.sigla} onChange={(e) => onChange({ ...data, sigla: e.target.value })} className={inputCls} placeholder="Ex: KMF" />
        </div>
      </div>
      <div className="space-y-2">
        <label className={labelCls}>Descrição</label>
        <textarea {...register("descricao")} value={data.descricao} onChange={(e) => onChange({ ...data, descricao: e.target.value })} className={inputCls + " min-h-[80px]"} placeholder="Descrição do kit..." />
      </div>

      {/* ─── 2. VINCULAÇÃO ─── */}
      {tiposKit && tiposKit.length > 0 && (
        <>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Vinculação</h3>
          <div className="space-y-2">
            <label className={labelCls}>Tipo de Kit</label>
            <select {...register("tipo_kit_id")} value={data.tipo_kit_id} onChange={(e) => onChange({ ...data, tipo_kit_id: e.target.value })} className={selectCls}>
              <option value="">Selecione...</option>
              {tiposKit?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </>
      )}

      {/* ─── 3. COMPOSIÇÃO ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Composição</h3>

      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Chaves do Kit</h3>
        {renderToggleList(chaves, kitChaves, onToggleChave)}
      </div>

      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Fresas do Kit</h3>
        {renderToggleList(fresas, kitFresas, onToggleFresa)}
      </div>

      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Instrumentais Complementares</h3>
        {renderToggleList(complementares, kitComplementares, onToggleComplementar)}
      </div>

      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Instrumentais Opcionais</h3>
        {renderToggleList(opcionais, kitOpcionais, onToggleOpcional)}
      </div>

      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Kits Complementares</h3>
        <p className="text-xs text-gray-500">Selecione kits que complementam este kit</p>
        {renderToggleList(todosKits?.filter(k => k.sku !== data.sku), kitKitsComplementares, onToggleKitComplementar)}
      </div>

      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#c9a655]">Kits Relacionados</h3>
        <p className="text-xs text-gray-500">Selecione kits relacionados a este kit</p>
        {renderToggleList(todosKits?.filter(k => k.sku !== data.sku), kitKitsRelacionados, onToggleKitRelacionado)}
      </div>

      {/* ─── 4. IMPLANTES COMPATÍVEIS ─── */}
      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Implantes Compatíveis</h3>
      <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
        <p className="text-xs text-gray-500">Selecione os implantes compatíveis com este kit</p>
        {renderToggleList(
          implantes?.map((i) => ({ sku: i.sku, nome: i.nome || i.sku })) ?? [],
          kitImplantes,
          onToggleImplante,
        )}
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
    </div>
  )
}
