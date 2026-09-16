import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import toast from "react-hot-toast";
import type { User } from "@supabase/supabase-js";
import { useAuthActions } from "~/core/auth/hooks/useAuthActions";
import type { Profile } from "~/core/auth/types";
import {
  createSuperAdminProfile,
  createRegularProfile,
} from "~/__tests__/mocks/auth";

const {
  mockSignInWithPassword,
  mockSignOut,
  mockSignUp,
  mockResetPasswordForEmail,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockSignUp: vi.fn(),
  mockResetPasswordForEmail: vi.fn(),
}));

vi.mock("~/core/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      resetPasswordForEmail: (...args: unknown[]) =>
        mockResetPasswordForEmail(...args),
    },
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn() },
}));

const mockUser = { id: "user-123", email: "test@example.com" } as unknown as User;
const mockCarregarPermissoes = vi.fn().mockResolvedValue(undefined);

interface RenderOverrides {
  user?: typeof mockUser | null;
  profile?: Record<string, unknown> | null;
  carregarPermissoesUsuario?: typeof mockCarregarPermissoes;
}

function renderUseAuthActions(overrides: RenderOverrides = {}) {
  const {
    user = mockUser,
    profile = createRegularProfile(),
    carregarPermissoesUsuario = mockCarregarPermissoes,
  } = overrides;

  return renderHook(() =>
    useAuthActions(
      user,
      profile as unknown as Profile,
      carregarPermissoesUsuario,
    ),
  );
}

describe("useAuthActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue(undefined);
    mockSignUp.mockResolvedValue({ error: null });
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
  });

  describe("login", () => {
    it("chama signInWithPassword com email e password", async () => {
      const { result } = renderUseAuthActions();

      await act(async () => {
        await result.current.login("user@test.com", "123456");
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "123456",
      });
    });

    it("lança erro quando signInWithPassword retorna error", async () => {
      const error = new Error("Invalid credentials");
      mockSignInWithPassword.mockResolvedValue({ error });

      const { result } = renderUseAuthActions();

      await expect(
        act(async () => {
          await result.current.login("user@test.com", "wrong");
        }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("mostra toast.success após login bem-sucedido", async () => {
      const { result } = renderUseAuthActions();

      await act(async () => {
        await result.current.login("user@test.com", "123456");
      });

      expect(toast.success).toHaveBeenCalledWith("Login realizado!");
    });
  });

  describe("logout", () => {
    it("chama signOut", async () => {
      const { result } = renderUseAuthActions();

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("register", () => {
    it("chama signUp com email e password", async () => {
      const { result } = renderUseAuthActions();

      await act(async () => {
        await result.current.register("new@test.com", "password123");
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@test.com",
        password: "password123",
      });
    });

    it("lança erro quando signUp retorna error", async () => {
      const error = new Error("User already registered");
      mockSignUp.mockResolvedValue({ error });

      const { result } = renderUseAuthActions();

      await expect(
        act(async () => {
          await result.current.register("existing@test.com", "pass");
        }),
      ).rejects.toThrow("User already registered");
    });

    it("mostra toast.success após registro bem-sucedido", async () => {
      const { result } = renderUseAuthActions();

      await act(async () => {
        await result.current.register("new@test.com", "password123");
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Cadastro realizado! Verifique seu email.",
      );
    });
  });

  describe("resetPassword", () => {
    it("chama resetPasswordForEmail com o email", async () => {
      const { result } = renderUseAuthActions();

      await act(async () => {
        await result.current.resetPassword("user@test.com");
      });

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith("user@test.com");
    });

    it("lança erro quando resetPasswordForEmail retorna error", async () => {
      const error = new Error("Email not found");
      mockResetPasswordForEmail.mockResolvedValue({ error });

      const { result } = renderUseAuthActions();

      await expect(
        act(async () => {
          await result.current.resetPassword("unknown@test.com");
        }),
      ).rejects.toThrow("Email not found");
    });
  });

  describe("refreshPermissoes", () => {
    it("não chama carregarPermissoesUsuario quando user é null", () => {
      const { result } = renderUseAuthActions({ user: null });

      act(() => {
        result.current.refreshPermissoes();
      });

      expect(mockCarregarPermissoes).not.toHaveBeenCalled();
    });

    it("chama carregarPermissoesUsuario com userId e is_super_admin", () => {
      const { result } = renderUseAuthActions();

      act(() => {
        result.current.refreshPermissoes();
      });

      expect(mockCarregarPermissoes).toHaveBeenCalledWith(
        "user-123",
        false, // createRegularProfile has is_super_admin: false
      );
    });

    it("usa profile.is_super_admin como segundo argumento", () => {
      const { result } = renderUseAuthActions({
        profile: createSuperAdminProfile(),
      });

      act(() => {
        result.current.refreshPermissoes();
      });

      expect(mockCarregarPermissoes).toHaveBeenCalledWith("user-123", true);
    });
  });
});
