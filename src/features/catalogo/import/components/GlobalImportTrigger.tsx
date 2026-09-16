import { useState } from "react"
import { Globe } from "lucide-react"
import { GlobalImportDialog } from "./GlobalImportDialog"

export function GlobalImportTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/10 transition-colors"
        title="Importar todas as tabelas do catálogo de uma vez, via 1 arquivo com várias abas"
      >
        <Globe size={14} />
        Importar Global
      </button>
      <GlobalImportDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
