import { useState } from "react"
import {
  Upload, ChevronDown, Network, CircleDot, Component, Package, Bolt, CircleDashed,
  Wrench, Disc, PlusSquare, SlidersHorizontal, Boxes, Bone, Layers, GitBranch,
  ListOrdered, Tag, Layers3,
} from "lucide-react"
import { ImportDialog } from "./ImportDialog"
import { IMPORT_FIELD_CONFIGS, IMPORT_TYPES } from "../constants"
import type { ImportType } from "../types"

const ICON_MAP: Record<string, React.ReactNode> = {
  Network: <Network size={13} />,
  CircleDot: <CircleDot size={13} />,
  Component: <Component size={13} />,
  Package: <Package size={13} />,
  Bolt: <Bolt size={13} />,
  CircleDashed: <CircleDashed size={13} />,
  Wrench: <Wrench size={13} />,
  Disc: <Disc size={13} />,
  PlusSquare: <PlusSquare size={13} />,
  SlidersHorizontal: <SlidersHorizontal size={13} />,
  Boxes: <Boxes size={13} />,
  Bone: <Bone size={13} />,
  Layers: <Layers size={13} />,
  GitBranch: <GitBranch size={13} />,
  ListOrdered: <ListOrdered size={13} />,
  Tag: <Tag size={13} />,
}

interface ImportTriggerProps {
  /** Restringe o dropdown de seleção rápida a estes tipos (padrão: todos). */
  types?: ImportType[]
}

export function ImportTrigger({ types = IMPORT_TYPES }: ImportTriggerProps) {
  const [open, setOpen] = useState(false)
  const [initialType, setInitialType] = useState<ImportType | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSelectType = (type: ImportType) => {
    setInitialType(type)
    setOpen(true)
    setDropdownOpen(false)
  }

  const handleSelectMultiple = () => {
    setInitialType(null)
    setOpen(true)
    setDropdownOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    setInitialType(null)
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
        >
          <Upload size={14} />
          Importar
          <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1 w-72 bg-[#0f172a] border border-white/10 rounded-lg shadow-xl z-50 py-1">
            <p className="px-3 py-1.5 text-[10px] text-white/30 uppercase tracking-wider">
              Importar tipo:
            </p>
            {types.map((type) => {
              const config = IMPORT_FIELD_CONFIGS[type]
              return (
                <button
                  key={type}
                  onClick={() => handleSelectType(type)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-white/30">{ICON_MAP[config.icon]}</span>
                  <span>{config.label}</span>
                  {config.dependencies.length > 0 && (
                    <span className="text-[10px] text-white/20 ml-auto">
                      requer {config.dependencies[0]}
                    </span>
                  )}
                </button>
              )
            })}
            <div className="border-t border-white/10 mt-1 pt-1">
              <button
                onClick={handleSelectMultiple}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-left font-medium"
              >
                <Layers3 size={13} className="shrink-0" />
                Importar Várias
                <span className="ml-auto text-[10px] text-white/20">
                  wizard completo
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ImportDialog
        open={open}
        onOpenChange={handleClose}
        initialType={initialType}
      />
    </>
  )
}
