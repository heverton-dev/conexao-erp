
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useState, useEffect } from "react"

export const catalogoAdminCoresRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/cores",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_design"]}>
      <AdminCoresPage />
    </RequirePermission>
  ),
})

const PRESETS = [
  { name: "Dark Gold", accent: "#c9a655", accentFg: "#0f172a", secondary: "#1e293b", bg: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8" },
  { name: "Cobalto", accent: "#3b82f6", accentFg: "#ffffff", secondary: "#1e293b", bg: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8" },
  { name: "Esmeralda", accent: "#10b981", accentFg: "#ffffff", secondary: "#1e293b", bg: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8" },
  { name: "Rubi", accent: "#ef4444", accentFg: "#ffffff", secondary: "#1e293b", bg: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8" },
  { name: "Grafite", accent: "#6b7280", accentFg: "#ffffff", secondary: "#1f2937", bg: "#111827", text: "#f9fafb", textMuted: "#9ca3af" },
  { name: "Light", accent: "#c9a655", accentFg: "#0f172a", secondary: "#ffffff", bg: "#f8fafc", text: "#0f172a", textMuted: "#64748b" },
]

function AdminCoresPage() {
  const [activePreset, setActivePreset] = useState("Dark Gold")
  const [colors, setColors] = useState(PRESETS[0])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--color-accent", colors.accent)
    root.style.setProperty("--color-accent-fg", colors.accentFg)
    root.style.setProperty("--color-surface", colors.secondary)
    root.style.setProperty("--color-bg", colors.bg)
    root.style.setProperty("--color-text-main", colors.text)
    root.style.setProperty("--color-text-muted", colors.textMuted)
  }, [colors])

  function applyPreset(preset: typeof PRESETS[0]) {
    setActivePreset(preset.name)
    setColors(preset)
  }

  function handleReset() {
    applyPreset(PRESETS[0])
  }

  const inputStyle = {
    background: "var(--color-input-bg, #0f172a)",
    border: "1px solid var(--color-input-border, #334155)",
    color: "var(--color-text-main, #f8fafc)",
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Configuração de Cores</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted, #94a3b8)" }}>
            Personalize a identidade visual. Mudanças são aplicadas em tempo real em toda a plataforma.
          </p>
        </div>

        {/* Paletas prontas */}
        <div className="space-y-3">
          <h3 className="font-semibold">Paletas prontas</h3>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border"
                style={{
                  background: activePreset === p.name ? "rgba(201,166,85,0.15)" : "var(--color-surface, #1e293b)",
                  borderColor: activePreset === p.name ? "#c9a655" : "rgba(201,166,85,0.15)",
                  color: activePreset === p.name ? "#c9a655" : "var(--color-text-muted, #94a3b8)",
                }}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: p.accent }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ajuste fino */}
        <div className="space-y-4">
          <h3 className="font-semibold">Ajuste fino</h3>
          {[
            { key: "accent", label: "Cor Principal", desc: "Botões, links, destaques" },
            { key: "accentFg", label: "Texto sobre Principal", desc: "Contraste em botões dourados" },
            { key: "secondary", label: "Cor Secundária", desc: "Superfícies, cards, bordas sutis" },
            { key: "bg", label: "Fundo", desc: "Cor base da aplicação" },
            { key: "text", label: "Texto Principal", desc: "Títulos e corpo" },
            { key: "textMuted", label: "Texto Suave", desc: "Legendas e descrições" },
          ].map((field) => (
            <div key={field.key} className="flex items-center gap-4">
              <input
                type="color"
                value={colors[field.key as keyof typeof colors] as string}
                onChange={(e) => setColors({ ...colors, [field.key]: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{field.label}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted, #94a3b8)" }}>{field.desc}</p>
              </div>
              <input
                type="text"
                value={colors[field.key as keyof typeof colors] as string}
                onChange={(e) => setColors({ ...colors, [field.key]: e.target.value })}
                className="w-24 px-2 py-1 rounded text-xs font-mono text-center"
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <h3 className="font-semibold">Pré-visualização</h3>
          <div className="rounded-xl border p-6 space-y-3" style={{ background: colors.secondary, borderColor: "rgba(201,166,85,0.15)" }}>
            <h4 className="text-xl font-bold" style={{ color: colors.text }}>Título de exemplo</h4>
            <p className="text-sm" style={{ color: colors.textMuted }}>Texto descritivo suave para demonstrar hierarquia visual.</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: colors.accent, color: colors.accentFg }}>
                Botão Principal
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.textMuted}` }}>
                Secundário
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: colors.accent, color: colors.accentFg }}>Badge</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--color-surface, #1e293b)", color: "var(--color-text-muted, #94a3b8)" }}
        >
          Restaurar padrão
        </button>
      </div>
    </AdminLayout>
  )
}
