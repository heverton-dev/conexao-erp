import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

import { BASE_URL, ANON_KEY, USERS } from "./config.js";

const errorRate = new Rate("app_errors");
const slowEndpoint = new Rate("slow_endpoints");

// Cache tokens per VU to avoid auth rate limiting
const tokens = {};

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "30s", target: 20 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    app_errors: ["rate<0.05"],
    http_req_duration: ["p(95)<5000"],
  },
};

function getOrLogin(vu) {
  if (tokens[vu]) return tokens[vu];
  const user = USERS[vu % USERS.length];
  const res = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: user.email, password: user.pass }),
    {
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      tags: { name: "auth_login" },
    },
  );
  if (res.status === 200) {
    tokens[vu] = {
      token: res.json("access_token"),
      uid: res.json("user.id"),
      email: user.email,
    };
    return tokens[vu];
  }
  return null;
}

// Use setup to pre-warm tokens
export function setup() {
  const tokens = {};
  for (const u of USERS) {
    const res = http.post(
      `${BASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({ email: u.email, password: u.pass }),
      { headers: { "Content-Type": "application/json", apikey: ANON_KEY } },
    );
    if (res.status === 200) tokens[u.email] = res.json("access_token");
  }
  return { tokens };
}

export default function (data) {
  // Use setup token
  const vu = __VU % USERS.length;
  const user = USERS[vu];
  const token = data.tokens[user.email];
  if (!token) {
    errorRate.add(1);
    sleep(2);
    return;
  }

  const h = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
    Prefer: "count=exact",
  };
  const hJson = { ...h, "Content-Type": "application/json" };

  // Scenario 1: Dashboard - contagens por status (6 queries)
  group("Dashboard queries", () => {
    [
      "em_analise",
      "dados_enviados",
      "aprovado",
      "reprovado",
      "em_correcao",
      "link_gerado",
    ].forEach((s) => {
      const r = http.get(
        `${BASE_URL}/rest/v1/cadastros?status=eq.${s}&select=id&limit=0`,
        { headers: h, tags: { name: "dashboard_count" } },
      );
      check(r, { [`count ${s} ok`]: (res) => res.status === 200 });
      errorRate.add(r.status !== 200);
      if (r.timings.duration > 2000) slowEndpoint.add(1);
    });
  });

  // Scenario 2: Listar cadastros com paginacao
  group("List cadastros", () => {
    const r = http.get(
      `${BASE_URL}/rest/v1/cadastros?select=id,tipo_pessoa,status,colaborador,lead_nome,created_at,codigo_cliente&order=created_at.desc&limit=20&offset=0`,
      { headers: h, tags: { name: "list_cadastros" } },
    );
    check(r, { "cadastros list ok": (res) => res.status === 200 });
    errorRate.add(r.status !== 200);
  });

  // Scenario 3: Clientes view
  group("Clientes view", () => {
    const r = http.get(
      `${BASE_URL}/rest/v1/clientes?select=id,nome,cpf,status,codigo_cliente,created_at&order=created_at.desc&limit=20`,
      { headers: h, tags: { name: "clientes_view" } },
    );
    check(r, { "clientes view ok": (res) => res.status === 200 });
    errorRate.add(r.status !== 200);
  });

  // Scenario 4: Notificacoes (polling)
  group("Notificacoes polling", () => {
    const r = http.get(
      `${BASE_URL}/rest/v1/notificacoes?usuario_id=eq.${data.tokens[user.email + "_uid"] || "none"}&select=id,titulo,mensagem,lida,created_at,dados&order=created_at.desc&limit=100`,
      { headers: h, tags: { name: "notificacoes_poll" } },
    );
    check(r, { "notificacoes poll ok": (res) => res.status === 200 });
  });

  // Scenario 5: RPC - is_admin_or_super
  group("RPC is_admin_or_super", () => {
    const r = http.post(`${BASE_URL}/rest/v1/rpc/is_admin_or_super`, "{}", {
      headers: hJson,
      tags: { name: "rpc_admin_check" },
    });
    check(r, { "rpc admin check ok": (res) => res.status === 200 });
  });

  // Scenario 6: RPC - verificar_documento_duplicado
  group("RPC verificar documento duplicado", () => {
    const r = http.post(
      `${BASE_URL}/rest/v1/rpc/verificar_documento_duplicado`,
      JSON.stringify({
        documento_texto: "123.456.789-00",
        tipo_documento: "cpf",
      }),
      { headers: hJson, tags: { name: "rpc_dup_check" } },
    );
    check(r, { "rpc dup check ok": (res) => res.status === 200 });
  });

  // Scenario 7: Profiles (for notification recipients)
  group("Profiles query", () => {
    const r = http.get(
      `${BASE_URL}/rest/v1/profiles?select=id,email,nome,ambiente,role`,
      { headers: h, tags: { name: "profiles_list" } },
    );
    check(r, { "profiles ok": (res) => res.status === 200 });
  });

  // Scenario 8: Notificacoes templates
  group("Notificacao templates", () => {
    const r = http.get(
      `${BASE_URL}/rest/v1/notificacoes_templates?select=*&ativo=eq.true`,
      { headers: h, tags: { name: "notif_templates" } },
    );
    check(r, { "templates ok": (res) => res.status === 200 });
  });

  sleep(2);
}
