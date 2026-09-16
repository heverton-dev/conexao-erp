import { z } from "zod"

export const categoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  locked: z.boolean().default(false),
  ativo: z.boolean().default(true),
})

export const conexaoSchema = z.object({
  categoria_id: z.string().min(1, "Categoria é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().min(1, "Sigla é obrigatória"),
  locked: z.boolean().default(true),
  ativo: z.boolean().default(true),
})

export const familiaSchema = z.object({
  conexao_id: z.string().min(1, "Conexão é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  cor_identificacao: z.string().default("#c9a655"),
  locked: z.boolean().default(false),
  ativo: z.boolean().default(true),
})

export const linhaSchema = z.object({
  familia_id: z.string().min(1, "Família é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  ativo: z.boolean().default(true),
})

export const tipoReabilitacaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoAbutmentSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  tipo_reabilitacao_id: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoComponenteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  categoria_id: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoParafusoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoCicatrizadorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoChaveSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoFresaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoComplementarSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoOpcionalSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoFresagemSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoKitSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const tipoWorkflowSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ativo: z.boolean().default(true),
})

export const etapaWorkflowSchema = z.object({
  tipo_workflow_id: z.string().min(1, "Tipo de workflow é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  ordem: z.coerce.number().min(1, "Ordem é obrigatória"),
  ativo: z.boolean().default(true),
})
