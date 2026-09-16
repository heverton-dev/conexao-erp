import { z } from "zod"

export const implanteSchema = z.object({
  // Hierarquia (categoria_id é DEFAULT, não validado)
  conexao_id: z.string().min(1, "Conexão é obrigatória"),
  familia_id: z.string().min(1, "Família é obrigatória"),
  linha_id: z.string().min(1, "Linha é obrigatória"),
  // Identificação
  sku: z.string().min(1, "SKU é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  sigla: z.string().optional(),
  descricao: z.string().optional(),
  // Protocolos
  osso_soft: z.string().optional(),
  osso_hard: z.string().optional(),
  // Especificações
  diametro_mm: z.coerce.number().positive("Diâmetro deve ser positivo"),
  comprimento_mm: z.coerce.number().positive("Comprimento deve ser positivo"),
  rosca_interna: z.string().optional(),
  regiao_apical: z.string().optional(),
  regiao_cervical: z.string().optional(),
  torque_insercao: z.coerce.number().optional(),
  macrogeometria: z.string().optional(),
  material: z.string().optional(),
  superficie: z.string().optional(),
  // Comercial
  preco: z.coerce.number().min(0).optional(),
})

export type ImplanteFormData = z.infer<typeof implanteSchema>
