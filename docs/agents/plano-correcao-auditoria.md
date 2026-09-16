# Plano de correção — auditoria de 2026-08-03

> **Status: executado em 2026-08-03.** A1 ficou parcial (falta credencial de banco);
> A9 e A10 se revelaram leituras erradas do diagnóstico e não exigiam mudança de
> código. Estado item a item em [debitos.md](debitos.md).
>
> Correções ao próprio plano descobertas durante a execução:
> - **A5** — não era 1 atalho errado, eram **todos os 6**.
> - **A8** — `styles/` não estava vazio (`theme.css`); só `context/` foi consolidado.
> - **A9** — `link.gerado` e `link_gerado` não são duplicata: são `button_action` e
>   `status_change`, famílias distintas de `~/core/services/webhooks`.
> - **A10** — i18n não está "pela metade": cobre a loja pública em 3 idiomas
>   (143 chaves cada), com tela de seleção e admin de traduções. Escopo deliberado.
> - **A3** — `hub.cliente.dashboard.$empresaId` era exposição real (única rota do hub
>   fora da árvore autenticada, sem guard); corrigida.

Origem: auditoria feita durante a reescrita da documentação de agentes.
Cada item tem **evidência**, **ação**, **verificação** e **risco**. Ordem = prioridade.

## Duas correções ao relatório inicial

O aprofundamento inverteu dois achados. Registrado aqui porque muda o que fazer:

1. **Não é o `hub` que está errado — é a migration.** O relatório dizia que o código
   do `hub` escrevia `empresa_id` em tabelas já limpas. É o contrário: as tabelas
   `hub_*` **nunca foram limpas**, então o código está correto. Ver A1.
2. **`check:guards` não tem 32 rotas desprotegidas.** Tem 2 rotas mortas e
   30 falsos positivos do próprio script. Ver A3.

## Resumo

| # | Achado | Sev | Esforço | Natureza |
| --- | --- | --- | --- | --- |
| A1 | Migration single-tenant aplicada só parcialmente: 19 dos 71 `DROP COLUMN` foram no-op | 🔴 P0 | M | banco + código |
| A2 | 2 rotas mortas servindo `<div>Route Removed</div>` | 🔴 P0 | P | código morto |
| A3 | `check:guards` gera 30 falsos positivos em 32 — sinal inutilizável | 🟠 P1 | M | tooling |
| A4 | `catalogo` importa componente interno do `crm` | 🟠 P1 | P | arquitetura |
| A5 | `.claude/skills.lnk` aponta para outro projeto | 🟡 P2 | P | config |
| A6 | `.claude/mcp.json` aponta para caminho fora do repo | 🟡 P2 | P | config |
| A7 | `npm run deploy:safe` chama arquivo inexistente | 🟡 P2 | P | config |
| A8 | `catalogo`: `context/` + `contexts/` coexistem; `styles/` vazio | 🟡 P2 | P | organização |
| A9 | Eventos de `cadastros` com 3 convenções + duplicata | 🟢 P3 | M | consistência |
| A10 | i18n pela metade (24 arquivos de ~500) | 🟢 P3 | G | produto |

P = < 1h · M = 1 a 4h · G = > 1 dia

---

## A1 — Migration single-tenant parcialmente não aplicada 🔴

### Evidência

`20260705000000_normalizar_tabelas.sql` (05/07) renomeou tabelas de inglês para
português. `20260721000000_remove_empresa_id_all_tables.sql` (21/07) tenta remover
`empresa_id` usando os **nomes antigos**. Como todo statement usa
`ALTER TABLE IF EXISTS`, os 19 casos abaixo foram **no-op silencioso**:

