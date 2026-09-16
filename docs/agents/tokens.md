# Eficiência de tokens

Regra base: **descobrir sem ler tudo, escrever pouco, verificar sempre.**
Output continua inteligível e em PT-BR — economia não é desculpa para resposta obscura.

## Ordem de operação

| # | Prática | O que significa |
| --- | --- | --- |
| 1 | grep antes de read | localize por `rg`/`glob`, leia só o trecho relevante |
| 2 | assinatura antes de corpo | descubra a API com grep de `export` antes de abrir o arquivo |
| 3 | comprimir logs | saída > ~7 linhas → filtrar/agregar (`headroom-filter.js`, `npm run test:safe`) |
| 4 | resposta telegráfica | diff cirúrgico, sem recontar o que o usuário já sabe |
| 5 | registrar aprendizado | erro resolvido ou padrão novo → [debitos.md](debitos.md) via `rtk-memory` |
| 6 | pre-flight | `check:types` → `test` → `build` antes de commit/deploy |

## Não fazer

- Abrir arquivo "só pra ver".
- Ler >3 arquivos grandes sem consolidar o achado.
- `read` de diretório grande — use `glob`/`rg`.
- Reler o AGENTS.md dos 25 módulos: leia só o do módulo em que vai mexer.
- Re-analisar armadilha já registrada em [debitos.md](debitos.md).
- Declarar tarefa concluída sem pre-flight.
- Explicação longa sem pedido.

## Extração em massa

Para levantar fatos de muitos arquivos (rotas, permissões, tabelas), escreva um
script Node no scratchpad e leia o resumo — sai muito mais barato que abrir os
arquivos um a um. `scripts/sync-docs.mjs` faz exatamente isso para os AGENTS.md.

## Gastos

Ao final de cada ação, exibir:

```
[💰 Ação: R$ X | Sessão: R$ Y]
```

Cálculo: skill `calcular-gastos-sessao` (histórico em `.agents/session-cost.jsonl`).
