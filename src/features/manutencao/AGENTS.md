# AGENTS.md — `manutencao`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Manutenção** — Painel de manutenção de módulos e rotas

Tipo: **registrado** · `key: "manutencao"` · 8 arquivos

## Estrutura

```
src/features/manutencao/
├── ManutencaoContext.tsx
├── hooks.ts
├── index.ts
├── module.ts
├── onboarding.tsx
├── types.ts
├── components/  (1 arquivo)
└── services/  (1 arquivo)
```

## Rotas

`/global/manutencao` · `/empresa/manutencao`

## Eventos

`manutencao.ativada` · `manutencao.desativada`

Disparos no código: 2. Sempre `dispararEventoModulo("manutencao", <evento>, payload).catch(() => {})`.

## Registro

- Abas de config: `eventos`

## Tabelas e RPCs

Tabelas: `modulos_manutencao`

<!-- /sync:fatos -->

## Notas

- Sem `permissions.ts`: o acesso é por `RequireSuperAdmin` em `/global/manutencao`. Controla flags em `modulos_manutencao` que bloqueiam rotas de outros módulos.
