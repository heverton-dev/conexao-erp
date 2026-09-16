-- =====================================================
-- Migration: Seed de dados mocados para Conexão Implantes
-- Empresa ID: 1a00d0fe-0d10-48b2-aff7-68e941967f0f
-- Data: 2026-07-16
-- =====================================================

-- =====================================================
-- 1. CATÁLOGO: Estrutura (Categorias, Conexões, Famílias, Linhas)
-- =====================================================

-- Categorias (já existentes no seed anterior, usando ON CONFLICT)
INSERT INTO catalogo_categorias (id, empresa_id, nome, locked, ativo) VALUES
  ('c0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Implantes Dentários', true, true),
  ('c0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Mini Implantes', true, true),
  ('c0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Implantes Zigomáticos', true, true),
  ('c0000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Implantes de Carga Imediata', true, true),
  ('c0000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Sistema Overdenture', true, true)
ON CONFLICT (id) DO NOTHING;

-- Conexões
INSERT INTO catalogo_conexoes (id, empresa_id, categoria_id, nome, sigla, ativo) VALUES
  ('c0000002-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Conexão Hexagonal', 'HEX', true),
  ('c0000002-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Conexão Morse Taper', 'MT', true),
  ('c0000002-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Conexão Interna', 'INT', true),
  ('c0000002-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000002', 'Mini Hexagonal', 'MHEX', true),
  ('c0000002-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000003', 'Zig Conexão', 'ZIG', true)
ON CONFLICT (id) DO NOTHING;

-- Famílias
INSERT INTO catalogo_familias (id, empresa_id, conexao_id, nome, cor_identificacao, ativo) VALUES
  ('c0000003-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000002-0000-0000-0000-000000000001', 'Conexão Active', '#3B82F6', true),
  ('c0000003-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000002-0000-0000-0000-000000000001', 'Conexão One', '#10B981', true),
  ('c0000003-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000002-0000-0000-0000-000000000002', 'Conexão Pro', '#F59E0B', true),
  ('c0000003-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000002-0000-0000-0000-000000000003', 'Conexão Internal Plus', '#8B5CF6', true),
  ('c0000003-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000002-0000-0000-0000-000000000005', 'Zigoma System', '#EF4444', true)
ON CONFLICT (id) DO NOTHING;

