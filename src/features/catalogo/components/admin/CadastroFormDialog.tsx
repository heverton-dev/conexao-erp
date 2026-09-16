import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "~/core/supabase"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import toast from "react-hot-toast"
import type { FieldConfig } from "~/features/catalogo/types/cadastros"

function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of fields) {
    if (f.type === "number") {
      const base = z.coerce.number()
      const s: z.ZodTypeAny = f.required ? base.nonnegative(`${f.label} deve ser válido`) : base.optional().or(z.literal(""))
      shape[f.key] = s
    } else if (f.type === "toggle") {
      shape[f.key] = z.boolean()
    } else {
      let s = z.string()
      if (f.required) s = s.min(1, `${f.label} é obrigatório`)
      shape[f.key] = s
    }
  }
  return z.object(shape)
}

type FormData = Record<string, unknown>

function getDefaults(fields: FieldConfig[]) {
  const init: Record<string, unknown> = {}
  for (const f of fields) {
    if (f.type === "toggle") init[f.key] = false
    else if (f.type === "number") init[f.key] = 0
    else init[f.key] = ""
  }
  return init as FormData
}

export function CadastroFormDialog({
  open, onOpenChange, fields, table, pk, editingItem, onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fields: FieldConfig[]
  table: string
  pk: string
  editingItem: Record<string, unknown> | null
  onSuccess: () => void
}) {
  const schema = buildSchema(fields)

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(fields),
  })

  useEffect(() => {
    if (!open) return
    if (editingItem) {
      const init: Record<string, unknown> = {}
      for (const f of fields) {
        init[f.key] = editingItem[f.key] ?? (f.type === "toggle" ? false : f.type === "number" ? 0 : "")
      }
      reset(init)
    } else {
      reset(getDefaults(fields))
    }
  }, [open, editingItem, fields, reset])
  async function onSubmit(data: FormData) {
    const payload: Record<string, unknown> = {}
    for (const f of fields) {
      const val = data[f.key]
      if (val !== undefined && val !== "" && val !== null) {
        payload[f.key] = val
      }
    }

    const { error } = editingItem
      ? await supabase.from(table).update(payload).eq(pk, editingItem[pk])
      : await supabase.from(table).insert(payload)

    if (error) {
      console.error("Erro ao salvar:", error)
      toast.error(error.message || "Erro ao salvar registro")
      return
    }
    onSuccess()
    onOpenChange(false)
    reset(getDefaults(fields))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-white">
            {editingItem ? "Editar Registro" : "Novo Registro"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editingItem ? "Altere os campos abaixo." : "Preencha os campos para criar um novo registro."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    {...register(field.key)}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                    placeholder={`Digite ${field.label.toLowerCase()}...`}
                  />
                )}

                {field.type === "number" && (
                  <input
                    type="number"
                    step="any"
                    {...register(field.key)}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                  />
                )}

                {field.type === "color" && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={(watch(field.key) as string | undefined) || "#c9a655"}
                      onChange={(e) => setValue(field.key, e.target.value, { shouldDirty: true })}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={(watch(field.key) as string | undefined) || ""}
                      onChange={(e) => setValue(field.key, e.target.value, { shouldDirty: true })}
                      className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white font-mono text-sm"
                      placeholder="#c9a655"
                    />
                  </div>
                )}

                {field.type === "toggle" && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {watch(field.key) ? "Ativo" : "Inativo"}
                      </p>
                      <p className="text-xs text-gray-400">{field.label}</p>
                    </div>
                    <Switch
                      checked={!!watch(field.key)}
                      onCheckedChange={(v) => setValue(field.key, v, { shouldDirty: true })}
                    />
                  </div>
                )}

                {field.type === "select" && (
                  <select
                    {...register(field.key)}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white"
                  >
                    <option value="">Selecione...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}

                {errors[field.key] && (
                  <p className="text-xs text-red-400">{String(errors[field.key]?.message ?? "")}</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="shrink-0 p-6 border-t border-[var(--color-border-subtle)]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-[#0f172a] font-black hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)" }}
            >
              Salvar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
