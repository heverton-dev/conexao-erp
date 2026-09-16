import { useSyncExternalStore } from "react"
import { supabase } from "~/lib/supabase"
import type { CartItem, ProductSheetTipo } from "../types"

// ============================================================
// Stock Cache (sessão)
// ============================================================
const stockCache = new Map<string, { qtd_disponivel: number | null; qtd_minima_aviso: number | null; ts: number }>()
const STOCK_CACHE_TTL = 30_000 // 30s

/** Mapeamento tipo → tabela do banco */
const TIPO_TABELA: Record<string, string> = {
  implante: "catalogo_implantes",
  abutment: "catalogo_abutments",
  kit: "catalogo_kits",
  fresa: "catalogo_fresas",
  chave: "catalogo_chaves",
  complementar: "catalogo_complementares",
  opcional: "catalogo_opcionais",
  componente: "catalogo_componentes",
  parafuso: "catalogo_parafusos",
  cicatrizador: "catalogo_cicatrizadores",
  acessorio: "catalogo_acessorios",
  instrumental: "catalogo_instrumentais",
  promocional: "catalogo_promocionais",
}

/**
 * Busca estoque de um SKU em todas as tabelas de produto.
 * Resultado cacheado por 30s para evitar queries repetidas.
 */
export async function getStockForSku(
  sku: string,
): Promise<{ qtd_disponivel: number | null; qtd_minima_aviso: number | null }> {
  const cached = stockCache.get(sku)
  if (cached && Date.now() - cached.ts < STOCK_CACHE_TTL) {
    return { qtd_disponivel: cached.qtd_disponivel, qtd_minima_aviso: cached.qtd_minima_aviso }
  }

  // Busca em paralelo nas tabelas mais comuns
  const tabelas = Object.values(TIPO_TABELA)
  const queries = tabelas.map((tabela) =>
    supabase
      .from(tabela)
      .select("qtd_disponivel, qtd_minima_aviso")
      .eq("sku", sku)
      .maybeSingle(),
  )

  const results = await Promise.allSettled(queries)
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.data) {
      const { qtd_disponivel, qtd_minima_aviso } = r.value.data
      const entry = { qtd_disponivel: qtd_disponivel ?? 0, qtd_minima_aviso: qtd_minima_aviso ?? 0, ts: Date.now() }
      stockCache.set(sku, entry)
      return { qtd_disponivel: entry.qtd_disponivel, qtd_minima_aviso: entry.qtd_minima_aviso }
    }
  }

  // Não encontrado — retorna 0 (sem estoque)
  const fallback = { qtd_disponivel: 0, qtd_minima_aviso: 0, ts: Date.now() }
  stockCache.set(sku, fallback)
  return { qtd_disponivel: fallback.qtd_disponivel, qtd_minima_aviso: fallback.qtd_minima_aviso }
}

/** Invalida cache de estoque (chamar após baixa/alteração) */
export function invalidateStockCache(sku?: string): void {
  if (sku) stockCache.delete(sku)
  else stockCache.clear()
}

const STORAGE_PREFIX = "conexao_cart_v1"

let scopeUserId: string | null = null
let items: CartItem[] = []
let listeners: Array<() => void> = []

function scopeKey(userId: string | null): string {
  const u = userId ?? "anon"
  return `${STORAGE_PREFIX}_${u}`
}

function storageKey(): string {
  return scopeKey(scopeUserId)
}

function loadFromStorage(): void {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(storageKey())
    items = raw ? JSON.parse(raw) : []
  } catch {
    items = []
  }
}

function persist(): void {
  if (typeof window === "undefined") return
  items = [...items]
  try {
    localStorage.setItem(storageKey(), JSON.stringify(items))
  } catch {
    // ignora falhas de escrita (quota/modo privado)
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener)
  return () => { listeners = listeners.filter((l) => l !== listener) }
}

function getSnapshot(): CartItem[] {
  return items
}

/**
 * Define o escopo do carrinho (usuário) e carrega o carrinho
 * persistido para esse escopo..
 */
export function setCarrinhoScope(userId: string | null): void {
  if (scopeUserId === userId) return

  // Persiste o carrinho atual no escopo antigo antes de trocar
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(items))
    } catch {
      // ignora
    }
  }

  scopeUserId = userId
  loadFromStorage()
  listeners.forEach((l) => l())
}

export function useCarrinho(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot)
}

/** Resultado da operação de adicionar ao carrinho */
export interface AddToCartResult {
  success: boolean
  error?: "sem_estoque" | "quantidade_excedida"
  maxPermitido?: number
}

