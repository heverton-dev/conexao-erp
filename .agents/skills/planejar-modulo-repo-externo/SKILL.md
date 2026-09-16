---
name: planejar-modulo-repo-externo
description: >
  Analisa um repositório GitHub externo e planeja a integração como módulo
  independente no ERP Odonto. Gera plano completo: análise do repo origem,
  arquitetura do ERP, adaptação de rotas/permittypes, migration de banco
  (sistema single-tenant, sem empresa_id), e passos de implementação.
  DISPARO: quando o usuário fornecer um link de repo externo e pedir para
  criar/planejar um novo módulo no ERP.
---

# Planejar Módulo a partir de Repo Externo

## Regra
Ativar quando o usuário fornecer um repositório GitHub e pedir para planejar
a integração como módulo do ERP Odonto.

## Pré-requisitos
- URL do repositório GitHub do projeto externo
- Nome do módulo (kebab-case)
- O repositório deve conter código funcional (não apenas boilerplate)

## Fluxo

### 1. Explorar o repositório externo
```
webfetch <github-url> → README, estrutura
webfetch <github-url>/tree/main → listing de pastas
```
Identificar:
- Framework usado (React, Next.js, etc.)
- Estrutura de pastas e componentes
- Modelos de dados / tabelas do banco
- Rotas e páginas existentes
- Funcionalidades principais
- Dependências (package.json)

### 2. Explorar a arquitetura do ERP Odonto
Ler os seguintes arquivos para entender o padrão:
- `src/registry/modules.ts` → como módulos são registrados
- `src/features/` → estrutura de um módulo existente (usar cadastros como referência)
- `src/core/permissions/types.ts` → sistema de permissões
- `src/registry/permissions-registry.ts` → registro de permissões
- `AGENTS.md` → diretrizes do projeto (SEMPRE ler)
- `src/routeTree.gen.ts` → árvore de rotas existentes

### 3. Criar plano de implementação
Salvar em `docs-projeto/plano-modulo-<nome>.md` com:

```markdown
# Plano: Módulo <Nome> → ERP-CONEXAO

## Visão Geral
Breve descrição do que o módulo faz

## Análise do Repositório Externo
- Framework original
- Estrutura de pastas
- Tabelas/banco de dados
- Funcionalidades

## Adaptação para o ERP
### Database
- Tabelas a criar (sistema é single-tenant, sem empresa_id)
- Relacionamentos
- RLS policies (padrão atual do projeto: abertas, `USING (true)`)

### Module Registration
- module.ts
- permissions.ts
- types.ts

### Rotas
- Mapeamento de rotas originais → rotas do ERP
- Nav items por perfil (admin, gestor, consultor, distribuidor, cliente)

### Permissões
- Permissões a criar
- Perfis que terão acesso

### Componentes
- Componentes a adaptar/criar
- Componentes do design system a reutilizar

## Passos de Implementação
1. Criar branch `feat/modulo-<nome>`
2. Criar estrutura do módulo
3. Criar tabelas no banco
4. Implementar services
5. Implementar páginas
6. Registrar rotas e nav items
7. Testar build
8. Deploy
```

### 4. Executar o plano (quando aprovado)
- Criar branch: `git checkout -b feat/modulo-<nome>`
- Seguir os passos do plano sequencialmente
- Após cada etapa: `npm run build` para validar
- Commit a cada etapa completa

### 5. Validar
- `npm run build` deve passar
- Módulo deve aparecer no registry
- Rotas devem estar acessíveis
- Permissões devem estar configuradas

## Observações
- Tabelas do módulo externo devem ser criadas NO MESMO banco do ERP
- Sistema é single-tenant (empresa_id removido em 20260721000000_remove_empresa_id_all_tables.sql) — NÃO adicionar empresa_id nas tabelas novas
- Seguir padrões de código do AGENTS.md
- Reutilizar componentes do design system existente
- NUNCA usar alertas nativos do navegador
