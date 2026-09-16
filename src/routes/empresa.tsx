import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { supabase } from "~/core/supabase";
import {
  buscarEmpresa,
  atualizarEmpresa,
  buscarEmpresaConfig,
  salvarEmpresaConfig,
  uploadEmpresaLogo,
  deletarEmpresaLogo,
  type Empresa,
  type EmpresaConfig,
} from "~/shared/empresas";
import { EMPRESA_ID } from "~/config/empresa";
import {
  listarCredenciaisPorEmpresa,
  criarCredencial,
  atualizarCredencial,
  toggleCredencial,
  deletarCredencial,
  type Credencial,
  type CredencialInput,
} from "~/features/credenciais";
import {
  getPermissoes,
  setPermissoes,
  getPermissoesPadrao,
  PERMISSOES_GROUPS,
  PERMISSOES_LABEL,
  PERMISSOES_DESC,
  type Permissoes,
} from "~/core/permissions";
import { useState, useEffect } from "react";
import {
  Building2,
  Save,
  Loader2,
  Plus,
  X,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Settings,
  Database,
  Palette,
  Image,
  Shield,
  ShieldCheck,
  ShieldX,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  UserRound,
  Globe,
  Lock,
  Unlock,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "~/lib/utils";
import { PasswordInput } from "~/components/ui/password-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { RequirePermission } from "~/components/guards";

type Tab = "dados" | "credenciais" | "database" | "design" | "branding";

const CORES_PADRAO: Record<string, string> = {
  accent: "#c9a655",
  accent_hover: "#d4b366",
  gradient_start: "#c9a655",
  gradient_mid: "#e8d48b",
  gradient_end: "#a8873a",
};

const LABELS_CORES: Record<string, string> = {
  accent: "Destaque (Principal)",
  accent_hover: "Destaque (Passar o Mouse)",
  gradient_start: "Gradiente - Cor Inicial",
  gradient_mid: "Gradiente - Cor Central",
  gradient_end: "Gradiente - Cor Final",
  text: "Cor do Texto",
  primary: "Cor Primária",
  secondary: "Cor Secundária",
  background: "Fundo Geral",
};

export const adminEmpresaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <AdminEmpresa />
    </RequirePermission>
  ),
});

