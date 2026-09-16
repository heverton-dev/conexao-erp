# Varredura de consistência banco × código — 2026-08-03

Passe único, **read-only**, contra `cluuqzhizeqvkgvfdisx` (Management API).
Não re-deriva [drift-banco-vs-migrations.md](drift-banco-vs-migrations.md),
[debitos.md](debitos.md) nem [banco.md](banco.md) — parte deles como fato e
cobre o que faltava medir. Cada achado abaixo está marcado **VERIFICADO**
(consultado agora, evidência anexa) ou **SUPOSTO** (não consultado nesta
varredura). Nenhum INSERT/UPDATE/DDL foi executado.

Ferramentas usadas: `npm run db:status`, `npm run db:verificar`,
`npm run audit:empresa-id`, `node scripts/db-query.mjs` + grep no código.

## Resumo por item

| # | Item | Severidade | Estado |
| --- | --- | --- | --- |
| a | Tabelas ausentes/órfãs | 🔴 Crítica | VERIFICADO |
| b | Colunas código × schema | 🟠 Alta (no achado pontual) | VERIFICADO (amostra) |
| c | RPCs ausentes | 🟠 Alta | VERIFICADO |
| d | Função/trigger com referência quebrada | 🟢 Nenhuma hoje | VERIFICADO |
| e | RLS sem policy / RLS desligada | 🟡 Média | VERIFICADO |
| f | FKs e índices ausentes | 🟡 Média | VERIFICADO |
| g | `empresa_id`: tabelas × código | 🔴 Crítica (bloqueio conhecido) | VERIFICADO |
| h | Ledger: efeito real das migrations à mão | 🔴 Crítica (causa raiz) | VERIFICADO |

---

## a. Tabelas do código (`.from(...)`) × schema real

**VERIFICADO.** 198 nomes de tabela distintos em `.from("...")` sob `src/`
(grep), comparados com `information_schema.tables` (`public`, 186 linhas,
Management API).

- **52 tabelas que o código consulta não existem no schema real** — número
  idêntico ao já registrado em [debitos.md](debitos.md) e
  [drift-banco-vs-migrations.md](drift-banco-vs-migrations.md); esta varredura
  reproduz a lista completa (evidência) em vez de confiar no número:
  `agentes_usage_log`, `catalogo_acessorio_ferramental`, `catalogo_acessorios`,
  `catalogo_categorias_acessorio`, `catalogo_categorias_instrumental`,
  `catalogo_chaves_ferramental`, `catalogo_conexoes`, `catalogo_grupo_precos`,
  `catalogo_instrumentais_gerais`, `catalogo_pagamentos`, `comprovantes`,
  `conectores_api`, `config_app`, `config_integracoes`, `credenciais_demo`,
  `credenciais_mock`, `dashboard_perfis`, `empresa_limites_modulo`,
  `funis_anexos`, `funis_automacoes`, `funis_colunas_modelo`,
  `funis_comentarios`, `funis_etiquetas`, `funis_etiquetas_tarefa`,
  `funis_log_atividades`, `funis_modelos`, `funis_notificacoes`,
  `funis_recorrentes`, `funis_tarefas_modelo`, `gerador_modelos`,
  `hub_ativos_material`, `hub_colecoes`, `hub_config_chatbot`,
  `hub_config_sistema`, `hub_emblemas`, `hub_emblemas_usuario`,
  `hub_integracoes_sistema`, `hub_itens_colecao`, `hub_logs_acesso`,
  `hub_materiais`, `hub_niveis_gamificacao`, `hub_progresso_colecao`,
  `hub_progresso_usuario`, `hub_tokens_convite`, `logos`, `logs_webhook`,
  `mapas_consultores`, `mapas_distribuidores`, `notificacoes_modelos`,
  `nps_perguntas_pesquisa`, `provedores_ia`, `users`.
  **Ação**: nenhuma nova — já coberta pela ordem de reconciliação do relatório
  de drift (renomeação + companheira de funções + grupo aditivo).

