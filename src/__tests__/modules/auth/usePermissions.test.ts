import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePermissions } from "~/core/auth/hooks/usePermissions";
import type { ModulosAcesso } from "~/core/auth/types";

// --- Mocks ---
const mockGetAllPermissionKeys = vi.fn();
vi.mock("~/registry", () => ({
  getAllPermissionKeys: () => mockGetAllPermissionKeys(),
}));

const mockBuscarChaves = vi.fn();
vi.mock("~/core/auth/perfis.service", () => ({
  buscarChavesPermissaoDosPerfis: () => mockBuscarChaves(),
}));

const mockMaybeSingle = vi.fn();
vi.mock("~/core/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
    })),
  },
}));

// --- Helpers ---
const ALL_KEYS = [
  "ver_todos_cadastros",
  "aprovar_cadastro",
  "reprovar_cadastro",
  "gerenciar_config",
  "ver_relatorios",
];

function setSupabaseRow(row: {
  permissoes?: Record<string, boolean> | null;
  modulos_acesso?: ModulosAcesso | null;
}) {
  mockMaybeSingle.mockResolvedValueOnce({ data: row, error: null });
}

function setSupabaseRowNull() {
  mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
}

// --- Tests ---
describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllPermissionKeys.mockReturnValue(ALL_KEYS);
  });

  // ─── Super Admin ───────────────────────────────────────
  describe("Super Admin", () => {
    it("sets all permission keys to true", async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("sa-1", true);
      });

      expect(result.current.permissoes).not.toBeNull();
      for (const key of ALL_KEYS) {
        expect(result.current.permissoes![key]).toBe(true);
      }
      expect(Object.keys(result.current.permissoes!)).toEqual(ALL_KEYS);
    });

    it("sets modulosAcesso to null", async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("sa-1", true);
      });

      expect(result.current.modulosAcesso).toBeNull();
    });

    it("does NOT call supabase or buscarChaves for super admin", async () => {
      const { supabase } = await import("~/core/supabase");
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("sa-1", true);
      });

      expect(supabase.from).not.toHaveBeenCalled();
      expect(mockBuscarChaves).not.toHaveBeenCalled();
    });
  });

  // ─── Regular User ──────────────────────────────────────
  describe("Regular User", () => {
    it("loads permissoes from the permissoes table", async () => {
      const tablePerms = { ver_todos_cadastros: true, gerenciar_config: false };
      setSupabaseRow({ permissoes: tablePerms, modulos_acesso: null });
      mockBuscarChaves.mockResolvedValueOnce([]);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toEqual(tablePerms);
      expect(result.current.modulosAcesso).toBeNull();
    });

    it("merges RBAC keys from buscarChavesPermissaoDosPerfis", async () => {
      const tablePerms = { ver_todos_cadastros: true };
      setSupabaseRow({ permissoes: tablePerms, modulos_acesso: null });
      mockBuscarChaves.mockResolvedValueOnce(["aprovar_cadastro", "reprovar_cadastro"]);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toEqual({
        ver_todos_cadastros: true,
        aprovar_cadastro: true,
        reprovar_cadastro: true,
      });
    });

    it("merges modulos_acesso actions into flatPerms", async () => {
      const modulosAcc: ModulosAcesso = {
        cadastros: {
          acessar: true,
          paginas: ["lista"],
          acoes: ["aprovar_cadastro_modulo", "reprovar_cadastro_modulo"],
        },
      };
      setSupabaseRow({ permissoes: { ver_todos_cadastros: true }, modulos_acesso: modulosAcc });
      mockBuscarChaves.mockResolvedValueOnce([]);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toEqual({
        ver_todos_cadastros: true,
        aprovar_cadastro_modulo: true,
        reprovar_cadastro_modulo: true,
      });
      expect(result.current.modulosAcesso).toEqual(modulosAcc);
    });

    it("skips modulos_acesso actions when acessar is false", async () => {
      const modulosAcc: ModulosAcesso = {
        cadastros: {
          acessar: false,
          paginas: [],
          acoes: ["hidden_action"],
        },
      };
      setSupabaseRow({ permissoes: { ver_todos_cadastros: true }, modulos_acesso: modulosAcc });
      mockBuscarChaves.mockResolvedValueOnce([]);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toEqual({ ver_todos_cadastros: true });
      expect(result.current.permissoes!).not.toHaveProperty("hidden_action");
    });

    it("sets permissoes to null when no keys are found", async () => {
      setSupabaseRow({ permissoes: null, modulos_acesso: null });
      mockBuscarChaves.mockResolvedValueOnce([]);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toBeNull();
    });

    it("sets permissoes to null when table returns empty object and no RBAC keys", async () => {
      setSupabaseRow({ permissoes: {}, modulos_acesso: null });
      mockBuscarChaves.mockResolvedValueOnce([]);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toBeNull();
    });

    it("handles buscarChavesPermissaoDosPerfis failure gracefully", async () => {
      setSupabaseRow({ permissoes: { ver_todos_cadastros: true }, modulos_acesso: null });
      mockBuscarChaves.mockRejectedValueOnce(new Error("network error"));

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toEqual({ ver_todos_cadastros: true });
    });

    it("handles supabase returning null data (no row)", async () => {
      setSupabaseRowNull();
      mockBuscarChaves.mockResolvedValueOnce(["aprovar_cadastro"]);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(result.current.permissoes).toEqual({ aprovar_cadastro: true });
      // data is null → data?.modulos_acesso is undefined (cast is type-only)
      expect(result.current.modulosAcesso).toBeUndefined();
    });

    it("does not call getAllPermissionKeys for regular users", async () => {
      setSupabaseRow({ permissoes: { ver_todos_cadastros: true }, modulos_acesso: null });
      mockBuscarChaves.mockResolvedValueOnce([]);
      mockGetAllPermissionKeys.mockClear();

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.carregarPermissoesUsuario("user-1", false);
      });

      expect(mockGetAllPermissionKeys).not.toHaveBeenCalled();
    });
  });

  // ─── Stability ─────────────────────────────────────────
  describe("Stability", () => {
    it("carregarPermissoesUsuario reference is stable across re-renders", () => {
      const { result, rerender } = renderHook(() => usePermissions());
      const fnRef = result.current.carregarPermissoesUsuario;

      rerender();

      expect(result.current.carregarPermissoesUsuario).toBe(fnRef);
    });
  });

  // ─── State setters ─────────────────────────────────────
  describe("Exposed setters", () => {
    it("setPermissoes updates permissoes directly", async () => {
      const { result } = renderHook(() => usePermissions());

      act(() => {
        result.current.setPermissoes({ custom: true });
      });

      expect(result.current.permissoes).toEqual({ custom: true });
    });

    it("setModulosAcesso updates modulosAcesso directly", async () => {
      const { result } = renderHook(() => usePermissions());
      const mod: ModulosAcesso = {
        test: { acessar: true, paginas: [], acoes: ["x"] },
      };

      act(() => {
        result.current.setModulosAcesso(mod);
      });

      expect(result.current.modulosAcesso).toEqual(mod);
    });
  });
});
