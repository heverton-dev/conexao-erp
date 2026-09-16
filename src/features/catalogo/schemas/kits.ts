import { z } from "zod"

export const kitSchema = z.object({
  // Vinculações
  tipo_kit_id: z.string().optional(),
  // Identificação
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  descricao: z.string().optional(),
  // Comercial
  preco: z.coerce.number().min(0).optional(),
})

export type KitFormData = z.infer<typeof kitSchema>