- **40 tabelas existem no schema e o código nunca referencia** (`.from(...)`
  não encontrado em `src/`): `api_connectors`, `app_config`,
  `catalogo_ips_conexoes`, `catalogo_ips_familias`, `catalogo_ips_linhas`,
  `catalogo_protocolo_fresagem`, `catalogo_seq_protetica_componentes`,
  `demo_credentials`, `design_system_presets`, `empresa_modulo_limits`,
  `empresa_role_limits`, `funis_template_cols`, `funis_template_tasks`,
  `funis_templates`, `gerador_templates`, `hub_access_logs`, `hub_badges`,
  `hub_chatbot_config`, `hub_collection_items`, `hub_collection_progress`,
  `hub_collections`, `hub_gamification_levels`, `hub_invite_tokens`,
  `hub_materials`, `hub_system_config`, `hub_system_integrations`,
  `hub_user_badges`, `hub_user_progress`, `hub_user_roles`,
  `integracoes_config`, `mapas_consultants`, `mapas_distributors`, `metas`,
  `mktg_disparos_email`, `mock_credentials`, `notificacoes_templates`,
  `pacientes_backup`, `supabase_migrations`, `templates_mensagem`,
  `webhook_logs`.
  **Novo, não estava nos docs**: são as tabelas EN (ou pré-existentes) que o
  código deveria enxergar via os nomes PT acima — cada par
  (órfã real ↔ ausente do código) é a mesma tabela dos dois lados da
  renomeação nunca aplicada: `hub_materials`↔`hub_materiais`,
  `mapas_consultants`↔`mapas_consultores`,
  `mapas_distributors`↔`mapas_distribuidores`, `funis_templates`↔
  `funis_modelos`, `gerador_templates`↔`gerador_modelos`,
  `notificacoes_templates`↔`notificacoes_modelos`, etc. `pacientes_backup` e
  `demo_credentials`/`mock_credentials` parecem tabelas obsoletas de migração
  anterior, sem consumidor — candidatas a `DROP` **depois** de confirmar em
  staging que nada as lê fora de `src/` (scripts, edge functions).
  **Ação proposta**: ao rodar a reconciliação (passo 4-5 do relatório de
  drift), tratar este segundo grupo como a lista de "o que a renomeação deixa
  de ser órfão"; para `pacientes_backup`, `demo_credentials`,
  `mock_credentials`, `design_system_presets`, `app_config`, `metas`, `hub_badges`, `hub_user_badges`,
  `hub_access_logs`, `hub_gamification_levels`, `hub_invite_tokens`,
  `hub_collections`, `hub_collection_items`, `hub_system_config`,
  `hub_system_integrations`, `hub_user_progress`, `hub_user_roles`,
  `hub_chatbot_config`, `funis_template_cols`, `funis_template_tasks`,
  `mktg_disparos_email`, `catalogo_ips_*`, `catalogo_protocolo_fresagem`,
  `catalogo_seq_protetica_componentes`, `empresa_modulo_limits`,
  `empresa_role_limits`, `integracoes_config`: confirmar se são o par
  renomeado (mantém) ou lixo de migration substituída (avaliar `DROP`, fora
  do escopo desta varredura read-only).

## b. Colunas por tabela × o que o código lê/escreve

