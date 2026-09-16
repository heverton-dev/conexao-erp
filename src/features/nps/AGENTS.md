# AGENTS.md — `nps`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**NPS** — Pesquisas de satisfação e Net Promoter Score

Tipo: **registrado** · `key: "nps"` · 48 arquivos

## Estrutura

```
src/features/nps/
├── NpsBackground.tsx
├── diagnostic.ts
├── index.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── theme.ts
├── types.ts
├── components/  (29 arquivos)
├── hooks/  (3 arquivos)
└── services/  (8 arquivos)
```

## Rotas

`/nps` · `/nps/survey` · `/nps/dashboard` · `/nps/pesquisas` · `/nps/preview` · `/nps/relatorios`

## Permissões

`nps_ver_dashboard` · `nps_ver_respostas` · `nps_gerenciar_perguntas` · `nps_gerenciar_webhooks` · `nps_excluir_respostas` · `nps_ver_relatorios` · `nps_exportar_dados`

## Eventos

`nps.resposta_recebida` · `nps.detrator_detectado` · `nps.pesquisa_enviada`

Disparos no código: 3. Sempre `dispararEventoModulo("nps", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor` · `tecnologia`
- Abas de config: `geral` · `permissoes` · `credenciais` · `eventos`
- Flags: `hasDiagnostico` · `hasCredentialScopes` · `hasDesignConfig`
- Rota de design: `/empresa/nps/design`

## Tabelas e RPCs

Tabelas: `dashboard_perfis` · `empresas` · `nps_perguntas` · `nps_perguntas_pesquisa` · `nps_relatorios_envio` · `nps_respostas` · `nps_webhook_config`

<!-- /sync:fatos -->

## Notas

- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real — a migration `20260721000000` nunca foi aplicada. Não remova o campo dos payloads até a fase 1 rodar. Ver `docs/agents/drift-banco-vs-migrations.md`.
