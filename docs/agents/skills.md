# Skills, rules, specs, workflows e MCPs

Tudo vive em `.agents/`. `.claude/` só contém atalhos Windows (`.lnk`) para lá —
**edite sempre em `.agents/`**.

```
.agents/
├── skills/      # 41 skills (SKILL.md por pasta)
├── rules/       # invariantes validáveis (YAML)
├── specs/       # templates de artefato (YAML)
├── workflows/   # encadeamento de skills (YAML)
├── hooks/       # validações pré/pós skill (YAML)
├── commands/    # comandos compostos (MD)
└── docs/        # material de referência (livros, arquitetura)
```

## Rules — `.agents/rules/`

| Rule | Invariante |
| --- | --- |
| `module-autonomy` | módulo não importa internals de outro módulo |
| `modulo-structure` | diretórios e arquivos esperados no módulo |
| `nomenclature` | nomes de arquivo, componente, diretório, rota |
| `permission-conflicts` | permissão única, `snake_case`, prefixo do módulo |
| `route-validation` | path único e módulo registrado antes da rota |
| `type-safety` | `strict` ligado, evitar `any` |
| `economia-tokens` | sempre ativa — ver [tokens.md](tokens.md) |

## Specs — `.agents/specs/`

Templates de `module-definition`, `route-template`, `component-template`,
`crud-service`, `permission-template`. Consulte antes de escrever o artefato à mão.

## Workflows e hooks

Workflows: `criar-modulo-completo`, `adicionar-feature`, `gerar-crud-completo`.
Hooks: `pre/pos-criar-modulo`, `pre/pos-criar-rota`, `pre-gerar-crud` — validam nome
kebab-case, existência do diretório e registro no registry antes de gerar código.

## Subagents — `.claude/agents/`

`fix-triage-analyst` (triagem) → `fix-squad-executor` (correção em lote, paralelo) →
`fix-adversarial-auditor` (auditoria cética do diff). Pipeline descrito em
`docs-projeto/doc-SQUAD-CORRECOES/SPEC.md`; skills correspondentes:
`triagem-erros-massa`, `fix-squad-paralelo`, `auditoria-fix-adversarial`.

## MCPs — `.claude/mcp.json`

| Server | Uso |
| --- | --- |
| `supabase-mcp-server` | SQL, migrations, inspeção de schema (código em `supabase-mcp-server/`) |
| `chrome-devtools` | inspeção do app no browser |

O caminho do `supabase-mcp-server` no `mcp.json` aponta para fora deste repositório —
ver [debitos.md](debitos.md).

## Skills

Fluxo típico: `criar-modulo` → `criar-migration` → `criar-rota` →
`adicionar-permissao` → `gerar-crud`/`gerar-formulario`/`gerar-pagina` →
`criar-design-modulo`/`aplicar-design-modulo` → `validar-modulo` →
`pre-flight-check` → `deploy-vps`.

<!-- sync:skills -->
42 skills em `.agents/skills/`.

