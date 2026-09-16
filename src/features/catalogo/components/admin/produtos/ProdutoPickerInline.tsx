import { useState } from "react"
import { Search, Plus, Trash2, Package } from "lucide-react"
import { CATALOGO_TIPO_LABEL } from "~/features/catalogo/types"
import type { ProductSheetTipo } from "~/features/catalogo/types"

export interface PickerItem {
  sku: string
  tipo: ProductSheetTipo
  nome: string
}

const TIPO_OPTIONS: ProductSheetTipo[] = ["implante", "abutment", "fresa", "chave", "acessorio", "instrumental", "componente", "kit"]

interface Props {
  produtosDisponiveis: PickerItem[]
  itensSelecionados: PickerItem[]
  onAdicionar: (item: PickerItem) => void
  onRemover: (sku: string, tipo: string) => void
}

/** Busca + filtro por tipo + lista de itens já adicionados a um pacote/kit. */
export function ProdutoPickerInline({ produtosDisponiveis, itensSelecionados, onAdicionar, onRemover }: Props) {
  const [buscaOpen, setBuscaOpen] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")

  const produtosFiltrados = produtosDisponiveis.filter((p) => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.sku.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo
    const jaAdicionado = itensSelecionados.some((i) => i.sku === p.sku && i.tipo === p.tipo)
    return matchBusca && matchTipo && !jaAdicionado
  })

  function adicionar(item: PickerItem) {
    onAdicionar(item)
    setBuscaOpen(false)
    setBusca("")
  }

  return (
    <div className="rounded-xl bg-[var(--color-surface)] border border-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-accent)]">Itens do Pacote</h3>
        <button
          onClick={() => setBuscaOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-accent-fg)] transition-colors"
          style={{ background: "linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-mid))" }}
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </div>

      {itensSelecionados.length === 0 && !buscaOpen && (
        <p className="text-xs text-gray-500 italic">Nenhum item adicionado. Clique em "Adicionar" para incluir produtos.</p>
      )}

      {buscaOpen && (
        <div className="space-y-2 border border-[var(--color-accent)]/20 rounded-lg p-3 bg-[var(--color-background)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou SKU..."
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-3 pl-9 text-white placeholder-gray-500 text-sm"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setFiltroTipo("todos")} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filtroTipo === "todos" ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]" : "bg-white/5 text-gray-400 hover:text-white"}`}>Todos</button>
            {TIPO_OPTIONS.map((t) => (
              <button key={t} onClick={() => setFiltroTipo(t)} className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filtroTipo === t ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]" : "bg-white/5 text-gray-400 hover:text-white"}`}>
                {CATALOGO_TIPO_LABEL[t]}
              </button>
            ))}
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10">
            {produtosFiltrados.length === 0 ? (
              <p className="p-3 text-sm text-gray-400 text-center">Nenhum produto encontrado</p>
            ) : (
              produtosFiltrados.slice(0, 50).map((p) => (
                <button
                  key={`${p.tipo}_${p.sku}`}
                  onClick={() => adicionar(p)}
                  className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                >
                  <p className="text-sm font-medium text-white truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400">{p.sku} · {CATALOGO_TIPO_LABEL[p.tipo]}</p>
                </button>
              ))
            )}
          </div>
          <button onClick={() => { setBuscaOpen(false); setBusca("") }} className="text-xs text-gray-400 hover:text-white transition-colors">Cancelar</button>
        </div>
      )}

      {itensSelecionados.map((item) => (
        <div key={`${item.tipo}_${item.sku}`} className="flex items-center gap-3 bg-[var(--color-background)] rounded-lg p-3 border border-white/5">
          <Package className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{item.nome}</p>
            <p className="text-xs text-gray-400">{item.sku} · {CATALOGO_TIPO_LABEL[item.tipo]}</p>
          </div>
          <button onClick={() => onRemover(item.sku, item.tipo)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
