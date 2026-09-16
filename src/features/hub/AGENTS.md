# AGENTS.md — `hub`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Hub** — Plataforma de treinamento e gamificação

Tipo: **registrado** · `key: "hub"` · 37 arquivos

## Estrutura

```
src/features/hub/
├── constants.ts
├── diagnostic.ts
├── index.ts
├── module.ts
├── onboarding-cliente.tsx
├── onboarding.tsx
├── permissions.ts
├── types.ts
├── components/  (12 arquivos)
├── hooks/  (1 arquivo)
├── lib/  (0 arquivos)
├── pages/  (8 arquivos)
└── services/  (8 arquivos)
```

## Rotas

`/global/hub` · `/empresa/hub/tema` · `/hub/admin/dashboard` · `/hub/admin/materiais` · `/hub/admin/trilhas` · `/hub/admin/analytics` · `/hub/admin/badges` · `/empresa/hub/chatbot` · `/hub/gestor/dashboard` · `/hub/gestor/analytics` · `/hub/gestor/ranking` · `/hub/gestor/conquistas` · `/hub/consultor/dashboard` · `/hub/consultor/ranking` · `/hub/consultor/conquistas` · `/hub/distribuidor/dashboard` · `/hub/distribuidor/conquistas` · `/hub/cliente/dashboard/$empresaId`

## Permissões

`hub_ver_materiais` · `hub_criar_material` · `hub_editar_material` · `hub_excluir_material` · `hub_gerenciar_assets` · `hub_publicar_material` · `hub_ver_acessos_material` · `hub_exportar_materiais` · `hub_ver_trilhas` · `hub_criar_trilha` · `hub_editar_trilha` · `hub_excluir_trilha` · `hub_gerenciar_itens_trilha` · `hub_compartilhar_trilha` · `hub_ver_ranking` · `hub_gerenciar_badges` · `hub_gerenciar_niveis` · `hub_ver_conquistas` · `hub_ver_usuarios` · `hub_editar_usuario` · `hub_aprovar_usuario` · `hub_gerenciar_convites` · `hub_ver_analytics` · `hub_gerenciar_config` · `hub_gerenciar_integracoes` · `hub_gerenciar_chatbot` · `hub_gerenciar_webhooks_hub`

## Eventos

`material.acessado` · `material.concluido` · `trilha.concluida` · `gamification.level_up` · `badge.conquistado` · `convite.gerado` · `usuario.registrado` · `usuario.status_alterado`

Disparos no código: 7. Sempre `dispararEventoModulo("hub", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor` · `tecnologia`
- Abas de config: `geral` · `permissoes` · `credenciais` · `eventos` · `integracoes` · `chatbot`
- Flags: `hasDiagnostico` · `hasCredentialScopes` · `hasDesignConfig`
- Rota de design: `/empresa/hub/design`

## Tabelas e RPCs

Tabelas: `empresas` · `hub_ativos_material` · `hub_colecoes` · `hub_config_chatbot` · `hub_config_sistema` · `hub_emblemas` · `hub_emblemas_usuario` · `hub_integracoes_sistema` · `hub_itens_colecao` · `hub_logs_acesso` · `hub_materiais` · `hub_material_assets` · `hub_niveis_gamificacao` · `hub_progresso_colecao` · `hub_progresso_usuario` · `hub_tokens_convite` · `profiles`

<!-- /sync:fatos -->

## Notas

- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real. Sai na fase 2, depois de o banco ser reconciliado — ver `docs/agents/drift-banco-vs-migrations.md`. Não use em código novo.
