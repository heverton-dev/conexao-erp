import {
  Network, CircleDot, Component, Package, Bolt, CircleDashed, Wrench, Disc,
  PlusSquare, SlidersHorizontal, Boxes, Bone, Layers, GitBranch, ListOrdered, Tag,
} from "lucide-react"
import type { ImportType } from "../../types"
import { IMPORT_FIELD_CONFIGS, IMPORT_TYPES } from "../../constants"

interface StepSelectTypeProps {
  selectedType: ImportType | null
  onSelect: (type: ImportType) => void
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Network: <Network size={20} />,
  CircleDot: <CircleDot size={20} />,
  Component: <Component size={20} />,
  Package: <Package size={20} />,
  Bolt: <Bolt size={20} />,
  CircleDashed: <CircleDashed size={20} />,
  Wrench: <Wrench size={20} />,
  Disc: <Disc size={20} />,
  PlusSquare: <PlusSquare size={20} />,
  SlidersHorizontal: <SlidersHorizontal size={20} />,
  Boxes: <Boxes size={20} />,
  Bone: <Bone size={20} />,
  Layers: <Layers size={20} />,
  GitBranch: <GitBranch size={20} />,
  ListOrdered: <ListOrdered size={20} />,
  Tag: <Tag size={20} />,
}

export function StepSelectType({ selectedType, onSelect }: StepSelectTypeProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Selecione o tipo de dados que deseja importar:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {IMPORT_TYPES.map((type) => {
          const config = IMPORT_FIELD_CONFIGS[type]
          const isSelected = selectedType === type

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className={`${isSelected ? "text-amber-400" : "text-white/40"}`}>
                {ICON_MAP[config.icon]}
              </div>
              <span className="text-sm font-medium">{config.label}</span>
              {config.dependencies.length > 0 && (
                <span className="text-[10px] text-white/30">
                  Requer: {config.dependencies.join(", ")}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
