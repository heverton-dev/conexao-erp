import type { ClienteCsvRow, ClienteValidation } from "../types";
import { CLIENTE_CSV_CONFIG } from "../constants";

const VALID_TIPOS = ["PF", "PJ"];
const VALID_STATUS = ["ativo", "inativo", "pendente"];
const VALID_ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function validateClienteRows(
  rows: ClienteCsvRow[],
  headers: string[],
): ClienteValidation[] {
  const errors: ClienteValidation[] = [];

  // Valida colunas obrigatórias
  for (const required of CLIENTE_CSV_CONFIG.requiredFields) {
    if (!headers.includes(required)) {
      errors.push({
        rowIndex: 0,
        field: required,
        message: `Coluna "${required}" é obrigatória`,
        severity: "error",
      });
    }
  }

  // Valida cada linha
  rows.forEach((row, index) => {
    const line = index + 1;

    // Obrigatórios
    if (!row.nome?.trim()) {
      errors.push({ rowIndex: line, field: "nome", message: "Nome é obrigatório", severity: "error" });
    }
    if (!row.tipo_pessoa?.trim()) {
      errors.push({ rowIndex: line, field: "tipo_pessoa", message: "Tipo (PF/PJ) é obrigatório", severity: "error" });
    } else if (!VALID_TIPOS.includes(row.tipo_pessoa.toUpperCase())) {
      errors.push({ rowIndex: line, field: "tipo_pessoa", message: "Tipo deve ser PF ou PJ", severity: "warning" });
    }

    // Formato de email
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({ rowIndex: line, field: "email", message: "Email inválido", severity: "warning" });
    }

    // Telefone / WhatsApp (mínimo 10 dígitos)
    const phoneFields = ["telefone", "whatsapp"] as const;
    for (const f of phoneFields) {
      const val = row[f];
      if (val) {
        const digits = val.replace(/\D/g, "");
        if (digits.length < 10) {
          errors.push({ rowIndex: line, field: f, message: `${f} deve ter pelo menos 10 dígitos`, severity: "warning" });
        }
      }
    }

    // CEP (8 dígitos)
    if (row.cep) {
      const cepDigits = row.cep.replace(/\D/g, "");
      if (cepDigits.length !== 8) {
        errors.push({ rowIndex: line, field: "cep", message: "CEP deve ter 8 dígitos", severity: "warning" });
      }
    }

    // Estado (UF)
    if (row.estado && !VALID_ESTADOS.includes(row.estado.toUpperCase())) {
      errors.push({ rowIndex: line, field: "estado", message: "UF inválida", severity: "warning" });
    }

    // Status
    if (row.status && !VALID_STATUS.includes(row.status.toLowerCase())) {
      errors.push({ rowIndex: line, field: "status", message: "Status deve ser: ativo, inativo ou pendente", severity: "warning" });
    }
  });

  return errors;
}
