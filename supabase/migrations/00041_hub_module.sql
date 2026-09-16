-- ============================================================
-- Migration 00041: Módulo HUB (Treinamento & Gamificação)
-- ============================================================

-- 1. ENUMS
CREATE TYPE hub_app_role AS ENUM ('client', 'distributor', 'consultant', 'manager', 'super_admin');
CREATE TYPE hub_app_status AS ENUM ('pending', 'active', 'inactive', 'rejected');
CREATE TYPE hub_app_language AS ENUM ('pt-br', 'en-us', 'es-es');
CREATE TYPE hub_material_type AS ENUM ('image', 'pdf', 'video', 'audio', 'html');
CREATE TYPE hub_translation_status AS ENUM ('draft', 'review', 'published');
CREATE TYPE hub_progress_status AS ENUM ('started', 'completed');
CREATE TYPE hub_badge_trigger AS ENUM ('material_completed', 'collection_completed', 'points_reached', 'streak_days', 'ranking_position', 'login_count');

-- 2. TABELAS

-- 2.1 hub_user_roles
CREATE TABLE IF NOT EXISTS hub_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role hub_app_role NOT NULL DEFAULT 'client',
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, empresa_id)
);

-- 2.2 hub_materials
CREATE TABLE IF NOT EXISTS hub_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title JSONB NOT NULL DEFAULT '{"pt-br":"","en-us":"","es-es":""}',
  type hub_material_type NOT NULL DEFAULT 'pdf',
  allowed_roles hub_app_role[] DEFAULT '{client,distributor,consultant}',
  active BOOLEAN NOT NULL DEFAULT true,
  points INTEGER NOT NULL DEFAULT 10,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 hub_material_assets
CREATE TABLE IF NOT EXISTS hub_material_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES hub_materials(id) ON DELETE CASCADE,
  language hub_app_language NOT NULL DEFAULT 'pt-br',
  url TEXT NOT NULL,
  subtitle_url TEXT,
  status hub_translation_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 hub_collections
CREATE TABLE IF NOT EXISTS hub_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title JSONB NOT NULL DEFAULT '{"pt-br":"","en-us":"","es-es":""}',
  description JSONB,
  cover_image TEXT,
  allowed_roles hub_app_role[] DEFAULT '{client,distributor,consultant}',
  active BOOLEAN NOT NULL DEFAULT true,
  points INTEGER NOT NULL DEFAULT 50,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 hub_collection_items
CREATE TABLE IF NOT EXISTS hub_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES hub_collections(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES hub_materials(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, material_id)
);

-- 2.6 hub_user_progress
CREATE TABLE IF NOT EXISTS hub_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES hub_materials(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES hub_collections(id) ON DELETE SET NULL,
  status hub_progress_status NOT NULL DEFAULT 'started',
  completed_at TIMESTAMPTZ,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- 2.7 hub_collection_progress
CREATE TABLE IF NOT EXISTS hub_collection_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES hub_collections(id) ON DELETE CASCADE,
  status hub_progress_status NOT NULL DEFAULT 'started',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, collection_id)
);

-- 2.8 hub_access_logs (imutável)
CREATE TABLE IF NOT EXISTS hub_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES hub_materials(id) ON DELETE CASCADE,
  material_title TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT,
  user_role hub_app_role,
  language hub_app_language NOT NULL DEFAULT 'pt-br',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE
);

-- 2.9 hub_gamification_levels
CREATE TABLE IF NOT EXISTS hub_gamification_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.10 hub_badges
CREATE TABLE IF NOT EXISTS hub_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'star',
  trigger_type hub_badge_trigger NOT NULL,
  trigger_value INTEGER NOT NULL DEFAULT 1,
  points_reward INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.11 hub_user_badges
CREATE TABLE IF NOT EXISTS hub_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES hub_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  UNIQUE(user_id, badge_id)
);

-- 2.12 hub_invite_tokens
CREATE TABLE IF NOT EXISTS hub_invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  role hub_app_role NOT NULL DEFAULT 'client',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','used','expired')),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.13 hub_system_config (singleton por empresa)
CREATE TABLE IF NOT EXISTS hub_system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL DEFAULT 'Conexão Hub',
  logo_url TEXT,
  theme_dark JSONB DEFAULT '{}',
  environment_themes JSONB DEFAULT '{}',
  show_mock_login_cards BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id)
);

