import { supabase } from "~/core/supabase";
import type { RotaClienteBase, ClienteBaseFilters } from "../types";

export async function listarClientesBase(
  empresaId?: string | null,
  usuarioId?: string | null,
  filters?: ClienteBaseFilters,
): Promise<RotaClienteBase[]> {
  let query = supabase
    .from("rotas_clientes_base")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (empresaId) query = query.eq("empresa_id", empresaId);
  if (usuarioId) query = query.eq("usuario_id", usuarioId);

  if (filters?.cidade) query = query.ilike("cidade", `%${filters.cidade}%`);
  if (filters?.estado) query = query.eq("estado", filters.estado);
  if (filters?.categoria)
    query = query.ilike("categoria", `%${filters.categoria}%`);
  if (filters?.ticket_medio_min)
    query = query.gte("ticket_medio", filters.ticket_medio_min);
  if (filters?.ticket_medio_max)
    query = query.lte("ticket_medio", filters.ticket_medio_max);
  if (filters?.ultima_visita_antes)
    query = query.lt("ultima_visita", filters.ultima_visita_antes);
  if (filters?.ultima_visita_apos)
    query = query.gt("ultima_visita", filters.ultima_visita_apos);
  if (filters?.search) {
    query = query.or(
      `nome.ilike.%${filters.search}%,cidade.ilike.%${filters.search}%,categoria.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as RotaClienteBase[];
}

export async function buscarClienteBase(id: string): Promise<RotaClienteBase> {
  const { data, error } = await supabase
    .from("rotas_clientes_base")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as RotaClienteBase;
}

export async function criarClienteBase(
  cliente: Omit<RotaClienteBase, "id" | "created_at" | "updated_at">,
): Promise<RotaClienteBase> {
  const { data, error } = await supabase
    .from("rotas_clientes_base")
    .insert(cliente)
    .select()
    .single();
  if (error) throw error;
  return data as RotaClienteBase;
}

export async function criarClientesBaseEmLote(
  clientes: Omit<RotaClienteBase, "id" | "created_at" | "updated_at">[],
): Promise<{ inseridos: number; erros: string[] }> {
  const erros: string[] = [];
  let inseridos = 0;

  for (const cliente of clientes) {
    try {
      const { error } = await supabase
        .from("rotas_clientes_base")
        .insert(cliente);
      if (error) {
        erros.push(`Erro ao inserir "${cliente.nome}": ${error.message}`);
      } else {
        inseridos++;
      }
    } catch (err) {
      erros.push(
        `Erro ao inserir "${cliente.nome}": ${(err as Error).message}`,
      );
    }
  }

  return { inseridos, erros };
}

export async function atualizarClienteBase(
  id: string,
  updates: Partial<RotaClienteBase>,
): Promise<RotaClienteBase> {
  const { data, error } = await supabase
    .from("rotas_clientes_base")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as RotaClienteBase;
}

export async function excluirClienteBase(id: string): Promise<void> {
  const { error } = await supabase
    .from("rotas_clientes_base")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function contarClientesBase(
  empresaId?: string | null,
  usuarioId?: string | null,
): Promise<number> {
  let query = supabase
    .from("rotas_clientes_base")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  if (empresaId) query = query.eq("empresa_id", empresaId);
  if (usuarioId) query = query.eq("usuario_id", usuarioId);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}