**VERIFICADO por amostragem** (não é viável, em um único passe, tipar as 822
chamadas `.select(...)` do repo sem um parser SQL — risco de falso positivo
em `join` (`tabela(colunas)`) e alias (`col:coluna_real`). Cobertura real:
16 tabelas de alto tráfego (`profiles`, `empresas`, `empresas_config`,
`credenciais`, `webhooks`, `cadastros`, `cadastros_pf`, `cadastros_pj`,
`catalogo_pedidos`, `catalogo_orcamentos`, `catalogo_implantes`,
`catalogo_kits`, `rotas_visitas`, `nps_respostas`, `funis`, `clientes`) mais o
fluxo completo de pedidos/orçamentos/pagamentos do catálogo. As colunas de
`00078`/`00080`/`20260711000000`/`20260712000002`/`20260713110000`/
`20260713120000` já estão cobertas, com evidência, por `npm run db:verificar`
— não repetido aqui.

- 🟠 **Novo achado**: `src/features/catalogo/services/pedidos.service.ts:88`
  e `src/features/catalogo/services/orcamentos.service.ts:115` fazem
  `.from("clientes").select("nome_doutor, lead_email, telefone_contato")`.
  A tabela `clientes` (CRM) **não tem** coluna `lead_email` — as colunas reais
  são `id, nome_doutor, nome_clinica, telefone_contato, consultor_atual_id,
  criado_em, atualizado_em, estagio_id, grupo_id` (confirmado via
  `information_schema.columns`). `lead_email`/`lead_nome`/`lead_whatsapp`
  existem em `cadastros`, não em `clientes` — parece confusão entre as duas
  tabelas ao escrever o código. Efeito: a query falha (PostgREST 400,
  coluna inexistente), o erro é descartado (`const { data: cliente } = await
  ...` sem checar `error`), `cliente` fica `undefined`, e
  `criarPedido`/`criarOrcamento` seguem com `cliente_nome`/`cliente_email`
  sempre `null` **sempre que o pedido/orçamento vem de um cliente da carteira
  CRM** (`cliente_crm_id` setado). Silencioso — sem exceção, sem log.
  **Ação**: trocar `lead_email` por `email_comunicacao` (ou o campo de e-mail
  correto do CRM — checar `cadastros_pf`/`cadastros_pj`, que têm
  `email_comunicacao`; `clientes` não tem nenhum campo de e-mail hoje) nas
  duas ocorrências, e não descartar `error` nesses dois `await`.

- Nenhuma outra divergência de coluna encontrada nas 16 tabelas amostradas.

## c. RPCs chamadas (`.rpc(...)`) × `pg_proc`

**VERIFICADO.** 27 nomes distintos de RPC em `src/` vs 51 funções em
`pg_proc` (schema `public`).

| RPC chamada pelo código | Existe? |
| --- | --- |
| `get_table_info` (`src/routes/global.banco.tsx:57`) | ❌ **não existe** |
| `set_meta_diaria_visitas` (`src/routes/_auth.crm.equipe.tsx:193`) | ❌ **não existe** |
| demais 25 (`obter_esquema_banco`, `limpar_links_expirados`, `executar_api_connector_server`, `create_demo_user`, `excluir_usuario_demo`, `admin_criar_usuario`, `admin_deletar_usuario`, `admin_atualizar_senha`, `check_empresa_modulo_limit`, `buscar_orcamento_por_token`, `buscar_itens_orcamento`, `atualizar_status_orcamento_por_token`, `registrar_acesso_token`, `gerar_2fa_pin`, `validar_2fa_pin`, `verificar_documento_duplicado`, `update_cadastro_from_precadastro`, `registrar_clique`, `gerar_token_teste_lab`, `deletar_token_teste_lab`, `validar_token_teste_lab`, `gerar_pin_teste_lab`, `pular_verificacao_teste_lab`, `listar_tokens_teste_lab`, `limpar_tokens_teste_lab`) | ✅ existem |

**Novo achado, não estava nos docs**:

- `get_table_info` — chamada em `/global/banco` (painel de diagnóstico de
  banco, rota super-admin). Falha em runtime com PostgREST `PGRST202`
  ("could not find function"). **Correção desta revisão**: a página **não
  quebra** — há fallback (`src/routes/global.banco.tsx:60-76`) que consulta
  `information_schema.tables` e conta linhas tabela por tabela quando a RPC
  falha. Impacto real: N+1 queries no lugar de 1, mais lento, não indisponível.
  Achado à parte, também corrigido nesta execução: o `if` que decide usar o
  resultado da RPC checava `raw[0].table_name`, mas a renderização usa
  `t.nome`/`t.linhas` — mesmo com a RPC existindo, o `if` nunca teria
  reconhecido um retorno `{ nome, linhas }` sem esse ajuste. Ver B2 no plano
  de ação.
- `set_meta_diaria_visitas` — chamada em `/crm/equipe` ao definir meta diária
  de visitas de um vendedor (`src/routes/_auth.crm.equipe.tsx:193`). Também
  falha com `PGRST202`. Impacto maior: feature de gestão de equipe do CRM
  visivelmente quebrada (erro tratado e exibido via `toast`, então não é
  silencioso, mas a funcionalidade não existe hoje).

**Ação proposta**: criar as duas funções faltantes (`get_table_info` como
`SECURITY DEFINER` que espelha `obter_esquema_banco` mas com o formato que a
página `global.banco.tsx` espera; `set_meta_diaria_visitas` como
`UPDATE profiles SET ... WHERE id = _user_id`, a julgar pelos parâmetros
`_user_id`) via nova migration — não depende da reconciliação do drift, pode
ser resolvido isoladamente.

## d. Funções/triggers com referência a tabela/coluna inexistente

**VERIFICADO — nenhuma quebrada hoje.** `pg_get_functiondef` das 51 funções
de `public`, casado contra a lista real de tabelas: nenhuma função referencia
(via `FROM`/`JOIN`/`UPDATE`/`INTO`) uma tabela que não exista **no estado
atual do banco**. Isto **confirma, sem contradizer**, o achado já registrado
no relatório de drift: as 6 funções (`check_empresa_modulo_limit`,
`check_empresa_role_limit`, `enviar_whatsapp_evolution`,
`excluir_usuario_demo`, `executar_api_connector_server`,
`obter_esquema_banco`) usam os nomes **atuais** (ainda em inglês/pré-rename)
— por isso funcionam agora. Elas **quebrariam** se `20260705000000` fosse
aplicada sem a migration companheira, exatamente como já documentado. Não há
achado novo aqui além da confirmação.

## e. Policies RLS: tabela com RLS ligada e zero policy

**VERIFICADO.** `pg_class.relrowsecurity` + `pg_policy`, 186 tabelas.

- **RLS ligada e zero policy: 0 tabelas.** Toda tabela com RLS habilitada
  tem entre 2 e 5 policies (`USING (true)` nos 4 verbos, padrão do projeto).
- 🟡 **Novo achado**: **44 tabelas com RLS desligada** (violam a convenção de
  `banco.md`, que pede `ENABLE ROW LEVEL SECURITY` em toda tabela nova) —
  todas em `catalogo_*`: `catalogo_abutments`, `catalogo_categorias`,
  `catalogo_chaves`, `catalogo_cicatrizadores`,
  **`catalogo_cliente_permissoes`**, `catalogo_complementares`,
  `catalogo_componentes`, `catalogo_configuracoes`,
  `catalogo_cps_etapas_workflows`, `catalogo_cps_tipos_abutments`,
  `catalogo_cps_tipos_cicatrizadores`, `catalogo_cps_tipos_componentes`,
  `catalogo_cps_tipos_parafusos`, `catalogo_cps_tipos_reabilitacao`,
  `catalogo_cps_tipos_reabilitacao_familias`, `catalogo_cps_tipos_workflows`,
  `catalogo_cupons`, `catalogo_design_config`, `catalogo_fresas`,
  `catalogo_fretes`, `catalogo_grupos_clientes`, `catalogo_imagens_produto`,
  `catalogo_implantes`, `catalogo_ips_conexoes`, `catalogo_ips_familias`,
  `catalogo_ips_linhas`, `catalogo_kit_complementares`,
  `catalogo_kit_opcionais`, `catalogo_kits`, `catalogo_opcionais`,
  `catalogo_parafusos`, `catalogo_parafusos_retensao`,
  `catalogo_promocionais`, `catalogo_promocional_itens`,
  `catalogo_protocolo_fresagem`, `catalogo_protocolos_fresagens`,
  `catalogo_protocolos_fresas_itens`, **`catalogo_solicitacoes_acesso`**,
  `catalogo_tipos_chaves`, `catalogo_tipos_complementares`,
  `catalogo_tipos_fresas`, `catalogo_tipos_kits`, `catalogo_tipos_opcionais`,
  `catalogo_tipos_ossos`.
  Como a política do projeto é `USING (true)` em toda tabela (RLS "aberta por
  design"), o efeito prático de exposição via `anon`/`authenticated` é
  equivalente com ou sem RLS — **não é uma falha de autorização em si**
  (autorização é na aplicação). Mas é inconsistência de convenção: 2 delas
  guardam dado sensível de acesso (`catalogo_cliente_permissoes`,
  `catalogo_solicitacoes_acesso`), e a maioria são catálogos de referência
  (`catalogo_tipos_*`, `catalogo_cps_*`) provavelmente criados antes do
  padrão RLS-aberta se firmar.
  **Ação proposta**: nova migration aditiva (`ALTER TABLE ... ENABLE ROW
  LEVEL SECURITY` + 4 `CREATE POLICY ... USING (true)` para as 44), sem
  qualquer relação com o bloqueio de renomeação/`empresa_id` — pode rodar
  independente e com baixo risco (não muda comportamento observável, só
  fecha a lacuna de convenção).

## f. FKs e índices ausentes em coluna filtrada

**VERIFICADO.**

- **25 colunas `*_id`/`empresa_id` sem nenhuma constraint de chave** (nem PK,
  nem FK, nem UNIQUE) — `information_schema.key_column_usage`. Descontando
  as que são claramente IDs de sistema externo (não FK interna:
  `mktg_meta_contas.meta_ad_account_id/meta_page_id/meta_user_id`,
  `mktg_meta_campanhas.meta_campanha_id`, `mktg_meta_posts.meta_post_id`,
  `mktg_pixels.pixel_id`, `mktg_eventos.session_id`), sobram 19 que parecem
  referências internas sem FK declarada: `atividades.entidade_id`
  (provavelmente polimórfica — não deve ter FK única, ok),
  `catalogo_abutments.tipo_reabilitacao_id`, `catalogo_chaves.kit_id`,
  `catalogo_clientes.cadastro_id`, `catalogo_clientes.user_id`,
  `catalogo_complementares.kit_id`, `catalogo_fresas.kit_id`,
  `catalogo_opcionais.kit_id`, **`catalogo_orcamentos.colaborador_id`**,
  `catalogo_parafusos_retensao.chave_id`, **`catalogo_pedidos.colaborador_id`**,
  `logs_transferencia_consultor.consultor_id`, `mktg_eventos.user_id`,
  `modelos_ia.modelo_id`, **`nps_respostas.client_id`**,
  **`nps_respostas.empresa_id`**, `nps_respostas.order_id`,
  `rotas_clientes_base.fonte_id`.
  `colaborador_id` em pedidos/orçamentos referencia `profiles.id` (confirmado
  lendo `pedidos.service.ts`/`orcamentos.service.ts`) mas não há FK — um
  `profiles` deletado deixaria pedido/orçamento "órfão" sem erro do banco.

- **139 colunas `*_id`/`empresa_id` sem índice que as cubra** (`pg_indexes`,
  primeira posição ou dentro da lista). A maior parte é `empresa_id` em
  ~35 tabelas (`profiles`, `webhooks`, `webhook_logs`, `rotas*`, `nps_*`,
  `notificacoes*`, `hub_*`, `funis_*`(templates), `gerador_*`,
  `mktg_whatsapp_campanhas`, `form_schema`, `integracoes_config`,
  `empresa_modulo_limits`, `empresa_role_limits`, `design_sistema_modulo`,
  `cadastros_pf`, `cadastros_pj`, `cadastros_enderecos`, `api_connectors`) e
  FKs internas do catálogo (`chave_id`, `kit_id`, `familia_id`,
  `tipo_*_id`, etc. — em tabelas de referência com poucas linhas, baixo
  impacto). Lista completa em
  `scratchpad/cols_no_index.json` desta sessão (139 linhas) — não reproduzida
  aqui por tamanho.
  **Risco real, não hipotético**: `audit:empresa-id` (item g) mostra que
  `despesas` (129 ocorrências), `marketing`/`mktg_*` (94), `hub` (44),
  `rotas` (44), `linktree` (31), `mapas` (25), `nps` (23) e `funis` (14)
  **ainda filtram por `empresa_id` no código hoje** — cada um desses filtros
  roda contra uma coluna sem índice, ou seja, sequential scan em produção
  enquanto a fase 1/2 de remoção de `empresa_id` não roda.
  **Ação proposta**: dado que a remoção de `empresa_id` está a caminho
  (ver item g), **não vale criar índice em `empresa_id`** — seria trabalho
  descartável. Priorizar índice só nas FKs internas de maior tráfego sem
  relação com `empresa_id`: `catalogo_orcamentos.colaborador_id`,
  `catalogo_pedidos.colaborador_id` (dashboard de colaborador, filtro comum),
  `nps_respostas.client_id`/`order_id`. As demais (catálogo de referência)
  podem esperar a reconciliação.

## g. `empresa_id`: tabelas, nullability, cruzamento com o código

**VERIFICADO**, via `npm run audit:empresa-id` + grep direto (não confiar só
no script, que varre apenas `src/features/*`).

- **83 tabelas têm `empresa_id`**, 0 exceções aprovadas — número idêntico ao
  já registrado. 47 dessas são `NOT NULL` (listadas na saída do script;
  não repetidas aqui).
- O script soma **411 ocorrências de `empresa_id`** em 12 módulos de
  `src/features/*` (despesas 129, marketing 94, hub 44, rotas 44, linktree
  31, mapas 25, nps 23, funis 14, agentes 2, credenciais 2, gerador-links 2,
  api-connectors 1).
- **Novo, para reconciliar o "470" citado em
  [drift-banco-vs-migrations.md](drift-banco-vs-migrations.md)** (não em
  `AGENTS.md` — corrigido nesta revisão): grep de `empresa_id` em todo `src/`
  (não só `features/*`) dá **480 ocorrências em 142 arquivos** hoje — inclui
  `__tests__`, `shared/empresas`, `core/`, `design-system/`, `routes/*.tsx` e
  `AGENTS.md` de módulo, que o script de auditoria não cobre. O número "470"
  é uma medição anterior, próxima mas não idêntica (código mudou entre as
  duas medições, ou a contagem exclui um subconjunto de arquivos como
  `__tests__`/`.md`). Não é uma divergência preocupante — o texto de
  `drift-banco-vs-migrations.md` foi atualizado para "~480".
- Cruzamento tabela × nullability já é o output do próprio script
  (`[NOT NULL — código não pode parar de enviar antes da fase 1]`) — correto
  e não precisa de nova consulta.

## h. Ledger: efeito real de cada migration marcada à mão

**VERIFICADO**, reexecutando `npm run db:status` e `npm run db:verificar`
agora (2026-08-03) em vez de confiar no relatório escrito: os números saem
**idênticos** aos do `drift-banco-vs-migrations.md` —

- `db:status`: 166 migrations no repo, 159 "aplicadas" no ledger, 6
  pendentes (as mesmas 6: `20260725000000_provedores_ia`,
  `20260726000000_catalogo_add_estoque_precos`,
  `20260726010000_add_todos_diametros_kit_implantes`,
  `20260726180000_catalogo_pagamentos`,
  `20260726180100_catalogo_pedido_tracking`,
  `20260726180200_catalogo_baixa_estoque`); sonda confirma
  `hub_materials(EN)=1 · hub_materiais(PT)=0`, 83 tabelas com `empresa_id`.
- `db:verificar`: 4 migrations marcadas como aplicadas **sem nenhum efeito**
  (`00084_agentes_usage_log`, `20260712000001_catalogo_grupo_precos_tipo`,
  `20260713000000_catalogo_sequencia_protetica`,
  `20260713000001_add_locked_conexoes`) e 8 com efeito **parcial**
  (`00078_catalogo` 18/28, `00080_catalogo_clientes` 1/10,
  `20260705000000_normalizar_tabelas` 42/46,
  `20260711000000_catalogo_precos` 3/7,
  `20260712000002_catalogo_seed_default_categories` 1/2,
  `20260713110000_catalogo_add_ativo_all_tables` 10/11,
  `20260713120000_fix_add_ativo_all_catalogo_tables` 13/16,
  `20260721000000_remove_empresa_id_all_tables` 40/71) — mesmos números do
  relatório existente, char por char.

Conclusão desta seção: **nada mudou no banco desde a medição do drift
report.** O relatório de drift continua sendo a fonte válida; esta varredura
apenas re-confirma por consulta direta em vez de herdar o número.

---

## Achados novos (não estavam em nenhum doc lido)

1. 🟠 `clientes.lead_email` não existe — bug silencioso em
   `pedidos.service.ts`/`orcamentos.service.ts` (item b).
2. 🟠 RPC `set_meta_diaria_visitas` não existe — meta diária de visitas no CRM
   quebrada (erro visível via toast). `get_table_info` também não existe, mas
   tem fallback no front-end — só deixa `/global/banco` mais lento, não
   indisponível (item c).
3. 🟡 44 tabelas `catalogo_*` com RLS desligada, contra a convenção do
   projeto (item e).
4. 🟡 19 colunas de referência interna sem FK declarada, incluindo
   `colaborador_id` em pedidos/orçamentos do catálogo (item f).
5. 🟡 139 colunas `*_id`/`empresa_id` sem índice — a maioria é `empresa_id`
   que será removido, mas ~15 são FKs internas de catálogo que valem índice
   já (item f).

Nenhum destes 5 depende da reconciliação de renomeação/`empresa_id` — todos
podem ser corrigidos isoladamente, por migration aditiva ou fix de código,
sem tocar na ordem já definida no relatório de drift.
