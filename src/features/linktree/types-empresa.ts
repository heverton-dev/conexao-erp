export type EmpresaLinkTipo = "link" | "image" | "inline_image";

export type EmpresaLayout = "hero" | "classic";

export type BlobPosition =
  | "tl"
  | "tc"
  | "tr"
  | "ml"
  | "mc"
  | "mr"
  | "bl"
  | "bc"
  | "br";

export interface BlobItem {
  enabled: boolean;
  color: string;
  position: BlobPosition;
  size: number;
  opacity: number;
}

export const BLOB_POSITIONS: { value: BlobPosition; label: string }[] = [
  { value: "tl", label: "Sup. esquerdo" },
  { value: "tc", label: "Sup. central" },
  { value: "tr", label: "Sup. direito" },
  { value: "ml", label: "Esquerdo" },
  { value: "mc", label: "Centro" },
  { value: "mr", label: "Direito" },
  { value: "bl", label: "Inf. esquerdo" },
  { value: "bc", label: "Inf. central" },
  { value: "br", label: "Inf. direito" },
];

export type BackgroundMode = "solid" | "gradient2" | "gradient3";

export interface EmpresaLinktreeTheme {
  layout: EmpresaLayout;
  background: {
    mode: BackgroundMode;
    solid: string;
    gradientFrom: string;
    gradientTo: string;
    gradientAngle: number;
    gradient3From: string;
    gradient3Mid: string;
    gradient3To: string;
    gradient3Angle: number;
    blobsEnabled: boolean;
    blobs: BlobItem[];
    watermarkUrl: string;
    watermarkOpacity: number;
    watermarkSize: number;
    watermarkPosition: BlobPosition;
    watermarkBlur: number;
  };
  icons: {
    pathColor: string;
    bgColor: string;
    strokeWidth: number;
  };
  avatar: {
    borderColor: string;
    borderWidth: number;
  };
  spacing: {
    sectionGap: number;
    linkGap: number;
    containerPaddingX: number;
    containerPaddingY: number;
  };
  buttons: {
    style: "rounded" | "square" | "pill";
    bgMode: "solid" | "gradient2" | "gradient3" | "transparent";
    bgColor: string;
    bgGradientFrom: string;
    bgGradientTo: string;
    bgGradientAngle: number;
    bgGradient3From: string;
    bgGradient3Mid: string;
    bgGradient3To: string;
    bgGradient3Angle: number;
    textColor: string;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    shadow: boolean;
    shadowSize: number;
    hoverBgColor: string;
    hoverTextColor: string;
    hoverScale: number;
  };
  typography: {
    font: string;
    titleColor: string;
    titleSize: number;
    bioColor: string;
    bioSize: number;
    sectionColor: string;
    buttonFont: string;
    buttonColor: string;
  };
  institucional: {
    nomeEmpresa: string;
    nomeEmpresaEnabled: boolean;
    endereco: string;
    enderecoEnabled: boolean;
    site: string;
    logoUrl: string;
    logoWidth: number;
    logoHeight: number;
    instagram: string;
    linkedin: string;
    facebook: string;
    youtube: string;
    instagramEnabled: boolean;
    linkedinEnabled: boolean;
    facebookEnabled: boolean;
    youtubeEnabled: boolean;
    socialColors: {
      instagram: string;
      linkedin: string;
      facebook: string;
      youtube: string;
    };
    socialIconSize: number;
  };
}

export interface EmpresaLinktreeConfig {
  id: string;
  empresa_id: string;
  slug: string;
  bio: string | null;
  banner_url: string | null;
  avatar_url: string | null;
  theme: EmpresaLinktreeTheme;
  updated_at: string;
  updated_by: string | null;
}

export interface EmpresaLinktreeSection {
  id: string;
  empresa_id: string;
  titulo: string;
  imagem_url: string | null;
  ordem: number;
  created_at: string;
}

export interface EmpresaLinktreeLink {
  id: string;
  section_id: string;
  empresa_id: string;
  titulo: string;
  descricao: string | null;
  url: string;
  icone: string | null;
  imagem_url: string | null;
  tipo: EmpresaLinkTipo;
  pinned: boolean;
  destaque: boolean;
  ativo: boolean;
  agendado_inicio: string | null;
  agendado_fim: string | null;
  ordem: number;
  created_at: string;
}

export interface EmpresaLinktreeClick {
  id: string;
  link_id: string;
  empresa_id: string;
  clicked_at: string;
  ip_hash: string | null;
  user_agent: string | null;
}

