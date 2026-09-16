import type { DiagnosticPlan } from "~/core/diagnostic";
import * as empresaService from "./services/empresa";

export const linktreeDiagnosticPlan: DiagnosticPlan = {
  key: "linktree",
  nome: "LinkTree",
  dadosTeste: () => ({
    config: { slug: `diag-${Date.now()}`, bio: "[DIAG] Perfil de teste", theme: "default" },
    secao: { titulo: "[DIAG] Seção Teste", ordem: 0 },
    link: { titulo: "[DIAG] Link Teste", url: "https://example.com/diag", icone: "globe", ordem: 0 },
    linkAgendado: { titulo: "[DIAG] Link Futuro", url: "https://example.com/futuro", icone: "calendar", ordem: 1, agendado_para: new Date(Date.now() + 86400000).toISOString() },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando configuração...");
      const dados = ctx.dadosTeste() as any;
      const config = await empresaService.salvarEmpresaConfig(ctx.empresaId, dados.config);
      ctx.log("success", `config salva: slug="${config.slug}"`);

      ctx.log("info", "criando seção...");
      const secao = await empresaService.criarSecao(ctx.empresaId, dados.secao);
      ctx.log("success", `seção: id=${secao.id}, "${secao.titulo}"`);
      ctx.salvarId("secaoId", secao.id);

      ctx.log("info", "criando link na seção...");
      const link = await empresaService.criarLink(ctx.empresaId, secao.id, dados.link);
      ctx.log("success", `link: id=${link.id}, "${link.titulo}"`);
      ctx.salvarId("linkId", link.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando seções...");
      const secoes = await empresaService.listarSecoes(ctx.empresaId);
      ctx.log("success", `${secoes.length} seções encontradas`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("secaoId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando seção id=${id}...`);
      await empresaService.atualizarSecao(id, { titulo: "[DIAG] Seção Atualizada" });
      ctx.log("success", "seção atualizada");
    },
    delete: async (ctx) => {
      for (const k of ["linkId", "secaoId"]) {
        const id = ctx.recuperarId(k);
        if (!id) continue;
        ctx.log("info", `excluindo ${k}=${id}...`);
        if (k === "linkId") await empresaService.deletarLink(id).catch(() => {});
        if (k === "secaoId") await empresaService.deletarSecao(id).catch(() => {});
        ctx.log("success", `${k} excluído`);
      }
    },
  },

  acoes: [
    {
      key: "ciclo_linktree",
      label: "Ciclo Completo LinkTree",
      descricao: "Cria config → seção → link → clique → analytics → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando configuração...");
        const dados = ctx.dadosTeste() as any;
        await empresaService.salvarEmpresaConfig(ctx.empresaId, dados.config);
        ctx.log("success", "config salva");

        ctx.log("info", "2) Criando seção...");
        const secao = await empresaService.criarSecao(ctx.empresaId, dados.secao);
        ctx.log("success", `seção: id=${secao.id}`);
        ctx.salvarId("secaoId", secao.id);

        ctx.log("info", "3) Criando link...");
        const link = await empresaService.criarLink(ctx.empresaId, secao.id, dados.link);
        ctx.log("success", `link: id=${link.id}`);
        ctx.salvarId("linkId", link.id);

        ctx.log("info", "4) Registrando cliques (3x)...");
        for (let i = 0; i < 3; i++) await empresaService.registrarClique(link.id, ctx.empresaId);
        ctx.log("success", "cliques registrados");

        ctx.log("info", "5) Analytics...");
        const analytics = await empresaService.listarAnalytics(ctx.empresaId, "7d");
        ctx.log("success", `analytics: ${analytics.length} links com cliques`);
      },
      cleanup: async (ctx) => {
        const lid = ctx.recuperarId("linkId"); if (lid) { await empresaService.deletarLink(lid).catch(() => {}); }
        const sid = ctx.recuperarId("secaoId"); if (sid) { await empresaService.deletarSecao(sid).catch(() => {}); }
      },
    },
    {
      key: "links_publicos_reordenacao",
      label: "Links Públicos e Reordenação",
      descricao: "Verifica slug, reordena seções e links → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Verificando slug disponível...");
        const slug = `diag-${Date.now()}`;
        const disponivel = await empresaService.verificarSlugDisponivel(slug);
        ctx.log("success", `slug '${slug}' disponível: ${disponivel}`);

        ctx.log("info", "2) Criando config, seção e 2 links...");
        const dados = ctx.dadosTeste() as any;
        await empresaService.salvarEmpresaConfig(ctx.empresaId, { ...dados.config, slug });
        const secao = await empresaService.criarSecao(ctx.empresaId, dados.secao);
        ctx.salvarId("secaoId", secao.id);
        const l1 = await empresaService.criarLink(ctx.empresaId, secao.id, dados.link);
        const l2 = await empresaService.criarLink(ctx.empresaId, secao.id, { ...dados.link, titulo: "[DIAG] Link 2", ordem: 1, url: "https://example.com/2" });
        ctx.log("success", "config + seção + 2 links criados");

        ctx.log("info", "3) Reordenando links...");
        await empresaService.reordenarLinks([
          { id: l2.id, ordem: 0 },
          { id: l1.id, ordem: 1 },
        ]);
        ctx.log("success", "links reordenados");

        ctx.log("info", "4) Buscando URL pública...");
        const url = empresaService.buildEmpresaLinktreeUrl(slug);
        ctx.log("success", `URL pública: ${url}`);
      },
      cleanup: async (ctx) => {
        const sid = ctx.recuperarId("secaoId");
        if (sid) { await empresaService.deletarSecao(sid).catch(() => {}); }
      },
    },
  ],
};
