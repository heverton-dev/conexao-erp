import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const empresasDiagnosticPlan: DiagnosticPlan = {
  key: "empresas-core",
  nome: "Empresa",
  dadosTeste: () => ({}),

  crud: {
    create: async (_ctx) => { throw new Error("Operação não suportada para módulo Empresa"); },
    read: async (ctx) => {
      ctx.log("info", "buscando dados da empresa...");
      const { data, error } = await supabase.from("empresas").select("id, nome, slug, created_at").eq("id", ctx.empresaId).single();
      if (error) throw error;
      ctx.log("success", `empresa: "${data.nome}", slug=${data.slug}, criada=${data.created_at?.slice(0, 10)}`);
    },
    update: async (_ctx) => { throw new Error("Operação não suportada para módulo Empresa"); },
    delete: async (_ctx) => { throw new Error("Operação não suportada para módulo Empresa"); },
  },

  acoes: [
    {
      key: "info_empresa",
      label: "Info da Empresa",
      descricao: "Lê dados da empresa + perfil do usuário",
      steps: async (ctx) => {
        ctx.log("info", "1) Dados da empresa...");
        const { data: emp } = await supabase.from("empresas").select("id, nome, slug, created_at").eq("id", ctx.empresaId).single();
        ctx.log("success", `empresa: "${emp?.nome}" (${emp?.slug})`);

        ctx.log("info", "2) Perfil do usuário...");
        const { data: perfil } = await supabase.from("profiles").select("id, nome, email, role").eq("id", ctx.usuarioId).single();
        ctx.log("success", `usuário: "${perfil?.nome}", role=${perfil?.role}, email=${perfil?.email}`);
      },
    },
  ],
};
