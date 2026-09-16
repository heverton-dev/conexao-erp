import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const crmDiagnosticPlan: DiagnosticPlan = {
  key: "crm",
  nome: "CRM",
  dadosTeste: () => ({
    cliente: { nome: "[DIAG] Cliente CRM", telefone: "11988888888", tipo_pessoa: "PF", status: "ativo" },
    consultor: { nome: "[DIAG] Consultor CRM", email: "cons_diag@teste.com" },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando cliente CRM...");
      const dados = ctx.dadosTeste() as any;
      const { data, error } = await supabase.from("clientes").insert({
        nome_doutor: dados.cliente.nome,
        telefone_contato: dados.cliente.telefone, tipo_pessoa: dados.cliente.tipo_pessoa,
        status: "ativo",
      }).select().single();
      if (error) throw error;
      ctx.log("success", `cliente CRM criado: id=${data.id}, nome="${data.nome_doutor}"`);
      ctx.salvarId("clienteId", data.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando clientes CRM...");
      const { data, error } = await supabase.from("clientes").select("id, nome_doutor, status").limit(10);
      if (error) throw error;
      ctx.log("success", `${data?.length ?? 0} clientes encontrados`);
      const ativos = data?.filter(c => c.status === "ativo").length ?? 0;
      ctx.log("info", `clientes ativos: ${ativos}`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("clienteId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando cliente id=${id}...`);
      const { data, error } = await supabase.from("clientes").update({ nome_doutor: "[DIAG] CRM Atualizado" }).eq("id", id).select().single();
      if (error) throw error;
      ctx.log("success", `cliente atualizado: "${data.nome_doutor}"`);
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("clienteId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo cliente id=${id}...`);
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
      ctx.log("success", `cliente ${id} excluído`);
    },
  },

  acoes: [
    {
      key: "atualizacao_carteira",
      label: "Atualização e Consulta de Carteira",
      descricao: "Cria cliente → atualiza dados de contato → verifica carteira → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando cliente CRM...");
        const dados = ctx.dadosTeste() as any;
        const { data: c, error: e1 } = await supabase.from("clientes").insert({
          nome_doutor: dados.cliente.nome,
          telefone_contato: dados.cliente.telefone, tipo_pessoa: dados.cliente.tipo_pessoa,
          status: "ativo",
        }).select().single();
        if (e1) throw e1;
        ctx.log("success", `cliente: id=${c.id}`);
        ctx.salvarId("clienteId", c.id);

        ctx.log("info", "2) Atualizando observações de contato...");
        await supabase.from("clientes").update({ observacoes: "[DIAG] contato atualizado" }).eq("id", c.id);
        const { data: c2 } = await supabase.from("clientes").select("observacoes, status").eq("id", c.id).single();
        ctx.log("success", `observações: ${c2?.observacoes}, status=${c2?.status}`);

        ctx.log("info", "3) Verificando carteira de clientes...");
        const { data: carteira } = await supabase.from("clientes").select("id, nome_doutor, status").limit(10);
        ctx.log("success", `carteira: ${carteira?.length ?? 0} clientes`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("clienteId");
        if (id) { await supabase.from("clientes").delete().eq("id", id); }
      },
    },
    {
      key: "carteira_filtros",
      label: "Consulta Carteira com Filtros",
      descricao: "Clientes ativos/inativos e estatísticas da carteira",
      steps: async (ctx) => {
        ctx.log("info", "Criando 2 clientes de teste para carteira...");
        const dados = ctx.dadosTeste() as any;
        for (let i = 0; i < 2; i++) {
          const { data: c } = await supabase.from("clientes").insert({
            nome_doutor: `[DIAG] Carteira ${i}`,
            telefone_contato: `119${String(11111111 + i).slice(0, 8)}`,
            tipo_pessoa: "PF",
            status: i === 0 ? "ativo" : "inativo",
          }).select().single();
          if (c) ctx.salvarId(`carteiraCliente${i}`, c.id);
        }

        ctx.log("info", "Filtrando ativos...");
        const { data: ativos } = await supabase.from("clientes").select("id, nome_doutor, status").eq("status", "ativo").limit(5);
        ctx.log("success", `${ativos?.length ?? 0} clientes ativos`);

        ctx.log("info", "Filtrando inativos...");
        const { data: inativos } = await supabase.from("clientes").select("id, nome_doutor, status").eq("status", "inativo").limit(5);
        ctx.log("success", `${inativos?.length ?? 0} clientes inativos`);

        ctx.log("info", "Total geral...");
        const { count } = await supabase.from("clientes").select("*", { count: "exact", head: true });
        ctx.log("success", `total clientes empresa: ${count ?? "N/A"}`);
      },
      cleanup: async (ctx) => {
        for (let i = 0; i < 2; i++) {
          const id = ctx.recuperarId(`carteiraCliente${i}`);
          if (id) await supabase.from("clientes").delete().eq("id", id);
        }
      },
    },
    {
      key: "ciclo_crm",
      label: "Ciclo Básico CRM",
      descricao: "Cria cliente → consulta carteira → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando cliente...");
        const dados = ctx.dadosTeste() as any;
        const { data: c, error: e1 } = await supabase.from("clientes").insert({
          nome_doutor: dados.cliente.nome,
          telefone_contato: dados.cliente.telefone, tipo_pessoa: dados.cliente.tipo_pessoa,
          status: "ativo",
        }).select().single();
        if (e1) throw e1;
        ctx.log("success", `cliente: id=${c.id}`);
        ctx.salvarId("clienteId", c.id);

        ctx.log("info", "2) Verificando carteira...");
        const { data: carteira, error: e2 } = await supabase.from("clientes").select("id, nome_doutor, status").limit(5);
        if (e2) throw e2;
        ctx.log("success", `carteira: ${carteira?.length ?? 0} clientes`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("clienteId");
        if (id) { await supabase.from("clientes").delete().eq("id", id); }
      },
    },
  ],
};
