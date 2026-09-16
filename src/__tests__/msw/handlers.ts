import { http, HttpResponse } from "msw";

const SUPABASE_URL = "https://*";
const BRASIL_API = "https://brasilapi.com.br/api/cep/v1/:cep";

export const handlers = [
  http.get(`${SUPABASE_URL}/rest/v1/clientes`, () => {
    return HttpResponse.json([
      {
        id: "1",
        nome_doutor: "Dr. Teste",
        email: "dr@teste.com",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        nome_doutor: "Dra. Exemplo",
        email: "dra@exemplo.com",
        created_at: "2024-01-02T00:00:00Z",
      },
    ]);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/clientes/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      nome_doutor: "Dr. Teste",
      email: "dr@teste.com",
      telefone: "(11) 99999-9999",
      created_at: "2024-01-01T00:00:00Z",
    });
  }),

  http.post(`${SUPABASE_URL}/rest/v1/clientes`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: "3", ...(body as object), created_at: "2024-06-30T00:00:00Z" },
      { status: 201 },
    );
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/clientes`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: "1",
      ...(body as object),
      updated_at: "2024-06-30T00:00:00Z",
    });
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/clientes`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  http.get(BRASIL_API, ({ params }) => {
    return HttpResponse.json({
      cep: params.cep,
      city: "São Paulo",
      state: "SP",
      neighborhood: "Centro",
      street: "Avenida Paulista",
    });
  }),

  http.get("https://viacep.com.br/ws/:cep/json", ({ params }) => {
    return HttpResponse.json({
      cep: params.cep,
      localidade: "São Paulo",
      uf: "SP",
      bairro: "Centro",
      logradouro: "Avenida Paulista",
    });
  }),
];