```
notificacoes_templates → notificacoes_modelos      webhook_logs → logs_webhook
form_schema → schema_formulario                    api_connectors → conectores_api
integracoes_config → config_integracoes            empresa_modulo_limits → empresa_limites_modulo
modulos_empresa → empresa_modulos                  mapas_distributors → mapas_distribuidores
hub_user_roles → hub_papeis_usuario                mapas_consultants → mapas_consultores
hub_materials → hub_materiais                      hub_collections → hub_colecoes
hub_collection_items → hub_itens_colecao           hub_user_progress → hub_progresso_usuario
hub_user_badges → hub_emblemas_usuario             hub_gamification_levels → hub_niveis_gamificacao
hub_system_config → hub_config_sistema             hub_system_integrations → hub_integracoes_sistema
hub_chatbot_config → hub_config_chatbot
```

Outros 7 alvos nunca aparecem em nenhum `CREATE TABLE`: `empresa_modulos`,
`hub_gamification_badges`, `hub_gamification_points`, `despesas_categorias`,
`catalogo_instrumentais`, `catalogo_instrumental_geral`, `catalogo_fresagens`.

**Logo: no máximo 52 dos 71 statements tiveram efeito.** A migration tem um bloco
de verificação no final, mas ele só faz `RAISE WARNING` — nunca falha. Por isso
passou despercebido.

Consequência no código, cruzando `empresa_id` com a lista real de tabelas limpas:

| Módulo | Ocorrências | Situação |
| --- | --- | --- |
| `marketing` (94), `mapas` (25), `agentes` (2), `gerador-links` (2), `api-connectors` (1) | 124 | ✅ **correto** — tabelas nunca foram limpas |
| `hub` (44) | 44 | ✅ **correto** exceto `profiles` — as 12 tabelas `hub_*` ficaram de fora |
| `linktree` (31) | 31 | ⚠️ 6 tabelas `linktree_*` **foram** limpas |
| `nps` (23) | 23 | ⚠️ `nps_perguntas`, `nps_respostas`, `nps_relatorios_envio`, `nps_webhook_config` limpas |
| `despesas` (129) | 129 | ⚠️ `despesas`, `despesas_periodos` limpas |
| `rotas` (44) | 44 | ⚠️ `rotas`, `rotas_trajetos` limpas |
| `funis` (14) | 14 | ⚠️ `funis` limpa |
| `credenciais` (2) | 2 | ⚠️ `credenciais` limpa |

### Ação

**Passo 0 — obrigatório antes de qualquer código.** O repositório não é fonte de
verdade: `IF EXISTS` esconde o que rodou. **Entregue:**

```bash
npm run audit:empresa-id     # scripts/audit-empresa-id.mjs
```

Lista as tabelas com `empresa_id` separando exceção aprovada de pendência, e cruza
com os módulos que ainda usam o campo. Exit 1 se houver pendência, 2 sem credencial.
Requer `VITE_SUPABASE_URL` + `SUPABASE_DB_PASSWORD` no `.env` (ou `SUPABASE_DB_URL`)
— **ausentes hoje**, por isso os passos seguintes não puderam ser concluídos.

**Passos 1 e 2 — expand/contract, para desacoplar migration e código. Entregues:**

Como `empresa_id` é `NOT NULL` sem default em 43 das 63 tabelas pendentes, remover o
campo do código antes de mexer no schema quebra os inserts — e remover a coluna antes
de mexer no código também. As duas migrations quebram esse acoplamento:

| Migration | O que faz | Seguro sozinha? |
| --- | --- | --- |
| `20260803000000_single_tenant_fase1_relaxar_empresa_id.sql` | `ALTER COLUMN empresa_id DROP NOT NULL` em 43 tabelas | ✅ sim — nada quebra se o código continuar enviando |
| `migrations-pendentes/20260803000100_single_tenant_fase2_remover_empresa_id.sql` | `DROP COLUMN IF EXISTS empresa_id` em 63 tabelas + verificação que **`RAISE EXCEPTION`** | ❌ **fora de `supabase/migrations/`** para o deploy não aplicar sozinho — mover só junto do deploy que limpa o código |

Exceções mantidas (15): `mktg_*` (13), `agentes_ia`, `empresa_limites_modulo`.

Ordem de deploy: **fase 1** → deploy do código limpo → **fase 2**.

