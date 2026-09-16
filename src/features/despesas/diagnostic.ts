import type { DiagnosticPlan } from "~/core/diagnostic";
import * as despesasService from "./services/despesas.service";
import * as tiposService from "./services/tipos.service";
import * as periodosService from "./services/periodos.service";
import * as enviosService from "./services/envios.service";
import * as pagamentosService from "./services/pagamentos.service";

export const despesasDiagnosticPlan: DiagnosticPlan = {
  key: "despesas",
  nome: "Despesas em Rota",
  dadosTeste: () => ({
    tipo: { empresa_id: "", nome: "[DIAG] Alimentação", ativo: true },
    periodo: { empresa_id: "", data_inicio: new Date().toISOString().slice(0, 10), data_fim: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), status: "aberto" as const },
    despesa: { tipo_id: "", valor: 42.50, descricao: "[DIAG] Despesa de teste", data_despesa: new Date().toISOString().slice(0, 10) },
    pagamento: { valor: 42.50, forma_pagamento: "pix" as const },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando tipo despesa...");
      const dados = ctx.dadosTeste() as any;
      const tipo = await tiposService.criarTipoDespesa({ ...dados.tipo, empresa_id: ctx.empresaId });
      ctx.log("success", `tipo criado: id=${tipo.id}, nome="${tipo.nome}"`);
      ctx.salvarId("tipoId", tipo.id);

      ctx.log("info", "criando período...");
      const periodo = await periodosService.criarPeriodo({ ...dados.periodo, empresa_id: ctx.empresaId });
      ctx.log("success", `período criado: id=${periodo.id}`);
      ctx.salvarId("periodoId", periodo.id);

      ctx.log("info", "criando despesa...");
      const despesa = await despesasService.criarDespesa(ctx.usuarioId, { ...dados.despesa, tipo_id: tipo.id, periodo_id: periodo.id });
      ctx.log("success", `despesa: id=${despesa.id}, valor=${despesa.valor}, status=${despesa.status}`);
      ctx.salvarId("despesaId", despesa.id);
    },
    read: async (ctx) => {
      const id = ctx.recuperarId("despesaId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `buscando despesa id=${id}...`);
      const despesa = await despesasService.buscarDespesa(id);
      ctx.log("success", `despesa: valor=${despesa.valor}, status=${despesa.status}`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("despesaId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando despesa id=${id}...`);
      const despesa = await despesasService.atualizarDespesa(id, { descricao: "[DIAG] Despesa Atualizada" });
      ctx.log("success", `despesa atualizada: "${despesa.descricao}"`);
    },
    delete: async (ctx) => {
      for (const k of ["despesaId", "periodoId", "tipoId"]) {
        const id = ctx.recuperarId(k);
        if (!id) continue;
        ctx.log("info", `excluindo ${k}=${id}...`);
        if (k === "despesaId") await despesasService.excluirDespesa(id).catch(() => {});
        if (k === "periodoId") await periodosService.excluirPeriodo(id).catch(() => {});
        if (k === "tipoId") await tiposService.excluirTipoDespesa(id).catch(() => {});
        ctx.log("success", `${k} excluído`);
      }
    },
  },

  acoes: [
    {
      key: "ciclo_despesa",
      label: "Ciclo Completo Despesa",
      descricao: "Cria tipo → período → despesa → envia → aprova → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando tipo despesa...");
        const dados = ctx.dadosTeste() as any;
        const tipo = await tiposService.criarTipoDespesa({ ...dados.tipo, empresa_id: ctx.empresaId });
        ctx.log("success", `tipo: id=${tipo.id}`);
        ctx.salvarId("tipoId", tipo.id);

        ctx.log("info", "2) Criando período...");
        const periodo = await periodosService.criarPeriodo({ ...dados.periodo, empresa_id: ctx.empresaId });
        ctx.log("success", `período: id=${periodo.id}`);
        ctx.salvarId("periodoId", periodo.id);

        ctx.log("info", "3) Criando despesa...");
        const despesa = await despesasService.criarDespesa(ctx.usuarioId, { ...dados.despesa, tipo_id: tipo.id, periodo_id: periodo.id });
        ctx.log("success", `despesa: id=${despesa.id}, status=rascunho`);
        ctx.salvarId("despesaId", despesa.id);

        ctx.log("info", "4) Enviando despesas do período...");
        await despesasService.enviarDespesas(periodo.id, ctx.usuarioId);
        ctx.log("success", "despesas enviadas");

        ctx.log("info", "5) Aprovando despesa...");
        const aprovada = await despesasService.aprovarDespesa(despesa.id);
        ctx.log("success", `despesa aprovada: status=${aprovada.status}`);
      },
      cleanup: async (ctx) => {
        const did = ctx.recuperarId("despesaId"); if (did) { await despesasService.excluirDespesa(did).catch(() => {}); }
        const pid = ctx.recuperarId("periodoId"); if (pid) { await periodosService.excluirPeriodo(pid).catch(() => {}); }
        const tid = ctx.recuperarId("tipoId"); if (tid) { await tiposService.excluirTipoDespesa(tid).catch(() => {}); }
      },
    },
    {
      key: "fluxo_reprovacao_pagamento",
      label: "Reprovação e Pagamento",
      descricao: "Cria despesa → envia → reprova → cria pagamento → marca pago → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando tipo + período + despesa...");
        const dados = ctx.dadosTeste() as any;
        const tipo = await tiposService.criarTipoDespesa({ ...dados.tipo, empresa_id: ctx.empresaId });
        ctx.salvarId("tipoId", tipo.id);
        const periodo = await periodosService.criarPeriodo({ ...dados.periodo, empresa_id: ctx.empresaId });
        ctx.salvarId("periodoId", periodo.id);
        const despesa = await despesasService.criarDespesa(ctx.usuarioId, { ...dados.despesa, tipo_id: tipo.id, periodo_id: periodo.id });
        ctx.log("success", `despesa: id=${despesa.id}`);
        ctx.salvarId("despesaId", despesa.id);

        ctx.log("info", "2) Enviando despesa...");
        const envio = await enviosService.criarOuAtualizarEnvio(ctx.usuarioId, periodo.id);
        ctx.salvarId("envioId", envio.id);
        await despesasService.enviarDespesas(periodo.id, ctx.usuarioId);
        ctx.log("success", "despesa enviada");

        ctx.log("info", "3) Reprovando despesa...");
        const reprovada = await despesasService.reprovarDespesa(despesa.id, "Documento inválido");
        ctx.log("success", `despesa reprovada: status=${reprovada.status}`);

        ctx.log("info", "4) Criando pagamento manual...");
        const pagamento = await pagamentosService.criarPagamento({
          envio_id: envio.id,
          valor: dados.pagamento.valor,
          forma_pagamento: dados.pagamento.forma_pagamento,
          data_pagamento: new Date().toISOString().slice(0, 10),
        });
        ctx.log("success", `pagamento criado: id=${pagamento.id}, valor=${pagamento.valor}`);
        ctx.salvarId("pagamentoId", pagamento.id);

        ctx.log("info", "5) Marcando como pago...");
        const pago = await pagamentosService.marcarComoPago(pagamento.id);
        ctx.log("success", `pagamento confirmado: status=${(pago as any)?.status ?? "ok"}`);
      },
      cleanup: async (ctx) => {
        const paid = ctx.recuperarId("pagamentoId"); if (paid) { await pagamentosService.cancelarPagamento(paid).catch(() => {}); }
        const did = ctx.recuperarId("despesaId"); if (did) { await despesasService.excluirDespesa(did).catch(() => {}); }
        const pid = ctx.recuperarId("periodoId"); if (pid) { await periodosService.excluirPeriodo(pid).catch(() => {}); }
        const tid = ctx.recuperarId("tipoId"); if (tid) { await tiposService.excluirTipoDespesa(tid).catch(() => {}); }
      },
    },
  ],
};
