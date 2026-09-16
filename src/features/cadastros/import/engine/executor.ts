import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { ClienteCsvRow, ClienteImportProgress } from "../types";

const BATCH_SIZE = 50;

export async function importarClientesEmLote(
  rows: ClienteCsvRow[],

  onProgress?: (progress: ClienteImportProgress) => void,
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const toInsert = batch.map((row) => ({
      // Dados pessoais
      nome_doutor: row.nome,
      tipo_pessoa: row.tipo_pessoa?.toUpperCase() || null,
      cpf_cnpj: row.cpf_cnpj || null,

      // Contato
      lead_email: row.email || null,
      telefone_contato: row.telefone || null,
      lead_whatsapp: row.whatsapp || row.telefone || null,

      // Clínica
      nome_clinica: row.nome_clinica || null,

      // Endereço completo
      cep: row.cep || null,
      rua: row.rua || null,
      numero: row.numero || null,
      bairro: row.bairro || null,
      complemento: row.complemento || null,
      cidade: row.cidade || null,
      estado: row.estado?.toUpperCase() || null,

      // CRM / Observações
      consultor_atual_id: null, // resolvido depois via lookup por email
      status: row.status?.toLowerCase() || "ativo",
      observacoes: row.observacoes || "",
      colaborador: row.colaborador || null,
      codigo_cliente: row.codigo_cliente || null,

      // Controle
      fonte: "csv" as const,
    }));

    const { error } = await supabase.from("clientes").insert(toInsert);
    if (error) {
      errors.push(`Erro no batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      inserted += toInsert.length;
    }

    onProgress?.({
      current: Math.min(i + BATCH_SIZE, rows.length),
      total: rows.length,
      status: "executing",
    });
  }

  if (inserted > 0) {
    dispararEventoModulo(
      "cadastros",
      "clientes.importados",
      { count: inserted },
    ).catch(() => {});
  }

  return { inserted, errors };
}
