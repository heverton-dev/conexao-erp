---
name: sync-docs
description: >
  Sincroniza a documentação de agentes com o código: preenche os blocos
  <!-- sync:... --> do AGENTS.md e de docs/agents/, gera o AGENTS.md de cada
  módulo e mantém CLAUDE.md/GEMINI.md como stubs de redirecionamento.
  Preserva todo texto escrito à mão.
triggers:
  - "sincronizar docs"
  - "atualizar AGENTS.md"
  - "sync docs"
  - "atualizar documentação"
---

# Sync Docs — ERP Conexão

## Quando usar

Depois de criar/remover módulo, rota, permissão, evento, tabela ou skill.
Antes de commit e de deploy. Sempre que o `--check` falhar no pre-flight.

## Comandos

```bash
node scripts/sync-docs.mjs           # aplica
node scripts/sync-docs.mjs --check   # exit 1 se desatualizado
```

## Modelo: marcador, não template

O script **não** regenera arquivo inteiro. Ele só reescreve o conteúdo entre
marcadores. Tudo fora deles é escrito à mão e nunca é sobrescrito.

| Arquivo | Bloco | Conteúdo gerado |
| --- | --- | --- |
| `AGENTS.md` | `sync:modulos` | tabela de módulos (tipo, nome, contagens) |
| `docs/agents/modulos.md` | `sync:modulos` | mesma tabela, links relativos |
| `docs/agents/skills.md` | `sync:skills` | tabela de skills + descrição |
| `src/features/<m>/AGENTS.md` | `sync:fatos` | estrutura, rotas, permissões, eventos, registro, submódulos, tabelas/RPCs, violações cross-feature |

Fontes: `module.ts`, `permissions.ts`, `.from("...")`/`.rpc("...")` nos arquivos do
módulo, `index.ts` (API pública dos módulos-serviço) e `.agents/skills/*/SKILL.md`.

## O que é preservado

- Todo texto fora dos marcadores em `AGENTS.md` e em `docs/agents/*.md`.
- A seção `## Notas` de cada `src/features/<modulo>/AGENTS.md` — é onde ficam as
  regras de negócio e armadilhas do módulo. **Escreva ali, nunca dentro do bloco de fatos.**

## Stubs de redirecionamento

O script garante que estes arquivos contenham só um `@AGENTS.md`:
`CLAUDE.md`, `GEMINI.md`, `.gemini/GEMINI.md` e, em cada módulo,
`CLAUDE.md` e `GEMINI.md`. Não escreva conteúdo neles — vai ser sobrescrito.

## Cuidado

Editar dentro de um bloco `<!-- sync:... -->` é trabalho perdido: a próxima
execução apaga. Conteúdo novo vai fora do bloco, ou em `docs/agents/`.
