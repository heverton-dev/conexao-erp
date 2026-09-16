-- ============================================================
-- Migration: Corrigir FKs para resource embedding do catálogo
-- Adiciona colunas id (uuid) nas tabelas que não tinham,
-- e cria todas as FKs que o frontend precisa para joins.
-- Todos os valores FK são NULL → sem risco de integridade.
-- ============================================================

-- ============================================================
-- FASE 1: Adicionar coluna id (uuid) nas tabelas alvo
-- ============================================================

-- catalogo_parafusos: precisa de id para parafuso_id FK
ALTER TABLE public.catalogo_parafusos
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

UPDATE public.catalogo_parafusos SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE public.catalogo_parafusos
  ALTER COLUMN id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_parafusos_id ON public.catalogo_parafusos(id);

-- catalogo_chaves: precisa de id para chave_id FK
ALTER TABLE public.catalogo_chaves
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

UPDATE public.catalogo_chaves SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE public.catalogo_chaves
  ALTER COLUMN id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chaves_id ON public.catalogo_chaves(id);

-- catalogo_implantes: precisa de id para implante_id FK
ALTER TABLE public.catalogo_implantes
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

UPDATE public.catalogo_implantes SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE public.catalogo_implantes
  ALTER COLUMN id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_implantes_id ON public.catalogo_implantes(id);

-- ============================================================
-- FASE 2: Corrigir tipo de parafuso_id (text → uuid)
-- ============================================================

-- parafuso_id em abutments e componentes é TEXT mas precisa ser UUID
-- Como todos os valores são NULL, a mudança é segura
ALTER TABLE public.catalogo_abutments
  ALTER COLUMN parafuso_id TYPE uuid USING parafuso_id::uuid;

ALTER TABLE public.catalogo_componentes
  ALTER COLUMN parafuso_id TYPE uuid USING parafuso_id::uuid;

-- ============================================================
-- FASE 3: Criar todas as FKs
-- ============================================================

-- catalogo_abutments → catalogo_cps_tipos_abutments (já existia parcial)
ALTER TABLE public.catalogo_abutments
  DROP CONSTRAINT IF EXISTS fk_abutments_tipo_abutment;
ALTER TABLE public.catalogo_abutments
  ADD CONSTRAINT fk_abutments_tipo_abutment
  FOREIGN KEY (tipo_abutment_id)
  REFERENCES public.catalogo_cps_tipos_abutments(id)
  ON DELETE SET NULL;

-- catalogo_abutments → catalogo_parafusos (via id)
ALTER TABLE public.catalogo_abutments
  ADD CONSTRAINT fk_abutments_parafuso
  FOREIGN KEY (parafuso_id)
  REFERENCES public.catalogo_parafusos(id)
  ON DELETE SET NULL;

-- catalogo_abutments → catalogo_chaves (via id)
ALTER TABLE public.catalogo_abutments
  ADD CONSTRAINT fk_abutments_chave
  FOREIGN KEY (chave_id)
  REFERENCES public.catalogo_chaves(id)
  ON DELETE SET NULL;

-- catalogo_componentes → catalogo_parafusos (via id)
ALTER TABLE public.catalogo_componentes
  ADD CONSTRAINT fk_componentes_parafuso
  FOREIGN KEY (parafuso_id)
  REFERENCES public.catalogo_parafusos(id)
  ON DELETE SET NULL;

-- catalogo_componentes → catalogo_chaves (via id)
ALTER TABLE public.catalogo_componentes
  ADD CONSTRAINT fk_componentes_chave
  FOREIGN KEY (chave_id)
  REFERENCES public.catalogo_chaves(id)
  ON DELETE SET NULL;

-- catalogo_parafusos → catalogo_chaves (via id)
ALTER TABLE public.catalogo_parafusos
  ADD CONSTRAINT fk_parafusos_chave
  FOREIGN KEY (chave_id)
  REFERENCES public.catalogo_chaves(id)
  ON DELETE SET NULL;

-- catalogo_cicatrizadores → catalogo_implantes (via id)
ALTER TABLE public.catalogo_cicatrizadores
  ADD CONSTRAINT fk_cicatrizadores_implante
  FOREIGN KEY (implante_id)
  REFERENCES public.catalogo_implantes(id)
  ON DELETE SET NULL;

-- catalogo_cicatrizadores → catalogo_chaves (via id)
ALTER TABLE public.catalogo_cicatrizadores
  ADD CONSTRAINT fk_cicatrizadores_chave
  FOREIGN KEY (chave_id)
  REFERENCES public.catalogo_chaves(id)
  ON DELETE SET NULL;

-- ============================================================
-- FASE 4: Verificação
-- ============================================================

-- Listar todas as FKs criadas
SELECT 
  tc.table_name AS tabela,
  kcu.column_name AS coluna_fk,
  ccu.table_name AS tabela_ref,
  ccu.column_name AS coluna_ref
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('catalogo_abutments', 'catalogo_componentes', 'catalogo_parafusos', 'catalogo_cicatrizadores', 'catalogo_implantes')
ORDER BY tc.table_name, kcu.column_name;
