import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const pixelsDiagnosticPlan: DiagnosticPlan = {
  key: "mktg-pixels",
  nome: "Pixels",
  dadosTeste: () => ({
    nome: "[DIAG] Pixel Teste", tipo: "facebook" as const, pixel_id: "DIAG123456",
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando pixel...");
      const dados = ctx.dadosTeste() as any;
      const { data, error } = await supabase.from("mktg_pixels").insert({ empresa_id: ctx.empresaId, ...dados }).select().single();
      if (error) { ctx.log("error", `erro: ${error.message}`); return; }
      ctx.log("success", `pixel criado: id=${data.id}, nome="${data.nome}", tipo=${data.tipo}`);
      ctx.salvarId("pixelId", data.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando pixels...");
      const { data } = await supabase.from("mktg_pixels").select("*").eq("empresa_id", ctx.empresaId);
      ctx.log("success", `${data?.length ?? 0} pixels configurados`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("pixelId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando pixel id=${id}...`);
      const { error } = await supabase.from("mktg_pixels").update({ nome: "[DIAG] Pixel Atualizado" }).eq("id", id);
      if (error) throw error;
      ctx.log("success", "pixel atualizado");
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("pixelId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo pixel id=${id}...`);
      await supabase.from("mktg_pixels").delete().eq("id", id);
      ctx.log("success", "pixel excluído");
    },
  },

  acoes: [
    {
      key: "ciclo_pixel",
      label: "Ciclo Completo Pixel",
      descricao: "Cria pixel → lista configurações → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando pixel...");
        const dados = ctx.dadosTeste() as any;
        const { data: p } = await supabase.from("mktg_pixels").insert({ empresa_id: ctx.empresaId, ...dados }).select().single();
        if (!p) { ctx.log("error", "falha ao criar pixel"); return; }
        ctx.log("success", `pixel: id=${p.id}`);
        ctx.salvarId("pixelId", p.id);

        ctx.log("info", "2) Verificando configurações...");
        const { data: lista } = await supabase.from("mktg_pixels").select("id, nome, tipo, active").eq("empresa_id", ctx.empresaId);
        ctx.log("success", `${lista?.length ?? 0} pixels: ${JSON.stringify(lista?.map(p => p.nome))}`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("pixelId"); if (id) { await supabase.from("mktg_pixels").delete().eq("id", id); }
      },
    },
  ],
};
