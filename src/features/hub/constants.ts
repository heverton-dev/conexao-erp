import type { HubLanguage, HubMaterialType } from "./types";

export const HUB_LANGUAGES: { value: HubLanguage; label: string }[] = [
  { value: "pt-br", label: "Português (BR)" },
  { value: "en-us", label: "English (US)" },
  { value: "es-es", label: "Español (ES)" },
];

export const HUB_MATERIAL_TYPES: { value: HubMaterialType; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Vídeo" },
  { value: "image", label: "Imagem" },
  { value: "audio", label: "Áudio" },
  { value: "html", label: "HTML" },
];

export const HUB_BADGE_ICONS = [
  "star",
  "book",
  "graduation",
  "rocket",
  "trophy",
  "diamond",
  "crown",
  "flame",
  "shield",
  "stars",
] as const;

export const HUB_TRANSLATION_STATUS_LABELS = {
  draft: "Rascunho",
  review: "Em revisão",
  published: "Publicado",
} as const;

export const HUB_USER_STATUS_LABELS = {
  pending: "Pendente",
  active: "Ativo",
  inactive: "Inativo",
  rejected: "Rejeitado",
} as const;

export const HUB_PROGRESS_STATUS_LABELS = {
  started: "Iniciado",
  completed: "Concluído",
} as const;
