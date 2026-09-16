---
name: rtk-memory
description: >
  Gerencia aprendizado persistente para evitar repetição de análise. Registra erros
  resolvidos, decisões arquiteturais e padrões descobertos em memória de longo prazo.
  Triggers: "rtk-memory", "registrar erro", "salvar aprendizado", "anotar padrão",
  "rtk scratchpad", "memória persistente", "não esquecer"
---

# RTK Memory

Protocolo de registro de aprendizado persistente. Objetivo: nunca re-analisar o mesmo
erro ou re-descobrir o mesmo padrão.

## Quando registrar

| Situação | O que registrar | Onde |
|----------|----------------|------|
| Bug de compilação resolvido | Causa raiz + fix | `docs/agents/debitos.md` |
| Padrão arquitetural descoberto | Regra + exemplo | `docs/agents/debitos.md` |
| Configuração não óbvia | Chave + valor + por quê | `docs/agents/debitos.md` |
| Erro de runtime recorrente | Sintoma + solução | `docs/agents/debitos.md` |
| Regra específica de um módulo | Regra + por quê | seção `## Notas` do `src/features/<modulo>/AGENTS.md` |
| Decisão de design tomada | Opção escolhida + rejeitada + motivo | Notas da sessão |

## Passo a passo

1. **Detectar**: erros resolvidos, padrões novos, configurações surpresa.
2. **Avaliar**: é duradouro? Vai aparecer de novo? Outro agente precisaria saber?
3. **Registrar**: adicionar em `docs/agents/debitos.md` (armadilha global) ou na
   seção `## Notas` do `AGENTS.md` do módulo (regra local).
4. **Formatar**: usar o template abaixo.
5. **Verificar**: não duplicar entradas existentes.

## Formato de registro

```markdown
### [DATA] Categoria: Título curto
- **Causa**: o que causava o problema
- **Fix**: como foi resolvido
- **Arquivo**: path/para/arquivo.ts:linha
- **Prevenção**: como evitar no futuro
```

### Categorias válidas
- `TIPO`: erros de tipo TypeScript
- `BUILD`: erros de build/bundling
- `RUNTIME`: erros de execução
- `CONFIG`: configurações não óbvias
- `PADRAO`: padrões arquiteturais
- `RLS`: erros de Row Level Security
- `SINGLE-TENANT`: resquícios de `empresa_id`

## Local de escrita

| Escopo | Arquivo |
| --- | --- |
| Armadilha ou débito que afeta o projeto | `docs/agents/debitos.md` |
| Regra de negócio ou pegadinha de um módulo | `## Notas` em `src/features/<modulo>/AGENTS.md` |
| Padrão de código, banco, UI, rota | o doc correspondente em `docs/agents/` |

⚠ **Nunca** escreva dentro de um bloco `<!-- sync:... -->` — `sync-docs` sobrescreve.
O `AGENTS.md` da raiz não tem mais seção de scratchpad.

Exemplo em `docs/agents/debitos.md`:

```markdown
### [2026-08-03] SINGLE-TENANT: insert quebrando em hub_materiais
- **Causa**: service enviava `empresa_id`, coluna removida na migration 20260721000000
- **Fix**: remover o campo do payload
- **Arquivo**: src/features/hub/services/materials.service.ts
- **Prevenção**: grepar a migration antes de assumir que a coluna existe
```

## NUNCA fazer
- NUNCA registrar erros temporários (typos, erros de digitação).
- NUNCA registrar informações que já estão no código (não documentar o óbvio).
- NUNCA alterar registros existentes — apenas adicionar novos.
- NUNCA registrar senhas, tokens ou credenciais.
- NUNCA registrar decisões que são óbvias pelo contexto.
- NUNCA duplicar entrada se similar já existe — atualizar a existente.
- NUNCA usar RTK Memory como substituto para código bem tipado.

## Interação com outras skills
- **pre-flight-check**: erros novos do pre-flight devem ser registrados.
- **caveman**: registrado em formato comprimido.
- **lean-ctx**: padrões descobertos via lean-ctx são registrados.
- **headroom**: erros extraídos via headroom são registrados se novos.
