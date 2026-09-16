import { supabase } from "~/core/supabase"
import type { CatalogoImagemProduto, ProdutoTipoImagem, FonteImagem } from "../types"
import { compressImage } from "../lib/compressImage"

const BUCKET = "catalogo-imagens"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

/**
 * Converte URL de compartilhamento Google Drive para URL direta de download.
 * Aceita formatos:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/open?id={FILE_ID}
 */
export function extrairUrlGoogleDrive(url: string): string {
  let fileId = ""

  // Formato: /file/d/{FILE_ID}/
  const matchFile = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (matchFile) {
    fileId = matchFile[1]
  }

  // Formato: ?id={FILE_ID}
  if (!fileId) {
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (matchId) {
      fileId = matchId[1]
    }
  }

  if (!fileId) {
    throw new Error("URL do Google Drive inválida. Use o link de compartilhamento.")
  }

  return `https://lh3.googleusercontent.com/d/${fileId}`
}

/**
 * Valida se o arquivo atende aos requisitos de upload.
 * Arquivos > 5MB serão comprimidos automaticamente.
 */
export function validarArquivoImagem(file: File): { valido: boolean; erro?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valido: false, erro: `Tipo de arquivo não aceito. Use: JPG, PNG, WebP ou GIF.` }
  }
  return { valido: true }
}

/**
 * Upload de imagem para Supabase Storage.
 */
export async function uploadImagem(
  tipo: ProdutoTipoImagem,
  sku: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const validacao = validarArquivoImagem(file)
  if (!validacao.valido) throw new Error(validacao.erro)

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `${tipo}/${sku}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return { url: urlData.publicUrl, path }
}

/**
 * Adiciona uma imagem por URL externa (S3 ou Google Drive).
 */
export async function adicionarImagemUrl(
  tipo: ProdutoTipoImagem,
  sku: string,
  url: string,
  fonte: FonteImagem = "url",
): Promise<CatalogoImagemProduto> {
  let urlFinal = url

  if (fonte === "gdrive") {
    urlFinal = extrairUrlGoogleDrive(url)
  }

  // Buscar última ordem para colocar nova imagem no final
  const { data: ultima } = await supabase
    .from("catalogo_imagens_produto")
    .select("ordem_exibicao")
    .eq("produto_tipo", tipo)
    .eq("produto_sku", sku)
    .order("ordem_exibicao", { ascending: false })
    .limit(1)
    .single()

  const novaOrdem = (ultima?.ordem_exibicao ?? -1) + 1

  const { data, error } = await supabase
    .from("catalogo_imagens_produto")
    .insert({
      produto_tipo: tipo,
      produto_sku: sku,
      url_imagem: urlFinal,
      fonte,
      ordem_exibicao: novaOrdem,
    })
    .select()
    .single()

  if (error) throw error
  return data as CatalogoImagemProduto
}

/**
 * Lista imagens de um produto.
 */
export async function listarImagens(
  tipo: ProdutoTipoImagem,
  sku: string,
): Promise<CatalogoImagemProduto[]> {
  const { data, error } = await supabase
    .from("catalogo_imagens_produto")
    .select("*")
    .eq("produto_tipo", tipo)
    .eq("produto_sku", sku)
    .order("ordem_exibicao")

  if (error) throw error
  return (data || []) as CatalogoImagemProduto[]
}

/**
 * Lista imagens de múltiplos produtos de uma vez (batch).
 * Retorna um Map<sku, imagens[]>.
 */
export async function listarImagensBatch(
  tipo: ProdutoTipoImagem,
  skus: string[],
): Promise<Map<string, CatalogoImagemProduto[]>> {
  if (skus.length === 0) return new Map()

  const { data, error } = await supabase
    .from("catalogo_imagens_produto")
    .select("*")
    .eq("produto_tipo", tipo)
    .in("produto_sku", skus)
    .order("ordem_exibicao")

  if (error) throw error

  const map = new Map<string, CatalogoImagemProduto[]>()
  for (const img of (data || []) as CatalogoImagemProduto[]) {
    const existing = map.get(img.produto_sku) || []
    existing.push(img)
    map.set(img.produto_sku, existing)
  }
  return map
}

/**
 * Remove uma imagem. Se foi upload, também remove do Storage.
 */
export async function removerImagem(
  imagemId: string,
  fonte: FonteImagem = "upload",
  path?: string,
): Promise<void> {
  // Se foi upload, tentar remover do storage
  if (fonte === "upload" && path) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {})
  }

  const { error } = await supabase
    .from("catalogo_imagens_produto")
    .delete()
    .eq("id", imagemId)

  if (error) throw error
}

/**
 * Atualiza a ordem de exibição de múltiplas imagens.
 */
export async function reordenarImagens(
  tipo: ProdutoTipoImagem,
  sku: string,
  ordens: { id: string; ordem: number }[],
): Promise<void> {
  const updates = ordens.map(({ id, ordem }) =>
    supabase
      .from("catalogo_imagens_produto")
      .update({ ordem_exibicao: ordem })
      .eq("id", id)
  )

  const results = await Promise.all(updates)
  const error = results.find((r) => r.error)?.error
  if (error) throw error
}

/**
 * Upload + inserção automática (combina upload com inserção no banco).
 * Comprime automaticamente imagens > 5MB.
 */
export async function uploadEAdicionarImagem(
  tipo: ProdutoTipoImagem,
  sku: string,
  file: File,
): Promise<CatalogoImagemProduto> {
  const arquivoFinal = await compressImage(file)
  const { url, path } = await uploadImagem(tipo, sku, arquivoFinal)

  // Buscar última ordem
  const { data: ultima } = await supabase
    .from("catalogo_imagens_produto")
    .select("ordem_exibicao")
    .eq("produto_tipo", tipo)
    .eq("produto_sku", sku)
    .order("ordem_exibicao", { ascending: false })
    .limit(1)
    .single()

  const novaOrdem = (ultima?.ordem_exibicao ?? -1) + 1

  const { data, error } = await supabase
    .from("catalogo_imagens_produto")
    .insert({
      produto_tipo: tipo,
      produto_sku: sku,
      url_imagem: url,
      fonte: "upload",
      ordem_exibicao: novaOrdem,
    })
    .select()
    .single()

  if (error) throw error
  return data as CatalogoImagemProduto
}
