import { useState, useEffect } from "react";
import { useAuth } from "~/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { Palette, Save, Loader2, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDesignGlobalQuery,
  useDesignEmpresaQuery,
  useDesignModuloQuery,
} from "../services/design-system.queries";
import { saveDesignModulo } from "../services/design-system.service";
import { resolveTokens, DEFAULT_PRESET } from "../tokens/resolver";
import { tokensToCssVars } from "../tokens/css-var-map";
import type { PresetKey, DesignTokens } from "../tokens/types";

interface Props {
  moduloKey: string;
  moduloNome: string;
}

/**
 * Componente reutilizável de página de design por módulo.
 * Utilizado por todas as rotas /<modulo>/design
 */
export function ModuloDesignPage({ moduloKey, moduloNome }: Props) {
  const { profile, empresa } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const empresaId = empresa?.id;

  if (!profile?.is_super_admin && !empresaId) {
    void navigate({ to: "/cadastros/dashboard" });
    return null;
  }

  const { data: global } = useDesignGlobalQuery();
  const { data: emp } = useDesignEmpresaQuery(empresaId);
  const { data: mod, isLoading } = useDesignModuloQuery(empresaId, moduloKey);

  const [override, setOverride] = useState<Partial<DesignTokens>>({});
  const [versao, setVersao] = useState("1.0.0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mod) {
      setOverride(mod.tokens_override ?? {});
      setVersao(mod.versao ?? "1.0.0");
    }
  }, [mod]);

  // Live preview
  useEffect(() => {
    const resolved = resolveTokens({
      presetKey: (emp?.preset_key ??
        global?.preset_key ??
        DEFAULT_PRESET) as PresetKey,
      globalOverride: global?.tokens_override ?? null,
      empresaOverride: emp?.tokens_override ?? null,
      moduloOverride: override,
    });
    const cssVars = tokensToCssVars(resolved);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(cssVars)) root.style.setProperty(k, v);
  }, [override, global, emp]);

  async function handleSave() {
    if (!empresaId) return;
    setSaving(true);
    try {
      await saveDesignModulo({
        empresa_id: empresaId,
        modulo_key: moduloKey,
        tokens_override: override,
        versao,
      });
      await queryClient.invalidateQueries({
        queryKey: ["design-system-modulo", empresaId, moduloKey],
      });
      toast.success(`Design do módulo ${moduloNome} salvo!`);
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function updateToken(path: string, value: string) {
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
    presetKey: (emp?.preset_key ??
      global?.preset_key ??
      DEFAULT_PRESET) as PresetKey,
    globalOverride: global?.tokens_override ?? null,
    empresaOverride: emp?.tokens_override ?? null,
    moduloOverride: override,
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
            <h1 className="text-2xl font-bold">Design — {moduloNome}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Override de tema para este módulo • v{versao}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOverride({})}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-hover-bg)] transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Herdar da Empresa
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
          <section className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              Cores do Módulo
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Accent",
                  path: "colors.accent",
                  current: resolved.colors.accent,
                },
                {
                  label: "Surface",
                  path: "colors.surface",
                  current: resolved.colors.surface,
                },
                {
                  label: "Background",
                  path: "colors.bg",
                  current: resolved.colors.bg,
                },
                {
                  label: "Border",
                  path: "colors.border",
                  current: resolved.colors.border,
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
                      onChange={(e) => updateToken(path, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-[var(--color-border)] bg-transparent"
                    />
                    <input
                      type="text"
                      value={current}
                      onChange={(e) => updateToken(path, e.target.value)}
                      className="w-24 text-xs font-mono bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded px-2 py-1 text-[var(--color-text-main)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="xl:col-span-2">
          <div
            className="rounded-xl border border-[var(--color-border)] overflow-hidden"
            style={{
              background: resolved.colors.bg,
              fontFamily: resolved.typography.fontFamily,
            }}
          >
            <div
              className="p-4 border-b border-[var(--color-border)]"
              style={{ background: resolved.colors.surface }}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: resolved.colors.textMuted }}
              >
                Preview — Módulo {moduloNome}
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
                  }}
                  className="text-sm font-medium"
                >
                  Ação Principal
                </button>
                <button
                  style={{
                    background: "transparent",
                    color: resolved.colors.accent,
                    border: `1px solid ${resolved.colors.accent}`,
                    borderRadius: resolved.components.button.borderRadius,
                    padding: `${resolved.components.button.paddingY} ${resolved.components.button.paddingX}`,
                  }}
                  className="text-sm font-medium"
                >
                  Secundário
                </button>
              </div>
              <div
                style={{
                  background: resolved.colors.card,
                  border: `1px solid ${resolved.colors.border}`,
                  borderRadius: resolved.components.card.borderRadius,
                  padding: resolved.components.card.padding,
                }}
              >
                <p
                  className="font-semibold mb-1"
                  style={{ color: resolved.colors.textMain }}
                >
                  Módulo {moduloNome}
                </p>
                <p
                  className="text-sm"
                  style={{ color: resolved.colors.textMuted }}
                >
                  Preview com tokens do módulo aplicados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
