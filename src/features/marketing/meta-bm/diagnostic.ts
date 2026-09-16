import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";
import * as authService from "./services/auth.service";
import * as postsService from "./services/posts.service";
import * as campaignsService from "./services/campaigns.service";

export const metaBmDiagnosticPlan: DiagnosticPlan = {
  key: "mktg-meta-bm",
  nome: "Meta Business Manager",
  dadosTeste: () => ({
    post: { conteudo: "[DIAG] Post de teste - diagnóstico", plataforma: "both" as const },
    postAgendado: { conteudo: "[DIAG] Post agendado - diagnóstico", plataforma: "instagram" as const },
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando post Meta via service...");
      const dados = ctx.dadosTeste() as any;
      const post = await postsService.criarPost({ empresa_id: ctx.empresaId, conteudo: dados.post.conteudo, plataforma: dados.post.plataforma });
      if (!post) { ctx.log("error", "falha ao criar post"); return; }
      ctx.log("success", `post criado: id=${post.id}, status=${post.status}`);
      ctx.salvarId("postId", post.id);
    },
    read: async (ctx) => {
      ctx.log("info", "listando posts via service...");
      const posts = await postsService.listarPosts(ctx.empresaId);
      ctx.log("success", `${posts.length} posts`);
    },
    update: async (ctx) => {
      ctx.log("info", "testando agendamento de post...");
      const id = ctx.recuperarId("postId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      const futuro = new Date(Date.now() + 86400000).toISOString();
      await postsService.agendarPost(id, futuro);
      ctx.log("success", "post agendado");
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("postId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo post id=${id}...`);
      await postsService.deletarPost(id);
      ctx.log("success", "post excluído");
    },
  },

  acoes: [
    {
      key: "ciclo_meta",
      label: "Ciclo Completo Meta BM",
      descricao: "Cria post → lista campanhas → verifica conexão → agenda → limpa",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando post via service...");
        const dados = ctx.dadosTeste() as any;
        const post = await postsService.criarPost({ empresa_id: ctx.empresaId, ...dados.post });
        if (!post) { ctx.log("error", "falha ao criar post"); return; }
        ctx.log("success", `post: id=${post.id}`);
        ctx.salvarId("postId", post.id);

        ctx.log("info", "2) Verificando conexão Meta...");
        const conta = await authService.verificarConexao(ctx.empresaId);
        ctx.log("info", `conexão Meta: ${conta ? "conectada" : "não configurada"}`);

        ctx.log("info", "3) Listando campanhas...");
        const camps = await campaignsService.listarCampanhas(ctx.empresaId);
        ctx.log("success", `${camps.length} campanha(s) disponíveis`);

        ctx.log("info", "4) Criando post com agendamento...");
        const futuro = new Date(Date.now() + 86400000).toISOString();
        const postAgendado = await postsService.criarPost({ empresa_id: ctx.empresaId, ...dados.postAgendado, agendado_para: futuro });
        if (postAgendado) {
          ctx.log("success", `post agendado: id=${postAgendado.id}, status=${postAgendado.status}`);
          await postsService.deletarPost(postAgendado.id);
        }
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("postId");
        if (id) { await postsService.deletarPost(id); }
      },
    },
    {
      key: "conexao_meta",
      label: "Conexão Meta",
      descricao: "Verifica status da conexão Meta e lista contas",
      steps: async (ctx) => {
        ctx.log("info", "1) Verificando conexão...");
        const conexao = await authService.verificarConexao(ctx.empresaId);
        ctx.log("info", conexao ? "conta conectada" : "nenhuma conta conectada");

        ctx.log("info", "2) Obtendo detalhes da conta...");
        const conta = await authService.obterConta(ctx.empresaId);
        if (conta) {
          ctx.log("success", `conta: user_id=${(conta as any).meta_user_id?.slice(0, 10)}…, status=${(conta as any).status}`);
          ctx.log("info", `   expira em: ${(conta as any).token_expires_at?.slice(0, 10)}`);
        } else {
          ctx.log("success", "nenhuma conta Meta configurada (esperado)");
        }
      },
      cleanup: async () => {},
    },
  ],
};
