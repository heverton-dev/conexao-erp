import { useState } from "react"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"

interface CompositionItem {
  id: string
  label: string
  visivel: boolean
}

interface Option {
  id: string
  label: string
}

interface Props {
  label: string
  selectedItems: CompositionItem[]
  options: Option[]
  placeholder?: string
  onChange: (items: CompositionItem[]) => void
}

export function CompositionSectionWithToggle({ label, selectedItems, options, placeholder = "Selecione...", onChange }: Props) {
  const [selectedId, setSelectedId] = useState("")

  function addItem() {
    if (!selectedId) return
    const opt = options.find(o => o.id === selectedId)
    if (!opt) return
    if (selectedItems.some(i => i.id === opt.id)) return
    onChange([...selectedItems, { id: opt.id, label: opt.label, visivel: true }])
    setSelectedId("")
  }

  function removeItem(id: string) {
    onChange(selectedItems.filter(i => i.id !== id))
  }

  function toggleVisivel(id: string) {
    onChange(selectedItems.map(i => i.id === id ? { ...i, visivel: !i.visivel } : i))
  }

  const availableOptions = options.filter(o => !selectedItems.some(i => i.id === o.id))

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label>
      <div className="flex gap-2">
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 text-white text-sm">
          <option value="">{placeholder}</option>
          {availableOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <button type="button" onClick={addItem} disabled={!selectedId} className="px-4 py-2 rounded-lg text-sm font-bold bg-[#c9a655] text-[#0f172a] hover:bg-[#e8d48b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">ADICIONAR</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map(item => (
          <span key={item.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${item.visivel ? "bg-[#c9a655]/10 border-[#c9a655]/30 text-[#c9a655]" : "bg-white/5 border-white/10 text-gray-500"}`}>
            {item.label}
            <button type="button" onClick={() => toggleVisivel(item.id)} className="hover:opacity-80" title={item.visivel ? "Ocultar" : "Mostrar"}>
              {item.visivel ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
            <button type="button" onClick={() => removeItem(item.id)} className="hover:text-red-400" title="Remover">
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
        {selectedItems.length === 0 && <span className="text-xs text-gray-500">Nenhum item adicionado</span>}
      </div>
    </div>
  )
}
