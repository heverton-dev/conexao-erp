import { supabase } from "~/lib/supabase"

export interface CatalogoConfiguracoes {
  nome_loja: string
  cnpj: string
  email_contato: string
  telefone: string
  endereco: string
  manutencao: boolean
  msg_manutencao: string
  exibir_precos: boolean
  exibir_estoque: boolean
  checkout_habilitado: boolean
  cupons_habilitado: boolean
}

export const DEFAULT_CONFIGURACOES: CatalogoConfiguracoes = {
  nome_loja: "ERP Odonto",
  cnpj: "",
  email_contato: "",
  telefone: "",
  endereco: "",
  manutencao: false,
  msg_manutencao: "Estamos em manutenção. Volte em breve!",
  exibir_precos: true,
  exibir_estoque: false,
  checkout_habilitado: true,
  cupons_habilitado: true,
}

export async function getConfiguracoes(): Promise<CatalogoConfiguracoes> {
  const { data, error } = await supabase
    .from("catalogo_configuracoes")
    .select("*")
    .maybeSingle()

  if (error || !data) {
    // Se não existir, retorna defaults
    return DEFAULT_CONFIGURACOES
  }

  return data as CatalogoConfiguracoes
}

export async function saveConfiguracoes(config: CatalogoConfiguracoes): Promise<void> {
  const { error } = await supabase
    .from("catalogo_configuracoes")
    .upsert({
      nome_loja: config.nome_loja,
      cnpj: config.cnpj,
      email_contato: config.email_contato,
      telefone: config.telefone,
      endereco: config.endereco,
      manutencao: config.manutencao,
      msg_manutencao: config.msg_manutencao,
      exibir_precos: config.exibir_precos,
      exibir_estoque: config.exibir_estoque,
      checkout_habilitado: config.checkout_habilitado,
      cupons_habilitado: config.cupons_habilitado,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
}
