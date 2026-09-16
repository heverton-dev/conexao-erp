# AGENTS.md — `funis`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Funis** — Gerenciamento de funis Kanban para fluxos de trabalho

Tipo: **registrado** · `key: "funis"` · 50 arquivos

## Estrutura

```
src/features/funis/
├── diagnostic.ts
├── index.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── types.ts
├── components/  (17 arquivos)
├── hooks/  (11 arquivos)
├── services/  (13 arquivos)
└── utils/  (3 arquivos)
```

## Rotas

`/funis/dashboard` · `/funis/funil/$funilId` · `/funis/templates` · `/funis/funil/$funilId/automations`

## Permissões

`funis_ver_dashboard` · `funis_criar_funil` · `funis_editar_funil` · `funis_excluir_funil` · `funis_gerir_colunas` · `funis_gerir_tarefas` · `funis_compartilhar` · `funis_ver_relatorios`

## Eventos

`funil.criado` · `funil.atualizado` · `funil.excluido` · `tarefa.criada` · `tarefa.concluida` · `tarefa.movida` · `tarefa.comentario_adicionado` · `tarefa.anexo_adicionado` · `tarefa.label_adicionado` · `tarefa.atrasada` · `funil.criado_template` · `automacao.executada`

Disparos no código: 11. Sempre `dispararEventoModulo("funis", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor` · `tecnologia`
- Abas de config: `geral` · `permissoes` · `credenciais` · `eventos`
- Flags: `hasDiagnostico` · `hasCredentialScopes` · `hasDesignConfig`
- Rota de design: `/empresa/funis/design`

## Tabelas e RPCs

Tabelas: `funis` · `funis_anexos` · `funis_automacoes` · `funis_colunas` · `funis_colunas_modelo` · `funis_comentarios` · `funis_etiquetas` · `funis_etiquetas_tarefa` · `funis_log_atividades` · `funis_modelos` · `funis_notificacoes` · `funis_permissoes` · `funis_recorrentes` · `funis_tarefas` · `funis_tarefas_modelo` · `profiles` · `users`

<!-- /sync:fatos -->

## Notas

- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real — a migration `20260721000000` nunca foi aplicada. Não remova o campo dos payloads até a fase 1 rodar. Ver `docs/agents/drift-banco-vs-migrations.md`.
