import { useState } from "react"
import { Upload, X } from "lucide-react"
import type { CatalogoDesignImages } from "../../services/design.service"
import { supabase } from "~/lib/supabase"
import { EMPRESA_ID } from "~/config/empresa"

interface ImagesSectionProps {
  images: CatalogoDesignImages
  onChange: (images: CatalogoDesignImages) => void
}

const IMAGE_FIELDS: { key: keyof CatalogoDesignImages; label: string; description: string; hasOpacity?: boolean }[] = [
  { key: "logoUrl", label: "Logo da Loja", description: "Exibida no header da loja" },
  { key: "faviconUrl", label: "Favicon", description: "Ícone na aba do navegador" },
  { key: "heroBackgroundUrl", label: "Background do Hero", description: "Imagem de fundo da seção principal", hasOpacity: true },
  { key: "pageBackgroundUrl", label: "Background da Página", description: "Imagem de fundo de toda a loja" },
]

export function ImagesSection({ images, onChange }: ImagesSectionProps) {
  const [uploading, setUploading] = useState<string | null>(null)

  async function handleUpload(key: keyof CatalogoDesignImages, file: File) {
    setUploading(key)
    try {
      const ext = file.name.split(".").pop() || "png"
      // Usa um timestamp no nome do arquivo para garantir URL única no Supabase e bypass do CDN cache
      const fileName = `catalogo/${EMPRESA_ID}/${key}_${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName)
      const url = urlData?.publicUrl || ""

      onChange({ ...images, [key]: url })
    } catch (e) {
      console.error("Erro no upload:", e)
    } finally {
      setUploading(null)
    }
  }

  function handleRemove(key: keyof CatalogoDesignImages) {
    onChange({ ...images, [key]: "" })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Logos & Imagens</h3>
        <p className="text-xs text-text-muted">Faça upload de logos e imagens da loja</p>
      </div>

      <div className="space-y-3">
        {IMAGE_FIELDS.map(({ key, label, description, hasOpacity }) => (
          <div key={key} className="p-4 rounded-xl bg-card border border-border-subtle">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-text-main">{label}</p>
                <p className="text-xs text-text-muted">{description}</p>
              </div>
              {images[key] && (
                <button
                  onClick={() => handleRemove(key)}
                  className="p-1 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {images[key] ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-border-subtle bg-input-bg">
                  <img src={images[key] as string} alt={label} className="w-full h-24 object-contain p-2" />
                </div>
                {hasOpacity && (
                  <div>
                    <label className="text-[10px] text-text-muted flex justify-between mb-1">
                      <span>Opacidade do fundo</span>
                      <span>{Math.round((images.heroBackgroundOpacity ?? 0.1) * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={images.heroBackgroundOpacity ?? 0.1}
                      onChange={(e) => onChange({ ...images, heroBackgroundOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-input-border hover:border-accent/50 cursor-pointer transition-colors">
                <Upload size={20} className="text-text-muted mb-1" />
                <span className="text-xs text-text-muted">
                  {uploading === key ? "Enviando..." : "Clique para enviar"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(key, file)
                  }}
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
