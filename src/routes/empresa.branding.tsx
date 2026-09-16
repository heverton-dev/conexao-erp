import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import {
  buscarEmpresaDesign,
  salvarEmpresaDesign,
  uploadEmpresaLogo,
  type EmpresaDesign,
} from "~/shared/empresas";
import { EMPRESA_ID } from "~/config/empresa";
import { useState, useEffect } from "react";
import {
  Image,
  Save,
  Loader2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { RequirePermission } from "~/components/guards";

export const adminEmpresaConfigBrandingRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/branding",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <AdminEmpresaConfigBranding />
    </RequirePermission>
  ),
});

function AdminEmpresaConfigBranding() {
  const navigate = useNavigate();

  const empresaId = EMPRESA_ID;
  const [loading, setLoading] = useState(true);
  const [logoIndex, setLogoIndex] = useState("");
  const [logoApp, setLogoApp] = useState("");
  const [favicon, setFavicon] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const cfg: EmpresaDesign | null = await buscarEmpresaDesign(empresaId);
      setLogoIndex(cfg?.logo_index_url || "");
      setLogoApp(cfg?.logo_app_url || "");
      setFavicon(cfg?.favicon_url || "");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[branding] loadConfig error:', e);
      toast.error('Erro ao carregar branding: ' + msg);
    }
    setLoading(false);
  }

  async function handleUpload(tipo: "logo_index" | "logo_app" | "favicon") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(tipo);
      try {
        const url = await uploadEmpresaLogo(empresaId, tipo, file);
        if (tipo === "logo_index") setLogoIndex(url);
        else if (tipo === "logo_app") setLogoApp(url);
        else setFavicon(url);
        await salvarEmpresaDesign(empresaId, {
          logo_index_url: tipo === "logo_index" ? url : logoIndex || undefined,
          logo_app_url: tipo === "logo_app" ? url : logoApp || undefined,
          favicon_url: tipo === "favicon" ? url : favicon || undefined,
        });
        toast.success("Upload OK!");
        loadConfig();
      } catch (e: any) {
        toast.error("Erro upload: " + e.message);
      }
      setUploading(null);
    };
    input.click();
  }

  async function handleSave() {
    setSaving(true);
    try {
      await salvarEmpresaDesign(empresaId, {
        logo_index_url: logoIndex || undefined,
        logo_app_url: logoApp || undefined,
        favicon_url: favicon || undefined,
      });
      toast.success("Branding salvo!");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  function LogoField({ label, tipo, url }: {
    label: string;
    tipo: "logo_index" | "logo_app" | "favicon";
    url: string;
  }) {
    return (
      <div className="rounded-xl bg-input-bg p-4">
        <label className="text-xs font-medium text-text-muted mb-2 block">{label}</label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-lg border border-border-subtle bg-white flex items-center justify-center overflow-hidden shrink-0">
            {url ? (
              <img src={url} className="w-full h-full object-contain" alt={label} />
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
              placeholder="URL externa..."
              className="w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-xs font-mono outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleUpload(tipo)}
                disabled={uploading === tipo}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-xs font-medium hover:bg-accent-hover disabled:opacity-50"
              >
                {uploading === tipo ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}{" "}
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: "/empresa" })}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-text-main flex items-center gap-2">
          <Image size={18} className="text-accent" /> Branding
        </h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-card p-4 border border-border-subtle">
          <h2 className="text-sm font-bold text-text-main mb-3">Logomarcas e Favicon</h2>
          <p className="text-xs text-text-muted mb-4">
            Upload de arquivos ou URL externa. Uploads vão p/ storage Supabase.
          </p>
          <div className="space-y-4">
            <LogoField label="Logo Página de Login" tipo="logo_index" url={logoIndex} />
            <LogoField label="Logo Aplicação (header)" tipo="logo_app" url={logoApp} />
            <LogoField label="Favicon" tipo="favicon" url={favicon} />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{" "}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
