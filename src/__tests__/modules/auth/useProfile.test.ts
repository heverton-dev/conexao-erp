import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProfile } from "~/core/auth/hooks/useProfile";
import type { Profile } from "~/core/auth/types";

// ── Mock Supabase ────────────────────────────────────────────────────────────

const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("~/core/supabase", () => ({
  supabase: {
    get from() {
      return mockFrom;
    },
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const FAKE_PROFILE: Profile = {
  id: "user-123",
  email: "test@example.com",
  nome: "Test User",
  role: "admin",
  ambiente: "producao",
  ativo: true,
  is_super_admin: false,
};

function fakeOk(profile: Profile = FAKE_PROFILE) {
  mockSingle.mockResolvedValue({ data: profile, error: null });
}

function fakeError(message = "not found") {
  mockSingle.mockResolvedValue({ data: null, error: { message } });
}

function fakeNullData() {
  mockSingle.mockResolvedValue({ data: null, error: null });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1 ── Returns null profile when userId is null ─────────────────────────────

  it("returns null profile when userId is null", () => {
    const { result } = renderHook(() => useProfile(null));

    expect(result.current.profile).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns null profile when userId is undefined equivalent", () => {
    const { result } = renderHook(() => useProfile(null));

    expect(result.current.profile).toBeNull();
    // supabase should not be touched at all
    expect(mockFrom).not.toHaveBeenCalled();
  });

  // 2 ── Fetches profile when userId is provided ──────────────────────────────

  it("fetches profile from supabase when userId is provided", async () => {
    fakeOk();

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull();
    });

    expect(result.current.profile).toEqual(FAKE_PROFILE);
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("id", "user-123");
    expect(mockSingle).toHaveBeenCalled();
  });

  // 3 ── Sets profile to null on fetch error ──────────────────────────────────

  it("sets profile to null when supabase returns an error", async () => {
    fakeError("connection refused");

    const { result } = renderHook(() => useProfile("user-123"));

    // Give the async fetch time to settle
    await waitFor(() => {
      expect(mockSingle).toHaveBeenCalled();
    });

    // Profile should remain null because the hook filters out errors
    expect(result.current.profile).toBeNull();
  });

  it("keeps profile null when supabase returns null data without error", async () => {
    fakeNullData();

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(mockSingle).toHaveBeenCalled();
    });

    expect(result.current.profile).toBeNull();
  });

  // 4 ── Does not update state if component unmounts (cancelled guard) ────────

  it("does not set profile after unmount (cancelled guard)", async () => {
    // Resolve only after a small delay so we can unmount first
    const { promise: fetchPromise, resolve: resolveFetch } =
      Promise.withResolvers<{ data: Profile; error: null }>();
    mockSingle.mockReturnValue(fetchPromise);

    const { result, unmount } = renderHook(() => useProfile("user-123"));

    // Unmount before the fetch resolves
    unmount();

    // Now resolve the fetch — the cancelled guard should prevent state update
    await act(async () => {
      resolveFetch({ data: FAKE_PROFILE, error: null });
    });

    // Profile should still be null because the effect was cancelled
    expect(result.current.profile).toBeNull();
  });

  // 5 ── Re-fetches when userId changes ───────────────────────────────────────

  it("re-fetches profile when userId changes", async () => {
    const profile1: Profile = { ...FAKE_PROFILE, id: "user-111", nome: "User 111" };
    const profile2: Profile = { ...FAKE_PROFILE, id: "user-222", nome: "User 222" };

    mockSingle
      .mockResolvedValueOnce({ data: profile1, error: null })
      .mockResolvedValueOnce({ data: profile2, error: null });

    const { result, rerender } = renderHook(
      ({ userId }) => useProfile(userId),
      { initialProps: { userId: "user-111" } }
    );

    await waitFor(() => {
      expect(result.current.profile?.id).toBe("user-111");
    });

    expect(result.current.profile?.nome).toBe("User 111");

    // Change userId
    rerender({ userId: "user-222" });

    await waitFor(() => {
      expect(result.current.profile?.id).toBe("user-222");
    });

    expect(result.current.profile?.nome).toBe("User 222");
    expect(mockSingle).toHaveBeenCalledTimes(2);
    expect(mockEq).toHaveBeenCalledWith("id", "user-222");
  });

  it("sets profile to null when userId changes from valid to null", async () => {
    fakeOk();

    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | null }) => useProfile(userId),
      { initialProps: { userId: "user-123" } as { userId: string | null } }
    );

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull();
    });

    // Change to null
    rerender({ userId: null } as { userId: string | null });

    await waitFor(() => {
      expect(result.current.profile).toBeNull();
    });

    // Should not call supabase for null
    expect(mockFrom).toHaveBeenCalledTimes(1); // only the first fetch
  });

  // 6 ── setProfile allows manual override ─────────────────────────────────────

  it("setProfile allows manual override of the profile", async () => {
    fakeOk();

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(result.current.profile).toEqual(FAKE_PROFILE);
    });

    const override: Profile = {
      ...FAKE_PROFILE,
      nome: "Overridden Name",
      role: "viewer",
    };

    act(() => {
      result.current.setProfile(override);
    });

    expect(result.current.profile?.nome).toBe("Overridden Name");
    expect(result.current.profile?.role).toBe("viewer");
  });

  it("setProfile allows setting profile to null manually", async () => {
    fakeOk();

    const { result } = renderHook(() => useProfile("user-123"));

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull();
    });

    act(() => {
      result.current.setProfile(null);
    });

    expect(result.current.profile).toBeNull();
  });
});
