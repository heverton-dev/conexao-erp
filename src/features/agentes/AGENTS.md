# AGENTS.md — `agentes`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Agentes IA** — Crie e gerencie agentes inteligentes para seus modulos

Tipo: **registrado** · `key: "agentes-ia"` · 18 arquivos

## Estrutura

```
src/features/agentes/
├── index.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── security.ts
├── service.ts
├── types.ts
├── components/  (10 arquivos)
└── hooks/  (1 arquivo)
```

## Rotas

`/empresa/agentes` · `/global/agentes`

## Permissões

`agentes_ver` · `agentes_criar` · `agentes_editar` · `agentes_excluir` · `agentes_testar` · `agentes_provedores_gerenciar`

## Eventos

`agente.criado` · `agente.editado` · `agente.testado` · `agente.ativado` · `provedor.criado` · `provedor.editado` · `provedor.excluido`

Disparos no código: 3. Sempre `dispararEventoModulo("agentes-ia", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `tecnologia`
- Abas de config: `geral` · `provedores` · `permissoes` · `eventos`

## Tabelas e RPCs

Tabelas: `agentes_conversas` · `agentes_ia` · `agentes_knowledge_docs` · `agentes_knowledge_tabelas` · `agentes_usage_log` · `provedores_ia`

<!-- /sync:fatos -->

## Notas

- `agentes_usage_log` foi criada depois da migration `20260721000000` e **mantém `empresa_id`** — é exceção consciente à regra single-tenant.
- Chaves de provedor de IA ficam em `provedores_ia`; `security.ts` cuida do tratamento. Nunca hardcode credencial.
