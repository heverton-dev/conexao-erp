import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, EMAIL, PASSWORD as PASS } from "./config.js";

const errorRate = new Rate("relatorio_errors");

export const options = {
  stages: [
    { duration: "5s", target: 10 },
    { duration: "20s", target: 20 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    relatorio_errors: ["rate<0.02"],
    http_req_duration: ["p(95)<5000"],
  },
};

function login() {
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
    Prefer: "count=exact",
  };

  const startDate = "2026-01-01";
  const endDate = "2026-12-31";

  group("Relatorios - cadastros por periodo", () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/cadastros?created_at=gte.${startDate}&created_at=lte.${endDate}&select=id,status,tipo_pessoa,created_by&order=created_at.desc&limit=100`,
      { headers: h },
    );
    check(res, { "relatorio periodo ok": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  group("Relatorios - agrupado por mes", () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/cadastros?created_at=gte.${startDate}&created_at=lte.${endDate}&select=id,status,created_at&limit=500`,
      { headers: h },
    );
    check(res, { "relatorio todos dados ok": (r) => r.status === 200 });
  });

  sleep(2);
}
