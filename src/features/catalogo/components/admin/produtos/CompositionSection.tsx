import { useState } from "react"
import { Trash2 } from "lucide-react"

interface Option {
  id: string
  label: string
}

interface Props {
  label: string
  selectedIds: string[]
  options: Option[]
  placeholder: string
  onChange: (ids: string[]) => void
}

export function CompositionSection({ label, selectedIds, options, placeholder, onChange }: Props) {
  const [selected, setSelected] = useState("")
  function handleAdd() { if (selected && !selectedIds.includes(selected)) { onChange([...selectedIds, selected]); setSelected("") } }
  function handleRemove(id: string) { onChange(selectedIds.filter((s) => s !== id)) }
  const selectedLabels = selectedIds.map((id) => { const found = options.find((o) => o.id === id); return { id, label: found?.label ?? id } })
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--color-surface)]/50 p-4 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
      <div className="flex gap-3">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#c9a655]/50 transition-colors">
          <option value="">{placeholder}</option>
          {options.filter((o) => !selectedIds.includes(o.id)).map((o) => (<option key={o.id} value={o.id}>{o.label}</option>))}
        </select>
        <button type="button" onClick={handleAdd} disabled={!selected} className="px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider text-[#0f172a] bg-gradient-to-r from-[#c9a655] to-[#e8d48b] hover:from-[#e8d48b] hover:to-[#c9a655] transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">Adicionar</button>
      </div>
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedLabels.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9a655]/10 border border-[#c9a655]/20 text-xs font-medium text-[#c9a655]">
              {item.label}
              <button type="button" onClick={() => handleRemove(item.id)} className="ml-0.5 text-[#c9a655]/50 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
