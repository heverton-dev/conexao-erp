-- 1. Garante que RLS da tabela catalogo_imagens_produto está 100% desativado
ALTER TABLE IF EXISTS catalogo_imagens_produto DISABLE ROW LEVEL SECURITY;

-- 2. Dropa policies antigas (caso existam) no storage que barravam o insert
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%catalogo%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- 3. Cria uma política irrestrita e limpa para o bucket "catalogo-imagens" sem dependência de empresa_id
CREATE POLICY "catalogo_imagens_public_all" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'catalogo-imagens')
WITH CHECK (bucket_id = 'catalogo-imagens');
