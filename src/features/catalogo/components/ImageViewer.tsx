import { X, ZoomIn } from "lucide-react"
import { useUIState, closeImageViewer } from "../services/ui.service"
import { useEffect, useState } from "react"

export function ImageViewer() {
  const { imageViewer } = useUIState()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!imageViewer.isOpen) {
      setScale(1) // reset on close
      document.body.style.overflow = "auto"
    } else {
      document.body.style.overflow = "hidden"
    }
    return () => { document.body.style.overflow = "auto" }
  }, [imageViewer.isOpen])

  if (!imageViewer.isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-xl transition-all duration-300">
      <div className="absolute top-4 right-4 z-10 flex gap-4">
        <button 
          onClick={() => setScale(s => s >= 2 ? 1 : s + 0.5)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-white"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button 
          onClick={closeImageViewer}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 overflow-auto touch-pan-x touch-pan-y"
        onClick={closeImageViewer}
      >
        <div 
          className="relative max-w-4xl max-h-[80vh] flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${scale})` }}
          onClick={(e) => e.stopPropagation()}
        >
          {imageViewer.src ? (
            <img 
              src={imageViewer.src} 
              alt={imageViewer.alt} 
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          ) : (
            <>
              <div className="w-64 h-64 md:w-96 md:h-96 rounded-full opacity-20 mix-blend-screen bg-[#c9a655]" />
              <div className="absolute inset-0 flex items-center justify-center text-[#c9a655] animate-pulse">
                <span className="text-sm font-bold uppercase tracking-widest">{imageViewer.alt}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
