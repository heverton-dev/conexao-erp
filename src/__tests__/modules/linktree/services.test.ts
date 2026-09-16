import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listarColaboradores,
  criarColaborador,
  deletarColaborador,
} from "~/features/linktree/index";
import {
  listarEmpresaConfig,
  verificarSlugDisponivel,
} from "~/features/linktree/services/empresa";

vi.mock("~/core/supabase", () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
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
  };
});

const empresaId = "emp-123";

function mockQueryBuilder(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: [], error: null }),
    ),
    ...overrides,
  };
}

describe("LinkTree Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarColaboradores", () => {
    it("retorna lista quando Supabase responde com dados", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          then: vi.fn((resolve: (v: unknown) => void) =>
            resolve({ data: [{ id: "1", nome: "João" }], error: null }),
          ),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await listarColaboradores(empresaId);
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
      await expect(listarColaboradores(empresaId)).rejects.toThrow("DB Error");
    });
  });

  describe("criarColaborador", () => {
    it("cria colaborador e retorna com id", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { id: "new-1", nome: "Maria" },
              error: null,
            }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await criarColaborador({ nome: "Maria" } as any);
      expect(result.id).toBe("new-1");
    });
  });

  describe("deletarColaborador", () => {
    it("exclui sem retorno", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      await expect(deletarColaborador("1")).resolves.toBeUndefined();
    });
  });

  describe("listarEmpresaConfig", () => {
    it("retorna config quando encontrada", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({
              data: { id: "cfg-1", slug: "minha-empresa" },
              error: null,
            }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await listarEmpresaConfig(empresaId);
      expect(result?.slug).toBe("minha-empresa");
    });
  });

  describe("verificarSlugDisponivel", () => {
    it("retorna true quando slug nao existe", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await verificarSlugDisponivel("slug-livre");
      expect(result).toBe(true);
    });

    it("retorna false quando slug ja existe", async () => {
      const { supabase } = await import("~/core/supabase");
      vi.mocked(supabase.from).mockReturnValue(
        mockQueryBuilder({
          maybeSingle: vi
            .fn()
            .mockResolvedValue({ data: { empresa_id: "outra" }, error: null }),
        }) as unknown as ReturnType<typeof supabase.from>,
      );
      const result = await verificarSlugDisponivel("slug-ocupado");
      expect(result).toBe(false);
    });
  });
});
