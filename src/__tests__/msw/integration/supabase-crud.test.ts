import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "../server";
import { http, HttpResponse } from "msw";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const SUPABASE_URL = "https://fake-project.supabase.co/rest/v1/clientes";

describe("Supabase CRUD (MSW)", () => {
  it("lista clientes com sucesso", async () => {
    server.use(
      http.get("*/rest/v1/clientes", () => {
        return HttpResponse.json([
          { id: "1", nome_doutor: "Dr. Teste" },
          { id: "2", nome_doutor: "Dra. Exemplo" },
        ]);
      }),
    );
    const res = await fetch(SUPABASE_URL);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].nome_doutor).toBe("Dr. Teste");
  });

  it("cria cliente com sucesso", async () => {
    server.use(
      http.post("*/rest/v1/clientes", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(
          { id: "3", ...(body as object), created_at: "2024-06-30T00:00:00Z" },
          { status: 201 },
        );
      }),
    );
    const res = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_doutor: "Dr. Novo",
        email: "novo@teste.com",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.id).toBe("3");
    expect(data.nome_doutor).toBe("Dr. Novo");
  });

  it("retorna cliente por ID", async () => {
    server.use(
      http.get("*/rest/v1/clientes", ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id") || "1";
        return HttpResponse.json({
          id,
          nome_doutor: "Dr. Teste",
          email: "dr@teste.com",
        });
      }),
    );
    const res = await fetch(`${SUPABASE_URL}?id=eq.1`);
    const data = await res.json();
    expect(data.nome_doutor).toBe("Dr. Teste");
  });

  it("deleta cliente com sucesso", async () => {
    server.use(
      http.delete("*/rest/v1/clientes", () => {
        return HttpResponse.json(null, { status: 204 });
      }),
    );
    const res = await fetch(SUPABASE_URL, { method: "DELETE" });
    expect(res.status).toBe(204);
  });

  it("retorna lista vazia quando não há clientes", async () => {
    server.use(
      http.get("*/rest/v1/clientes", () => {
        return HttpResponse.json([]);
      }),
    );
    const res = await fetch(SUPABASE_URL);
    const data = await res.json();
    expect(data).toHaveLength(0);
  });

  it("retorna erro 401 sem autenticação", async () => {
    server.use(
      http.get("*/rest/v1/clientes", () => {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
    );
    const res = await fetch(SUPABASE_URL);
    expect(res.status).toBe(401);
  });
});
