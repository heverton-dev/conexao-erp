# AGENTS.md — `clientes`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/clientes`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/clientes/
└── index.ts
```

## API pública

`listarCadastros` · `buscarCadastro` · `buscarCadastroCompleto` · `deletarCadastro` · `criarCadastro` · `atualizarCadastro` · `aprovarCadastro` · `reprovarCadastro` · `solicitarCorrecao` · `STATUS_LABEL` · `STATUS_COLOR` · `getStatusOrder`

## Tabelas e RPCs

Tabelas: `cadastros` · `cadastros_enderecos` · `cadastros_pf` · `cadastros_pj` · `clientes`

RPCs: `limpar_links_expirados`

<!-- /sync:fatos -->

## Notas

- Fonte canônica de `cadastros`/`cadastros_pf`/`cadastros_pj`/`cadastros_enderecos`. `crm`, `cadastros` e `catalogo` consomem por `~/features/clientes` — não replique query dessas tabelas.
