---
name: triagem-erros-massa
description: >
  Transforma uma lista plana de erros (tsc --noEmit, eslint, uma suíte de
  testes quebrada em massa, etc.) espalhados por dezenas ou centenas de
  arquivos em lotes de trabalho paralelizáveis, sem overlap de arquivo entre
  lotes, prontos para serem entregues a agentes de correção em paralelo.
  Trigger: "triar erros em massa", "agrupar arquivos para correção", "categorizar
  erros de type-check", "quebrar esses erros em lotes", "muitos arquivos com erro
  de build/lint". Use SEMPRE que houver mais de ~20 erros espalhados por mais de
  ~10 arquivos diferentes — abaixo disso, corrija direto, a triagem não compensa.
---

# Triagem de Erros em Massa

Parte 1 do pipeline "Squad de Correção" (ver `docs-projeto/doc-SQUAD-CORRECOES/SPEC.md`
para o pipeline completo). Esta skill só faz a triagem — não corrige nada.

## Por que agrupar por diretório/feature, não por contagem

Um agente de correção precisa entender a causa raiz de um erro, e isso quase
sempre exige ler o `types.ts`/`service.ts` do módulo, não só o arquivo com o
erro. Arquivos do mesmo módulo compartilham esse contexto — juntar 5 arquivos
pequenos do mesmo módulo num agente só é mais rápido e mais consistente do que
espalhar cada arquivo para um agente diferente. Agrupar só por "quem tem mais
erro" ignora esse contexto compartilhado e gera retrabalho (dois agentes lendo
o mesmo `service.ts` para descobrir a mesma coisa).

## Passo 1 — Capturar o baseline completo

Nunca trabalhe em cima de saída truncada de terminal.

```bash
npm run check:types > /tmp/baseline_full.log 2>&1   # ou lint, ou test, etc.
grep -c "error TS" /tmp/baseline_full.log            # total real — este é o BASELINE_TOTAL
```

Guarde esse número. Todo relatório final compara contra ele.

## Passo 2 — Listar arquivos únicos com contagem

```bash
grep -oE "^src/[^(]+" /tmp/baseline_full.log | sort | uniq -c | sort -rn
```

Olhe a distribuição: normalmente há uma cauda longa de arquivos com 1-4 erros
e um punhado de arquivos concentrando dezenas (nesta sessão de referência: um
`services.test.ts` sozinho tinha 92 dos 794 erros). Arquivos assim precisam de
grupo próprio, mesmo que só tenham 1 arquivo.

## Passo 3 — Definir os grupos

Regras:
1. **Nunca dois grupos compartilham arquivo.** É isso que garante que os
   agentes de correção possam rodar em `parallel()` sem conflito de edição.
2. Agrupe por prefixo de diretório/feature: `src/features/<modulo>/**` vira um
   grupo (ou mais de um, se o módulo for grande — ex.: separar
   `diagnostic.ts + *.test.ts` do resto do módulo, já que ambos tendem a estar
   "desatualizados" pela mesma razão e se beneficiam do mesmo agente).
3. `src/routes/**`, `src/components/ui/**` (componentes vendorizados tipo
   shadcn) e `src/__tests__/**` fora de um módulo específico geralmente merecem
   grupos próprios, já que não têm um "dono" de feature natural.
4. Tamanho alvo por grupo: 20-70 erros. Grupos muito pequenos (< 5 erros)
   desperdiçam overhead de agente; grupos muito grandes atrasam o round todo
   (o `parallel()` só termina quando o mais lento termina).
5. Se sobrar arquivos que não se encaixam em nenhuma regra clara, agrupe-os
   num grupo "misc" — não deixe nenhum de fora.

## Passo 4 — Escrever os artefatos de cada grupo no scratchpad

Para cada grupo `g`, escreva dois arquivos (no diretório de scratchpad da
sessão, não em `/tmp` genérico — assim outros agentes conseguem ler):

- `<scratch>/groups/<g>.files` — um path relativo por linha
- `<scratch>/groups/<g>.errs` — as linhas de erro brutas do baseline que batem
  com esses arquivos:
  ```bash
  for f in $(cat <scratch>/groups/<g>.files); do
    grep -F "$f(" /tmp/baseline_full.log
  done >> <scratch>/groups/<g>.errs
  ```

## Passo 5 — Validar cobertura (obrigatório)

```bash
# soma de erros em todos os .errs precisa bater EXATAMENTE com o baseline total
cat <scratch>/groups/*.errs | wc -l   # tem que ser == BASELINE_TOTAL
```

Se não bater, algum arquivo do Passo 2 não foi atribuído a nenhum grupo —
volte e corrija antes de prosseguir. Um arquivo esquecido aqui só vai
reaparecer como "erro remanescente" desnecessário na fase de verificação, e
alguém vai perder tempo reinvestigando algo que já estava mapeado.

## Saída esperada

Uma lista de grupos, cada um com:
- nome/label curto (usado como label do agente depois)
- path para `.files`
- path para `.errs`
- contagem de erros

Essa lista alimenta diretamente a skill/fase seguinte (`fix-squad-paralelo`) —
cada grupo vira uma chamada `agent(..., {agentType: "fix-squad-executor"})`
dentro do `parallel()` do Workflow.

## Regra de ouro

Triagem é só matemática de agrupamento — não corrija nada aqui, nem que o erro
pareça óbvio. Misturar triagem com correção tira a garantia de "sem overlap de
arquivo entre grupos" que torna a fase seguinte segura para rodar em paralelo.
