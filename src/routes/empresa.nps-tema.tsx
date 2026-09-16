import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { useState, useEffect } from "react";
import {
  salvarEmpresaConfig,
  uploadEmpresaLogo,
  buscarEmpresa,
  buscarEmpresaConfig,
} from "~/shared/empresas";
import { EMPRESA_ID } from "~/config/empresa";
import { NPS_SURVEY_DEFAULTS, SURVEY_COLOR_GROUPS } from "~/features/nps/theme";
import {
  Palette,
  Save,
  Loader2,
  Eye,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Trash2,
  Image,
  Plus,
} from "lucide-react";
import { NpsBackground } from "~/features/nps/NpsBackground";
import {
  BLOB_POSITIONS,
  type NpsBlob,
  type BlobPosition,
  getBlobsFromColors,
  blobsToColorsString,
  getNpsBackgroundStyleFromColors,
} from "~/features/nps/theme";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Empresa } from "~/core/empresa";
import { RequirePermission } from "~/components/guards";

export const empresaNpsTemaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/nps/tema",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <NpsTemaPage />
    </RequirePermission>
  ),
});

const DEFAULT_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23C5A880' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='3' width='7' height='7'%3E%3C/rect%3E%3Crect x='3' y='14' width='7' height='7'%3E%3C/rect%3E%3Crect x='14' y='14' width='7' height='7'%3E%3C/rect%3E%3C/svg%3E";

