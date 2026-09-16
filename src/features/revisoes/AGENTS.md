# AGENTS.md — `revisoes`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/revisoes`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/revisoes/
└── index.ts
```

## API pública

`STATUS_REVISAO_LABEL` · `STATUS_REVISAO_COLOR` · `getRevisoes` · `setRevisaoCampo` · `setRevisoesMassa`

## Tabelas e RPCs

Tabelas: `cadastros`

<!-- /sync:fatos -->

## Notas

- Guarda o estado de revisão **por campo** do cadastro (`setRevisaoCampo`, `setRevisoesMassa`), consumido pelo fluxo de correção de `cadastros`.
