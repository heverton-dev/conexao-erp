export type LinktreeColaboradorStatus = "ativo" | "inativo";

export interface LinktreeColaborador {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  whatsapp: string;
  telefone_fixo: string | null;
  foto_url: string | null;
  status: LinktreeColaboradorStatus;
  created_by: string | null;
  empresa_id: string | null;
  credencial_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinktreeColaboradorComCredencial extends LinktreeColaborador {
  credenciais?: {
    id: string;
    nome_completo: string;
    email_corporativo: string;
    whatsapp_corporativo: string | null;
    departamento: string | null;
  } | null;
}

export type LinktreeColaboradorInput = {
  nome: string;
  cargo: string;
  email: string;
  whatsapp: string;
  telefone_fixo?: string | null;
  foto_url?: string | null;
  status?: LinktreeColaboradorStatus;
  empresa_id?: string;
  credencial_id?: string;
  created_by?: string;
};

export type BlobPosition =
  "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

export interface BlobItem {
  enabled: boolean;
  color: string;
  position: BlobPosition;
  size: number;
  opacity: number;
}

export type BackgroundMode = "solid" | "gradient2" | "gradient3";

export interface LinktreeThemeConfig {
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
  };
  icons: {
    pack: "lucide" | "filled" | "outline";
    pathColor: string;
    bgColor: string;
  };
  typography: {
    nome: { font: string; color: string };
    cargo: { font: string; color: string };
    contato: { font: string; color: string };
    institucional: { font: string; color: string };
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

export const DEFAULT_LINKTREE_THEME: LinktreeThemeConfig = {
  background: {
    mode: "gradient2",
    solid: "#0f172a",
    gradientFrom: "#0f172a",
    gradientTo: "#1e293b",
    gradientAngle: 160,
    gradient3From: "#0f172a",
    gradient3Mid: "#1e293b",
    gradient3To: "#0f172a",
    gradient3Angle: 160,
    blobsEnabled: false,
    blobs: [
      {
        enabled: true,
        color: "#c9a655",
        position: "tr",
        size: 320,
        opacity: 0.35,
      },
      {
        enabled: true,
        color: "#3b82f6",
        position: "bl",
        size: 280,
        opacity: 0.25,
      },
    ],
  },
  icons: { pack: "lucide", pathColor: "#0f172a", bgColor: "#c9a655" },
  typography: {
    nome: { font: "Outfit", color: "#f8fafc" },
    cargo: { font: "Outfit", color: "#c9a655" },
    contato: { font: "Outfit", color: "#f8fafc" },
    institucional: { font: "Outfit", color: "#94a3b8" },
  },
  institucional: {
    nomeEmpresa: "ERP Odonto",
    nomeEmpresaEnabled: true,
    endereco: "Av. Principal, 1000 - São Paulo, SP",
    enderecoEnabled: true,
    site: "https://www.odonto.com.br",
    logoUrl: "",
    logoWidth: 120,
    logoHeight: 32,
    instagram: "https://instagram.com/conexaoimplantes",
    linkedin: "https://linkedin.com/company/conexaoimplantes",
    facebook: "https://facebook.com/conexaoimplantes",
    youtube: "https://youtube.com/@conexaoimplantes",
    instagramEnabled: true,
    linkedinEnabled: true,
    facebookEnabled: true,
    youtubeEnabled: true,
    socialColors: {
      instagram: "#E1306C",
      linkedin: "#0A66C2",
      facebook: "#1877F2",
      youtube: "#FF0000",
    },
    socialIconSize: 20,
  },
};

export const FONT_OPTIONS = [
  "Outfit",
  "Inter",
  "Playfair Display",
  "Georgia",
  "system-ui",
  "Helvetica",
] as const;

export function normalizeLinktreeTheme(input: unknown): LinktreeThemeConfig {
  const t = (input ?? {}) as Partial<LinktreeThemeConfig>;
  return {
    ...DEFAULT_LINKTREE_THEME,
    ...t,
    background: {
      ...DEFAULT_LINKTREE_THEME.background,
      ...(t.background ?? {}),
    },
    icons: { ...DEFAULT_LINKTREE_THEME.icons, ...(t.icons ?? {}) },
    typography: {
      nome: {
        ...DEFAULT_LINKTREE_THEME.typography.nome,
        ...(t.typography?.nome ?? {}),
      },
      cargo: {
        ...DEFAULT_LINKTREE_THEME.typography.cargo,
        ...(t.typography?.cargo ?? {}),
      },
      contato: {
        ...DEFAULT_LINKTREE_THEME.typography.contato,
        ...(t.typography?.contato ?? {}),
      },
      institucional: {
        ...DEFAULT_LINKTREE_THEME.typography.institucional,
        ...(t.typography?.institucional ?? {}),
      },
    },
    institucional: {
      ...DEFAULT_LINKTREE_THEME.institucional,
      ...(t.institucional ?? {}),
      socialColors: {
        ...DEFAULT_LINKTREE_THEME.institucional.socialColors,
        ...((t.institucional as any)?.socialColors ?? {}),
      },
    },
  };
}

export type PhoneParts = { ddi: string; ddd: string; number: string };

export function encodePhone(p: PhoneParts): string {
  if (!p.ddi && !p.ddd && !p.number) return "";
  return `${p.ddi}|${p.ddd}|${p.number}`;
}

export function decodePhone(raw: string | null | undefined): PhoneParts {
  if (!raw) return { ddi: "", ddd: "", number: "" };
  if (raw.includes("|")) {
    const [ddi = "", ddd = "", number = ""] = raw.split("|");
    return {
      ddi: ddi.replace(/\D/g, ""),
      ddd: ddd.replace(/\D/g, ""),
      number: number.replace(/\D/g, ""),
    };
  }
  const d = raw.replace(/\D/g, "");
  if (!d) return { ddi: "", ddd: "", number: "" };
  if (d.length >= 10) {
    const number =
      d.slice(-9).length === 9 && d.length >= 11 ? d.slice(-9) : d.slice(-8);
    const rest = d.slice(0, d.length - number.length);
    const ddd = rest.slice(-2);
    const ddi = rest.slice(0, -2);
    return { ddi, ddd, number };
  }
  return { ddi: "", ddd: "", number: d };
}

export function maskNumberOnly(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 9);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, d.length - 4)}-${d.slice(-4)}`;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatPhoneDisplay(raw: string | null | undefined): string {
  const { ddd, number } = decodePhone(raw);
  if (!ddd && !number) return "";
  const n = maskNumberOnly(number) || number;
  const parts: string[] = [];
  if (ddd) parts.push(`(${ddd})`);
  if (n) parts.push(n);
  return parts.join(" ");
}

export function phoneDigits(raw: string | null | undefined): string {
  const { ddi, ddd, number } = decodePhone(raw);
  return `${ddi}${ddd}${number}`;
}

export type TelefoneKind = "fixo" | "ramal";
export interface TelefoneValue {
  kind: TelefoneKind;
  phone: PhoneParts;
  ramal: string;
}

export function encodeTelefone(v: TelefoneValue): string {
  if (v.kind === "ramal")
    return v.ramal ? `R|${v.ramal.replace(/\D/g, "")}` : "";
  return encodePhone(v.phone);
}

export function decodeTelefone(raw: string | null | undefined): TelefoneValue {
  if (raw && raw.startsWith("R|")) {
    return {
      kind: "ramal",
      ramal: raw.slice(2).replace(/\D/g, ""),
      phone: { ddi: "", ddd: "", number: "" },
    };
  }
  return { kind: "fixo", ramal: "", phone: decodePhone(raw) };
}
