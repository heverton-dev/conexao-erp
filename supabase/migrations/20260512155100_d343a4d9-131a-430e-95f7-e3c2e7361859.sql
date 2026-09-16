
-- Adiciona novos valores ao enum de papéis.
-- Precisa ficar em migração separada pois ALTER TYPE ADD VALUE
-- não pode ser usado na mesma transação onde é referenciado.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dev';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'diretor_comercial';
