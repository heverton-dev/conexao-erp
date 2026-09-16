-- ============================================================
-- Auditoria de FKs faltantes no módulo Catálogo
-- Motivo: várias tabelas de junção (M:N) foram criadas sem
-- nenhuma FK (nem PK), deixando o app com deletes manuais em
-- cascata (ver catalogo.admin.kits.tsx / kits.service.ts) e
-- risco de dados órfãos silenciosos. Todos os casos abaixo
-- foram validados previamente (sem duplicidade em sku, sem
-- linha órfã) antes de adicionar as constraints.
--
-- Fora de escopo (não mexido aqui):
--   - catalogo_implante_kit.implante_sku / catalogo_kit_implantes.implante_sku:
--     têm dado órfão (sku '523685' não existe mais em catalogo_implantes)
--     e/ou usam '*' como sentinela de "todos os diâmetros" — precisa
--     decisão humana antes de constraint (limpar órfão ou redesenhar).
--   - produto_sku (favoritos/orcamento_itens/pedido_itens/imagens_produto):
--     referência polimórfica (aponta pra implantes OU componentes OU kits).
--   - colaborador_id/user_id/cadastro_id: apontam pra outros módulos.
--   - kit_id em complementares/opcionais/chaves/fresas: coluna morta,
--     sem uso no código (types legado).
--   - parafusos_retensao.vinculo_sku: polimórfico (par com vinculo_tipo).
-- ============================================================

-- PKs faltantes (pré-requisito para as FKs abaixo)
ALTER TABLE catalogo_complementares ADD CONSTRAINT catalogo_complementares_pkey PRIMARY KEY (sku);
ALTER TABLE catalogo_opcionais ADD CONSTRAINT catalogo_opcionais_pkey PRIMARY KEY (sku);
ALTER TABLE catalogo_fresas ADD CONSTRAINT catalogo_fresas_pkey PRIMARY KEY (sku);

-- catalogo_kit_complementares (0 linhas hoje)
ALTER TABLE catalogo_kit_complementares
  ADD CONSTRAINT fk_kit_complementares_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  ADD CONSTRAINT fk_kit_complementares_complementar FOREIGN KEY (complementar_id) REFERENCES catalogo_complementares(sku) ON DELETE CASCADE;

-- catalogo_kit_opcionais (0 linhas hoje)
ALTER TABLE catalogo_kit_opcionais
  ADD CONSTRAINT fk_kit_opcionais_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  ADD CONSTRAINT fk_kit_opcionais_opcional FOREIGN KEY (opcional_id) REFERENCES catalogo_opcionais(sku) ON DELETE CASCADE;

-- catalogo_kit_fresas (7 linhas, validado sem órfão)
ALTER TABLE catalogo_kit_fresas
  ADD CONSTRAINT fk_kit_fresas_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  ADD CONSTRAINT fk_kit_fresas_fresa FOREIGN KEY (fresa_id) REFERENCES catalogo_fresas(sku) ON DELETE CASCADE;

-- catalogo_kit_implantes: só o lado kit_sku (implante_sku tem '*' sentinela + órfão, ver nota acima)
ALTER TABLE catalogo_kit_implantes
  ADD CONSTRAINT fk_kit_implantes_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE;

-- catalogo_abutment_parafusos.parafuso_sku (1 linha, validado)
ALTER TABLE catalogo_abutment_parafusos
  ADD CONSTRAINT fk_abutment_parafusos_parafuso FOREIGN KEY (parafuso_sku) REFERENCES catalogo_parafusos(sku) ON DELETE CASCADE;

-- catalogo_abutment_chaves.chave_id (0 linhas hoje)
ALTER TABLE catalogo_abutment_chaves
  ADD CONSTRAINT fk_abutment_chaves_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE CASCADE;

-- catalogo_implante_abutment.implante_sku (1 linha, validado)
ALTER TABLE catalogo_implante_abutment
  ADD CONSTRAINT fk_implante_abutment_implante FOREIGN KEY (implante_sku) REFERENCES catalogo_implantes(sku) ON DELETE CASCADE;

-- catalogo_implante_chaves.implante_sku (1 linha, validado)
ALTER TABLE catalogo_implante_chaves
  ADD CONSTRAINT fk_implante_chaves_implante FOREIGN KEY (implante_sku) REFERENCES catalogo_implantes(sku) ON DELETE CASCADE;

-- catalogo_protocolos_fresas_itens.fresa_id (7 linhas, validado)
ALTER TABLE catalogo_protocolos_fresas_itens
  ADD CONSTRAINT fk_protocolos_fresas_itens_fresa FOREIGN KEY (fresa_id) REFERENCES catalogo_fresas(sku) ON DELETE CASCADE;

-- catalogo_protocolo_fresagem (0 linhas hoje)
ALTER TABLE catalogo_protocolo_fresagem
  ADD CONSTRAINT fk_protocolo_fresagem_fresa FOREIGN KEY (fresa_sku) REFERENCES catalogo_fresas(sku) ON DELETE CASCADE,
  ADD CONSTRAINT fk_protocolo_fresagem_implante FOREIGN KEY (implante_sku) REFERENCES catalogo_implantes(sku) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
