import { z } from "zod"

export const componenteSchema = z.object({
  // Vinculações
  tipo_componente_id: z.string().optional(),
  tipo_abutment_id: z.string().optional(),
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
  tipo: z.string().optional(),
  tipo_travamento: z.string().optional(),
  material: z.string().optional(),
  // Comercial
  preco: z.coerce.number().min(0).optional(),
})

export type ComponenteFormData = z.infer<typeof componenteSchema>
