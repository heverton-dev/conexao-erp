---
name: fix-squad-paralelo
description: >
  Orquestra a correção paralela de um grande volume de erros já triados em
  lotes (ver skill triagem-erros-massa) usando a ferramenta Workflow — dispara
  N agentes fix-squad-executor em paralelo (um por lote), verifica o resultado
  de forma central rodando o comando de erro + build completos de novo, e
  itera automaticamente sobre o que sobrou até zerar ou estagnar.
  Trigger: "corrigir todos os erros", "rodar squad de correção", "fix em massa",
  "corrigir tudo em paralelo", "workflow de correção de bugs". IMPORTANTE — só
  invoque a ferramenta Workflow real se o usuário pediu explicitamente
  orquestração multi-agente/workflow, ou se "ultracode" estiver ativo na sessão;
  fora disso, siga o mesmo roteiro manualmente com Agent/Task pontual em vez de
  Workflow.
---

# Fix Squad Paralelo

Parte 2-3 do pipeline "Squad de Correção" (`docs-projeto/doc-SQUAD-CORRECOES/SPEC.md`).
Pressupõe que a triagem (skill `triagem-erros-massa`) já rodou e existem
`<scratch>/groups/<g>.files` + `<scratch>/groups/<g>.errs` para cada grupo.

**Depois desta fase, a auditoria adversarial (skill `auditoria-fix-adversarial`)
é obrigatória — nunca declare "corrigido" só porque este workflow terminou sem
erro.** Um workflow real desta mesma família já produziu, nesta base de código,
um agente que deletou 7 arquivos em vez de corrigir — o workflow "verde" não
detectou isso sozinho, só a auditoria posterior pegou.

## Passo 1 — Montar o script do Workflow

Estrutura (ver `references/workflow-template.js` para o esqueleto completo
comentado):

```js
export const meta = {
  name: 'fix-squad-<dominio>',
  description: '...',
  phases: [{ title: 'Fix round 1' }, { title: 'Verify round 1' }, /* ... */],
}

const GROUPS1 = [ /* {key, label} — um por grupo da triagem */ ]

phase('Fix round 1')
const round1 = await parallel(
  GROUPS1.map(g => () => agent(fixPrompt(g), {
    label: `fix:${g.key}`,
    agentType: "fix-squad-executor",   // subagent dedicado — já embute as regras da seção 2
    schema: FIX_SCHEMA,
  }))
)

phase('Verify round 1')
const verify1 = await agent(verifyPrompt(1), { schema: VERIFY_SCHEMA })
```

O prompt de cada `agent()` do round 1 só precisa dizer **qual grupo** (paths
para `.files`/`.errs`) — as regras de como corrigir já estão no subagent
`fix-squad-executor`, não repita.

## Passo 2 — Verificação central entre rounds

Um único agente (não um dos executores) roda o comando completo de novo +
build, e devolve via schema estruturado:

```js
VERIFY_SCHEMA = {
  errorCount: number,
  buildPassed: boolean,
  buildErrorSummary: string,
  remainingFiles: [{ file, count }],  // TODOS os arquivos com erro restante
}
```

Importante: o script do Workflow **não tem acesso a filesystem/bash direto** —
toda essa informação tem que vir do retorno do `agent()`, nunca de "o script
lê o log sozinho".

## Passo 3 — Iterar sobre o que sobrou

Se `errorCount > 0`:
1. Reagrupe `remainingFiles` dinamicamente (heurística simples: 3º segmento do
   path vira chave de grupo — `src/features/X/...` → `features_X`).
2. Rode outro round de `agent()`s, mas agora cada um roda o comando **ele
   mesmo**, filtrado pelos próprios arquivos (`grep -F`), porque os números de
   linha podem ter mudado desde o round anterior.
3. Verifique de novo.
4. **Pare em ~3 rounds no máximo**, ou antes se um round não reduzir o total
   em relação ao anterior (evita repetir o mesmo resultado indefinidamente).
   Reporte honestamente o que sobrou — não force uma correção de baixa
   confiança só para zerar o contador.

## Passo 4 — Resiliência a limite de sessão

Workflows longos podem esbarrar em limite de uso da API no meio da execução.
Isso não invalida o que já rodou — o Workflow cacheia por `(prompt, opts)`:

```
Workflow({ scriptPath, resumeFromRunId })
```

reaproveita os agentes que já terminaram e só reexecuta o resto. Confirme que
o horário de reset já passou antes de tentar de novo (ex.: `TZ="America/Sao_Paulo"
date`) — não fique reenviando enquanto o limite ainda está ativo.

## Quando NÃO usar a ferramenta Workflow de verdade

Se o usuário não pediu orquestração multi-agente explicitamente e "ultracode"
não está ativo na sessão: siga a mesma lógica (agrupar → corrigir por grupo →
verificar central → iterar) mas com você mesmo corrigindo grupo por grupo, ou
com chamadas pontuais de `Agent`/`Task`, sem o overhead/custo de token de um
Workflow completo. O valor desta skill é o *método*, não necessariamente a
ferramenta.

## Saída esperada

- `errorCount` final (idealmente 0)
- `buildPassed`
- Lista do que ficou pendente, se algo ficou, com o motivo reportado por cada
  agente (nunca "não sei", sempre "tentei X, o problema real é Y, precisa de
  decisão sobre Z")

Essa saída alimenta a auditoria adversarial (próxima fase) — não pule direto
para "reportar concluído".