-- 2.14 hub_system_integrations
CREATE TABLE IF NOT EXISTS hub_system_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  openai_api_key TEXT,
  groq_api_key TEXT,
  openrouter_api_key TEXT,
  gemini_function TEXT,
  openai_function TEXT,
  groq_function TEXT,
  openrouter_function TEXT,
  gemini_active BOOLEAN DEFAULT false,
  openai_active BOOLEAN DEFAULT false,
  groq_active BOOLEAN DEFAULT false,
  openrouter_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id)
);

-- 2.15 hub_chatbot_config
CREATE TABLE IF NOT EXISTS hub_chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  webhook_url TEXT,
  allowed_roles hub_app_role[] DEFAULT '{client,distributor,consultant}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id)
);

-- 2.16 hub_invite_tokens extensions (compartilhamento)
ALTER TABLE hub_invite_tokens ADD COLUMN IF NOT EXISTS share_whatsapp_message TEXT;
ALTER TABLE hub_invite_tokens ADD COLUMN IF NOT EXISTS share_link TEXT;

-- 3. TRIGGERS updated_at
CREATE OR REPLACE FUNCTION hub_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hub_materials_updated_at ON hub_materials;
CREATE TRIGGER hub_materials_updated_at
  BEFORE UPDATE ON hub_materials FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_collections_updated_at ON hub_collections;
CREATE TRIGGER hub_collections_updated_at
  BEFORE UPDATE ON hub_collections FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_collection_progress_updated_at ON hub_collection_progress;
CREATE TRIGGER hub_collection_progress_updated_at
  BEFORE UPDATE ON hub_collection_progress FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_system_config_updated_at ON hub_system_config;
CREATE TRIGGER hub_system_config_updated_at
  BEFORE UPDATE ON hub_system_config FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_system_integrations_updated_at ON hub_system_integrations;
CREATE TRIGGER hub_system_integrations_updated_at
  BEFORE UPDATE ON hub_system_integrations FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_chatbot_config_updated_at ON hub_chatbot_config;
CREATE TRIGGER hub_chatbot_config_updated_at
  BEFORE UPDATE ON hub_chatbot_config FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS hub_user_roles_user_idx ON hub_user_roles(user_id);
CREATE INDEX IF NOT EXISTS hub_user_roles_empresa_idx ON hub_user_roles(empresa_id);
CREATE INDEX IF NOT EXISTS hub_materials_empresa_idx ON hub_materials(empresa_id);
CREATE INDEX IF NOT EXISTS hub_materials_created_by_idx ON hub_materials(created_by);
CREATE INDEX IF NOT EXISTS hub_materials_type_idx ON hub_materials(type);
CREATE INDEX IF NOT EXISTS hub_material_assets_material_idx ON hub_material_assets(material_id);
CREATE INDEX IF NOT EXISTS hub_material_assets_language_idx ON hub_material_assets(language);
CREATE INDEX IF NOT EXISTS hub_collections_empresa_idx ON hub_collections(empresa_id);
CREATE INDEX IF NOT EXISTS hub_collections_created_by_idx ON hub_collections(created_by);
CREATE INDEX IF NOT EXISTS hub_collection_items_collection_idx ON hub_collection_items(collection_id, order_index);
CREATE INDEX IF NOT EXISTS hub_collection_items_material_idx ON hub_collection_items(material_id);
CREATE INDEX IF NOT EXISTS hub_user_progress_user_idx ON hub_user_progress(user_id);
CREATE INDEX IF NOT EXISTS hub_user_progress_material_idx ON hub_user_progress(material_id);
CREATE INDEX IF NOT EXISTS hub_user_progress_empresa_idx ON hub_user_progress(empresa_id);
CREATE INDEX IF NOT EXISTS hub_collection_progress_user_idx ON hub_collection_progress(user_id);
CREATE INDEX IF NOT EXISTS hub_collection_progress_collection_idx ON hub_collection_progress(collection_id);
CREATE INDEX IF NOT EXISTS hub_access_logs_material_idx ON hub_access_logs(material_id);
CREATE INDEX IF NOT EXISTS hub_access_logs_user_idx ON hub_access_logs(user_id);
CREATE INDEX IF NOT EXISTS hub_access_logs_empresa_idx ON hub_access_logs(empresa_id);
CREATE INDEX IF NOT EXISTS hub_access_logs_timestamp_idx ON hub_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS hub_badges_empresa_idx ON hub_badges(empresa_id);
CREATE INDEX IF NOT EXISTS hub_badges_trigger_idx ON hub_badges(trigger_type);
CREATE INDEX IF NOT EXISTS hub_user_badges_user_idx ON hub_user_badges(user_id);
CREATE INDEX IF NOT EXISTS hub_user_badges_badge_idx ON hub_user_badges(badge_id);
CREATE INDEX IF NOT EXISTS hub_invite_tokens_empresa_idx ON hub_invite_tokens(empresa_id);
CREATE INDEX IF NOT EXISTS hub_invite_tokens_token_idx ON hub_invite_tokens(token);
CREATE INDEX IF NOT EXISTS hub_invite_tokens_status_idx ON hub_invite_tokens(status);

