import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { useState, useEffect } from "react";
import { Palette, Save, Loader2, RotateCcw, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useDesignGlobalQuery } from "~/design-system/services/design-system.queries";
import { saveDesignGlobal } from "~/design-system/services/design-system.service";
import {
  resolveTokens,
  PRESETS,
  DEFAULT_PRESET,
} from "~/design-system/tokens/resolver";
import { tokensToCssVars } from "~/design-system/tokens/css-var-map";
import type { PresetKey } from "~/design-system/tokens/types";
import type { DesignTokens } from "~/design-system/tokens/types";
import { useQueryClient } from "@tanstack/react-query";
import { RequireSuperAdmin } from "~/components/guards";

export const globalDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/design",
  component: () => (
    <RequireSuperAdmin>
      <GlobalDesignPage />
    </RequireSuperAdmin>
  ),
});

const PRESET_OPTIONS: { key: PresetKey; label: string; accent: string }[] = [
  { key: "dark-gold", label: "Dark Gold", accent: "#c9a655" },
  { key: "dark-blue", label: "Dark Blue", accent: "#3b82f6" },
  { key: "light-clean", label: "Light Clean", accent: "#6366f1" },
  { key: "dark-emerald", label: "Dark Emerald", accent: "#10b981" },
];

function GlobalDesignPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!profile?.is_super_admin) {
    void navigate({ to: "/cadastros/dashboard" });
    return null;
  }

  const { data: globalConfig, isLoading } = useDesignGlobalQuery();
  const [presetKey, setPresetKey] = useState<PresetKey>(DEFAULT_PRESET);
  const [override, setOverride] = useState<Partial<DesignTokens>>({});
  const [versao, setVersao] = useState("1.0.0");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    if (globalConfig) {
      setPresetKey((globalConfig.preset_key as PresetKey) ?? DEFAULT_PRESET);
      setOverride(globalConfig.tokens_override ?? {});
      setVersao(globalConfig.versao ?? "1.0.0");
    }
  }, [globalConfig]);

  // Live preview: aplica tokens na página em tempo real
  useEffect(() => {
    if (!preview) return;
    const resolved = resolveTokens({ presetKey, globalOverride: override });
    const cssVars = tokensToCssVars(resolved);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(cssVars)) {
      root.style.setProperty(k, v);
    }
  }, [presetKey, override, preview]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveDesignGlobal({
        preset_key: presetKey,
        tokens_override: override,
        versao,
      });
      await queryClient.invalidateQueries({
        queryKey: ["design-system-global"],
      });
      toast.success("Design System global salvo!");
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPresetKey(DEFAULT_PRESET);
    setOverride({});
    setVersao("1.0.0");
    toast.success("Configurações restauradas ao padrão");
  }

  function updateColor(path: string, value: string) {
    const keys = path.split(".");
    setOverride((prev) => {
      const next = { ...prev } as Record<string, unknown>;
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]] || typeof cur[keys[i]] !== "object")
          cur[keys[i]] = {};
        cur = cur[keys[i]] as Record<string, unknown>;
      }
      cur[keys[keys.length - 1]] = value;
      return next as Partial<DesignTokens>;
    });
  }

  const resolved = resolveTokens({ presetKey, globalOverride: override });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-main)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Palette className="w-7 h-7 text-[var(--color-accent)]" />
          <div>
            <h1 className="text-2xl font-bold">Design System Global</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Configure o tema base de toda a plataforma • v{versao}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-hover-bg)] transition-colors"
          >
            {preview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {preview ? "Desativar" : "Ativar"} Preview
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-hover-bg)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Publicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Painel de edição */}
        <div className="xl:col-span-1 space-y-6">
          {/* Seletor de preset */}
          <section className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Preset Base
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_OPTIONS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPresetKey(p.key)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                    presetKey === p.key
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                      : "border-[var(--color-border)] hover:bg-[var(--color-hover-bg)]"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ background: p.accent }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* Editor de cores principais */}
          <section className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Cores Principais
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Accent (Principal)",
                  path: "colors.accent",
                  current: resolved.colors.accent,
                },
                {
                  label: "Accent Hover",
                  path: "colors.accentHover",
                  current: resolved.colors.accentHover,
                },
                {
                  label: "Fundo Geral",
                  path: "colors.bg",
                  current: resolved.colors.bg,
                },
                {
                  label: "Surface",
                  path: "colors.surface",
                  current: resolved.colors.surface,
                },
                {
                  label: "Texto Principal",
                  path: "colors.textMain",
                  current: resolved.colors.textMain,
                },
                {
                  label: "Texto Muted",
                  path: "colors.textMuted",
                  current: resolved.colors.textMuted,
                },
                {
                  label: "Borda",
                  path: "colors.border",
                  current: resolved.colors.border,
                },
                {
                  label: "Sucesso",
                  path: "colors.success",
                  current: resolved.colors.success,
                },
                {
                  label: "Erro",
                  path: "colors.error",
                  current: resolved.colors.error,
                },
                {
                  label: "Aviso",
                  path: "colors.warning",
                  current: resolved.colors.warning,
                },
              ].map(({ label, path, current }) => (
                <div
                  key={path}
                  className="flex items-center justify-between gap-3"
                >
                  <label className="text-sm text-[var(--color-text-secondary)] flex-1">
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={current}
                      onChange={(e) => updateColor(path, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-[var(--color-border)] bg-transparent"
                    />
                    <input
                      type="text"
                      value={current}
                      onChange={(e) => updateColor(path, e.target.value)}
                      className="w-24 text-xs font-mono bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded px-2 py-1 text-[var(--color-text-main)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tipografia */}
          <section className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Tipografia
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-[var(--color-text-secondary)]">
                  Font Family
                </label>
                <input
                  type="text"
                  value={resolved.typography.fontFamily}
                  onChange={(e) =>
                    updateColor("typography.fontFamily", e.target.value)
                  }
                  className="w-full mt-1 text-xs bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded px-2 py-1.5 text-[var(--color-text-main)]"
                />
              </div>
            </div>
          </section>

          {/* Border Radius */}
          <section className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Border Radius
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "SM",
                  path: "borders.radiusSm",
                  current: resolved.borders.radiusSm,
                },
                {
                  label: "MD",
                  path: "borders.radiusMd",
                  current: resolved.borders.radiusMd,
                },
                {
                  label: "LG",
                  path: "borders.radiusLg",
                  current: resolved.borders.radiusLg,
                },
                {
                  label: "XL",
                  path: "borders.radiusXl",
                  current: resolved.borders.radiusXl,
                },
              ].map(({ label, path, current }) => (
                <div
                  key={path}
                  className="flex items-center justify-between gap-3"
                >
                  <label className="text-sm text-[var(--color-text-secondary)]">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={current}
                    onChange={(e) => updateColor(path, e.target.value)}
                    className="w-24 text-xs font-mono bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded px-2 py-1 text-[var(--color-text-main)]"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Live Preview */}
        <div className="xl:col-span-2">
          <ComponentShowcase tokens={resolved} />
        </div>
      </div>
    </div>
  );
}

function ComponentShowcase({ tokens }: { tokens: DesignTokens }) {
  return (
    <div
      className="rounded-xl border border-[var(--color-border)] overflow-hidden"
      style={{
        background: tokens.colors.bg,
        color: tokens.colors.textMain,
        fontFamily: tokens.typography.fontFamily,
      }}
    >
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">
          Preview de Componentes
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Buttons */}
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
            Botões
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              style={{
                background: tokens.colors.accent,
                color: tokens.colors.accentFg,
                borderRadius: tokens.components.button.borderRadius,
                padding: `${tokens.components.button.paddingY} ${tokens.components.button.paddingX}`,
                fontSize: tokens.components.button.fontSize,
              }}
              className="font-medium transition-all hover:opacity-90"
            >
              Primário
            </button>
            <button
              style={{
                background: tokens.colors.secondary,
                color: tokens.colors.secondaryForeground,
                borderRadius: tokens.components.button.borderRadius,
                padding: `${tokens.components.button.paddingY} ${tokens.components.button.paddingX}`,
                fontSize: tokens.components.button.fontSize,
              }}
              className="font-medium transition-all hover:opacity-90"
            >
              Secundário
            </button>
            <button
              style={{
                background: "transparent",
                color: tokens.colors.accent,
                border: `1px solid ${tokens.colors.accent}`,
                borderRadius: tokens.components.button.borderRadius,
                padding: `${tokens.components.button.paddingY} ${tokens.components.button.paddingX}`,
                fontSize: tokens.components.button.fontSize,
              }}
              className="font-medium transition-all hover:opacity-90"
            >
              Outline
            </button>
            <button
              style={{
                background: tokens.colors.error,
                color: "#ffffff",
                borderRadius: tokens.components.button.borderRadius,
                padding: `${tokens.components.button.paddingY} ${tokens.components.button.paddingX}`,
                fontSize: tokens.components.button.fontSize,
              }}
              className="font-medium transition-all hover:opacity-90"
            >
              Destrutivo
            </button>
          </div>
        </div>

        {/* Card */}
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
            Card
          </p>
          <div
            style={{
              background: tokens.colors.card,
              borderRadius: tokens.components.card.borderRadius,
              padding: tokens.components.card.padding,
              border: `1px solid ${tokens.colors.border}`,
              boxShadow: tokens.components.card.shadow,
            }}
          >
            <h4
              className="font-semibold mb-1"
              style={{ color: tokens.colors.textMain }}
            >
              Título do Card
            </h4>
            <p className="text-sm" style={{ color: tokens.colors.textMuted }}>
              Descrição de exemplo com o tema atual aplicado em tempo real.
            </p>
            <div className="mt-3 flex gap-2">
              <span
                style={{
                  background: tokens.colors.accentMuted,
                  color: tokens.colors.accent,
                  borderRadius: tokens.components.badge.borderRadius,
                  padding: `${tokens.components.badge.paddingY} ${tokens.components.badge.paddingX}`,
                  fontSize: tokens.components.badge.fontSize,
                }}
                className="font-medium"
              >
                Badge
              </span>
              <span
                style={{
                  background: tokens.colors.successBg,
                  color: tokens.colors.success,
                  borderRadius: tokens.components.badge.borderRadius,
                  padding: `${tokens.components.badge.paddingY} ${tokens.components.badge.paddingX}`,
                  fontSize: tokens.components.badge.fontSize,
                }}
                className="font-medium"
              >
                Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Input */}
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
            Inputs
          </p>
          <div className="space-y-2">
            <input
              placeholder="Campo de texto"
              style={{
                background: tokens.colors.inputBg,
                borderColor: tokens.colors.inputBorder,
                borderRadius: tokens.components.input.borderRadius,
                padding: `${tokens.components.input.paddingY} ${tokens.components.input.paddingX}`,
                fontSize: tokens.components.input.fontSize,
                color: tokens.colors.textMain,
              }}
              className="w-full border outline-none focus:border-[var(--color-input-focus)]"
            />
          </div>
        </div>

        {/* Paleta de cores */}
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
            Paleta
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "bg", color: tokens.colors.bg },
              { label: "surface", color: tokens.colors.surface },
              { label: "accent", color: tokens.colors.accent },
              { label: "text", color: tokens.colors.textMain },
              { label: "muted", color: tokens.colors.textMuted },
              { label: "border", color: tokens.colors.border },
              { label: "success", color: tokens.colors.success },
              { label: "error", color: tokens.colors.error },
              { label: "warning", color: tokens.colors.warning },
              { label: "info", color: tokens.colors.info },
            ].map(({ label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{
                    background: color,
                    borderColor: tokens.colors.border,
                  }}
                />
                <span
                  className="text-xs"
                  style={{ color: tokens.colors.textMuted }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradiente */}
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
            Gradiente
          </p>
          <div
            className="h-12 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${tokens.colors.gradientStart} 0%, ${tokens.colors.gradientMid} 40%, ${tokens.colors.gradientEnd} 100%)`,
              borderRadius: tokens.borders.radiusLg,
            }}
          />
        </div>
      </div>
    </div>
  );
}
