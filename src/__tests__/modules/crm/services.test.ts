import { describe, it, expect, vi, beforeEach } from "vitest";

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

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validator: (x: unknown) => unknown = (x) => x;
    const chain: Record<string, any> = {
      middleware: () => chain,
      inputValidator: (fn: (x: unknown) => unknown) => {
        validator = fn;
        return chain;
      },
      handler: (
        fn: (args: {
          data: unknown;
          context: { supabase: any; userId: string };
        }) => unknown,
      ) => {
        return async (opts: { data?: unknown } = {}) => {
          const data = validator(opts.data);
          return fn({
            data,
            context: { supabase: mockSupabase.supabase, userId: "test-user" },
          });
        };
      },
    };
    return chain;
  },
}));

vi.mock("~/integrations/supabase/auth-middleware", () => ({
  requireSupabaseAuthMiddleware: vi.fn(),
}));

import {
  criarCliente,
  registrarVisita,
} from "~/features/crm/lib/visitas.functions";

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

const clienteInput = {
  nome_doutor: "Dr. Teste",
  nome_clinica: "Clinica Teste",
};

describe("CRM - Visitas Server Functions", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("criarCliente", () => {
    it("cria cliente com sucesso", async () => {
      mockSupabase.supabase.from.mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: "cli-1" }, error: null }),
        }),
      );
      const result = await criarCliente({ data: clienteInput });
      expect(result).toHaveProperty("id", "cli-1");
    });

    it("rejeita dados invalidos", async () => {
      await expect(criarCliente({ data: {} as any })).rejects.toThrow();
    });
  });

  describe("registrarVisita", () => {
    it("registra visita com sucesso", async () => {
      mockSupabase.supabase.from.mockReturnValue(
        mockQueryBuilder({
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: "vis-1" }, error: null }),
        }),
      );
      const visitaInput = {
        cliente_id: "00000000-0000-0000-0000-000000000001",
        data_visita: "2026-01-01",
        atendente: "Dra. Maria",
        cargo_atendente: "Dentista" as const,
        tipo_visita: "Prospecção" as const,
        gerou_orcamento: false,
        gerou_pedido: false,
        interesse_escala: 3,
        temperatura_vendedor: "Morno" as const,
      };
      const result = await registrarVisita({ data: visitaInput });
      expect(result).toHaveProperty("visita");
      expect(result.visita).toHaveProperty("id", "vis-1");
    });
  });
});
