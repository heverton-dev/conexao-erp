import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useCan,
  useCanAny,
  useCanAll,
} from "~/core/auth/usePermission";
import {
  createSuperAdminProfile,
  createRegularProfile,
} from "../../mocks/auth";

// ── Mock useAuth ──────────────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock("~/core/auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Helpers ───────────────────────────────────────────────────────
const SUPER_ADMIN = createSuperAdminProfile();
const REGULAR_USER = createRegularProfile();

const PERM_TRUE: Record<string, boolean> = {
  excluir_cadastro: true,
  gerenciar_config: true,
  ver_relatorios: true,
};

const PERM_FALSE: Record<string, boolean> = {
  excluir_cadastro: false,
  gerenciar_config: false,
  ver_relatorios: false,
};

const EMPTY_PERMS: Record<string, boolean> = {};

function stubAuth(
  profile: Record<string, unknown> | null,
  permissoes: Record<string, boolean> | null = null,
) {
  mockUseAuth.mockReturnValue({ profile, permissoes });
}

// ── Tests ─────────────────────────────────────────────────────────
describe("useCan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for super admin regardless of permissoes", () => {
    stubAuth(SUPER_ADMIN, null);
    const { result } = renderHook(() => useCan("excluir_cadastro"));
    expect(result.current).toBe(true);
  });

  it("returns true for super admin even when permissoes are empty", () => {
    stubAuth(SUPER_ADMIN, {});
    const { result } = renderHook(() => useCan("excluir_cadastro"));
    expect(result.current).toBe(true);
  });

  it("returns true when key exists in permissoes", () => {
    stubAuth(REGULAR_USER, PERM_TRUE);
    const { result } = renderHook(() => useCan("excluir_cadastro"));
    expect(result.current).toBe(true);
  });

  it("returns false when key is missing from permissoes", () => {
    stubAuth(REGULAR_USER, { outro_modulo: true });
    const { result } = renderHook(() => useCan("excluir_cadastro"));
    expect(result.current).toBe(false);
  });

  it("returns false when permissoes is null", () => {
    stubAuth(REGULAR_USER, null);
    const { result } = renderHook(() => useCan("excluir_cadastro"));
    expect(result.current).toBe(false);
  });

  it("returns false when permissoes has key set to false", () => {
    stubAuth(REGULAR_USER, PERM_FALSE);
    const { result } = renderHook(() => useCan("excluir_cadastro"));
    expect(result.current).toBe(false);
  });
});

describe("useCanAny", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for super admin with empty keys array", () => {
    stubAuth(SUPER_ADMIN, null);
    const { result } = renderHook(() => useCanAny([]));
    expect(result.current).toBe(true);
  });

  it("returns true when at least one key matches", () => {
    stubAuth(REGULAR_USER, PERM_TRUE);
    const { result } = renderHook(() =>
      useCanAny(["excluir_cadastro", "inexistente"]),
    );
    expect(result.current).toBe(true);
  });

  it("returns true when all keys match", () => {
    stubAuth(REGULAR_USER, PERM_TRUE);
    const { result } = renderHook(() =>
      useCanAny(["excluir_cadastro", "gerenciar_config"]),
    );
    expect(result.current).toBe(true);
  });

  it("returns false when no keys match", () => {
    stubAuth(REGULAR_USER, { outro_modulo: true });
    const { result } = renderHook(() =>
      useCanAny(["excluir_cadastro", "gerenciar_config"]),
    );
    expect(result.current).toBe(false);
  });

  it("returns false with empty keys array for non-admin", () => {
    stubAuth(REGULAR_USER, PERM_TRUE);
    const { result } = renderHook(() => useCanAny([]));
    expect(result.current).toBe(false);
  });

  it("returns false when permissoes is null", () => {
    stubAuth(REGULAR_USER, null);
    const { result } = renderHook(() =>
      useCanAny(["excluir_cadastro"]),
    );
    expect(result.current).toBe(false);
  });
});

describe("useCanAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for super admin with empty keys array", () => {
    stubAuth(SUPER_ADMIN, null);
    const { result } = renderHook(() => useCanAll([]));
    expect(result.current).toBe(true);
  });

  it("returns true when all keys match", () => {
    stubAuth(REGULAR_USER, PERM_TRUE);
    const { result } = renderHook(() =>
      useCanAll(["excluir_cadastro", "gerenciar_config"]),
    );
    expect(result.current).toBe(true);
  });

  it("returns false when some keys are missing", () => {
    stubAuth(REGULAR_USER, { excluir_cadastro: true });
    const { result } = renderHook(() =>
      useCanAll(["excluir_cadastro", "gerenciar_config"]),
    );
    expect(result.current).toBe(false);
  });

  it("returns false with empty permissoes", () => {
    stubAuth(REGULAR_USER, EMPTY_PERMS);
    const { result } = renderHook(() =>
      useCanAll(["excluir_cadastro"]),
    );
    expect(result.current).toBe(false);
  });

  it("returns false with empty keys array when permissoes is null for non-admin", () => {
    stubAuth(REGULAR_USER, null);
    const { result } = renderHook(() => useCanAll([]));
    expect(result.current).toBe(true);
  });

  it("returns false when permissoes is null and keys are provided", () => {
    stubAuth(REGULAR_USER, null);
    const { result } = renderHook(() =>
      useCanAll(["excluir_cadastro"]),
    );
    expect(result.current).toBe(false);
  });
});
