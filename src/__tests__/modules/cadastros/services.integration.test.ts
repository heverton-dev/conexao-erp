import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { supabase } from "~/core/supabase";
import {
  criarCadastro,
  buscarCadastro,
  buscarCadastroCompleto,
  listarCadastros,
  atualizarCadastro,
  aprovarCadastro,
  reprovarCadastro,
  solicitarCorrecao,
  deletarCadastro,
} from "~/features/clientes";

// Integração real contra o Supabase de .env (VITE_SUPABASE_URL/ANON_KEY) — sem mocks.
// Cria e apaga linhas de verdade em cadastros/clientes, autenticado como o usuário de
// .env (EMAIL/PASSWORD) — a policy de RLS de escrita exige um usuário autenticado.
// Pulado se as credenciais não existirem.
const TEM_CREDENCIAIS = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.EMAIL &&
    import.meta.env.PASSWORD,
);

const MARCADOR = `vitest-crud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const nomeMarcado = (sufixo: string) => `${MARCADOR}__${sufixo}`;

describe.skipIf(!TEM_CREDENCIAIS)("cadastros — CRUD real (integração)", () => {
  const idsCadastros: string[] = [];
  const idsClientes: string[] = [];

  beforeAll(async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: import.meta.env.EMAIL,
      password: import.meta.env.PASSWORD,
    });
    if (error) throw error;
  });

  afterEach(async () => {
    for (const id of idsClientes.splice(0)) {
      await supabase.from("clientes").delete().eq("id", id);
    }
    for (const id of idsCadastros.splice(0)) {
      await supabase.from("cadastros").delete().eq("id", id);
    }
  });

  afterAll(async () => {
    // rede de segurança: apaga qualquer sobra desta execução caso algum teste falhe antes da limpeza
    await supabase.from("cadastros").delete().ilike("nome_temporario", `${MARCADOR}%`);
    await supabase.auth.signOut();
  });

  it("criarCadastro insere um cadastro real com status link_gerado", async () => {
    const cadastro = await criarCadastro({
      nome_temporario: nomeMarcado("criar"),
      tipo_acao: "solicitar_cadastro",
      forma_compartilhamento: "whatsapp",
    });
    idsCadastros.push(cadastro.id);

    expect(cadastro.id).toBeTruthy();
    expect(cadastro.status).toBe("link_gerado");
    expect(cadastro.token_acesso).toBeTruthy();
    expect(cadastro.nome_temporario).toBe(nomeMarcado("criar"));
  });

  it("buscarCadastro retorna o cadastro recém-criado", async () => {
    const criado = await criarCadastro({ nome_temporario: nomeMarcado("buscar") });
    idsCadastros.push(criado.id);

    const encontrado = await buscarCadastro(criado.id);
    expect(encontrado.id).toBe(criado.id);
    expect(encontrado.nome_temporario).toBe(nomeMarcado("buscar"));
  });

  it("listarCadastros encontra o cadastro pelo filtro de busca", async () => {
    const criado = await criarCadastro({ nome_temporario: nomeMarcado("listar") });
    idsCadastros.push(criado.id);

    const lista = await listarCadastros({ search: nomeMarcado("listar") });
    expect(lista.some((c) => c.id === criado.id)).toBe(true);
  });

  it("atualizarCadastro persiste alterações e a leitura reflete o novo valor", async () => {
    const criado = await criarCadastro({ nome_temporario: nomeMarcado("atualizar") });
    idsCadastros.push(criado.id);

    const atualizado = await atualizarCadastro(criado.id, {
      observacoes: "atualizado pelo teste de integração",
    });
    expect(atualizado.observacoes).toBe("atualizado pelo teste de integração");

    const relido = await buscarCadastro(criado.id);
    expect(relido.observacoes).toBe("atualizado pelo teste de integração");
  });

  it("buscarCadastroCompleto retorna cadastro sem pf/pj/endereços vinculados", async () => {
    const criado = await criarCadastro({ nome_temporario: nomeMarcado("completo") });
    idsCadastros.push(criado.id);

    const completo = await buscarCadastroCompleto(criado.id);
    expect(completo.cadastro?.id).toBe(criado.id);
    expect(completo.pf).toBeNull();
    expect(completo.pj).toBeNull();
    expect(completo.enderecos).toEqual([]);
  });

  it("reprovarCadastro marca status reprovado com o motivo informado", async () => {
    const criado = await criarCadastro({ nome_temporario: nomeMarcado("reprovar") });
    idsCadastros.push(criado.id);

    const reprovado = await reprovarCadastro(criado.id, "documento ilegível");
    expect(reprovado.status).toBe("reprovado");
    expect(reprovado.comentario_reprovacao).toBe("documento ilegível");
    expect(reprovado.data_finalizacao).toBeTruthy();
  });

  it("solicitarCorrecao gera novo token e marca os campos em correção", async () => {
    const criado = await criarCadastro({ nome_temporario: nomeMarcado("correcao") });
    idsCadastros.push(criado.id);

    const emCorrecao = await solicitarCorrecao(criado.id, "CPF inválido", ["cpf", "endereco"]);
    expect(emCorrecao.status).toBe("em_correcao");
    expect(emCorrecao.comentario_reprovacao).toBe("CPF inválido");
    expect(emCorrecao.campos_correcao).toEqual(["cpf", "endereco"]);
    expect(emCorrecao.token_acesso).not.toBe(criado.token_acesso);
  });

  it("aprovarCadastro aprova o cadastro e cria o cliente correspondente", async () => {
    const criado = await criarCadastro({
      nome_temporario: nomeMarcado("aprovar"),
      lead_nome: nomeMarcado("aprovar-lead"),
    });
    idsCadastros.push(criado.id);

    const codigoCliente = `CLI-${MARCADOR}`;
    const aprovado = await aprovarCadastro(criado.id, codigoCliente);
    expect(aprovado.status).toBe("aprovado");
    expect(aprovado.codigo_cliente).toBe(codigoCliente);
    expect(aprovado.data_finalizacao).toBeTruthy();

    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("cadastro_id", criado.id)
      .single();
    expect(error).toBeNull();
    expect(cliente?.codigo_cliente).toBe(codigoCliente);
    expect(cliente?.nome_doutor).toBe(nomeMarcado("aprovar-lead"));
    if (cliente) idsClientes.push(cliente.id);
  });

  it("deletarCadastro remove o registro do banco", async () => {
    const criado = await criarCadastro({ nome_temporario: nomeMarcado("deletar") });
    idsCadastros.push(criado.id);

    await deletarCadastro(criado.id);
    idsCadastros.pop();

    await expect(buscarCadastro(criado.id)).rejects.toThrow();
  });
});
