import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Globe, LogIn, User, Briefcase, Shield } from "lucide-react";
import { Slider } from "~/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { fetchHubConfig, upsertHubConfig } from "../../services/config";
import type { HubSystemConfig } from "../../types";

type CategoryKey =
  | "base"
  | "text"
  | "border"
  | "brand"
  | "feedback"
  | "components"
  | "header"
  | "hover"
  | "effects"
  | "gradients";
interface TokenDef {
  key: string;
  label: string;
  hint: string;
}

const CATEGORIES: Record<CategoryKey, { title: string; tokens: TokenDef[] }> = {
  base: {
    title: "🏗️ Estrutura Base",
    tokens: [
      { key: "background", label: "Background", hint: "Fundo geral da página" },
      { key: "surface", label: "Surface", hint: "Cards, painéis e modais" },
      { key: "card", label: "Card", hint: "Background de cards" },
    ],
  },
  text: {
    title: "✏️ Tipografia",
    tokens: [
      { key: "textMain", label: "Texto Principal", hint: "Títulos e corpo" },
      { key: "textMuted", label: "Texto Secundário", hint: "Legendas e hints" },
      {
        key: "textInverted",
        label: "Texto Invertido",
        hint: "Texto sobre fundos coloridos",
      },
    ],
  },
  border: {
    title: "📐 Bordas",
    tokens: [
      {
        key: "border",
        label: "Borda Principal",
        hint: "Divisores e contornos",
      },
      {
        key: "borderSubtle",
        label: "Borda Sutil",
        hint: "Separadores mais leves",
      },
    ],
  },
  brand: {
    title: "🎨 Marca / Accent",
    tokens: [
      { key: "accent", label: "Accent", hint: "Cor principal da marca" },
      { key: "accentHover", label: "Accent Hover", hint: "Hover do accent" },
      {
        key: "accentForeground",
        label: "Accent Foreground",
        hint: "Texto sobre accent",
      },
      {
        key: "accentMuted",
        label: "Accent Muted",
        hint: "Background suave do accent",
      },
    ],
  },
  feedback: {
    title: "🚦 Feedback / Status",
    tokens: [
      { key: "success", label: "Sucesso", hint: "Cor de sucesso" },
      {
        key: "successBg",
        label: "Sucesso BG",
        hint: "Background de badge sucesso",
      },
      { key: "warning", label: "Alerta", hint: "Cor de alerta" },
      {
        key: "warningBg",
        label: "Alerta BG",
        hint: "Background de badge alerta",
      },
      { key: "error", label: "Erro", hint: "Cor de erro" },
      { key: "errorBg", label: "Erro BG", hint: "Background de badge erro" },
    ],
  },
  components: {
    title: "🧩 Componentes",
    tokens: [
      { key: "inputBg", label: "Input Background", hint: "Fundo de campos" },
      { key: "inputBorder", label: "Input Borda", hint: "Borda de campos" },
      { key: "inputFocus", label: "Input Focus", hint: "Ring de foco" },
      {
        key: "buttonPrimaryBg",
        label: "Botão Primário BG",
        hint: "Fundo do botão principal",
      },
      {
        key: "buttonPrimaryText",
        label: "Botão Primário Texto",
        hint: "Texto do botão principal",
      },
      { key: "badgeBg", label: "Badge Background", hint: "Fundo de badges" },
      {
        key: "tooltipBg",
        label: "Tooltip Background",
        hint: "Fundo de tooltips",
      },
      { key: "tooltipText", label: "Tooltip Texto", hint: "Texto de tooltips" },
    ],
  },
  header: {
    title: "🏛️ Cabeçalho",
    tokens: [
      {
        key: "headerBg",
        label: "Header Background",
        hint: "Fundo do cabeçalho",
      },
      {
        key: "glassTint",
        label: "Glass Tint",
        hint: "Tintura do efeito glass",
      },
      { key: "ring", label: "Focus Ring", hint: "Anel de foco geral" },
    ],
  },
  hover: {
    title: "👆 Efeitos de Hover",
    tokens: [
      {
        key: "surfaceHover",
        label: "Surface Hover",
        hint: "Hover de cards/items",
      },
      {
        key: "hoverBg",
        label: "Hover Background",
        hint: "Background ao passar o mouse",
      },
      {
        key: "hoverBorder",
        label: "Hover Borda",
        hint: "Cor da borda no hover",
      },
      {
        key: "hoverShadow",
        label: "Hover Sombra",
        hint: "Cor da sombra no hover",
      },
    ],
  },
  effects: {
    title: "✨ Efeitos & UI",
    tokens: [
      { key: "overlay", label: "Overlay", hint: "Fundo de modais/backdrops" },
      { key: "shadow", label: "Shadow", hint: "Cor das sombras" },
      {
        key: "scrollbarThumb",
        label: "Scrollbar",
        hint: "Cor da barra de rolagem",
      },
      {
        key: "scrollbarTrack",
        label: "Scrollbar Track",
        hint: "Trilha da barra de rolagem",
      },
    ],
  },
  gradients: {
    title: "🌈 Gradientes",
    tokens: [
      {
        key: "gradientStart",
        label: "Gradiente Início",
        hint: "Cor inicial do gradiente da marca",
      },
      {
        key: "gradientMid",
        label: "Gradiente Meio",
        hint: "Cor intermediária do gradiente",
      },
      {
        key: "gradientEnd",
        label: "Gradiente Fim",
        hint: "Cor final do gradiente",
      },
    ],
  },
};