**Passo 3 — limpar o código** dos módulos marcados ⚠️, um módulo por PR.
Comece por `credenciais` (2 ocorrências) e `funis` (14) para validar o padrão;
`despesas` (129) por último. Em cada um: remover o campo dos `types.ts`, dos
payloads de insert/update e dos `.eq("empresa_id", ...)`.

**Passo 4** — atualizar `docs/agents/banco.md`, `docs/agents/debitos.md` e as
`## Notas` dos módulos afetados. Rodar `node scripts/sync-docs.mjs`.

### Verificação

- A query do passo 0 retorna só as exceções aprovadas.
- `npm run check:types && npm run test` verdes.
- Teste manual de um insert e um update em cada módulo tocado — erro de coluna
  inexistente do PostgREST só aparece em runtime.
- `src/__tests__/single-tenant/` (5 testes) continua passando; estenda-os com
  a lista de exceções aprovadas.

### Risco

**Alto.** Se um insert em produção hoje já envia `empresa_id` para tabela sem a
coluna, esse fluxo está quebrado agora — e o passo 3 vai consertá-lo. O inverso
também vale: remover a coluna de tabela cujo código ainda filtra por ela quebra a
leitura. Por isso passo 2 e passo 3 vão **na mesma janela de deploy**, migration
primeiro.

---

## A2 — Rotas mortas 🔴

### Evidência

```
src/routes/global.empresas.tsx    → component: () => <div>Route Removed (Single Tenant)</div>
src/routes/global.permissoes.tsx  → component: () => <div>Route Removed (Single Tenant)</div>
```

Ambas em `authLayout`, sem guard, alcançáveis por URL. `src/features/empresas/module.ts`
ainda declara `/global/empresas` em `routes[]`, e há `registerNavItem` apontando para
rotas `/global/*` — confirmar se algum item de menu leva a elas.

### Ação

1. `rg "adminSuperEmpresasRoute|adminSuperPermissoesRoute" src` — remover o `import`
   e a entrada no `addChildren` de `src/routeTree.gen.ts`.
2. Apagar os 2 arquivos.
3. Remover `/global/empresas` de `routes[]` em `src/features/empresas/module.ts`.
4. Conferir `registerNavItem` do módulo `empresas` e de `admin`: nav item órfão
   apontando para rota removida vira link quebrado.
5. Se a intenção era manter a URL viva, trocar por `beforeLoad: () => { throw redirect({ to: "/empresa" }) }`
   — mesmo padrão de `crm.design.tsx`.

### Verificação

`npm run build` e `npm run check:guards` (as duas saem da lista), navegação manual
no menu lateral como super admin.

### Risco

Baixo. Só remove tela que já não renderiza nada útil.

---

## A3 — `check:guards` com 30 falsos positivos em 32 🟠

### Evidência

O script faz `grep` do nome do guard no arquivo, sem entender roteamento
(documentado no próprio cabeçalho). Classificando as 32 rotas apontadas:

| Categoria | Qtd | Por que é falso positivo |
| --- | --- | --- |
| **Redirect-shim** — só `beforeLoad: () => { throw redirect(...) }`, sem componente | 13 | Não há UI para proteger; o guard está no destino `/empresa/*` |
| **Guard herdado do pai** | 2 | `_auth.crm.transferencia.tsx` envolve `<Outlet/>` com `RequirePermission modulo="crm" permissions={["crm_transferencia"]}`; os 2 filhos herdam |
| **Rota pública, `parent=rootRoute`** | 15 | Fora da árvore autenticada por design (vitrine, loja, survey, cartão, encurtador) |
| **Rota morta** | 2 | A2 |

Os 13 redirect-shims: `cadastros/crm/despesas/funis/hub/linktree/mapas/nps/rotas.design`,
`linktree.tema`, `nps.tema`, `rotas.config`, `hub.admin.chatbot`.

