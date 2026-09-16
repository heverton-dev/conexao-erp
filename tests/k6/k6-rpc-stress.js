import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, EMAIL, PASSWORD as PASS } from "./config.js";

const errorRate = new Rate("rpc_errors");
const rpcDuration = new Trend("rpc_duration");

export const options = {
  stages: [
    { duration: "20s", target: 30 },
    { duration: "40s", target: 60 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    rpc_errors: ["rate<0.03"],
    rpc_duration: ["p(95)<2000"],
  },
};

function login() {
  const res = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: EMAIL, password: PASS }),
    { headers: { "Content-Type": "application/json", apikey: ANON_KEY } },
  );
  return res.status === 200
    ? { token: res.json("access_token"), uid: res.json("user.id") }
    : null;
}

export default function () {
  const session = login();
  if (!session) return;
  const { token } = session;
  const h = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // RPC: limpar_links_expirados
  group("RPC limpar_links_expirados", () => {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/rest/v1/rpc/limpar_links_expirados`,
      "{}",
      { headers: h },
    );
    rpcDuration.add(Date.now() - start);
    check(res, { "limpar_links ok": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  // RPC: is_admin_or_super
  group("RPC is_admin_or_super", () => {
    const start = Date.now();
    const res = http.post(`${BASE_URL}/rest/v1/rpc/is_admin_or_super`, "{}", {
      headers: h,
    });
    rpcDuration.add(Date.now() - start);
    check(res, { "is_admin_or_super ok": (r) => r.status === 200 });
  });

  // RPC: verificar_documento_duplicado
  group("RPC verificar_documento_duplicado", () => {
    const cpf = `${String(Math.floor(Math.random() * 900) + 100)}.${String(Math.floor(Math.random() * 900) + 100)}.${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 90) + 10)}`;
    const res = http.post(
      `${BASE_URL}/rest/v1/rpc/verificar_documento_duplicado`,
      JSON.stringify({ documento_texto: cpf, tipo_documento: "cpf" }),
      { headers: h },
    );
    check(res, { "verificar_duplicado ok": (r) => r.status === 200 });
  });

  sleep(2);
}
