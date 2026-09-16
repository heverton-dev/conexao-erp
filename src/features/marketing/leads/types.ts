export type MktgLead = {
  id: string;
  empresa_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  origem: string | null;
  fonte: string | null;
  score: number;
  status: "novo" | "contato" | "qualificado" | "proposta" | "convertido" | "perdido";
  tags: string[];
  created_at: string;
};
