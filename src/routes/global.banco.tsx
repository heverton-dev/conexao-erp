import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/core/supabase";
import {
  getAppConfig,
  updateAppConfig,
  type AppConfig,
} from "~/features/admin";
import { useState, useEffect } from "react";
import {
  Database,
  Loader2,
  Table,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { RequireSuperAdmin } from "~/components/guards";

export const adminSuperBancoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/banco",
  component: () => (
    <RequireSuperAdmin>
      <AdminSuperBanco />
    </RequireSuperAdmin>
  ),
});

function AdminSuperBanco() {
  const { profile } = useAuth();
  const [tabelas, setTabelas] = useState<{ nome: string; linhas: number }[]>(
    [],
  );
  const [loadingTabelas, setLoadingTabelas] = useState(true);

  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    if (profile?.is_super_admin) {
      carregarTabelas();
      carregarConfigs();
    }
  }, [profile]);

  async function carregarTabelas() {
    setLoadingTabelas(true);
    const { data: raw } = await supabase.rpc("get_table_info" as any);
    if ((raw as any[])?.[0]?.nome) {
      setTabelas((raw as any[]).sort((a, b) => b.linhas - a.linhas));
    } else {
      const { data: tables } = await supabase
        .from("information_schema.tables" as any)
        .select("table_name")
        .eq("table_schema", "public");
      if (tables) {
        const info = await Promise.all(
          (tables as any[]).map(async (t: any) => {
            const { count } = await supabase
              .from(t.table_name as any)
              .select("*", { count: "exact", head: true });
            return { nome: t.table_name, linhas: count ?? 0 };
          }),
        );
        setTabelas(info.sort((a, b) => b.linhas - a.linhas));
      }
    }
    setLoadingTabelas(false);
  }

  async function carregarConfigs() {
    setLoadingConfig(true);
    try {
      const data = await getAppConfig();
      setConfigs(data);
      const vals: Record<string, string> = {};
      data.forEach((c) => {
        vals[c.key] = c.value;
      });
      setEditValues(vals);
    } catch {
      toast.error("Erro ao carregar config");
    }
    setLoadingConfig(false);
  }

  async function salvar(key: string) {
    setSaving(key);
    try {
      await updateAppConfig(key, editValues[key]);
      toast.success(`${key} atualizado!`);
    } catch {
      toast.error("Erro ao salvar");
    }
    setSaving(null);
  }

  if (!profile?.is_super_admin) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-text-muted text-sm">
          Acesso restrito ao Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Database size={20} className="text-accent" />
        <div>
          <h1 className="text-lg font-bold text-text-main">Banco de Dados</h1>
          <p className="text-xs text-text-muted">
            Visão geral do banco e configurações de conexão Supabase
          </p>
        </div>
      </div>

      {/* Status Conexão */}
      <div className="rounded-xl bg-card border border-border-subtle p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={14} className="text-success" />
          <span className="text-sm font-medium text-text-main">Conectado</span>
        </div>
        <p className="text-xs text-text-muted font-mono">
          Supabase PostgreSQL — cluuqzhizeqvkgvfdisx.supabase.co
        </p>
      </div>

      {/* Configurações Supabase (substitui .env) */}
      <div className="rounded-xl bg-card border border-border-subtle p-4">
        <h2 className="text-sm font-bold text-text-main mb-1 flex items-center gap-2">
          <Database size={14} /> Configurações de Conexão
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Gerencie as variáveis de ambiente do Supabase. Estas configs
          substituem o arquivo .env global.
        </p>
        {loadingConfig ? (
          <div className="flex justify-center py-4">
            <Loader2 size={16} className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map((cfg) => {
              const isSecret =
                cfg.key.includes("PASSWORD") || cfg.key.includes("KEY");
              const show = showPasswords[cfg.key] ?? false;
              return (
                <div key={cfg.id}>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                    {cfg.key}
                  </label>
                  {cfg.description && (
                    <p className="text-xs text-text-muted mb-1.5">
                      {cfg.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        value={editValues[cfg.key] || ""}
                        onChange={(e) =>
                          setEditValues((p) => ({
                            ...p,
                            [cfg.key]: e.target.value,
                          }))
                        }
                        type={isSecret && !show ? "password" : "text"}
                        className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm font-mono outline-none focus:border-accent pr-10"
                      />
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((p) => ({
                              ...p,
                              [cfg.key]: !p[cfg.key],
                            }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                        >
                          {show ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => salvar(cfg.key)}
                      disabled={saving === cfg.key}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-accent text-accent-fg text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                    >
                      {saving === cfg.key ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}{" "}
                      Salvar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabelas */}
      <div className="rounded-xl bg-card border border-border-subtle p-4">
        <h2 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
          <Table size={14} /> Tabelas ({tabelas.length})
        </h2>
        {loadingTabelas ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-1">
            {tabelas.map((t) => (
              <div
                key={t.nome}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-hover"
              >
                <span className="text-sm font-mono text-text-main">
                  {t.nome}
                </span>
                <span className="text-xs text-text-muted">
                  {t.linhas} linha{t.linhas !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
            {tabelas.length === 0 && (
              <p className="text-center text-sm text-text-muted py-4">
                Nenhuma tabela encontrada.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
