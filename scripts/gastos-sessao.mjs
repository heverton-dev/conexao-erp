import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonlPath = join(__dirname, "..", ".agents", "session-cost.jsonl");

if (!existsSync(jsonlPath)) {
  console.log("Nenhum registro de gastos encontrado.");
  console.log("O arquivo .agents/session-cost.jsonl ainda não foi criado.");
  process.exit(0);
}

const lines = readFileSync(jsonlPath, "utf-8").trim().split("\n").filter(Boolean);
const entries = lines.map(l => JSON.parse(l));

const sessionFilter = process.argv[2] || null;

const sessions = {};
let totalGeral = 0;
let totalTokensIn = 0;
let totalTokensOut = 0;

for (const e of entries) {
  if (sessionFilter && e.session_id !== sessionFilter) continue;
  if (!sessions[e.session_id]) sessions[e.session_id] = { actions: [], total: 0, tokensIn: 0, tokensOut: 0 };
  sessions[e.session_id].actions.push(e);
  sessions[e.session_id].total += e.cost || 0;
  sessions[e.session_id].tokensIn += e.tokens_in || 0;
  sessions[e.session_id].tokensOut += e.tokens_out || 0;
  totalGeral += e.cost || 0;
  totalTokensIn += e.tokens_in || 0;
  totalTokensOut += e.tokens_out || 0;
}

const usdToBrl = 5.50;

function fmtBRL(usd) {
  return `R$ ${(usd * usdToBrl).toFixed(4)}`;
}

function fmtUSD(usd) {
  return `$${usd.toFixed(4)}`;
}

const sessionKeys = Object.keys(sessions);

console.log("=".repeat(50));
console.log("  GASTOS POR SESSÃO");
console.log("=".repeat(50));

if (sessionFilter) console.log(`Filtro: session_id = ${sessionFilter}`);

for (const sid of sessionKeys) {
  const s = sessions[sid];
  const shortId = sid.length > 12 ? sid.slice(0, 12) + "…" : sid;
  console.log(`\n📁 Sessão: ${shortId} (${s.actions.length} ações)`);
  console.log(`   Tokens: ${s.tokensIn.toLocaleString()} in / ${s.tokensOut.toLocaleString()} out`);
  console.log(`   Custo: ${fmtUSD(s.total)} / ${fmtBRL(s.total)}`);
  console.log(`   Modelo: ${s.actions[0].model || "N/A"}`);

  if (s.actions.length <= 5) {
    for (const a of s.actions) {
      const act = (a.action || "?").padEnd(20);
      console.log(`   ├─ ${act} ${fmtUSD(a.cost)} / ${fmtBRL(a.cost)}`);
    }
  }
}

console.log("\n" + "-".repeat(50));
console.log(`📊 TOTAL GERAL: ${fmtUSD(totalGeral)} / ${fmtBRL(totalGeral)}`);
console.log(`   Tokens: ${totalTokensIn.toLocaleString()} in / ${totalTokensOut.toLocaleString()} out`);
console.log(`   Sessões: ${sessionKeys.length}`);
console.log("=".repeat(50));
