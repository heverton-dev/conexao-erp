-- ============================================================
-- 20260718170000_implante_vinculos.sql
-- Pivot tables: Implante ↔ Kits (N:M) e Implante ↔ Abutments (N:M)
-- Cicatrizadores já têm implante_id (1:N) — sem pivot necessário
-- ============================================================

-- ============================================================
-- 1. Implante ↔ Kits (N:M)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_implante_kits (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  implante_sku TEXT NOT NULL,
  kit_sku TEXT NOT NULL,
  PRIMARY KEY (empresa_id, implante_sku, kit_sku)
);

-- ============================================================
-- 2. Implante ↔ Abutments (N:M)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_implante_abutments (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  implante_sku TEXT NOT NULL,
  abutment_sku TEXT NOT NULL,
  PRIMARY KEY (empresa_id, implante_sku, abutment_sku)
);

-- ============================================================
-- 3. RLS Policies
-- ============================================================
ALTER TABLE catalogo_implante_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_implante_abutments ENABLE ROW LEVEL SECURITY;

-- catalogo_implante_kits
CREATE POLICY "empresa_select_implante_kits" ON catalogo_implante_kits
  FOR SELECT USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

CREATE POLICY "empresa_insert_implante_kits" ON catalogo_implante_kits
  FOR INSERT WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session());

CREATE POLICY "empresa_update_implante_kits" ON catalogo_implante_kits
  FOR UPDATE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

CREATE POLICY "empresa_delete_implante_kits" ON catalogo_implante_kits
  FOR DELETE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_implante_abutments
CREATE POLICY "empresa_select_implante_abutments" ON catalogo_implante_abutments
  FOR SELECT USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

CREATE POLICY "empresa_insert_implante_abutments" ON catalogo_implante_abutments
  FOR INSERT WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session());

CREATE POLICY "empresa_update_implante_abutments" ON catalogo_implante_abutments
  FOR UPDATE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

CREATE POLICY "empresa_delete_implante_abutments" ON catalogo_implante_abutments
  FOR DELETE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- ============================================================
-- 4. Adicionar à lista de tabelas RLS existentes (se aplicável)
-- ============================================================
