# AGENTS.md — `empresas`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Empresa** — Gerenciamento de empresas

Tipo: **registrado** · `key: "empresas-core"` · 6 arquivos

## Estrutura

```
src/features/empresas/
├── components.tsx
├── diagnostic.ts
├── index.ts
├── module.ts
├── onboarding.tsx
└── services/  (1 arquivo)
```

## Rotas

`/global/empresas` · `/empresa` · `/empresa/design` · `/empresa/despesas-config` · `/empresa/clientes-import` · `/empresa/rotas/config` · `/empresa/nps/tema` · `/empresa/nps/design` · `/empresa/linktree/tema` · `/empresa/linktree/design` · `/empresa/hub/chatbot` · `/empresa/hub/design` · `/empresa/mapas/design` · `/empresa/funis/design` · `/empresa/crm/design` · `/empresa/cadastros/design` · `/empresa/cadastros/formulario` · `/empresa/despesas/design` · `/empresa/rotas/design` · `/empresa/onboarding` · `/empresa/agentes` · `/global/agentes`

## Registro

- Abas de config: `empresa-banco` · `empresa-dados` · `empresa-permissoes` · `empresa-design` · `empresa-branding` · `formularios`
- Flags: `hasDiagnostico` · `hasDesignConfig` · `hasFormulario`
- Rota de design: `/empresa/design`

## Tabelas e RPCs

Tabelas: `empresas` · `profiles`

<!-- /sync:fatos -->

## Notas

- Módulo de **infra-UI**, não de negócio: não tem `permissions.ts` nem eventos. Re-exporta `~/shared/empresas` — é a única bridge de módulo para `shared/` permitida pela regra de isolamento.
- Concentra as 22 rotas `/empresa/*` e `/global/empresas` de configuração **de outros módulos** (`/empresa/crm/design`, `/empresa/nps/tema`, `/empresa/hub/chatbot`, …). Alterar layout ou guard aqui afeta a tela de configuração de vários módulos ao mesmo tempo.
- A rota de design de um módulo é declarada no `designRoute` do `module.ts` **dele**, não aqui.
