# AGENTS.md — `api-connectors`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/api-connectors`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/api-connectors/
└── index.ts
```

## API pública

`listApiConnectors` · `createApiConnector` · `updateApiConnector` · `deleteApiConnector` · `executeApiConnector`

## Tabelas e RPCs

Tabelas: `conectores_api`

RPCs: `executar_api_connector_server`

<!-- /sync:fatos -->

## Notas

- `executeApiConnector` roda a chamada pela RPC `executar_api_connector_server` (server-side, para não expor credencial no browser).
- É o terceiro destino de `dispararEventoModulo` (junto de `webhooks` e `notificacoes_modelos`) — ver `docs/agents/eventos.md`.
