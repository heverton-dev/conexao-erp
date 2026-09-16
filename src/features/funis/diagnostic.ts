import type { DiagnosticPlan } from "~/core/diagnostic";
import * as funisService from "./services/funis";
import * as colunasService from "./services/colunas";
import * as tarefasService from "./services/tarefas";
import * as comentariosService from "./services/comments";
import * as labelsService from "./services/labels";
import * as anexosService from "./services/attachments";
import * as permissoesService from "./services/permissoes";
import * as templatesService from "./services/templates";

export const funisDiagnosticPlan: DiagnosticPlan = {
  key: "funis",
  nome: "Funis Kanban",
  dadosTeste: () => ({
    funil: { titulo: "[DIAG] Funil de Teste", descricao: "Funil criado pelo diagnóstico", colunas: ["Backlog", "Em Andamento", "Concluído"] },
    tarefa: { titulo: "[DIAG] Tarefa de Teste", descricao: "Tarefa criada pelo diagnóstico", posicao: 0 },
    label: { nome: "[DIAG] Urgente", cor: "#ef4444" },
    template: { nome: "[DIAG] Template Teste", descricao: "Template diagnóstico", colunas: ["A Fazer", "Feito"] },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando funil...");
      const dados = ctx.dadosTeste() as any;
      const funil = await funisService.criarFunil(dados.funil);
      ctx.log("success", `funil criado: id=${funil.id}, titulo="${funil.titulo}"`);
      ctx.salvarId("funilId", funil.id);
    },
    read: async (ctx) => {
      const id = ctx.recuperarId("funilId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `buscando funil id=${id}...`);
      const funil = await funisService.buscarFunil(id);
      ctx.log("success", `funil: "${funil.titulo}", colunas=${funil.colunas?.length ?? 0}, tarefas=${funil.tarefas?.length ?? 0}`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("funilId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando funil id=${id}...`);
      const funil = await funisService.atualizarFunil(id, { titulo: "[DIAG] Funil Atualizado" });
      ctx.log("success", `funil atualizado: "${funil.titulo}"`);
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("funilId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo funil id=${id}...`);
      await funisService.deletarFunil(id);
      ctx.log("success", `funil ${id} excluído`);
    },
  },

  acoes: [
    {
      key: "ciclo_funil",
      label: "Ciclo Básico Funil",
      descricao: "Cria funil → colunas → tarefa → move tarefa → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando funil com colunas...");
        const dados = ctx.dadosTeste() as any;
        const funil = await funisService.criarFunil(dados.funil);
        ctx.log("success", `funil: id=${funil.id}, colunas=${funil.colunas?.length ?? 0}`);
        ctx.salvarId("funilId", funil.id);

        const colunas = await colunasService.listarColunas(funil.id);
        const primeiraColuna = colunas[0];
        const segundaColuna = colunas[1];
        if (!primeiraColuna || !segundaColuna) throw new Error("Colunas insuficientes");
        ctx.log("success", `colunas: "${primeiraColuna.titulo}" + "${segundaColuna.titulo}"`);

        ctx.log("info", "2) Criando tarefa...");
        const tarefa = await tarefasService.criarTarefa({
          funil_id: funil.id, coluna_id: primeiraColuna.id, titulo: dados.tarefa.titulo,
          descricao: dados.tarefa.descricao,
        });
        ctx.log("success", `tarefa: id=${tarefa.id}`);
        ctx.salvarId("tarefaId", tarefa.id);

        ctx.log("info", "3) Movendo tarefa...");
        const movida = await tarefasService.moverTarefa(tarefa.id, segundaColuna.id, 0);
        ctx.log("success", `tarefa movida para coluna ${movida.coluna_id?.slice(0, 8)}…`);
      },
      cleanup: async (ctx) => {
        const fid = ctx.recuperarId("funilId");
        if (fid) { await funisService.deletarFunil(fid).catch(() => {}); }
      },
    },
    {
      key: "comentarios_labels",
      label: "Comentários e Labels",
      descricao: "Cria funil → tarefa → adiciona comentários → labels → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando funil e tarefa...");
        const dados = ctx.dadosTeste() as any;
        const funil = await funisService.criarFunil(dados.funil);
        ctx.salvarId("funilId", funil.id);
        const colunas = await colunasService.listarColunas(funil.id);
        const tarefa = await tarefasService.criarTarefa({
          funil_id: funil.id, coluna_id: colunas[0]!.id, titulo: dados.tarefa.titulo + " [Comentários]", descricao: dados.tarefa.descricao,
        });
        ctx.log("success", `tarefa criada: id=${tarefa.id}`);
        ctx.salvarId("tarefaId", tarefa.id);

        ctx.log("info", "2) Adicionando comentário...");
        const comentario = await comentariosService.criarComentario(tarefa.id, "[DIAG] Comentário de teste");
        ctx.log("success", `comentário criado: id=${comentario.id}`);
        ctx.salvarId("comentarioId", comentario.id);

        ctx.log("info", "3) Criando label e associando à tarefa...");
        const label = await labelsService.criarLabel({ funil_id: funil.id, ...dados.label });
        ctx.log("success", `label criada: id=${label.id}, "${label.nome}"`);
        await labelsService.adicionarLabelTarefa(tarefa.id, label.id);
        ctx.log("success", "label associada à tarefa");

        ctx.log("info", "4) Listando labels da tarefa...");
        const labelsTarefa = await labelsService.listarLabelsTarefa(tarefa.id);
        ctx.log("success", `${labelsTarefa.length} label(s) na tarefa`);
      },
      cleanup: async (ctx) => {
        const fid = ctx.recuperarId("funilId");
        if (fid) { await funisService.deletarFunil(fid).catch(() => {}); }
      },
    },
    {
      key: "template_funil",
      label: "Template de Funil",
      descricao: "Cria template → aplica → verifica funil criado → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando template de funil...");
        const dados = ctx.dadosTeste() as any;
        const template = await templatesService.criarTemplate({ ...dados.template, empresa_id: ctx.empresaId });
        ctx.log("success", `template: id=${template.id}, nome="${template.nome}"`);
        ctx.salvarId("templateId", template.id);

        ctx.log("info", "2) Listando templates...");
        const templates = await templatesService.listarTemplates(ctx.empresaId);
        ctx.log("success", `${templates.length} templates disponíveis`);

        ctx.log("info", "3) Buscando template...");
        const t = await templatesService.buscarTemplate(template.id);
        ctx.log("success", `template: "${t.nome}", colunas=${t.colunas?.length ?? 0}`);
      },
      cleanup: async (ctx) => {
        const tid = ctx.recuperarId("templateId");
        if (tid) { await templatesService.deletarTemplate(tid).catch(() => {}); }
      },
    },
    {
      key: "permissoes_funil",
      label: "Permissões de Funil",
      descricao: "Cria funil → lista permissões → testa consulta → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando funil...");
        const dados = ctx.dadosTeste() as any;
        const funil = await funisService.criarFunil(dados.funil);
        ctx.log("success", `funil: id=${funil.id}`);
        ctx.salvarId("funilId", funil.id);

        ctx.log("info", "2) Listando permissões do funil...");
        const permissoes = await permissoesService.listarPermissoesFunil(funil.id);
        ctx.log("success", `${permissoes.length} permissões no funil`);

        ctx.log("info", "3) Buscando todos os funis...");
        const todos = await funisService.listarFunis();
        ctx.log("success", `total funis: ${todos.length}`);
      },
      cleanup: async (ctx) => {
        const fid = ctx.recuperarId("funilId");
        if (fid) { await funisService.deletarFunil(fid).catch(() => {}); }
      },
    },
  ],
};
