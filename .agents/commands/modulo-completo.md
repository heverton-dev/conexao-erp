---
name: modulo-completo
description: Executa workflow completo para um módulo: Documentação → Design → Responsividade
argument: modulo
---

# Workflow: Módulo Completo

Execute o workflow completo para o módulo **$ARGUMENTS**.

## Sequência de Execução

1. **📄 Documentação** — Gera documentação completa do módulo
2. **🎨 Design Frontend** — Aplica design system em todas as rotas
3. **📱 Responsividade** — Analisa e corrige responsividade

## Execução

Use a tool `workflow` para executar:

```javascript
workflow({
  operation: "run",
  name: "modulo-completo",
  args: { modulo: "$ARGUMENTS" }
})
```

## Resultado

O workflow retorna:
- Status de cada fase (sucesso/falha)
- Arquivos gerados em `docs-projeto/`
- Relatório completo com detalhes

## Arquivos Gerados

- `docs-projeto/doc-modulos/mod-<modulo>/<modulo>.md` — Documentação
- `docs-projeto/doc-responsividade/resp-<modulo>/cadastros.md` — Análise de Responsividade
