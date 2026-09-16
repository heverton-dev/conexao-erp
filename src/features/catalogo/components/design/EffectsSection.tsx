import type { CatalogoDesignEffects } from "../../services/design.service"

interface EffectsSectionProps {
  effects: CatalogoDesignEffects
  onChange: (effects: CatalogoDesignEffects) => void
}

export function EffectsSection({ effects, onChange }: EffectsSectionProps) {
  function handleSliderChange(key: keyof CatalogoDesignEffects, value: number) {
    onChange({ ...effects, [key]: value })
  }

  function handleToggle(key: keyof CatalogoDesignEffects) {
    onChange({ ...effects, [key]: !effects[key] })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Efeitos & Blobs</h3>
        <p className="text-xs text-text-muted">Controle os efeitos visuais da loja</p>
      </div>

      {/* Blobs */}
      <div className="p-4 rounded-xl bg-card border border-border-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-main">Blobs Animados</p>
            <p className="text-xs text-text-muted">Efeitos de luz difusa no fundo</p>
          </div>
          <button
            onClick={() => handleToggle("enableBlobs")}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              effects.enableBlobs ? "bg-accent" : "bg-input-border"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                effects.enableBlobs ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {effects.enableBlobs && (
          <>
            <div>
              <label className="text-xs text-text-muted font-medium block mb-2">Cor do Blob</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={effects.blobColor}
                  onChange={(e) => handleSliderChange("blobColor", e.target.value as any)}
                  className="w-10 h-10 rounded-lg border border-input-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={effects.blobColor}
                  onChange={(e) => handleSliderChange("blobColor", e.target.value as any)}
                  className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-text-muted font-medium">Opacidade</label>
                <span className="text-xs text-accent font-mono">{Math.round(effects.blobOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={effects.blobOpacity}
                onChange={(e) => handleSliderChange("blobOpacity", parseFloat(e.target.value))}
                className="w-full h-2 rounded-full bg-input-border appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-text-muted font-medium">Blur</label>
                <span className="text-xs text-accent font-mono">{effects.blobBlur}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={300}
                step={5}
                value={effects.blobBlur}
                onChange={(e) => handleSliderChange("blobBlur", parseInt(e.target.value))}
                className="w-full h-2 rounded-full bg-input-border appearance-none cursor-pointer accent-accent"
              />
            </div>
          </>
        )}
      </div>

      {/* Header Blur */}
      <div className="p-4 rounded-xl bg-card border border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-main">Blur do Header</p>
            <p className="text-xs text-text-muted">Efeito glassmorphism no cabeçalho</p>
          </div>
          <button
            onClick={() => handleToggle("headerBlur")}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              effects.headerBlur ? "bg-accent" : "bg-input-border"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                effects.headerBlur ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Grain Texture */}
      <div className="p-4 rounded-xl bg-card border border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-main">Textura Grain</p>
            <p className="text-xs text-text-muted">Efeito de grão sutil no fundo</p>
          </div>
          <button
            onClick={() => handleToggle("enableGrainTexture")}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              effects.enableGrainTexture ? "bg-accent" : "bg-input-border"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                effects.enableGrainTexture ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
