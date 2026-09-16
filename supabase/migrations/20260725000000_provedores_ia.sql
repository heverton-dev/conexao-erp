-- Migration: Provedores IA
-- Tabela para gerenciar provedores e modelos de IA globalmente

CREATE TABLE IF NOT EXISTS provedores_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  api_key_global TEXT,
  modelos TEXT[] NOT NULL DEFAULT '{}',
  cor TEXT DEFAULT '#c9a655',
  icone TEXT DEFAULT 'cpu',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_provedores_ia_ativo ON provedores_ia(ativo);
CREATE INDEX IF NOT EXISTS idx_provedores_ia_ordem ON provedores_ia(ordem);

-- RLS
ALTER TABLE provedores_ia ENABLE ROW LEVEL SECURITY;

-- SELECT: público (single-tenant)
CREATE POLICY "provedores_ia_select" ON provedores_ia
  FOR SELECT USING (true);

-- ALL: apenas super_admin
CREATE POLICY "provedores_ia_all" ON provedores_ia
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Trigger updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON provedores_ia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed com os 9 provedores atuais
INSERT INTO provedores_ia (nome, url, modelos, cor, icone, ordem) VALUES
  ('OpenCode', 'https://api.opencode.ai/v1', ARRAY['mimo/mimo-v2.5-pro','mimo/mimo-v2.5-flash'], '#c9a655', 'cpu', 1),
  ('Groq', 'https://api.groq.com/openai/v1', ARRAY['llama-3.3-70b-versatile','llama-3.1-8b-instant','gemma2-9b-it','mixtral-8x7b-32768'], '#f5a623', 'zap', 2),
  ('OpenAI', 'https://api.openai.com/v1', ARRAY['gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-3.5-turbo','o3-mini'], '#10a37f', 'brain', 3),
  ('Google AI Studio', 'https://generativelanguage.googleapis.com/v1beta', ARRAY['gemini-2.5-flash','gemini-2.5-pro','gemini-2.0-flash','gemini-1.5-flash'], '#4285f4', 'sparkles', 4),
  ('Mimo (Xiaomi)', 'https://api.mimo.ai/v1', ARRAY['mimo-v2.5-pro','mimo-v2.5-flash'], '#ff6b35', 'cpu', 5),
  ('OpenRouter', 'https://openrouter.ai/api/v1', ARRAY['openai/gpt-4o','anthropic/claude-sonnet-4','google/gemini-2.5-flash','meta-llama/llama-4-maverick','deepseek/deepseek-chat-v3-0324'], '#00d4aa', 'globe', 6),
  ('DeepSeek', 'https://api.deepseek.com/v1', ARRAY['deepseek-chat','deepseek-reasoner'], '#00c853', 'cpu', 7),
  ('Together AI', 'https://api.together.xyz/v1', ARRAY['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo','mistralai/Mixtral-8x7B-Instruct-v0.1'], '#00b4d8', 'network', 8),
  ('Ollama (local)', 'http://localhost:11434/v1', ARRAY['llama3.3','llama3.1','mistral','phi3','gemma2'], '#6b7280', 'server', 9)
ON CONFLICT (nome) DO NOTHING;