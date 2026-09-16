# AGENTS.md — `precadastro`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/precadastro`, consumido por rotas e outros módulos.

Tipo: **serviço** · 3 arquivos

## Estrutura

```
src/features/precadastro/
├── PreCadastroComOnboarding.tsx
├── PrevisualizacaoPage.tsx
└── onboarding.tsx
```

<!-- /sync:fatos -->

## Notas

- Fluxo **público** (sem login): `/pre-cadastro/$token`. Componentes de página moram aqui, não em `src/routes/`, por causa do onboarding embutido.
