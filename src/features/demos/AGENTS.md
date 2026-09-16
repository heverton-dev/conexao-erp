# AGENTS.md — `demos`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. Exporta tipos e funções Supabase por `~/features/demos`, consumido por rotas e outros módulos.

Tipo: **serviço** · 1 arquivo

## Estrutura

```
src/features/demos/
└── index.ts
```

## API pública

`listarLinksTestes` · `criarLinkTeste` · `excluirLinkTeste` · `listarDemoCredentials` · `criarDemoCredential` · `excluirDemoCredential` · `atualizarExpiraLink` · `atualizarInicioPreenchimento` · `resetar2FA`

## Tabelas e RPCs

Tabelas: `cadastros` · `credenciais_demo` · `links_testes`

RPCs: `create_demo_user` · `excluir_usuario_demo`

<!-- /sync:fatos -->

## Notas

- Cria usuários e links de teste descartáveis (`create_demo_user`, `excluir_usuario_demo`). Só deve ser acionado por rota de super admin.
