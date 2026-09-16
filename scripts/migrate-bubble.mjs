import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_DIR = resolve(__dirname, "..", "json-exports");
const SQL_PATH = resolve(__dirname, "import-bubble.sql");

if (!existsSync(JSON_DIR)) {
  console.error(`ERRO: Pasta json-exports não encontrada em ${JSON_DIR}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** MD5 → UUID v4-ish (determinístico, só para referência) */
function uuidFrom(str) {
  const hash = createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/** Escapa string para SQL (ou NULL se vazia) */
function esc(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  return `'${String(val).replace(/'/g, "''").trim()}'`;
}

/** "Dec 1, 1997 12:00 am" → "1997-12-01" */
function parseBubbleDate(str) {
  if (!str || str.trim() === "") return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** CPF "123.456.789-09" → "12345678909" */
function cleanCPF(cpf) {
  if (!cpf) return null;
  const cleaned = cpf.replace(/[.\-\s]/g, "").trim();
  return cleaned || null;
}

/** CRO " - SP-164877" → "SP-164877" */
/**        "CRO-MG 28005" → "MG 28005" (remove leading "CRO-" prefix) */
function cleanCRO(cro) {
  if (!cro) return null;
  let c = cro.trim().replace(/\s+/g, " ");
  c = c.replace(/^[\s-]+/, ""); // leading dash + space
  c = c.replace(/^CRO\s*-?\s*/i, ""); // "CRO-MG 28005" → "MG 28005"
  c = c.replace(/^CROSP/i, ""); // "CROSP 149.637" → "149.637"
  c = c.trim();
  return c || null;
}

// ---------------------------------------------------------------------------
// 1. Carrega JSON exports
// ---------------------------------------------------------------------------

console.log("Lendo JSON exports...");

const CADASTROS = JSON.parse(
  readFileSync(resolve(JSON_DIR, "data_type_cadastros.json"), "utf-8"),
);
const PF = JSON.parse(
  readFileSync(resolve(JSON_DIR, "data_type_cadastros_pf.json"), "utf-8"),
);
const PJ = JSON.parse(
  readFileSync(resolve(JSON_DIR, "data_type_cadastros_pj.json"), "utf-8"),
);
const ENDERECOS = JSON.parse(
  readFileSync(
    resolve(JSON_DIR, "data_type_cadastros_enderecos.json"),
    "utf-8",
  ),
);
const DOCUMENTOS = JSON.parse(
  readFileSync(
    resolve(JSON_DIR, "data_type_cadastros_documentos.json"),
    "utf-8",
  ),
);
const EVENTOS = JSON.parse(
  readFileSync(resolve(JSON_DIR, "data_type_eventos.json"), "utf-8"),
);

console.log(`  cadastros:        ${CADASTROS.length}`);
console.log(`  cadastros_pf:     ${PF.length}`);
console.log(`  cadastros_pj:     ${PJ.length}`);
console.log(`  enderecos:        ${ENDERECOS.length}`);
console.log(`  documentos:       ${DOCUMENTOS.length}`);
console.log(`  eventos:          ${EVENTOS.length}`);

// ---------------------------------------------------------------------------
// 2. Monta índices de busca
// ---------------------------------------------------------------------------

const pfByCPF = new Map(); // CPF limpo → PF record
const pfByName = new Map(); // Nome completo → PF record
const dupPF = new Set(); // Nomes duplicados em PF

for (const p of PF) {
  const cpf = cleanCPF(p["03. Número de CPF"]);
  if (cpf) pfByCPF.set(cpf, p);

  const name = (p["01. Nome completo"] || "").trim().replace(/\s+/g, " ");
  if (name) {
    if (pfByName.has(name)) dupPF.add(name);
    else pfByName.set(name, p);
  }
}

const pjByName = new Map(); // Razão Social → PJ record
const dupPJ = new Set();

for (const p of PJ) {
  const name = (p["01. Razão Social"] || "").trim().replace(/\s+/g, " ");
  if (name) {
    if (pjByName.has(name)) dupPJ.add(name);
    else pjByName.set(name, p);
  }
}

// Endereços por código do cliente (A. Cliente)
const enderecoByCliente = new Map();
for (const e of ENDERECOS) {
  const code = (e["A. Cliente"] || "").trim();
  if (code) enderecoByCliente.set(code, e);
}

// ---------------------------------------------------------------------------
// 3. Gera SQL
// ---------------------------------------------------------------------------

const lines = [];

const pad = (n, c = "-") => c.repeat(n);

lines.push(`-- ${pad(42)}`);
lines.push(`-- Migração Bubble → Supabase  |  cadastros`);
lines.push(`-- Gerado em: ${new Date().toISOString()}`);
lines.push(`--`);
lines.push(
  `-- ${CADASTROS.length} cadastros  |  ${PF.length} PF  |  ${PJ.length} PJ`,
);
lines.push(
  `-- ${ENDERECOS.length} endereços  |  ${DOCUMENTOS.length} docs  |  ${EVENTOS.length} eventos`,
);
lines.push(`-- ${pad(42)}`);
lines.push("");
lines.push("BEGIN;");
lines.push("");

// -- 3a. CADASTROS (normalizado: cadastros + PF/PJ/enderecos) -----------------

lines.push(
  "-- ================================================================",
);
lines.push("-- CADASTROS (normalizado)");
lines.push("--   1. cadastros       (mestre)");
lines.push("--   2. cadastros_pf    (pessoa física)");
lines.push("--   3. cadastros_pj    (pessoa jurídica)");
lines.push("--   4. cadastros_enderecos");
lines.push(
  "-- ================================================================",
);
lines.push("");

let countPacientes = 0;
let pfNaoEncontrado = 0;
let pjNaoEncontrado = 0;
let enderecoNaoEncontrado = 0;

for (const cad of CADASTROS) {
  const codigo = (cad["A. Código Cliente"] || "").trim();
  const pfNameRaw = (cad["01. Dados Cadastrais - PF"] || "")
    .trim()
    .replace(/\s+/g, " ");
  const pjNameRaw = (cad["02. Dados Cadastrais - PJ"] || "")
    .trim()
    .replace(/\s+/g, " ");
  const enderecoRef = (cad["03. Dados de Endereço"] || "").trim();
  const colaborador = (cad["C. Colaborador"] || "").trim();

  const isPF = !!(pfNameRaw && !pjNameRaw);
  const isPJ = !!(pjNameRaw && !pfNameRaw);

  // -- match PF/PJ -----------------------------------------------------------

  let nome = pfNameRaw || pjNameRaw;
  let cpf = null;
  let dataNascimento = null;
  let cro = null;
  let croUf = null;
  let razaoSocial = null;
  let nomeFantasia = null;

  if (isPF && pfNameRaw) {
    const pfRecord = pfByName.get(pfNameRaw);
    if (pfRecord) {
      cpf = cleanCPF(pfRecord["03. Número de CPF"]);
      nome =
        (pfRecord["01. Nome completo"] || "").trim().replace(/\s+/g, " ") ||
        nome;
      dataNascimento = parseBubbleDate(pfRecord["01b. Data de Nascimento"]);
      cro = cleanCRO(pfRecord["02. Número do CRO"]);
      croUf = (pfRecord["02b. UF CRO"] || "").trim() || null;
    } else {
      pfNaoEncontrado++;
    }
  }

  if (isPJ && pjNameRaw) {
    const pjRecord = pjByName.get(pjNameRaw);
    if (pjRecord) {
      nome = (pjRecord["01b. Nome Fantasia"] || "").trim() || nome;
      razaoSocial = (pjRecord["01. Razão Social"] || "").trim() || null;
      nomeFantasia = (pjRecord["01b. Nome Fantasia"] || "").trim() || null;
      cro = cleanCRO(pjRecord["02. Número do CRO"]);
      croUf = (pjRecord["02b. UF CRO"] || "").trim() || null;
    } else {
      pjNaoEncontrado++;
    }
  }

  // -- match endereço ---------------------------------------------------------

  let endCode = null; // código de cliente usado no endereço (debug)

  // Tenta pelo campo "03. Dados de Endereço" (que contém o código do cliente)
  const addr =
    enderecoByCliente.get(enderecoRef) || enderecoByCliente.get(codigo);
  if (addr) {
    endCode = addr["A. Cliente"];
  } else {
    enderecoNaoEncontrado++;
  }

  // -- gera cadastro normalizado ------------------------------------------------

  nome = nome.replace(/\s+/g, " ").trim();
  if (!nome) continue;

  const cadId = codigo
    ? uuidFrom(`paciente-${codigo}`)
    : uuidFrom(`paciente-${nome}`);

  // (a) cadastros (mestre)
  const cadCols = ["id", "codigo_cliente", "tipo_pessoa", "observacoes"];
  const cadVals = [
    `'${cadId}'::uuid`,
    esc(codigo),
    esc(isPF ? "PF" : "PJ"),
    esc(`Migrado do Bubble. Colaborador: ${colaborador || "-"}`),
  ];
  if (colaborador) {
    cadCols.push("colaborador");
    cadVals.push(esc(colaborador));
  }

  lines.push(
    `INSERT INTO public.cadastros (${cadCols.join(", ")}) VALUES (${cadVals.join(", ")});`,
  );

  // (b) cadastros_pf
  if (isPF && pfNameRaw) {
    const pfCols = ["cadastro_id", "nome"];
    const pfVals = [`'${cadId}'::uuid`, esc(nome)];
    if (cpf) {
      pfCols.push("cpf");
      pfVals.push(esc(cpf));
    }
    if (dataNascimento) {
      pfCols.push("data_nascimento");
      pfVals.push(`'${dataNascimento}'::date`);
    }
    if (cro) {
      pfCols.push("cro");
      pfVals.push(esc(cro));
    }
    if (croUf) {
      pfCols.push("cro_uf");
      pfVals.push(esc(croUf));
    }
    lines.push(
      `INSERT INTO public.cadastros_pf (${pfCols.join(", ")}) VALUES (${pfVals.join(", ")});`,
    );
  }

  // (c) cadastros_pj
  if (isPJ && pjNameRaw) {
    const pjCols = ["cadastro_id", "razao_social"];
    const pjVals = [`'${cadId}'::uuid`, esc(razaoSocial || nome)];
    if (nomeFantasia) {
      pjCols.push("nome_fantasia");
      pjVals.push(esc(nomeFantasia));
    }
    if (cro) {
      pjCols.push("cro");
      pjVals.push(esc(cro));
    }
    if (croUf) {
      pjCols.push("cro_uf");
      pjVals.push(esc(croUf));
    }
    lines.push(
      `INSERT INTO public.cadastros_pj (${pjCols.join(", ")}) VALUES (${pjVals.join(", ")});`,
    );
  }

  // (d) cadastros_enderecos
  if (addr) {
    const addrCols = ["cadastro_id"];
    const addrVals = [`'${cadId}'::uuid`];
    const cep = (addr["CEP"] || "").trim().replace(/\D/g, "");
    if (cep) {
      addrCols.push("cep");
      addrVals.push(esc(cep));
    }
    const cidade = (addr["CIDADE"] || "").trim();
    if (cidade) {
      addrCols.push("cidade");
      addrVals.push(esc(cidade));
    }
    const bairro = (addr["BAIRRO"] || "").trim();
    if (bairro) {
      addrCols.push("bairro");
      addrVals.push(esc(bairro));
    }
    const comp = (addr["COMPLEMENTO"] || "").trim();
    if (comp) {
      addrCols.push("complemento");
      addrVals.push(esc(comp));
    }
    lines.push(
      `INSERT INTO public.cadastros_enderecos (${addrCols.join(", ")}) VALUES (${addrVals.join(", ")});`,
    );
  }

  countPacientes++;
}

// -- 3b. LEADS (from eventos) ------------------------------------------------

lines.push("");
lines.push(
  "-- ================================================================",
);
lines.push("-- LEADS (importados de eventos)");
lines.push(
  "-- ================================================================",
);
lines.push("");

let countLeads = 0;

for (const evt of EVENTOS) {
  const nome = (evt["nome"] || "").trim().replace(/\s+/g, " ");
  const email = (evt["email"] || "").trim();
  const confirm = (evt["confirmado"] || "").trim().toLowerCase();
  const sorteio = (evt["numero_sorteio"] || "").toString().trim();

  if (!nome || !email) continue;

  const leadId = uuidFrom(`evento-${email}-${nome}`);

  lines.push(
    `INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)`,
  );
  lines.push(`  VALUES (`);
  lines.push(`    '${leadId}'::uuid,`);
  lines.push(`    ${esc(nome)},`);
  lines.push(`    ${esc(email)},`);
  lines.push(`    'Evento Bubble',`);
  lines.push(`    'novo',`);
  lines.push(
    `    ${esc(
      [
        `Importado de evento Bubble.`,
        sorteio ? `Sorteio: ${sorteio}.` : "",
        confirm === "sim" ? "Confirmado." : "Não confirmado.",
      ]
        .filter(Boolean)
        .join(" "),
    )}`,
  );
  lines.push(`  );`);
  countLeads++;
}

// ---------------------------------------------------------------------------

lines.push("");
lines.push("COMMIT;");
lines.push("");

writeFileSync(SQL_PATH, lines.join("\n"), "utf-8");

console.log("");
console.log("=== RESUMO ===");
console.log(`  Pacientes gerados:     ${countPacientes}`);
console.log(`  Leads gerados:         ${countLeads}`);
console.log(`  PF não encontrados:    ${pfNaoEncontrado}`);
console.log(`  PJ não encontrados:    ${pjNaoEncontrado}`);
console.log(`  Sem endereço:          ${enderecoNaoEncontrado}`);
console.log(`  SQL salvo em:          ${SQL_PATH}`);
