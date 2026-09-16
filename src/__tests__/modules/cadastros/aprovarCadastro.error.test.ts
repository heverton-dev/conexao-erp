// Trava a correção do bug real de produção (commit 39d6eeb + fix desta sessão):
// aprovarCadastro só logava a falha ao criar o cliente em console.error e
// devolvia sucesso mesmo assim — a tela marcava "aprovado" com o cliente
// nunca criado. Este teste garante que a falha agora propaga como erro.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { aprovarCadastro } from "~/features/clientes";

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock("~/core/supabase", () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

function builder(result: { data: unknown; error?: unknown }) {
  const self: Record<string, unknown> = {
    select: vi.fn(() => self),
    eq: vi.fn(() => self),
    update: vi.fn(() => self),
    insert: vi.fn(() => ({ data: result.data, error: result.error ?? null })),
    single: vi.fn().mockResolvedValue({
      data: result.data,
      error: result.error ?? null,
    }),
  };
  return self;
}

describe("aprovarCadastro — caminho de erro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lança erro quando a criação do cliente falha, em vez de devolver sucesso silencioso", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "cadastros") {
        return builder({
          data: {
            id: "cad-1",
            status: "aprovado",
            codigo_cliente: "CLI-1",
            lead_nome: "Fulano",
            nome_temporario: null,
            tipo_pessoa: "PF",
            lead_whatsapp: null,
            lead_email: null,
            observacoes: "",
            colaborador: null,
          },
        });
      }
      // "clientes": simula falha no insert (RLS, constraint, coluna NOT NULL nova, etc.)
      return builder({ data: null, error: { message: "duplicate key value" } });
    });

    await expect(aprovarCadastro("cad-1", "CLI-1")).rejects.toThrow(
      /cad-1.*aprovado.*criação do cliente falhou/s,
    );
  });

  it("retorna o cadastro normalmente quando a criação do cliente tem sucesso", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "cadastros") {
        return builder({
          data: {
            id: "cad-2",
            status: "aprovado",
            codigo_cliente: "CLI-2",
            lead_nome: "Fulano",
            nome_temporario: null,
            tipo_pessoa: "PF",
            lead_whatsapp: null,
            lead_email: null,
            observacoes: "",
            colaborador: null,
          },
        });
      }
      return builder({ data: { id: "cli-2" } });
    });

    const cadastro = await aprovarCadastro("cad-2", "CLI-2");
    expect(cadastro.status).toBe("aprovado");
    expect(cadastro.codigo_cliente).toBe("CLI-2");
  });
});
