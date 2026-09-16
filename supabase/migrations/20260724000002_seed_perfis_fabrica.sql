-- ============================================================
-- 20260724010000_seed_perfis_fabrica.sql
-- Migração de dados: perfis "de fábrica" (1 por valor de
-- `profiles.ambiente`) + permissões desses perfis extraídas
-- dinamicamente de public.get_permissoes_padrao() (00010_permissoes.sql)
-- + atribuição de cada profile existente ao perfil de fábrica
-- correspondente ao seu ambiente atual.
--
-- Estritamente aditivo: NÃO apaga/altera `permissoes.permissoes`
-- nem `permissoes.modulos_acesso` de ninguém. Idempotente
-- (re-executável sem duplicar/perder dados).
-- ============================================================

DO $$
DECLARE
  amb text;
  perfil_uuid uuid;
  padrao jsonb;
  k text;
  v text;
BEGIN
  FOREACH amb IN ARRAY ARRAY['cadastro', 'consultor', 'tecnologia', 'ambos', 'suporte']
  LOOP
    -- 1. Cria (ou marca como sistema) o perfil de fábrica
    INSERT INTO perfis (nome, descricao, is_sistema)
    VALUES (
      amb,
      'Perfil de fábrica gerado a partir do ambiente "' || amb || '" (migração 20260724010000)',
      true
    )
    ON CONFLICT (nome) DO UPDATE SET is_sistema = true
    RETURNING id INTO perfil_uuid;

    -- 2. Extrai dinamicamente as chaves com valor true de get_permissoes_padrao()
    padrao := public.get_permissoes_padrao(amb);

    FOR k, v IN SELECT * FROM jsonb_each_text(padrao)
    LOOP
      IF v = 'true' THEN
        INSERT INTO perfis_permissoes (perfil_id, permissao_key)
        VALUES (perfil_uuid, k)
        ON CONFLICT (perfil_id, permissao_key) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 3. Atribui cada profile existente ao perfil de fábrica do seu ambiente.
--    Ambiente nulo ou fora da lista conhecida cai no perfil "ambos"
--    (mesmo fallback usado hoje por get_permissoes_padrao's ELSE).
INSERT INTO usuario_perfis (usuario_id, perfil_id)
SELECT
  p.id,
  pf.id
FROM profiles p
JOIN perfis pf
  ON pf.is_sistema = true
  AND pf.nome = CASE
    WHEN p.ambiente IN ('cadastro', 'consultor', 'tecnologia', 'suporte') THEN p.ambiente
    ELSE 'ambos'
  END
ON CONFLICT (usuario_id, perfil_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
