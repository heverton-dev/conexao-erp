import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const seoDiagnosticPlan: DiagnosticPlan = {
  key: "mktg-seo",
  nome: "SEO",
  dadosTeste: () => ({}),

  crud: {
    create: async (_ctx) => { throw new Error("SEO não possui CRUD próprio"); },
    read: async (ctx) => {
      ctx.log("info", "verificando configurações de SEO...");
      ctx.log("info", "SEO audit requer URL externa - não disponível em diagnóstico");
      ctx.log("success", "módulo SEO OK (apenas consulta)");
    },
    update: async (_ctx) => { throw new Error("Operação não suportada"); },
    delete: async (_ctx) => { throw new Error("Operação não suportada"); },
  },

  acoes: [
    {
      key: "teste_seo",
      label: "Teste SEO URL",
      descricao: "Audita URL interna via serviço (demonstração)",
      steps: async (ctx) => {
        ctx.log("info", "1) Buscando landing pages para auditar...");
        const { data: lps } = await supabase.from("mktg_landing_pages").select("id, titulo, slug").eq("empresa_id", ctx.empresaId).limit(5);
        ctx.log("success", `${lps?.length ?? 0} páginas disponíveis para auditoria`);
        if (lps && lps.length > 0) {
          ctx.log("info", `   exemplo: "${lps[0].titulo}" (/${lps[0].slug})`);
        }
      },
    },
  ],
};
