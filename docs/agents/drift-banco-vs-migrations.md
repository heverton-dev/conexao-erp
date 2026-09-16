# Banco de produção × `supabase/migrations/` — drift

**Medido em 2026-08-03** contra `cluuqzhizeqvkgvfdisx` (`sa-east-1`,
`ACTIVE_HEALTHY`), pela Management API. Ferramentas:

```bash
npm run db:status      # repo × schema_migrations: o que está pendente
npm run db:verificar   # migrations marcadas como aplicadas cujo efeito NÃO existe
npm run audit:empresa-id
npm run db:query -- "select ..."   # SQL ad-hoc pela Management API
```

## Causa raiz: o ledger de migrations mente

`supabase_migrations.schema_migrations` diz **159 aplicadas** de 166. Mas o
`statements[1]` de cada registro mostra como foram registradas:

| Como foi registrada | Qtd | Rodou de fato? |
| --- | --- | --- |
| SQL real registrado | 55 | sim |
| `-- Applied via deploy workflow` | 16 | sim (script grava placeholder) |
| `-- pre-applied` | **33** | **não — inserida à mão** |
| `-- Obsoleta: empresa_id ja removida, single-tenant ativo` | **6** | **não — inserida à mão** |
| `-- Applied` / `-- Applied via Management API previously` | 10 | provavelmente sim |

As 39 marcadas à mão nunca foram executadas. Entre elas:

- **`20260705000000_normalizar_tabelas.sql`** (`-- pre-applied`) — as 46
  renomeações EN→PT. **32 ainda pendentes.**
- **`20260721000000_remove_empresa_id_all_tables.sql`** (`-- Obsoleta`) — o
  marcador afirma que `empresa_id` já havia sido removido. Não havia: **83
  tabelas ainda têm a coluna**, `NOT NULL`.

## Efeito ausente: 12 migrations

`npm run db:verificar` compara o que cada migration deveria criar com o schema:

| Migration | Efeito faltando |
| --- | --- |
| `00078_catalogo.sql` | 18/28 tabelas |
| `00080_catalogo_clientes.sql` | 1/10 (`catalogo_grupo_precos`) |
| `00084_agentes_usage_log.sql` | 1/1 |
| `20260705000000_normalizar_tabelas.sql` | **42/46 renomeações** |
| `20260711000000_catalogo_precos.sql` | 3/7 colunas de preço |
| `20260712000001_catalogo_grupo_precos_tipo.sql` | 2/2 colunas |
| `20260712000002_catalogo_seed_default_categories.sql` | 1/2 |
| `20260713000000_catalogo_sequencia_protetica.sql` | 1/1 tabela |
| `20260713000001_add_locked_conexoes.sql` | 1/1 coluna |
| `20260713110000_catalogo_add_ativo_all_tables.sql` | 10/11 colunas |
| `20260713120000_fix_add_ativo_all_catalogo_tables.sql` | 13/16 |
| `20260721000000_remove_empresa_id_all_tables.sql` | 40/71 `DROP COLUMN` |

Além dessas, **6 genuinamente pendentes** (nem registradas):
`20260725000000_provedores_ia`, `20260726000000_catalogo_add_estoque_precos`,
`20260726010000_add_todos_diametros_kit_implantes`,
`20260726180000_catalogo_pagamentos`, `20260726180100_catalogo_pedido_tracking`,
`20260726180200_catalogo_baixa_estoque`.

## Consequência: 52 tabelas que o código consulta não existem

| Módulo | Tabelas ausentes |
| --- | --- |
| `hub` | 14 — todas as `hub_*` em português |
| `funis` | 12 — `funis_anexos`, `funis_automacoes`, `funis_comentarios`, … |
| `catalogo` | 9 — `catalogo_acessorios`, `catalogo_grupo_precos`, `catalogo_pagamentos`, … |
| `core` | 3 — `conectores_api`, `logs_webhook`, `notificacoes_modelos` |
| `agentes` · `mapas` · `admin` · `nps` | 2 cada |
| `despesas` · `integracoes` · `demos` · `marketing` · `gerador-links` | 1 cada |

Em `core`: `dispararEventoModulo` consulta 3 tabelas. `webhooks` existe, então
**webhook HTTP continua entregando**; `notificacoes_modelos` e `conectores_api`
não existem, então **notificação e conector de API nunca disparam** — em silêncio,
porque o código só faz `console.error`.

`comprovantes`, `logos` e `users` são consultadas e **não têm `CREATE TABLE` em
nenhuma migration** — nunca existiram no repositório.

## Três bloqueios para reconciliar (verificados)

Reconciliar **não** é re-rodar as 12. Cada bloqueio abaixo foi confirmado:

### 1. A renomeação quebraria 6 funções

`ALTER TABLE … RENAME TO` preserva policies e FKs (referência por OID), mas
**não** reescreve o corpo de funções, que referenciam tabela por nome. Estas 6
mencionam nomes antigos:

```
check_empresa_modulo_limit    check_empresa_role_limit
enviar_whatsapp_evolution     excluir_usuario_demo
executar_api_connector_server obter_esquema_banco
```

