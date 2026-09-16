-- ============================================================
-- Migration: FK + índice em colaborador_id (catalogo_pedidos/orcamentos)
-- Data: 2026-08-03
-- Descrição: achado B4 de docs/agents/varredura-2026-08-03.md. Hoje um
--   profiles deletado deixa pedido/orçamento "órfão" sem erro do banco, e a
--   coluna não tem índice (usada para filtrar pedidos/orçamentos por
--   colaborador no dashboard). Verificado antes de escrever: 0 linhas órfãs
--   em catalogo_pedidos.colaborador_id e catalogo_orcamentos.colaborador_id
--   contra profiles.id (consulta read-only em 2026-08-03) — seguro adicionar
--   a FK como VALID direto, sem NOT VALID.
--
--   Escopo reduzido em relação ao plano original: nps_respostas.client_id e
--   nps_respostas.order_id são `text`, não `uuid` — são identificadores
--   externos do sistema que envia a pesquisa NPS via webhook (ex.: "CLI-001",
--   "ORD-001" em src/features/nps/services/webhooks.ts), não chaves internas.
--   Não recebem FK nem índice: não há FK possível (não referenciam PK
--   interna) e o código não filtra por eles (sem .eq("client_id"/"order_id")
--   em src/features/nps). Não repetir a recomendação de FK para essas duas
--   colunas em análises futuras.
-- ============================================================

BEGIN;

ALTER TABLE catalogo_pedidos DROP CONSTRAINT IF EXISTS catalogo_pedidos_colaborador_id_fkey;
ALTER TABLE catalogo_pedidos
  ADD CONSTRAINT catalogo_pedidos_colaborador_id_fkey
  FOREIGN KEY (colaborador_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE catalogo_orcamentos DROP CONSTRAINT IF EXISTS catalogo_orcamentos_colaborador_id_fkey;
ALTER TABLE catalogo_orcamentos
  ADD CONSTRAINT catalogo_orcamentos_colaborador_id_fkey
  FOREIGN KEY (colaborador_id) REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_catalogo_pedidos_colaborador_id ON catalogo_pedidos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_orcamentos_colaborador_id ON catalogo_orcamentos(colaborador_id);

COMMIT;
