# AGENTS.md — `dashboard`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/dashboard`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/dashboard/
└── onboarding.tsx
```

<!-- /sync:fatos -->

## Notas

- Só passos de onboarding (`DASHBOARD_ONBOARDING_STEPS`). O dashboard renderizado é o de cada módulo (`/cadastros/dashboard`, `/crm/dashboard`, …).