As 15 públicas: `catalogo.busca/carrinho/checkout/componentes/implantes/kits/promocionais`,
`catalogo.empresa.$slug`, `catalogo.produto.$tipo.$sku`, `catalogo.teste.$token`,
`catalogo-loja.$slug.pedidos.$id`, `linktree.$id`, `nps.survey`, `r.$linkId`,
`hub.cliente.dashboard.$empresaId`.

### Ação

**Passo 1 — ensinar o script a reconhecer os 3 padrões**, em `scripts/check-route-guards.mjs`:

```js
// a) redirect-shim: redireciona e não tem componente → nada a proteger
const isRedirectShim = /throw redirect\(/.test(c) && !/component:/.test(c);

// b) guard herdado: resolve getParentRoute e checa o pai
const parent = (c.match(/getParentRoute: \(\) => (\w+)/) || [])[1];
// mapear symbol do pai → arquivo (grep "export const <symbol> = createRoute")
// e checar hasGuard() no pai, recursivamente

// c) árvore pública: parent === "rootRoute" → não exigir guard do ERP,
//    mas listar em seção própria do relatório
```

**Passo 2 — separar o relatório em 3 blocos**, para o número voltar a ter
significado:

```
FALHA  — rota em authLayout, com componente, sem guard próprio nem herdado
AVISO  — rota pública (parent=rootRoute) sem allowlist: confirmar que é intencional
INFO   — redirect-shims e guards herdados
```

Só o bloco `FALHA` define o exit code.

**Passo 3 — allowlist com motivo** para as públicas que já foram confirmadas.
Padronizar o motivo com o texto já usado nas entradas existentes de
`catalogo-loja.*` ("autenticação é via sessão de cliente, não profile/permissoes do ERP").

**Passo 4 — revisar 2 casos que NÃO devem entrar na allowlist sem análise:**

- `catalogo.checkout.tsx` — checkout público: confirmar que valida sessão de cliente
  e não aceita `catalogo_cliente_comprar` implícito.
- `hub.cliente.dashboard.$empresaId.tsx` — dashboard por `$empresaId` na URL, fora
  da árvore autenticada: confirmar que não expõe dado de outra empresa por
  troca de parâmetro (IDOR).

Estes dois são os únicos itens de A3 com risco real de segurança. Trate-os antes
de silenciar o resto.

### Verificação

`npm run check:guards` sai 0 com `FALHA` vazio. Adicionar rota autenticada sem
guard num branch de teste deve voltar a falhar — teste o teste.

### Risco

Médio. Um script permissivo demais é pior que um ruidoso: valide o passo 2 com um
caso negativo real antes de fechar o PR.

---

## A4 — Import cross-feature `catalogo` → `crm` 🟠

### Evidência

```
src/features/catalogo/components/ClienteAtivoBar.tsx:5
  import { ClientePickerModal } from "~/features/crm/components/ClientePickerModal"
```

O barrel do `crm` (`src/features/crm/index.ts`) só exporta `crmModule` e
`CRM_PERMISSIONS` — o import alcança **internals**, violando
`.agents/rules/module-autonomy.yaml`.

`ClientePickerModal` tem 132 linhas e importa apenas `~/core/supabase`,
`~/components/ui/*` e ícones. Consumidores: `catalogo/components/ClienteAtivoBar.tsx`,
`routes/_auth.crm.dashboard.tsx`, `routes/_auth.crm.pipeline.tsx`.

### Ação

Componente de seleção de cliente usado por 2 módulos é, por definição, compartilhado:

1. Mover para `src/components/shared/ClientePickerModal.tsx`.
2. Trocar a query direta em `supabase.from("clientes")` por consumo de
   `~/features/clientes` (`listarCadastros`/`buscarCadastro`) — é o dono da tabela.
3. Atualizar os 3 import sites para `~/components/shared/ClientePickerModal`.

Não exporte o componente pelo barrel do `crm`: isso deixaria `catalogo` dependendo
do módulo `crm`, invertendo a direção da dependência.

### Verificação

```bash
npm run check:isolation    # 0 violações
npm run check:types && npm run build
```

Abrir `/catalogo` como consultor e `/crm/pipeline` — o picker abre e seleciona nos dois.

