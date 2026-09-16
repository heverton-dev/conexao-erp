import type { DespesaTipo } from "~/features/despesas/types";

export interface OcrResultado {
  texto: string;
  valor?: number;
  data?: string;
  descricao?: string;
  tipoSugestao?: string;
}

let cacheWorker: any = null;

async function getWorker() {
  if (!cacheWorker) {
    const { createWorker } = await import("tesseract.js");
    cacheWorker = await createWorker("por");
  }
  return cacheWorker;
}

export async function lerComprovante(
  file: File,
  tipos: DespesaTipo[],
): Promise<OcrResultado> {
  const worker = await getWorker();
  const { data } = await worker.recognize(file);

  const texto = data.text;
  const parsed = parseRecibo(texto);
  const tipoSugestao = matchTipo(texto, tipos);

  return {
    texto,
    valor: parsed.valor,
    data: parsed.data,
    descricao: parsed.descricao,
    tipoSugestao,
  };
}

export function destroyWorker() {
  if (cacheWorker) {
    cacheWorker.terminate();
    cacheWorker = null;
  }
}

function parseRecibo(texto: string) {
  return {
    valor: extractValor(texto),
    data: extractData(texto),
    descricao: extractDescricao(texto),
  };
}

function extractValor(texto: string): number | undefined {
  const patterns = [
    /VALOR\s*R?\$?\s*([\d.]+,\d{2})/i,
    /TOTAL\s*R?\$?\s*([\d.]+,\d{2})/i,
    /R\$\s*([\d.]+,\d{2})/i,
    /(\d{1,3}(?:\.\d{3})+,\d{2})/,
    /([\d]+,\d{2})/,
  ];

  for (const pattern of patterns) {
    const match = texto.match(pattern);
    if (match) {
      const raw = match[1].replace(/\./g, "").replace(",", ".");
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) return val;
    }
  }
  return undefined;
}

function extractData(texto: string): string | undefined {
  const match = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    const [_, d, m, y] = match;
    const date = new Date(`${y}-${m}-${d}`);
    if (!isNaN(date.getTime())) return `${y}-${m}-${d}`;
  }

  const match2 = texto.match(/(\d{2})\/(\d{2})\/(\d{2})/);
  if (match2) {
    const [_, d, m, y] = match2;
    const year = "20" + y;
    const date = new Date(`${year}-${m}-${d}`);
    if (!isNaN(date.getTime())) return `${year}-${m}-${d}`;
  }

  return undefined;
}

function extractDescricao(texto: string): string | undefined {
  const lines = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 3 &&
        !/^[\d\s]+$/.test(l) &&
        !/R\$/.test(l) &&
        !/TOTAL/i.test(l) &&
        !/CNPJ/i.test(l) &&
        !/CPF/i.test(l) &&
        !/IE/i.test(l) &&
        !/COO/i.test(l) &&
        !/CCF/i.test(l),
    );

  return lines.length > 0 ? lines[0].substring(0, 80) : undefined;
}

export function matchTipo(
  texto: string,
  tipos: DespesaTipo[],
): string | undefined {
  if (tipos.length === 0) return undefined;

  const lower = texto.toLowerCase();
  const typeKeywords: { id: string; words: string[] }[] = tipos.map((t) => ({
    id: t.id,
    words: expandKeywords(t.nome),
  }));

  let bestScore = 0;
  let bestId: string | undefined;

  for (const { id, words } of typeKeywords) {
    const score = words.reduce(
      (acc, w) => acc + (lower.includes(w) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestScore > 0 ? bestId : undefined;
}

function expandKeywords(nome: string): string[] {
  const base = nome.toLowerCase().split(/\s+/);

  const mapa: Record<string, string[]> = {
    alimentação: [
      "restaurante",
      "lanche",
      "almoço",
      "jantar",
      "café",
      "pizza",
      "hamburguer",
      "comida",
      "refeição",
      "marmita",
      "quentinha",
      "bebida",
      "água",
      "refrigerante",
      "suco",
      "self-service",
    ],
    combustível: [
      "posto",
      "gasolina",
      "combustível",
      "álcool",
      "etanol",
      "diesel",
      "gnv",
      "shell",
      "petrobras",
      "ipiranga",
      "raizen",
      "abastecimento",
    ],
    hospedagem: [
      "hotel",
      "hospedagem",
      "pousada",
      "motel",
      "hostel",
      "airbnb",
      "pernoite",
      "dormir",
    ],
    transporte: [
      "uber",
      "táxi",
      "taxi",
      "pedágio",
      "estacionamento",
      "passagem",
      "ônibus",
      "metro",
      "locomoção",
      "deslocamento",
      "99",
    ],
    material: [
      "papelaria",
      "escritório",
      "material",
      "caneta",
      "papel",
      "impressão",
      "cartucho",
      "toner",
    ],
    saúde: [
      "farmácia",
      "remédio",
      "medicamento",
      "drogasil",
      "drogão",
      "pague menos",
      "saúde",
      "médico",
      "consulta",
      "exame",
      "hospital",
      "clínica",
    ],
    manutenção: [
      "mecânico",
      "borracheiro",
      "oficina",
      "conserto",
      "reparo",
      "manutenção",
      "peça",
    ],
    comunicação: [
      "tim",
      "vivo",
      "claro",
      "oi",
      "recarga",
      "telefone",
      "celular",
      "internet",
      "telefonia",
    ],
  };

  for (const [cat, keywords] of Object.entries(mapa)) {
    if (nome.includes(cat) || nome.includes(cat.replace(/[éê]/g, "e"))) {
      return [...new Set([...base, ...keywords])];
    }
  }

  return base;
}