export function addToCart(
  item: Omit<CartItem, "quantidade" | "qtd_disponivel" | "qtd_minima_aviso"> & {
    quantidade?: number
    qtd_disponivel?: number | null
    qtd_minima_aviso?: number | null
  },
): AddToCartResult {
  const qtd = item.quantidade ?? 1
  const estoque = item.qtd_disponivel ?? null
  const existing = items.find((i) => i.sku === item.sku)
  const qtdAtual = existing?.quantidade ?? 0

  // Validação: sem estoque
  if (estoque !== null && estoque < 1) {
    return { success: false, error: "sem_estoque" }
  }

  // Validação: quantidade excede estoque — BLOQUEIA, não adiciona parcialmente
  if (estoque !== null && qtdAtual + qtd > estoque) {
    return { success: false, error: "quantidade_excedida", maxPermitido: estoque }
  }

  // OK — adiciona normalmente
  if (existing) {
    existing.quantidade += qtd
  } else {
    items.push({ ...item, quantidade: qtd, qtd_disponivel: item.qtd_disponivel ?? null, qtd_minima_aviso: item.qtd_minima_aviso ?? null })
  }
  persist()
  return { success: true }
}

export function removeFromCart(sku: string): void {
  items = items.filter((i) => i.sku !== sku)
  persist()
}

/** Resultado da operação de atualizar quantidade */
export interface SetQuantidadeResult {
  success: boolean
  limitado?: boolean
  quantidadeFinal?: number
}

export function setQuantidade(sku: string, quantidade: number): SetQuantidadeResult {
  if (quantidade <= 0) {
    removeFromCart(sku)
    return { success: true }
  }
  const item = items.find((i) => i.sku === sku)
  if (!item) return { success: false }

  // Limita pela quantidade disponível em estoque
  const estoque = item.qtd_disponivel ?? null
  // Estoque conhecido e positivo → valida limite
  if (estoque !== null && estoque > 0 && quantidade > estoque) {
    item.quantidade = estoque
    persist()
    return { success: true, limitado: true, quantidadeFinal: estoque }
  }

  item.quantidade = quantidade
  persist()
  return { success: true, quantidadeFinal: quantidade }
}

export function clearCart(): void {
  items = []
  persist()
}

export function cartTotais(list: CartItem[]): { qtd: number; total: number } {
  return list.reduce(
    (acc, item) => ({ qtd: acc.qtd + item.quantidade, total: acc.total + item.preco * item.quantidade }),
    { qtd: 0, total: 0 },
  )
}

export function resolveBOMItem(row: { fresa_sku?: string | null; chave_sku?: string | null; acessorio_sku?: string | null; instrumental_sku?: string | null; implante_sku?: string | null; fresa?: { nome?: string; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null; chave?: { nome?: string; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null; acessorio?: { nome?: string; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null; instrumental?: { nome?: string; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null; implante?: { diametro_mm?: number; comprimento_mm?: number; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null; quantidade?: number }): { tipo: string; sku: string; nome: string; quantidade: number; preco?: number; qtd_disponivel?: number | null; qtd_minima_aviso?: number | null } | null {
  const checks: [string, string | null | undefined, string | undefined, number | undefined, number | null | undefined, number | null | undefined][] = [
    ["fresa", row.fresa_sku, row.fresa?.nome, row.fresa?.preco, row.fresa?.qtd_disponivel, row.fresa?.qtd_minima_aviso],
    ["chave", row.chave_sku, row.chave?.nome, row.chave?.preco, row.chave?.qtd_disponivel, row.chave?.qtd_minima_aviso],
    ["acessorio", row.acessorio_sku, row.acessorio?.nome, row.acessorio?.preco, row.acessorio?.qtd_disponivel, row.acessorio?.qtd_minima_aviso],
    ["instrumental", row.instrumental_sku, row.instrumental?.nome, row.instrumental?.preco, row.instrumental?.qtd_disponivel, row.instrumental?.qtd_minima_aviso],
    ["implante", row.implante_sku, row.implante ? `${row.implante.diametro_mm}×${row.implante.comprimento_mm}mm` : undefined, row.implante?.preco, row.implante?.qtd_disponivel, row.implante?.qtd_minima_aviso],
  ]
  for (const [tipo, sku, nome, preco, qtdDisponivel, qtdMinimaAviso] of checks) {
    if (sku) return { tipo, sku, nome: nome ?? sku, quantidade: row.quantidade ?? 1, preco, qtd_disponivel: qtdDisponivel, qtd_minima_aviso: qtdMinimaAviso }
  }
  return null
}

export function formatBRL(v: number): string {
  const n = Number(v)
  if (!Number.isFinite(n)) return "R$ 0,00"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)
}

const PRECO_BASE: Record<ProductSheetTipo, number> = {
  implante: 480,
  abutment: 220,
  kit: 3200,
  fresa: 85,
  chave: 120,
  complementar: 95,
  opcional: 95,
  componente: 95,
  parafuso: 45,
  cicatrizador: 180,
  acessorio: 95,
  instrumental: 95,
  promocional: 0,
}

function hashSku(sku: string): number {
  let h = 0
  for (let i = 0; i < sku.length; i++) h = ((h << 5) - h + sku.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function mockPreco(tipo: ProductSheetTipo, sku: string): number {
  const base = PRECO_BASE[tipo]
  if (tipo === "promocional") return 0
  const variation = ((hashSku(sku) % 41) - 20) / 100
  return Math.round(base * (1 + variation) * 100) / 100
}

export function getPrecoFromDB(preco: number | null | undefined, tipo: ProductSheetTipo, sku: string): number {
  const n = Number(preco)
  if (Number.isFinite(n) && n > 0) return n
  return mockPreco(tipo, sku)
}
