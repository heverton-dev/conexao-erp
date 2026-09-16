import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, EMAIL, PASSWORD as PASS } from "./config.js";

const errorRate = new Rate("dashboard_errors");

export const options = {
  stages: [
    { duration: "5s", target: 15 },
    { duration: "20s", target: 30 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    dashboard_errors: ["rate<0.02"],
    http_req_duration: ["p(95)<4000"],
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

  group("Dashboard - contagens por status", () => {
    [
      "em_analise",
      "dados_enviados",
      "aprovado",
      "reprovado",
      "em_correcao",
      "link_gerado",
    ].forEach((status) => {
      const res = http.get(
        `${BASE_URL}/rest/v1/cadastros?status=eq.${status}&select=id&limit=0`,
        { headers: h },
      );
      check(res, { [`count ${status} ok`]: (r) => r.status === 200 });
      errorRate.add(res.status !== 200);
    });
  });

  group("Dashboard - total de cadastros", () => {
    const res = http.get(`${BASE_URL}/rest/v1/cadastros?select=id&limit=0`, {
      headers: h,
    });
    check(res, { "total count ok": (r) => r.status === 200 });
  });

  sleep(2);
}
