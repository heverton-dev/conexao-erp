# Deploy

> **Só executar quando o usuário disser "deploy" ou "/deploy".** Nunca por iniciativa própria.
> O procedimento completo (comandos, rollback, health check) está na skill
> **`deploy-vps`** — não duplicado aqui.

## Fluxo

```
sync-docs → commit → build local → push → merge (se branch) → migrations → deploy VPS
```

Build local **tem que passar** antes do push. Migration que falha aborta o deploy.

## Artefatos

| Item | Valor |
| --- | --- |
| Imagem | `hevertonperes/erp-odonto` (tags `v2.X` + `latest`) |
| Runtime | multi-stage `node:20-alpine` → `nginx:alpine`, serve `dist/` |
| Config nginx | `nginx.conf` |
| Orquestração | `docker-compose.yml` (Portainer/Swarm), service `erp-odonto_app` |

`VITE_*` são **build args**: mudança de env exige rebuild da imagem, não só restart.

## Segredos (`.env`, nunca commitado)

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_EMPRESA_ID`, `VITE_EMPRESA_SLUG`,
`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `DOCKER_HUB_USERNAME`, `DOCKER_HUB_PASSWORD`,
`VPS_IP`, `VPS_USER`, `VPS_PASSWORD`.

## Migrations em produção

Aplicadas por conexão direta (`pg`) contra `supabase_migrations.schema_migrations`,
pulando versões já registradas. Ver a skill para o script.

## Observação

Não existe script npm de deploy — o antigo `deploy:safe` apontava para um
`deploy_vps.py` inexistente e foi removido em 2026-08-03. Use a skill.
