# AGENTS.md — `mapas`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Mapas** — Mapas interativos de presença comercial

Tipo: **registrado** · `key: "mapas-interativos"` · 11 arquivos

## Estrutura

```
src/features/mapas/
├── diagnostic.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── types.ts
├── components/  (4 arquivos)
├── constants/  (1 arquivo)
└── hooks/  (1 arquivo)
```

## Rotas

`/mapas` · `/mapas/distribuidores` · `/mapas/consultores` · `/mapas/gestao` · `/mapas/insights` · `/mapas/gestao/distribuidores` · `/mapas/gestao/consultores`

## Permissões

`mapas_ver_mapa_publico` · `mapas_gerir_distribuidores` · `mapas_gerir_consultores` · `mapas_ver_insights` · `mapas_gerir_webhooks`

## Eventos

`mapas.distribuidor.criado` · `mapas.distribuidor.atualizado` · `mapas.distribuidor.excluido` · `mapas.consultor.criado` · `mapas.consultor.atualizado` · `mapas.consultor.excluido` · `mapas.estado.clicado` · `mapas.pin.clicado`

Disparos no código: 6. Sempre `dispararEventoModulo("mapas-interativos", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor`
- Abas de config: `geral` · `permissoes` · `eventos`
- Flags: `hasDiagnostico` · `hasDesignConfig`
- Rota de design: `/empresa/mapas/design`

## Tabelas e RPCs

Tabelas: `mapas_consultores` · `mapas_distribuidores`

<!-- /sync:fatos -->

## Notas

- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real. Sai na fase 2, depois de o banco ser reconciliado — ver `docs/agents/drift-banco-vs-migrations.md`. Não use em código novo.
