import { vi } from "vitest";

type MockResponse =
  { data: unknown; error: null } | { data: null; error: Error };

function createResponse(
  data: unknown,
  error: Error | null = null,
): MockResponse {
  return error ? { data: null, error } : { data, error: null };
}

export class MockQueryBuilder {
  private _select: string | undefined;
  private _filters: Record<string, unknown> = {};
  private _orderCol: string | undefined;
  private _orderAsc: boolean = false;
  private _single: boolean = false;
  private _limitCount: number | undefined;
  private _response: MockResponse;

  constructor(table: string, initialData?: unknown) {
    this._response =
      initialData !== undefined
        ? createResponse(initialData)
        : createResponse([]);
  }

  select(q?: string) {
    this._select = q;
    return this;
  }
  eq(col: string, val: unknown) {
    this._filters[col] = val;
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCol = col;
    this._orderAsc = opts?.ascending ?? false;
    return this;
  }
  single() {
    this._single = true;
    return this;
  }
  limit(n: number) {
    this._limitCount = n;
    return this;
  }
  insert(data: unknown) {
    this._response = createResponse(data);
    return this;
  }
  update(data: unknown) {
    this._response = createResponse(data);
    return this;
  }
  delete() {
    this._response = createResponse(null);
    return this;
  }
  then(resolve: (val: MockResponse) => void) {
    resolve(this._response);
    return this._response;
  }
}

export interface MockSupabaseClient {
  from: (table: string) => MockQueryBuilder;
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } };
      error: null;
    }>;
    onAuthStateChange: () => {
      data: { subscription: { unsubscribe: () => void } };
    };
  };
}

export function createMockSupabase(
  overrides?: Partial<MockSupabaseClient>,
): MockSupabaseClient {
  const mock: MockSupabaseClient = {
    from: vi.fn((table: string) => new MockQueryBuilder(table)),
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
    ...overrides,
  };
  return mock;
}
