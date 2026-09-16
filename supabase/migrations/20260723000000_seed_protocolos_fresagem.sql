-- ============================================================
-- 20260723000000_seed_protocolos_fresagem.sql
-- Seed: Protocolos de fresagem padrão + tipos de osso
-- ============================================================

-- 1. Re-seed tipos de osso (empresa_id foi removido, tabela global)
INSERT INTO catalogo_tipos_ossos (nome, sigla, ativo)
SELECT t.nome, t.sigla, true
FROM (VALUES
  ('D1 - Muito Densa', 'D1'),
  ('D2 - Densa', 'D2'),
  ('D3 - Média', 'D3'),
  ('D4 - Baixa Densidade', 'D4'),
  ('D5 - Muito Baixa Densidade', 'D5')
) AS t(nome, sigla)
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_tipos_ossos existing WHERE existing.nome = t.nome
);

-- 2. Seed protocolos de fresagem padrão
-- Os códigos curtos (D1, D2, etc.) são usados pelo ImplanteForm para filtrar
INSERT INTO catalogo_protocolos_fresagens (nome, tipo_osso, sigla, ativo)
SELECT v.nome, v.tipo_osso, v.sigla, true
FROM (VALUES
  ('Protocolo Osso D1', 'D1', 'D1'),
  ('Protocolo Osso D2', 'D2', 'D2'),
  ('Protocolo Osso D3', 'D3', 'D3'),
  ('Protocolo Osso D4', 'D4', 'D4'),
  ('Protocolo Osso D5', 'D5', 'D5')
) AS v(nome, tipo_osso, sigla)
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_protocolos_fresagens existing WHERE existing.tipo_osso = v.tipo_osso
);
