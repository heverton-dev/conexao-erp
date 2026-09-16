# AGENTS.md — `integracoes`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/integracoes`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/integracoes/
└── index.ts
```

## API pública

`listarIntegracoes` · `salvarIntegracao` · `buscarCepResiliente` · `testarConexaoEvolution`

## Tabelas e RPCs

Tabelas: `config_integracoes`

<!-- /sync:fatos -->

## Notas

- `buscarCepResiliente` faz fallback entre provedores de CEP; use-o em vez de chamar ViaCEP direto.
