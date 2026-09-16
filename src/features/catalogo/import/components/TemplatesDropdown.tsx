import { useState } from "react"
import { Download, ChevronDown, Files, Globe } from "lucide-react"
import { generateTemplateXLSX, generateGlobalTemplateXLSX } from "../engine/parser"
import { IMPORT_FIELD_CONFIGS, IMPORT_TYPES } from "../constants"
import type { ImportType } from "../types"

interface TemplatesDropdownProps {
  /** Restringe os templates individuais listados (padrão: todos). */
  types?: ImportType[]
}

export function TemplatesDropdown({ types = IMPORT_TYPES }: TemplatesDropdownProps) {
  const [open, setOpen] = useState(false)

  const downloadAll = () => {
    types.forEach((type) => {
      setTimeout(() => generateTemplateXLSX(type), 50)
    })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
      >
        <Download size={14} />
        Templates
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-[#0f172a] border border-white/10 rounded-lg shadow-xl z-50 py-1">
          <p className="px-3 py-1.5 text-[10px] text-white/30 uppercase tracking-wider">
            Baixar template:
          </p>
          {types.map((type) => {
            const config = IMPORT_FIELD_CONFIGS[type]
            return (
              <button
                key={type}
                onClick={() => {
                  generateTemplateXLSX(type)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Download size={11} className="text-white/30 shrink-0" />
                <span>{config.label}</span>
                <span className="ml-auto text-[10px] text-white/20">
                  {config.targetFields.length} campos
                </span>
              </button>
            )
          })}
          <div className="border-t border-white/10 mt-1 pt-1">
            <button
              onClick={downloadAll}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-left font-medium"
            >
              <Files size={11} className="shrink-0" />
              Baixar Todos (desta página)
              <span className="ml-auto text-[10px] text-white/20">
                {types.length}
              </span>
            </button>
            <button
              onClick={() => {
                generateGlobalTemplateXLSX()
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors text-left font-medium"
            >
              <Globe size={11} className="shrink-0" />
              Baixar Template Global
              <span className="ml-auto text-[10px] text-white/20">
                {IMPORT_TYPES.length} abas
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
