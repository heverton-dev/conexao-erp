# AGENTS.md — `documentos`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/documentos`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/documentos/
└── index.ts
```

## API pública

`getTipoLabel` · `STATUS_DOC_LABEL` · `STATUS_DOC_COLOR` · `uploadDocumento` · `listarDocumentos` · `aprovarDocumento` · `reprovarDocumento` · `solicitarCorrecaoDocumento` · `reverterDocumento` · `DOCS_PF_REQUIRED` · `DOCS_PJ_REQUIRED` · `DOC_STATUS_LABEL` · `DOC_STATUS_COLOR` · `determinarDocStatus` · `getDocumentosStatus` · `getDocumentosStatusMap` · `setDocumentosMassa`

## Tabelas e RPCs

Tabelas: `documentos`

<!-- /sync:fatos -->

## Notas

- Define os documentos obrigatórios (`DOCS_PF_REQUIRED`, `DOCS_PJ_REQUIRED`) e o status derivado (`determinarDocStatus`). Consumido pelo fluxo de aprovação de `cadastros`.
