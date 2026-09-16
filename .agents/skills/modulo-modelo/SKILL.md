---
name: modulo-modelo
description: >
  Shape output for ADHD (lead with next action, number steps, restate state,
  suppress tangents, time estimates, visible wins) AND build/refactor ERP modules
  using the Catálogo module as the gold-standard structural model.
  Invoke with /modulo-modelo; stays on until "stop modulo-modelo" or "normal mode".
  Use when creating modules, mirroring catalog patterns, or ADHD-friendly module work.
disable-model-invocation: true
license: MIT
metadata:
  hermes:
    tags: [ADHD, Output Style, Catalogo, Module Structure, ERP Odonto]
    category: productivity
    related_skills: [i-have-adhd, criar-modulo, validar-modulo, criar-form-multitipo]
---

# modulo-modelo

Dois eixos, sempre juntos nesta sessão:

1. **Saída ADHD** — o leitor age; não só entende.
2. **Estrutura Catálogo** — ouro do repo em `src/features/catalogo/`. Nunca inventar layout de módulo sem espelhar o catálogo.

**Não substitui** a skill `i-have-adhd`. É skill separada. A original permanece.

## Persistence

Regras valem em **toda** resposta desta sessão. Não expiram com mudança de tópico.

Desligar só quando o leitor disser: `stop modulo-modelo`, `stop adhd mode` ou `normal mode`.
Confirmar em uma linha e voltar ao estilo default.

---

# Eixo A — Saída ADHD

## O que muda na leitura

1. Working memory pequena. O que não está na tela some. Não peça "guarde X na cabeça".
2. Saber ≠ fazer. O gap entre "entendi" e "fiz" é onde o trabalho morre.
3. Começar é o passo mais duro. A primeira ação deve ser óbvia, pequena e agora.
4. Estimativas vagas falham. "Um pouco" e "umas horas" soam iguais.
5. Dopamina escassa. Progresso visível importa.

## Regras de saída

### 1. Lead with the next action

Primeira linha = o que fazer agora. Não contexto. Não plano.

Bad: "Vamos pensar na estrutura do módulo..."
Good: "Criar `src/features/foo/module.ts` copiando o shape de `catalogo/module.ts`."

### 2. Number multi-step tasks

Mais de um passo → lista numerada. Um passo = uma ação limitada. Sem "e depois" duas vezes no mesmo item. Caminho curto terminado > caminho completo abandonado.

### 3. End with one concrete next action

Se sobrou algo, nomeie **UMA** ação de < 2 min.

Bad: "Qualquer dúvida, avisa."
Good: "Next: rodar `npm run check:types` e colar o primeiro erro."

### 4. Suppress tangents

Segundo problema só depois do primeiro. Oferecer como pergunta separada.

### 5. Restate state every turn

Bad: "Pronto, próximo?"
Good: "Step 2/5 done: `permissions.ts` ok. Next: `types/` + barrel. Sigo?"

Use todo/checklist em multi-step: um item por passo, um `in_progress` por vez.

### 6. Give specific time estimates

Bad: "Vai dar um trabalhinho."
Good: "~20 min se só CRUD. Tarde inteira se multi-tipo + N:N como produtos do catálogo."

### 7. Make completed work visible

Bad: "Fiz umas mudanças no módulo..."
Good: "CRUD de `foo` lista em `/foo`. Teste: `npm run dev` → `/foo`."

### 8. Matter-of-fact tone for errors

Sem "Uh oh". Causa + fix.

### 9. Cap lists at 5 items

>5 → split "agora" vs "depois", ou "must" vs "nice".

### 10. No preamble, no recap, no closers

Forbidden: "Great question", "Let me...", "Hope this helps", "Feel free to ask".
Começa na resposta. Termina quando a resposta acabou.

## When to break (eixo A)

1. User pede "explain" / "walk me through" → explicar completo, ainda sem preamble/closer, com headers.
2. Ação destrutiva → confirmar antes.
3. Debug spiral (3 turns "ainda quebrou") → parar de iterar código; nomear hipótese; 1 pergunta diagnóstica.
4. Ambiguidade real → 1 pergunta curta + recomendação.
5. Regra apaga a resposta → task vence; shape fica (ex: opções ranqueadas).
6. Harness do agente manda anunciar tool / executar → harness vence; shape fica.

## Pre-send check

Antes de enviar, apague:

1. Primeira frase se só anuncia o que vai fazer.
2. Última frase se é "anything else?" ou recap.
3. Sidebar "by the way".
4. Hedge vazio ("perhaps", "might"). Incerteza real fica.
5. Idioma figurado → ação literal.

Verify: só 1ª + última linha → (a) o que fazer next, (b) o que acabou de acontecer?

---

# Eixo B — Catálogo como modelo

## Fonte da verdade

```
src/features/catalogo/
```

Antes de criar ou refatorar **qualquer** módulo/feature, abra o equivalente no catálogo.
Não inventar pasta, naming, ou fluxo se o catálogo já resolve.

Mapa detalhado (quando precisar de paths/tabelas/eventos):
→ ler `references/catalogo-mapa.md`

## Árvore canônica (espelhar)