function AdminEmpresa() {
  const [tab, setTab] = useState<Tab>("dados");
  const empresaId = EMPRESA_ID;
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [config, setConfig] = useState<EmpresaConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData(empresaId);
  }, []);

  async function loadData(eid: string) {
    setLoading(true);
    try {
      const [emp, cfg] = await Promise.all([
        buscarEmpresa(eid),
        buscarEmpresaConfig(eid),
      ]);
      setEmpresa(emp);
      setConfig(cfg);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[empresa] loadData error:', e);
      toast.error('Erro ao carregar empresa: ' + msg);
    }
    setLoading(false);
  }



  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Building2 size={18} className="text-accent" />{" "}
            {empresa?.nome_app || empresa?.nome || "Empresa"}
          </h1>
          <p className="text-xs text-text-muted">
            Gerencie as configurações da empresa
          </p>
        </div>
      </div>



      <div className="flex gap-1 rounded-xl bg-card p-1 overflow-x-auto whitespace-nowrap scrollbar-hide mb-4">
        {[
          { key: "dados" as Tab, label: "Dados", icon: Building2 },
          { key: "credenciais" as Tab, label: "Credenciais", icon: Shield },
          { key: "database" as Tab, label: "Banco Externo", icon: Database },
          { key: "design" as Tab, label: "Design", icon: Palette },
          { key: "branding" as Tab, label: "Branding", icon: Image },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium transition whitespace-nowrap",
              tab === key
                ? "bg-accent text-accent-fg"
                : "text-text-muted hover:text-text-main hover:bg-bg-dark",
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : (
        <>
          {tab === "dados" && (
            <DadosTab
              empresa={empresa}
              empresaId={empresaId}
              onSaved={() => loadData(empresaId)}
            />
          )}
          {tab === "credenciais" && <CredenciaisTab empresaId={empresaId} />}
          {tab === "database" && (
            <DatabaseTab
              empresaId={empresaId}
              config={config}
              onSaved={() => loadData(empresaId)}
            />
          )}
          {tab === "design" && (
            <DesignTab
              empresaId={empresaId}
              config={config}
              onSaved={() => loadData(empresaId)}
            />
          )}
          {tab === "branding" && (
            <BrandingTab
              empresaId={empresaId}
              config={config}
              onSaved={() => loadData(empresaId)}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ───── Tab 1: Dados da Empresa ───── */
function DadosTab({
  empresa,
  empresaId,
  onSaved,
}: {
  empresa: Empresa | null;
  empresaId: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nome_app: "",
    razao_social: "",
    nome: "",
    slug: "",
    cnpj: "",
    email: "",
    celular: "",
    telefone: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    site: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (empresa)
      setForm({
        nome_app: empresa.nome_app || "",
        razao_social: empresa.razao_social || "",
        nome: empresa.nome,
        slug: empresa.slug,
        cnpj: empresa.cnpj || "",
        email: empresa.email || "",
        celular: empresa.celular || "",
        telefone: empresa.telefone || "",
        logradouro: empresa.logradouro || "",
        numero: empresa.numero || "",
        bairro: empresa.bairro || "",
        cidade: empresa.cidade || "",
        estado: empresa.estado || "",
        cep: empresa.cep || "",
        instagram: empresa.instagram || "",
        youtube: empresa.youtube || "",
        linkedin: empresa.linkedin || "",
        site: empresa.site || "",
      });
  }, [empresa]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await atualizarEmpresa(empresaId, form);
      toast.success("Dados salvos!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  const h = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Section title="Identificação">
        <Grid>
          <Field
            label="Nome na Aplicação"
            value={form.nome_app}
            onChange={h("nome_app")}
          />
          <Field
            label="Razão Social"
            value={form.razao_social}
            onChange={h("razao_social")}
          />
          <Field
            label="Nome Interno"
            value={form.nome}
            onChange={h("nome")}
            required
          />
          <Field
            label="Slug"
            value={form.slug}
            onChange={h("slug")}
            required
            fontMono
          />
          <Field label="CNPJ" value={form.cnpj} onChange={h("cnpj")} />
        </Grid>
      </Section>

      <Section title="Contato">
        <Grid>
          <Field
            label="Email"
            value={form.email}
            onChange={h("email")}
            type="email"
          />
          <Field
            label="Celular / WhatsApp"
            value={form.celular}
            onChange={h("celular")}
          />
          <Field
            label="Telefone Fixo"
            value={form.telefone}
            onChange={h("telefone")}
          />
        </Grid>
      </Section>

      <Section title="Endereço">
        <Grid>
          <Field
            label="Logradouro"
            value={form.logradouro}
            onChange={h("logradouro")}
            className="col-span-2"
          />
          <Field label="Número" value={form.numero} onChange={h("numero")} />
          <Field label="Bairro" value={form.bairro} onChange={h("bairro")} />
          <Field label="Cidade" value={form.cidade} onChange={h("cidade")} />
          <Field label="Estado" value={form.estado} onChange={h("estado")} />
          <Field label="CEP" value={form.cep} onChange={h("cep")} />
        </Grid>
      </Section>

      <Section title="Redes Sociais">
        <Grid>
          <Field
            label="Instagram"
            value={form.instagram}
            onChange={h("instagram")}
          />
          <Field label="YouTube" value={form.youtube} onChange={h("youtube")} />
          <Field
            label="LinkedIn"
            value={form.linkedin}
            onChange={h("linkedin")}
          />
          <Field
            label="Site"
            value={form.site}
            onChange={h("site")}
            type="url"
          />
        </Grid>
      </Section>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}{" "}
          Salvar Dados
        </button>
      </div>
    </form>
  );
}

/* ───── Tab 2: Credenciais ───── */
function CredenciaisTab({ empresaId }: { empresaId: string }) {
  const [credenciais, setCredenciais] = useState<Credencial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome_completo: "",
    email_corporativo: "",
    whatsapp_corporativo: "",
    departamento: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [credencialParaDeletar, setCredencialParaDeletar] = useState<Credencial | null>(null);
  const [permCredencial, setPermCredencial] = useState<Credencial | null>(null);
  const [editPerms, setEditPerms] = useState<Permissoes | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    carregar();
  }, [empresaId]);

  async function carregar() {
    setLoading(true);
    const list = await listarCredenciaisPorEmpresa();
    setCredenciais(list);
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
        await criarCredencial({ ...form, empresa_id: empresaId });
        toast.success("Credencial criada!");
      }
      setShowForm(false);
      carregar();
    } catch {
      toast.error("Erro ao salvar");
    }
    setSubmitting(false);
  }

  async function handleToggle(c: Credencial) {
    try {
      await toggleCredencial(c.id, !c.ativo);
      carregar();
    } catch {
      toast.error("Erro");
    }
  }

  async function handleConfirmDeleteCredencial() {
    if (!credencialParaDeletar) return;
    try {
      await deletarCredencial(credencialParaDeletar.id);
      toast.success("Removida");
      setCredencialParaDeletar(null);
      carregar();
    } catch {
      toast.error("Erro");
    }
  }

  async function abrirPermissoes(c: Credencial) {
    setPermCredencial(c);
    setLoadingPerms(true);
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, ambiente, is_super_admin")
        .eq("email", c.email_corporativo)
        .maybeSingle();
      if (prof) {
        const perms = await getPermissoes(prof.id, prof.is_super_admin);
        setEditPerms(perms || getPermissoesPadrao(prof.ambiente as any));
      } else {
        setEditPerms(null);
      }
    } catch {
      toast.error("Erro ao carregar permissões");
    }
    setLoadingPerms(false);
  }

  function togglePerm(key: keyof Permissoes) {
    if (!editPerms) return;
    setEditPerms((p) => (p ? { ...p, [key]: !p[key] } : p));
  }

  async function salvarPermissoes() {
    if (!permCredencial || !editPerms) return;
    setSavingPerms(true);
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", permCredencial.email_corporativo)
        .maybeSingle();
      if (prof) {
        await setPermissoes(prof.id, editPerms);
        toast.success("Permissões salvas!");
      }
      setPermCredencial(null);
      setEditPerms(null);
    } catch {
      toast.error("Erro");
    }
    setSavingPerms(false);
  }

  const ALL_FALSE_LOCAL: any = {
    ver_todos_cadastros: false,
    aprovar_cadastro: false,
    reprovar_cadastro: false,
    solicitar_correcao_cadastro: false,
    aprovar_documento: false,
    reprovar_documento: false,
    solicitar_correcao_documento: false,
    aprovar_campo: false,
    reprovar_campo: false,
    solicitar_correcao_campo: false,
    visualizar_documento: false,
    excluir_cadastro: false,
    gerenciar_credenciais: false,
    gerenciar_credenciais_admin: false,
    gerenciar_config: false,
    gerar_links: false,
    ver_relatorios: false,
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {credenciais.length} credencial(is) vinculada(s) a esta empresa.
        </p>
        <button
          onClick={abrirNova}
          className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white"
        >
          <Plus size={14} /> Nova
        </button>
      </div>

      {credenciais.length === 0 ? (
        <p className="text-center text-sm text-text-muted py-8">
          Nenhuma credencial.
        </p>
      ) : (
        credenciais.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-lg"
          >
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
            <button
              onClick={() => abrirPermissoes(c)}
              className="rounded-lg p-2 text-text-muted hover:text-accent"
            >
              <Shield size={16} />
            </button>
            <button
              onClick={() => abrirEditar(c)}
              className="rounded-lg p-2 text-text-muted hover:text-text-main"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={() => handleToggle(c)}
              className={c.ativo ? "text-green-400" : "text-text-muted"}
            >
              {c.ativo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
            <button
              onClick={() => setCredencialParaDeletar(c)}
              className="text-text-muted hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-main">
                {editId ? "Editar" : "Nova"} Credencial
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-text-muted hover:text-text-main"
              >
                <X size={20} />
              </button>
            </div>
            <input
              value={form.nome_completo}
              onChange={(e) =>
                setForm((p) => ({ ...p, nome_completo: e.target.value }))
              }
              placeholder="Nome Completo"
              className="mb-3 w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-text-main outline-none focus:border-accent min-h-[44px]"
            />
            <input
              value={form.email_corporativo}
              onChange={(e) =>
                setForm((p) => ({ ...p, email_corporativo: e.target.value }))
              }
              placeholder="Email Corporativo"
              type="email"
              className="mb-3 w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-text-main outline-none focus:border-accent min-h-[44px]"
            />
            <input
              value={form.whatsapp_corporativo}
              onChange={(e) =>
                setForm((p) => ({ ...p, whatsapp_corporativo: e.target.value }))
              }
              placeholder="WhatsApp (opcional)"
              className="mb-3 w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-text-main outline-none focus:border-accent min-h-[44px]"
            />
            <select
              value={form.departamento}
              onChange={(e) =>
                setForm((p) => ({ ...p, departamento: e.target.value }))
              }
              className="mb-4 w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-text-main outline-none focus:border-accent min-h-[44px]"
            >
              <option value="">Departamento</option>
              {["Vendas", "Administrativo", "Financeiro", "TI"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-input-border py-3 text-sm font-medium text-text-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !form.nome_completo || !form.email_corporativo || submitting
                }
                className="flex-1 rounded-xl bg-accent py-3 text-sm font-medium text-white disabled:opacity-50"
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

      <AlertDialog open={!!credencialParaDeletar} onOpenChange={(o) => !o && setCredencialParaDeletar(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir credencial?</AlertDialogTitle>
            <AlertDialogDescription>
              A credencial de "{credencialParaDeletar?.nome_completo}" será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteCredencial} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {permCredencial && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl mt-8 mb-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-text-main truncate">
                {permCredencial.nome_completo}
              </h2>
              <button
                onClick={() => {
                  setPermCredencial(null);
                  setEditPerms(null);
                }}
                className="text-text-muted hover:text-text-main"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-text-muted mb-1">
              {permCredencial.email_corporativo}
            </p>

            {loadingPerms ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : !editPerms ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShieldX size={36} className="text-yellow-400 mb-2" />
                <p className="text-sm font-semibold text-text-main">
                  Usuário não registrado
                </p>
                <p className="text-xs text-text-muted mt-1">
                  O e-mail ainda não realizou o primeiro acesso.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 mb-4">
                  <button
                    onClick={() =>
                      setEditPerms(getPermissoesPadrao("cadastro"))
                    }
                    className="ml-auto text-xs text-accent underline"
                  >
                    Restaurar padrões
                  </button>
                </div>
                <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
                  {PERMISSOES_GROUPS.map((group) => (
                    <div
                      key={group.label}
                      className="rounded-xl bg-input-bg p-3"
                    >
                      <p className="text-xs font-bold text-text-main mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-col gap-2">
                        {group.keys.map((key: string) => (
                          <label
                            key={key}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <button
                              onClick={() => togglePerm(key)}
                              className={cn(
                                "shrink-0 rounded-lg p-1.5 transition",
                                editPerms[key]
                                  ? "bg-accent text-accent-fg"
                                  : "bg-bg-dark text-text-muted group-hover:text-text-main",
                              )}
                            >
                              {editPerms[key] ? (
                                <ShieldCheck size={16} />
                              ) : (
                                <ShieldX size={16} />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-xs font-medium",
                                  editPerms[key]
                                    ? "text-text-main"
                                    : "text-text-muted",
                                )}
                              >
                                {PERMISSOES_LABEL[key]}
                              </p>
                              <p className="text-xs text-text-muted">
                                {PERMISSOES_DESC[key]}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setPermCredencial(null);
                      setEditPerms(null);
                    }}
                    className="flex-1 rounded-xl border border-input-border py-3 text-sm font-medium text-text-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarPermissoes}
                    disabled={savingPerms}
                    className="flex items-center justify-center gap-1 flex-1 rounded-xl bg-accent py-3 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {savingPerms ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}{" "}
                    Salvar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Tab 3: Database Externo ───── */
function DatabaseTab({
  empresaId,
  config,
  onSaved,
}: {
  empresaId: string;
  config: EmpresaConfig | null;
  onSaved: () => void;
}) {
  const [dbConfig, setDbConfig] = useState({
    host: "",
    port: "5432",
    database: "",
    user: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const c = config?.db_config || {};
    setDbConfig({
      host: (c as any).host || "",
      port: (c as any).port || "5432",
      database: (c as any).database || "",
      user: (c as any).user || "",
      password: (c as any).password || "",
    });
  }, [config]);

  function gerarScript(): string {
    return `-- Script gerado para banco externo: ${dbConfig.database || "não configurado"}
-- Host: ${dbConfig.host || "não configurado"}  Porta: ${dbConfig.port || "5432"}
-- Execute este script no banco externo para criar as tabelas necessárias.

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes_externos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  celular text,
  cpf_cnpj text,
  created_at timestamptz DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos_externos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes_externos(id),
  valor numeric(12,2),
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

-- Tabela de logs de sincronização
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela text NOT NULL,
  acao text NOT NULL,
  registro_id uuid,
  dados jsonb,
  created_at timestamptz DEFAULT now()
);
`;
  }

  async function handleSave() {
    setSaving(true);
    try {
      await salvarEmpresaConfig(empresaId, { db_config: dbConfig as any });
      toast.success("Configuração salva!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  const script = gerarScript();

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card p-4 border border-border-subtle">
        <h2 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
          <Database size={14} /> Conexão com Banco Externo
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Configure a conexão com o banco de dados externo. Se vazio, o sistema
          usará o banco padrão da aplicação.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Host"
            value={dbConfig.host}
            onChange={(v) => setDbConfig((p) => ({ ...p, host: v }))}
          />
          <Field
            label="Porta"
            value={dbConfig.port}
            onChange={(v) => setDbConfig((p) => ({ ...p, port: v }))}
          />
          <Field
            label="Database"
            value={dbConfig.database}
            onChange={(v) => setDbConfig((p) => ({ ...p, database: v }))}
          />
          <Field
            label="Usuário"
            value={dbConfig.user}
            onChange={(v) => setDbConfig((p) => ({ ...p, user: v }))}
          />
          <div className="col-span-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
              Senha
            </label>
            <PasswordInput
              value={dbConfig.password}
              onChange={(e) =>
                setDbConfig((p) => ({ ...p, password: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}{" "}
            Salvar Config
          </button>
        </div>
      </div>

      {dbConfig.host && dbConfig.database && (
        <div className="rounded-xl bg-card p-4 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
              <Globe size={14} /> Script SQL para Banco Externo
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(script);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-medium hover:bg-surface-hover transition-colors"
            >
              {copied ? (
                <Check size={12} className="text-success" />
              ) : (
                <Copy size={12} />
              )}
              {copied ? "Copiado!" : "Copiar Script"}
            </button>
          </div>
          <p className="text-xs text-text-muted mb-3">
            Copie e execute este script no banco externo para criar as tabelas
            necessárias.
          </p>
          <pre className="rounded-lg bg-bg-dark p-4 text-xs text-text-main font-mono overflow-x-auto whitespace-pre border border-border-subtle">
            {script}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ───── Tab 4: Design ───── */
function DesignTab({
  empresaId,
  config,
  onSaved,
}: {
  empresaId: string;
  config: EmpresaConfig | null;
  onSaved: () => void;
}) {
  const [cores, setCores] = useState<Record<string, string>>(CORES_PADRAO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCores({
      ...CORES_PADRAO,
      ...((config?.theme ?? {}) as Record<string, string>),
    });
  }, [config]);

  function handleCorChange(key: string, value: string) {
    setCores((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await salvarEmpresaConfig(empresaId, { theme: cores });
      toast.success("Design salvo!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card p-4 border border-border-subtle">
        <h2 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
          <Palette size={14} /> Cores da Marca
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(cores)
            .filter(([key]) => LABELS_CORES[key] !== undefined)
            .map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-text-muted font-medium block mb-1">
                  {LABELS_CORES[key]}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleCorChange(key, e.target.value)}
                    className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCorChange(key, e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 border border-border-subtle">
        <h2 className="text-sm font-bold text-text-main mb-3">Preview</h2>
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-accent" />
          <div className="flex gap-1">
            {Object.values(cores)
              .slice(0, 3)
              .map((cor, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border border-border-subtle"
                  style={{ backgroundColor: cor }}
                />
              ))}
          </div>
          <span className="text-xs text-text-muted">Preview</span>
        </div>
        <div
          className="mt-3 p-3 rounded-lg text-center text-sm font-bold"
          style={{ backgroundColor: cores.accent, color: "#fff" }}
        >
          Botão Exemplo
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}{" "}
          Salvar Design
        </button>
      </div>
    </div>
  );
}

/* ───── Tab 5: Branding ───── */
function BrandingTab({
  empresaId,
  config,
  onSaved,
}: {
  empresaId: string;
  config: EmpresaConfig | null;
  onSaved: () => void;
}) {
  const [logoIndex, setLogoIndex] = useState("");
  const [logoApp, setLogoApp] = useState("");
  const [favicon, setFavicon] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    setLogoIndex(config?.logo_index_url || "");
    setLogoApp(config?.logo_app_url || "");
    setFavicon(config?.favicon_url || "");
  }, [config]);

  async function handleUpload(tipo: "logo_index" | "logo_app" | "favicon") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(tipo);
      try {
        const url = await uploadEmpresaLogo(empresaId, tipo, file);
        if (tipo === "logo_index") setLogoIndex(url);
        else if (tipo === "logo_app") setLogoApp(url);
        else setFavicon(url);
        await salvarEmpresaConfig(empresaId, {
          logo_index_url: tipo === "logo_index" ? url : logoIndex || undefined,
          logo_app_url: tipo === "logo_app" ? url : logoApp || undefined,
          favicon_url: tipo === "favicon" ? url : favicon || undefined,
        });
        toast.success(`${tipo === "favicon" ? "Favicon" : "Logo"} salvo!`);
        onSaved();
      } catch (e: any) {
        toast.error("Erro no upload: " + e.message);
      }
      setUploading(null);
    };
    input.click();
  }

  async function handleRemove(tipo: "logo_index" | "logo_app" | "favicon") {
    try {
      await deletarEmpresaLogo(empresaId, tipo);
      if (tipo === "logo_index") {
        await salvarEmpresaConfig(empresaId, {
          logo_index_url: undefined,
          logo_app_url: logoApp || undefined,
          favicon_url: favicon || undefined,
        });
        setLogoIndex("");
      } else if (tipo === "logo_app") {
        await salvarEmpresaConfig(empresaId, {
          logo_index_url: logoIndex || undefined,
          logo_app_url: undefined,
          favicon_url: favicon || undefined,
        });
        setLogoApp("");
      } else {
        await salvarEmpresaConfig(empresaId, {
          logo_index_url: logoIndex || undefined,
          logo_app_url: logoApp || undefined,
          favicon_url: undefined,
        });
        setFavicon("");
      }
      toast.success("Removido!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await salvarEmpresaConfig(empresaId, {
        logo_index_url: logoIndex || undefined,
        logo_app_url: logoApp || undefined,
        favicon_url: favicon || undefined,
      });
      toast.success("Branding salvo!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  function LogoField({
    label,
    tipo,
    url,
  }: {
    label: string;
    tipo: "logo_index" | "logo_app" | "favicon";
    url: string;
  }) {
    return (
      <div className="rounded-xl bg-input-bg p-4">
        <label className="text-xs font-medium text-text-muted mb-2 block">
          {label}
        </label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-lg border border-border-subtle bg-white flex items-center justify-center overflow-hidden shrink-0">
            {url ? (
              <img
                src={url}
                className="w-full h-full object-contain"
                alt={label}
              />
            ) : (
              <Image size={24} className="text-text-muted/40" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                if (tipo === "logo_index") setLogoIndex(e.target.value);
                else if (tipo === "logo_app") setLogoApp(e.target.value);
                else setFavicon(e.target.value);
              }}
              placeholder="URL externa ou caminho relativo..."
              className="w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-xs font-mono outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleUpload(tipo)}
                disabled={uploading === tipo}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {uploading === tipo ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}
                Upload
              </button>
              {url && (
                <button
                  onClick={() => handleRemove(tipo)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error/10 text-error text-xs font-medium hover:bg-error/20 transition-colors"
                >
                  <Trash2 size={12} /> Remover
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card p-4 border border-border-subtle">
        <h2 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
          <Image size={14} /> Logomarcas e Favicon
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Faça upload dos arquivos ou cole uma URL externa. Os uploads vão para
          o storage do Supabase.
        </p>
        <div className="space-y-4">
          <LogoField
            label="Logo da Página de Login"
            tipo="logo_index"
            url={logoIndex}
          />
          <LogoField
            label="Logo da Aplicação (header)"
            tipo="logo_app"
            url={logoApp}
          />
          <LogoField label="Favicon" tipo="favicon" url={favicon} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}{" "}
          Salvar URLs
        </button>
      </div>
    </div>
  );
}

/* ───── Helpers ───── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card p-4 border border-border-subtle">
      <h2 className="text-sm font-bold text-text-main mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
  fontMono,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  fontMono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
        {label}
        {required && " *"}
      </label>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2 rounded-lg bg-input-bg border border-input-border text-text-main text-sm outline-none focus:border-accent",
          fontMono && "font-mono",
        )}
        required={required}
      />
    </div>
  );
}
