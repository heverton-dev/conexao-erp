import { supabase } from "~/core/supabase";

export type Notificacao = {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dados: { cadastro_id?: string } | null;
  created_at: string;
};

export type NotificacaoTemplate = {
  id: string;
  evento: string;
  titulo: string;
  corpo_template: string;
  ativo: boolean;
  ordem?: number;
  destinatario_tipo?: string;
  created_at: string;
  updated_at: string;
  modulo_key?: string | null;
};

export async function listarNotificacoes(usuarioId: string) {
  const { data, error } = await supabase
    .from("notificacoes")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data as Notificacao[];
}

export async function marcarComoLida(notificacaoId: string) {
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", notificacaoId);
  if (error) throw error;
}

export async function marcarTodasComoLidas(usuarioId: string) {
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("usuario_id", usuarioId)
    .eq("lida", false);
  if (error) throw error;
}

export async function listarTemplates(
  moduloKey?: string | null,
) {
  let query = supabase
    .from("notificacoes_modelos")
    .select("*")
    .order("evento");

  if (moduloKey) {
    query = query.eq("modulo_key", moduloKey);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as NotificacaoTemplate[];
}

export async function criarTemplate(
  input: Omit<NotificacaoTemplate, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("notificacoes_modelos")
    .insert({
      evento: input.evento,
      titulo: input.titulo,
      corpo_template: input.corpo_template,
      ativo: input.ativo,
      ordem: input.ordem ?? 0,
      destinatario_tipo: input.destinatario_tipo || "consultor",
      modulo_key: input.modulo_key,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as NotificacaoTemplate;
}

export async function atualizarTemplate(
  evento: string,
  titulo: string,
  corpo: string,
  ativo: boolean,
) {
  const { data, error } = await supabase
    .from("notificacoes_modelos")
    .update({
      titulo,
      corpo_template: corpo,
      ativo,
      updated_at: new Date().toISOString(),
    })
    .eq("evento", evento)
    .select()
    .single();
  if (error) throw error;
  return data as NotificacaoTemplate;
}

export async function atualizarTemplatePorId(
  id: string,
  input: Partial<Omit<NotificacaoTemplate, "id">>,
) {
  const { data, error } = await supabase
    .from("notificacoes_modelos")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as NotificacaoTemplate;
}

export async function deletarTemplate(id: string) {
  const { error } = await supabase
    .from("notificacoes_modelos")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function enviarNotificacaoComTemplate(
  evento: string,
  cadastroId: string,
  destinatarioId: string,
  variaveis: Record<string, string>,
) {
  try {
    const { data: temp, error } = await supabase
      .from("notificacoes_modelos")
      .select("*")
      .eq("evento", evento)
      .eq("ativo", true)
      .maybeSingle();

    if (error || !temp) return;

    let tituloFinal = temp.titulo;
    let mensagemFinal = temp.corpo_template;

    for (const [chave, valor] of Object.entries(variaveis)) {
      const chaveEscapada = chave.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const placeholder = new RegExp(`{{${chaveEscapada}}}`, "g");
      tituloFinal = tituloFinal.replace(placeholder, valor || "");
      mensagemFinal = mensagemFinal.replace(placeholder, valor || "");
    }

    const { error: insertError } = await supabase.from("notificacoes").insert({
      usuario_id: destinatarioId,
      titulo: tituloFinal,
      mensagem: mensagemFinal,
      dados: { cadastro_id: cadastroId },
    });

    if (insertError) throw insertError;
  } catch (e) {
    console.error("Erro ao enviar notificacao com template:", e);
  }
}

export async function dispararNotificacaoIndividual(
  temp: NotificacaoTemplate,
  payload: Record<string, any>,
) {
  try {
    const cadastroId = payload.cadastro_id || payload.id;
    if (!cadastroId) return;

    let destinatariosIds: string[] = [];
    const tipo = temp.destinatario_tipo || "consultor";

    if (tipo === "consultor") {
      const { data: cadastro } = await supabase
        .from("cadastros")
        .select("created_by")
        .eq("id", cadastroId)
        .maybeSingle();
      const consultorId =
        cadastro?.created_by ||
        payload.created_by ||
        payload.destinatario_id ||
        payload.usuario_id;
      if (consultorId) {
        destinatariosIds.push(consultorId);
      }
    } else if (tipo === "superadmin") {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .or("is_super_admin.eq.true,role.eq.admin");
      if (admins) {
        destinatariosIds = admins.map((a) => a.id);
      }
    } else if (tipo === "cadastro") {
      const { data: cadastroUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("ambiente", "cadastro");
      if (cadastroUsers && cadastroUsers.length > 0) {
        destinatariosIds = cadastroUsers.map((u) => u.id);
      } else {
        const { data: admins } = await supabase
          .from("profiles")
          .select("id")
          .or("is_super_admin.eq.true,role.eq.admin");
        if (admins) destinatariosIds = admins.map((a) => a.id);
      }
    } else if (tipo === "ti") {
      const { data: tiUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("ambiente", "tecnologia");
      if (tiUsers && tiUsers.length > 0) {
        destinatariosIds = tiUsers.map((u) => u.id);
      } else {
        const { data: admins } = await supabase
          .from("profiles")
          .select("id")
          .or("is_super_admin.eq.true,role.eq.admin");
        if (admins) destinatariosIds = admins.map((a) => a.id);
      }
    }

    if (destinatariosIds.length === 0) {
      const fallbackId =
        payload.created_by || payload.destinatario_id || payload.usuario_id;
      if (fallbackId) destinatariosIds.push(fallbackId);
    }

    const { data: cadastro } = await supabase
      .from("cadastros")
      .select("colaborador")
      .eq("id", cadastroId)
      .maybeSingle();

    let tituloFinal = temp.titulo;
    let mensagemFinal = temp.corpo_template;

    const context = {
      ...payload,
      colaborador: cadastro?.colaborador || payload.colaborador || "",
    };

    for (const [chave, valor] of Object.entries(context)) {
      const chaveEscapada = chave.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const placeholder = new RegExp(`{{${chaveEscapada}}}`, "g");
      tituloFinal = tituloFinal.replace(placeholder, String(valor || ""));
      mensagemFinal = mensagemFinal.replace(placeholder, String(valor || ""));
    }

    const insertPromises = destinatariosIds.map((destId) =>
      supabase.from("notificacoes").insert({
        usuario_id: destId,
        titulo: tituloFinal,
        mensagem: mensagemFinal,
        dados: { cadastro_id: cadastroId },
      }),
    );
    await Promise.all(insertPromises);
  } catch (err) {
    console.error("Erro ao enviar notificação individual:", err);
    throw err;
  }
}

export async function dispararNotificacoesInternas(
  evento: string,
  payload: Record<string, any>,
) {
  try {
    const { data: templates, error } = await supabase
      .from("notificacoes_modelos")
      .select("*")
      .eq("evento", evento)
      .eq("ativo", true);

    if (error || !templates || templates.length === 0) return;

    for (const temp of templates) {
      await dispararNotificacaoIndividual(temp, payload).catch((err) =>
        console.error("Erro no disparo individual:", err),
      );
    }
  } catch (err) {
    console.error("Erro ao processar disparo dinâmico de notificações:", err);
  }
}
