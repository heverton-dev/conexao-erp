import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listarRotas,
  buscarRota,
  criarRota,
  atualizarRota,
  excluirRota,
} from "~/features/rotas/services/rotas.service";

vi.mock("~/core/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({
          data: { user: { id: "test-user" } },
          error: null,
        }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

const empresaId = "emp-123";
const usuarioId = "user-456";

function mockQueryBuilder(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: [], error: null }),
    ),
    ...overrides,
  };
}

describe("Rotas Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarRotas", () => {
    it("retorna lista quando Supabase responde com dados", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: [{ id: "1", titulo: "Rota Teste" }], error: null }),
          ),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await listarRotas(empresaId, usuarioId);
      expect(result).toHaveLength(1);
    });

    it("lança erro quando Supabase falha", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: null, error: new Error("DB Error") }),
          ),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      await expect(listarRotas(empresaId, usuarioId)).rejects.toThrow(
        "DB Error",
      );
    });
  });

  describe("buscarRota", () => {
    it("retorna rota por id", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { id: "1", titulo: "Rota Unica" },
              error: null,
            }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await buscarRota("1");
      expect(result.id).toBe("1");
    });
  });

  describe("criarRota", () => {
    it("cria rota com status planejada", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { id: "new-1", titulo: "Nova Rota", status: "planejada" },
              error: null,
            }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await criarRota(empresaId, usuarioId, {
        titulo: "Nova Rota",
        data_rota: "2025-01-01",
        tipo: "diaria",
        cliente_ids: [],
      });
      expect(result.status).toBe("planejada");
    });
  });

  describe("atualizarRota", () => {
    it("atualiza e retorna rota modificada", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { id: "1", titulo: "Atualizado" },
              error: null,
            }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await atualizarRota("1", { titulo: "Atualizado" });
      expect(result.titulo).toBe("Atualizado");
    });
  });

  describe("excluirRota", () => {
    it("exclui sem retorno", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      await expect(excluirRota("1")).resolves.toBeUndefined();
    });
  });
});
