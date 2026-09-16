// Esqueleto de referência para a fase "fix-squad-paralelo".
// Baseado no script real usado para zerar 794 erros de tsc --noEmit em
// 171 arquivos (ver docs-projeto/doc-SQUAD-CORRECOES/SPEC.md e RELATORIO.md).
// Copie, preencha GROUPS1 com a saída da skill triagem-erros-massa, e ajuste
// o comando de verificação (check:types/lint/test) para o caso em questão.
// NÃO invoque isso via Workflow real sem opt-in explícito do usuário (ver
// frontmatter da skill fix-squad-paralelo).

export const meta = {
  name: 'fix-squad-generico',
  description: 'Corrige em paralelo um lote grande de erros já triados, com verificacao central e iteracao ate zerar ou estagnar',
  phases: [
    { title: 'Fix round 1' },
    { title: 'Verify round 1' },
    { title: 'Fix round 2' },
    { title: 'Verify round 2' },
    { title: 'Fix round 3' },
    { title: 'Verify round 3' },
  ],
}

// Preencha com a saida da skill triagem-erros-massa: um item por grupo.
const SCRATCH = args.scratchGroups // caminho absoluto para <scratch>/groups
const BASELINE_TOTAL = args.baselineTotal
const VERIFY_COMMAND_HINT = args.verifyCommand || 'npm run check:types' // ou npm run lint, npm run test...

const GROUPS1 = args.groups // [{ key: 'g1', label: '...' }, ...]

const FIX_SCHEMA = {
  type: 'object',
  properties: {
    filesChanged: { type: 'array', items: { type: 'string' } },
    fixesSummary: { type: 'string' },
    pendingErrors: {
      type: 'array',
      items: {
        type: 'object',
        properties: { file: { type: 'string' }, detail: { type: 'string' }, reason: { type: 'string' } },
        required: ['file', 'detail', 'reason'],
      },
    },
  },
  required: ['filesChanged', 'fixesSummary', 'pendingErrors'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    errorCount: { type: 'number' },
    buildPassed: { type: 'boolean' },
    buildErrorSummary: { type: 'string' },
    remainingFiles: {
      type: 'array',
      items: { type: 'object', properties: { file: { type: 'string' }, count: { type: 'number' } }, required: ['file', 'count'] },
    },
  },
  required: ['errorCount', 'buildPassed', 'buildErrorSummary', 'remainingFiles'],
}

function fixPromptRound1(g) {
  return `Corrija os erros do seu grupo. Leia primeiro (ferramenta Read):
1. ${SCRATCH}/${g.key}.files -- lista exata dos arquivos deste grupo
2. ${SCRATCH}/${g.key}.errs -- erros atuais para esses arquivos

Grupo: ${g.label}. So mexa nos arquivos listados. Responda via schema estruturado.`
}

function verifyPrompt(roundNum) {
  return `Rode, na raiz do projeto:
1. \`${VERIFY_COMMAND_HINT}\` -- capture toda a saida.
2. \`npm run build\` -- capture toda a saida.
Conte as linhas de erro, salve a lista completa remanescente em ${SCRATCH}/round${roundNum}_remaining.log,
monte remainingFiles (TODOS os arquivos distintos com erro, com contagem), diga se o build passou.
Responda via schema estruturado.`
}

function bucketize(remainingFiles) {
  const buckets = {}
  for (const { file } of remainingFiles) {
    const parts = file.split('/')
    const key = parts[1] === 'features' && parts[2] ? 'features_' + parts[2] : (parts[1] || 'root') + '_misc'
    if (!buckets[key]) buckets[key] = []
    buckets[key].push(file)
  }
  return Object.entries(buckets).map(([key, files]) => ({ key, files }))
}

function fixPromptDynamic(bucket, roundNum) {
  return `Corrija os erros REMANESCENTES (round ${roundNum}) destes arquivos (edite so estes):
${bucket.files.map(f => '- ' + f).join('\n')}

Primeiro rode \`${VERIFY_COMMAND_HINT}\` e filtre (grep -F) pelos arquivos acima -- os numeros de
linha podem ter mudado. So mexa nos arquivos listados. Responda via schema estruturado.`
}

phase('Fix round 1')
await parallel(GROUPS1.map(g => () => agent(fixPromptRound1(g), {
  label: `fix:${g.key}`, agentType: 'fix-squad-executor', phase: 'Fix round 1', schema: FIX_SCHEMA,
})))

phase('Verify round 1')
let lastVerify = await agent(verifyPrompt(1), { phase: 'Verify round 1', schema: VERIFY_SCHEMA })
log(`Round 1: ${lastVerify.errorCount} erros restantes (baseline ${BASELINE_TOTAL}), build ${lastVerify.buildPassed ? 'OK' : 'FALHOU'}`)

let round = 1
while (lastVerify.errorCount > 0 && round < 3) {
  round++
  const buckets = bucketize(lastVerify.remainingFiles)
  phase(`Fix round ${round}`)
  await parallel(buckets.map(b => () => agent(fixPromptDynamic(b, round), {
    label: `fix:${b.key}`, agentType: 'fix-squad-executor', phase: `Fix round ${round}`, schema: FIX_SCHEMA,
  })))

  phase(`Verify round ${round}`)
  const before = lastVerify.errorCount
  lastVerify = await agent(verifyPrompt(round), { phase: `Verify round ${round}`, schema: VERIFY_SCHEMA })
  log(`Round ${round}: ${lastVerify.errorCount} erros restantes (era ${before}), build ${lastVerify.buildPassed ? 'OK' : 'FALHOU'}`)
  if (lastVerify.errorCount >= before) {
    log(`Sem progresso -- parando (nao repetir o mesmo resultado indefinidamente)`)
    break
  }
}

return {
  baselineErrors: BASELINE_TOTAL,
  finalErrorCount: lastVerify.errorCount,
  buildPassed: lastVerify.buildPassed,
  remainingFiles: lastVerify.remainingFiles,
}