const CATEGORY_ORDER: CategoryKey[] = [
  "base",
  "text",
  "border",
  "brand",
  "gradients",
  "header",
  "hover",
  "feedback",
  "components",
  "effects",
];

const DEFAULT_THEME = {
  background: "#0f172a",
  surface: "#1e293b",
  surfaceHover: "#334155",
  card: "#1e293b",
  textMain: "#f8fafc",
  textMuted: "#94a3b8",
  textInverted: "#0f172a",
  border: "transparent",
  borderSubtle: "#1e293b",
  accent: "#c9a655",
  accentHover: "#d4b366",
  accentForeground: "#0f172a",
  accentMuted: "#c9a65520",
  success: "#22c55e",
  successBg: "#22c55e15",
  warning: "#eab308",
  warningBg: "#eab30815",
  error: "#ef4444",
  errorBg: "#ef444415",
  inputBg: "#0f172a",
  inputBorder: "#334155",
  inputFocus: "#c9a655",
  buttonPrimaryBg: "#c9a655",
  buttonPrimaryText: "#0f172a",
  badgeBg: "#334155",
  tooltipBg: "#f8fafc",
  tooltipText: "#0f172a",
  overlay: "#00000080",
  shadow: "#00000040",
  glassTint: "#ffffff10",
  headerBg: "#1e293b",
  scrollbarThumb: "#c9a655",
  scrollbarTrack: "transparent",
  ring: "#c9a65580",
  gradientStart: "#c9a655",
  gradientMid: "#e8d48b",
  gradientEnd: "#a8873a",
  hoverBg: "#334155",
  hoverBorder: "#c9a65540",
  hoverScale: "1.02",
  hoverShadow: "#c9a65525",
};

const ENV_TABS = [
  { key: "global" as const, label: "Global", icon: Globe },
  { key: "auth" as const, label: "Login", icon: LogIn },
  { key: "client" as const, label: "Cliente", icon: User },
  { key: "manager" as const, label: "Gestor", icon: Briefcase },
  { key: "admin" as const, label: "Admin", icon: Shield },
];

const DEFAULT_ENV = {
  pageBg: "#0f172a",
  blob1Color: "#c9a655",
  blob2Color: "#e8d48b",
  blob3Color: "#a8873a",
  blobOpacity: "0.20",
  blobSize: "18",
  blobBlur: "64",
  grainOpacity: "0.20",
  grainBlendMode: "multiply",
  grainContrast: "150",
  glassOpacity: "0.40",
  glassBlur: "24",
  glassBorderOpacity: "0.10",
};

function ColorInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
}) {
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="relative h-8 w-8 shrink-0 rounded-md overflow-hidden border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: value || "#000" }}
        />
        <input
          type="color"
          value={value?.startsWith("#") ? value.slice(0, 7) : "#000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span
          className="text-[11px] font-semibold block truncate"
          style={{ color: "var(--color-text-main)" }}
        >
          {label}
        </span>
        <span
          className="text-[10px] block truncate"
          style={{ color: "var(--color-text-muted)" }}
        >
          {hint}
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[90px] p-1.5 rounded text-[11px] font-mono uppercase text-center focus:ring-2 outline-none transition-colors shrink-0"
        style={{
          color: "var(--color-text-main)",
          backgroundColor: "var(--color-input-bg)",
          border: "1px solid var(--color-input-border)",
        }}
      />
    </div>
  );
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint: string;
  unit?: string;
}) {
  return (
    <div
      className="py-2 px-3 rounded-lg"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span
            className="text-[11px] font-semibold block"
            style={{ color: "var(--color-text-main)" }}
          >
            {label}
          </span>
          <span
            className="text-[10px] block"
            style={{ color: "var(--color-text-muted)" }}
          >
            {hint}
          </span>
        </div>
        <span
          className="text-[11px] font-mono font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-accent) 10%, transparent)",
            color: "var(--color-accent)",
          }}
        >
          {value}
          {unit || ""}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

