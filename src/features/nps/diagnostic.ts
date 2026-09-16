import type { DiagnosticPlan } from "~/core/diagnostic";
import * as perguntasService from "./services/perguntas";
import * as respostasService from "./services/respostas";
import * as sentimentService from "./services/sentiment";
import * as webhooksService from "./services/webhooks";
import { calcularMetricasVendedor } from "./services/sellerMetrics";

export const npsDiagnosticPlan: DiagnosticPlan = {
  key: "nps",
  nome: "NPS",
  dadosTeste: () => ({
    pergunta: {
      key: "diag_recomendaria",
      order_index: 0,
      type: "nps" as const,
      question_text: "[DIAG] Como avalia nosso serviço?",
      options: [] as string[],
      required: true,
      active: true,
      is_system: false,
    },
    resposta: {
      nps_score: 9,
      nps_comment: "[DIAG] Ótimo serviço!",
      vendor_name: "Vendedor A",
      source: "diagnostico",
    },
    respostaRuim: {
      nps_score: 3,
      nps_comment: "[DIAG] Precisa melhorar",
      vendor_name: "Vendedor B",
      source: "diagnostico",
    },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando pergunta NPS...");
      const dados = ctx.dadosTeste() as any;
      const pergunta = await perguntasService.criarPergunta(ctx.empresaId, dados.pergunta);
      ctx.log("success", `pergunta: id=${pergunta.id}, "${pergunta.question_text}"`);
      ctx.salvarId("perguntaId", pergunta.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando perguntas...");
      const perguntas = await perguntasService.listarPerguntas(ctx.empresaId);
      ctx.log("success", `${perguntas.length} perguntas encontradas`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("perguntaId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando pergunta id=${id}...`);
      await perguntasService.atualizarPergunta(id, { question_text: "[DIAG] Pergunta Atualizada?" });
      ctx.log("success", "pergunta atualizada");
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("perguntaId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo pergunta id=${id}...`);
      await perguntasService.excluirPergunta(id);
      ctx.log("success", `pergunta ${id} excluída`);
    },
  },

  acoes: [
    {
      key: "ciclo_nps",
      label: "Ciclo NPS Score",
      descricao: "Cria pergunta → registra respostas (boa + ruim) → calcula score → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando pergunta NPS...");
        const dados = ctx.dadosTeste() as any;
        const pergunta = await perguntasService.criarPergunta(ctx.empresaId, dados.pergunta);
        ctx.log("success", `pergunta: id=${pergunta.id}`);
        ctx.salvarId("perguntaId", pergunta.id);

        ctx.log("info", "2) Registrando resposta positiva...");
        const r1 = await respostasService.criarResposta(ctx.empresaId, dados.resposta);
        ctx.log("success", `resposta positiva: id=${r1.id}, nota=${r1.nps_score}`);

        ctx.log("info", "3) Registrando resposta negativa...");
        const r2 = await respostasService.criarResposta(ctx.empresaId, dados.respostaRuim);
        ctx.log("success", `resposta negativa: id=${r2.id}, nota=${r2.nps_score}`);

        ctx.log("info", "4) Calculando NPS score...");
        const todas = await respostasService.listarRespostas(ctx.empresaId);
        const scoreInfo = respostasService.calcularNpsScore(todas);
        ctx.log("success", `NPS score: ${scoreInfo.score}`);

        ctx.log("info", "5) Verificando distribuição NPS...");
        const dist = respostasService.distribuicaoNps(todas);
        const notasComRespostas = dist.filter((d) => d.count > 0).length;
        ctx.log(
          "success",
          `distribuição: P=${scoreInfo.promoters} Pa=${scoreInfo.passives} D=${scoreInfo.detractors} (${notasComRespostas} nota(s) distintas)`,
        );

        ctx.salvarId("respostaIds", JSON.stringify([r1.id, r2.id]));
      },
      cleanup: async (ctx) => {
        const raw = ctx.recuperarId("respostaIds");
        if (raw) { try { const ids = JSON.parse(raw); await respostasService.excluirRespostas(ids).catch(() => {}); } catch {} }
        const pid = ctx.recuperarId("perguntaId");
        if (pid) { await perguntasService.excluirPergunta(pid).catch(() => {}); }
      },
    },
    {
      key: "seller_metrics",
      label: "Métricas por Vendedor",
      descricao: "Registra respostas com vendas diferentes → calcula métricas → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando pergunta...");
        const dados = ctx.dadosTeste() as any;
        const pergunta = await perguntasService.criarPergunta(ctx.empresaId, dados.pergunta);
        ctx.salvarId("perguntaId", pergunta.id);

        ctx.log("info", "2) Registrando respostas para 2 vendedores...");
        const r1 = await respostasService.criarResposta(ctx.empresaId, {
          ...dados.resposta,
          nps_score: 10,
          nps_comment: "Excelente!",
          vendor_name: "Vendedor A",
        });
        const r2 = await respostasService.criarResposta(ctx.empresaId, {
          ...dados.resposta,
          nps_score: 2,
          nps_comment: "Ruim",
          vendor_name: "Vendedor B",
        });
        ctx.log("success", `respostas registradas: A nota=10, B nota=2`);
        ctx.salvarId("respostaIds", JSON.stringify([r1.id, r2.id]));

        ctx.log("info", "3) Calculando métricas por vendedor...");
        const todas = await respostasService.listarRespostas(ctx.empresaId);
        const metrics = calcularMetricasVendedor(todas);
        ctx.log("success", `${metrics.length} vendedor(es) com métricas`);
        for (const m of metrics) {
          ctx.log("info", `  ${m.vendor}: NPS=${m.nps}`);
        }
      },
      cleanup: async (ctx) => {
        const raw = ctx.recuperarId("respostaIds");
        if (raw) { try { const ids = JSON.parse(raw); await respostasService.excluirRespostas(ids).catch(() => {}); } catch {} }
        const pid = ctx.recuperarId("perguntaId");
        if (pid) { await perguntasService.excluirPergunta(pid).catch(() => {}); }
      },
    },
    {
      key: "webhooks_sentimento",
      label: "Webhooks e Sentimento",
      descricao: "Testa análise de sentimento e webhooks NPS → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Testando análise de sentimento...");
        const positivo = sentimentService.classificarSentimento("Produto excelente, recomendo!");
        const negativo = sentimentService.classificarSentimento("Péssimo, não funciona");
        const neutro = sentimentService.classificarSentimento("Ok, normal");
        ctx.log("success", `sentimentos: positivo=${positivo}, negativo=${negativo}, neutro=${neutro}`);

        ctx.log("info", "2) Listando webhooks NPS...");
        const webhooks = await webhooksService.listarWebhooks(ctx.empresaId);
        ctx.log("success", `${webhooks.length} webhook(s) configurado(s)`);

        ctx.log("info", "3) Criando webhook de teste...");
        const wh = await webhooksService.salvarWebhook(ctx.empresaId, "https://httpbin.org/post", false);
        ctx.log("success", `webhook salvo: id=${wh.id}`);
        ctx.salvarId("webhookId", wh.id);

        ctx.log("info", "4) Testando CSAT matrix...");
        const todas = await respostasService.listarRespostas(ctx.empresaId);
        const csat = respostasService.distribuicaoCsat(todas);
        ctx.log("success", `CSAT distribuição obtida: ${csat.length} categoria(s)`);
      },
      cleanup: async (ctx) => {
        const wid = ctx.recuperarId("webhookId");
        if (wid) { await webhooksService.excluirWebhook(wid).catch(() => {}); }
      },
    },
  ],
};
