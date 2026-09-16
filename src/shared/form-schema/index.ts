/**
 * shared/form-schema — Infraestrutura de dados compartilhada da plataforma.
 *
 * Este módulo NÃO é uma feature de negócio (sem module.ts, não é registrado no registry).
 * Pode ser importado por qualquer módulo que precise ler/gravar o schema de campos
 * do formulário de pré-cadastro (tabela form_schema).
 */
import { supabase } from "~/core/supabase";

export type TipoInput =
  | "text"
  | "textarea"
  | "email"
  | "date"
  | "tel"
  | "cep"
  | "select"
  | "multiselect"
  | "checkbox"
  | "documento";

export type TipoPessoa = "PF" | "PJ" | "ambos";
export type Etapa =
  | "dados"
  | "endereco_empresa"
  | "endereco_entrega"
  | "endereco_cobranca"
  | "documentos";

export type CampoSchema = {
  id: string;
  tipo_pessoa: TipoPessoa;
  etapa: Etapa;
  campo_key: string;
  label: string;
  tipo_input: TipoInput;
  opcoes: string[];
  obrigatorio: boolean;
  visivel: boolean;
  ordem: number;
  is_custom: boolean;
};

export type NovoCampo = Omit<CampoSchema, "id" | "is_custom">;

export async function carregarSchema(
  tipo_pessoa: "PF" | "PJ",
  etapa: Etapa,
): Promise<CampoSchema[]> {
  const { data, error } = await supabase
    .from("form_schema")
    .select("*")
    .in("tipo_pessoa", [tipo_pessoa, "ambos"])
    .eq("etapa", etapa)
    .eq("visivel", true)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("[form-schema] carregarSchema:", error);
    return [];
  }
  return (data as CampoSchema[]) ?? [];
}

export async function listarTodosCampos(filtros?: {
  etapa?: Etapa;
  tipo_pessoa?: TipoPessoa;
}): Promise<CampoSchema[]> {
  let q = supabase.from("form_schema").select("*");

  if (filtros?.etapa) q = q.eq("etapa", filtros.etapa);
  if (filtros?.tipo_pessoa)
    q = q.in("tipo_pessoa", [filtros.tipo_pessoa, "ambos"]);

  q = q.order("etapa").order("ordem", { ascending: true });

  const { data, error } = await q;
  if (error) {
    console.error("[form-schema] listarTodosCampos:", error);
    return [];
  }
  return (data as CampoSchema[]) ?? [];
}

export async function salvarCampo(
  campo: Partial<CampoSchema> & { id?: string },
): Promise<{ data: CampoSchema | null; erro?: string }> {
  if (campo.id) {
    const { data, error } = await supabase
      .from("form_schema")
      .update(campo)
      .eq("id", campo.id)
      .select()
      .single();
    if (error) {
      console.error("[form-schema] salvarCampo update:", error);
      return { data: null, erro: error.message };
    }
    return { data: data as CampoSchema };
  } else {
    const { data, error } = await supabase
      .from("form_schema")
      .insert({ ...campo, is_custom: true })
      .select()
      .single();
    if (error) {
      console.error("[form-schema] salvarCampo insert:", error);
      return { data: null, erro: error.message };
    }
    return { data: data as CampoSchema };
  }
}

export async function excluirCampo(id: string, isSuper?: boolean): Promise<boolean> {
  let q = supabase.from("form_schema").delete().eq("id", id);
  if (!isSuper) q = q.eq("is_custom", true);
  const { error } = await q;
  if (error) {
    console.error("[form-schema] excluirCampo:", error);
    return false;
  }
  return true;
}

export async function reordenarCampos(
  atualizacoes: { id: string; ordem: number }[],
): Promise<void> {
  await Promise.all(
    atualizacoes.map(({ id, ordem }) =>
      supabase.from("form_schema").update({ ordem }).eq("id", id),
    ),
  );
}

export async function toggleCampo(
  id: string,
  campo: "visivel" | "obrigatorio",
  valor: boolean,
): Promise<void> {
  await supabase
    .from("form_schema")
    .update({ [campo]: valor })
    .eq("id", id);
}

export async function editarLabel(id: string, label: string): Promise<void> {
  await supabase.from("form_schema").update({ label }).eq("id", id);
}
