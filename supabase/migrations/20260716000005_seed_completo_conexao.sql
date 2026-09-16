-- =====================================================
-- Migration: Seed COMPLETO para Conexão Implantes
-- Empresa ID: 6687e2f0-1ff6-406d-b621-7927764f121a
-- Data: 2026-07-16
-- =====================================================

-- Variável da empresa
DO $$
DECLARE
  eid CONSTANT UUID := '6687e2f0-1ff6-406d-b621-7927764f121a';
BEGIN

-- =====================================================
-- 1. CATÁLOGO: Categorias, Conexões, Famílias, Linhas
-- =====================================================

INSERT INTO catalogo_categorias (id, empresa_id, nome, locked, ativo) VALUES
  ('d0000001-0000-0000-0000-000000000001', eid, 'Implantes Dentários', true, true),
  ('d0000001-0000-0000-0000-000000000002', eid, 'Mini Implantes', true, true),
  ('d0000001-0000-0000-0000-000000000003', eid, 'Implantes Zigomáticos', true, true),
  ('d0000001-0000-0000-0000-000000000004', eid, 'Implantes de Carga Imediata', true, true),
  ('d0000001-0000-0000-0000-000000000005', eid, 'Sistema Overdenture', true, true)
ON CONFLICT ON CONSTRAINT catalogo_categorias_empresa_id_nome_key DO NOTHING;

