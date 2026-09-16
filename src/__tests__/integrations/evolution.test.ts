import { describe, it, expect, vi, beforeEach } from "vitest";
import { testarConexaoEvolution } from "~/features/integracoes";

describe("testarConexaoEvolution", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna conectado quando API responde 200", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ instance: { state: "open" } }),
    });
    const result = await testarConexaoEvolution(
      "https://evo.test",
      "api-key",
      "instancia1",
    );
    expect(result.conectado).toBe(true);
  });

  it("retorna desconectado quando API responde erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });
    const result = await testarConexaoEvolution(
      "https://evo.test",
      "bad-key",
      "instancia1",
    );
    expect(result.conectado).toBe(false);
  });

  it("retorna desconectado quando fetch lança exceção (timeout)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));
    const result = await testarConexaoEvolution(
      "https://evo.test",
      "key",
      "inst",
    );
    expect(result.conectado).toBe(false);
  });
});
