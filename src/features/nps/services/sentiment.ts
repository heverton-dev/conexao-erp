const POSITIVE = [
  "otimo",
  "ótimo",
  "excelente",
  "maravilhoso",
  "perfeito",
  "gostei",
  "amei",
  "bom",
  "boa",
  "ágil",
  "agil",
  "rapido",
  "rápido",
  "eficiente",
  "recomendo",
  "satisfeito",
  "satisfeita",
  "feliz",
  "parabens",
  "parabéns",
  "top",
  "show",
  "atencioso",
  "atenciosa",
  "cordial",
  "educado",
  "educada",
  "pontual",
  "qualidade",
  "confianca",
  "confiança",
  "fácil",
  "facil",
  "super",
];

const NEGATIVE = [
  "ruim",
  "péssimo",
  "pessimo",
  "horrível",
  "horrivel",
  "demora",
  "demorado",
  "demorou",
  "atrasou",
  "atraso",
  "atrasado",
  "difícil",
  "dificil",
  "problema",
  "problemas",
  "erro",
  "errado",
  "errada",
  "falha",
  "falhou",
  "insatisfeito",
  "insatisfeita",
  "caro",
  "cara",
  "lento",
  "lenta",
  "reclamação",
  "reclamacao",
  "reclamar",
  "pior",
  "fraco",
  "fraca",
  "desorganizado",
  "desorganizada",
  "descaso",
  "mal",
  "péssima",
  "pessima",
  "enrolação",
  "enrolacao",
];

const NEGATORS = ["não", "nao", "nunca", "nem", "jamais"];

export type Sentiment = "positivo" | "neutro" | "negativo";

export function classificarSentimento(text: string): Sentiment {
  if (!text) return "neutro";
  const tokens = text
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõúüç\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;
  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    const prev = tokens[i - 1];
    const negated = prev && NEGATORS.includes(prev);
    if (POSITIVE.includes(w)) score += negated ? -1 : 1;
    else if (NEGATIVE.includes(w)) score += negated ? 1 : -1;
  }

  if (score > 0) return "positivo";
  if (score < 0) return "negativo";
  return "neutro";
}

export function extrairTextoTudo(r: any): string {
  const TEXT_KEYS = [
    "nps_comment",
    "melhoria_atendimento",
    "expansao_produtos",
    "oportunidade",
    "pergunta_final",
  ];
  const parts: string[] = [];
  TEXT_KEYS.forEach((k) => {
    if (typeof r[k] === "string" && r[k].trim()) parts.push(r[k]);
  });
  if (r.dynamic_answers && typeof r.dynamic_answers === "object") {
    Object.values(r.dynamic_answers).forEach((v) => {
      if (typeof v === "string" && v.trim()) parts.push(v);
    });
  }
  return parts.join(" ");
}
