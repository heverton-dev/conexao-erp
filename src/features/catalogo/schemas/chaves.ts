import { z } from "zod"

export const chaveSchema = z.object({
  // Vinculações
  tipo_chave_id: z.string().optional(),
  // Identificação
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  descricao: z.string().optional(),
  // Especificações
  tipo: z.string().optional(),
  comprimento: z.string().optional(),
  diametro_mm: z.coerce.number().optional(),
  material: z.string().optional(),
  // Comercial
  preco: z.coerce.number().min(0).optional(),
})

export type ChaveFormData = z.infer<typeof chaveSchema>
