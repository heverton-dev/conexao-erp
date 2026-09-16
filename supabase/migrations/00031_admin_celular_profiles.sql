-- Adiciona celular ao profile do admin da empresa
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS celular text;
