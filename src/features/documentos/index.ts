import { supabase } from "~/core/supabase";

export type DocumentoStatus = "pendente" | "ok" | "reprovado" | "em_correcao";

export type Documento = {
  id: string;
  cadastro_id: string;
  tipo: string;
  url: string;
  status: DocumentoStatus;
  comentario_reprovacao: string | null;
  created_at: string;
};

const TIPO_LABEL: Record<string, string> = {
  cro_frente: "CRO/TPD - Frente",
  cro_verso: "CRO/TPD - Verso",
  cnh_frente: "CNH/CPF/RG - Frente",
  cnh_verso: "CNH/CPF/RG - Verso",
  comprovante_endereco: "Comprovante de Endereço",
  contrato_social: "Contrato Social",
  declaracao_prestacao_servico: "Declaração de Prestação de Serviço",
};

export function getTipoLabel(tipo: string): string {
  return TIPO_LABEL[tipo] || tipo;
}

export const STATUS_DOC_LABEL: Record<DocumentoStatus, string> = {
  pendente: "Pendente",
  ok: "Ok",
  reprovado: "Reprovado",
  em_correcao: "Em Correção",
};

export const STATUS_DOC_COLOR: Record<DocumentoStatus, string> = {
  pendente: "bg-yellow-500/10 text-yellow-400",
  ok: "bg-green-500/10 text-green-400",
  reprovado: "bg-red-500/10 text-red-400",
  em_correcao: "bg-orange-500/10 text-orange-400",
};

export async function uploadDocumento(
  cadastro_id: string,
  tipo: string,
  file: File,
): Promise<Documento> {
  const ext = file.name.split(".").pop();
  const fileName = `${cadastro_id}/${tipo}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(fileName, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("documentos")
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from("documentos")
    .insert({ cadastro_id, tipo, url: urlData.publicUrl })
    .select()
    .single();
  if (error) throw error;
  return data as Documento;
}

export async function listarDocumentos(cadastro_id: string) {
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("cadastro_id", cadastro_id);
  if (error) throw error;
  return data as Documento[];
}

export async function aprovarDocumento(id: string) {
  const { data, error } = await supabase
    .from("documentos")
    .update({ status: "ok", comentario_reprovacao: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Documento;
}

export async function reprovarDocumento(id: string, motivo: string) {
  const { data, error } = await supabase
    .from("documentos")
    .update({ status: "reprovado", comentario_reprovacao: motivo })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Documento;
}

export async function solicitarCorrecaoDocumento(
  id: string,
  comentario: string,
) {
  const { data, error } = await supabase
    .from("documentos")
    .update({ status: "em_correcao", comentario_reprovacao: comentario })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Documento;
}

export async function reverterDocumento(id: string) {
  const { data, error } = await supabase
    .from("documentos")
    .update({ status: "pendente", comentario_reprovacao: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Documento;
}

export const DOCS_PF_REQUIRED = [
  "cro_frente",
  "cro_verso",
  "cnh_frente",
  "cnh_verso",
  "comprovante_endereco",
];

export const DOCS_PJ_REQUIRED = [
  ...DOCS_PF_REQUIRED,
  "contrato_social",
  "declaracao_prestacao_servico",
];

export type DocStatus =
  "inclusa" | "incompleta" | "nao_enviada" | "pendente" | "em_analise";

export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  inclusa: "Documentação Inclusa",
  incompleta: "Documentação Incompleta",
  nao_enviada: "Documentação Não Enviada",
  pendente: "Documentação Pendente",
  em_analise: "Documentação Em Análise",
};

export const DOC_STATUS_COLOR: Record<DocStatus, string> = {
  inclusa: "bg-green-500/15 text-green-400 border border-green-500/20",
  incompleta: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  nao_enviada: "bg-gray-500/15 text-gray-400 border border-gray-500/20",
  pendente: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  em_analise: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
};

export function determinarDocStatus(
  docs: Documento[],
  tipo_pessoa: string | null,
): DocStatus {
  if (docs.length === 0) return "nao_enviada";

  if (docs.some((d) => d.status === "em_correcao")) return "pendente";

  const required = tipo_pessoa === "PJ" ? DOCS_PJ_REQUIRED : DOCS_PF_REQUIRED;
  const uploadedTypes = new Set(docs.map((d) => d.tipo));
  const allRequiredPresent = required.every((t) => uploadedTypes.has(t));

  if (!allRequiredPresent) return "incompleta";

  if (docs.some((d) => d.status === "pendente")) return "em_analise";

  return "inclusa";
}

export async function getDocumentosStatus(
  cadastro_id: string,
  tipo_pessoa: string | null,
): Promise<DocStatus> {
  const docs = await listarDocumentos(cadastro_id);
  return determinarDocStatus(docs, tipo_pessoa);
}

export async function getDocumentosStatusMap(
  cadastros: { id: string; tipo_pessoa: string | null }[],
): Promise<Record<string, DocStatus>> {
  if (cadastros.length === 0) return {};
  const ids = cadastros.map((c) => c.id);
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .in("cadastro_id", ids);
  if (error) throw error;

  const grouped: Record<string, Documento[]> = {};
  data?.forEach((d) => {
    if (!grouped[d.cadastro_id]) grouped[d.cadastro_id] = [];
    grouped[d.cadastro_id].push(d);
  });

  const result: Record<string, DocStatus> = {};
  for (const c of cadastros) {
    result[c.id] = determinarDocStatus(grouped[c.id] || [], c.tipo_pessoa);
  }
  return result;
}

export async function setDocumentosMassa(
  ids: string[],
  status: DocumentoStatus,
  comentario: string | null,
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("documentos")
    .update({ status, comentario_reprovacao: comentario })
    .in("id", ids);
  if (error) throw error;
}
