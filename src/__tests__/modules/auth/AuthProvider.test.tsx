import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { useAuth } from "~/core/auth/useAuth";
import { AuthProvider } from "~/core/auth/AuthProvider";

// ── Hoisted mock references ─────────────────────────────────────────────────

const {
  mockGetUser,
  mockOnAuthStateChange,
  mockSignInWithPassword,
  mockSignOut,
  mockSignUp,
  mockResetPasswordForEmail,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockSignUp: vi.fn(),
  mockResetPasswordForEmail: vi.fn(),
}));

// ── Module mocks ────────────────────────────────────────────────────────────

vi.mock("~/core/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      resetPasswordForEmail: (...args: unknown[]) =>
        mockResetPasswordForEmail(...args),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnThis(),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue("ok"),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock("~/registry", () => ({
  getAllPermissionKeys: vi.fn(() => ["perm_a", "perm_b"]),
}));

vi.mock("~/config/empresa", () => ({
  EMPRESA_ID: "test-empresa-123",
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn() },
}));

// ── Test consumer ───────────────────────────────────────────────────────────

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user">{auth.user?.id ?? "null"}</span>
      <span data-testid="profile">{auth.profile?.nome ?? "null"}</span>
      <span data-testid="login">{typeof auth.login}</span>
      <span data-testid="logout">{typeof auth.logout}</span>
      <span data-testid="register">{typeof auth.register}</span>
      <span data-testid="resetPassword">{typeof auth.resetPassword}</span>
      <span data-testid="fetchProfile">{typeof auth.fetchProfile}</span>
      <span data-testid="refreshPermissoes">{typeof auth.refreshPermissoes}</span>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

// ── Captured auth-state callback (set by beforeEach, read by tests) ─────────

let authStateCallback: ((event: string, session: unknown) => void) | null =
  null;

// ── Tests ───────────────────────────────────────────────────────────────────

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;

    // Default: no session, no user
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    // Register listener — capture callback for later invocation
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: unknown) => void) => {
        authStateCallback = cb;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      },
    );
  });

  // ── 1. Shows loading=true initially ────────────────────────────────────────

  it("shows loading=true initially", async () => {
    renderProvider();
    // getUser is async; at the very first render the provider sets loading=true
    // and the getUser promise hasn't resolved yet in the microtask queue.
    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  // ── 2. Calls getUser on mount ──────────────────────────────────────────────

  it("calls getUser on mount", async () => {
    renderProvider();
    await waitFor(() => {
      expect(mockGetUser).toHaveBeenCalledTimes(1);
    });
  });

  // ── 3. Sets user from initial session ──────────────────────────────────────

  it("sets user from initial session when getUser returns a user", async () => {
    const fakeUser = { id: "user-abc", email: "test@test.com" };
    mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("user-abc");
    });
  });

  // ── 4. Sets loading=false after getUser completes ─────────────────────────

  it("sets loading=false after getUser completes", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
  });

  // ── 5. Calls onAuthStateChange listener ───────────────────────────────────

  it("subscribes to onAuthStateChange on mount", async () => {
    renderProvider();

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
    });
    expect(typeof mockOnAuthStateChange.mock.calls[0][0]).toBe("function");
  });

  // ── 6. Provides login/logout/register/resetPassword functions ─────────────

  it("provides login, logout, register, and resetPassword functions", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("login").textContent).toBe("function");
    expect(screen.getByTestId("logout").textContent).toBe("function");
    expect(screen.getByTestId("register").textContent).toBe("function");
    expect(screen.getByTestId("resetPassword").textContent).toBe("function");
  });

  // ── 7. Provides fetchProfile function ─────────────────────────────────────

  it("provides fetchProfile function", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("fetchProfile").textContent).toBe("function");
  });

  // ── 8. Provides refreshPermissoes function ────────────────────────────────

  it("provides refreshPermissoes function", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("refreshPermissoes").textContent).toBe("function");
  });

  // ── 9. Clears state on SIGNED_OUT event ───────────────────────────────────

  it("clears state on SIGNED_OUT event", async () => {
    // Start with a user in the session
    const fakeUser = { id: "user-signed-in", email: "signed@in.com" };
    mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("user-signed-in");
    });

    // Simulate SIGNED_OUT event via the captured callback
    act(() => {
      authStateCallback?.("SIGNED_OUT", null);
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("null");
    });
    expect(screen.getByTestId("profile").textContent).toBe("null");
  });

  // ── 10. Sets user on SIGNED_IN event ─────────────────────────────────────

  it("sets user on SIGNED_IN event", async () => {
    renderProvider();

    // Wait for initial load to complete (no user)
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("null");

    // Simulate SIGNED_IN event
    const sessionUser = { id: "user-session", email: "session@test.com" };
    act(() => {
      authStateCallback?.("SIGNED_IN", { user: sessionUser });
    });

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("user-session");
    });
  });
});
