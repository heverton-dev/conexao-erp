import type { CatalogoDesignConfig } from "../../services/design.service"
import { StoreMiniatura } from "./StoreMiniatura"

interface PhoneMockupProps {
  config: CatalogoDesignConfig
}

export function PhoneMockup({ config }: PhoneMockupProps) {
  return (
    <div className="relative">
      {/* Brilho atrás do celular */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-3xl scale-110" />

      {/* Celular */}
      <div className="relative bg-zinc-900 rounded-[40px] p-3 shadow-2xl border border-zinc-700/50">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10" />

        {/* Tela */}
        <div
          className="w-[320px] h-[580px] rounded-[28px] overflow-hidden relative"
          style={{ backgroundColor: config.colors.bg }}
        >
          {/* Status bar fake */}
          <div className="h-10 bg-transparent flex items-end justify-between px-6 pb-1 relative z-20">
            <span className="text-[10px] text-white/60 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2.5 border border-white/40 rounded-sm relative">
                <div
                  className="absolute inset-0.5 bg-white/60 rounded-[1px]"
                  style={{ width: "70%" }}
                />
              </div>
            </div>
          </div>

          {/* Miniatura da loja */}
          <div className="absolute inset-0 top-10 overflow-y-auto">
            <StoreMiniatura config={config} />
          </div>
        </div>
      </div>
    </div>
  )
}
