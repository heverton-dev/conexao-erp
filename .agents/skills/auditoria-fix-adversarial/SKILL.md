---
name: auditoria-fix-adversarial
description: >
  Audita, de forma adversarial e cética, o resultado de QUALQUER correção em
  massa (deste squad ou de qualquer outro agente/ferramenta) antes de aceitar
  "está corrigido" como verdade — procura deleções de arquivo não autorizadas,
  atalhos de tipo (as any/@ts-ignore/@ts-expect-error), testes enfraquecidos,
  renomes de export propagados de forma inconsistente, regras específicas do
  projeto violadas (empresa_id reintroduzido, window.confirm/alert/prompt) e
  regressões de comportamento invisíveis ao type-check (via baseline de teste
  com git stash). Trigger: "auditar correções", "verificar se teve gambiarra",
  "validar fix antes de reportar pronto", "isso realmente funcionou?", "confere
  esse diff antes de eu confiar". USE SEMPRE depois de qualquer workflow/agente
  que tenha editado múltiplos arquivos em paralelo — nunca aceite "o comando
  passou" como prova suficiente.
---

# Auditoria Adversarial de Correções

Fase 4 do pipeline "Squad de Correção" (`docs-projeto/doc-SQUAD-CORRECOES/SPEC.md`).
Esta skill nasceu de um incidente real: um workflow de 30 agentes zerou 794
erros de type-check com sucesso, mas um dos agentes tinha **deletado 7
arquivos de UI** em vez de corrigi-los — o próprio harness sinalizou isso como
"SECURITY WARNING", mas só foi pego porque a auditoria rodou depois. Sem essa
etapa, o relatório final teria dito "tudo certo".

**Postura**: um relatório de "concluído" é um conjunto de alegações, não
evidência. Nada é aceito como verdade sem ser observado diretamente.

## Checklist (rodar nesta ordem, cada item é obrigatório)

### 1. `git status --porcelain` — deleções e arquivos novos não pedidos

```bash
git status --porcelain
```

- Toda linha `D ` (deletado) exige investigação: o arquivo era realmente
  morto/não usado (confirme com `grep -rln` pelo nome dele em todo o repo,
  excluindo ele mesmo), ou foi um atalho para fazer o erro desaparecer? Se for
  atalho: `git restore --source=HEAD -- <arquivo>` e resolva a causa raiz de
  verdade (ex.: instalar a dependência que faltava, não estava lá).
- Toda linha `??` (novo, não rastreado) precisa fazer sentido no escopo pedido
  (ex.: um `.d.ts` de ambient types para um pacote sem tipos — legítimo; um
  arquivo de config alterando comportamento de build — suspeito).

### 2. Grep por atalhos de tipo/teste no diff inteiro

```bash
git diff -- . ':!package-lock.json' | grep -nE "^\+.*(as any|@ts-ignore|@ts-expect-error|\.skip\(|\.only\(|eslint-disable)"
```

Todo hit precisa de contexto lido antes de julgar. `as any` forçando
deliberadamente um input inválido num teste de validação é legítimo; `as any`
escondendo um tipo real quebrado em código de produção não é. Leia as linhas
ao redor (`-B10 -A3`) antes de decidir.

### 3. Renomes/refactors propagados de forma consistente

Se algum export mudou de nome ou assinatura (comum quando uma dependência
externa muda de API — ex.: `createServerFn().middleware()` passou a exigir
`createMiddleware()` em vez de função solta), confirme TODOS os consumidores:

```bash
grep -rln "<nome_antigo>" src --include=*.ts --include=*.tsx
```

Zero hits do nome antigo (fora do próprio arquivo que definiu a mudança) e
todos os usos do nome novo consistentes = ok. Um hit esquecido = quebra em
runtime que o type-check pode não pegar se o arquivo não fizer parte do
build/teste rodado.

### 4. Regras específicas do projeto (adapte para o seu repo)

- `grep` por `empresa_id` no diff **não é** automaticamente violação — alguns
  módulos (ex.: `hub`, `agentes_usage_log`) legitimamente ainda usam. Leia o
  contexto: é um campo pré-existente no `types.ts`/schema real do módulo, ou
  foi introduzido do zero por um agente que não sabia da migration
  single-tenant?
- `window.confirm|alert|prompt` novo é sempre proibido neste projeto — usar
  `AlertDialog`/`Dialog` de `~/components/ui/`.
- `dispararEventoModulo` tem 3 argumentos, não 4 — se aparecer uma chamada com
  4 args sendo "corrigida" para 3, isso é o fix certo, não um bug novo.

### 5. Baseline de teste real (o passo que type-check sozinho não cobre)

Type-check limpo não garante que o comportamento não mudou. Compare contra o
estado antes da correção:

```bash
git status --porcelain   # confirme árvore rastreável antes de stash
git stash push -u -m "antes-do-fix"
npm run test > /tmp/baseline_test.log 2>&1
git stash pop
npm run test > /tmp/after_test.log 2>&1

grep -E "^ FAIL" /tmp/baseline_test.log | sed -E 's/^ FAIL[^|]*\|[0-9]+\| //' | sort -u > /tmp/baseline_fails.txt
grep -E "^ FAIL" /tmp/after_test.log    | sed -E 's/^ FAIL[^|]*\|[0-9]+\| //' | sort -u > /tmp/after_fails.txt

comm -13 /tmp/baseline_fails.txt /tmp/after_fails.txt   # TEM que ser vazio (nenhuma falha NOVA)
comm -23 /tmp/baseline_fails.txt /tmp/after_fails.txt   # o que foi corrigido de bônus
```

Se `comm -13` devolver qualquer linha, isso é uma regressão real introduzida
pela correção — precisa ser resolvida antes de reportar sucesso, mesmo que o
type-check/build estejam limpos.

### 6. Arquivos gerados que não são regenerados automaticamente

Alguns arquivos "gerados" (ex.: `routeTree.gen.ts` do TanStack Router neste
projeto — não há plugin de codegen no `vite.config.ts`, é mantido à mão) podem
ficar dessincronizados de features novas. Se um erro aponta pra um desses,
confirme se existe uma fonte real (ex.: um arquivo de rota) que existe mas não
foi registrado — o fix é sincronizar manualmente, não é um erro de tipo
isolado.

### 7. Build + comando de verificação final, de novo

Depois de qualquer correção feita durante a própria auditoria (restaurar
arquivo, sincronizar gerado), rode tudo de novo:

```bash
npm run check:types   # ou o comando original do baseline
npm run build
```

A auditoria só está completa quando estes dois rodam limpos **depois** de
qualquer correção aplicada nesta fase, não antes.

## Veredito final

Reporte no formato:

- **VERIFIED** — toda alegação relevante reproduzida, nenhuma fraude
  encontrada.
- **VERIFIED WITH CAVEATS** — o trabalho está sólido; liste exatamente o que
  não pôde ser re-testado e qualquer resíduo menor.
- **REFUTED** — uma alegação falhou ao ser reproduzida, ou uma fraude foi
  encontrada: nomeie a alegação exata, mostre a evidência que contradiz, e
  proponha o menor fix possível.

Nunca amenize um REFUTED para soar mais educado, e nunca infle um caveat menor
para VERIFIED WITH CAVEATS para parecer mais rigoroso do que é.
