import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from "./config.js";

const errorRate = new Rate("submit_errors");

const SUPER_ADMIN = {
  email: SUPER_ADMIN_EMAIL,
  pass: SUPER_ADMIN_PASSWORD,
};

export const options = {
  stages: [
    { duration: "15s", target: 20 },
    { duration: "30s", target: 40 },
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    submit_errors: ["rate<0.05"],
    http_req_duration: ["p(95)<5000"],
  },
};

function login(email, pass) {
  const res = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email, password: pass }),
    { headers: { "Content-Type": "application/json", apikey: ANON_KEY } },
  );
  return res.status === 200 ? res.json("access_token") : null;
}

export default function () {
  // Pre-cadastro nao precisa de auth, mas precisa de token valido
  // Simula o fluxo: criar cadastro como super admin, gerar token, submeter pre-cadastro

  const token = login(SUPER_ADMIN.email, SUPER_ADMIN.pass);
  if (!token) return;
  const h = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 1. Criar cadastro com status link_gerado
  const uid = "25dedc0f-9f66-4b91-a845-3a08bf43d4b0"; // cadastro user
  const cadRes = http.post(
    `${BASE_URL}/rest/v1/cadastros`,
    JSON.stringify({
      tipo_pessoa: "PF",
      status: "link_gerado",
      nome_temporario: `Teste Stress ${Math.random().toString(36).substring(2, 8)}`,
      lead_nome: `Lead Stress ${Math.random().toString(36).substring(2, 8)}`,
      created_by: uid,
      token_acesso: `stress_${Math.random().toString(36).substring(2, 15)}`,
      link_expiracao: new Date(Date.now() + 30 * 86400000).toISOString(),
      is_demo: true,
    }),
    { headers: h },
  );
  if (cadRes.status !== 201) return;
  const cadastroId = cadRes.json()[0].id;

  // 2. Simular update_cadastro_from_precadastro via RPC
  group("RPC update_cadastro_from_precadastro", () => {
    const pfData = {
      nome: "Maria Teste",
      cpf: `${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}`,
      email_comunicacao: `teste${Math.random().toString(36).substring(2, 8)}@email.com`,
      celular1: `119${Math.floor(Math.random() * 90000000) + 10000000}`,
    };
    const endData = {
      cep: "01310100",
      logradouro: "Av Paulista",
      bairro: "Bela Vista",
      localidade: "Sao Paulo",
      uf: "SP",
    };

    const res = http.post(
      `${BASE_URL}/rest/v1/rpc/update_cadastro_from_precadastro`,
      JSON.stringify({
        token_text: cadRes.json()[0].token_acesso,
        tipo_pessoa: "PF",
        pf_data: pfData,
        pj_data: null,
        endereco_data: endData,
      }),
      { headers: h },
    );
    const ok = check(res, {
      "pre-cadastro submit ok": (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });

  sleep(2);
}
