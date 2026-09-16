// Agrupamento de comentários por tema usando match de palavras-chave.

export const THEMES: { id: string; label: string; keywords: string[] }[] = [
  {
    id: "preco",
    label: "Preço",
    keywords: [
      "preço",
      "preco",
      "caro",
      "cara",
      "barato",
      "custo",
      "valor",
      "desconto",
      "promoção",
      "promocao",
    ],
  },
  {
    id: "entrega",
    label: "Entrega & Prazo",
    keywords: [
      "entrega",
      "prazo",
      "atraso",
      "atrasou",
      "demora",
      "demorado",
      "frete",
      "transportadora",
      "rápido",
      "rapido",
    ],
  },
  {
    id: "atendimento",
    label: "Atendimento",
    keywords: [
      "atendimento",
      "atendente",
      "vendedor",
      "vendedora",
      "consultor",
      "consultora",
      "comunicação",
      "comunicacao",
      "cordial",
      "educado",
    ],
  },
  {
    id: "produto",
    label: "Produto & Qualidade",
    keywords: [
      "produto",
      "qualidade",
      "embalagem",
      "avaria",
      "defeito",
      "quebrado",
      "estoque",
      "disponibilidade",
    ],
  },
  {
    id: "pagamento",
    label: "Pagamento & Condições",
    keywords: [
      "pagamento",
      "pagar",
      "boleto",
      "cartão",
      "cartao",
      "pix",
      "parcelamento",
      "parcela",
      "condição",
      "condicao",
      "condições",
      "condicoes",
      "crédito",
      "credito",
    ],
  },
  {
    id: "sistema",
    label: "Sistema & Pedido",
    keywords: [
      "sistema",
      "site",
      "app",
      "plataforma",
      "pedido",
      "cadastro",
      "login",
      "erro",
    ],
  },
];

export function classifyThemes(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return THEMES.filter((t) => t.keywords.some((kw) => lower.includes(kw))).map(
    (t) => t.id,
  );
}
