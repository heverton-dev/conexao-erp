import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const calendarioDiagnosticPlan: DiagnosticPlan = {
  key: "mktg-calendario",
  nome: "Calendário Editorial",
  dadosTeste: () => ({
    titulo: "[DIAG] Evento Teste", data: new Date().toISOString().slice(0, 10),
    tipo: "post_blog" as const, status: "rascunho" as const,
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando evento no calendário...");
      const dados = ctx.dadosTeste() as any;
      const { data, error } = await supabase.from("mktg_calendario").insert({ empresa_id: ctx.empresaId, ...dados }).select().single();
      if (error) throw error;
      ctx.log("success", `evento criado: id=${data.id}, "${data.titulo}", data=${data.data}`);
      ctx.salvarId("eventoId", data.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando eventos...");
      const { data } = await supabase.from("mktg_calendario").select("*").eq("empresa_id", ctx.empresaId).order("data", { ascending: false });
      ctx.log("success", `${data?.length ?? 0} eventos encontrados`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("eventoId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando evento id=${id}...`);
      const { error } = await supabase.from("mktg_calendario").update({ titulo: "[DIAG] Evento Atualizado" }).eq("id", id);
      if (error) throw error;
      ctx.log("success", "evento atualizado");
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("eventoId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo evento id=${id}...`);
      await supabase.from("mktg_calendario").delete().eq("id", id);
      ctx.log("success", "evento excluído");
    },
  },

  acoes: [
    {
      key: "ciclo_calendario",
      label: "Ciclo Completo Calendário",
      descricao: "Cria evento → lista por período → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando evento...");
        const dados = ctx.dadosTeste() as any;
        const { data: ev } = await supabase.from("mktg_calendario").insert({ empresa_id: ctx.empresaId, ...dados }).select().single();
        ctx.log("success", `evento: id=${ev.id}`);
        ctx.salvarId("eventoId", ev.id);

        ctx.log("info", "2) Listando eventos do mês...");
        const mes = new Date().toISOString().slice(0, 7);
        const { data: lista } = await supabase.from("mktg_calendario").select("id, titulo, data, tipo").eq("empresa_id", ctx.empresaId).gte("data", `${mes}-01`).lte("data", `${mes}-31`);
        ctx.log("success", `${lista?.length ?? 0} eventos no mês`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("eventoId"); if (id) { await supabase.from("mktg_calendario").delete().eq("id", id); }
      },
    },
  ],
};
