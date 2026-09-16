import { z } from "zod"

export const protocoloFresagemSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo_osso: z.string().min(1, "Tipo de osso é obrigatório"),
  sigla: z.string().optional(),
  diametro_mm_aplicavel: z.coerce.number().optional(),
  ativo: z.boolean().default(true),
})

export type ProtocoloFresagemFormData = z.infer<typeof protocoloFresagemSchema>

export const protocoloFresaItemSchema = z.object({
  fresa_id: z.string().min(1, "Fresa é obrigatória"),
  ordem: z.coerce.number().min(1, "Ordem é obrigatória"),
})

export type ProtocoloFresaItemFormData = z.infer<typeof protocoloFresaItemSchema>
