import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { CatalogoFamilia, CatalogoChave } from "~/features/catalogo/types"

const cicatrizadorSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  altura_transmucoso: z.coerce.number().optional(),
  diametro_plataforma: z.string().optional(),
  torque_ncm: z.coerce.number().optional(),
  familia_id: z.string().optional(),
  chave_sku: z.string().optional(),
  preco: z.coerce.number().min(0, "Preço não pode ser negativo").optional(),
  // Estoque
  qtd_disponivel: z.coerce.number().int().min(0).optional(),
  qtd_minima_aviso: z.coerce.number().int().min(0).optional(),
  // Moedas
  preco_euro: z.coerce.number().min(0).optional(),
  preco_dolar: z.coerce.number().min(0).optional(),
})

export type CicatrizadorFormData = z.infer<typeof cicatrizadorSchema>

interface Props {
  data: CicatrizadorFormData
  onChange: (data: CicatrizadorFormData) => void
  familias: CatalogoFamilia[] | undefined
  chaves: CatalogoChave[] | undefined
}

export function CicatrizadorForm({ data, onChange, familias, chaves }: Props) {
  const { register, formState: { errors } } = useForm<CicatrizadorFormData>({
    resolver: zodResolver(cicatrizadorSchema),
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
          <input type="text" {...register("sku")} value={data.sku} onChange={(e) => onChange({ ...data, sku: e.target.value })} className={inputCls} placeholder="Ex: CIC1001" />
          {errors.sku && <p className="text-xs text-red-400">{errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Nome *</label>
          <input type="text" {...register("nome")} value={data.nome} onChange={(e) => onChange({ ...data, nome: e.target.value })} className={inputCls} placeholder="Ex: Cicatrizador 3.5mm" />
          {errors.nome && <p className="text-xs text-red-400">{errors.nome.message}</p>}
        </div>
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest text-[#c9a655] pt-2">Especificações</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Altura Transmucoso (mm)</label>
          <input type="number" step="0.1" {...register("altura_transmucoso")} value={data.altura_transmucoso} onChange={(e) => onChange({ ...data, altura_transmucoso: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Diâmetro Plataforma (mm)</label>
          <select {...register("diametro_plataforma")} value={data.diametro_plataforma} onChange={(e) => onChange({ ...data, diametro_plataforma: e.target.value })} className={selectCls}>
            <option value="">Selecione...</option>
            <option value="3.5">3.5 mm</option>
            <option value="4.3">4.3 mm</option>
            <option value="5.0">5.0 mm</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Torque (N·cm)</label>
          <input type="number" step="0.1" {...register("torque_ncm")} value={data.torque_ncm} onChange={(e) => onChange({ ...data, torque_ncm: Number(e.target.value) })} className={inputCls} />
        </div>
      </div>

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
          <label className={labelCls}>Família do Implante</label>
          <select {...register("familia_id")} value={data.familia_id} onChange={(e) => onChange({ ...data, familia_id: e.target.value })} className={selectCls}>
            <option value="">Selecione...</option>
            {familias?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Chave de Instalação</label>
          <select {...register("chave_sku")} value={data.chave_sku} onChange={(e) => onChange({ ...data, chave_sku: e.target.value })} className={selectCls}>
            <option value="">Selecione...</option>
            {chaves?.map((c) => <option key={c.sku} value={c.sku}>{c.nome}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
