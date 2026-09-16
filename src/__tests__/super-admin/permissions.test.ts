import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPermissoes, getModulosAcesso } from "~/core/permissions/services";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("~/core/supabase", () => {
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

describe("Super Admin - Permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPermissoes", () => {
    it("retorna object com todas as permissoes como true quando isSuperAdmin=true", async () => {
      const result = await getPermissoes("any-id", true);
      expect(result).not.toBeNull();
      expect(Object.keys(result!).length).toBeGreaterThan(0);
      for (const val of Object.values(result!)) {
        expect(val).toBe(true);
      }
    });

    it("NÃO chama supabase.from quando isSuperAdmin=true", async () => {
      const { supabase } = await import("~/core/supabase");
      await getPermissoes("any-id", true);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("retorna undefined quando supabase retorna dados null (isSuperAdmin=false)", async () => {
      mockFrom.mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));
      const result = await getPermissoes("any-id", false);
      expect(result).toBeUndefined();
    });
  });

  describe("getModulosAcesso", () => {
    it("retorna objeto vazio para super admin", async () => {
      const result = await getModulosAcesso("any-id", true);
      expect(result).toEqual({});
    });

    it("NÃO chama supabase.from quando isSuperAdmin=true", async () => {
      await getModulosAcesso("any-id", true);
      const { supabase } = await import("~/core/supabase");
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
