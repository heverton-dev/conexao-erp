import type { DiagnosticPlan } from "~/core/diagnostic";
import { supabase } from "~/core/supabase";
import {
  criarCadastro,
  buscarCadastro,
  atualizarCadastro,
  deletarCadastro,
  aprovarCadastro,
  reprovarCadastro,
  solicitarCorrecao,
  listarCadastros,
  type CadastroInput,
} from "~/features/clientes";

export const cadastrosDiagnosticPlan: DiagnosticPlan = {
  key: "cadastros",
  nome: "Cadastros",
  dadosTeste: () => ({
    nome_temporario: "[DIAG] Cadastro Teste",
    tipo_acao: "solicitar_cadastro",
    forma_compartilhamento: "whatsapp",
    lead_nome: "[DIAG] Lead Teste",
    lead_email: "diag@teste.com",
    lead_whatsapp: "11999999999",
  }),

  crud: {
    create: async (ctx) => {
      ctx.log("info", "criando cadastro via criarCadastro...");
      const dados = ctx.dadosTeste() as CadastroInput;
      const cadastro = await criarCadastro(dados);
      ctx.log("success", `cadastro criado: id=${cadastro.id}, status=${cadastro.status}`);
      ctx.salvarId("cadastroId", cadastro.id);
    },
    read: async (ctx) => {
      const id = ctx.recuperarId("cadastroId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `buscando cadastro id=${id}...`);
      const cadastro = await buscarCadastro(id);
      ctx.log("success", `cadastro: nome_temporario="${cadastro.nome_temporario}", status=${cadastro.status}`);
    },
    update: async (ctx) => {
      const id = ctx.recuperarId("cadastroId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `atualizando cadastro id=${id}...`);
      const atualizado = await atualizarCadastro(id, { nome_temporario: "[DIAG] Cadastro Atualizado" });
      ctx.log("success", `cadastro atualizado: "${atualizado.nome_temporario}"`);
    },
    delete: async (ctx) => {
      const id = ctx.recuperarId("cadastroId");
      if (!id) throw new Error("Execute 'Criar' primeiro");
      ctx.log("info", `excluindo cadastro id=${id}...`);
      await deletarCadastro(id);
      ctx.log("success", `cadastro ${id} excluído`);
    },
  },

  acoes: [
    {
      key: "pipeline_completo",
      label: "Pipeline Completo",
      descricao: "Simula pipeline: link_gerado → dados_enviados → em_analise → aprovado (cria cliente de verdade)",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando cadastro com status=link_gerado...");
        const cadastro = await criarCadastro({
          nome_temporario: "[DIAG] Pipeline Teste",
          lead_nome: "[DIAG] Pipeline Lead",
        });
        ctx.log("success", `cadastro: id=${cadastro.id}, status=${cadastro.status}`);
        ctx.salvarId("cadastroId", cadastro.id);

        ctx.log("info", "2) Avançando para dados_enviados...");
        await atualizarCadastro(cadastro.id, { status: "dados_enviados" });
        const c2 = await buscarCadastro(cadastro.id);
        ctx.log("success", `status agora: ${c2.status}`);

        ctx.log("info", "3) Avançando para em_analise...");
        await atualizarCadastro(cadastro.id, { status: "em_analise" });
        const c3 = await buscarCadastro(cadastro.id);
        ctx.log("success", `status agora: ${c3.status}`);

        ctx.log("info", "4) Aprovando cadastro...");
        const aprovado = await aprovarCadastro(cadastro.id, `DIAG-${cadastro.id.slice(0, 8)}`);
        ctx.log("success", `status final: ${aprovado.status}, codigo_cliente=${aprovado.codigo_cliente}`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("cadastroId");
        if (id) {
          await supabase.from("clientes").delete().eq("cadastro_id", id);
          await supabase.from("cadastros").delete().eq("id", id);
        }
      },
    },
    {
      key: "reprovacao_correcao",
      label: "Reprovação e Correção",
      descricao: "Simula pipeline com correção e reprovação",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando cadastro em análise...");
        const cadastro = await criarCadastro({
          nome_temporario: "[DIAG] Reprovação Teste",
          lead_nome: "[DIAG] Reprovação Lead",
        });
        await atualizarCadastro(cadastro.id, { status: "em_analise" });
        ctx.log("success", `cadastro: id=${cadastro.id}`);
        ctx.salvarId("cadastroId", cadastro.id);

        ctx.log("info", "2) Solicitando correção (em_correcao)...");
        const emCorrecao = await solicitarCorrecao(cadastro.id, "Documento ilegível", ["cpf", "endereco"]);
        ctx.log("success", `status alterado para ${emCorrecao.status}`);

        ctx.log("info", "3) Reprovando cadastro...");
        const reprovado = await reprovarCadastro(cadastro.id, "Documento ilegível");
        ctx.log("success", `status final: ${reprovado.status}`);
      },
      cleanup: async (ctx) => {
        const id = ctx.recuperarId("cadastroId");
        if (id) { await supabase.from("cadastros").delete().eq("id", id); }
      },
    },
    {
      key: "ciclo_cadastro",
      label: "Ciclo Básico Cadastro",
      descricao: "Cria cadastro → lê → atualiza → lista → exclui",
      steps: async (ctx) => {
        ctx.log("info", "1) Criando cadastro...");
        const dados = ctx.dadosTeste() as CadastroInput;
        const cadastro = await criarCadastro(dados);
        ctx.log("success", `cadastro: id=${cadastro.id}`);
        ctx.salvarId("cadastroId", cadastro.id);

        ctx.log("info", "2) Buscando cadastro...");
        const encontrado = await buscarCadastro(cadastro.id);
        ctx.log("success", `encontrado: "${encontrado.nome_temporario}", status=${encontrado.status}`);

        ctx.log("info", "3) Listando cadastros...");
        const lista = await listarCadastros({
          search: dados.nome_temporario ?? undefined,
        });
        ctx.log("success", `cadastros encontrados: ${lista.length}`);

        ctx.log("info", "4) Excluindo cadastro...");
        await deletarCadastro(cadastro.id);
        ctx.log("success", "cadastro excluído no próprio ciclo");
      },
      cleanup: async () => {},
    },
  ],
};
