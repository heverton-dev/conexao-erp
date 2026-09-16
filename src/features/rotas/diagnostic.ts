import type { DiagnosticPlan } from "~/core/diagnostic";
import * as rotasService from "./services/rotas.service";
import * as clientesBaseService from "./services/clientes-base.service";
import * as formService from "./services/form.service";

export const rotasDiagnosticPlan: DiagnosticPlan = {
  key: "rotas",
  nome: "Rotas de Visitas",
  dadosTeste: () => ({
    rota: {
      titulo: "[DIAG] Rota de Teste",
      data_rota: new Date().toISOString().slice(0, 10),
      tipo: "diaria" as const,
      cliente_ids: [],
    },
    clienteBase: {
      nome: "[DIAG] Cliente Base", cidade: "São Paulo", estado: "SP",
      latitude: -23.5505, longitude: -46.6333, endereco: "Av. Paulista, 1000",
      telefone: "11988887777", email: "cliente_base@diag.com",
    },
    pergunta: {
      titulo: "[DIAG] Cliente satisfeito?", tipo: "boolean" as const, obrigatoria: true,
    },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando rota...");
      const dados = ctx.dadosTeste() as any;
      const rota = await rotasService.criarRota(ctx.empresaId, ctx.usuarioId, dados.rota);
      ctx.log("success", `rota: id=${rota.id}, "${rota.titulo}", status=${rota.status}`);
      ctx.salvarId("rotaId", rota.id);
    },
    read: async (ctx) => {
      const id = ctx.recuperarId("rotaId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `buscando rota id=${id}...`);
      const rota = await rotasService.buscarRota(id);
      ctx.log("success", `rota: "${rota.titulo}", status=${rota.status}`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("rotaId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando rota id=${id}...`);
      const rota = await rotasService.atualizarRota(id, { titulo: "[DIAG] Rota Atualizada" });
      ctx.log("success", `rota atualizada: "${rota.titulo}"`);
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("rotaId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo rota id=${id}...`);
      await rotasService.excluirRota(id);
      ctx.log("success", `rota ${id} excluída`);
    },
  },

  acoes: [
    {
      key: "ciclo_completo_rota",
      label: "Ciclo Completo Rota",
      descricao: "Cria → inicia → finaliza com stats → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando rota...");
        const dados = ctx.dadosTeste() as any;
        const rota = await rotasService.criarRota(ctx.empresaId, ctx.usuarioId, dados.rota);
        ctx.log("success", `rota: id=${rota.id}`);
        ctx.salvarId("rotaId", rota.id);

        ctx.log("info", "2) Iniciando execução...");
        await rotasService.iniciarRota(rota.id, { lat: -23.5505, lng: -46.6333 });
        ctx.log("success", "rota em execução");

        ctx.log("info", "3) Finalizando rota...");
        const stats = { total_visitas: 5, total_km: 42, total_tempo_trajeto_min: 180, valor_reembolso: 50.0 };
        await rotasService.finalizarRota(rota.id, { lat: -23.561, lng: -46.656 }, stats);
        ctx.log("success", "rota finalizada");
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("rotaId");
        if (id) { await rotasService.excluirRota(id).catch(() => {}); }
      },
    },
    {
      key: "clientes_base",
      label: "Clientes Base",
      descricao: "Cria cliente base → lista com filtros → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando cliente base...");
        const dados = ctx.dadosTeste() as any;
        const cl = await clientesBaseService.criarClienteBase({ ...dados.clienteBase, empresa_id: ctx.empresaId });
        ctx.log("success", `cliente base: id=${cl.id}, nome="${cl.nome}", cidade=${cl.cidade}`);
        ctx.salvarId("clienteBaseId", cl.id);

        ctx.log("info", "2) Listando clientes base...");
        const todos = await clientesBaseService.listarClientesBase(ctx.empresaId);
        ctx.log("success", `${todos.length} cliente(s) base na empresa`);

        ctx.log("info", "3) Filtrando por cidade...");
        const filtrados = await clientesBaseService.listarClientesBase(ctx.empresaId, undefined, { cidade: "São Paulo" });
        ctx.log("success", `${filtrados.length} cliente(s) em São Paulo`);

        ctx.log("info", "4) Buscando por ID...");
        const encontrado = await clientesBaseService.buscarClienteBase(cl.id);
        ctx.log("success", `cliente: "${encontrado.nome}", tel=${encontrado.telefone}`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("clienteBaseId");
        if (id) { await clientesBaseService.excluirClienteBase(id).catch(() => {}); }
      },
    },
    {
      key: "formulario_visita",
      label: "Formulário de Visita",
      descricao: "Cria pergunta → lista → atualiza → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando pergunta de formulário...");
        const dados = ctx.dadosTeste() as any;
        const pergunta = await formService.criarPergunta({ ...dados.pergunta, empresa_id: ctx.empresaId });
        ctx.log("success", `pergunta: id=${pergunta.id}, "${pergunta.titulo}", tipo=${pergunta.tipo}`);
        ctx.salvarId("perguntaId", pergunta.id);

        ctx.log("info", "2) Listando perguntas...");
        const todas = await formService.listarPerguntas(ctx.empresaId);
        ctx.log("success", `${todas.length} pergunta(s) de formulário`);

        ctx.log("info", "3) Atualizando pergunta...");
        await formService.atualizarPergunta(pergunta.id, { titulo: "[DIAG] Pergunta Atualizada?" });
        ctx.log("success", "pergunta atualizada");
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("perguntaId");
        if (id) { await formService.excluirPergunta(id).catch(() => {}); }
      },
    },
  ],
};
