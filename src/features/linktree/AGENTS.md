# AGENTS.md — `linktree`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**LinkTree** — Cartoes digitais e QR Codes dos colaboradores

Tipo: **registrado** · `key: "linktree"` · 31 arquivos

## Estrutura

```
src/features/linktree/
├── diagnostic.ts
├── index.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── types-empresa.ts
├── types.ts
├── components/  (20 arquivos)
├── hooks/  (2 arquivos)
├── lib/  (1 arquivo)
└── services/  (1 arquivo)
```

## Rotas

`/linktree/dashboard` · `/linktree/empresa`

## Permissões

`lt_ver_dashboard` · `lt_criar_colaborador` · `lt_editar_colaborador` · `lt_excluir_colaborador` · `lt_toggle_status` · `lt_ver_link` · `lt_ver_qr` · `lt_baixar_qr` · `lt_gerenciar_tema` · `lt_empresa_ver` · `lt_empresa_editar` · `lt_empresa_ver_analytics` · `lt_empresa_gerar_qr`

## Eventos

`colaborador.criado` · `colaborador.ativado` · `colaborador.inativado`

Disparos no código: 2. Sempre `dispararEventoModulo("linktree", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor` · `tecnologia`
- Abas de config: `geral` · `permissoes` · `credenciais` · `eventos`
- Flags: `hasDiagnostico` · `hasCredentialScopes` · `hasDesignConfig`
- Rota de design: `/empresa/linktree/design`

## Tabelas e RPCs

Tabelas: `credenciais` · `empresas` · `linktree_colaboradores` · `linktree_empresa_clicks` · `linktree_empresa_config` · `linktree_empresa_links` · `linktree_empresa_sections` · `linktree_tema_config`

<!-- /sync:fatos -->

## Notas

- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real — a migration `20260721000000` nunca foi aplicada. Não remova o campo dos payloads até a fase 1 rodar. Ver `docs/agents/drift-banco-vs-migrations.md`.
- `empresas` mantém a coluna.
