# AGENTS.md — `credenciais`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/credenciais`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/credenciais/
└── index.ts
```

## API pública

`listarCredenciais` · `listarCredenciaisPorEmpresa` · `criarCredencial` · `toggleCredencial` · `deletarCredencial` · `atualizarCredencial`

## Tabelas e RPCs

Tabelas: `credenciais`

<!-- /sync:fatos -->

## Notas

- Credenciais de acesso por escopo. `listarCredenciaisPorEmpresa` é resquício multi-tenant: em código novo use `listarCredenciais`.
- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real — a migration `20260721000000` nunca foi aplicada. Não remova o campo dos payloads até a fase 1 rodar. Ver `docs/agents/drift-banco-vs-migrations.md`.
