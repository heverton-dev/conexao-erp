-- =====================================================
-- SEED: Dados Mockados para Conexão Implantes
-- Empresa ID: 1a00d0fe-0d10-48b2-aff7-68e941967f0f
-- =====================================================

-- =====================================================
-- 1. CORE: EMPRESA
-- =====================================================

-- A empresa já deve existir. Se não existir:
INSERT INTO empresas (id, nome, slug, created_at) VALUES
  ('1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Conexão Implantes', 'conexao-implantes', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CATÁLOGO: Estrutura (Categorias, Conexões, Famílias, Linhas)
-- =====================================================

-- Categorias
INSERT INTO catalogo_categorias (id, empresa_id, nome, locked, ativo) VALUES
  ('c0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Implantes Dentários', true, true),
  ('c0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Mini Implantes', true, true),
  ('c0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Implantes Zigomáticos', true, true),
  ('c0000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Implantes de Carga Imediata', true, true),
  ('c0000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Sistema Overdenture', true, true)
ON CONFLICT (id) DO NOTHING;

-- Conexões
INSERT INTO catalogo_conexoes (id, empresa_id, categoria_id, nome, sigla, locked, ativo) VALUES
  ('cn000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Conexão Hexagonal', 'HEX', true, true),
  ('cn000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Conexão Morse Taper', 'MT', true, true),
  ('cn000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Conexão Interna', 'INT', true, true),
  ('cn000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000002', 'Mini Hexagonal', 'MHEX', true, true),
  ('cn000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000003', 'Zig Conexão', 'ZIG', true, true)
ON CONFLICT (id) DO NOTHING;

-- Famílias
INSERT INTO catalogo_familias (id, empresa_id, conexao_id, nome, cor_identificacao, ativo) VALUES
  ('fa000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cn000001-0000-0000-0000-000000000001', 'Conexão Active', '#3B82F6', true),
  ('fa000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cn000001-0000-0000-0000-000000000001', 'Conexão One', '#10B981', true),
  ('fa000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cn000001-0000-0000-0000-000000000002', 'Conexção Pro', '#F59E0B', true),
  ('fa000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cn000001-0000-0000-0000-000000000003', 'Conexão Internal Plus', '#8B5CF6', true),
  ('fa000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cn000001-0000-0000-0000-000000000005', 'Zigoma System', '#EF4444', true)
ON CONFLICT (id) DO NOTHING;

-- Linhas
INSERT INTO catalogo_linhas (id, empresa_id, familia_id, nome, ativo) VALUES
  ('li000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000001', 'Active Regular', true),
  ('li000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000001', 'Active Short', true),
  ('li000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000002', 'One Standard', true),
  ('li000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000003', 'Pro Taper', true),
  ('li000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000005', 'Zig Short', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CATÁLOGO: Implantes
-- =====================================================

INSERT INTO catalogo_implantes (sku, empresa_id, linha_id, diametro_mm, comprimento_mm, rosca_interna, regiao_apical, regiao_cervical, torque_insercao, detalhes_extras, preco, ativo) VALUES
  ('IMP-HEX-375', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'li000001-0000-0000-0000-000000000001', 3.75, 11.5, 'Hex Externo', 'Cônica', 'Liso', 35, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"cn000001-0000-0000-0000-000000000001","familia_id":"fa000001-0000-0000-0000-000000000001"}', 289.90, true),
  ('IMP-HEX-425', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'li000001-0000-0000-0000-000000000001', 4.25, 11.5, 'Hex Externo', 'Cônica', 'Liso', 40, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"cn000001-0000-0000-0000-000000000001","familia_id":"fa000001-0000-0000-0000-000000000001"}', 319.90, true),
  ('IMP-HEX-475', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'li000001-0000-0000-0000-000000000001', 4.75, 11.5, 'Hex Externo', 'Cônica', 'Liso', 45, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"cn000001-0000-0000-0000-000000000001","familia_id":"fa000001-0000-0000-0000-000000000001"}', 349.90, true),
  ('IMP-MT-350', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'li000001-0000-0000-0000-000000000004', 3.50, 10.0, 'Morse Taper', 'Cônica', 'Fibras', 30, '{"categoria_id":"c0000001-0000-0000-0000-000000000001","conexao_id":"cn000001-0000-0000-0000-000000000002","familia_id":"fa000001-0000-0000-0000-000000000003"}', 359.90, true),
  ('IMP-INT-400', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'li000001-0000-0000-0000-000000000005', 4.00, 11.5, 'Conexão Interna', 'Cônica', 'Liso', 35, '{"categoria_id":"c0000001-0000-0000-0000-000000000003","conexao_id":"cn000001-0000-0000-0000-000000000005","familia_id":"fa000001-0000-0000-0000-000000000005"}', 429.90, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 4. CATÁLOGO: Fresas
-- =====================================================

INSERT INTO catalogo_fresas (sku, empresa_id, nome, diametro_mm, venda_avulsa, ativo) VALUES
  ('FRE-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Piloto 2.0mm', 2.0, true, true),
  ('FRE-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Twist 2.0mm', 2.0, true, true),
  ('FRE-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Twist 2.8mm', 2.8, true, true),
  ('FRE-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Lanza 3.5mm', 3.5, false, true),
  ('FRE-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresa Countersink 4.3mm', 4.3, false, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 5. CATÁLOGO: Tipos de Reabilitação e Abutment
-- =====================================================

INSERT INTO catalogo_tipos_reabilitacao (id, empresa_id, nome, ativo) VALUES
  ('tr000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Coroa-unitária', true),
  ('tr000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Ponte-unitária', true),
  ('tr000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Overdenture', true),
  ('tr000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'All-on-4', true),
  ('tr000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'All-on-6', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_tipos_abutment (id, empresa_id, nome, sigla, ativo) VALUES
  ('ta000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Cilíndrico', 'ACIL', true),
  ('ta000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Angulado', 'AANG', true),
  ('ta000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment de Carga Imediata', 'ACI', true),
  ('ta000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Ball', 'ABAL', true),
  ('ta000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Abutment Locator', 'ALOC', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. CATÁLOGO: Abutments
-- =====================================================

INSERT INTO catalogo_abutments (sku, empresa_id, familia_id, tipo_reabilitacao_id, tipo_abutment_id, diametro_plataforma, angulacao_graus, altura_transmucoso, altura_corpo, torque_ncm, preco, ativo) VALUES
  ('ABU-35-CIL', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000001', 'tr000001-0000-0000-0000-000000000001', 'ta000001-0000-0000-0000-000000000001', '3.5', 0, 2.0, 8.0, 25, 189.90, true),
  ('ABU-35-ANG', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000001', 'tr000001-0000-0000-0000-000000000002', 'ta000001-0000-0000-0000-000000000002', '3.5', 15, 2.0, 10.0, 25, 249.90, true),
  ('ABU-43-CIL', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000002', 'tr000001-0000-0000-0000-000000000001', 'ta000001-0000-0000-0000-000000000001', '4.3', 0, 2.0, 8.0, 30, 199.90, true),
  ('ABU-43-CI', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000002', 'tr000001-0000-0000-0000-000000000004', 'ta000001-0000-0000-0000-000000000003', '4.3', 0, 3.0, 12.0, 30, 279.90, true),
  ('ABU-50-BAL', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'fa000001-0000-0000-0000-000000000003', 'tr000001-0000-0000-0000-000000000003', 'ta000001-0000-0000-0000-000000000004', '5.0', 0, 2.0, 6.0, 35, 159.90, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 7. CATÁLOGO: Tipos de Componente e Componentes (Acessórios)
-- =====================================================

INSERT INTO catalogo_categorias_acessorio (id, empresa_id, nome, ativo) VALUES
  ('ca000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Transferentes', true),
  ('ca000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafusos de Cobre', true),
  ('ca000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafusos de Retenção', true),
  ('ca000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Corpos de Cicatrização', true),
  ('ca000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Molas de Cobre', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_acessorios (sku, empresa_id, categoria_id, nome, diametro_mm, altura_mm, caracteristicas, ativo, preco) VALUES
  ('ACC-TR-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ca000001-0000-0000-0000-000000000001', 'Transferente de Moldeira Aberta 3.5mm', 3.5, 12.0, '{"tipo":"aberta"}', true, 45.90),
  ('ACC-TR-43', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ca000001-0000-0000-0000-000000000001', 'Transferente de Moldeira Fechada 4.3mm', 4.3, 14.0, '{"tipo":"fechada"}', true, 49.90),
  ('ACC-PC-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ca000001-0000-0000-0000-000000000002', 'Parafuso de Cobre 3.5mm', 3.5, 8.0, '{"material":"cobre"}', true, 25.90),
  ('ACC-PR-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ca000001-0000-0000-0000-000000000003', 'Parafuso de Retenção Abutment 3.5mm', 3.5, 6.0, '{"uso":"abutment"}', true, 35.90),
  ('ACC-MC-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ca000001-0000-0000-0000-000000000005', 'Mola de Cobre 3.5mm', 3.5, 4.0, '{"tipo":"mola"}', true, 15.90)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 8. CATÁLOGO: Chaves e Ferramental
-- =====================================================

INSERT INTO catalogo_chaves_ferramental (sku, empresa_id, nome, tipo_ferramenta, ativo, preco) VALUES
  ('CHV-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Aperto Hex 1.25mm', 'Aperto', true, 89.90),
  ('CHV-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Aperto Torque 35Ncm', 'Aperto', true, 149.90),
  ('CHV-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Medição de Profundidade', 'Medição', true, 79.90),
  ('CHV-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave Cirúrgica de Sítio', 'Cirúrgica', true, 199.90),
  ('CHV-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chave de Condicionamento Ósseo', 'Cirúrgica', true, 229.90)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 9. CATÁLOGO: Categorias de Instrumental e Instrumentais
-- =====================================================

INSERT INTO catalogo_categorias_instrumental (id, empresa_id, nome, ativo) VALUES
  ('ci000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chaves Protéticas', true),
  ('ci000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chaves Cirúrgicas', true),
  ('ci000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fresas', true),
  ('ci000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Instrumentos Opcionais', true),
  ('ci000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Instrumentos Complementares', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_instrumentais_gerais (sku, empresa_id, categoria_id, nome, ativo) VALUES
  ('INS-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ci000001-0000-0000-0000-000000000001', 'Torquímetro Digital Protético', true),
  ('INS-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ci000001-0000-0000-0000-000000000002', 'Sugador Cirúrgico Estéril', true),
  ('INS-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ci000001-0000-0000-0000-000000000003', 'Fresa de Condicionamento 2.0mm', true),
  ('INS-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ci000001-0000-0000-0000-000000000004', 'Kit de Impressão Digital', true),
  ('INS-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ci000001-0000-0000-0000-000000000005', 'Moldeira de Carga Imediata', true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 10. CATÁLOGO: Parafusos de Retenção e Cicatrizadores
-- =====================================================

INSERT INTO catalogo_parafusos_retensao (sku, empresa_id, nome, torque_ncm, vinculo_tipo, vinculo_sku, chave_sku, preco, ativo) VALUES
  ('PR-ABU-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafuso Retenção Abutment 3.5mm', 15, 'abutment', 'ABU-35-CIL', 'CHV-001', 35.90, true),
  ('PR-ABU-43', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafuso Retenção Abutment 4.3mm', 20, 'abutment', 'ABU-43-CIL', 'CHV-001', 39.90, true),
  ('PR-CMP-35', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafuso Retenção Componente 3.5mm', 15, 'componente', 'ACC-TR-35', 'CHV-001', 29.90, true),
  ('PR-ABU-50', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafuso Retenção Abutment 5.0mm', 25, 'abutment', 'ABU-50-BAL', 'CHV-002', 45.90, true),
  ('PR-CMP-43', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parafuso Retenção Componente 4.3mm', 20, 'componente', 'ACC-TR-43', 'CHV-001', 32.90, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

INSERT INTO catalogo_cicatrizadores (sku, empresa_id, nome, altura_transmucoso, diametro_plataforma, torque_ncm, familia_id, chave_sku, preco, ativo) VALUES
  ('CIC-35-20', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Cicatrizador 3.5mm H2.0', 2.0, '3.5', 15, 'fa000001-0000-0000-0000-000000000001', 'CHV-002', 89.90, true),
  ('CIC-35-30', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Cicatrizador 3.5mm H3.0', 3.0, '3.5', 15, 'fa000001-0000-0000-0000-000000000001', 'CHV-002', 92.90, true),
  ('CIC-43-20', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Cicatrizador 4.3mm H2.0', 2.0, '4.3', 20, 'fa000001-0000-0000-0000-000000000002', 'CHV-002', 95.90, true),
  ('CIC-43-40', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Cicatrizador 4.3mm H4.0', 4.0, '4.3', 20, 'fa000001-0000-0000-0000-000000000002', 'CHV-002', 99.90, true),
  ('CIC-50-30', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Cicatrizador 5.0mm H3.0', 3.0, '5.0', 25, 'fa000001-0000-0000-0000-000000000003', 'CHV-002', 105.90, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 11. CATÁLOGO: Kits e Categorias de Kit
-- =====================================================

INSERT INTO catalogo_categorias_kit (id, empresa_id, nome, ativo) VALUES
  ('ck000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits Cirúrgicos', true),
  ('ck000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits Protéticos', true),
  ('ck000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits de Carga Imediata', true),
  ('ck000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits de Impressão', true),
  ('ck000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits Promocionais', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_kits (sku, empresa_id, categoria_id, nome, descricao, preco, ativo) VALUES
  ('KIT-001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ck000001-0000-0000-0000-000000000001', 'Kit Cirúrgico Básico', 'Kit completo para instalação de implantes hexagonais', 1299.90, true),
  ('KIT-002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ck000001-0000-0000-0000-000000000002', 'Kit Protético Digital', 'Kit para reabilitação protética com componentes digitais', 899.90, true),
  ('KIT-003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ck000001-0000-0000-0000-000000000003', 'Kit Carga Imediata Full', 'Kit completo para carga imediata com componentes', 1599.90, true),
  ('KIT-004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ck000001-0000-0000-0000-000000000004', 'Kit de Impressão Transferente', 'Kit com transferentes e parafusos de cobre', 349.90, true),
  ('KIT-005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ck000001-0000-0000-0000-000000000005', 'Kit Starter', 'Kit inicial com implante + componentes essenciais', 699.90, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- =====================================================
-- 12. CATÁLOGO: Workflows e Etapas
-- =====================================================

INSERT INTO catalogo_workflows (id, empresa_id, nome, ativo) VALUES
  ('wf000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo de Carga Convencional', true),
  ('wf000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo de Carga Imediata', true),
  ('wf000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo Overdenture', true),
  ('wf000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo All-on-4', true),
  ('wf000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo de Revisão', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO catalogo_etapas_workflow (id, empresa_id, workflow_id, ordem, nome, ativo) VALUES
  ('ew000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'wf000001-0000-0000-0000-000000000001', 1, 'Cirurgia', true),
  ('ew000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'wf000001-0000-0000-0000-000000000001', 2, 'Cicatrização', true),
  ('ew000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'wf000001-0000-0000-0000-000000000001', 3, 'Moldagem', true),
  ('ew000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'wf000001-0000-0000-0000-000000000001', 4, 'Prótese', true),
  ('ew000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'wf000001-0000-0000-0000-000000000001', 5, 'Instalação', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 13. CATÁLOGO: Cupons
-- =====================================================

INSERT INTO catalogo_cupons (id, empresa_id, codigo, tipo, valor, validade, ativo) VALUES
  ('cu000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'BEMVINDO10', 'percentual', 10, '2026-12-31', true),
  ('cu000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'DESCONTO50', 'fixo', 50, '2026-09-30', true),
  ('cu000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'BLACKFRIDAY', 'percentual', 25, '2026-11-30', true),
  ('cu000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'FRETEGRATIS', 'fixo', 99, '2026-12-31', true),
  ('cu000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'IMPLANTE15', 'percentual', 15, '2026-08-31', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 14. CATÁLOGO: Grupos de Clientes e Preços
-- =====================================================

INSERT INTO catalogo_grupos_clientes (id, empresa_id, nome, descricao, ativo) VALUES
  ('gc000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Distribuidor Oficial', 'Parceiros autorizados com preços especiais', true),
  ('gc000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Clínica Privada', 'Clínicas particulares', true),
  ('gc000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Hospital Público', 'Hospitais e UBS', true),
  ('gc000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Universidade', 'Cursos de graduação e pós', true),
  ('gc000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Varejo', 'Compra avulsa sem vínculo', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 15. CATÁLOGO: Configurações
-- =====================================================

INSERT INTO catalogo_configuracoes (id, empresa_id, nome_loja, cnpj, email_contato, telefone, exibir_precos, exibir_estoque, checkout_habilitado, cupons_habilitado) VALUES
  ('cfg00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Conexão Implantes', '12.345.678/0001-90', 'contato@conexaoimplantes.com.br', '(11) 99999-0000', true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 16. CADASTROS: Clientes
-- =====================================================

INSERT INTO clientes (id, empresa_id, nome_doutor, nome_clinica, telefone, email, status, created_at) VALUES
  ('cli00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. João Silva', 'Clínica Silva Odontologia', '(11) 98765-4321', 'joao@silva.com.br', 'ativo', now()),
  ('cli00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dra. Maria Santos', 'Centro Odontológico Santos', '(21) 99876-5432', 'maria@santos.com.br', 'ativo', now()),
  ('cli00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. Pedro Oliveira', 'Instituto Oliveira', '(31) 98765-1234', 'pedro@oliveira.com.br', 'ativo', now()),
  ('cli00001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dra. Ana Costa', 'Costa Dental', '(41) 99123-4567', 'ana@costa.com.br', 'ativo', now()),
  ('cli00001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. Carlos Mendes', 'Clínica Mendes', '(51) 98456-7890', 'carlos@mendes.com.br', 'ativo', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 17. CADASTROS: Pipeline
-- =====================================================

INSERT INTO cadastros (id, empresa_id, cliente_id, status, created_at) VALUES
  ('cad00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000001', 'aprovado', now()),
  ('cad00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000002', 'aprovado', now()),
  ('cad00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000003', 'em_analise', now()),
  ('cad00001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000004', 'dados_enviados', now()),
  ('cad00001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000005', 'link_gerado', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 18. CRM: Visitas
-- =====================================================

INSERT INTO visitas (id, empresa_id, cliente_id, data_visita, observacoes, created_at) VALUES
  ('vis00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000001', '2026-07-01', 'Apresentação do catálogo completo', now()),
  ('vis00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000002', '2026-07-05', 'Demonstração de carga imediata', now()),
  ('vis00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000003', '2026-07-10', 'Reunião sobre preços e condições', now()),
  ('vis00001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000004', '2026-07-12', 'Visita técnica para treinamento', now()),
  ('vis00001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cli00001-0000-0000-0000-000000000005', '2026-07-15', 'Follow-up pós-venda', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 19. NPS: Perguntas
-- =====================================================

INSERT INTO nps_perguntas (id, empresa_id, titulo, tipo, ativo) VALUES
  ('np000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Em uma escala de 0 a 10, qual a probabilidade de você recomendar a Conexão Implantes?', 'nps', true),
  ('np000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Como você avalia a qualidade dos implantes?', 'single_choice', true),
  ('np000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'O que poderíamos melhorar?', 'text', true),
  ('np000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Como avalia o atendimento do consultor?', 'matrix', true),
  ('np000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Quais produtos mais utiliza?', 'multi_choice', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 20. HUB: Materiais de Treinamento
-- =====================================================

INSERT INTO hub_materiais (id, empresa_id, titulo, descricao, categoria, nivel, duracao_minutos, ativo) VALUES
  ('hm000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Introdução aos Implantes Conexão', 'Curso básico sobre o sistema de implantes', 'Curso', 'Iniciante', 60, true),
  ('hm000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Protocolo de Carga Imediata', 'Técnica avançada de carga imediata', 'Curso', 'Avançado', 120, true),
  ('hm000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Manuseio de Componentes Protéticos', 'Tutorial prático de componentes', 'Tutorial', 'Intermediário', 45, true),
  ('hm000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'All-on-4 Passo a Passo', 'Guia completo do protocolo All-on-4', 'Curso', 'Avançado', 180, true),
  ('hm000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Cuidados na Cirurgia', 'Dicas importantes para o dia da cirurgia', 'Artigo', 'Iniciante', 15, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 21. HUB: Níveis de Gamificação
-- =====================================================

INSERT INTO hub_niveis_gamificacao (id, empresa_id, nome, pontos_minimos, cor, ativo) VALUES
  ('ng000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Iniciante', 0, '#94A3B8', true),
  ('ng000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Bronze', 100, '#CD7F32', true),
  ('ng000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Prata', 300, '#C0C0C0', true),
  ('ng000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Ouro', 600, '#FFD700', true),
  ('ng000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Master', 1000, '#8B5CF6', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 22. HUB: Emblemas
-- =====================================================

INSERT INTO hub_emblemas (id, empresa_id, nome, descricao, icone, pontos, ativo) VALUES
  ('he000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Primeiro Curso', 'Completou o primeiro curso', '🎓', 50, true),
  ('he000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Estudante Dedicado', 'Completou 5 cursos', '📚', 100, true),
  ('he000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Especialista', 'Completou 10 cursos', '🏆', 200, true),
  ('he000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Mestre', 'Completou 20 cursos', '👑', 500, true),
  ('he000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Lenda', 'Completou todos os cursos', '🌟', 1000, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 23. FUNIS: Funis Kanban
-- =====================================================

INSERT INTO funis (id, empresa_id, nome, descricao, cor, ativo) VALUES
  ('fu000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Vendas', 'Pipeline de vendas de implantes', '#3B82F6', true),
  ('fu000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Pós-Venda', 'Acompanhamento pós-venda', '#10B981', true),
  ('fu000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Treinamento', 'Pipeline de treinamento de clientes', '#F59E0B', true),
  ('fu000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Reclamações', 'Gestão de reclamações e suporte', '#EF4444', true),
  ('fu000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Parcerias', 'Pipeline de novas parcerias', '#8B5CF6', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 24. ROTAS: Configuração
-- =====================================================

INSERT INTO rotas_config (id, empresa_id, km_reembolso, raio_visita_km, ativo) VALUES
  ('rc000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 0.85, 5.0, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 25. DESPESAS: Tipos de Despesa
-- =====================================================

INSERT INTO despesas_tipos (id, empresa_id, nome, descricao, ativo) VALUES
  ('dt000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Combustível', 'Abastecimento do veículo', true),
  ('dt000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Alimentação', 'Refeições durante deslocamento', true),
  ('dt000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Estacionamento', 'Taxas de estacionamento', true),
  ('dt000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Pedágio', 'Pedágios de rodovias', true),
  ('dt000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Hospedagem', 'Diárias em viagens', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 26. LINKTREE: Colaboradores
-- =====================================================

INSERT INTO linktree_colaboradores (id, empresa_id, nome, cargo, departamento, telefone, email, ativo) VALUES
  ('lt000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Ricardo Almeida', 'Diretor Comercial', 'Comercial', '(11) 99999-1111', 'ricardo@conexao.com.br', true),
  ('lt000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Fernanda Lima', 'Consultora Técnica', 'Técnico', '(11) 99999-2222', 'fernanda@conexao.com.br', true),
  ('lt000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Bruno Costa', 'Gerente de Vendas', 'Comercial', '(11) 99999-3333', 'bruno@conexao.com.br', true),
  ('lt000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Camila Santos', 'Assistente Comercial', 'Comercial', '(11) 99999-4444', 'camila@conexao.com.br', true),
  ('lt000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Lucas Pereira', 'Suporte Técnico', 'Técnico', '(11) 99999-5555', 'lucas@conexao.com.br', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 27. GERADOR DE LINKS: Templates
-- =====================================================

INSERT INTO gerador_modelos (id, empresa_id, nome, tipo, template, ativo) VALUES
  ('gl000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Convite WhatsApp', 'whatsapp', 'Olá {nome}, tudo bem? Sou da Conexão Implantes. Gostaria de apresentar nossos produtos.', true),
  ('gl000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Link Google Review', 'google_review', 'Deixe sua avaliação sobre a Conexão Implantes', true),
  ('gl000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Link UTM Facebook', 'utm', 'Campanha de remarketing Facebook', true),
  ('gl000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Google Maps', 'google_maps', 'Localização da sede Conexão Implantes', true),
  ('gl000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Waze', 'waze', 'Rota até a Conexão Implantes', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 28. MARKETING: Leads
-- =====================================================

INSERT INTO mktg_leads (id, empresa_id, nome, email, telefone, fonte, status, created_at) VALUES
  ('mkl00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. André Martins', 'andre@martins.com.br', '(11) 98888-1111', 'site', 'novo', now()),
  ('mkl00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dra. Juliana Rocha', 'juliana@rocha.com.br', '(21) 98888-2222', 'instagram', 'contatado', now()),
  ('mkl00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. Fernando Alves', 'fernando@alves.com.br', '(31) 98888-3333', 'indicacao', 'qualificado', now()),
  ('mkl00001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dra. Tatiane Souza', 'tatiane@souza.com.br', '(41) 98888-4444', 'evento', 'novo', now()),
  ('mkl00001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. Ricardo Nunes', 'ricardo@nunes.com.br', '(51) 98888-5555', 'site', 'convertido', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 29. MARKETING: UTMs
-- =====================================================

INSERT INTO mktg_utms (id, empresa_id, nome, url, utm_source, utm_medium, utm_campaign, ativo) VALUES
  ('utm00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Campanha Facebook Julho', 'https://conexaoimplantes.com.br', 'facebook', 'cpc', 'campanha_julho_2026', true),
  ('utm00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Google Ads Implantes', 'https://conexaoimplantes.com.br', 'google', 'cpc', 'implantes_q3_2026', true),
  ('utm00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Instagram Orgânico', 'https://conexaoimplantes.com.br', 'instagram', 'organic', 'conteudo_julho', true),
  ('utm00001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Email Newsletter', 'https://conexaoimplantes.com.br', 'email', 'newsletter', 'julho_2026', true),
  ('utm00001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Indicação Médica', 'https://conexaoimplantes.com.br', 'indicacao', 'referral', 'medicos_parceiros', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 30. MARKETING: Criativos
-- =====================================================

INSERT INTO mktg_criativos (id, empresa_id, titulo, tipo, formato, status, created_at) VALUES
  ('mkc00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Banner Carga Imediata', 'image', 'feed', 'publicado', now()),
  ('mkc00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Vídeo Depoimento Dr. Silva', 'video', 'reels', 'publicado', now()),
  ('mkc00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Carrossel Produtos', 'carousel', 'feed', 'rascunho', now()),
  ('mkc00001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Stories Lançamento', 'image', 'stories', 'agendado', now()),
  ('mkc00001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Vídeo Tutorial Fresagem', 'video', 'youtube', 'publicado', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 31. MARKETING: Calendário Editorial
-- =====================================================

INSERT INTO mktg_calendario (id, empresa_id, titulo, descricao, data_publicacao, plataforma, status, created_at) VALUES
  ('mkt00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Post sobre Carga Imediata', 'Conteúdo educativo sobre carga imediata', '2026-07-20', 'instagram', 'agendado', now()),
  ('mkt00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Artigo Blog: Implantes Zigomáticos', 'Artigo técnico sobre implantes zigomáticos', '2026-07-22', 'blog', 'agendado', now()),
  ('mkt00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Vídeo Depoimento', 'Vídeo de depoimento de cliente satisfeito', '2026-07-25', 'youtube', 'rascunho', now()),
  ('mkt00001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Newsletter Mensal', 'Envio mensal de novidades', '2026-07-28', 'email', 'rascunho', now()),
  ('mkt00001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Live Instagram', 'Live com Dr. Ricardo sobre All-on-4', '2026-07-30', 'instagram', 'agendado', now())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 32. AGENTES IA: Agentes
-- =====================================================

INSERT INTO agentes_ia (id, empresa_id, nome, descricao, modulo_key, modelo, system_prompt, ativo) VALUES
  ('ai000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Assistente de Vendas', 'Agente para suporte a vendas', 'catalogo', 'gpt-4o', 'Você é um assistente de vendas da Conexão Implantes.', true),
  ('ai000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Suporte Técnico', 'Agente de suporte técnico', 'catalogo', 'gpt-4o', 'Você é um suporte técnico da Conexão Implantes.', true),
  ('ai000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Assistente de Cadastro', 'Agente para auxiliar cadastros', 'cadastros', 'gpt-4o-mini', 'Você auxilia no preenchimento de cadastros.', true),
  ('ai000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Chatbot WhatsApp', 'Atendimento via WhatsApp', 'marketing', 'gpt-4o', 'Você é o chatbot da Conexão Implantes no WhatsApp.', true),
  ('ai000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Analista de Dados', 'Análise de dados de vendas', 'relatorios', 'gpt-4o', 'Você analisa dados de vendas e gera relatórios.', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 33. MANUTENÇÃO: Registros
-- =====================================================

INSERT INTO modulos_manutencao (id, empresa_id, modulo_key, rota, ativo, mensagem) VALUES
  ('mn000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'catalogo', '/catalogo/admin/*', false, 'Sistema em manutenção programada'),
  ('mn000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'cadastros', '/cadastros/*', false, 'Manutenção preventiva'),
  ('mn000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'crm', '/crm/*', false, 'Atualização de sistema'),
  ('mn000001-0000-0000-0000-000000000004', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'hub', '/hub/*', false, 'Backup de dados'),
  ('mn000001-0000-0000-0000-000000000005', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'marketing', '/marketing/*', false, 'Migração de dados')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- FIM DO SEED
-- =====================================================
