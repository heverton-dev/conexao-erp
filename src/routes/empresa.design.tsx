import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { useState, useEffect } from "react";
import { Palette, Save, Loader2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import {
  useDesignGlobalQuery,
  useDesignEmpresaQuery,
} from "~/design-system/services/design-system.queries";
import { saveDesignEmpresa } from "~/design-system/services/design-system.service";
import {
  resolveTokens,
  PRESETS,
  DEFAULT_PRESET,
} from "~/design-system/tokens/resolver";
import { tokensToCssVars } from "~/design-system/tokens/css-var-map";
import type { PresetKey, DesignTokens } from "~/design-system/tokens/types";
import { useQueryClient } from "@tanstack/react-query";
import { RequirePermission } from "~/components/guards";

export const empresaDesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/design",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <EmpresaDesignPage />
    </RequirePermission>
  ),
});

const PRESET_OPTIONS: { key: PresetKey; label: string; accent: string }[] = [
  { key: "dark-gold", label: "Dark Gold", accent: "#c9a655" },
  { key: "dark-blue", label: "Dark Blue", accent: "#3b82f6" },
  { key: "light-clean", label: "Light Clean", accent: "#6366f1" },
  { key: "dark-emerald", label: "Dark Emerald", accent: "#10b981" },
];

function EmpresaDesignPage() {
  const { profile, empresa } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isSuper = profile?.is_super_admin;
  const empresaId = empresa?.id;

  if (!isSuper && !empresaId) {
    void navigate({ to: "/cadastros/dashboard" });
    return null;
  }

  const { data: globalConfig } = useDesignGlobalQuery();
  const { data: empConfig, isLoading } = useDesignEmpresaQuery(empresaId);

  const [presetKey, setPresetKey] = useState<PresetKey | null>(null);
  const [override, setOverride] = useState<Partial<DesignTokens>>({});
  const [versao, setVersao] = useState("1.0.0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (empConfig) {
      setPresetKey((empConfig.preset_key as PresetKey) ?? null);
      setOverride(empConfig.tokens_override ?? {});
      setVersao(empConfig.versao ?? "1.0.0");
    }
  }, [empConfig]);

  // Live preview
  useEffect(() => {
    const resolved = resolveTokens({
      presetKey:
        presetKey ?? (globalConfig?.preset_key as PresetKey) ?? DEFAULT_PRESET,
      globalOverride: globalConfig?.tokens_override ?? null,
      empresaOverride: override,
    });
    const cssVars = tokensToCssVars(resolved);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(cssVars)) root.style.setProperty(k, v);
  }, [presetKey, override, globalConfig]);

  async function handleSave() {
    if (!empresaId) return;
    setSaving(true);
    try {
      await saveDesignEmpresa({
        empresa_id: empresaId,
        preset_key: presetKey,
        tokens_override: override,
        versao,
      });
      await queryClient.invalidateQueries({
        queryKey: ["design-system-empresa", empresaId],
      });
      toast.success("Design da empresa salvo!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPresetKey(null);
    setOverride({});
    toast.success("Configurações resetadas para o global");
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

  const resolved = resolveTokens({
    presetKey:
      presetKey ?? (globalConfig?.preset_key as PresetKey) ?? DEFAULT_PRESET,
    globalOverride: globalConfig?.tokens_override ?? null,
    empresaOverride: override,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-main)] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Palette className="w-7 h-7 text-[var(--color-accent)]" />
          <div>
            <h1 className="text-2xl font-bold">
              Design System — {empresa?.nome ?? "Empresa"}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Override do tema global para esta empresa • v{versao}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-hover-bg)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Herdar do Global
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
            Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          {/* Preset override */}
          <section className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Preset
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              Deixe em "Herdar" para usar o preset global
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setPresetKey(null)}
                className={`w-full flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${presetKey === null ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]" : "border-[var(--color-border)] hover:bg-[var(--color-hover-bg)]"}`}
              >
                Herdar do Global
              </button>
              {PRESET_OPTIONS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPresetKey(p.key)}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${presetKey === p.key ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]" : "border-[var(--color-border)] hover:bg-[var(--color-hover-bg)]"}`}
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

          {/* Cores override */}
          <section className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Cores (Override)
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Accent",
                  path: "colors.accent",
                  current: resolved.colors.accent,
                },
                {
                  label: "Accent Hover",
                  path: "colors.accentHover",
                  current: resolved.colors.accentHover,
                },
                {
                  label: "Fundo",
                  path: "colors.bg",
                  current: resolved.colors.bg,
                },
                {
                  label: "Surface",
                  path: "colors.surface",
                  current: resolved.colors.surface,
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
        </div>

        {/* Preview */}
        <div className="xl:col-span-2">
          <div
            className="rounded-xl border border-[var(--color-border)] overflow-hidden"
            style={{
              background: resolved.colors.bg,
              color: resolved.colors.textMain,
              fontFamily: resolved.typography.fontFamily,
            }}
          >
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <h3
                className="text-sm font-semibold"
                style={{ color: resolved.colors.textMuted }}
              >
                Preview — {empresa?.nome}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <button
                  style={{
                    background: resolved.colors.accent,
                    color: resolved.colors.accentFg,
                    borderRadius: resolved.components.button.borderRadius,
                    padding: `${resolved.components.button.paddingY} ${resolved.components.button.paddingX}`,
                    fontSize: resolved.components.button.fontSize,
                  }}
                  className="font-medium"
                >
                  Primário
                </button>
                <button
                  style={{
                    background: resolved.colors.secondary,
                    color: resolved.colors.secondaryForeground,
                    borderRadius: resolved.components.button.borderRadius,
                    padding: `${resolved.components.button.paddingY} ${resolved.components.button.paddingX}`,
                    fontSize: resolved.components.button.fontSize,
                  }}
                  className="font-medium"
                >
                  Secundário
                </button>
              </div>
              <div
                style={{
                  background: resolved.colors.card,
                  borderRadius: resolved.components.card.borderRadius,
                  padding: resolved.components.card.padding,
                  border: `1px solid ${resolved.colors.border}`,
                }}
              >
                <h4
                  className="font-semibold mb-1"
                  style={{ color: resolved.colors.textMain }}
                >
                  Card de Exemplo
                </h4>
                <p
                  className="text-sm"
                  style={{ color: resolved.colors.textMuted }}
                >
                  Preview do tema da empresa em tempo real.
                </p>
              </div>
              <div
                className="h-8 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${resolved.colors.gradientStart}, ${resolved.colors.gradientMid}, ${resolved.colors.gradientEnd})`,
                  borderRadius: resolved.borders.radiusLg,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
