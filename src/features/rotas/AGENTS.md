# AGENTS.md — `rotas`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Rotas de Visitas** — Planejamento e execução de rotas de visitas a clientes

Tipo: **registrado** · `key: "rotas"` · 22 arquivos

## Estrutura

```
src/features/rotas/
├── diagnostic.ts
├── index.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── types.ts
├── components/  (6 arquivos)
├── hooks/  (3 arquivos)
├── lib/  (1 arquivo)
└── services/  (6 arquivos)
```

## Rotas

`/rotas` · `/rotas/$id` · `/rotas/design`

## Permissões

`rotas_planejar` · `rotas_executar` · `rotas_configurar` · `rotas_upload_base` · `rotas_ver_relatorios` · `rotas_form_config`

## Eventos

`rota.criada` · `rota.iniciada` · `rota.finalizada` · `visita.registrada`

Disparos no código: 4. Sempre `dispararEventoModulo("rotas", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `consultor` · `tecnologia`
- Abas de config: `geral` · `permissoes` · `eventos`
- Flags: `hasDesignConfig` · `hasDiagnostico`
- Rota de design: `/empresa/rotas/design`

## Tabelas e RPCs

Tabelas: `rotas` · `rotas_clientes` · `rotas_clientes_base` · `rotas_config` · `rotas_form_perguntas` · `rotas_trajetos` · `rotas_visitas`

<!-- /sync:fatos -->

## Notas

- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real — a migration `20260721000000` nunca foi aplicada. Não remova o campo dos payloads até a fase 1 rodar. Ver `docs/agents/drift-banco-vs-migrations.md`.