`executar_api_connector_server` é justamente o RPC do caminho de conectores de
API. A `20260705000000` não recria nenhuma delas → precisa de migration
companheira com `CREATE OR REPLACE FUNCTION` para as 6.

### 2. `20260711000000_catalogo_precos.sql` sobrescreve preço de produto

```sql
UPDATE catalogo_implantes SET preco = 480 WHERE preco = 0 OR preco IS NULL;
UPDATE catalogo_kits      SET preco = 3200 WHERE preco = 0 OR preco IS NULL;
-- … 7 tabelas, valores fixos
```

Qualquer produto hoje com `preco = 0` receberia um valor inventado, numa loja em
produção. Os `ADD COLUMN` dela também **não** têm `IF NOT EXISTS`, então
re-executar aborta nas 4 tabelas onde a coluna já existe. **Não re-executar como
está** — separar o `ADD COLUMN` do seed de preço.

### 3. Não há ponto de restauração

```
GET /v1/projects/<ref>/database/backups
→ { "pitr_enabled": false, "backups": [] }
```

Sem PITR e sem backup listado. Antes de qualquer DDL em massa: habilitar PITR ou
tirar um dump. Existem 5 projetos `INACTIVE` na organização que poderiam servir
de staging para um ensaio.

## Ordem correta

1. **Habilitar PITR ou tirar dump.** Nada de DDL em massa sem ponto de retorno.
2. **Ensaiar em staging** (ativar um dos projetos inativos, restaurar o dump).
3. **Migration companheira** com `CREATE OR REPLACE` das 6 funções, usando os
   nomes novos, aplicada **junto** de `20260705000000`.
4. **Aplicar o grupo aditivo**, em ordem cronológica, verificando com
   `npm run db:verificar` após cada uma: `00078`, `00080`, `00084`,
   `20260712000001`, `20260712000002`, `20260713000000`, `20260713000001`,
   `20260713110000`, `20260713120000`, e as 6 genuinamente pendentes.
5. **`20260705000000` + companheira das funções.** Reversível pelo rename inverso.
6. **`20260711000000` reescrita** — só o `ADD COLUMN IF NOT EXISTS`, sem o seed
   de preço (ou com o seed revisado por quem conhece a tabela de preços).
7. Só então o trilho de `empresa_id`:
   `migrations-pendentes/…fase1` → limpar as ~480 ocorrências no código (medido
   em 2026-08-03 via `grep -r empresa_id src/`; ver
   [varredura-2026-08-03.md](varredura-2026-08-03.md) item g) → deploy →
   `…fase2a` → `…fase2b`.
8. **Nunca** re-executar `20260721000000` — o `-- Obsoleta` foi o erro que gerou
   tudo isto. As fases 1/2a/2b a substituem.

## Opção C — reconciliação aditiva (preparada, não executada)

Restaura tabelas e colunas ausentes **sem** tocar na renomeação, nas 6 funções
nem em preço. 14 migrations, todas aditivas, verificadas em dry-run.

```bash
# 1. dry-run — mostra as transformações, não toca no banco
node scripts/db-aplicar-migrations.mjs --lista supabase/migrations-pendentes/lote-reconciliacao-aditiva.txt

# 2. aplicar, uma a uma, parando no primeiro erro
node scripts/db-aplicar-migrations.mjs --aplicar --lista supabase/migrations-pendentes/lote-reconciliacao-aditiva.txt

# 3. conferir o efeito
npm run db:verificar && npm run db:status

# 4. opcional: a coluna `locked` (usada por schemas/estrutura.ts e useCatalogo.ts).
#    Tem UPDATE que marca 3 conexões padrão como locked — inofensivo, mas exige flag.
node scripts/db-aplicar-migrations.mjs --aplicar --permitir-dml 20260713000001_add_locked_conexoes.sql
```

`db-aplicar-migrations.mjs` torna cada migration idempotente **em memória** —
`CREATE TABLE`/`INDEX`/`ADD COLUMN` ganham `IF NOT EXISTS`, `CREATE POLICY` e
`CREATE TRIGGER` ganham `DROP … IF EXISTS` antes — sem editar os arquivos
originais. E **recusa** qualquer arquivo com `DROP TABLE`, `DROP COLUMN`,
`TRUNCATE`, `DELETE`, `RENAME TO` ou `ALTER COLUMN TYPE`, para que nada
destrutivo passe por ele sem revisão.

Ao aplicar, o ledger é corrigido: o marcador falso (`-- pre-applied`,
`-- Obsoleta`) é substituído por `-- Reaplicada idempotente em 2026-08-03`.

O que a opção C **não** resolve: as 14 tabelas `hub_*`, as 12 de `funis`,
`mapas_*`, `conectores_api`, `logs_webhook` e `notificacoes_modelos` — todas
dependem da renomeação (passos 1–5 acima).

## Corrigir o processo, não só o schema

O `-- pre-applied` e o `-- Obsoleta` são inserções manuais no ledger. Enquanto
isso for possível sem verificação, o drift volta. Duas mudanças mínimas:

- Rodar `npm run db:status && npm run db:verificar` no pre-flight de deploy.
- Nunca inserir em `schema_migrations` sem executar o SQL; se uma migration é
  realmente obsoleta, **apagar o arquivo** em vez de marcá-la como aplicada.