### Risco

Baixo. Movimentação mecânica, 3 call sites, sem mudança de comportamento.

---

## A5 — `.claude/skills.lnk` aponta para outro projeto 🟡

### Evidência

```
.claude/skills.lnk → C:\Users\trcnologia\Desktop\Cadastros-Conexao\.agents\skills
```

Deveria apontar para `.agents/skills` **deste** repositório. Aparece como
modificado no `git status` desde o início da sessão. Além disso existe
`.claude/skills/` como diretório real contendo só `i-have-adhd`, competindo com o `.lnk`.

### Ação

1. Recriar o atalho para o caminho correto:
   ```powershell
   $s = (New-Object -ComObject WScript.Shell).CreateShortcut("$PWD\.claude\skills.lnk")
   $s.TargetPath = "$PWD\.agents\skills"; $s.Save()
   ```
2. Decidir o destino de `.claude/skills/i-have-adhd` — mover para `.agents/skills/`
   (onde já existe uma cópia: conferir se divergem) e remover o diretório duplicado.
3. Auditar os outros 5 `.lnk` (`commands`, `hooks`, `rules`, `specs`, `workflows`)
   com o mesmo método — foram criados juntos e podem ter o mesmo defeito.

### Verificação

Cada `.lnk` resolve para um caminho dentro deste repositório. Uma skill do projeto
(ex.: `criar-modulo`) aparece na sessão.

### Risco

Baixo, mas com impacto silencioso: enquanto durar, agentes carregam as skills do
projeto errado.

---

## A6 — `.claude/mcp.json` com caminho fora do repo 🟡

### Evidência

```json
"args": ["c:/Users/trcnologia/Desktop/PROJETOS/proj_erp/supabase-mcp-server/dist/index.js"]
```

O servidor existe **neste** repo em `supabase-mcp-server/`, mas sem `dist/`
(só `src/`, `package.json`, `tsconfig.json`) — ou seja, nem o caminho está certo
nem o build existe.

### Ação

1. Trocar por caminho relativo ao repositório: `./supabase-mcp-server/dist/index.js`.
2. Buildar o servidor e confirmar que gera `dist/`; se não houver script de build,
   adicionar.
3. Registrar em `docs/agents/skills.md` como buildar — hoje não está documentado.
4. Conferir se `chrome-devtools` (`@chrome-devtools/mcp-server`) é o pacote correto
   e ainda é usado.

### Verificação

MCP conecta em sessão nova e uma query de schema responde.

### Risco

Baixo.

---

## A7 — `deploy:safe` quebrado 🟡

### Evidência

`package.json`: `"deploy:safe": "node headroom-filter.js python3 deploy_vps.py"`.
`deploy_vps.py` não existe em nenhum lugar do repositório.

### Ação

Remover o script do `package.json`. O deploy real é a skill `deploy-vps`, que não
usa esse caminho. Se a intenção é manter o filtro de output, recriar apontando para
o fluxo real — mas não deixe script que falha na primeira linha.

### Verificação

`rg "deploy:safe" .` só encontra referências em documentação histórica.

### Risco

Nenhum — o script não funciona hoje.

---

## A8 — `catalogo`: diretórios duplicados 🟡

### Evidência

```
src/features/catalogo/context/    cliente-ativo.tsx
src/features/catalogo/contexts/   EmpresaCrudContext.tsx  TabIconsContext.tsx  language-context.tsx
src/features/catalogo/styles/     (nenhum .ts/.tsx)
```

Duas pastas para a mesma coisa, e nomes de arquivo em 2 convenções dentro de
`contexts/` (`PascalCase` e `kebab-case`).

### Ação

1. Mover `context/cliente-ativo.tsx` → `contexts/`, atualizar os imports
   (`rg "catalogo/context/" src`; há pelo menos `ClienteAtivoBar.tsx` usando `../context/cliente-ativo`).
