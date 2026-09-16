import { z } from "zod"

export const abutmentSchema = z.object({
  // Vinculações
  tipo_abutment_id: z.string().min(1, "Tipo de abutment é obrigatório"),
  parafuso_id: z.string().optional(),
  chave_id: z.string().optional(),
  // Identificação
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  descricao: z.string().optional(),
  // Especificações
  diametro_plataforma_mm: z.coerce.number().optional(),
  altura_transmucoso_mm: z.coerce.number().optional(),
  altura_corpo_mm: z.coerce.number().optional(),
  angulacao_graus: z.coerce.number().optional(),
  torque_ncm: z.coerce.number().optional(),
  material: z.string().optional(),
  // Comercial
  preco: z.coerce.number().min(0).optional(),
})

export type AbutmentFormData = z.infer<typeof abutmentSchema>
