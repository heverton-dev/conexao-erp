import { describe, it, expect, vi, beforeEach } from "vitest";
import { buscarCepResiliente } from "~/features/integracoes";

describe("buscarCepResiliente", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("tenta BrasilAPI primeiro e retorna resultado", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          cep: "01310-100",
          localidade: "São Paulo",
          uf: "SP",
        }),
    });
    const result = await buscarCepResiliente("01310100");
    expect(result?.cep).toBe("01310-100");
  });

  it("faz fallback para ViaCEP quando BrasilAPI falha", async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Timeout"))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            cep: "01310-100",
            localidade: "São Paulo",
            uf: "SP",
          }),
      });
    const result = await buscarCepResiliente("01310100");
    expect(result).not.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retorna null quando ambos provedores falham", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const result = await buscarCepResiliente("00000000");
    expect(result).toBeNull();
  });
});
