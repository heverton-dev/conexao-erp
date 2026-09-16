import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

import { BASE_URL, ANON_KEY, EMAIL as CADASTRO_EMAIL, PASSWORD as CADASTRO_PASSWORD } from "./config.js";

const listErrorRate = new Rate('list_errors');
const listDuration = new Trend('list_duration');

export const options = {
  stages: [
    { duration: '10s', target: 25 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    list_errors: ['rate<0.02'],
    list_duration: ['p(95)<3000'],
    http_req_duration: ['p(95)<5000'],
  },
};

function login() {
  const res = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: CADASTRO_EMAIL, password: CADASTRO_PASSWORD }),
    { headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY } }
  );
  return res.status === 200 ? res.json('access_token') : null;
}

export default function () {
  const token = login();
  if (!token) return;

  const headers = {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Prefer': 'count=exact',
  };

  group('Listar cadastros com filtros', () => {
    // Listagem principal com paginacao
    const start = Date.now();
    const res = http.get(
      `${BASE_URL}/rest/v1/cadastros?select=id,tipo_pessoa,status,colaborador,lead_nome,created_at,codigo_cliente&order=created_at.desc&limit=20&offset=0`,
      { headers }
    );
    listDuration.add(Date.now() - start);
    const ok = check(res, { 'cadastros listados': (r) => r.status === 200 });
    listErrorRate.add(!ok);
  });

  group('Listar com join clientes view', () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/clientes?select=id,nome,cpf,status,codigo_cliente,created_at&order=created_at.desc&limit=20`,
      { headers }
    );
    check(res, { 'clientes view ok': (r) => r.status === 200 });
  });

  group('Filtrar por status', () => {
    const statuses = ['em_analise', 'dados_enviados', 'aprovado', 'link_gerado'];
    const s = statuses[Math.floor(Math.random() * statuses.length)];
    const res = http.get(
      `${BASE_URL}/rest/v1/cadastros?status=eq.${s}&select=id,status,colaborador&limit=10`,
      { headers }
    );
    check(res, { `filtro status ${s} ok`: (r) => r.status === 200 });
  });

  group('Busca por nome', () => {
    const res = http.get(
      `${BASE_URL}/rest/v1/cadastros?colaborador=ilike.*a*&limit=10`,
      { headers }
    );
    check(res, { 'busca nome ok': (r) => r.status === 200 });
  });

  sleep(1);
}