| Skill | Para quê |
| --- | --- |
| `adicionar-permissao` | Adiciona permissão ao sistema de permissões do ERP Odonto com validação de naming, verificação de duplicatas, atualização automática de defaults por ambiente e  |
| `ai-agents-mcp` | from mcp.server import Server from mcp.types import Tool, Resource, Prompt import asyncio |
| `ai-engineering` | prompt_few_shot =  Você é um classificador de sentimentos. |
| `aplicar-design-modulo` | Aplica o design system a um módulo inteiro do ERP Odonto a partir de um documento de referência. |
| `auditoria-fix-adversarial` | Audita, de forma adversarial e cética, o resultado de QUALQUER correção em massa (deste squad ou de qualquer outro agente/ferramenta) antes de aceitar está corr |
| `calcular-gastos-sessao` | Calcula e exibe gastos por ação e por sessão de qualquer agente de IA (OpenCode, MimoCode, Antigravity, Codex, Claude Code, Cursor, etc). |
| `clean-architecture` | ┌─────────────────────────────────────┐ │ Círculo mais externo: │ │ Frameworks e Drivers │ │ (Web, DB, UI, External APIs) │ ├─────────────────────────────────── |
| `clean-code` | // ❌ RUIM int d; // passou desde última última última ultima vez? String tmp; bool flag; |
| `criar-componente-modulo` | Cria componente React seguindo padrões shadcn/ui do ERP Odonto. |
| `criar-design-modulo` | Cria a estrutura de configuração de Design System para um módulo existente do ERP Odonto — gera rota /modulo/design e registra hasDesignConfig no module.ts. |
| `criar-form-multitipo` | Cria um FormModal que alterna entre múltiplos sub-formulários conforme um tipo selecionado (ex: catalogo.admin.produtos.ProdutoFormModal alternando entre Abutme |
| `criar-migration` | Cria migration SQL do Supabase seguindo os padrões reais do projeto ERP Odonto: nomenclatura por timestamp, colunas padrão, RLS single-tenant (aberta), tabelas  |
| `criar-modulo` | Cria estrutura completa de um novo módulo no ERP Odonto incluindo: module.ts, permissions.ts, types.ts, service.ts, React Query hooks, testes básicos, barrel ex |
| `criar-rota` | Cria rota protegida no ERP Odonto com RequirePermission, breadcrumbs, lazy loading e validação de path. |
| `deploy-vps` | Deploy workflow completo do ERP Odonto: commit → migration → push → merge → build → deploy. |
| `design-frontend` | Embeleza o frontend de uma rota do ERP Odonto aplicando classes de estilo do design system do dashboard. |
| `documentar-modulo` | Gera documentação completa de um módulo do ERP Odonto incluindo: visão geral, arquitetura, permissões, tipos, operações CRUD, eventos, design system, exemplos d |
| `fable-domain` | Discuss a domain with the user, research it from real sources, then generate a trusted skill bundle for it - a step-by-step workflow with a flowchart, a domain  |
| `fable-judge` | Adversarial verification of finished work. |
| `fable-loop` | End-to-end orchestrated workflow that runs a task the way Fable ran sessions - parallel evidence subagents, one committed plan, surgical execution with an inten |
| `fable-method` | A step-by-step problem-solving loop (classify the ask, define done, gather evidence, decide, act surgically, verify by observation, report outcome-first). |
| `fix-squad-paralelo` | Orquestra a correção paralela de um grande volume de erros já triados em lotes (ver skill triagem-erros-massa) usando a ferramenta Workflow — dispara N agentes  |
| `gerar-crud` | Gera operações CRUD completas com React Query hooks, paginação, ordenação, filtros avançados, validação Zod, tratamento de erros e cache strategies. |
| `gerar-formulario` | Gera formulário React completo com React Hook Form + Zod, validação completa, campos condicionais, máscaras, upload de arquivo e layout responsivo mobile-first. |
| `gerar-modal` | Gera componente Modal/Dialog completo usando shadcn/ui Dialog com variantes (confirm, form, info, warning, danger), scroll obrigatório, keyboard navigation, foc |
| `gerar-pagina` | Gera página React completa com PageHeader, breadcrumbs automáticos, layout responsivo mobile-first, tokens do Design System, estados de loading (Skeleton), erro |
| `gerenciar-nav-items` | Gerencia nav items (itens de navegação lateral) de módulos do ERP Odonto. |
| `google-maps-platform` | Integracao com Google Maps Platform — mapas, geocoding, rotas e places |
| `i-have-adhd` | Shape output for a reader with ADHD: lead with the next action, number multi-step work, restate state across turns, suppress tangents, give specific time estima |
| `implementar-mapa-dark-premium` | Implementar Mapa Dark Premium |
| `implementar-plan` | Salva o plano, cria branch de trabalho e executa a implementação completa. |
| `loop` | Conduz uma entrevista curta e ESCREVE a especificação de um loop de agente, num documento <nome>-loop.md no padrão da Loop Library (gatilho + meta + verificação |
| `master-skill` | Orquestrador mestre de frameworks e skills de desenvolvimento com IA. |
| `modulo-modelo` | Shape output for ADHD (lead with next action, number steps, restate state, suppress tangents, time estimates, visible wins) AND build/refactor ERP modules using |
| `planejar-modulo-repo-externo` | Analisa um repositório GitHub externo e planeja a integração como módulo independente no ERP Odonto. |
| `pre-flight-check` | Validação local obrigatória antes de qualquer modificação estrutural, refatoração ou deploy. |
| `responsividade` | Analisa a responsividade de um módulo do ERP Odonto, gera documentação completa e IMPLEMENTA o plano de correção sem quebrar o funcionamento do módulo ou aplica |
| `rtk-memory` | Gerencia aprendizado persistente para evitar repetição de análise. |
| `self-learning` | Capture a hard-won golden path from the current session as a reusable Agent Skill, so future sessions start already knowing it. |
| `sync-docs` | Sincroniza a documentação de agentes com o código: preenche os blocos <!-- sync:... |
| `triagem-erros-massa` | Transforma uma lista plana de erros (tsc --noEmit, eslint, uma suíte de testes quebrada em massa, etc.) espalhados por dezenas ou centenas de arquivos em lotes  |
| `validar-modulo` | Valida integridade completa de um módulo do ERP Odonto incluindo: estrutura, registro, rotas, tipos, eventos, permissões, design system, mobile-first, acessibil |
<!-- /sync:skills -->