-- 6. RLS
ALTER TABLE hub_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_material_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_collection_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_gamification_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_system_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_chatbot_config ENABLE ROW LEVEL SECURITY;

-- 6.1 hub_user_roles
CREATE POLICY hub_user_roles_select ON hub_user_roles
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_user_roles_insert ON hub_user_roles
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_user_roles_update ON hub_user_roles
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR user_id = auth.uid()
  );
CREATE POLICY hub_user_roles_delete ON hub_user_roles
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
  );

-- 6.2 hub_materials
CREATE POLICY hub_materials_select ON hub_materials
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_materials_insert ON hub_materials
  FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
  );
CREATE POLICY hub_materials_update ON hub_materials
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR created_by = auth.uid()
  );
CREATE POLICY hub_materials_delete ON hub_materials
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

-- 6.3 hub_material_assets
CREATE POLICY hub_material_assets_select ON hub_material_assets
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM hub_materials WHERE hub_materials.id = hub_material_assets.material_id)
  );
CREATE POLICY hub_material_assets_insert ON hub_material_assets
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM hub_materials WHERE hub_materials.id = hub_material_assets.material_id AND hub_materials.created_by = auth.uid())
  );
CREATE POLICY hub_material_assets_update ON hub_material_assets
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM hub_materials WHERE hub_materials.id = hub_material_assets.material_id AND hub_materials.created_by = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM hub_materials WHERE hub_materials.id = hub_material_assets.material_id AND hub_materials.created_by = auth.uid())
  );
CREATE POLICY hub_material_assets_delete ON hub_material_assets
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM hub_materials WHERE hub_materials.id = hub_material_assets.material_id AND hub_materials.created_by = auth.uid())
  );

-- 6.4 hub_collections
CREATE POLICY hub_collections_select ON hub_collections
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_collections_insert ON hub_collections
  FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
  );
CREATE POLICY hub_collections_update ON hub_collections
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR created_by = auth.uid()
  );
CREATE POLICY hub_collections_delete ON hub_collections
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

-- 6.5 hub_collection_items
CREATE POLICY hub_collection_items_select ON hub_collection_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM hub_collections WHERE hub_collections.id = hub_collection_items.collection_id)
  );
CREATE POLICY hub_collection_items_insert ON hub_collection_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM hub_collections WHERE hub_collections.id = hub_collection_items.collection_id AND hub_collections.created_by = auth.uid())
  );
CREATE POLICY hub_collection_items_update ON hub_collection_items
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM hub_collections WHERE hub_collections.id = hub_collection_items.collection_id AND hub_collections.created_by = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM hub_collections WHERE hub_collections.id = hub_collection_items.collection_id AND hub_collections.created_by = auth.uid())
  );
CREATE POLICY hub_collection_items_delete ON hub_collection_items
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM hub_collections WHERE hub_collections.id = hub_collection_items.collection_id AND hub_collections.created_by = auth.uid())
  );

-- 6.6 hub_user_progress
CREATE POLICY hub_user_progress_select ON hub_user_progress
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_user_progress_insert ON hub_user_progress
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
  );
CREATE POLICY hub_user_progress_update ON hub_user_progress
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR user_id = auth.uid()
  );

-- 6.7 hub_collection_progress
CREATE POLICY hub_collection_progress_select ON hub_collection_progress
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_collection_progress_insert ON hub_collection_progress
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
  );
CREATE POLICY hub_collection_progress_update ON hub_collection_progress
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR user_id = auth.uid()
  );

-- 6.8 hub_access_logs
CREATE POLICY hub_access_logs_select ON hub_access_logs
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_access_logs_insert ON hub_access_logs
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
  );

-- 6.9 hub_gamification_levels
CREATE POLICY hub_gamification_levels_select ON hub_gamification_levels
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_gamification_levels_insert ON hub_gamification_levels
  FOR INSERT TO authenticated WITH CHECK (is_super_admin_session());
