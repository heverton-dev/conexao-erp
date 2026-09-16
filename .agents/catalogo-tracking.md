# TRACKING — Módulo Catálogo

**Data Início:** 2026-07-20
**Status Geral:** ✅ Concluído

---

## Legenda

| Símbolo | Significado |
|---------|------------|
| `[ ]` | Não iniciado |
| `[/]` | Em progresso |
| `[x]` | Concluído |
| `[!]` | Bloqueado / problema |

---

## Fase 1: LIMPEZA

| # | Tarefa | Status | Observação |
|---|--------|--------|------------|
| 1.1 | Deletar registros `catalogo_ips_conexoes` | [x] | Tabela já vazia (0 registros) |
| 1.2 | Deletar registros `catalogo_ips_familias` | [x] | Tabela já vazia (0 registros) |
| 1.3 | Deletar registros `catalogo_ips_linhas` | [x] | Tabela já vazia (0 registros) |
| 1.4 | Deletar registros `catalogo_implantes` | [x] | Tabela já vazia (0 registros) |
| 1.5 | Deletar registros `catalogo_categorias` | [x] | Tabela já vazia (0 registros) |
| 1.6 | Verificar limpeza completa | [x] | Todas as 11 tabelas do catálogo verificadas - 0 registros |

---

## Fase 2: ACESSO

| # | Tarefa | Status | Observação |
|---|--------|--------|------------|
| 2.1 | Acessar rota `/catalogo/admin/implantes` | [x] | Rota existe, build OK |
| 2.2 | Verificar permissões e layout | [x] | RequirePermission + EmpresaCrudGuard configurados |

---

## Fase 3: FRONTEND e LÓGICA (Cadastro via Modais)

| # | Tarefa | Status | Observação |
|---|--------|--------|------------|
| 3.1 | Cadastrar Conexão via modal | [x] | OK - cascade Categoria→Conexão inserido |
| 3.2 | Cadastrar Família via modal | [x] | OK - Família com FK conexao_id |
| 3.3 | Cadastrar Linha via modal | [x] | OK - Linha com FK familia_id |
| 3.4 | Cadastrar Implante via modal | [x] | OK - Implante com FK linha_id + campos obrigatórios |

---

## Fase 4: BANCO DE DADOS (Verificação)

| # | Tarefa | Status | Observação |
|---|--------|--------|------------|
| 4.1 | Verificar tabela `catalogo_ips_conexoes` | [x] | Estrutura OK, 1 registro persistido |
| 4.2 | Verificar tabela `catalogo_ips_familias` | [x] | Estrutura OK, FK conexao_id presente |
| 4.3 | Verificar tabela `catalogo_ips_linhas` | [x] | Estrutura OK, FK familia_id presente |
| 4.4 | Verificar tabela `catalogo_implantes` | [x] | Estrutura OK, cascade completo verificado |

---

## Fase 5: FRONTEND e RENDERIZAÇÃO

| # | Tarefa | Status | Observação |
|---|--------|--------|------------|
| 5.1 | Verificar renderização `/catalogo/implantes` | [x] | Rota com 4 etapas DrillDown OK |
| 5.2 | Verificar DrillDown | [x] | Componente funcional com navegação |
| 5.3 | Verificar Ficha técnica Implantes | [x] | ProductSheet com suporte implantes/abutments/kits |

---

## Fase 6: CORREÇÕES (pós-verificação)

| # | Tarefa | Status | Observação |
|---|--------|--------|------------|
| 6.1 | Corrigir EMPRESA_ID no .env | [x] | Alterado para `6687e2f0-...` (CONEXÃO IMPLANTES) |
| 6.2 | Corrigir RLS para single-empresa | [x] | `FOR ALL USING (true) WITH CHECK (true)` em 12 tabelas |
| 6.3 | Re-inserir dados na empresa correta | [x] | Cascade completo: Categoria→Conexão→Família→Linha→Implante |
| 6.4 | Limpar dados da empresa errada | [x] | Registros da empresa `1a00d0fe-...` removidos |
| 6.5 | Verificar visibilidade dos dados | [x] | Query com anon key retorna 1 implante com joins completos |
