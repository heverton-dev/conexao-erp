import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CatalogoChave } from "~/features/catalogo/types"

const parafusoSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  torque_ncm: z.coerce.number().optional(),
  vinculo_tipo: z.enum(["abutment", "componente"], { required_error: "Tipo de vínculo é obrigatório" }),
  vinculo_sku: z.string().min(1, "SKU do vínculo é obrigatório"),
  chave_sku: z.string().optional(),
  // Estoque
  qtd_disponivel: z.coerce.number().int().min(0).optional(),
  qtd_minima_aviso: z.coerce.number().int().min(0).optional(),
  // Comercial
  preco: z.coerce.number().min(0, "Preço não pode ser negativo").optional(),
  preco_euro: z.coerce.number().min(0).optional(),
  preco_dolar: z.coerce.number().min(0).optional(),
})

export type ParafusoRetencaoFormData = z.infer<typeof parafusoSchema>

interface Props {
  data: ParafusoRetencaoFormData
  onChange: (data: ParafusoRetencaoFormData) => void
  chaves: CatalogoChave[] | undefined
}

export function ParafusoRetencaoForm({ data, onChange, chaves }: Props) {
  const { register, formState: { errors } } = useForm<ParafusoRetencaoFormData>({
    resolver: zodResolver(parafusoSchema),
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>SKU *</label>
          <input type="text" {...register("sku")} value={data.sku} onChange={(e) => onChange({ ...data, sku: e.target.value })} className={inputCls} placeholder="Ex: PR1001" />
          {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Nome *</label>
          <input type="text" {...register("nome")} value={data.nome} onChange={(e) => onChange({ ...data, nome: e.target.value })} className={inputCls} placeholder="Ex: Parafuso de Retenção AB" />
          {errors.nome && <p className="text-xs text-red-400">{errors.nome.message}</p>}
        </div>
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Especificações</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Torque (N·cm)</label>
          <input type="number" step="0.1" {...register("torque_ncm")} value={data.torque_ncm} onChange={(e) => onChange({ ...data, torque_ncm: Number(e.target.value) })} className={inputCls} />
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

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Relacionamentos</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Vinculado a *</label>
          <select {...register("vinculo_tipo")} value={data.vinculo_tipo} onChange={(e) => onChange({ ...data, vinculo_tipo: e.target.value as "abutment" | "componente" })} className={selectCls}>
            <option value="">Selecione...</option>
            <option value="abutment">Abutment</option>
            <option value="componente">Componente</option>
          </select>
          {errors.vinculo_tipo && <p className="text-xs text-red-400">{errors.vinculo_tipo.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>SKU do Vínculo *</label>
          <input type="text" {...register("vinculo_sku")} value={data.vinculo_sku} onChange={(e) => onChange({ ...data, vinculo_sku: e.target.value })} className={inputCls} placeholder="SKU do abutment/componente" />
          {errors.vinculo_sku && <p className="text-xs text-red-400">{errors.vinculo_sku.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Chave de Fixação</label>
          <select {...register("chave_sku")} value={data.chave_sku} onChange={(e) => onChange({ ...data, chave_sku: e.target.value })} className={selectCls}>
            <option value="">Selecione...</option>
            {chaves?.map((c) => <option key={c.sku} value={c.sku}>{c.nome}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
