import { describe, it, expect } from "vitest";
import { EMPRESA_ID, EMPRESA_SLUG } from "~/config/empresa";

describe("EMPRESA_ID constant", () => {
  it("should be defined and non-empty", () => {
    expect(EMPRESA_ID).toBeDefined();
    expect(typeof EMPRESA_ID).toBe("string");
    expect(EMPRESA_ID.length).toBeGreaterThan(0);
  });

  it("should be a valid UUID format", () => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(EMPRESA_ID)).toBe(true);
  });
});

describe("EMPRESA_SLUG constant", () => {
  it("should be defined and non-empty", () => {
    expect(EMPRESA_SLUG).toBeDefined();
    expect(typeof EMPRESA_SLUG).toBe("string");
    expect(EMPRESA_SLUG.length).toBeGreaterThan(0);
  });

  it("should be lowercase alphanumeric with hyphens", () => {
    const slugRegex = /^[a-z0-9-]+$/;
    expect(slugRegex.test(EMPRESA_SLUG)).toBe(true);
  });
});
