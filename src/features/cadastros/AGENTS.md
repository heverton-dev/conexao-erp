# AGENTS.md — `cadastros`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Cadastros** — Gestao de cadastro de clientes PF/PJ

Tipo: **registrado** · `key: "cadastros"` · 18 arquivos

## Estrutura

```
src/features/cadastros/
├── diagnostic.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── components/  (5 arquivos)
└── import/  (9 arquivos)
```

## Rotas

`/cadastros/dashboard` · `/cadastros/solicitacoes` · `/cadastros/clientes` · `/cadastros/consultor` · `/cadastros/relatorios` · `/cadastros/previsualizacao` · `/global/acoes` · `/empresa/tema`

## Permissões

`ver_todos_cadastros` · `ver_relatorios` · `visualizar_documento` · `aprovar_cadastro` · `reprovar_cadastro` · `solicitar_correcao_cadastro` · `aprovar_documento` · `reprovar_documento` · `solicitar_correcao_documento` · `aprovar_campo` · `reprovar_campo` · `solicitar_correcao_campo` · `gerenciar_credenciais` · `gerenciar_credenciais_admin` · `excluir_cadastro` · `gerenciar_config` · `gerar_links`

## Eventos

`cadastro.criado` · `cadastro.aprovado` · `cadastro.reprovado` · `documento.aprovado` · `documento.reprovado` · `link.gerado` · `link_gerado` · `dados_enviados` · `em_analise` · `em_correcao` · `aprovado` · `reprovado` · `botao_compartilhar_link` · `botao_aprovar` · `botao_reprovar` · `botao_corrigir` · `criacao_credencial` · `clientes.importados`

Disparos no código: 1. Sempre `dispararEventoModulo("cadastros", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor` · `tecnologia` · `suporte`
- Abas de config: `geral` · `permissoes` · `credenciais` · `eventos` · `laboratorio` · `acoes` · `formularios` · `apis`
- Flags: `hasFormulario` · `hasDiagnostico` · `hasDesignConfig`
- Rota de design: `/empresa/cadastros/design`

## Tabelas e RPCs

Tabelas: `cadastros` · `clientes`

## ⚠ Imports cross-feature (violação a corrigir)

- `diagnostic.ts → clientes`

<!-- /sync:fatos -->

## Notas

- Os 17 eventos são a **união de três famílias intencionais** — não é bagunça:
  1. `entidade.acao` (6): `cadastro.criado/aprovado/reprovado`, `documento.aprovado/reprovado`, `link.gerado` — convenção padrão do projeto.
  2. **Status do cadastro** (6): `link_gerado`, `dados_enviados`, `em_analise`, `em_correcao`, `aprovado`, `reprovado` — espelham os valores da coluna `status` de `clientes`/`cadastros` e o catálogo `EVENTOS_STATUS_CHANGE` de `~/core/services/webhooks`. O nome **é** o valor do status, de propósito.
  3. **Ação de botão** (5): `botao_compartilhar_link/aprovar/reprovar/corrigir`, `criacao_credencial` — espelham `EVENTOS_BUTTON_ACTION`.
- ⚠ `link.gerado` **não é duplicata** de `link_gerado`: o primeiro é `button_action` (clique em gerar link), o segundo é `status_change` (cadastro entrou no status `link_gerado`, usado em ~20 pontos do código). Não unifique.
- Evento **novo** usa `entidade.acao`. Renomear os existentes é breaking change: `webhooks`, `notificacoes_modelos` e `conectores_api` guardam `evento_key` como texto, e `dispararEventoModulo` falha em silêncio quando não encontra configuração.
- As permissões são as únicas do projeto **sem prefixo de módulo** (`aprovar_cadastro`, `ver_relatorios`, …). Permissão nova segue o padrão global `cadastros_*`.
- Fluxo de aprovação é compartilhado com os módulos-serviço `documentos` e `revisoes` (aprovação por campo/documento).
