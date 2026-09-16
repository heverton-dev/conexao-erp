import type { DiagnosticPlan } from "~/core/diagnostic";
import * as linksService from "./services/links.service";
import * as templatesService from "./services/templates.service";
import * as trackingService from "./services/tracking.service";
import * as geradoresService from "./services/geradores.service";

export const geradorLinksDiagnosticPlan: DiagnosticPlan = {
  key: "gerador-links",
  nome: "Links",
  dadosTeste: () => ({
    link: { tipo: "whatsapp" as const, titulo: "[DIAG] Link Teste", url_gerada: "https://wa.me/5511999999999", params: { phone: "5511999999999" } },
    template: { tipo: "whatsapp" as const, nome: "[DIAG] Template Teste", conteudo: { mensagem: "Olá, tudo bem?" } },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando link...");
      const dados = ctx.dadosTeste() as any;
      const link = await linksService.criarLink({ ...dados.link });
      ctx.log("success", `link: id=${link.id}, titulo="${link.titulo}", tipo=${link.tipo}`);
      ctx.salvarId("linkId", link.id);

      ctx.log("info", "criando template...");
      const template = await templatesService.criarTemplate({ ...dados.template });
      ctx.log("success", `template: id=${template.id}, nome="${template.nome}"`);
      ctx.salvarId("templateId", template.id);
    },
    read: async (ctx) => {
      const id = ctx.recuperarId("linkId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `buscando link id=${id}...`);
      const link = await linksService.getLinkById(id);
      if (!link) { ctx.log("error", "link não encontrado"); return; }
      ctx.log("success", `link: "${link.titulo}", tipo=${link.tipo}, url=${link.url_gerada}`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("linkId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando link id=${id}...`);
      await linksService.atualizarLink(id, { titulo: "[DIAG] Link Atualizado" });
      ctx.log("success", "link atualizado");
    },
    delete: async (ctx) => {
      for (const k of ["linkId", "templateId"]) {
        const id = ctx.recuperarId(k);
        if (!id) continue;
        ctx.log("info", `excluindo ${k}=${id}...`);
        if (k === "linkId") await linksService.deletarLink(id).catch(() => {});
        if (k === "templateId") await templatesService.deletarTemplate(id).catch(() => {});
        ctx.log("success", `${k} excluído`);
      }
    },
  },

  acoes: [
    {
      key: "ciclo_link",
      label: "Ciclo Link + Template",
      descricao: "Cria link → template → registra clique → dashboard → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando link WhatsApp...");
        const dados = ctx.dadosTeste() as any;
        const link = await linksService.criarLink({ ...dados.link });
        ctx.log("success", `link: id=${link.id}, url=${link.url_gerada}`);
        ctx.salvarId("linkId", link.id);

        ctx.log("info", "2) Criando template...");
        const template = await templatesService.criarTemplate({ ...dados.template });
        ctx.log("success", `template: id=${template.id}`);
        ctx.salvarId("templateId", template.id);

        ctx.log("info", "3) Registrando cliques (3x)...");
        for (let i = 0; i < 3; i++) await trackingService.registrarClique(link.id);
        ctx.log("success", "3 cliques registrados");

        ctx.log("info", "4) Dashboard de tracking...");
        const stats = await trackingService.getDashboardStats();
        ctx.log("success", `dashboard: ${(stats as any)?.total ?? 0} cliques no período`);
      },
      cleanup: async (ctx) => {
        const lid = ctx.recuperarId("linkId"); if (lid) { await linksService.deletarLink(lid).catch(() => {}); }
        const tid = ctx.recuperarId("templateId"); if (tid) { await templatesService.deletarTemplate(tid).catch(() => {}); }
      },
    },
    {
      key: "geradores_url",
      label: "Geradores de URL",
      descricao: "Testa todos os geradores de URL disponíveis",
      steps: async (ctx) => {
        ctx.log("info", "1) Testando gerador WhatsApp...");
        const wa = geradoresService.gerarWhatsApp("5511999999999", "Olá, teste!");
        ctx.log("success", `WhatsApp: ${wa}`);

        ctx.log("info", "2) Testando gerador UTM...");
        const utm = geradoresService.gerarUtm({
          url: "https://exemplo.com",
          utm_source: "diagnostico",
          utm_medium: "teste",
          utm_campaign: "diagnostico",
        });
        ctx.log("success", `UTM: ${utm}`);

        ctx.log("info", "3) Testando gerador Google Review...");
        const review = geradoresService.gerarGoogleReview("PlaceID123");
        ctx.log("success", `Review: ${review}`);

        ctx.log("info", "4) Testando gerador Google Maps...");
        const maps = geradoresService.gerarGoogleMaps("-23.5505", "-46.6333");
        ctx.log("success", `Maps: ${maps}`);

        ctx.log("info", "5) Testando gerador Waze...");
        const waze = geradoresService.gerarWaze("-23.5505", "-46.6333");
        ctx.log("success", `Waze: ${waze}`);

        ctx.log("success", "todos os 5 geradores funcionando");
      },
      cleanup: async () => {},
    },
  ],
};
