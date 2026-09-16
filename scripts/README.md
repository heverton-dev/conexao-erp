# Scripts de Desenvolvimento

Scripts organizados por categoria. **NÃO incluir no build/deploy.**

## Estrutura

```
scripts/
├── db/              # Migrações, seeds e checagens de banco
│   ├── apply_migration.mjs
│   ├── _sql.mjs
│   ├── _check_super.mjs
│   ├── seed_nps.ts
│   └── init_mocks.mjs
├── deploy/          # Scripts de deploy
│   ├── deploy_vps.py
│   └── deploy-ssh.mjs
├── exports/         # Exports de dados (JSON, loops)
│   ├── json-exports/
│   └── loops/
├── fix/             # Scripts de fix one-off
│   └── fix-classes.cjs
├── migrate-bubble.mjs
├── migrate-crm.mjs
├── seed-crm.mjs
└── ...
```

## Regras

1. **Credenciais NUNCA hardcoded** — usar variáveis de ambiente ou `.env`
2. **Usar CLI do Supabase** para migrations oficiais (`supabase db push`)
3. **Scripts DB são para desenvolvimento** — não executar em produção
4. **Excluir do .gitignore** se contiver dados sensíveis
