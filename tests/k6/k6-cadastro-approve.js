import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, EMAIL as CADASTRO_EMAIL, PASSWORD as CADASTRO_PASS } from "./config.js";

const errorRate = new Rate("approve_errors");

export const options = {
  stages: [
    { duration: "10s", target: 15 },
    { duration: "20s", target: 30 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    approve_errors: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
  },
};

function login() {
  const res = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: CADASTRO_EMAIL, password: CADASTRO_PASS }),
    { headers: { "Content-Type": "application/json", apikey: ANON_KEY } },
  );
  return res.status === 200 ? res.json("access_token") : null;
}

export default function () {
  const token = login();
  if (!token) return;
  const h = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  group("Buscar cadastro em analise", () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/cadastros?status=eq.em_analise&select=id,created_by,lead_nome,colaborador,codigo_cliente&limit=5`,
      { headers: h },
    );
    check(res, { "busca pendentes ok": (r) => r.status === 200 });
  });

  group("Listar atividades do cadastro", () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/atividades?select=id,tipo,descricao,created_at&order=created_at.desc&limit=20`,
      { headers: h },
    );
    check(res, { "atividades ok": (r) => r.status === 200 });
  });

  group("Listar templates notificacao ativos", () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/notificacoes_templates?select=*&ativo=eq.true`,
      { headers: h },
    );
    check(res, { "templates ok": (r) => r.status === 200 });
  });

  sleep(1);
}
