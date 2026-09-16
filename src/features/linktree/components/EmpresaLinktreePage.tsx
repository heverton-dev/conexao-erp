import { useState, useEffect, useRef } from "react";
import {
  Link2,
  QrCode,
  ExternalLink,
  Loader2,
  Save,
  Upload,
  Trash2,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { useAuth } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import {
  useEmpresaConfig,
  useSalvarEmpresaConfig,
  useSecoes,
  useLinks,
  useAnalytics,
} from "../hooks/useEmpresaLinktree";
import { SectionManager } from "./SectionManager";
import { LinksList } from "./LinksList";
import { ThemePanel } from "./ThemePanel";
import { EmpresaLinktreePreview } from "./EmpresaLinktreePreview";
import { EmpresaSelector } from "./EmpresaSelector";
import { EmpresaQrModal } from "./EmpresaQrModal";
import { compressImage } from "~/features/linktree/lib/image-utils";
import {
  DEFAULT_EMPRESA_THEME,
  normalizeEmpresaTheme,
  isValidSlug,
} from "../types-empresa";
import type { EmpresaLinktreeTheme, AnalyticsPeriodo } from "../types-empresa";
import { buildEmpresaLinktreeUrl } from "../services/empresa";

const PERIODOS: { value: AnalyticsPeriodo; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
];

export function EmpresaLinktreePage() {
  const { profile } = useAuth();
  const isSuper = profile?.is_super_admin === true;

  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(
    isSuper ? null : EMPRESA_ID,
  );

  const { data: config, isLoading: loadingConfig } =
    useEmpresaConfig(selectedEmpresaId);
  const { data: sections = [] } = useSecoes(selectedEmpresaId);
  const { data: links = [] } = useLinks(selectedEmpresaId);
  const salvar = useSalvarEmpresaConfig(selectedEmpresaId);

  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState<EmpresaLinktreeTheme>(
    DEFAULT_EMPRESA_THEME,
  );
  const [slugError, setSlugError] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [periodo, setPeriodo] = useState<AnalyticsPeriodo>("30d");
  const { data: analytics = [] } = useAnalytics(periodo, selectedEmpresaId);
  const bannerRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (config) {
      setSlug(config.slug ?? "");
      setBio(config.bio ?? "");
      setBannerUrl(config.banner_url ?? "");
      setAvatarUrl(config.avatar_url ?? "");
      setTheme(normalizeEmpresaTheme(config.theme));
    }
  }, [config]);

  function handleSlugChange(v: string) {
    const clean = v.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(clean);
    setSlugError(
      clean.length >= 3 && !isValidSlug(clean)
        ? "Slug reservado ou invalido"
        : "",
    );
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (max 8MB)");
      return;
    }
    setUploadingBanner(true);
    try {
      const dataUrl = await compressImage(f, 1200, 0.85);
      setBannerUrl(dataUrl);
    } catch {
      toast.error("Falha ao processar imagem");
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Imagem muito grande (max 4MB)");
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await compressImage(f, 512, 0.85);
      setAvatarUrl(dataUrl);
    } catch {
      toast.error("Falha ao processar imagem");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (!selectedEmpresaId) {
      toast.error("Selecione uma empresa");
      return;
    }
    if (!slug || !isValidSlug(slug)) {
      setSlugError("Slug invalido");
      return;
    }
    try {
      await salvar.mutateAsync({
        slug,
        bio: bio || null,
        banner_url: bannerUrl || null,
        avatar_url: avatarUrl || null,
        theme,
      });
      toast.success("Linktree salvo!");
    } catch (e: any) {
      console.error("[Linktree] Erro ao salvar:", e);
      toast.error(`Erro ao salvar: ${e?.message ?? "desconhecido"}`);
    }
  }

  if (isSuper && !selectedEmpresaId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-main">
          LinkTree da Empresa
        </h1>
        <p className="text-sm text-muted-foreground">
          Selecione uma empresa para gerenciar o linktree.
        </p>
        <div className="max-w-sm">
          <EmpresaSelector
            value={selectedEmpresaId}
            onChange={setSelectedEmpresaId}
          />
        </div>
      </div>
    );
  }

  if (loadingConfig) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const publicUrl = config ? buildEmpresaLinktreeUrl(config.slug) : null;
  const maxCliques = Math.max(...analytics.map((a) => a.total_cliques), 1);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-text-main">
            LinkTree da Empresa
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {config?.bio || "Gerencie o linktree da sua empresa."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {config && (
            <>
              <Button variant="outline" onClick={() => setQrOpen(true)}>
                <QrCode className="size-4" />
                <span className="hidden sm:inline">QR Code</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(publicUrl!, "_blank")}
              >
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">Ver pagina</span>
              </Button>
            </>
          )}
          <Button
            onClick={handleSave}
            disabled={salvar.isPending || !selectedEmpresaId}
          >
            {salvar.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}{" "}
            Salvar
          </Button>
        </div>
      </header>

      {isSuper && (
        <div className="max-w-sm">
          <EmpresaSelector
            value={selectedEmpresaId}
            onChange={setSelectedEmpresaId}
          />
        </div>
      )}

      {config && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted-foreground">Slug</p>
            <p className="font-mono text-lg font-bold">/e/{config.slug}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted-foreground">Total de Links</p>
            <p className="text-lg font-bold">{links.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted-foreground">Secoes</p>
            <p className="text-lg font-bold">{sections.length}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="rounded-xl border border-border bg-surface p-5">
          <Tabs defaultValue="links">
            <TabsList className="grid w-full grid-cols-4 bg-surface-hover">
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="conteudo">Conteudo</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="links" className="space-y-6 pt-5">
              <SectionManager
                sections={sections}
                empresaId={selectedEmpresaId}
              />
              <LinksList
                sections={sections}
                links={links}
                empresaId={selectedEmpresaId}
              />
            </TabsContent>

            <TabsContent value="visual" className="pt-5">
              <ThemePanel theme={theme} onChange={setTheme} bio={bio} onBioChange={setBio} />
            </TabsContent>

            <TabsContent value="conteudo" className="space-y-5 pt-5">
              <div className="space-y-1.5">
                <Label>Slug (URL publica)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/e/</span>
                  <Input
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="minha-empresa"
                    className={slugError ? "border-error" : ""}
                  />
                </div>
                {slugError && (
                  <p className="text-xs text-error">{slugError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Banner</Label>
                {bannerUrl && (
                  <div className="relative inline-block w-full">
                    <img
                      src={bannerUrl}
                      alt="Banner"
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2"
                      onClick={() => setBannerUrl("")}
                    >
                      <Trash2 className="size-4 text-error" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => bannerRef.current?.click()}
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}{" "}
                    Enviar banner
                  </Button>
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="ou cole a URL da imagem"
                    className="text-sm"
                  />
                </div>
                <input
                  ref={bannerRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 1200x400px, JPG/PNG ate 8MB
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Avatar (logo redondo)</Label>
                {avatarUrl && (
                  <div className="flex items-center gap-3">
                    <div className="size-16 shrink-0 overflow-hidden rounded-full border-2 border-border">
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="size-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setAvatarUrl("")}
                    >
                      <Trash2 className="size-4 text-error" /> Remover
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => avatarRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}{" "}
                    Enviar avatar
                  </Button>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="ou cole a URL da imagem"
                    className="text-sm"
                  />
                </div>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 400x400px, PNG com fundo transparente
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">
                  <BarChart3 className="size-4" />
                  Analytics
                </h3>
                <div className="flex gap-1">
                  {PERIODOS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPeriodo(p.value)}
                      className={`rounded px-2 py-1 text-xs transition ${
                        periodo === p.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-hover text-muted-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {analytics.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum clique registrado.
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.map((item) => (
                    <div key={item.link_id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate">{item.link_titulo}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.total_cliques}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${(item.total_cliques / maxCliques) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <EmpresaLinktreePreview
          sections={sections}
          links={links.filter((l) => l.ativo)}
          theme={theme}
          bio={bio}
          bannerUrl={bannerUrl}
          avatarUrl={avatarUrl}
          empresaNome={theme.institucional.nomeEmpresa || profile?.nome || "Sua Empresa"}
        />
      </div>

      {config && (
        <EmpresaQrModal
          open={qrOpen}
          onOpenChange={setQrOpen}
          slug={config.slug}
        />
      )}
    </div>
  );
}
