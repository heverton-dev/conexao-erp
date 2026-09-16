import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState, useEffect } from "react";
import { useAuth } from "~/lib/auth";
import {
  listarCredenciais,
  criarCredencial,
  atualizarCredencial,
  toggleCredencial,
  deletarCredencial,
  listarCredenciaisPorEmpresa,
  type Credencial,
} from "~/features/credenciais";
import { EMPRESA_ID } from "~/config/empresa";
import {
  Loader2,
  Plus,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Shield,
  ShieldAlert,
  X,
  Settings,
  Trash2,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { RequireSuperAdmin } from "~/components/guards";

export const credenciaisRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/credenciais",
  component: () => (
    <RequireSuperAdmin>
      <CredenciaisPage />
    </RequireSuperAdmin>
  ),
});

function CredenciaisPage() {
  const { profile } = useAuth();
  const podeVer = profile?.is_super_admin === true;
  const podeAdmin = profile?.is_super_admin === true;
  const selectedEmpresaId = EMPRESA_ID;

  const [credenciais, setCredenciais] = useState<Credencial[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome_completo: "",
    email_corporativo: "",
    whatsapp_corporativo: "",
    departamento: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState<Credencial | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      setCredenciais(await listarCredenciaisPorEmpresa());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function abrirNova() {
    setEditId(null);
    setForm({
      nome_completo: "",
      email_corporativo: "",
      whatsapp_corporativo: "",
      departamento: "",
    });
    setShowForm(true);
  }

  function abrirEditar(c: Credencial) {
    setEditId(c.id);
    setForm({
      nome_completo: c.nome_completo,
      email_corporativo: c.email_corporativo,
      whatsapp_corporativo: c.whatsapp_corporativo || "",
      departamento: c.departamento || "",
    });
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!form.nome_completo || !form.email_corporativo) return;
    setSubmitting(true);
    try {
      if (editId) {
        await atualizarCredencial(editId, {
          nome_completo: form.nome_completo,
          email_corporativo: form.email_corporativo,
          whatsapp_corporativo: form.whatsapp_corporativo || undefined,
          departamento: form.departamento || undefined,
        });
        toast.success("Credencial atualizada!");
      } else {
        await criarCredencial({ ...form, empresa_id: selectedEmpresaId });
        toast.success("Credencial criada!");
      }
      setShowForm(false);
      carregar();
    } catch (e) {
      console.error("Erro ao salvar credencial:", e);
      toast.error("Erro ao salvar");
    }
    setSubmitting(false);
  }

  async function handleToggle(c: Credencial) {
    try {
      await toggleCredencial(c.id, !c.ativo);
      carregar();
    } catch (e) {
      console.error("Erro ao toggle credencial:", e);
      toast.error("Erro");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletarCredencial(id);
      toast.success("Removida");
      carregar();
    } catch (e) {
      console.error("Erro ao deletar credencial:", e);
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast.error(msg);
    }
  }

  if (!podeVer)
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 pt-20">
        <Shield size={40} className="text-text-muted" />
        <p className="text-sm text-text-muted">Acesso restrito</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-text-main">
          Credenciais de Acesso
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to="/empresa/permissoes"
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-text-muted hover:text-text-main"
          >
            <ShieldAlert size={16} /> Permissões
          </Link>
          {podeAdmin && (
            <button
              onClick={abrirNova}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg"
            >
              <Plus size={16} /> Nova
            </button>
          )}
        </div>
      </div>



      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : credenciais.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">
          Nenhuma credencial cadastrada
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {credenciais.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <UserPlus size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-main truncate">
                  {c.nome_completo}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {c.email_corporativo}
                </p>
                {c.departamento && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent mt-1 inline-block">
                    {c.departamento}
                  </span>
                )}
              </div>
              {podeAdmin && (
                <button
                  onClick={() => abrirEditar(c)}
                  className="rounded-lg p-2 text-text-muted hover:text-text-main"
                  title="Editar"
                >
                  <Settings size={16} />
                </button>
              )}
              <button
                onClick={() => handleToggle(c)}
                className={c.ativo ? "text-green-400" : "text-text-muted"}
              >
                {c.ativo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
              {podeAdmin && (
                <button
                  onClick={() => setDeleteTarget(c)}
                  className="text-text-muted hover:text-red-400"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50 relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  {editId ? <Pencil size={22} /> : <Plus size={22} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">
                    {editId ? "Editar" : "Nova"} Credencial
                  </h2>
                  <p className="text-sm text-text-muted mt-0.5">
                    {editId ? "Atualize os dados da credencial" : "Preencha os dados para criar"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-6 flex-1 space-y-4">
              <div>
                <label className="mb-1.5 text-xs font-medium text-text-muted">Nome Completo</label>
                <input
                  value={form.nome_completo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nome_completo: e.target.value }))
                  }
                  placeholder="Nome Completo"
                  className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-text-muted">Email Corporativo</label>
                <input
                  value={form.email_corporativo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email_corporativo: e.target.value }))
                  }
                  placeholder="Email Corporativo"
                  type="email"
                  className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-text-muted">WhatsApp (opcional)</label>
                <input
                  value={form.whatsapp_corporativo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, whatsapp_corporativo: e.target.value }))
                  }
                  placeholder="WhatsApp (opcional)"
                  className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-text-muted">Departamento</label>
                <select
                  value={form.departamento}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, departamento: e.target.value }))
                  }
                  className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                >
                  <option value="">Departamento</option>
                  {["Vendas", "Administrativo", "Financeiro", "TI"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !form.nome_completo || !form.email_corporativo || submitting
                }
                className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-red-500/20 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent px-6 pt-6 pb-4 border-b border-red-500/20 relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">
                    Remover Credencial
                  </h2>
                  <p className="text-sm text-text-muted mt-0.5">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-6 flex-1 space-y-4">
              <p className="text-sm text-text-muted">
                Tem certeza que deseja remover{" "}
                <strong className="text-text-main">
                  {deleteTarget.nome_completo}
                </strong>
                ?
              </p>
              <p className="text-xs text-text-muted">
                {deleteTarget.email_corporativo}
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-red-500/20">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await handleDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="flex-1 sm:flex-none rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 hover:bg-red-600 disabled:opacity-50 transition-all duration-200 min-h-[44px]"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
