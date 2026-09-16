/**
 * Configuração fixa da empresa (single-tenant).
 *
 * Em modo single-tenant, a empresa é sempre a mesma.
 * Estas constantes são lidas de variáveis de ambiente e usadas
 * em todo o app para substituir o parâmetro `empresaId` dinâmico.
 */

export const EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID as string;
export const EMPRESA_SLUG = import.meta.env.VITE_EMPRESA_SLUG as string;

// Validação em runtime
if (!EMPRESA_ID) {
  console.error(
    "[config/empresa] VITE_EMPRESA_ID não definido no .env — verifique a configuração."
  );
}

if (!EMPRESA_SLUG) {
  console.error(
    "[config/empresa] VITE_EMPRESA_SLUG não definido no .env — verifique a configuração."
  );
}
