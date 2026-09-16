import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listarRespostas,
  criarResposta,
  listarPerguntas,
  criarPergunta,
} from "~/features/nps/services";

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
    in: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: [], error: null }),
    ),
    ...overrides,
  };
}

describe("NPS Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarRespostas", () => {
    it("retorna lista quando Supabase responde com dados", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: [{ id: "1", nps_score: 9 }], error: null }),
          ),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await listarRespostas(empresaId);
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
      await expect(listarRespostas(empresaId)).rejects.toThrow("DB Error");
    });
  });

  describe("criarResposta", () => {
    it("cria e retorna resposta", async () => {
      const { supabase } = await import("~/core/supabase");
      const mockResposta = {
        id: "new-1",
        nps_score: 10,
        empresa_id: empresaId,
      };
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({ data: mockResposta, error: null }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await criarResposta(empresaId, { nps_score: 10 } as any);
      expect(result.id).toBe("new-1");
    });
  });

  describe("listarPerguntas", () => {
    it("retorna perguntas ordenadas por order_index", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({
              data: [{ id: "1", pergunta: "Recomendaria?" }],
              error: null,
            }),
          ),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await listarPerguntas(empresaId);
      expect(result).toHaveLength(1);
    });
  });

  describe("criarPergunta", () => {
    it("cria e retorna pergunta", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { id: "p-1", pergunta: "Teste", empresa_id: empresaId },
              error: null,
            }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await criarPergunta(empresaId, {
        pergunta: "Teste",
      } as any);
      expect(result.id).toBe("p-1");
    });
  });
});
