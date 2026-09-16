import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "../server";
import { http, HttpResponse } from "msw";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CEP Integration (MSW)", () => {
  it("busca CEP com sucesso via BrasilAPI", async () => {
    server.use(
      http.get("https://brasilapi.com.br/api/cep/v1/01311000", () => {
        return HttpResponse.json({
          cep: "01311000",
          city: "São Paulo",
          state: "SP",
        });
      }),
    );
    const res = await fetch("https://brasilapi.com.br/api/cep/v1/01311000");
    const data = await res.json();
    expect(data.city).toBe("São Paulo");
    expect(data.state).toBe("SP");
  });

  it("busca CEP com sucesso via ViaCEP", async () => {
    server.use(
      http.get("https://viacep.com.br/ws/01311000/json", () => {
        return HttpResponse.json({
          cep: "01311000",
          localidade: "São Paulo",
          uf: "SP",
          bairro: "Centro",
        });
      }),
    );
    const res = await fetch("https://viacep.com.br/ws/01311000/json");
    const data = await res.json();
    expect(data.localidade).toBe("São Paulo");
  });

  it("retorna erro 500 quando BrasilAPI falha", async () => {
    server.use(
      http.get("https://brasilapi.com.br/api/cep/v1/00000000", () => {
        return HttpResponse.json(
          { message: "CEP não encontrado" },
          { status: 500 },
        );
      }),
    );
    const res = await fetch("https://brasilapi.com.br/api/cep/v1/00000000");
    expect(res.status).toBe(500);
  });

  it("usa handler customizado para CEP específico", async () => {
    server.use(
      http.get("https://brasilapi.com.br/api/cep/v1/20040002", () => {
        return HttpResponse.json({
          cep: "20040002",
          city: "Rio de Janeiro",
          state: "RJ",
        });
      }),
    );
    const res = await fetch("https://brasilapi.com.br/api/cep/v1/20040002");
    const data = await res.json();
    expect(data.city).toBe("Rio de Janeiro");
    expect(data.state).toBe("RJ");
  });
});