-- Linhas
INSERT INTO catalogo_linhas (id, empresa_id, familia_id, nome, ativo) VALUES
  ('c0000004-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000001', 'Active Regular', true),
  ('c0000004-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000001', 'Active Short', true),
  ('c0000004-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000002', 'One Standard', true),
  ('c0000004-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000003', 'Pro Taper', true),
  ('c0000004-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000005', 'Zig Short', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CATÁLOGO: Implantes
-- =====================================================

INSERT INTO catalogo_implantes (sku, empresa_id, linha_id, diametro_mm, comprimento_mm, rosca_interna, regiao_apical, regiao_cervical, torque_insercao, detalhes_extras, ativo) VALUES
  ('IMP-HEX-375', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000004-0000-0000-0000-000000000001', 3.75, 11.5, 'Hex Externo', 'Cônica', 'Liso', 35, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"c0000002-0000-0000-0000-000000000001","familia_id":"c0000003-0000-0000-0000-000000000001"}', true),
  ('IMP-HEX-425', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000004-0000-0000-0000-000000000001', 4.25, 11.5, 'Hex Externo', 'Cônica', 'Liso', 40, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"c0000002-0000-0000-0000-000000000001","familia_id":"c0000003-0000-0000-0000-000000000001"}', true),
  ('IMP-HEX-475', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000004-0000-0000-0000-000000000001', 4.75, 11.5, 'Hex Externo', 'Cônica', 'Liso', 45, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"c0000002-0000-0000-0000-000000000001","familia_id":"c0000003-0000-0000-0000-000000000001"}', true),
  ('IMP-MT-350', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000004-0000-0000-0000-000000000004', 3.50, 10.0, 'Morse Taper', 'Cônica', 'Fibras', 30, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"c0000002-0000-0000-0000-000000000002","familia_id":"c0000003-0000-0000-0000-000000000003"}', true),
  ('IMP-INT-400', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000004-0000-0000-0000-000000000005', 4.00, 11.5, 'Conexão Interna', 'Cônica', 'Liso', 35, '{"categoria_id":"c0000001-0000-0000-0000-000000000003","conexao_id":"c0000002-0000-0000-0000-000000000005","familia_id":"c0000003-0000-0000-0000-000000000005"}', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 3. CATÁLOGO: Fresas
-- =====================================================

INSERT INTO catalogo_fresas (sku, empresa_id, nome, diametro_mm, venda_avulsa, ativo) VALUES
  ('FRE-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Piloto 2.0mm', 2.0, true, true),
  ('FRE-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Twist 2.0mm', 2.0, true, true),
  ('FRE-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Twist 2.8mm', 2.8, true, true),
  ('FRE-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Lanza 3.5mm', 3.5, false, true),
  ('FRE-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Countersink 4.3mm', 4.3, false, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 4. CATÁLOGO: Tipos de Reabilitação e Abutment
-- =====================================================

INSERT INTO catalogo_tipos_reabilitacao (id, empresa_id, nome, ativo) VALUES
  ('c0000005-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Coroa-unitária', true),
  ('c0000005-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Ponte-unitária', true),
  ('c0000005-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Overdenture', true),
  ('c0000005-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'All-on-4', true),
  ('c0000005-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'All-on-6', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_tipos_abutment (id, empresa_id, nome, sigla, ativo) VALUES
  ('c0000006-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Cilíndrico', 'ACIL', true),
  ('c0000006-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Angulado', 'AANG', true),
  ('c0000006-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment de Carga Imediata', 'ACI', true),
  ('c0000006-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Ball', 'ABAL', true),
  ('c0000006-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Locator', 'ALOC', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CATÁLOGO: Abutments
-- =====================================================

INSERT INTO catalogo_abutments (sku, empresa_id, familia_id, tipo_reabilitacao_id, tipo_abutment_id, diametro_plataforma, angulacao_graus, altura_transmucoso, altura_corpo, torque_ncm, ativo) VALUES
  ('ABU-35-CIL', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000001', 'c0000006-0000-0000-0000-000000000001', '3.5', 0, 2.0, 8.0, 25, true),
  ('ABU-35-ANG', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000001', 'c0000005-0000-0000-0000-000000000002', 'c0000006-0000-0000-0000-000000000002', '3.5', 15, 2.0, 10.0, 25, true),
  ('ABU-43-CIL', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000002', 'c0000005-0000-0000-0000-000000000001', 'c0000006-0000-0000-0000-000000000001', '4.3', 0, 2.0, 8.0, 30, true),
  ('ABU-43-CI', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000002', 'c0000005-0000-0000-0000-000000000004', 'c0000006-0000-0000-0000-000000000003', '4.3', 0, 3.0, 12.0, 30, true),
  ('ABU-50-BAL', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000003-0000-0000-0000-000000000003', 'c0000005-0000-0000-0000-000000000003', 'c0000006-0000-0000-0000-000000000004', '5.0', 0, 2.0, 6.0, 35, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 6. CATÁLOGO: Tipos de Componente e Componentes
-- =====================================================

INSERT INTO catalogo_categorias_acessorio (id, empresa_id, nome, ativo) VALUES
  ('c0000007-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Transferentes', true),
  ('c0000007-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafusos de Cobre', true),
  ('c0000007-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafusos de Retenção', true),
  ('c0000007-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Corpos de Cicatrização', true),
  ('c0000007-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Molas de Cobre', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_acessorios (sku, empresa_id, categoria_id, nome, diametro_mm, altura_mm, caracteristicas, ativo) VALUES
  ('ACC-TR-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000007-0000-0000-0000-000000000001', 'Transferente de Moldeira Aberta 3.5mm', 3.5, 12.0, '{"tipo":"aberta"}', true),
  ('ACC-TR-43', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000007-0000-0000-0000-000000000001', 'Transferente de Moldeira Fechada 4.3mm', 4.3, 14.0, '{"tipo":"fechada"}', true),
  ('ACC-PC-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000007-0000-0000-0000-000000000002', 'Parafuso de Cobre 3.5mm', 3.5, 8.0, '{"material":"cobre"}', true),
  ('ACC-PR-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000007-0000-0000-0000-000000000003', 'Parafuso de Retenção Abutment 3.5mm', 3.5, 6.0, '{"uso":"abutment"}', true),
  ('ACC-MC-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000007-0000-0000-0000-000000000005', 'Mola de Cobre 3.5mm', 3.5, 4.0, '{"tipo":"mola"}', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 7. CATÁLOGO: Chaves e Ferramental
-- =====================================================

INSERT INTO catalogo_chaves_ferramental (sku, empresa_id, nome, tipo_ferramenta, ativo) VALUES
  ('CHV-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Aperto Hex 1.25mm', 'Aperto', true),
  ('CHV-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Aperto Torque 35Ncm', 'Aperto', true),
  ('CHV-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Medição de Profundidade', 'Medição', true),
  ('CHV-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave Cirúrgica de Sítio', 'Cirúrgica', true),
  ('CHV-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Condicionamento Ósseo', 'Cirúrgica', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 8. CATÁLOGO: Categorias de Instrumental e Instrumentais
-- =====================================================

INSERT INTO catalogo_categorias_instrumental (id, empresa_id, nome, ativo) VALUES
  ('c0000008-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chaves Protéticas', true),
  ('c0000008-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chaves Cirúrgicas', true),
  ('c0000008-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresas', true),
  ('c0000008-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Instrumentos Opcionais', true),
  ('c0000008-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Instrumentos Complementares', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_instrumentais_gerais (sku, empresa_id, categoria_id, nome, ativo) VALUES
  ('INS-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000008-0000-0000-0000-000000000001', 'Torquímetro Digital Protético', true),
  ('INS-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000008-0000-0000-0000-000000000002', 'Sugador Cirúrgico Estéril', true),
  ('INS-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000008-0000-0000-0000-000000000003', 'Fresa de Condicionamento 2.0mm', true),
  ('INS-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000008-0000-0000-0000-000000000004', 'Kit de Impressão Digital', true),
  ('INS-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000008-0000-0000-0000-000000000005', 'Moldeira de Carga Imediata', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 9. CATÁLOGO: Workflows e Etapas
-- =====================================================

INSERT INTO catalogo_workflows (id, empresa_id, nome, ativo) VALUES
  ('c0000009-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo de Carga Convencional', true),
  ('c0000009-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo de Carga Imediata', true),
  ('c0000009-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo Overdenture', true),
  ('c0000009-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo All-on-4', true),
  ('c0000009-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo de Revisão', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_etapas_workflow (id, empresa_id, ordem, nome, ativo) VALUES
  ('c0000010-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 1, 'Cirurgia', true),
  ('c0000010-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 2, 'Cicatrização', true),
  ('c0000010-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 3, 'Moldagem', true),
  ('c0000010-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 4, 'Prótese', true),
  ('c0000010-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 5, 'Instalação', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. CATÁLOGO: Kits e Categorias de Kit
-- =====================================================

INSERT INTO catalogo_categorias_kit (id, empresa_id, nome, ativo) VALUES
  ('c0000011-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits Cirúrgicos', true),
  ('c0000011-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits Protéticos', true),
  ('c0000011-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits de Carga Imediata', true),
  ('c0000011-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits de Impressão', true),
  ('c0000011-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits Promocionais', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_kits (sku, empresa_id, categoria_id, nome, descricao, ativo) VALUES
  ('KIT-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000011-0000-0000-0000-000000000001', 'Kit Cirúrgico Básico', 'Kit completo para instalação de implantes hexagonais', true),
  ('KIT-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000011-0000-0000-0000-000000000002', 'Kit Protético Digital', 'Kit para reabilitação protética com componentes digitais', true),
  ('KIT-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000011-0000-0000-0000-000000000003', 'Kit Carga Imediata Full', 'Kit completo para carga imediata com componentes', true),
  ('KIT-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000011-0000-0000-0000-000000000004', 'Kit de Impressão Transferente', 'Kit com transferentes e parafusos de cobre', true),
  ('KIT-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000011-0000-0000-0000-000000000005', 'Kit Starter', 'Kit inicial com implante + componentes essenciais', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 11. CATÁLOGO: Cupons
-- =====================================================

INSERT INTO catalogo_cupons (id, empresa_id, codigo, tipo, valor, validade, ativo) VALUES
  ('c0000012-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'BEMVINDO10', 'percentual', 10, '2026-12-31', true),
  ('c0000012-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'DESCONTO50', 'fixo', 50, '2026-09-30', true),
  ('c0000012-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'BLACKFRIDAY', 'percentual', 25, '2026-11-30', true),
  ('c0000012-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'FRETEGRATIS', 'fixo', 99, '2026-12-31', true),
  ('c0000012-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'IMPLANTE15', 'percentual', 15, '2026-08-31', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. CATÁLOGO: Configurações
-- =====================================================

INSERT INTO catalogo_configuracoes (empresa_id, nome_loja, cnpj, email_contato, telefone, exibir_precos, exibir_estoque, checkout_habilitado, cupons_habilitado) VALUES
  ('1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Conexão Implantes', '12.345.678/0001-90', 'contato@conexaoimplantes.com.br', '(11) 99999-0000', true, true, true, true)
ON CONFLICT (empresa_id) DO NOTHING;

-- =====================================================
-- 13. NPS: Perguntas
-- =====================================================

INSERT INTO nps_perguntas (id, empresa_id, key, type, question_text, required, active, order_index) VALUES
  ('c0000013-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'nps_recomendacao', 'nps', 'Em escala 0-10, qual probabilidade de recomendar?', true, true, 1),
  ('c0000013-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'qualidade_produtos', 'single_choice', 'Como avalia a qualidade dos implantes?', true, true, 2),
  ('c0000013-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'melhorias', 'text', 'O que poderiamos melhorar?', false, true, 3),
  ('c0000013-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'atendimento', 'matrix', 'Como avalia o atendimento do consultor?', true, true, 4),
  ('c0000013-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'produtos_utilizados', 'multi_choice', 'Quais produtos mais utiliza?', false, true, 5)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 14. FUNIS: Funis Kanban
-- =====================================================

INSERT INTO funis (id, empresa_id, titulo, descricao, created_by, created_at) VALUES
  ('c0000014-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Vendas', 'Pipeline de vendas de implantes', '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('c0000014-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Pos-Venda', 'Acompanhamento pos-venda', '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('c0000014-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Treinamento', 'Pipeline de treinamento', '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('c0000014-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Reclamacoes', 'Gestao de reclamacoes', '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('c0000014-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parcerias', 'Pipeline de parcerias', '3a8d9652-45c4-4418-af2b-d83357e34b35', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 15. ROTAS: Configuração
-- =====================================================

INSERT INTO rotas_config (id, empresa_id, valor_km_reembolso, raio_permitido_metros) VALUES
  ('c0000015-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 0.85, 5000)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 16. DESPESAS: Tipos de Despesa
-- =====================================================

INSERT INTO despesas_tipos (id, empresa_id, nome, ativo) VALUES
  ('c0000016-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Combustivel', true),
  ('c0000016-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Alimentacao', true),
  ('c0000016-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Estacionamento', true),
  ('c0000016-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Pedagio', true),
  ('c0000016-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Hospedagem', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 17. LINKTREE: Colaboradores
-- =====================================================

INSERT INTO linktree_colaboradores (id, empresa_id, nome, cargo, email, whatsapp, status) VALUES
  ('c0000017-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Ricardo Almeida', 'Diretor Comercial', 'ricardo@conexao.com.br', '(11) 99999-1111', 'ativo'),
  ('c0000017-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fernanda Lima', 'Consultora Tecnica', 'fernanda@conexao.com.br', '(11) 99999-2222', 'ativo'),
  ('c0000017-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Bruno Costa', 'Gerente de Vendas', 'bruno@conexao.com.br', '(11) 99999-3333', 'ativo'),
  ('c0000017-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Camila Santos', 'Assistente Comercial', 'camila@conexao.com.br', '(11) 99999-4444', 'ativo'),
  ('c0000017-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Lucas Pereira', 'Suporte Tecnico', 'lucas@conexao.com.br', '(11) 99999-5555', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 18. GERADOR DE LINKS
-- =====================================================

INSERT INTO gerador_links (id, empresa_id, tipo, titulo, url_gerada) VALUES
  ('c0000018-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'whatsapp', 'Convite WhatsApp', 'https://wa.me/5511999990000'),
  ('c0000018-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'google_review', 'Link Google Review', 'https://g.page/r/conexao-implantes/review'),
  ('c0000018-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'utm', 'Link UTM Facebook', 'https://conexaoimplantes.com.br?utm_source=facebook'),
  ('c0000018-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'google_maps', 'Google Maps', 'https://maps.google.com/?q=Conexao+Implantes'),
  ('c0000018-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'waze', 'Waze', 'https://waze.com/ul?q=Conexao+Implantes')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 19. MARKETING: Leads
-- =====================================================

INSERT INTO mktg_leads (id, empresa_id, nome, email, telefone, fonte, status) VALUES
  ('c0000019-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. Andre Martins', 'andre@martins.com.br', '(11) 98888-1111', 'site', 'novo'),
  ('c0000019-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dra. Juliana Rocha', 'juliana@rocha.com.br', '(21) 98888-2222', 'instagram', 'qualificado'),
  ('c0000019-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. Fernando Alves', 'fernando@alves.com.br', '(31) 98888-3333', 'indicacao', 'qualificado'),
  ('c0000019-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dra. Tatiane Souza', 'tatiane@souza.com.br', '(41) 98888-4444', 'evento', 'novo'),
  ('c0000019-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. Ricardo Nunes', 'ricardo@nunes.com.br', '(51) 98888-5555', 'site', 'convertido')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 20. MARKETING: UTMs
-- =====================================================

INSERT INTO mktg_utms (id, empresa_id, nome, url_destino, utm_source, utm_medium, utm_campaign) VALUES
  ('c0000020-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Campanha Facebook Julho', 'https://conexaoimplantes.com.br', 'facebook', 'cpc', 'campanha_julho_2026'),
  ('c0000020-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Google Ads Implantes', 'https://conexaoimplantes.com.br', 'google', 'cpc', 'implantes_q3_2026'),
  ('c0000020-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Instagram Organico', 'https://conexaoimplantes.com.br', 'instagram', 'organic', 'conteudo_julho'),
  ('c0000020-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Email Newsletter', 'https://conexaoimplantes.com.br', 'email', 'newsletter', 'julho_2026'),
  ('c0000020-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Indicacao Medica', 'https://conexaoimplantes.com.br', 'indicacao', 'referral', 'medicos_parceiros')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 21. MARKETING: Criativos
-- =====================================================

INSERT INTO mktg_criativos (id, empresa_id, nome, tipo, status) VALUES
  ('c0000021-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Banner Carga Imediata', 'imagem', 'aprovado'),
  ('c0000021-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Video Depoimento Dr. Silva', 'video', 'aprovado'),
  ('c0000021-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Carrossel Produtos', 'carrossel', 'rascunho'),
  ('c0000021-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Stories Lancamento', 'imagem', 'rascunho'),
  ('c0000021-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Video Tutorial Fresagem', 'video', 'aprovado')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 22. MARKETING: Calendário Editorial
-- =====================================================

INSERT INTO mktg_calendario (id, empresa_id, titulo, descricao, data, plataforma, status) VALUES
  ('c0000022-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Post sobre Carga Imediata', 'Conteudo educativo', '2026-07-20', 'instagram', 'agendado'),
  ('c0000022-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Artigo Blog Zygomaticos', 'Artigo tecnico', '2026-07-22', 'blog', 'agendado'),
  ('c0000022-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Video Depoimento', 'Video de cliente', '2026-07-25', 'youtube', 'rascunho'),
  ('c0000022-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Newsletter Mensal', 'Envio de novidades', '2026-07-28', 'email', 'rascunho'),
  ('c0000022-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Live Instagram', 'Live com Dr. Ricardo', '2026-07-30', 'instagram', 'agendado')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 23. AGENTES IA
-- =====================================================

INSERT INTO agentes_ia (id, empresa_id, nome, modulo_key, modelo, system_prompt, provedor_url, provedor_api_key, ativo) VALUES
  ('c0000023-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Assistente de Vendas', 'catalogo', 'gpt-4o', 'Voce e um assistente de vendas.', 'https://api.openai.com/v1', 'sk-mock-key-001', true),
  ('c0000023-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Suporte Tecnico', 'catalogo', 'gpt-4o', 'Voce e um suporte tecnico.', 'https://api.openai.com/v1', 'sk-mock-key-002', true),
  ('c0000023-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Assistente de Cadastro', 'cadastros', 'gpt-4o-mini', 'Voce auxilia cadastros.', 'https://api.openai.com/v1', 'sk-mock-key-003', true),
  ('c0000023-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chatbot WhatsApp', 'marketing', 'gpt-4o', 'Voce e o chatbot.', 'https://api.openai.com/v1', 'sk-mock-key-004', true),
  ('c0000023-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Analista de Dados', 'relatorios', 'gpt-4o', 'Voce analisa dados.', 'https://api.openai.com/v1', 'sk-mock-key-005', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 24. MANUTENÇÃO: Registros
-- =====================================================

INSERT INTO modulos_manutencao (id, empresa_id, modulo_key, rota, ativo, mensagem) VALUES
  ('c0000024-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'catalogo', '/catalogo/admin/*', false, 'Sistema em manutencao programada'),
  ('c0000024-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cadastros', '/cadastros/*', false, 'Manutencao preventiva'),
  ('c0000024-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'crm', '/crm/*', false, 'Atualizacao de sistema'),
  ('c0000024-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'hub', '/hub/*', false, 'Backup de dados'),
  ('c0000024-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'marketing', '/marketing/*', false, 'Migracao de dados')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- FIM DO SEED
-- =====================================================
