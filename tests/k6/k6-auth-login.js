import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";
import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";

const BASE_URL = "https://cluuqzhizeqvkgvfdisx.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdXVxemhpemVxdmtndmZkaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg3NjksImV4cCI6MjA5NzM2NDc2OX0.GM3quHA1z_9kCiMEYsfAh9Pi0KVdnCIFQEYe-wwE9MM";

const loginErrorRate = new Rate("login_errors");
const loginDuration = new Trend("login_duration");

const CREDENTIALS = [
  {
    email: EMAIL,
    password: PASSWORD,
    role: "cadastro",
  },
  {
    email: __ENV.K6_USER_CONSULTOR_EMAIL || EMAIL,
    password: __ENV.K6_USER_CONSULTOR_PASSWORD || PASSWORD,
    role: "consultor",
  },
  { email: __ENV.K6_USER_TI_EMAIL || EMAIL, password: __ENV.K6_USER_TI_PASSWORD || PASSWORD, role: "ti" },
];

export const options = {
  stages: [
    { duration: "5s", target: 50 },
    { duration: "20s", target: 100 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    login_errors: ["rate<0.05"],
    login_duration: ["p(95)<3000"],
    http_req_duration: ["p(95)<5000"],
  },
};

function login(email, password) {
  const url = `${BASE_URL}/auth/v1/token?grant_type=password`;
  const payload = JSON.stringify({ email, password });
  const params = {
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
    },
  };
  const start = Date.now();
  const res = http.post(url, payload, params);
  const duration = Date.now() - start;

  loginDuration.add(duration);
  const success = check(res, {
    "login status 200": (r) => r.status === 200,
    "access_token presente": (r) => r.json("access_token") !== undefined,
  });
  loginErrorRate.add(!success);

  return res;
}

export default function () {
  group("Autenticacao - Login", () => {
    const cred = CREDENTIALS[Math.floor(Math.random() * CREDENTIALS.length)];
    const res = login(cred.email, cred.password);

    if (res.status === 200) {
      const token = res.json("access_token");

      group("Apos login - buscar profile", () => {
        const profileUrl = `${BASE_URL}/rest/v1/profiles?select=id,email,nome,ambiente,role&id=eq.${res.json("user.id")}`;
        const profileRes = http.get(profileUrl, {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        check(profileRes, {
          "profile retornado": (r) => r.status === 200 && r.json().length > 0,
        });
      });

      group("Apos login - buscar permissoes", () => {
        const userId = res.json("user.id");
        const permUrl = `${BASE_URL}/rest/v1/permissoes?select=permissoes&usuario_id=eq.${userId}`;
        const permRes = http.get(permUrl, {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        check(permRes, {
          "permissoes retornadas": (r) => r.status === 200,
        });
      });
    }
  });

  sleep(1);
}
