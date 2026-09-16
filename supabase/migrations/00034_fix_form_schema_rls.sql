-- ============================================================
-- Migration 00034: Tornar SELECT da tabela form_schema público
-- ============================================================

DROP POLICY IF EXISTS select_form_schema_empresa ON public.form_schema;

CREATE POLICY select_form_schema_public ON public.form_schema 
  FOR SELECT 
  TO public 
  USING (true);
