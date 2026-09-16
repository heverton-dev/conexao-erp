import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { getAllModules } from "~/registry";
import { supabase } from "~/core/supabase";
import {
  listarDemoCredentials,
  criarDemoCredential,
  excluirDemoCredential,
  type DemoCredential,
} from "~/features/demos";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  X,
  ChevronRight,
  FlaskConical,
  ToggleLeft,
  ToggleRight,
  Shield,
  Database,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "~/lib/utils";
import { PasswordInput } from "~/components/ui/password-input";
import { RequireSuperAdmin } from "~/components/guards";

export const adminSuperDemosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/demos",
  component: () => (
    <RequireSuperAdmin>
      <AdminSuperDemos />
    </RequireSuperAdmin>
  ),
});

function AdminSuperDemos() {
  const { profile } = useAuth();
  const [demos, setDemos] = useState<DemoCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (profile?.is_super_admin) carregar();
  }, [profile]);

  async function carregar() {
    setLoading(true);
    const data = await listarDemoCredentials();
    setDemos(data);
    setLoading(false);
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

  async function handleDelete(d: DemoCredential) {
    if (!confirm(`Excluir demo "${d.email_demo}"?`)) return;
    try {
      await excluirDemoCredential(d.id, d.user_id);
      toast.success("Demo excluída");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical size={20} className="text-accent" />
          <div>
            <h1 className="text-lg font-bold text-text-main">Demos</h1>
            <p className="text-xs text-text-muted">
              Gerenciamento de acessos demo
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} /> Nova Demo
        </button>
      </div>

      <div className="space-y-2">
        {demos.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border-subtle"
          >
            <div>
              <span className="text-sm font-medium text-text-main">
                {d.email_demo}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                  {d.role_escolhida}
                </span>
                <span className="text-xs text-text-muted">
                  {d.qtd_cadastros_mock} mock
                  {Number(d.qtd_cadastros_mock) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(d)}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-hover transition-colors"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {demos.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">
            Nenhuma demo cadastrada.
          </p>
        )}
      </div>

      {showModal && (
        <CriarDemoModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function CriarDemoModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("editor");
  const [qtd, setQtd] = useState(5);
  const [modulos, setModulos] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  const registeredModules = getAllModules();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;
    setCreating(true);
    try {
      const modulosAtivos = Object.entries(modulos)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const { data: uid, error: rpcError } = await supabase.rpc(
        "create_demo_user",
        {
          demo_email: email,
          demo_password: senha,
          role_esc: role,
        },
      );
      if (rpcError) throw rpcError;

      const { error: insertErr } = await supabase
        .from("credenciais_demo")
        .insert({
          user_id: uid,
          email_demo: email,
          senha_demo: senha,
          role_escolhida: role,
          qtd_cadastros_mock: qtd,
          modulos_ativos: modulosAtivos,
        });
      if (insertErr) throw insertErr;

      for (let i = 0; i < qtd; i++) {
        const isPf = Math.random() > 0.5;
        const s = ["dados_enviados", "em_analise", "aprovado"][
          Math.floor(Math.random() * 3)
        ];
        await supabase.from("cadastros").insert({
          created_by: uid,
          tipo_pessoa: isPf ? "PF" : "PJ",
          status: s,
          nome_temporario: `Cliente Demo ${i + 1}`,
          is_demo: true,
        });
      }

      toast.success("Demo criada!");
      onCreated();
    } catch (e: any) {
      toast.error(e.message);
    }
    setCreating(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight">Nova Demo</h2>
                <p className="text-sm text-text-muted mt-0.5">Criar uma demo com dados fictícios</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <form onSubmit={handleCreate} className="px-6 py-6 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@email.com"
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                Senha *
              </label>
              <PasswordInput
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm outline-none focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                Role / Nível
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm outline-none focus:border-accent"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
                Qtd. Cadastros Mock
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={qtd}
                onChange={(e) => setQtd(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
              Módulos Ativos
            </label>
            <div className="space-y-1">
              {registeredModules.map((mod) => {
                const ativo = modulos[mod.key] ?? false;
                return (
                  <div
                    key={mod.key}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <mod.icon
                        size={14}
                        className={ativo ? "text-accent" : "text-text-muted"}
                      />
                      <span className="text-sm text-text-main">{mod.nome}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setModulos((p) => ({ ...p, [mod.key]: !ativo }))
                      }
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${ativo ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                    >
                      {ativo ? (
                        <>
                          <ToggleRight size={12} /> Ativo
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={12} /> Inativo
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2"
            >
              {creating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Criar Demo</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