/* ---------- TemaPreview — renders card + modal live ---------- */
function TemaPreview({
  colors,
  logoUrl,
  empresaNome,
  showModal,
  onToggleModal,
  noBorders,
}: {
  colors: Record<string, string>;
  logoUrl: string | null;
  empresaNome: string;
  showModal: boolean;
  onToggleModal: () => void;
  noBorders: boolean;
}) {
  // Keys use underscore (survey_bg) but CSS vars use hyphen (--nps-survey-bg)
  const cssVars = Object.fromEntries(
    Object.entries(colors).map(([k, v]) => [
      `--nps-${k.replace(/_/g, "-")}`,
      v,
    ]),
  ) as React.CSSProperties;

  const logoHeight = parseInt(colors.logo_height ?? "32") || 32;
  const showName = colors.show_company_name !== "false";
  const headerAlign = colors.header_align ?? "center";

  const justifyClass =
    headerAlign === "left"
      ? "justify-start"
      : headerAlign === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <div className="flex flex-col items-center gap-6" style={cssVars}>
      {/* Card preview */}
      <div
        className={`w-full max-w-md bg-[var(--nps-card-bg)] ${noBorders ? "border-0" : "border border-[var(--nps-card-border)]"} backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden`}
      >
        {/* Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[var(--nps-survey-glow)]/20 to-transparent ${noBorders ? "opacity-0" : ""}`}
        />

        {/* Header: logo + divider + name */}
        <div className={`flex items-center gap-3 mb-6 ${justifyClass}`}>
          <img
            src={logoUrl || DEFAULT_LOGO}
            alt={empresaNome}
            style={{ height: `${logoHeight}px` }}
            className="w-auto object-contain flex-shrink-0"
          />
          {showName && (
            <>
              <div
                className={`w-px bg-[var(--nps-header-divider)] flex-shrink-0 ${noBorders ? "opacity-0" : ""}`}
                style={{ height: `${logoHeight}px` }}
              />
              <h2 className="text-lg font-bold text-[var(--nps-header-logo-text)] tracking-tight truncate">
                {empresaNome}
              </h2>
            </>
          )}
        </div>

        {/* Body */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-widest text-[var(--nps-step-text)] font-semibold">
              Etapa 1 de 3
            </span>
            <h1 className="text-xl md:text-2xl font-semibold text-[var(--nps-question-text)] text-center tracking-tight mt-2">
              Qual a probabilidade de nos recomendar?
            </h1>
          </div>

          {/* NPS buttons */}
          <div className="mt-8 mb-4">
            <div className="flex w-full justify-between items-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = num === 9;
                return (
                  <button
                    key={num}
                    className={`aspect-square w-full max-w-[36px] flex items-center justify-center rounded-md md:rounded-lg font-medium text-[13px] md:text-sm transition-all duration-200 outline-none cursor-default
                      ${
                        isSelected
                          ? "bg-[var(--nps-nps-btn-selected-bg)] text-[var(--nps-nps-btn-selected-text)] font-bold scale-110 z-10"
                          : "bg-[var(--nps-nps-btn-bg)] text-[var(--nps-nps-btn-text)]"
                      }
                      ${noBorders ? "" : "border border-transparent"}
                    `}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-[var(--nps-step-text)] mt-4 px-1">
              <span>Nada provável</span>
              <span>Extremamente provável</span>
            </div>
          </div>

          {/* Single choice option */}
          <div className="space-y-3 mt-6">
            {["Sim, com certeza", "Talvez", "Não"].map((opt, i) => {
              const isSelected = i === 0;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-default ${
                    isSelected
                      ? `bg-[var(--nps-option-selected-bg)] ${noBorders ? "" : "border border-[var(--nps-option-selected-border)]"}`
                      : `bg-[var(--nps-option-bg)] ${noBorders ? "" : "border border-[var(--nps-option-border)]"}`
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${noBorders ? "" : "border-2"} ${
                      isSelected
                        ? "border-[var(--nps-radio-selected)]"
                        : "border-[var(--nps-radio-border)]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 bg-[var(--nps-radio-selected)] rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-sm flex-1 ${
                      isSelected
                        ? "text-[var(--nps-option-text-selected)] font-medium"
                        : "text-[var(--nps-option-text)]"
                    }`}
                  >
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className={`flex justify-between items-center mt-8 pt-6 ${noBorders ? "border-t-0" : "border-t border-[var(--nps-divider-footer)]"}`}
          >
            <div className="flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium text-[var(--nps-btn-back-text)]">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </div>
            <div className="flex items-center gap-2 px-6 h-10 rounded-lg text-sm font-bold bg-[var(--nps-btn-next-bg)] text-[var(--nps-btn-next-text)]">
              Próxima <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Toggle modal button */}
      <button
        onClick={onToggleModal}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-300 text-sm hover:bg-zinc-800 transition-colors ${noBorders ? "" : "border border-zinc-700"}`}
      >
        {showModal ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {showModal ? "Fechar Modal" : "Ver Modal de Alerta"}
      </button>

      {/* Modal overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--nps-modal-overlay)] backdrop-blur-sm"
          onClick={onToggleModal}
        >
          <div
            className={`bg-[var(--nps-modal-bg)] ${noBorders ? "" : "border border-[var(--nps-modal-border)]"} rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div
                className={`w-12 h-12 bg-[var(--nps-modal-icon-bg)] rounded-full flex items-center justify-center mx-auto mb-4 ${noBorders ? "" : "border border-[var(--nps-modal-icon-border)]"}`}
              >
                <svg
                  className="w-6 h-6 text-[var(--nps-modal-icon-color)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--nps-modal-title)] mb-2">
                Pergunta obrigatória
              </h3>
              <p className="text-sm text-[var(--nps-modal-subtitle)] mb-6">
                Por favor, responda a pergunta antes de continuar.
              </p>
              <button className="w-full bg-[var(--nps-modal-btn-bg)] hover:bg-[var(--nps-modal-btn-hover)] text-[var(--nps-modal-btn-text)] rounded-lg px-6 py-2.5 text-sm font-bold transition-colors">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS_CONFIG = [
  {
    id: "geral",
    label: "Design Geral",
    groups: ["bg-card", "header", "texts"],
  },
  {
    id: "componentes",
    label: "Componentes & Form",
    groups: ["nps-buttons", "options", "input"],
  },
  {
    id: "acoes",
    label: "Navegação & Alertas",
    groups: ["footer", "completion", "modal"],
  },
];

/* ---------- Main editor page ---------- */
function NpsTemaPage() {
  const selectedEmpresaId = EMPRESA_ID;

  const [empresaNome, setEmpresaNome] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>({
    ...NPS_SURVEY_DEFAULTS,
  });
  const [showModal, setShowModal] = useState(false);
  const noBorders = colors.no_borders === "true";

  // Init: load config
  useEffect(() => {
    setLoadingEmp(false);
  }, []);

  // Load empresa config when selected changes
  useEffect(() => {
    if (!selectedEmpresaId) return;

    Promise.all([
      buscarEmpresa(selectedEmpresaId).catch(() => null),
      buscarEmpresaConfig(selectedEmpresaId).catch(() => null),
    ]).then(([emp, config]) => {
      setEmpresaNome(emp?.nome ?? "Empresa");
      // Preferir logo_app_url, fallback para logo_index_url
      setLogoUrl(
        config?.logo_app_url ||
          config?.logo_index_url ||
          (emp as any)?.logo_url ||
          null,
      );
      if (config?.theme) {
        const t = config.theme as Record<string, any>;
        const saved = (t.nps_survey ?? {}) as Record<string, string>;
        setColors({ ...NPS_SURVEY_DEFAULTS, ...saved });
      } else {
        setColors({ ...NPS_SURVEY_DEFAULTS });
      }
    });
  }, [selectedEmpresaId]);

  function handleColorChange(key: string, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }));
  }

  function handleToggle(key: string) {
    setColors((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  }

  async function handleSave() {
    if (!selectedEmpresaId) return;
    setSaving(true);
    try {
      const config = await buscarEmpresaConfig(selectedEmpresaId);
      const currentTheme = (config?.theme ?? {}) as Record<string, any>;
      await salvarEmpresaConfig(selectedEmpresaId, {
        theme: { ...currentTheme, nps_survey: colors } as any,
      });
      toast.success(`Tema salvo para ${empresaNome}!`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    }
    setSaving(false);
  }

  async function handleUploadLogo() {
    if (!selectedEmpresaId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadEmpresaLogo(
          selectedEmpresaId,
          "logo_app",
          file,
        );
        setLogoUrl(url);
        await salvarEmpresaConfig(selectedEmpresaId, { logo_app_url: url });
        toast.success("Logo atualizado!");
      } catch (e: any) {
        toast.error("Erro no upload: " + e.message);
      }
      setUploading(false);
    };
    input.click();
  }

  async function handleRemoveLogo() {
    if (!selectedEmpresaId) return;
    try {
      await salvarEmpresaConfig(selectedEmpresaId, { logo_app_url: undefined });
      setLogoUrl(null);
      toast.success("Logo removido!");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loadingEmp) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Personalizar Tema da Pesquisa NPS
              </h1>
              <p className="text-xs text-muted-foreground">
                Todas as cores do card e modal de alerta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={handleSave}
              disabled={saving || !selectedEmpresaId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Salvar
            </button>
          </div>
        </div>
        {/* Body: editor + preview */}
        <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-8">
          {/* Left: color editor */}
          <div className="w-full lg:w-[500px] flex-shrink-0 space-y-4">
            {/* Logo do cabeçalho */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/20">
                <CardTitle className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                  Logo do Cabeçalho da Pesquisa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Preview do logo */}
                  <div className="w-20 h-20 rounded-xl border border-border/50 bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Esta imagem será exibida no cabeçalho da pesquisa.
                      Configure as opções abaixo.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUploadLogo}
                        disabled={uploading || !selectedEmpresaId}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                      >
                        {uploading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Upload size={12} />
                        )}
                        {logoUrl ? "Trocar Logo" : "Enviar Logo"}
                      </button>
                      {logoUrl && (
                        <button
                          onClick={handleRemoveLogo}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 size={12} /> Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Opções do cabeçalho */}
                <div className="mt-4 pt-4 border-t border-border/20 grid grid-cols-2 gap-4">
                  {/* Tamanho do logo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Altura do Logo (px)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={16}
                        max={120}
                        step={2}
                        value={parseInt(colors.logo_height ?? "32") || 32}
                        onChange={(e) =>
                          handleColorChange(
                            "logo_height",
                            String(
                              Math.max(
                                16,
                                Math.min(120, Number(e.target.value)),
                              ),
                            ),
                          )
                        }
                        className="w-full h-8 px-2 py-1 bg-muted/40 border border-border/50 rounded-lg text-foreground text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">
                        px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={120}
                      step={2}
                      value={parseInt(colors.logo_height ?? "32") || 32}
                      onChange={(e) =>
                        handleColorChange("logo_height", e.target.value)
                      }
                      className="w-full h-1.5 accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Mostrar nome da empresa */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Nome da Empresa
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/40 cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={colors.show_company_name !== "false"}
                        onChange={() => handleToggle("show_company_name")}
                        className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-medium text-foreground block">
                          Exibir nome
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ao lado do logo
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Alinhamento do cabeçalho */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Alinhamento do Cabeçalho
                    </label>
                    <div className="flex gap-1.5">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() =>
                            handleColorChange("header_align", align)
                          }
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                            (colors.header_align ?? "center") === align
                              ? "bg-accent text-accent-fg"
                              : "bg-muted/30 text-muted-foreground border border-border/40 hover:bg-muted/50"
                          }`}
                        >
                          {align === "left"
                            ? "◀"
                            : align === "right"
                              ? "▶"
                              : "⇔"}
                          <span className="capitalize">
                            {align === "left"
                              ? "Esquerdo"
                              : align === "right"
                                ? "Direito"
                                : "Centro"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plano de fundo */}
            <Card className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/20">
                <CardTitle className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                  Plano de Fundo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Tipo de fundo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Tipo de Fundo
                  </label>
                  <div className="flex gap-1.5">
                    {[
                      { value: "solid", label: "Sólido" },
                      { value: "gradient-2", label: "Gradiente 2 cores" },
                      { value: "gradient-3", label: "Gradiente 3 cores" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleColorChange("bg_type", opt.value)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          (colors.bg_type ?? "solid") === opt.value
                            ? "bg-accent text-accent-fg"
                            : "bg-muted/30 text-muted-foreground border border-border/40 hover:bg-muted/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cores */}
                {colors.bg_type === "solid" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Cor de Fundo
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/50 cursor-pointer shadow-inner bg-muted/20 flex-shrink-0">
                        <input
                          type="color"
                          value={
                            colors.bg_color?.startsWith("#")
                              ? colors.bg_color
                              : "#09090b"
                          }
                          onChange={(e) =>
                            handleColorChange("bg_color", e.target.value)
                          }
                          className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={colors.bg_color ?? "#09090b"}
                        onChange={(e) =>
                          handleColorChange("bg_color", e.target.value)
                        }
                        className="flex-1 min-w-0 h-8 px-2 py-1 bg-muted/40 border border-border/50 rounded-lg text-foreground text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Cor 1
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/50 cursor-pointer shadow-inner bg-muted/20 flex-shrink-0">
                          <input
                            type="color"
                            value={
                              colors.bg_gradient_1?.startsWith("#")
                                ? colors.bg_gradient_1
                                : "#0c162c"
                            }
                            onChange={(e) =>
                              handleColorChange("bg_gradient_1", e.target.value)
                            }
                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={colors.bg_gradient_1 ?? "#0c162c"}
                          onChange={(e) =>
                            handleColorChange("bg_gradient_1", e.target.value)
                          }
                          className="flex-1 min-w-0 h-8 px-2 py-1 bg-muted/40 border border-border/50 rounded-lg text-foreground text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Cor 2
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/50 cursor-pointer shadow-inner bg-muted/20 flex-shrink-0">
                          <input
                            type="color"
                            value={
                              colors.bg_gradient_2?.startsWith("#")
                                ? colors.bg_gradient_2
                                : "#192539"
                            }
                            onChange={(e) =>
                              handleColorChange("bg_gradient_2", e.target.value)
                            }
                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={colors.bg_gradient_2 ?? "#192539"}
                          onChange={(e) =>
                            handleColorChange("bg_gradient_2", e.target.value)
                          }
                          className="flex-1 min-w-0 h-8 px-2 py-1 bg-muted/40 border border-border/50 rounded-lg text-foreground text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>

                    {colors.bg_type === "gradient-3" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                          Cor 3
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/50 cursor-pointer shadow-inner bg-muted/20 flex-shrink-0">
                            <input
                              type="color"
                              value={
                                colors.bg_gradient_3?.startsWith("#")
                                  ? colors.bg_gradient_3
                                  : "#0c162c"
                              }
                              onChange={(e) =>
                                handleColorChange(
                                  "bg_gradient_3",
                                  e.target.value,
                                )
                              }
                              className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                            />
                          </div>
                          <input
                            type="text"
                            value={colors.bg_gradient_3 ?? "#0c162c"}
                            onChange={(e) =>
                              handleColorChange("bg_gradient_3", e.target.value)
                            }
                            className="flex-1 min-w-0 h-8 px-2 py-1 bg-muted/40 border border-border/50 rounded-lg text-foreground text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Angulo: {colors.bg_gradient_angle ?? "180"}°
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={1}
                        value={
                          parseInt(colors.bg_gradient_angle ?? "180") || 180
                        }
                        onChange={(e) =>
                          handleColorChange("bg_gradient_angle", e.target.value)
                        }
                        className="w-full h-1.5 accent-primary cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {/* Blobs decorativos */}
                <div className="pt-3 border-t border-border/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Blobs decorativos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Manchas suaves coloridas sobre o fundo
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={colors.bg_blobs_enabled === "true"}
                        onChange={() => handleToggle("bg_blobs_enabled")}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-muted/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>

                  {colors.bg_blobs_enabled === "true" && (
                    <div className="space-y-3">
                      {(() => {
                        let blobs: NpsBlob[] = [];
                        try {
                          blobs = JSON.parse(colors.bg_blobs ?? "[]");
                        } catch {
                          blobs = [];
                        }
                        return blobs.map((blob, idx) => (
                          <div
                            key={blob.id}
                            className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border/50 cursor-pointer shadow-inner bg-muted/20 flex-shrink-0">
                                <input
                                  type="color"
                                  value={
                                    blob.color?.startsWith("#")
                                      ? blob.color
                                      : "#0b5cf0"
                                  }
                                  onChange={(e) => {
                                    const newBlobs = [...blobs];
                                    newBlobs[idx] = {
                                      ...blob,
                                      color: e.target.value,
                                    };
                                    handleColorChange(
                                      "bg_blobs",
                                      JSON.stringify(newBlobs),
                                    );
                                  }}
                                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                />
                              </div>
                              <span className="text-xs font-mono text-muted-foreground flex-1">
                                {blob.color}
                              </span>
                              <button
                                onClick={() => {
                                  const newBlobs = blobs.filter(
                                    (_, i) => i !== idx,
                                  );
                                  handleColorChange(
                                    "bg_blobs",
                                    JSON.stringify(newBlobs),
                                  );
                                }}
                                className="text-destructive/70 hover:text-destructive transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Posição */}
                            <div className="grid grid-cols-3 gap-1">
                              {BLOB_POSITIONS.map((pos) => (
                                <button
                                  key={pos.value}
                                  onClick={() => {
                                    const newBlobs = [...blobs];
                                    newBlobs[idx] = {
                                      ...blob,
                                      position: pos.value as BlobPosition,
                                    };
                                    handleColorChange(
                                      "bg_blobs",
                                      JSON.stringify(newBlobs),
                                    );
                                  }}
                                  className={`px-1.5 py-1.5 rounded text-xs font-medium transition-all ${
                                    blob.position === pos.value
                                      ? "bg-accent text-accent-fg"
                                      : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50"
                                  }`}
                                >
                                  {pos.label}
                                </button>
                              ))}
                            </div>

                            {/* Tamanho + Opacidade */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground font-semibold block">
                                  Tamanho: {blob.size}px
                                </label>
                                <input
                                  type="range"
                                  min={50}
                                  max={500}
                                  step={5}
                                  value={blob.size}
                                  onChange={(e) => {
                                    const newBlobs = [...blobs];
                                    newBlobs[idx] = {
                                      ...blob,
                                      size: Number(e.target.value),
                                    };
                                    handleColorChange(
                                      "bg_blobs",
                                      JSON.stringify(newBlobs),
                                    );
                                  }}
                                  className="w-full h-1.5 accent-primary cursor-pointer"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground font-semibold block">
                                  Opacidade: {blob.opacity}%
                                </label>
                                <input
                                  type="range"
                                  min={1}
                                  max={30}
                                  step={1}
                                  value={blob.opacity}
                                  onChange={(e) => {
                                    const newBlobs = [...blobs];
                                    newBlobs[idx] = {
                                      ...blob,
                                      opacity: Number(e.target.value),
                                    };
                                    handleColorChange(
                                      "bg_blobs",
                                      JSON.stringify(newBlobs),
                                    );
                                  }}
                                  className="w-full h-1.5 accent-primary cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        ));
                      })()}

                      <button
                        onClick={() => {
                          const existing: NpsBlob[] = (() => {
                            try {
                              return JSON.parse(colors.bg_blobs ?? "[]");
                            } catch {
                              return [];
                            }
                          })();
                          const newBlob: NpsBlob = {
                            id: `b${Date.now()}`,
                            color: "#6366f1",
                            position: "centro",
                            size: 200,
                            opacity: 5,
                          };
                          handleColorChange(
                            "bg_blobs",
                            JSON.stringify([...existing, newBlob]),
                          );
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 text-muted-foreground text-xs font-medium border border-border/30 hover:bg-muted/50 transition-colors w-full justify-center"
                      >
                        <Plus size={12} /> Adicionar blob
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sem bordas toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40 shadow-sm cursor-pointer hover:bg-muted/10 transition-colors">
              <input
                type="checkbox"
                checked={noBorders}
                onChange={() => handleToggle("no_borders")}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-foreground">
                  Sem bordas
                </span>
                <p className="text-xs text-muted-foreground">
                  Remove todas as bordas do card, opções e modal
                </p>
              </div>
            </label>

            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-muted/40 p-1 rounded-xl">
                {TABS_CONFIG.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-lg text-xs md:text-xs font-bold py-1.5 transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {TABS_CONFIG.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="space-y-4 focus-visible:outline-none"
                >
                  {SURVEY_COLOR_GROUPS.filter((g) =>
                    tab.groups.includes(g.group),
                  ).map((group) => (
                    <Card
                      key={group.group}
                      className="border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden"
                    >
                      <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/20">
                        <CardTitle className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                          {group.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                          {group.colors.map((def) => (
                            <div key={def.key} className="space-y-1">
                              <label
                                className="text-xs text-muted-foreground font-semibold block truncate"
                                title={def.label}
                              >
                                {def.label}
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border/50 cursor-pointer shadow-inner bg-muted/20 flex-shrink-0">
                                  <input
                                    type="color"
                                    value={
                                      colors[def.key]?.startsWith("#")
                                        ? colors[def.key]
                                        : "#cccccc"
                                    }
                                    onChange={(e) =>
                                      handleColorChange(def.key, e.target.value)
                                    }
                                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={colors[def.key] ?? ""}
                                  onChange={(e) =>
                                    handleColorChange(def.key, e.target.value)
                                  }
                                  className="flex-1 min-w-0 h-8 px-2 py-1 bg-muted/40 border border-border/50 rounded-lg text-foreground text-xs font-mono focus:outline-none focus:border-primary/50 transition-colors"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Right: preview com janela de navegador simulada */}
          <div className="flex-1 min-h-[600px] flex flex-col items-center">
            <div className="w-full max-w-lg border border-border/40 bg-card rounded-2xl shadow-2xl overflow-hidden">
              {/* Window header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground/70 font-mono">
                  pesquisa_nps_preview.html
                </span>
                <div className="w-12" /> {/* spacer */}
              </div>

              {/* Window content */}
              <div className="flex items-center justify-center min-h-[500px]">
                <NpsBackground
                  bgStyle={getNpsBackgroundStyleFromColors(colors)}
                  blobs={getBlobsFromColors(colors)}
                  className="p-8 flex items-center justify-center w-full"
                >
                  <TemaPreview
                    colors={colors}
                    logoUrl={logoUrl}
                    empresaNome={empresaNome}
                    showModal={showModal}
                    onToggleModal={() => setShowModal((v) => !v)}
                    noBorders={noBorders}
                  />
                </NpsBackground>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
