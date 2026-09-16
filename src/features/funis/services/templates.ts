import { supabase } from "~/core/supabase";
import type { Template, TemplateInput } from "../types";

export async function listarTemplates(empresaId?: string): Promise<Template[]> {
  let query = supabase
    .from("funis_modelos")
    .select(
      "*, colunas:funis_template_cols(*), tarefas:funis_template_tasks(*)",
    )
    .order("created_at", { ascending: false });

  if (empresaId) {
    query = query.or(`empresa_id.eq.${empresaId},is_public.eq.true`);
  } else {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Template[];
}

export async function buscarTemplate(id: string): Promise<Template> {
  const { data, error } = await supabase
    .from("funis_modelos")
    .select(
      "*, colunas:funis_template_cols(*), tarefas:funis_template_tasks(*)",
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  const template = data as Template;
  if (template.colunas) {
    template.colunas.sort((a, b) => a.posicao - b.posicao);
  }
  if (template.tarefas) {
    template.tarefas.sort((a, b) => a.posicao - b.posicao);
  }
  return template;
}

export async function criarTemplate(
  input: TemplateInput,
  empresaId?: string | null,
): Promise<Template> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data, error } = await supabase
    .from("funis_modelos")
    .insert({
      nome: input.nome,
      descricao: input.descricao ?? null,
      is_public: input.is_public ?? false,
      created_by: user.id,
      empresa_id: empresaId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  const template = data as Template;

  if (input.colunas && input.colunas.length > 0) {
    const colunasData = input.colunas.map((titulo, index) => ({
      template_id: template.id,
      titulo,
      posicao: index,
    }));
    const { error: colunasError } = await supabase
      .from("funis_colunas_modelo")
      .insert(colunasData);
    if (colunasError) throw colunasError;
  }

  if (input.tarefas && input.tarefas.length > 0) {
    const tarefasData = input.tarefas.map((t) => ({
      template_id: template.id,
      template_col_idx: t.col_idx,
      titulo: t.titulo,
      descricao: t.descricao ?? null,
      prioridade: t.prioridade ?? "medium",
      posicao: 0,
    }));
    const { error: tarefasError } = await supabase
      .from("funis_tarefas_modelo")
      .insert(tarefasData);
    if (tarefasError) throw tarefasError;
  }

  return template;
}

export async function atualizarTemplate(
  id: string,
  input: Partial<TemplateInput>,
): Promise<Template> {
  const { data, error } = await supabase
    .from("funis_modelos")
    .update({
      nome: input.nome,
      descricao: input.descricao,
      is_public: input.is_public,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Template;
}

export async function deletarTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from("funis_modelos")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function aplicarTemplate(
  templateId: string,
  funilId: string,
): Promise<void> {
  const template = await buscarTemplate(templateId);
  if (!template) throw new Error("Template não encontrado");

  if (template.colunas && template.colunas.length > 0) {
    const colunasData = template.colunas.map((col) => ({
      funil_id: funilId,
      titulo: col.titulo,
      posicao: col.posicao,
    }));
    const { data: novasColunas, error: colunasError } = await supabase
      .from("funis_colunas")
      .insert(colunasData)
      .select();
    if (colunasError) throw colunasError;

    if (template.tarefas && template.tarefas.length > 0 && novasColunas) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const tarefasData = template.tarefas.map((t) => ({
          funil_id: funilId,
          coluna_id: novasColunas[t.template_col_idx]?.id ?? novasColunas[0].id,
          titulo: t.titulo,
          descricao: t.descricao ?? null,
          prioridade: t.prioridade ?? "medium",
          posicao: t.posicao,
          tools: [],
          created_by: user.id,
        }));

        const { error: tarefasError } = await supabase
          .from("funis_tarefas")
          .insert(tarefasData);
        if (tarefasError) throw tarefasError;
      }
    }
  }
}
