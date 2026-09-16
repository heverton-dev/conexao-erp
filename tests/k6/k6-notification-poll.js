import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, USERS } from "./config.js";

const errorRate = new Rate("poll_errors");
const pollDuration = new Trend("poll_duration");

export const options = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "100s", target: 200 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    poll_errors: ["rate<0.01"],
    poll_duration: ["p(95)<1000"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const user = USERS[Math.floor(Math.random() * USERS.length)];

  // Login (ocorre a cada iteracao para simular sessoes distintas)
  const loginRes = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: user.email, password: user.pass }),
    { headers: { "Content-Type": "application/json", apikey: ANON_KEY } },
  );

  if (loginRes.status !== 200) {
    errorRate.add(1);
    sleep(10);
    return;
  }

  const token = loginRes.json("access_token");
  const uid = loginRes.json("user.id");
  const h = { apikey: ANON_KEY, Authorization: `Bearer ${token}` };

  // Polling de notificacoes (como o AppLayout faz a cada 10s)
  group("Notification polling", () => {
    const start = Date.now();
    const res = http.get(
      `${BASE_URL}/rest/v1/notificacoes?usuario_id=eq.${uid}&select=id,titulo,mensagem,lida,created_at,dados&order=created_at.desc&limit=100`,
      { headers: h },
    );
    pollDuration.add(Date.now() - start);
    const ok = check(res, { "notificacoes poll ok": (r) => r.status === 200 });
    errorRate.add(!ok);

    // Se tiver notificacoes nao lidas, marcar algumas como lidas
    if (res.status === 200) {
      const notifs = res.json();
      if (notifs && notifs.length > 0) {
        const unread = notifs.filter((n) => n.lida === false);
        if (unread.length > 0) {
          const toMark = unread.slice(0, Math.min(3, unread.length));
          toMark.forEach((n) => {
            http.patch(
              `${BASE_URL}/rest/v1/notificacoes?id=eq.${n.id}`,
              JSON.stringify({ lida: true }),
              { headers: { ...h, "Content-Type": "application/json" } },
            );
          });
        }
      }
    }
  });

  // Intervalo de 10s igual ao polling real
  sleep(10);
}
