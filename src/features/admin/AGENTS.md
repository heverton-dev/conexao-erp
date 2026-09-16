# AGENTS.md — `admin`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/admin`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/admin/
└── index.ts
```

## API pública

`getAppConfig` · `updateAppConfig` · `listMockCredentials` · `createMockCredential` · `updateMockCredential` · `toggleMockCredential` · `deleteMockCredential`

## Tabelas e RPCs

Tabelas: `config_app` · `credenciais_mock`

<!-- /sync:fatos -->

## Notas

- `config_app` guarda configuração global do app e `credenciais_mock` credenciais falsas de teste. Acesso só por rota de super admin.
