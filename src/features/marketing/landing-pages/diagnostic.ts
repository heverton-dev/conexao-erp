import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const landingPagesDiagnosticPlan: DiagnosticPlan = {
  key: "mktg-landing-pages",
  nome: "Landing Pages",
  dadosTeste: () => ({
    titulo: "[DIAG] LP Teste", template: "default",
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando landing page...");
      const dados = ctx.dadosTeste() as any;
      const slug = `${dados.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const { data, error } = await supabase.from("mktg_landing_pages").insert({
        empresa_id: ctx.empresaId, titulo: dados.titulo, slug, conteudo: {},
      }).select().single();
      if (error) { ctx.log("error", `erro: ${error.message}`); return; }
      ctx.log("success", `LP criada: id=${data.id}, "${data.titulo}", slug=${data.slug}`);
      ctx.salvarId("lpId", data.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando landing pages...");
      const { data } = await supabase.from("mktg_landing_pages").select("*").eq("empresa_id", ctx.empresaId);
      ctx.log("success", `${data?.length ?? 0} landing pages`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("lpId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando LP id=${id}...`);
      const { error } = await supabase.from("mktg_landing_pages").update({ titulo: "[DIAG] LP Atualizada" }).eq("id", id);
      if (error) throw error;
      ctx.log("success", "LP atualizada");
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("lpId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo LP id=${id}...`);
      await supabase.from("mktg_landing_pages").delete().eq("id", id);
      ctx.log("success", "LP excluída");
    },
  },

  acoes: [
    {
      key: "ciclo_lp",
      label: "Ciclo Completo LP",
      descricao: "Cria landing page → salva versão → verifica → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando landing page...");
        const dados = ctx.dadosTeste() as any;
        const slug = `${dados.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
        const { data: lp } = await supabase.from("mktg_landing_pages").insert({
          empresa_id: ctx.empresaId, titulo: dados.titulo, slug, conteudo: {},
        }).select().single();
        if (!lp) { ctx.log("error", "falha ao criar LP"); return; }
        ctx.log("success", `LP: id=${lp.id}`);
        ctx.salvarId("lpId", lp.id);

        ctx.log("info", "2) Salvando versão...");
        const { error: ve } = await supabase.from("mktg_landing_pages_versoes").insert({
          landing_page_id: lp.id, conteudo: { titulo: "Versão 1" }, criado_por: ctx.usuarioId,
        });
        if (ve) { ctx.log("error", `erro ao salvar versão: ${ve.message}`); return; }
        ctx.log("success", "versão salva");

        ctx.log("info", "3) Verificando versões...");
        const { data: versoes } = await supabase.from("mktg_landing_pages_versoes").select("*").eq("landing_page_id", lp.id);
        ctx.log("success", `${versoes?.length ?? 0} versões da LP`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("lpId"); if (id) { await supabase.from("mktg_landing_pages").delete().eq("id", id); }
      },
    },
  ],
};