```
src/features/<modulo>/
├── module.ts              # registro: routes, events, nav, permissions, setup()
├── permissions.ts         # chaves tipadas (as const), grupos
├── types/                 # domain types (ou types.ts se módulo pequeno)
│   └── index.ts           # barrel
├── schemas/               # Zod por entidade (quando form/validação)
│   └── index.ts
├── services/              # 1 arquivo por domínio; Supabase aqui
├── hooks/                 # React Query; queryKey namespaced ["<modulo>", ...]
├── components/            # UI do módulo
│   └── admin/             # CRUD admin (se houver)
├── context/ ou contexts/  # só se estado cross-page real
├── import/                # só se importação em massa (pipeline do catálogo)
├── lib/                   # utils locais do módulo
├── styles/                # theme local (se design próprio)
├── index.ts               # barrel exports públicos
├── AGENTS.md              # docs do módulo (Lean)
└── onboarding.tsx         # opcional
```

**Não** copiar cegamente pastas vazias. Só o que o domínio precisa — shape e convenções do catálogo, não o volume.

## Camadas e regras (não negociáveis)

| Camada | Padrão catálogo | Regra |
|---|---|---|
| `module.ts` | `catalogoModule: ModuleDefinition` | `key`, `routes[]`, `events[]` (min 2), `permissions`, `setup()` com `registerPermission` + `registerNavItem` + `registerPermissionDefaults` |
| `permissions.ts` | `CATALOGO_PERMISSIONS as const` | snake_case, prefixo do módulo, `as const`; camadas extras (admin/colab/cliente) se o domínio exigir |
| `types/` | por domínio | sem `empresa_id`; inputs `Criar*` / `Atualizar*` |
| `schemas/` | Zod por entidade | validar form antes de service |
| `services/` | funções exportadas + `MODULO_KEY` | Supabase em service; `dispararEventoModulo(moduloKey, eventoKey, payload).catch(() => {})` — 3 args, never await |
| `hooks/` | `useQuery` / `useMutation` | `queryKey: ["<modulo>", ...]` ; invalidate no `onSuccess`/`onSettled`; toast em erro |
| `components/` | admin forms, Dialog shadcn | **PROIBIDO** `window.confirm/alert/prompt`; **OBRIGATÓRIO** `AlertDialog`/`Dialog` |
| `index.ts` | reexports seletivos | exportar o que outros módulos **não** devem importar de paths internos — mas cross-feature import continua **proibido**; barrel é para o próprio módulo/rotas |
| rotas | `RequirePermission` | toda rota autenticada protegida |
| single-tenant | migration `20260721000000` | **nunca** injetar `empresa_id` (exceção global: `agentes_usage_log`) |

## Ordem de construção (checklist ADHD)

Use esta ordem ao criar módulo do zero. Um step = um check no todo.

1. **Nome + pasta** — `src/features/<key>/` kebab-case
2. **`permissions.ts`** — chaves mínimas (`_ver`, gerenciar…)
3. **`types/`** (+ barrel)
4. **`module.ts`** — events min 2, routes, setup nav
5. **`services/`** — CRUD + eventos fire-and-forget
6. **`hooks/`** — React Query namespaced
7. **`schemas/`** — se houver form
8. **`components/`** — list + form modal (Dialog scroll pattern)
9. **Rotas** — `RequirePermission` + lazy
10. **`index.ts`** + registro no registry/main
11. **Validar** — `npm run check:types` → `npm run test` → `npm run build`

Se o domínio for multi-tipo (vários forms num modal): espelhar
`catalogo/components/admin/produtos/ProdutoFormModal.tsx` + skill `criar-form-multitipo`.

Se for import CSV: espelhar `catalogo/import/` (FileParser → ColumnMapper → RowValidator → Executor).

## Gate "antes de inventar"

Antes de criar arquivo novo de estrutura:

```
1. Existe equivalente em catalogo/? → abrir e copiar shape
2. Existe skill do projeto (criar-modulo, gerar-crud, …)? → seguir skill + shape catálogo
3. Só então criar do zero — e ainda assim no shape da árvore canônica
```

## Anti-padrões (catálogo ensina a evitar)

- Service com lógica de UI / hook com Supabase direto
- `empresa_id` em insert/select novo
- `await dispararEventoModulo(...)` ou 4º argumento
- Import de `~/features/<outro-modulo>/...`
- `window.confirm` em delete
- Nav item sem `permissionCheck` / rota sem `RequirePermission`
- queryKey genérico sem namespace do módulo
- monólito `types.ts` de 2k linhas quando dá para fatiar por domínio (catálogo fatia)

## UI Dialog (obrigatório no modelo)

```
DialogContent: flex flex-col max-h-[85vh] overflow-hidden
Body: overflow-y-auto flex-1 min-h-0
```

## Verificação (done)

Módulo/trecho está "no modelo" quando:

1. Árvore bate com a canônica (só pastas usadas)
2. Events ≥ 2 no `module.ts` + disparos nos services
3. Permissões registradas + defaults por ambiente
4. Zero `empresa_id` novo
5. Zero cross-feature import
6. `check:types` + build passam

---

# Como operar (os dois eixos juntos)

Em cada turno de trabalho de módulo:

1. **Primeira linha** = próxima ação concreta (path/comando).
2. **Passos** numerados, máx 5 visíveis; resto em "depois".
3. **Referência** = path real do catálogo quando copiar shape.
4. **Estado** restated: "Step N/M done: X. Next: Y."
5. **Win** visível ao concluir pedaço.
6. **Pre-send check** do eixo A.

## Exemplo de turno (shape)

```
Criar `src/features/estoque/permissions.ts` no shape de `catalogo/permissions.ts`.

1. Copiar bloco `as const` → trocar prefixo `estoque_`
2. Keys mínimas: ver, gerenciar, dashboard
3. Next file: `types/index.ts`

Step 1/11: pasta ok. ~10 min neste bloco.
```

## Off

User: `stop modulo-modelo` | `normal mode`
Agent: `modulo-modelo off.` → estilo default.
