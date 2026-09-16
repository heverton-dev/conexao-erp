import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";

export const mapasDiagnosticPlan: DiagnosticPlan = {
  key: "mapas-interativos",
  nome: "Mapas",
  dadosTeste: () => ({
    distribuidor: { name: "[DIAG] Distribuidor Teste", city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333, active: true },
    consultor: { name: "[DIAG] Consultor Teste", city: "São Paulo", state: "SP", lat: -23.561, lng: -46.656, active: true },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando distribuidor...");
      const dados = ctx.dadosTeste() as any;
      const { data: d, error: e1 } = await supabase.from("mapas_distribuidores").insert({ ...dados.distribuidor, empresa_id: ctx.empresaId }).select().single();
      if (e1) throw e1;
      ctx.log("success", `distribuidor criado: id=${d.id}, nome="${d.name}"`);
      ctx.salvarId("distribuidorId", d.id);

      ctx.log("info", "criando consultor...");
      const { data: c, error: e2 } = await supabase.from("mapas_consultores").insert({ ...dados.consultor, empresa_id: ctx.empresaId }).select().single();
      if (e2) throw e2;
      ctx.log("success", `consultor criado: id=${c.id}, nome="${c.name}"`);
      ctx.salvarId("consultorId", c.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando distribuidores...");
      const { data: d } = await supabase.from("mapas_distribuidores").select("*").eq("empresa_id", ctx.empresaId);
      ctx.log("success", `${d?.length ?? 0} distribuidores`);

      ctx.log("info", "listando consultores...");
      const { data: c } = await supabase.from("mapas_consultores").select("*").eq("empresa_id", ctx.empresaId);
      ctx.log("success", `${c?.length ?? 0} consultores`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("distribuidorId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando distribuidor id=${id}...`);
      const { error } = await supabase.from("mapas_distribuidores").update({ name: "[DIAG] Distribuidor Atualizado" }).eq("id", id);
      if (error) throw error;
      ctx.log("success", "distribuidor atualizado");
    },
    delete: async (ctx) => {
      for (const k of ["distribuidorId", "consultorId"]) {
        const id = ctx.recuperarId(k);
        if (!id) continue;
        ctx.log("info", `excluindo ${k}=${id}...`);
        const table = k === "distribuidorId" ? "mapas_distribuidores" : "mapas_consultores";
        await supabase.from(table).delete().eq("id", id);
        ctx.log("success", `${k} excluído`);
      }
    },
  },

  acoes: [
    {
      key: "ciclo_mapa",
      label: "Ciclo Completo Mapa",
      descricao: "Cria distribuidor → consultor → verifica geolocalização → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando distribuidor com geolocalização...");
        const dados = ctx.dadosTeste() as any;
        const { data: d } = await supabase.from("mapas_distribuidores").insert({ ...dados.distribuidor, empresa_id: ctx.empresaId }).select().single();
        ctx.log("success", `distribuidor: id=${d.id}, lat=${d.lat}, lng=${d.lng}`);
        ctx.salvarId("distribuidorId", d.id);

        ctx.log("info", "2) Criando consultor...");
        const { data: c } = await supabase.from("mapas_consultores").insert({ ...dados.consultor, empresa_id: ctx.empresaId }).select().single();
        ctx.log("success", `consultor: id=${c.id}`);
        ctx.salvarId("consultorId", c.id);

        ctx.log("info", "3) Verificando presença no mapa...");
        const { data: pontos } = await supabase.from("mapas_distribuidores").select("id, name, lat, lng, state").eq("empresa_id", ctx.empresaId).eq("active", true);
        ctx.log("success", `${pontos?.length ?? 0} pontos ativos no mapa`);
      },
      cleanup: async (ctx) => {
        const did = ctx.recuperarId("distribuidorId"); if (did) { await supabase.from("mapas_distribuidores").delete().eq("id", did); }
        const cid = ctx.recuperarId("consultorId"); if (cid) { await supabase.from("mapas_consultores").delete().eq("id", cid); }
      },
    },
  ],
};
