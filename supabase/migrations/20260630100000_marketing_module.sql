-- ============================================================
-- Migration 20260630100000: Módulo Marketing Digital
-- Tabelas: mktg_eventos, mktg_landing_pages, mktg_landing_pages_versoes,
--          mktg_meta_contas, mktg_meta_campanhas, mktg_meta_posts,
--          mktg_meta_insights, mktg_utms, mktg_criativos,
--          mktg_campanhas_email, mktg_disparos_email,
--          mktg_calendario, mktg_leads, mktg_pixels
-- ============================================================

-- ============================================================
-- 1. mktg_eventos (tracking central)
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('visualizacao','clique','scroll','conversao','form_submit','permanencia')),
  metadata JSONB DEFAULT '{}',
  page_url TEXT,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. mktg_landing_pages
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','publicado','arquivado')),
  conteudo JSONB NOT NULL DEFAULT '{}',
  versao_atual INTEGER NOT NULL DEFAULT 1,
  template TEXT,
  publicado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. mktg_landing_pages_versoes
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_landing_pages_versoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES mktg_landing_pages(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  conteudo JSONB NOT NULL DEFAULT '{}',
  criado_por UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. mktg_meta_contas
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_meta_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  meta_user_id TEXT NOT NULL,
  meta_page_id TEXT,
  meta_ad_account_id TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'desconectado' CHECK (status IN ('conectado','expirado','desconectado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. mktg_meta_campanhas
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_meta_campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  meta_campanha_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PAUSED','DELETED','ARCHIVED','IN_MODERATION')),
  orcamento_diario NUMERIC(12,2),
  orcamento_total NUMERIC(12,2),
  plataforma TEXT NOT NULL DEFAULT 'both' CHECK (plataforma IN ('facebook','instagram','both')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. mktg_meta_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_meta_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  meta_post_id TEXT,
  conteudo TEXT NOT NULL,
  midia_url TEXT,
  plataforma TEXT NOT NULL DEFAULT 'both' CHECK (plataforma IN ('facebook','instagram','both')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','agendado','publicado','erro')),
  agendado_para TIMESTAMPTZ,
  publicado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. mktg_meta_insights
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_meta_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  campanha_id UUID NOT NULL REFERENCES mktg_meta_campanhas(id) ON DELETE CASCADE,
  impressoes INTEGER NOT NULL DEFAULT 0,
  cliques INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  gasto NUMERIC(12,2) DEFAULT 0,
  conversoes INTEGER NOT NULL DEFAULT 0,
  cpc NUMERIC(8,2) DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. mktg_utms
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_utms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url_destino TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_term TEXT,
  utm_content TEXT,
  cliques INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. mktg_criativos
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_criativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'imagem' CHECK (tipo IN ('imagem','video','carrossel','texto')),
  arquivo_url TEXT,
  preview_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','aprovado','arquivado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. mktg_campanhas_email
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_campanhas_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  assunto TEXT NOT NULL,
  remetente TEXT NOT NULL DEFAULT 'noreply@conexaosistema.com.br',
  conteudo_html TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','agendado','enviado','pausado')),
  agendado_para TIMESTAMPTZ,
  enviado_em TIMESTAMPTZ,
  total_enviados INTEGER NOT NULL DEFAULT 0,
  total_abertos INTEGER NOT NULL DEFAULT 0,
  total_cliques INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. mktg_disparos_email
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_disparos_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  campanha_id UUID NOT NULL REFERENCES mktg_campanhas_email(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  enviado_em TIMESTAMPTZ,
  aberto_em TIMESTAMPTZ,
  clicado_em TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','enviado','aberto','clicado','falhou')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. mktg_calendario
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_calendario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  hora TIME,
  tipo TEXT NOT NULL DEFAULT 'post' CHECK (tipo IN ('post','reuniao','deadline','evento','lancamento')),
  plataforma TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluido','cancelado')),
  responsavel TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. mktg_leads
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  origem TEXT,
  fonte TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','qualificado','convertido','perdido')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. mktg_pixels
-- ============================================================
CREATE TABLE IF NOT EXISTS mktg_pixels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  pixel_id TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'meta' CHECK (tipo IN ('meta','google','tiktok','custom')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
DROP TRIGGER IF EXISTS mktg_landing_pages_set_updated_at ON mktg_landing_pages;
CREATE TRIGGER mktg_landing_pages_set_updated_at
  BEFORE UPDATE ON mktg_landing_pages FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_meta_contas_set_updated_at ON mktg_meta_contas;
CREATE TRIGGER mktg_meta_contas_set_updated_at
  BEFORE UPDATE ON mktg_meta_contas FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_meta_campanhas_set_updated_at ON mktg_meta_campanhas;
CREATE TRIGGER mktg_meta_campanhas_set_updated_at
  BEFORE UPDATE ON mktg_meta_campanhas FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_meta_posts_set_updated_at ON mktg_meta_posts;
CREATE TRIGGER mktg_meta_posts_set_updated_at
  BEFORE UPDATE ON mktg_meta_posts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_criativos_set_updated_at ON mktg_criativos;
CREATE TRIGGER mktg_criativos_set_updated_at
  BEFORE UPDATE ON mktg_criativos FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_campanhas_email_set_updated_at ON mktg_campanhas_email;
CREATE TRIGGER mktg_campanhas_email_set_updated_at
  BEFORE UPDATE ON mktg_campanhas_email FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_calendario_set_updated_at ON mktg_calendario;
CREATE TRIGGER mktg_calendario_set_updated_at
  BEFORE UPDATE ON mktg_calendario FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_leads_set_updated_at ON mktg_leads;
CREATE TRIGGER mktg_leads_set_updated_at
  BEFORE UPDATE ON mktg_leads FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mktg_pixels_set_updated_at ON mktg_pixels;
CREATE TRIGGER mktg_pixels_set_updated_at
  BEFORE UPDATE ON mktg_pixels FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS mktg_eventos_empresa_idx ON mktg_eventos(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_eventos_tipo_idx ON mktg_eventos(tipo);
CREATE INDEX IF NOT EXISTS mktg_eventos_created_idx ON mktg_eventos(created_at);

CREATE INDEX IF NOT EXISTS mktg_landing_pages_empresa_idx ON mktg_landing_pages(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_landing_pages_slug_idx ON mktg_landing_pages(slug);
CREATE INDEX IF NOT EXISTS mktg_landing_pages_status_idx ON mktg_landing_pages(status);
CREATE INDEX IF NOT EXISTS mktg_landing_pages_versoes_lp_idx ON mktg_landing_pages_versoes(landing_page_id);

CREATE INDEX IF NOT EXISTS mktg_meta_contas_empresa_idx ON mktg_meta_contas(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_meta_campanhas_empresa_idx ON mktg_meta_campanhas(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_meta_campanhas_status_idx ON mktg_meta_campanhas(status);
CREATE INDEX IF NOT EXISTS mktg_meta_posts_empresa_idx ON mktg_meta_posts(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_meta_posts_status_idx ON mktg_meta_posts(status);
CREATE INDEX IF NOT EXISTS mktg_meta_insights_empresa_idx ON mktg_meta_insights(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_meta_insights_campanha_idx ON mktg_meta_insights(campanha_id);
CREATE INDEX IF NOT EXISTS mktg_meta_insights_data_idx ON mktg_meta_insights(data);

CREATE INDEX IF NOT EXISTS mktg_utms_empresa_idx ON mktg_utms(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_criativos_empresa_idx ON mktg_criativos(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_criativos_tipo_idx ON mktg_criativos(tipo);

CREATE INDEX IF NOT EXISTS mktg_campanhas_email_empresa_idx ON mktg_campanhas_email(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_campanhas_email_status_idx ON mktg_campanhas_email(status);
CREATE INDEX IF NOT EXISTS mktg_disparos_email_empresa_idx ON mktg_disparos_email(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_disparos_email_campanha_idx ON mktg_disparos_email(campanha_id);
CREATE INDEX IF NOT EXISTS mktg_disparos_email_status_idx ON mktg_disparos_email(status);

CREATE INDEX IF NOT EXISTS mktg_calendario_empresa_idx ON mktg_calendario(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_calendario_data_idx ON mktg_calendario(data);
CREATE INDEX IF NOT EXISTS mktg_calendario_status_idx ON mktg_calendario(status);

CREATE INDEX IF NOT EXISTS mktg_leads_empresa_idx ON mktg_leads(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_leads_status_idx ON mktg_leads(status);
CREATE INDEX IF NOT EXISTS mktg_leads_score_idx ON mktg_leads(score);

CREATE INDEX IF NOT EXISTS mktg_pixels_empresa_idx ON mktg_pixels(empresa_id);
CREATE INDEX IF NOT EXISTS mktg_pixels_tipo_idx ON mktg_pixels(tipo);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE mktg_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_landing_pages_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_meta_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_meta_campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_meta_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_meta_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_utms ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_criativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_campanhas_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_disparos_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mktg_pixels ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — mktg_eventos
-- ============================================================
DROP POLICY IF EXISTS mktg_eventos_select_auth ON mktg_eventos;
CREATE POLICY mktg_eventos_select_auth ON mktg_eventos
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_eventos_insert_auth ON mktg_eventos;
CREATE POLICY mktg_eventos_insert_auth ON mktg_eventos
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_landing_pages
-- ============================================================
DROP POLICY IF EXISTS mktg_landing_pages_select_auth ON mktg_landing_pages;
CREATE POLICY mktg_landing_pages_select_auth ON mktg_landing_pages
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_landing_pages_insert_auth ON mktg_landing_pages;
CREATE POLICY mktg_landing_pages_insert_auth ON mktg_landing_pages
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_landing_pages_update_auth ON mktg_landing_pages;
CREATE POLICY mktg_landing_pages_update_auth ON mktg_landing_pages
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_landing_pages_delete_auth ON mktg_landing_pages;
CREATE POLICY mktg_landing_pages_delete_auth ON mktg_landing_pages
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_landing_pages_versoes
-- ============================================================
DROP POLICY IF EXISTS mktg_landing_pages_versoes_select_auth ON mktg_landing_pages_versoes;
CREATE POLICY mktg_landing_pages_versoes_select_auth ON mktg_landing_pages_versoes
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR landing_page_id IN (
      SELECT id FROM mktg_landing_pages WHERE empresa_id = get_current_empresa_id()
    )
  );

DROP POLICY IF EXISTS mktg_landing_pages_versoes_insert_auth ON mktg_landing_pages_versoes;
CREATE POLICY mktg_landing_pages_versoes_insert_auth ON mktg_landing_pages_versoes
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR landing_page_id IN (
      SELECT id FROM mktg_landing_pages WHERE empresa_id = get_current_empresa_id()
    )
  );

-- ============================================================
-- RLS POLICIES — mktg_meta_contas
-- ============================================================
DROP POLICY IF EXISTS mktg_meta_contas_select_auth ON mktg_meta_contas;
CREATE POLICY mktg_meta_contas_select_auth ON mktg_meta_contas
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_contas_insert_auth ON mktg_meta_contas;
CREATE POLICY mktg_meta_contas_insert_auth ON mktg_meta_contas
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_contas_update_auth ON mktg_meta_contas;
CREATE POLICY mktg_meta_contas_update_auth ON mktg_meta_contas
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_contas_delete_auth ON mktg_meta_contas;
CREATE POLICY mktg_meta_contas_delete_auth ON mktg_meta_contas
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_meta_campanhas
-- ============================================================
DROP POLICY IF EXISTS mktg_meta_campanhas_select_auth ON mktg_meta_campanhas;
CREATE POLICY mktg_meta_campanhas_select_auth ON mktg_meta_campanhas
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_campanhas_insert_auth ON mktg_meta_campanhas;
CREATE POLICY mktg_meta_campanhas_insert_auth ON mktg_meta_campanhas
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_campanhas_update_auth ON mktg_meta_campanhas;
CREATE POLICY mktg_meta_campanhas_update_auth ON mktg_meta_campanhas
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_campanhas_delete_auth ON mktg_meta_campanhas;
CREATE POLICY mktg_meta_campanhas_delete_auth ON mktg_meta_campanhas
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_meta_posts
-- ============================================================
DROP POLICY IF EXISTS mktg_meta_posts_select_auth ON mktg_meta_posts;
CREATE POLICY mktg_meta_posts_select_auth ON mktg_meta_posts
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_posts_insert_auth ON mktg_meta_posts;
CREATE POLICY mktg_meta_posts_insert_auth ON mktg_meta_posts
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_posts_update_auth ON mktg_meta_posts;
CREATE POLICY mktg_meta_posts_update_auth ON mktg_meta_posts
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_posts_delete_auth ON mktg_meta_posts;
CREATE POLICY mktg_meta_posts_delete_auth ON mktg_meta_posts
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_meta_insights
-- ============================================================
DROP POLICY IF EXISTS mktg_meta_insights_select_auth ON mktg_meta_insights;
CREATE POLICY mktg_meta_insights_select_auth ON mktg_meta_insights
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_meta_insights_insert_auth ON mktg_meta_insights;
CREATE POLICY mktg_meta_insights_insert_auth ON mktg_meta_insights
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_utms
-- ============================================================
DROP POLICY IF EXISTS mktg_utms_select_auth ON mktg_utms;
CREATE POLICY mktg_utms_select_auth ON mktg_utms
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_utms_insert_auth ON mktg_utms;
CREATE POLICY mktg_utms_insert_auth ON mktg_utms
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_utms_update_auth ON mktg_utms;
CREATE POLICY mktg_utms_update_auth ON mktg_utms
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_utms_delete_auth ON mktg_utms;
CREATE POLICY mktg_utms_delete_auth ON mktg_utms
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_criativos
-- ============================================================
DROP POLICY IF EXISTS mktg_criativos_select_auth ON mktg_criativos;
CREATE POLICY mktg_criativos_select_auth ON mktg_criativos
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_criativos_insert_auth ON mktg_criativos;
CREATE POLICY mktg_criativos_insert_auth ON mktg_criativos
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_criativos_update_auth ON mktg_criativos;
CREATE POLICY mktg_criativos_update_auth ON mktg_criativos
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_criativos_delete_auth ON mktg_criativos;
CREATE POLICY mktg_criativos_delete_auth ON mktg_criativos
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_campanhas_email
-- ============================================================
DROP POLICY IF EXISTS mktg_campanhas_email_select_auth ON mktg_campanhas_email;
CREATE POLICY mktg_campanhas_email_select_auth ON mktg_campanhas_email
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_campanhas_email_insert_auth ON mktg_campanhas_email;
CREATE POLICY mktg_campanhas_email_insert_auth ON mktg_campanhas_email
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_campanhas_email_update_auth ON mktg_campanhas_email;
CREATE POLICY mktg_campanhas_email_update_auth ON mktg_campanhas_email
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_campanhas_email_delete_auth ON mktg_campanhas_email;
CREATE POLICY mktg_campanhas_email_delete_auth ON mktg_campanhas_email
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_disparos_email
-- ============================================================
DROP POLICY IF EXISTS mktg_disparos_email_select_auth ON mktg_disparos_email;
CREATE POLICY mktg_disparos_email_select_auth ON mktg_disparos_email
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_disparos_email_insert_auth ON mktg_disparos_email;
CREATE POLICY mktg_disparos_email_insert_auth ON mktg_disparos_email
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_disparos_email_update_auth ON mktg_disparos_email;
CREATE POLICY mktg_disparos_email_update_auth ON mktg_disparos_email
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_disparos_email_delete_auth ON mktg_disparos_email;
CREATE POLICY mktg_disparos_email_delete_auth ON mktg_disparos_email
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_calendario
-- ============================================================
DROP POLICY IF EXISTS mktg_calendario_select_auth ON mktg_calendario;
CREATE POLICY mktg_calendario_select_auth ON mktg_calendario
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_calendario_insert_auth ON mktg_calendario;
CREATE POLICY mktg_calendario_insert_auth ON mktg_calendario
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_calendario_update_auth ON mktg_calendario;
CREATE POLICY mktg_calendario_update_auth ON mktg_calendario
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_calendario_delete_auth ON mktg_calendario;
CREATE POLICY mktg_calendario_delete_auth ON mktg_calendario
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_leads
-- ============================================================
DROP POLICY IF EXISTS mktg_leads_select_auth ON mktg_leads;
CREATE POLICY mktg_leads_select_auth ON mktg_leads
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_leads_insert_auth ON mktg_leads;
CREATE POLICY mktg_leads_insert_auth ON mktg_leads
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_leads_update_auth ON mktg_leads;
CREATE POLICY mktg_leads_update_auth ON mktg_leads
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_leads_delete_auth ON mktg_leads;
CREATE POLICY mktg_leads_delete_auth ON mktg_leads
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- RLS POLICIES — mktg_pixels
-- ============================================================
DROP POLICY IF EXISTS mktg_pixels_select_auth ON mktg_pixels;
CREATE POLICY mktg_pixels_select_auth ON mktg_pixels
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_pixels_insert_auth ON mktg_pixels;
CREATE POLICY mktg_pixels_insert_auth ON mktg_pixels
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_pixels_update_auth ON mktg_pixels;
CREATE POLICY mktg_pixels_update_auth ON mktg_pixels
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS mktg_pixels_delete_auth ON mktg_pixels;
CREATE POLICY mktg_pixels_delete_auth ON mktg_pixels
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

-- ============================================================
-- GRANTS
-- ============================================================
GRANT SELECT ON mktg_eventos TO authenticated;
GRANT SELECT, INSERT ON mktg_eventos TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_landing_pages TO authenticated;
GRANT SELECT, INSERT ON mktg_landing_pages_versoes TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_meta_contas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_meta_campanhas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_meta_posts TO authenticated;
GRANT SELECT, INSERT ON mktg_meta_insights TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_utms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_criativos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_campanhas_email TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_disparos_email TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_calendario TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mktg_pixels TO authenticated;

GRANT ALL ON mktg_eventos TO service_role;
GRANT ALL ON mktg_landing_pages TO service_role;
GRANT ALL ON mktg_landing_pages_versoes TO service_role;
GRANT ALL ON mktg_meta_contas TO service_role;
GRANT ALL ON mktg_meta_campanhas TO service_role;
GRANT ALL ON mktg_meta_posts TO service_role;
GRANT ALL ON mktg_meta_insights TO service_role;
GRANT ALL ON mktg_utms TO service_role;
GRANT ALL ON mktg_criativos TO service_role;
GRANT ALL ON mktg_campanhas_email TO service_role;
GRANT ALL ON mktg_disparos_email TO service_role;
GRANT ALL ON mktg_calendario TO service_role;
GRANT ALL ON mktg_leads TO service_role;
GRANT ALL ON mktg_pixels TO service_role;
