// Shared config for k6 tests — reads credentials from environment variables.
// Run with: k6 run --env BASE_URL=... --env K6_EMAIL=... --env K6_PASSWORD=... script.js

const BASE_URL = __ENV.BASE_URL || "https://cluuqzhizeqvkgvfdisx.supabase.co";
const ANON_KEY = __ENV.ANON_KEY || "";

// Credentials must be provided via environment variables — never hardcoded
const EMAIL = __ENV.K6_EMAIL || "";
const PASSWORD = __ENV.K6_PASSWORD || "";

const SUPER_ADMIN_EMAIL = __ENV.K6_SUPER_ADMIN_EMAIL || "";
const SUPER_ADMIN_PASSWORD = __ENV.K6_SUPER_ADMIN_PASSWORD || "";

const USERS = [
  { email: __ENV.K6_USER_CADASTRO_EMAIL || "", pass: __ENV.K6_USER_CADASTRO_PASSWORD || "" },
  { email: __ENV.K6_USER_CONSULTOR_EMAIL || "", pass: __ENV.K6_USER_CONSULTOR_PASSWORD || "" },
  { email: __ENV.K6_USER_TI_EMAIL || "", pass: __ENV.K6_USER_TI_PASSWORD || "" },
];

export { BASE_URL, ANON_KEY, EMAIL, PASSWORD, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, USERS };
