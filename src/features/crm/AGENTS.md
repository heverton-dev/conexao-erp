# AGENTS.md — `crm`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**CRM** — Gestão de relacionamento com clientes e equipe comercial

Tipo: **registrado** · `key: "crm"` · 19 arquivos

## Estrutura

```
src/features/crm/
├── diagnostic.ts
├── index.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── components/  (8 arquivos)
├── hooks/  (1 arquivo)
└── lib/  (5 arquivos)
```

## Rotas

`/crm/dashboard` · `/crm/carteira` · `/crm/pipeline` · `/crm/tarefas` · `/crm/metricas` · `/crm/cliente/$id` · `/crm/equipe` · `/crm/bi` · `/crm/transferencia` · `/crm/transferencia/consultores` · `/crm/diretoria` · `/crm/diretoria/gestor/$id` · `/crm/aceitar-convite/$token`

## Permissões

`crm_dashboard` · `crm_carteira` · `crm_pipeline` · `crm_tarefas` · `crm_cliente_detalhe` · `crm_equipe` · `crm_metricas` · `crm_bi` · `crm_transferencia` · `crm_diretoria`

## Eventos

`cliente.criado` · `cliente.transferido` · `visita.realizada` · `tarefa.excluida` · `consultor.transferido`

Disparos no código: 3. Sempre `dispararEventoModulo("crm", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor` · `tecnologia`
- Abas de config: `geral` · `permissoes` · `eventos`
- Flags: `hasDiagnostico` · `hasDesignConfig`
- Rota de design: `/empresa/crm/design`

## Tabelas e RPCs

Tabelas: `clientes` · `pipeline_estagios` · `tarefas` · `usuarios` · `visitas`

<!-- /sync:fatos -->

## Notas

- `clientes` é compartilhada com o módulo-serviço `~/features/clientes` e com `cadastros`. Não crie leitura duplicada: consuma o barrel `~/features/clientes`.
- `/crm/aceitar-convite/$token` e `/crm/cliente/$id` são rotas com param; `aceitar-convite` roda sem permissão de CRM (fluxo de convite).
