import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, SUPER_ADMIN_EMAIL as EMAIL, SUPER_ADMIN_PASSWORD as PASS } from "./config.js";

const errorRate = new Rate("webhook_errors");

export const options = {
  stages: [
    { duration: "5s", target: 8 },
    { duration: "20s", target: 15 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    webhook_errors: ["rate<0.05"],
    http_req_duration: ["p(95)<5000"],
  },
};

function login() {
  if (!EMAIL || !PASS) { console.error("Missing K6_SUPER_ADMIN_EMAIL or K6_SUPER_ADMIN_PASSWORD"); return null; }
  const res = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: EMAIL, password: PASS }),
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
  };

  group("Listar webhooks configurados", () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/webhooks?select=*&ativo=eq.true`,
      { headers: h },
    );
    check(res, { "webhooks list ok": (r) => r.status === 200 });
  });

  group("Listar api_connectors ativos", () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/api_connectors?select=*&is_active=eq.true`,
      { headers: h },
    );
    check(res, { "api_connectors list ok": (r) => r.status === 200 });
  });

  group("Executar api_connector (Evolution)", () => {
    // Buscar o connector do Evolution
    const connRes = http.get(
      `${BASE_URL}/rest/v1/api_connectors?name=eq.Evolution:%20Enviar%20Texto&select=id`,
      { headers: h },
    );
    if (connRes.status === 200 && connRes.json().length > 0) {
      const connId = connRes.json()[0].id;
      const rpcRes = http.post(
        `${BASE_URL}/rest/v1/rpc/executar_api_connector_server`,
        JSON.stringify({
          p_connector_id: connId,
          p_variables: { test: "true" },
        }),
        { headers: h },
      );
      check(rpcRes, { "api_connector rpc ok": (r) => r.status === 200 });
      errorRate.add(rpcRes.status !== 200);
    }
  });

  sleep(1);
}
