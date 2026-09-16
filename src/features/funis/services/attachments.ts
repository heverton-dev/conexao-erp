import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Attachment, AttachmentInput } from "../types";

const MODULO_KEY = "funis";

export async function listarAnexos(tarefaId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from("funis_anexos")
    .select("*")
    .eq("tarefa_id", tarefaId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Attachment[];
}

export async function criarAnexo(input: AttachmentInput): Promise<Attachment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("funis_anexos")
    .insert({
      tarefa_id: input.tarefa_id,
      url: input.url,
      titulo: input.titulo,
      tipo: input.tipo ?? "link",
      created_by: user.id,
    })
    .select()
    .single();
  if (error) throw error;
  const anexo = data as Attachment;

  dispararEventoModulo(MODULO_KEY, "tarefa.anexo_adicionado", {
    anexo,
    tarefa_id: input.tarefa_id,
  }).catch(() => {});
  return anexo;
}

export async function atualizarAnexo(
  id: string,
  input: Partial<AttachmentInput>,
): Promise<Attachment> {
  const { data, error } = await supabase
    .from("funis_anexos")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Attachment;
}

export async function deletarAnexo(id: string): Promise<void> {
  const { error } = await supabase
    .from("funis_anexos")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
