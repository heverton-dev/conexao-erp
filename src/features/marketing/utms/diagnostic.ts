import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const utmsDiagnosticPlan: DiagnosticPlan = {
  key: "mktg-utms",
  nome: "UTMs",
  dadosTeste: () => ({
    nome: "[DIAG] UTM Teste", url_destino: "https://example.com/diag",
    utm_source: "diagnostico", utm_medium: "teste", utm_campaign: "ciclo",
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando UTM...");
      const dados = ctx.dadosTeste() as any;
      const { data, error } = await supabase.from("mktg_utms").insert({ empresa_id: ctx.empresaId, ...dados }).select().single();
      if (error) throw error;
      ctx.log("success", `UTM criada: id=${data.id}, nome="${data.nome}"`);
      ctx.salvarId("utmId", data.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando UTMs...");
      const { data } = await supabase.from("mktg_utms").select("*").eq("empresa_id", ctx.empresaId);
      ctx.log("success", `${data?.length ?? 0} UTMs encontradas`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("utmId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando UTM id=${id}...`);
      const { error } = await supabase.from("mktg_utms").update({ nome: "[DIAG] UTM Atualizada" }).eq("id", id);
      if (error) throw error;
      ctx.log("success", "UTM atualizada");
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("utmId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo UTM id=${id}...`);
      await supabase.from("mktg_utms").delete().eq("id", id);
      ctx.log("success", "UTM excluída");
    },
  },

  acoes: [
    {
      key: "ciclo_utm",
      label: "Ciclo Completo UTM",
      descricao: "Cria UTM → verifica na listagem → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando UTM...");
        const dados = ctx.dadosTeste() as any;
        const { data: u } = await supabase.from("mktg_utms").insert({ empresa_id: ctx.empresaId, ...dados }).select().single();
        ctx.log("success", `UTM: id=${u.id}`);
        ctx.salvarId("utmId", u.id);
        ctx.log("info", "2) Verificando na listagem...");
        const { data: lista } = await supabase.from("mktg_utms").select("id, nome").eq("empresa_id", ctx.empresaId);
        ctx.log("success", `total UTMs: ${lista?.length ?? 0}`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("utmId"); if (id) { await supabase.from("mktg_utms").delete().eq("id", id); }
      },
    },
  ],
};
