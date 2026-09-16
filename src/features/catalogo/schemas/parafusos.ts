import { z } from "zod"

export const parafusoSchema = z.object({
  // Vinculações
  tipo_parafuso_id: z.string().optional(),
  chave_id: z.string().optional(),
  // Identificação
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  descricao: z.string().optional(),
  // Especificações
  torque_ncm: z.coerce.number().optional(),
  material: z.string().optional(),
  // Comercial
  preco: z.coerce.number().min(0).optional(),
})

export type ParafusoFormData = z.infer<typeof parafusoSchema>
