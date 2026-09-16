import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listarFunis,
  criarFunil,
  deletarFunil,
} from "~/features/funis/services/funis";

const mockSupabase = vi.hoisted(() => ({
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

vi.mock("~/core/supabase", () => ({
  supabase: mockSupabase.supabase,
}));

vi.mock("~/core/services/webhooks", () => ({
  dispararEventoModulo: vi.fn().mockResolvedValue(undefined),
}));

const empresaId = "emp-123";

function mockQueryBuilder(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: [], error: null }),
    ),
    ...overrides,
  };
}

describe("Funis Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarFunis", () => {
    it("retorna lista quando Supabase responde com dados", async () => {
      mockSupabase.supabase.from.mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({
              data: [{ id: "1", titulo: "Funil Teste" }],
              error: null,
            }),
          ),
        }),
      );
      const result = await listarFunis();
      expect(result).toHaveLength(1);
    });

    it("retorna array vazio quando nao ha dados", async () => {
      mockSupabase.supabase.from.mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: [], error: null }),
          ),
        }),
      );
      const result = await listarFunis();
      expect(result).toHaveLength(0);
    });

    it("lança erro quando Supabase falha", async () => {
      mockSupabase.supabase.from.mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: null, error: new Error("DB Error") }),
          ),
        }),
      );
      await expect(listarFunis()).rejects.toThrow("DB Error");
    });
  });

  describe("criarFunil", () => {
    it("cria funil com colunas padrao", async () => {
      mockSupabase.supabase.from.mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { id: "funil-1", titulo: "Novo Funil" },
              error: null,
            }),
        }),
      );
      const result = await criarFunil({ titulo: "Novo Funil" });
      expect(result).toHaveProperty("id", "funil-1");
    });

    it("lança erro se usuario nao autenticado", async () => {
      mockSupabase.supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Nao autenticado"),
      });
      await expect(criarFunil({ titulo: "Teste" })).rejects.toThrow();
    });
  });

  describe("deletarFunil", () => {
    it("exclui funil sem retorno", async () => {
      mockSupabase.supabase.from.mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { empresa_id: empresaId },
              error: null,
            }),
        }),
      );
      await expect(deletarFunil("funil-1")).resolves.toBeUndefined();
    });
  });
});