export const DEFAULT_EMPRESA_THEME: EmpresaLinktreeTheme = {
  layout: "hero",
  background: {
    mode: "gradient2",
    solid: "#1a1a2e",
    gradientFrom: "#1a1a2e",
    gradientTo: "#16213e",
    gradientAngle: 160,
    gradient3From: "#0f172a",
    gradient3Mid: "#1e293b",
    gradient3To: "#0f172a",
    gradient3Angle: 160,
    blobsEnabled: false,
    blobs: [
      { enabled: true, color: "#46b98c", position: "tr", size: 320, opacity: 0.2 },
      { enabled: true, color: "#3b82f6", position: "bl", size: 280, opacity: 0.15 },
    ],
    watermarkUrl: "",
    watermarkOpacity: 0.05,
    watermarkSize: 300,
    watermarkPosition: "mc",
    watermarkBlur: 40,
  },
  icons: { pathColor: "#ffffff", bgColor: "#46b98c", strokeWidth: 1.5 },
  avatar: { borderColor: "#46b98c", borderWidth: 3 },
  spacing: { sectionGap: 24, linkGap: 12, containerPaddingX: 20, containerPaddingY: 24 },
  buttons: {
    style: "rounded",
    bgMode: "solid",
    bgColor: "#46b98c",
    bgGradientFrom: "#46b98c",
    bgGradientTo: "#2d8a63",
    bgGradientAngle: 135,
    bgGradient3From: "#46b98c",
    bgGradient3Mid: "#3da87a",
    bgGradient3To: "#2d8a63",
    bgGradient3Angle: 135,
    textColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 0,
    borderColor: "transparent",
    shadow: true,
    shadowSize: 8,
    hoverBgColor: "#3da87a",
    hoverTextColor: "#ffffff",
    hoverScale: 1.02,
  },
  typography: {
    font: "Inter",
    titleColor: "#ffffff",
    titleSize: 24,
    bioColor: "#94a3b8",
    bioSize: 14,
    sectionColor: "#94a3b8",
    buttonFont: "Inter",
    buttonColor: "#ffffff",
  },
  institucional: {
    nomeEmpresa: "",
    nomeEmpresaEnabled: true,
    endereco: "",
    enderecoEnabled: false,
    site: "",
    logoUrl: "",
    logoWidth: 120,
    logoHeight: 32,
    instagram: "",
    linkedin: "",
    facebook: "",
    youtube: "",
    instagramEnabled: false,
    linkedinEnabled: false,
    facebookEnabled: false,
    youtubeEnabled: false,
    socialColors: {
      instagram: "#E1306C",
      linkedin: "#0A66C2",
      facebook: "#1877F2",
      youtube: "#FF0000",
    },
    socialIconSize: 20,
  },
};

export const SLUG_RESERVED = [
  "admin",
  "dashboard",
  "api",
  "auth",
  "linktree",
  "e",
];

export function normalizeEmpresaTheme(input: unknown): EmpresaLinktreeTheme {
  const t = (input ?? {}) as Partial<EmpresaLinktreeTheme>;
  const d = DEFAULT_EMPRESA_THEME;
  return {
    layout: t.layout ?? d.layout,
    background: {
      ...d.background,
      ...(t.background ?? {}),
      blobs: (t.background?.blobs ?? d.background.blobs).map((b) => ({
        ...{ enabled: true, color: "#46b98c", position: "mc" as BlobPosition, size: 280, opacity: 0.2 },
        ...b,
      })),
    },
    icons: { ...d.icons, ...(t.icons ?? {}) },
    avatar: { ...d.avatar, ...(t.avatar ?? {}) },
    spacing: { ...d.spacing, ...(t.spacing ?? {}) },
    buttons: { ...d.buttons, ...(t.buttons ?? {}) },
    typography: { ...d.typography, ...(t.typography ?? {}) },
    institucional: {
      ...d.institucional,
      ...(t.institucional ?? {}),
      socialColors: {
        ...d.institucional.socialColors,
        ...((t.institucional as any)?.socialColors ?? {}),
      },
    },
  };
}

export function isValidSlug(slug: string): boolean {
  return (
    /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/.test(slug) &&
    !SLUG_RESERVED.includes(slug)
  );
}

export type EmpresaLinkInput = {
  titulo: string;
  descricao?: string | null;
  url: string;
  icone?: string;
  imagem_url?: string | null;
  tipo?: EmpresaLinkTipo;
  pinned?: boolean;
  destaque?: boolean;
  ativo?: boolean;
  agendado_inicio?: string | null;
  agendado_fim?: string | null;
  ordem?: number;
};

export type EmpresaSectionInput = {
  titulo: string;
  imagem_url?: string | null;
  ordem?: number;
};

export type AnalyticsPeriodo = "7d" | "30d" | "90d";

export interface ClickAnalytics {
  link_id: string;
  link_titulo: string;
  total_cliques: number;
}
