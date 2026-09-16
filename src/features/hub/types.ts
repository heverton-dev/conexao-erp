export type HubRole =
  "client" | "distributor" | "consultant" | "manager" | "super_admin";
export type HubLanguage = "pt-br" | "en-us" | "es-es";
export type HubMaterialType = "image" | "pdf" | "video" | "audio" | "html";
export type HubUserStatus = "pending" | "active" | "inactive" | "rejected";
export type HubTranslationStatus = "draft" | "review" | "published";
export type HubProgressStatus = "started" | "completed";
export type HubBadgeTrigger =
  | "material_completed"
  | "collection_completed"
  | "points_reached"
  | "streak_days"
  | "ranking_position"
  | "login_count";

export interface HubUserProfile {
  id: string;
  name: string;
  email: string;
  role: HubRole;
  whatsapp: string;
  cro?: string;
  status: HubUserStatus;
  allowedTypes?: HubMaterialType[];
  points: number;
  preferences: { theme: "dark"; language: HubLanguage };
}

export interface HubMaterial {
  id: string;
  title: Partial<Record<HubLanguage, string>>;
  type: HubMaterialType;
  allowedRoles: HubRole[];
  active: boolean;
  points: number;
  tags: string[];
  category?: string;
  empresa_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HubMaterialAsset {
  id: string;
  material_id: string;
  language: HubLanguage;
  url: string;
  subtitle_url?: string;
  status: HubTranslationStatus;
  created_at: string;
}

export interface HubCollection {
  id: string;
  title: Partial<Record<HubLanguage, string>>;
  description?: Partial<Record<HubLanguage, string>>;
  cover_image?: string;
  allowedRoles: HubRole[];
  active: boolean;
  points: number;
  empresa_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  itemCount?: number;
  completedCount?: number;
}

export interface HubCollectionItem {
  id: string;
  collection_id: string;
  material_id: string;
  order_index: number;
  material?: HubMaterial;
}

export interface HubUserProgress {
  id: string;
  user_id: string;
  material_id: string;
  collection_id?: string;
  status: HubProgressStatus;
  completed_at?: string;
  created_at: string;
}

export interface HubCollectionProgress {
  id: string;
  user_id: string;
  collection_id: string;
  status: HubProgressStatus;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HubAccessLog {
  id: string;
  material_id: string;
  material_title?: string;
  user_id: string;
  user_name?: string;
  user_role?: HubRole;
  language: HubLanguage;
  timestamp: string;
}

export interface HubGamificationLevel {
  id: string;
  name: string;
  min_points: number;
  order_index: number;
  color: string;
}

export interface HubBadge {
  id: string;
  name: string;
  description?: string;
  icon_name: string;
  trigger_type: HubBadgeTrigger;
  trigger_value: number;
  points_reward: number;
  color: string;
  empresa_id: string;
  created_at: string;
}

export interface HubUserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: HubBadge;
}

export interface HubInviteToken {
  id: string;
  token: string;
  role: HubRole;
  status: "pending" | "used" | "expired";
  used_by?: string;
  used_at?: string;
  expires_at?: string;
  created_by: string;
  empresa_id: string;
  created_at: string;
  share_whatsapp_message?: string;
  share_link?: string;
}

export interface HubSystemConfig {
  id: string;
  empresa_id: string;
  app_name: string;
  logo_url?: string;
  theme_dark: Record<string, string>;
  environment_themes: Record<string, unknown>;
  show_mock_login_cards?: boolean;
}

export interface HubSystemIntegrations {
  id: string;
  empresa_id: string;
  gemini_api_key?: string;
  openai_api_key?: string;
  groq_api_key?: string;
  openrouter_api_key?: string;
  gemini_function?: string;
  openai_function?: string;
  groq_function?: string;
  openrouter_function?: string;
  gemini_active?: boolean;
  openai_active?: boolean;
  groq_active?: boolean;
  openrouter_active?: boolean;
}

export interface HubChatbotConfig {
  id: string;
  empresa_id: string;
  enabled: boolean;
  webhook_url?: string;
  allowed_roles: HubRole[];
}

export type HubWebhookEvent =
  | "user.registered"
  | "user.invite_used"
  | "user.status_changed"
  | "material.accessed"
  | "material.completed"
  | "collection.completed"
  | "gamification.level_up"
  | "invite.generated"
  | "invite.shared";

export const HUB_WEBHOOK_EVENTS: { value: HubWebhookEvent; label: string }[] = [
  { value: "user.registered", label: "Usuário registrado" },
  { value: "user.invite_used", label: "Convite utilizado" },
  { value: "user.status_changed", label: "Status do usuário alterado" },
  { value: "material.accessed", label: "Material acessado" },
  { value: "material.completed", label: "Material concluído" },
  { value: "collection.completed", label: "Coleção concluída" },
  { value: "gamification.level_up", label: "Level-up (gamificação)" },
  { value: "invite.generated", label: "Convite gerado" },
  { value: "invite.shared", label: "Convite compartilhado" },
];

export type HubAIFunction = "translate" | "image" | "summarize" | "chatbot";

export const HUB_LEVEL_THRESHOLDS = {
  Iniciante: 0,
  Bronze: 100,
  Prata: 300,
  Ouro: 600,
  Master: 1000,
} as const;
export type HubUserLevel = keyof typeof HUB_LEVEL_THRESHOLDS;

export function getHubUserLevel(points: number): HubUserLevel {
  if (points >= 1000) return "Master";
  if (points >= 600) return "Ouro";
  if (points >= 300) return "Prata";
  if (points >= 100) return "Bronze";
  return "Iniciante";
}

export function getHubNextLevelThreshold(points: number): number {
  if (points >= 1000) return 1000;
  if (points >= 600) return 1000;
  if (points >= 300) return 600;
  if (points >= 100) return 300;
  return 100;
}