2. Apagar `context/`.
3. Remover `styles/` se estiver realmente vazio, ou versionar o que deveria haver lá.
4. Padronizar nomes em `contexts/` conforme `.agents/rules/nomenclature.yaml`.

### Verificação

`npm run check:types && npm run build`.

### Risco

Baixo.

---

## A9 — Eventos de `cadastros` com 3 convenções 🟢

### Evidência

Os 17 eventos de `src/features/cadastros/module.ts` misturam:

- `entidade.acao` — `cadastro.criado`, `documento.aprovado`
- snake sem ponto — `dados_enviados`, `em_analise`, `em_correcao`, `aprovado`, `reprovado`
- prefixo `botao_*` — `botao_aprovar`, `botao_reprovar`, `botao_corrigir`, `botao_compartilhar_link`
- duplicata — `link.gerado` **e** `link_gerado`

As permissões do módulo também são as únicas sem prefixo (`aprovar_cadastro`,
`ver_relatorios`, …).

### Ação

Renomear evento é **breaking change**: `webhooks`, `notificacoes_modelos` e
`conectores_api` guardam `evento_key` como texto.

1. `SELECT DISTINCT modulo_key, evento_key FROM webhooks UNION ALL ...` (as 3 tabelas)
   para saber quais chaves estão realmente configuradas.
2. Só a duplicata `link.gerado`/`link_gerado` é candidata a correção imediata:
   manter a com configuração ativa, remover a outra do `events[]`.
3. Para as demais: **não renomear**. Documentar como legado (já está na
   `## Notas` de `src/features/cadastros/AGENTS.md`) e aplicar `entidade.acao`
   apenas em evento novo.
4. Se a padronização for decidida, ela exige migration de dados nas 3 tabelas
   + janela de deploy — trate como projeto próprio, não como limpeza.

### Verificação

Disparar cada evento tocado e confirmar entrega no destino configurado.

### Risco

**Alto se renomear sem o passo 1.** Webhook de cliente para de disparar
silenciosamente — `dispararEventoModulo` retorna sem erro quando não encontra
configuração.

---

## A10 — i18n pela metade 🟢

### Evidência

`i18next` + `react-i18next` instalados, `src/core/i18n` configurado, ~24 arquivos
usando `useTranslation`. O resto da UI tem string PT-BR literal. `catalogo` é o
que mais usa (`t("catalogo.consultant.clearSelection")`).

### Ação

Só faz sentido com decisão de produto: **haverá segundo idioma?**

- **Não** → remover `i18next`, `react-i18next`, `i18next-browser-languagedetector`,
  `src/core/i18n` e converter as ~24 chamadas em texto literal. Reduz bundle e
  remove indireção sem benefício.
- **Sim** → tratar como épico: extrair strings por módulo, um PR por módulo,
  começando por `catalogo` (já parcialmente feito), com lint proibindo string
  literal em JSX nos módulos migrados.

Não deixe no meio: hoje paga o custo das duas opções.

### Verificação

Depende da decisão. Em ambos os casos, `npm run build` e navegação nos módulos tocados.

### Risco

Baixo tecnicamente; a decisão é de produto.

---

## Ordem sugerida de execução

1. **A2** e **A7** — remoções, sem dependência, destravam o sinal de A3.
2. **A3 passo 4** — os 2 casos de segurança real (`catalogo.checkout`,
   `hub.cliente.dashboard.$empresaId`).
3. **A1 passo 0** — a query de schema, em paralelo: é o insumo mais lento e
   bloqueia todo o resto de A1.
4. **A5** e **A6** — config de agente; quanto antes, menos sessão trabalhando com
   as skills erradas.
5. **A3 passos 1-3** — corrigir o checker com o resultado de A2 já aplicado.
6. **A4** e **A8** — arquitetura do `catalogo`, podem ir no mesmo PR.
7. **A1 passos 1-4** — migration + limpeza de código, um módulo por PR.
8. **A9** e **A10** — exigem decisão antes de execução.

Ao fechar cada item, atualizar `docs/agents/debitos.md` e rodar
`node scripts/sync-docs.mjs`.
