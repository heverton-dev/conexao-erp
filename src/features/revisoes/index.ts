import { supabase } from "~/core/supabase";

export type RevisaoStatus = "pendente" | "ok" | "reprovado" | "em_correcao";

export type CampoRevisao = {
  status: RevisaoStatus;
  comentario: string | null;
};

export type Revisoes = Record<string, CampoRevisao>;

export const STATUS_REVISAO_LABEL: Record<RevisaoStatus, string> = {
  pendente: "Pendente",
  ok: "Ok",
  reprovado: "Reprovado",
  em_correcao: "Em Correção",
};

export const STATUS_REVISAO_COLOR: Record<RevisaoStatus, string> = {
  pendente: "bg-yellow-500/10 text-yellow-400",
  ok: "bg-green-500/10 text-green-400",
  reprovado: "bg-red-500/10 text-red-400",
  em_correcao: "bg-orange-500/10 text-orange-400",
};

export async function getRevisoes(cadastroId: string): Promise<Revisoes> {
  const { data, error } = await supabase
    .from("cadastros")
    .select("revisoes")
    .eq("id", cadastroId)
    .single();
  if (error) throw error;
  return (data?.revisoes as Revisoes) || {};
}

export async function setRevisaoCampo(
  cadastroId: string,
  campo: string,
  status: RevisaoStatus,
  comentario: string | null,
): Promise<void> {
  const revisoes = await getRevisoes(cadastroId);
  revisoes[campo] = { status, comentario };
  const { error } = await supabase
    .from("cadastros")
    .update({ revisoes })
    .eq("id", cadastroId);
  if (error) throw error;
}

export async function setRevisoesMassa(
  cadastroId: string,
  novasRevisoes: Revisoes,
): Promise<void> {
  const atuais = await getRevisoes(cadastroId);
  const combinadas = { ...atuais, ...novasRevisoes };
  const { error } = await supabase
    .from("cadastros")
    .update({ revisoes: combinadas })
    .eq("id", cadastroId);
  if (error) throw error;
}
