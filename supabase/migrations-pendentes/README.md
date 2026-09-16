# Migrations pendentes — NÃO aplicar automaticamente

Migrations que **não podem** entrar no fluxo normal de deploy porque exigem que
uma mudança de código seja deployada junto (ou antes). O runner de migrations do
`deploy-vps` varre `supabase/migrations/*.sql` — por isso elas ficam fora daquela
pasta, de propósito.

Mover para `supabase/migrations/` só quando a condição de cada uma for satisfeita.

## `20260803000100_single_tenant_fase2_remover_empresa_id.sql`

Remove `empresa_id` de 63 tabelas.

**Bloqueada por:** o código de `despesas`, `rotas`, `nps`, `linktree`, `funis`,
`credenciais` e `hub` ainda envia/filtra `empresa_id` (~312 ocorrências). Aplicar
antes de limpar o código faz o PostgREST rejeitar insert/update com coluna
inexistente.

**Pré-requisitos, na ordem:**

1. `20260803000000_single_tenant_fase1_relaxar_empresa_id.sql` aplicada
   (já está em `supabase/migrations/` — é segura isolada, só tira `NOT NULL`).
2. `npm run audit:empresa-id` rodado contra o ambiente alvo, com o resultado
   registrado no PR — o repositório não é fonte de verdade sobre quais tabelas
   ainda têm a coluna.
3. Código limpo e deployado, um módulo por PR.

Só então mover esta migration e aplicar. Contexto completo: A1 em
`docs/agents/plano-correcao-auditoria.md`.
