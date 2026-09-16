ALTER TABLE public.demo_credentials ADD COLUMN IF NOT EXISTS modulos_ativos jsonb DEFAULT '[]'::jsonb;
