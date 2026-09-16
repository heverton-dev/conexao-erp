import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import {
  buscarEmpresa,
  atualizarEmpresa,
  buscarEmpresaConfig,
  salvarEmpresaConfig,
  listarModulosEmpresa,
  upsertModuloEmpresa,
  type Empresa,
  type EmpresaConfig,
  type ModuloEmpresa,
} from "~/shared/empresas";
import { getAllModules } from "~/registry";
import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  ArrowLeft,
  Building2,
  AtSign,
  MapPin,
  Globe,
  Palette,
  Image,
  ToggleRight,
  ToggleLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { RequireSuperAdmin } from "~/components/guards";
import {
  SectionCard,
  Grid,
  Field,
  CollapsibleSection,
} from "~/features/empresas/components";

export const adminSuperEmpresaDetailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/empresas/$id",
  component: () => (
    <RequireSuperAdmin>
      <AdminSuperEmpresaDetail />
    </RequireSuperAdmin>
  ),
});

const CORES_INICIAIS = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  background: "#0f3460",
  text: "#e8d48b",
  accent: "#c9a655",
  accent_hover: "#d4b366",
  gradient_start: "#c9a655",
  gradient_mid: "#e8d48b",
  gradient_end: "#a8873a",
};

function AdminSuperEmpresaDetail() {
  const { profile } = useAuth();
  const { id } = adminSuperEmpresaDetailRoute.useParams();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [config, setConfig] = useState<EmpresaConfig | null>(null);
  const [modulos, setModulos] = useState<ModuloEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    slug: "",
    cnpj: "",
    razao_social: "",
    nome_app: "",
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
    logo_index_url: "",
    logo_app_url: "",
    favicon_url: "",
  });
  const [cores, setCores] = useState<Record<string, string>>(CORES_INICIAIS);
  const [sections, setSections] = useState<Record<string, boolean>>({
    contato: false,
    endereco: false,
    redes: false,
    design: false,
    branding: false,
    modulos: false,
  });

  const toggleSection = (key: string) =>
    setSections((p) => ({ ...p, [key]: !p[key] }));
  const h = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (profile?.is_super_admin) carregar();
  }, [profile, id]);

  async function carregar() {
    setLoading(true);
    const [emp, cfg, modList] = await Promise.all([
      buscarEmpresa(id),
      buscarEmpresaConfig(id),
      listarModulosEmpresa(id),
    ]);
    if (emp) {
      setEmpresa(emp);
      setForm({
        nome: emp.nome,
        slug: emp.slug,
        cnpj: emp.cnpj ?? "",
        razao_social: emp.razao_social ?? "",
        nome_app: emp.nome_app ?? "",
        email: emp.email ?? "",
        celular: emp.celular ?? "",
        telefone: emp.telefone ?? "",
        logradouro: emp.logradouro ?? "",
        numero: emp.numero ?? "",
        bairro: emp.bairro ?? "",
        cidade: emp.cidade ?? "",
        estado: emp.estado ?? "",
        cep: emp.cep ?? "",
        instagram: emp.instagram ?? "",
        youtube: emp.youtube ?? "",
        linkedin: emp.linkedin ?? "",
        site: emp.site ?? "",
        logo_index_url: "",
        logo_app_url: "",
        favicon_url: "",
      });
    }
    if (cfg) {
      setConfig(cfg);
      setCores({ ...CORES_INICIAIS, ...(cfg.theme || {}) });
      setForm((p) => ({
        ...p,
        logo_index_url: cfg.logo_index_url ?? "",
        logo_app_url: cfg.logo_app_url ?? "",
        favicon_url: cfg.favicon_url ?? "",
      }));
    }
    setModulos(modList);
    setLoading(false);
  }

  if (!profile?.is_super_admin)
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-text-muted text-sm">
          Acesso restrito ao Super Admin.
        </p>
      </div>
    );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!empresa) return;
    setSaving(true);
    try {
      await atualizarEmpresa(id, {
        nome: form.nome,
        slug: form.slug,
        cnpj: form.cnpj || undefined,
        razao_social: form.razao_social || undefined,
        nome_app: form.nome_app || undefined,
        email: form.email || undefined,
        celular: form.celular || undefined,
        telefone: form.telefone || undefined,
        logradouro: form.logradouro || undefined,
        numero: form.numero || undefined,
        bairro: form.bairro || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        cep: form.cep || undefined,
        instagram: form.instagram || undefined,
        youtube: form.youtube || undefined,
        linkedin: form.linkedin || undefined,
        site: form.site || undefined,
      });
      await salvarEmpresaConfig(id, {
        logo_index_url: form.logo_index_url || undefined,
        logo_app_url: form.logo_app_url || undefined,
        favicon_url: form.favicon_url || undefined,
        theme: cores,
      });
      toast.success("Empresa atualizada!");
      setEmpresa({
        ...empresa,
        nome: form.nome,
        slug: form.slug,
        cnpj: form.cnpj || undefined,
      });
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  async function handleToggleAtivo() {
    if (!empresa) return;
    try {
      await atualizarEmpresa(id, { ativo: !empresa.ativo });
      setEmpresa({ ...empresa, ativo: !empresa.ativo });
      toast.success(`Empresa ${!empresa.ativo ? "ativada" : "inativada"}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleToggleModulo(modKey: string, ativo: boolean) {
    try {
      await upsertModuloEmpresa(id, modKey, ativo);
      setModulos((prev) => {
        const exists = prev.find((m) => m.modulo_key === modKey);
        if (exists)
          return prev.map((m) =>
            m.modulo_key === modKey ? { ...m, ativo } : m,
          );
        return [
          ...prev,
          {
            id: "",
            empresa_id: id,
            modulo_key: modKey,
            ativo,
            config: {},
            created_at: "",
          },
        ];
      });
      toast.success(`Módulo ${ativo ? "ativado" : "inativado"}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const registeredModules = getAllModules();
  const activeModuleKeys = modulos
    .filter((m) => m.ativo)
    .map((m) => m.modulo_key);

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );

  if (!empresa)
    return (
      <div className="p-4 text-center text-text-muted">
        Empresa não encontrada.
      </div>
    );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => window.history.back()}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text-main">{empresa.nome}</h1>
          <p className="text-xs text-text-muted">{empresa.slug}</p>
        </div>
        <button
          onClick={handleToggleAtivo}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            empresa.ativo
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {empresa.ativo ? (
            <>
              <Check size={12} /> Ativo
            </>
          ) : (
            <>
              <X size={12} /> Inativo
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Identificação */}
        <SectionCard icon={Building2} title="Identificação">
          <Grid>
            <Field
              label="Nome Interno *"
              value={form.nome}
              onChange={(v) => {
                const slug = v
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                setForm((p) => ({ ...p, nome: v, slug }));
              }}
              required
            />
            <Field
              label="Slug *"
              value={form.slug}
              onChange={h("slug")}
              fontMono
              required
            />
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
            <Field label="CNPJ" value={form.cnpj} onChange={h("cnpj")} />
          </Grid>
        </SectionCard>

        {/* Contato */}
        <CollapsibleSection
          icon={AtSign}
          title="Contato"
          open={sections.contato}
          onToggle={() => toggleSection("contato")}
        >
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
        </CollapsibleSection>

        {/* Endereço */}
        <CollapsibleSection
          icon={MapPin}
          title="Endereço"
          open={sections.endereco}
          onToggle={() => toggleSection("endereco")}
        >
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
        </CollapsibleSection>

        {/* Redes Sociais */}
        <CollapsibleSection
          icon={Globe}
          title="Redes Sociais"
          open={sections.redes}
          onToggle={() => toggleSection("redes")}
        >
          <Grid>
            <Field
              label="Instagram"
              value={form.instagram}
              onChange={h("instagram")}
            />
            <Field
              label="YouTube"
              value={form.youtube}
              onChange={h("youtube")}
            />
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
        </CollapsibleSection>

        {/* Design */}
        <CollapsibleSection
          icon={Palette}
          title="Design (Cores da Marca)"
          open={sections.design}
          onToggle={() => toggleSection("design")}
        >
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(cores).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-text-muted font-medium block mb-1">
                  {key}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) =>
                      setCores((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setCores((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
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
          </div>
        </CollapsibleSection>

        {/* Branding */}
        <CollapsibleSection
          icon={Image}
          title="Branding (Logos e Favicon)"
          open={sections.branding}
          onToggle={() => toggleSection("branding")}
        >
          <p className="text-xs text-text-muted mb-3">
            URLs externas para as imagens.
          </p>
          <Field
            label="Logo da Página de Login (URL)"
            value={form.logo_index_url}
            onChange={h("logo_index_url")}
          />
          <Field
            label="Logo da Aplicação / Header (URL)"
            value={form.logo_app_url}
            onChange={h("logo_app_url")}
          />
          <Field
            label="Favicon (URL)"
            value={form.favicon_url}
            onChange={h("favicon_url")}
          />
        </CollapsibleSection>

        {/* Módulos */}
        <CollapsibleSection
          icon={ToggleRight}
          title="Módulos da Empresa"
          open={sections.modulos}
          onToggle={() => toggleSection("modulos")}
        >
          <div className="space-y-1">
            {registeredModules.map((mod) => {
              const ativo = activeModuleKeys.includes(mod.key);
              return (
                <div
                  key={mod.key}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <mod.icon
                      size={16}
                      className={ativo ? "text-accent" : "text-text-muted"}
                    />
                    <div>
                      <span className="text-sm font-medium text-text-main">
                        {mod.nome}
                      </span>
                      <span className="text-xs text-text-muted block">
                        {mod.descricao}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleModulo(mod.key, !ativo)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      ativo
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {ativo ? (
                      <>
                        <ToggleRight size={14} /> Ativo
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={14} /> Inativo
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent text-accent-fg py-3 text-sm font-bold hover:bg-accent-hover transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Save size={16} />
              <span>Salvar Alterações</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