INSERT INTO catalogo_conexoes (id, empresa_id, categoria_id, nome, sigla, ativo) VALUES
  ('d0000002-0000-0000-0000-000000000001', eid, 'd0000001-0000-0000-0000-000000000001', 'Conexão Hexagonal', 'HEX', true),
  ('d0000002-0000-0000-0000-000000000002', eid, 'd0000001-0000-0000-0000-000000000001', 'Conexão Morse Taper', 'MT', true),
  ('d0000002-0000-0000-0000-000000000003', eid, 'd0000001-0000-0000-0000-000000000001', 'Conexão Interna', 'INT', true),
  ('d0000002-0000-0000-0000-000000000004', eid, 'd0000001-0000-0000-0000-000000000002', 'Mini Hexagonal', 'MHEX', true),
  ('d0000002-0000-0000-0000-000000000005', eid, 'd0000001-0000-0000-0000-000000000003', 'Zig Conexão', 'ZIG', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_familias (id, empresa_id, conexao_id, nome, cor_identificacao, ativo) VALUES
  ('d0000003-0000-0000-0000-000000000001', eid, 'd0000002-0000-0000-0000-000000000001', 'Conexão Active', '#3B82F6', true),
  ('d0000003-0000-0000-0000-000000000002', eid, 'd0000002-0000-0000-0000-000000000001', 'Conexão One', '#10B981', true),
  ('d0000003-0000-0000-0000-000000000003', eid, 'd0000002-0000-0000-0000-000000000002', 'Conexão Pro', '#F59E0B', true),
  ('d0000003-0000-0000-0000-000000000004', eid, 'd0000002-0000-0000-0000-000000000003', 'Conexão Internal Plus', '#8B5CF6', true),
  ('d0000003-0000-0000-0000-000000000005', eid, 'd0000002-0000-0000-0000-000000000005', 'Zigoma System', '#EF4444', true),
  ('d0000003-0000-0000-0000-000000000006', eid, 'd0000002-0000-0000-0000-000000000004', 'Mini Active', '#06B6D4', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_linhas (id, empresa_id, familia_id, nome, ativo) VALUES
  ('d0000004-0000-0000-0000-000000000001', eid, 'd0000003-0000-0000-0000-000000000001', 'Active Regular', true),
  ('d0000004-0000-0000-0000-000000000002', eid, 'd0000003-0000-0000-0000-000000000001', 'Active Short', true),
  ('d0000004-0000-0000-0000-000000000003', eid, 'd0000003-0000-0000-0000-000000000002', 'One Standard', true),
  ('d0000004-0000-0000-0000-000000000004', eid, 'd0000003-0000-0000-0000-000000000003', 'Pro Taper', true),
  ('d0000004-0000-0000-0000-000000000005', eid, 'd0000003-0000-0000-0000-000000000004', 'Internal Plus Standard', true),
  ('d0000004-0000-0000-0000-000000000006', eid, 'd0000003-0000-0000-0000-000000000005', 'Zig Short', true),
  ('d0000004-0000-0000-0000-000000000007', eid, 'd0000003-0000-0000-0000-000000000005', 'Zig Long', true),
  ('d0000004-0000-0000-0000-000000000008', eid, 'd0000003-0000-0000-0000-000000000006', 'Mini Regular', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CATÁLOGO: Implantes (15 produtos)
-- =====================================================

INSERT INTO catalogo_implantes (sku, empresa_id, linha_id, diametro_mm, comprimento_mm, rosca_interna, regiao_apical, regiao_cervical, torque_insercao, detalhes_extras, ativo) VALUES
  ('IMP-ACT-375-10', eid, 'd0000004-0000-0000-0000-000000000001', 3.75, 10.0, 'Hex Externo', 'Cônica', 'Liso', 35, '{"conexao":"HEX","familia":"Active"}', true),
  ('IMP-ACT-375-11', eid, 'd0000004-0000-0000-0000-000000000001', 3.75, 11.5, 'Hex Externo', 'Cônica', 'Liso', 35, '{"conexao":"HEX","familia":"Active"}', true),
  ('IMP-ACT-375-13', eid, 'd0000004-0000-0000-0000-000000000001', 3.75, 13.0, 'Hex Externo', 'Cônica', 'Liso', 35, '{"conexao":"HEX","familia":"Active"}', true),
  ('IMP-ACT-425-10', eid, 'd0000004-0000-0000-0000-000000000001', 4.25, 10.0, 'Hex Externo', 'Cônica', 'Liso', 40, '{"conexao":"HEX","familia":"Active"}', true),
  ('IMP-ACT-425-11', eid, 'd0000004-0000-0000-0000-000000000001', 4.25, 11.5, 'Hex Externo', 'Cônica', 'Liso', 40, '{"conexao":"HEX","familia":"Active"}', true),
  ('IMP-ACT-475-11', eid, 'd0000004-0000-0000-0000-000000000001', 4.75, 11.5, 'Hex Externo', 'Cônica', 'Liso', 45, '{"conexao":"HEX","familia":"Active"}', true),
  ('IMP-ONE-350-10', eid, 'd0000004-0000-0000-0000-000000000003', 3.50, 10.0, 'Hex Externo', 'Cônica', 'Fibras', 30, '{"conexao":"HEX","familia":"One"}', true),
  ('IMP-ONE-400-11', eid, 'd0000004-0000-0000-0000-000000000003', 4.00, 11.5, 'Hex Externo', 'Cônica', 'Fibras', 35, '{"conexao":"HEX","familia":"One"}', true),
  ('IMP-PRO-350-10', eid, 'd0000004-0000-0000-0000-000000000004', 3.50, 10.0, 'Morse Taper', 'Cônica', 'Fibras', 30, '{"conexao":"MT","familia":"Pro"}', true),
  ('IMP-PRO-400-11', eid, 'd0000004-0000-0000-0000-000000000004', 4.00, 11.5, 'Morse Taper', 'Cônica', 'Fibras', 35, '{"conexao":"MT","familia":"Pro"}', true),
  ('IMP-PRO-450-13', eid, 'd0000004-0000-0000-0000-000000000004', 4.50, 13.0, 'Morse Taper', 'Cônica', 'Fibras', 40, '{"conexao":"MT","familia":"Pro"}', true),
  ('IMP-INT-400-11', eid, 'd0000004-0000-0000-0000-000000000005', 4.00, 11.5, 'Conexão Interna', 'Cônica', 'Liso', 35, '{"conexao":"INT","familia":"Internal Plus"}', true),
  ('IMP-ZIG-375-10', eid, 'd0000004-0000-0000-0000-000000000006', 3.75, 10.0, 'Hex Externo', 'Cônica', 'Liso', 35, '{"conexao":"ZIG","familia":"Zigoma"}', true),
  ('IMP-ZIG-425-16', eid, 'd0000004-0000-0000-0000-000000000007', 4.25, 16.0, 'Hex Externo', 'Cônica', 'Liso', 45, '{"conexao":"ZIG","familia":"Zigoma"}', true),
  ('IMP-ZIG-500-18', eid, 'd0000004-0000-0000-0000-000000000007', 5.00, 18.0, 'Hex Externo', 'Cônica', 'Liso', 50, '{"conexao":"ZIG","familia":"Zigoma"}', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 3. CATÁLOGO: Fresas (8 produtos)
-- =====================================================

INSERT INTO catalogo_fresas (sku, empresa_id, nome, diametro_mm, venda_avulsa, ativo) VALUES
  ('FRE-001', eid, 'Fresa Piloto 2.0mm', 2.0, true, true),
  ('FRE-002', eid, 'Fresa Twist 2.0mm', 2.0, true, true),
  ('FRE-003', eid, 'Fresa Twist 2.8mm', 2.8, true, true),
  ('FRE-004', eid, 'Fresa Twist 3.5mm', 3.5, true, true),
  ('FRE-005', eid, 'Fresa Lanza 3.5mm', 3.5, false, true),
  ('FRE-006', eid, 'Fresa Lanza 4.3mm', 4.3, false, true),
  ('FRE-007', eid, 'Fresa Countersink 4.3mm', 4.3, false, true),
  ('FRE-008', eid, 'Fresa de Condicionamento 2.0mm', 2.0, true, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 4. CATÁLOGO: Tipos de Reabilitação e Abutment
-- =====================================================

INSERT INTO catalogo_tipos_reabilitacao (id, empresa_id, nome, ativo) VALUES
  ('d0000005-0000-0000-0000-000000000001', eid, 'Coroa Unitária', true),
  ('d0000005-0000-0000-0000-000000000002', eid, 'Ponte Unitária', true),
  ('d0000005-0000-0000-0000-000000000003', eid, 'Overdenture', true),
  ('d0000005-0000-0000-0000-000000000004', eid, 'All-on-4', true),
  ('d0000005-0000-0000-0000-000000000005', eid, 'All-on-6', true),
  ('d0000005-0000-0000-0000-000000000006', eid, 'Carga Imediata', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_tipos_abutment (id, empresa_id, nome, sigla, ativo) VALUES
  ('d0000006-0000-0000-0000-000000000001', eid, 'Abutment Cilíndrico', 'ACIL', true),
  ('d0000006-0000-0000-0000-000000000002', eid, 'Abutment Angulado', 'AANG', true),
  ('d0000006-0000-0000-0000-000000000003', eid, 'Abutment de Carga Imediata', 'ACI', true),
  ('d0000006-0000-0000-0000-000000000004', eid, 'Abutment Ball', 'ABAL', true),
  ('d0000006-0000-0000-0000-000000000005', eid, 'Abutment Locator', 'ALOC', true),
  ('d0000006-0000-0000-0000-000000000006', eid, 'Healing Abutment', 'HEAL', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CATÁLOGO: Abutments (8 produtos)
-- =====================================================

INSERT INTO catalogo_abutments (sku, empresa_id, familia_id, tipo_reabilitacao_id, tipo_abutment_id, diametro_plataforma, angulacao_graus, altura_transmucoso, altura_corpo, torque_ncm, ativo) VALUES
  ('ABU-35-CIL-02', eid, 'd0000003-0000-0000-0000-000000000001', 'd0000005-0000-0000-0000-000000000001', 'd0000006-0000-0000-0000-000000000001', '3.5', 0, 2.0, 8.0, 25, true),
  ('ABU-35-ANG-15', eid, 'd0000003-0000-0000-0000-000000000001', 'd0000005-0000-0000-0000-000000000002', 'd0000006-0000-0000-0000-000000000002', '3.5', 15, 2.0, 10.0, 25, true),
  ('ABU-43-CIL-02', eid, 'd0000003-0000-0000-0000-000000000002', 'd0000005-0000-0000-0000-000000000001', 'd0000006-0000-0000-0000-000000000001', '4.3', 0, 2.0, 8.0, 30, true),
  ('ABU-43-CI-03', eid, 'd0000003-0000-0000-0000-000000000002', 'd0000005-0000-0000-0000-000000000004', 'd0000006-0000-0000-0000-000000000003', '4.3', 0, 3.0, 12.0, 30, true),
  ('ABU-50-BAL-02', eid, 'd0000003-0000-0000-0000-000000000003', 'd0000005-0000-0000-0000-000000000003', 'd0000006-0000-0000-0000-000000000004', '5.0', 0, 2.0, 6.0, 35, true),
  ('ABU-35-HEAL', eid, 'd0000003-0000-0000-0000-000000000001', 'd0000005-0000-0000-0000-000000000006', 'd0000006-0000-0000-0000-000000000006', '3.5', 0, 1.0, 5.0, 20, true),
  ('ABU-43-HEAL', eid, 'd0000003-0000-0000-0000-000000000002', 'd0000005-0000-0000-0000-000000000006', 'd0000006-0000-0000-0000-000000000006', '4.3', 0, 1.0, 5.0, 20, true),
  ('ABU-50-LOC-02', eid, 'd0000003-0000-0000-0000-000000000003', 'd0000005-0000-0000-0000-000000000003', 'd0000006-0000-0000-0000-000000000005', '5.0', 0, 2.0, 6.0, 35, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 6. CATÁLOGO: Componentes / Acessórios (8 produtos)
-- =====================================================

INSERT INTO catalogo_categorias_acessorio (id, empresa_id, nome, ativo) VALUES
  ('d0000007-0000-0000-0000-000000000001', eid, 'Transferentes', true),
  ('d0000007-0000-0000-0000-000000000002', eid, 'Parafusos de Cobre', true),
  ('d0000007-0000-0000-0000-000000000003', eid, 'Parafusos de Retenção', true),
  ('d0000007-0000-0000-0000-000000000004', eid, 'Corpos de Cicatrização', true),
  ('d0000007-0000-0000-0000-000000000005', eid, 'Molas de Cobre', true),
  ('d0000007-0000-0000-0000-000000000006', eid, 'Parafusos de Prova', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_acessorios (sku, empresa_id, categoria_id, nome, diametro_mm, altura_mm, caracteristicas, ativo) VALUES
  ('ACC-TR-35-A', eid, 'd0000007-0000-0000-0000-000000000001', 'Transferente Aberto 3.5mm', 3.5, 12.0, '{"tipo":"aberta"}', true),
  ('ACC-TR-43-F', eid, 'd0000007-0000-0000-0000-000000000001', 'Transferente Fechado 4.3mm', 4.3, 14.0, '{"tipo":"fechada"}', true),
  ('ACC-TR-50-A', eid, 'd0000007-0000-0000-0000-000000000001', 'Transferente Aberto 5.0mm', 5.0, 16.0, '{"tipo":"aberta"}', true),
  ('ACC-PC-35-A', eid, 'd0000007-0000-0000-0000-000000000002', 'Parafuso Cobre 3.5mm', 3.5, 8.0, '{"material":"cobre"}', true),
  ('ACC-PC-43-A', eid, 'd0000007-0000-0000-0000-000000000002', 'Parafuso Cobre 4.3mm', 4.3, 8.0, '{"material":"cobre"}', true),
  ('ACC-PR-35-A', eid, 'd0000007-0000-0000-0000-000000000003', 'Parafuso Retenção 3.5mm', 3.5, 6.0, '{"uso":"abutment"}', true),
  ('ACC-MC-35-A', eid, 'd0000007-0000-0000-0000-000000000005', 'Mola Cobre 3.5mm', 3.5, 4.0, '{"tipo":"mola"}', true),
  ('ACC-PP-35-A', eid, 'd0000007-0000-0000-0000-000000000006', 'Parafuso Prova 3.5mm', 3.5, 10.0, '{"uso":"prova"}', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 7. CATÁLOGO: Chaves e Ferramental (6 produtos)
-- =====================================================

INSERT INTO catalogo_chaves_ferramental (sku, empresa_id, nome, tipo_ferramenta, ativo) VALUES
  ('CHV-001', eid, 'Chave Aperto Hex 1.25mm', 'Aperto', true),
  ('CHV-002', eid, 'Chave Torque 35Ncm', 'Aperto', true),
  ('CHV-003', eid, 'Chave Medição Profundidade', 'Medicao', true),
  ('CHV-004', eid, 'Chave Cirúrgica Sítio', 'Cirurgica', true),
  ('CHV-005', eid, 'Chave Condicionamento Ósseo', 'Cirurgica', true),
  ('CHV-006', eid, 'Chave Protética Digital', 'Aperto', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 8. CATÁLOGO: Instrumentais (6 produtos)
-- =====================================================

INSERT INTO catalogo_categorias_instrumental (id, empresa_id, nome, ativo) VALUES
  ('d0000008-0000-0000-0000-000000000001', eid, 'Chaves Protéticas', true),
  ('d0000008-0000-0000-0000-000000000002', eid, 'Chaves Cirúrgicas', true),
  ('d0000008-0000-0000-0000-000000000003', eid, 'Fresas', true),
  ('d0000008-0000-0000-0000-000000000004', eid, 'Instrumentos Opcionais', true),
  ('d0000008-0000-0000-0000-000000000005', eid, 'Instrumentos Complementares', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_instrumentais_gerais (sku, empresa_id, categoria_id, nome, ativo) VALUES
  ('INS-001', eid, 'd0000008-0000-0000-0000-000000000001', 'Torquímetro Digital Protético', true),
  ('INS-002', eid, 'd0000008-0000-0000-0000-000000000002', 'Sugador Cirúrgico Estéril', true),
  ('INS-003', eid, 'd0000008-0000-0000-0000-000000000003', 'Fresa Condicionamento 2.0mm', true),
  ('INS-004', eid, 'd0000008-0000-0000-0000-000000000004', 'Kit Impressão Digital', true),
  ('INS-005', eid, 'd0000008-0000-0000-0000-000000000005', 'Moldeira Carga Imediata', true),
  ('INS-006', eid, 'd0000008-0000-0000-0000-000000000001', 'Chave Protética Torque 25Ncm', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 9. CATÁLOGO: Kits (5 produtos)
-- =====================================================

INSERT INTO catalogo_categorias_kit (id, empresa_id, nome, ativo) VALUES
  ('d0000011-0000-0000-0000-000000000001', eid, 'Kits Cirúrgicos', true),
  ('d0000011-0000-0000-0000-000000000002', eid, 'Kits Protéticos', true),
  ('d0000011-0000-0000-0000-000000000003', eid, 'Kits Carga Imediata', true),
  ('d0000011-0000-0000-0000-000000000004', eid, 'Kits de Impressão', true),
  ('d0000011-0000-0000-0000-000000000005', eid, 'Kits Promocionais', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_kits (sku, empresa_id, categoria_id, nome, descricao, ativo) VALUES
  ('KIT-CIR-BAS', eid, 'd0000011-0000-0000-0000-000000000001', 'Kit Cirúrgico Básico', 'Kit completo para implantes hexagonais com fresas e chaves', true),
  ('KIT-CIR-PRO', eid, 'd0000011-0000-0000-0000-000000000001', 'Kit Cirúrgico Profissional', 'Kit profissional com instrumentais complementares', true),
  ('KIT-PRO-DIG', eid, 'd0000011-0000-0000-0000-000000000002', 'Kit Protético Digital', 'Kit para reabilitação com componentes digitais', true),
  ('KIT-CI-FULL', eid, 'd0000011-0000-0000-0000-000000000003', 'Kit Carga Imediata Full', 'Kit completo para carga imediata com implante + abutment', true),
  ('KIT-IMP-TRA', eid, 'd0000011-0000-0000-0000-000000000004', 'Kit Impressão Transferente', 'Kit com transferentes e parafusos de cobre', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 10. CATÁLOGO: Cupons (6 cupons)
-- =====================================================

INSERT INTO catalogo_cupons (id, empresa_id, codigo, tipo, valor, validade, ativo) VALUES
  ('d0000012-0000-0000-0000-000000000001', eid, 'BEMVINDO10', 'percentual', 10, '2026-12-31', true),
  ('d0000012-0000-0000-0000-000000000002', eid, 'DESCONTO50', 'fixo', 50, '2026-09-30', true),
  ('d0000012-0000-0000-0000-000000000003', eid, 'BLACKFRIDAY', 'percentual', 25, '2026-11-30', true),
  ('d0000012-0000-0000-0000-000000000004', eid, 'FRETEGRATIS', 'fixo', 99, '2026-12-31', true),
  ('d0000012-0000-0000-0000-000000000005', eid, 'IMPLANTE15', 'percentual', 15, '2026-08-31', true),
  ('d0000012-0000-0000-0000-000000000006', eid, 'PARCEIROS20', 'percentual', 20, '2026-12-31', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. CATÁLOGO: Configurações
-- =====================================================

INSERT INTO catalogo_configuracoes (empresa_id, nome_loja, cnpj, email_contato, telefone, exibir_precos, exibir_estoque, checkout_habilitado, cupons_habilitado) VALUES
  (eid, 'Conexão Digital Implant', '12.345.678/0001-90', 'contato@conexaoimplantes.com.br', '(11) 99999-0000', true, true, true, true)
ON CONFLICT (empresa_id) DO NOTHING;

-- =====================================================
-- 12. NPS: Perguntas (6 perguntas)
-- =====================================================

INSERT INTO nps_perguntas (id, empresa_id, key, type, question_text, required, active, order_index) VALUES
  ('d0000013-0000-0000-0000-000000000001', eid, 'nps_recomendacao', 'nps', 'Em escala 0-10, qual probabilidade de recomendar a Conexão Implantes?', true, true, 1),
  ('d0000013-0000-0000-0000-000000000002', eid, 'qualidade_produtos', 'single_choice', 'Como avalia a qualidade dos implantes?', true, true, 2),
  ('d0000013-0000-0000-0000-000000000003', eid, 'melhorias', 'text', 'O que poderíamos melhorar em nossos produtos?', false, true, 3),
  ('d0000013-0000-0000-0000-000000000004', eid, 'atendimento', 'matrix', 'Como avalia o atendimento do consultor técnico?', true, true, 4),
  ('d0000013-0000-0000-0000-000000000005', eid, 'produtos_utilizados', 'multi_choice', 'Quais linhas de produto mais utiliza?', false, true, 5),
  ('d0000013-0000-0000-0000-000000000006', eid, 'entrega', 'single_choice', 'Como avalia o prazo de entrega?', true, true, 6)
ON CONFLICT ON CONSTRAINT nps_perguntas_key_key DO NOTHING;

-- =====================================================
-- 13. FUNIS: 3 funis com cards
-- =====================================================

INSERT INTO funis (id, empresa_id, titulo, descricao, created_by, created_at) VALUES
  ('d0000014-0000-0000-0000-000000000001', eid, 'Vendas', 'Pipeline de vendas de implantes e componentes', '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('d0000014-0000-0000-0000-000000000002', eid, 'Pós-Venda', 'Acompanhamento pós-venda e suporte', '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('d0000014-0000-0000-0000-000000000003', eid, 'Parcerias', 'Pipeline de parcerias estratégicas', '3a8d9652-45c4-4418-af2b-d83357e34b35', now())
ON CONFLICT (id) DO NOTHING;

-- Colunas do funil de Vendas
INSERT INTO funis_colunas (id, funil_id, titulo, posicao) VALUES
  ('d000001b-0000-0000-0000-000000000001', 'd0000014-0000-0000-0000-000000000001', 'Lead', 1),
  ('d000001b-0000-0000-0000-000000000002', 'd0000014-0000-0000-0000-000000000001', 'Proposta', 2),
  ('d000001b-0000-0000-0000-000000000003', 'd0000014-0000-0000-0000-000000000001', 'Negociação', 3),
  ('d000001b-0000-0000-0000-000000000004', 'd0000014-0000-0000-0000-000000000001', 'Ganho', 4)
ON CONFLICT (id) DO NOTHING;

-- Colunas do funil de Pós-Venda
INSERT INTO funis_colunas (id, funil_id, titulo, posicao) VALUES
  ('d000001b-0000-0000-0000-000000000005', 'd0000014-0000-0000-0000-000000000002', 'Pendente', 1),
  ('d000001b-0000-0000-0000-000000000006', 'd0000014-0000-0000-0000-000000000002', 'Em Andamento', 2),
  ('d000001b-0000-0000-0000-000000000007', 'd0000014-0000-0000-0000-000000000002', 'Resolvido', 3)
ON CONFLICT (id) DO NOTHING;

-- Cards do funil de Vendas
INSERT INTO funis_tarefas (id, funil_id, coluna_id, titulo, posicao, created_by, created_at) VALUES
  ('d000001a-0000-0000-0000-000000000001', 'd0000014-0000-0000-0000-000000000001', 'd000001b-0000-0000-0000-000000000001', 'Dr. André - Consulta Implante Hex', 1, '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('d000001a-0000-0000-0000-000000000002', 'd0000014-0000-0000-0000-000000000001', 'd000001b-0000-0000-0000-000000000002', 'Dra. Juliana - Kit Carga Imediata', 1, '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('d000001a-0000-0000-0000-000000000003', 'd0000014-0000-0000-0000-000000000001', 'd000001b-0000-0000-0000-000000000003', 'Dr. Fernando - 50 Implantes Pro', 1, '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('d000001a-0000-0000-0000-000000000004', 'd0000014-0000-0000-0000-000000000001', 'd000001b-0000-0000-0000-000000000001', 'Dra. Tatiane - Acesso Catálogo', 2, '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('d000001a-0000-0000-0000-000000000005', 'd0000014-0000-0000-0000-000000000001', 'd000001b-0000-0000-0000-000000000004', 'Dr. Ricardo - Pedido Finalizado', 1, '3a8d9652-45c4-4418-af2b-d83357e34b35', now())
ON CONFLICT (id) DO NOTHING;

-- Cards do funil de Pós-Venda
INSERT INTO funis_tarefas (id, funil_id, coluna_id, titulo, posicao, created_by, created_at) VALUES
  ('d000001a-0000-0000-0000-000000000006', 'd0000014-0000-0000-0000-000000000002', 'd000001b-0000-0000-0000-000000000006', 'Suporte Técnico - Dúvida Abutment', 1, '3a8d9652-45c4-4418-af2b-d83357e34b35', now()),
  ('d000001a-0000-0000-0000-000000000007', 'd0000014-0000-0000-0000-000000000002', 'd000001b-0000-0000-0000-000000000005', 'Reclamação - Atraso Entrega', 1, '3a8d9652-45c4-4418-af2b-d83357e34b35', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 14. ROTAS: Configuração
-- =====================================================

INSERT INTO rotas_config (id, empresa_id, valor_km_reembolso, raio_permitido_metros) VALUES
  ('d0000015-0000-0000-0000-000000000001', eid, 0.85, 5000)
ON CONFLICT ON CONSTRAINT rotas_config_empresa_id_key DO NOTHING;

-- =====================================================
-- 15. DESPESAS: Tipos (6 tipos)
-- =====================================================

INSERT INTO despesas_tipos (id, empresa_id, nome, ativo) VALUES
  ('d0000016-0000-0000-0000-000000000001', eid, 'Combustível', true),
  ('d0000016-0000-0000-0000-000000000002', eid, 'Alimentação', true),
  ('d0000016-0000-0000-0000-000000000003', eid, 'Estacionamento', true),
  ('d0000016-0000-0000-0000-000000000004', eid, 'Pedágio', true),
  ('d0000016-0000-0000-0000-000000000005', eid, 'Hospedagem', true),
  ('d0000016-0000-0000-0000-000000000006', eid, 'Telefone / Internet', true)
ON CONFLICT ON CONSTRAINT despesas_tipos_empresa_id_nome_key DO NOTHING;

-- =====================================================
-- 16. LINKTREE: Colaboradores (5 pessoas)
-- =====================================================

INSERT INTO linktree_colaboradores (id, empresa_id, nome, cargo, email, whatsapp, status) VALUES
  ('d0000017-0000-0000-0000-000000000001', eid, 'Ricardo Almeida', 'Diretor Comercial', 'ricardo@conexao.com.br', '(11) 99999-1111', 'ativo'),
  ('d0000017-0000-0000-0000-000000000002', eid, 'Fernanda Lima', 'Consultora Técnica', 'fernanda@conexao.com.br', '(11) 99999-2222', 'ativo'),
  ('d0000017-0000-0000-0000-000000000003', eid, 'Bruno Costa', 'Gerente de Vendas', 'bruno@conexao.com.br', '(11) 99999-3333', 'ativo'),
  ('d0000017-0000-0000-0000-000000000004', eid, 'Camila Santos', 'Assistente Comercial', 'camila@conexao.com.br', '(11) 99999-4444', 'ativo'),
  ('d0000017-0000-0000-0000-000000000005', eid, 'Lucas Pereira', 'Suporte Técnico', 'lucas@conexao.com.br', '(11) 99999-5555', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 17. GERADOR DE LINKS (5 links)
-- =====================================================

INSERT INTO gerador_links (id, empresa_id, tipo, titulo, url_gerada) VALUES
  ('d0000018-0000-0000-0000-000000000001', eid, 'whatsapp', 'Convite WhatsApp', 'https://wa.me/5511999990000'),
  ('d0000018-0000-0000-0000-000000000002', eid, 'google_review', 'Avaliação Google', 'https://g.page/r/conexao-implantes/review'),
  ('d0000018-0000-0000-0000-000000000003', eid, 'utm', 'UTM Facebook', 'https://conexaoimplantes.com.br?utm_source=facebook'),
  ('d0000018-0000-0000-0000-000000000004', eid, 'google_maps', 'Google Maps', 'https://maps.google.com/?q=Conexao+Implantes'),
  ('d0000018-0000-0000-0000-000000000005', eid, 'waze', 'Waze', 'https://waze.com/ul?q=Conexao+Implantes')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 18. MARKETING: Leads (6 leads)
-- =====================================================

INSERT INTO mktg_leads (id, empresa_id, nome, email, telefone, fonte, status) VALUES
  ('d0000019-0000-0000-0000-000000000001', eid, 'Dr. André Martins', 'andre@martins.com.br', '(11) 98888-1111', 'site', 'novo'),
  ('d0000019-0000-0000-0000-000000000002', eid, 'Dra. Juliana Rocha', 'juliana@rocha.com.br', '(21) 98888-2222', 'instagram', 'qualificado'),
  ('d0000019-0000-0000-0000-000000000003', eid, 'Dr. Fernando Alves', 'fernando@alves.com.br', '(31) 98888-3333', 'indicacao', 'qualificado'),
  ('d0000019-0000-0000-0000-000000000004', eid, 'Dra. Tatiane Souza', 'tatiane@souza.com.br', '(41) 98888-4444', 'evento', 'novo'),
  ('d0000019-0000-0000-0000-000000000005', eid, 'Dr. Ricardo Nunes', 'ricardo@nunes.com.br', '(51) 98888-5555', 'site', 'convertido'),
  ('d0000019-0000-0000-0000-000000000006', eid, 'Dra. Camila Ferreira', 'camila@ferreira.com.br', '(11) 98888-6666', 'instagram', 'novo')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 19. MARKETING: UTMs (5 UTMs)
-- =====================================================

INSERT INTO mktg_utms (id, empresa_id, nome, url_destino, utm_source, utm_medium, utm_campaign) VALUES
  ('d0000020-0000-0000-0000-000000000001', eid, 'Campanha Facebook Julho', 'https://conexaoimplantes.com.br', 'facebook', 'cpc', 'campanha_julho_2026'),
  ('d0000020-0000-0000-0000-000000000002', eid, 'Google Ads Implantes', 'https://conexaoimplantes.com.br', 'google', 'cpc', 'implantes_q3_2026'),
  ('d0000020-0000-0000-0000-000000000003', eid, 'Instagram Orgânico', 'https://conexaoimplantes.com.br', 'instagram', 'organic', 'conteudo_julho'),
  ('d0000020-0000-0000-0000-000000000004', eid, 'Email Newsletter', 'https://conexaoimplantes.com.br', 'email', 'newsletter', 'julho_2026'),
  ('d0000020-0000-0000-0000-000000000005', eid, 'Indicação Médica', 'https://conexaoimplantes.com.br', 'indicacao', 'referral', 'medicos_parceiros')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 20. MARKETING: Criativos (5 criativos)
-- =====================================================

INSERT INTO mktg_criativos (id, empresa_id, nome, tipo, status) VALUES
  ('d0000021-0000-0000-0000-000000000001', eid, 'Banner Carga Imediata', 'imagem', 'aprovado'),
  ('d0000021-0000-0000-0000-000000000002', eid, 'Vídeo Depoimento Dr. Silva', 'video', 'aprovado'),
  ('d0000021-0000-0000-0000-000000000003', eid, 'Carrossel Produtos', 'carrossel', 'rascunho'),
  ('d0000021-0000-0000-0000-000000000004', eid, 'Stories Lançamento', 'imagem', 'rascunho'),
  ('d0000021-0000-0000-0000-000000000005', eid, 'Vídeo Tutorial Fresagem', 'video', 'aprovado')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 21. MARKETING: Calendário Editorial (6 posts)
-- =====================================================

INSERT INTO mktg_calendario (id, empresa_id, titulo, descricao, data, plataforma, status) VALUES
  ('d0000022-0000-0000-0000-000000000001', eid, 'Post Carga Imediata', 'Conteúdo educativo sobre carga imediata', '2026-07-20', 'instagram', 'agendado'),
  ('d0000022-0000-0000-0000-000000000002', eid, 'Artigo Blog Zigomáticos', 'Artigo técnico sobre implantes zigomáticos', '2026-07-22', 'blog', 'agendado'),
  ('d0000022-0000-0000-0000-000000000003', eid, 'Vídeo Depoimento', 'Depoimento de cliente satisfeito', '2026-07-25', 'youtube', 'rascunho'),
  ('d0000022-0000-0000-0000-000000000004', eid, 'Newsletter Mensal', 'Envio de novidades e promoções', '2026-07-28', 'email', 'rascunho'),
  ('d0000022-0000-0000-0000-000000000005', eid, 'Live Instagram', 'Live com Dr. Ricardo sobre novos produtos', '2026-07-30', 'instagram', 'agendado'),
  ('d0000022-0000-0000-0000-000000000006', eid, 'Post Comparativo', 'Comparativo de linhas de implantes', '2026-08-01', 'linkedin', 'rascunho')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 22. AGENTES IA (3 agentes)
-- =====================================================

INSERT INTO agentes_ia (id, empresa_id, nome, modulo_key, modelo, system_prompt, provedor_url, provedor_api_key, ativo) VALUES
  ('d0000023-0000-0000-0000-000000000001', eid, 'Assistente de Vendas', 'catalogo', 'gpt-4o', 'Você é um consultor técnico de vendas da Conexão Implantes.', 'https://api.openai.com/v1', 'sk-mock-vendas', true),
  ('d0000023-0000-0000-0000-000000000002', eid, 'Suporte Técnico', 'catalogo', 'gpt-4o', 'Você é um suporte técnico especializado em implantes dentários.', 'https://api.openai.com/v1', 'sk-mock-suporte', true),
  ('d0000023-0000-0000-0000-000000000003', eid, 'Chatbot WhatsApp', 'marketing', 'gpt-4o-mini', 'Você é o chatbot da Conexão Implantes no WhatsApp.', 'https://api.openai.com/v1', 'sk-mock-chatbot', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 23. MANUTENÇÃO: Registros (3 registros)
-- =====================================================

INSERT INTO modulos_manutencao (id, empresa_id, modulo_key, rota, ativo, mensagem) VALUES
  ('d0000024-0000-0000-0000-000000000001', eid, 'catalogo', '/catalogo/admin/*', false, 'Sistema em manutenção programada'),
  ('d0000024-0000-0000-0000-000000000002', eid, 'cadastros', '/cadastros/*', false, 'Manutenção preventiva'),
  ('d0000024-0000-0000-0000-000000000003', eid, 'crm', '/crm/*', false, 'Atualização de sistema')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 24. CATÁLOGO: Workflows e Etapas
-- =====================================================

INSERT INTO catalogo_workflows (id, empresa_id, nome, ativo) VALUES
  ('d0000009-0000-0000-0000-000000000001', eid, 'Protocolo Carga Convencional', true),
  ('d0000009-0000-0000-0000-000000000002', eid, 'Protocolo Carga Imediata', true),
  ('d0000009-0000-0000-0000-000000000003', eid, 'Protocolo Overdenture', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_etapas_workflow (id, empresa_id, ordem, nome, ativo) VALUES
  ('d0000010-0000-0000-0000-000000000001', eid, 1, 'Cirurgia', true),
  ('d0000010-0000-0000-0000-000000000002', eid, 2, 'Cicatrização', true),
  ('d0000010-0000-0000-0000-000000000003', eid, 3, 'Moldagem', true),
  ('d0000010-0000-0000-0000-000000000004', eid, 4, 'Prótese', true),
  ('d0000010-0000-0000-0000-000000000005', eid, 5, 'Instalação', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 25. CATÁLOGO: Promoções
-- =====================================================

INSERT INTO catalogo_promocionais (id, empresa_id, nome, descricao, preco, expira_em, ativo) VALUES
  ('d0000025-0000-0000-0000-000000000001', eid, 'Kit Starter Promoção', 'Kit inicial com desconto especial', 899.90, '2026-08-31', true),
  ('d0000025-0000-0000-0000-000000000002', eid, 'Combo Implantes + Abutment', 'Leve implante e ganhe abutment com desconto', 1299.90, '2026-09-30', true),
  ('d0000025-0000-0000-0000-000000000003', eid, 'Black Friday Implantes', 'Desconto especial de Black Friday', 599.90, '2026-11-30', true)
ON CONFLICT (id) DO NOTHING;

END $$;