CREATE POLICY hub_gamification_levels_update ON hub_gamification_levels
  FOR UPDATE TO authenticated USING (is_super_admin_session()) WITH CHECK (is_super_admin_session());
CREATE POLICY hub_gamification_levels_delete ON hub_gamification_levels
  FOR DELETE TO authenticated USING (is_super_admin_session());

-- 6.10 hub_badges
CREATE POLICY hub_badges_select ON hub_badges
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_badges_insert ON hub_badges
  FOR INSERT TO authenticated WITH CHECK (is_super_admin_session());
CREATE POLICY hub_badges_update ON hub_badges
  FOR UPDATE TO authenticated USING (is_super_admin_session()) WITH CHECK (is_super_admin_session());
CREATE POLICY hub_badges_delete ON hub_badges
  FOR DELETE TO authenticated USING (is_super_admin_session());

-- 6.11 hub_user_badges
CREATE POLICY hub_user_badges_select ON hub_user_badges
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR user_id = auth.uid()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_user_badges_insert ON hub_user_badges
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR user_id = auth.uid()
  );

-- 6.12 hub_invite_tokens
CREATE POLICY hub_invite_tokens_select ON hub_invite_tokens
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_invite_tokens_insert ON hub_invite_tokens
  FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
  );
CREATE POLICY hub_invite_tokens_update ON hub_invite_tokens
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR created_by = auth.uid()
  );
CREATE POLICY hub_invite_tokens_delete ON hub_invite_tokens
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

-- 6.13 hub_system_config
CREATE POLICY hub_system_config_select ON hub_system_config
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_system_config_insert ON hub_system_config
  FOR INSERT TO authenticated WITH CHECK (is_super_admin_session());
CREATE POLICY hub_system_config_update ON hub_system_config
  FOR UPDATE TO authenticated USING (is_super_admin_session()) WITH CHECK (is_super_admin_session());

-- 6.14 hub_system_integrations
CREATE POLICY hub_system_integrations_select ON hub_system_integrations
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_system_integrations_insert ON hub_system_integrations
  FOR INSERT TO authenticated WITH CHECK (is_super_admin_session());
CREATE POLICY hub_system_integrations_update ON hub_system_integrations
  FOR UPDATE TO authenticated USING (is_super_admin_session()) WITH CHECK (is_super_admin_session());

-- 6.15 hub_chatbot_config
CREATE POLICY hub_chatbot_config_select ON hub_chatbot_config
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );
CREATE POLICY hub_chatbot_config_insert ON hub_chatbot_config
  FOR INSERT TO authenticated WITH CHECK (is_super_admin_session());
CREATE POLICY hub_chatbot_config_update ON hub_chatbot_config
  FOR UPDATE TO authenticated USING (is_super_admin_session()) WITH CHECK (is_super_admin_session());

-- 7. GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON hub_user_roles TO authenticated;
GRANT ALL ON hub_user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_materials TO authenticated;
GRANT ALL ON hub_materials TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_material_assets TO authenticated;
GRANT ALL ON hub_material_assets TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_collections TO authenticated;
GRANT ALL ON hub_collections TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_collection_items TO authenticated;
GRANT ALL ON hub_collection_items TO service_role;

GRANT SELECT, INSERT, UPDATE ON hub_user_progress TO authenticated;
GRANT ALL ON hub_user_progress TO service_role;

GRANT SELECT, INSERT, UPDATE ON hub_collection_progress TO authenticated;
GRANT ALL ON hub_collection_progress TO service_role;

GRANT SELECT, INSERT ON hub_access_logs TO authenticated;
GRANT ALL ON hub_access_logs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_gamification_levels TO authenticated;
GRANT ALL ON hub_gamification_levels TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_badges TO authenticated;
GRANT ALL ON hub_badges TO service_role;

GRANT SELECT, INSERT ON hub_user_badges TO authenticated;
GRANT ALL ON hub_user_badges TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_invite_tokens TO authenticated;
GRANT ALL ON hub_invite_tokens TO service_role;

GRANT SELECT, INSERT, UPDATE ON hub_system_config TO authenticated;
GRANT ALL ON hub_system_config TO service_role;

GRANT SELECT, INSERT, UPDATE ON hub_system_integrations TO authenticated;
GRANT ALL ON hub_system_integrations TO service_role;

GRANT SELECT, INSERT, UPDATE ON hub_chatbot_config TO authenticated;
GRANT ALL ON hub_chatbot_config TO service_role;
