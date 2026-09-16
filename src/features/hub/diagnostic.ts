import type { DiagnosticPlan } from "~/core/diagnostic";
import * as materialsService from "./services/materials";
import * as collectionsService from "./services/collections";
import * as progressService from "./services/progress";
import * as gamificationService from "./services/gamification";
import * as invitesService from "./services/invites";
import * as chatbotService from "./services/chatbot";
import * as integrationsService from "./services/integrations";
import { supabase } from "~/core/supabase";

export const hubDiagnosticPlan: DiagnosticPlan = {
  key: "hub",
  nome: "Hub de Treinamento",
  dadosTeste: () => ({
    material: { empresa_id: "", title: { "pt-br": "[DIAG] Material de Teste" }, type: "video" as const, active: true, points: 0 },
    colecao: { empresa_id: "", title: { "pt-br": "[DIAG] Coleção Teste" }, active: true, points: 0 },
    nivel: { name: "Iniciante", min_points: 0, order_index: 0, color: "#22c55e" },
    badge: { name: "[DIAG] Badge Teste", icon_name: "star", description: "Badge diagnóstico", points_reward: 100, trigger_type: "material_completed" as const, trigger_value: 1, color: "#000000" },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando material...");
      const dados = ctx.dadosTeste() as any;
      const material = await materialsService.createHubMaterial({ ...dados.material, empresa_id: ctx.empresaId });
      ctx.log("success", `material: id=${material.id}, "${material.title?.["pt-br"] ?? ""}"`);
      ctx.salvarId("materialId", material.id);

      ctx.log("info", "criando coleção...");
      const colecao = await collectionsService.createHubCollection({ ...dados.colecao, empresa_id: ctx.empresaId });
      ctx.log("success", `coleção: id=${colecao.id}, "${colecao.title?.["pt-br"] ?? ""}"`);
      ctx.salvarId("colecaoId", colecao.id);
    },
    read: async (ctx) => {
      const id = ctx.recuperarId("materialId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `buscando material id=${id}...`);
      const material = await materialsService.fetchHubMaterialById(id);
      ctx.log("success", `material: "${material.title?.["pt-br"] ?? ""}", tipo=${material.type}`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("materialId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando material id=${id}...`);
      await materialsService.updateHubMaterial(id, { title: { "pt-br": "[DIAG] Material Atualizado" } });
      ctx.log("success", "material atualizado");
    },
    delete: async (ctx) => {
      for (const k of ["materialId", "colecaoId"]) {
        const id = ctx.recuperarId(k);
        if (!id) continue;
        ctx.log("info", `excluindo ${k}=${id}...`);
        if (k === "materialId") await materialsService.deleteHubMaterial(id).catch(() => {});
        if (k === "colecaoId") await collectionsService.deleteHubCollection(id).catch(() => {});
        ctx.log("success", `${k} excluído`);
      }
    },
  },

  acoes: [
    {
      key: "ciclo_material",
      label: "Ciclo Material/Progresso",
      descricao: "Cria material → conclui → verifica progresso → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando material...");
        const dados = ctx.dadosTeste() as any;
        const material = await materialsService.createHubMaterial({ ...dados.material, empresa_id: ctx.empresaId });
        ctx.log("success", `material: id=${material.id}`);
        ctx.salvarId("materialId", material.id);

        ctx.log("info", "2) Marcando como concluído...");
        await progressService.completeHubMaterial(ctx.usuarioId, material.id, ctx.empresaId);
        ctx.log("success", "material concluído");

        ctx.log("info", "3) Verificando progresso...");
        const progresso = await progressService.fetchHubUserProgress(ctx.usuarioId, ctx.empresaId);
        const meu = progresso.find(p => p.material_id === material.id);
        ctx.log("success", `progresso: status=${meu?.status}, completed_at=${meu?.completed_at ?? "N/A"}`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("materialId");
        if (id) { await materialsService.deleteHubMaterial(id).catch(() => {}); }
      },
    },
    {
      key: "gamificacao",
      label: "Gamificação (Níveis e Badges)",
      descricao: "Cria nível → lista → cria badge → lista badges da empresa → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando nível de gamificação...");
        const dados = ctx.dadosTeste() as any;
        const nivel = await gamificationService.upsertHubLevel(dados.nivel);
        ctx.log("success", `nível: "${nivel.name}", min_points=${nivel.min_points}`);
        ctx.salvarId("nivelNivel", nivel.name);

        ctx.log("info", "2) Listando níveis...");
        const niveis = await gamificationService.fetchHubLevels();
        ctx.log("success", `${niveis.length} nível(is) configurado(s)`);

        ctx.log("info", "3) Criando badge...");
        const badge = await gamificationService.createHubBadge({ ...dados.badge, empresa_id: ctx.empresaId });
        ctx.log("success", `badge: id=${badge.id}, "${badge.name}"`);
        ctx.salvarId("badgeId", badge.id);

        ctx.log("info", "4) Listando badges da empresa...");
        const badges = await gamificationService.fetchHubBadges();
        ctx.log("success", `${badges.length} badge(s) disponíveis`);
      },
      cleanup: async (ctx) => {
        const bid = ctx.recuperarId("badgeId");
        if (bid) { await gamificationService.deleteHubBadge(bid).catch(() => {}); }
      },
    },
    {
      key: "convites",
      label: "Convites",
      descricao: "Cria convite → valida → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando convite...");
        const invite = await invitesService.createHubInvite("client", ctx.usuarioId, ctx.empresaId, new Date(Date.now() + 86400000).toISOString());
        ctx.log("success", `convite: id=${invite.id}, token=${invite.token?.slice(0, 12)}…`);
        ctx.salvarId("inviteId", invite.id);

        ctx.log("info", "2) Listando convites...");
        const invites = await invitesService.fetchHubInvites();
        ctx.log("success", `${invites.length} convite(s) existentes`);
      },
      cleanup: async (ctx) => {
        const iid = ctx.recuperarId("inviteId");
        if (iid) { await invitesService.deleteHubInvite(iid).catch(() => {}); }
      },
    },
    {
      key: "chatbot_integracoes",
      label: "Chatbot e Integrações",
      descricao: "Verifica config chatbot e status integrações → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Buscando config do chatbot...");
        const config = await chatbotService.fetchHubChatbotConfig();
        ctx.log("success", config ? "chatbot configurado" : "chatbot sem configuração (padrão)");

        ctx.log("info", "2) Buscando integrações ativas...");
        const integracoes = await integrationsService.fetchHubIntegrations();
        ctx.log("success", integracoes ? "integrações configuradas" : "nenhuma integração configurada");

        ctx.log("info", "3) Verificando assets de material...");
        const { data: assets } = await supabase.from("hub_material_assets").select("id, material_id, locale").limit(5);
        ctx.log("success", `${assets?.length ?? 0} assets no hub`);
      },
      cleanup: async () => {},
    },
  ],
};
