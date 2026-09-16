/** Traduz erros comuns do Postgres/PostgREST para mensagens amigáveis. Cai no texto original se não reconhecer. */
export function friendlyDbError(error: { code?: string; message?: string } | null | undefined): string {
  if (!error) return "Erro desconhecido"
  if (error.code === "23505") return "Já existe um registro cadastrado com esse SKU/identificador. Use outro valor."
  if (error.code === "23503") return "Este registro está vinculado a outros dados e não pode ser removido/alterado dessa forma."
  return error.message ?? "Erro desconhecido"
}