export function ThemeEditorPanel() {
  const { empresa } = useAuth();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<Record<string, string>>(DEFAULT_THEME);
  const [envThemes, setEnvThemes] = useState<
    Record<string, Record<string, string>>
  >({
    global: { ...DEFAULT_ENV },
    auth: { ...DEFAULT_ENV },
    client: { ...DEFAULT_ENV },
    manager: { ...DEFAULT_ENV },
    admin: { ...DEFAULT_ENV },
  });
  const [activeEnv, setActiveEnv] = useState<
    "global" | "auth" | "client" | "manager" | "admin"
  >("global");

  const { data: config } = useQuery({
    queryKey: ["hub-config", empresa?.id],
    queryFn: () => fetchHubConfig(),
    enabled: !!empresa?.id,
  });

  useEffect(() => {
    if (config?.theme_dark && Object.keys(config.theme_dark).length > 0) {
      setTheme(config.theme_dark as Record<string, string>);
    }
    if (
      config?.environment_themes &&
      Object.keys(config.environment_themes).length > 0
    ) {
      setEnvThemes(
        config.environment_themes as Record<string, Record<string, string>>,
      );
    }
  }, [config]);

  const applyTheme = useCallback((t: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(t).forEach(([k, v]) => {
      const cssVar = `--color-${k.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssVar, v);
    });
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertHubConfig({
        empresa_id: empresa!.id,
        theme_dark: theme as any,
        environment_themes: envThemes as any,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["hub-config"] }),
  });

  const updateToken = (key: string, value: string) => {
    const next = { ...theme, [key]: value };
    setTheme(next);
    applyTheme(next);
  };

  const updateEnvToken = (envKey: string, tokenKey: string, value: string) => {
    setEnvThemes((prev) => ({
      ...prev,
      [envKey]: { ...prev[envKey], [tokenKey]: value },
    }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold"
          style={{ color: "var(--color-text-main)" }}
        >
          Personalização Visual
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetTheme}>
            <RotateCcw className="mr-1 h-3 w-3" /> Resetar
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tokens">
        <TabsList>
          <TabsTrigger value="tokens">Tokens de Cores</TabsTrigger>
          <TabsTrigger value="environment">Efeitos por Ambiente</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-4">
          {CATEGORY_ORDER.map((catKey) => {
            const cat = CATEGORIES[catKey];
            return (
              <div
                key={catKey}
                className="p-4 rounded-xl border"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <h4
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {cat.title}
                </h4>
                <div className="space-y-1">
                  {cat.tokens.map((tok) => (
                    <ColorInput
                      key={tok.key}
                      label={tok.label}
                      value={theme[tok.key] || ""}
                      onChange={(v) => updateToken(tok.key, v)}
                      hint={tok.hint}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Tabs value={activeEnv} onValueChange={(v) => setActiveEnv(v as any)}>
            <TabsList>
              {ENV_TABS.map((et) => (
                <TabsTrigger key={et.key} value={et.key}>
                  <et.icon className="mr-1 h-3 w-3" /> {et.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              🫧 Blobs Animados
            </h4>
            <ColorInput
              label="Cor Blob 1"
              value={envThemes[activeEnv]?.blob1Color || ""}
              onChange={(v) => updateEnvToken(activeEnv, "blob1Color", v)}
              hint="Primeiro blob"
            />
            <ColorInput
              label="Cor Blob 2"
              value={envThemes[activeEnv]?.blob2Color || ""}
              onChange={(v) => updateEnvToken(activeEnv, "blob2Color", v)}
              hint="Segundo blob"
            />
            <ColorInput
              label="Cor Blob 3"
              value={envThemes[activeEnv]?.blob3Color || ""}
              onChange={(v) => updateEnvToken(activeEnv, "blob3Color", v)}
              hint="Terceiro blob"
            />
            <SliderInput
              label="Opacidade"
              value={parseFloat(envThemes[activeEnv]?.blobOpacity || "0.20")}
              onChange={(v) =>
                updateEnvToken(activeEnv, "blobOpacity", String(v))
              }
              min={0}
              max={1}
              step={0.05}
              hint="Transparência dos blobs"
            />
            <SliderInput
              label="Tamanho"
              value={parseFloat(envThemes[activeEnv]?.blobSize || "18")}
              onChange={(v) => updateEnvToken(activeEnv, "blobSize", String(v))}
              min={5}
              max={50}
              step={1}
              hint="Tamanho em rem"
              unit="rem"
            />
            <SliderInput
              label="Blur"
              value={parseFloat(envThemes[activeEnv]?.blobBlur || "64")}
              onChange={(v) => updateEnvToken(activeEnv, "blobBlur", String(v))}
              min={0}
              max={200}
              step={1}
              hint="Desfoque em px"
              unit="px"
            />
          </div>
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              🌫️ Grain Texture
            </h4>
            <SliderInput
              label="Opacidade"
              value={parseFloat(envThemes[activeEnv]?.grainOpacity || "0.20")}
              onChange={(v) =>
                updateEnvToken(activeEnv, "grainOpacity", String(v))
              }
              min={0}
              max={1}
              step={0.05}
              hint="Intensidade do grain"
            />
            <SliderInput
              label="Contraste"
              value={parseFloat(envThemes[activeEnv]?.grainContrast || "150")}
              onChange={(v) =>
                updateEnvToken(activeEnv, "grainContrast", String(v))
              }
              min={0}
              max={300}
              step={10}
              hint="Contraste da textura"
            />
          </div>
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              ✨ Glass Effects
            </h4>
            <SliderInput
              label="Blur"
              value={parseFloat(envThemes[activeEnv]?.glassBlur || "24")}
              onChange={(v) =>
                updateEnvToken(activeEnv, "glassBlur", String(v))
              }
              min={0}
              max={50}
              step={1}
              hint="Desfoque do glass"
              unit="px"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
