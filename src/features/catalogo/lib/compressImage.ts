const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSION = 2048 // px
const QUALITY_STEPS = [0.92, 0.85, 0.75, 0.65, 0.55]

/**
 * Comprime uma imagem para caber em 5MB, convertendo para WebP.
 * Se a imagem já for menor que 5MB, retorna o original.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_SIZE) return file

  const img = await createImageBitmap(file)
  let { width, height } = img

  // Redimensionar se qualquer dimensão for muito grande
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Tentar converter com qualidade progressiva
  for (const quality of QUALITY_STEPS) {
    const blob = await encodeWebP(img, width, height, quality)
    if (blob.size <= MAX_SIZE) {
      img.close()
      return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
        type: "image/webp",
      })
    }
  }

  // Último recurso: reduzir dimensões progressivamente
  let scale = 0.8
  while (scale > 0.3) {
    const w = Math.round(width * scale)
    const h = Math.round(height * scale)
    const blob = await encodeWebP(img, w, h, 0.65)
    if (blob.size <= MAX_SIZE) {
      img.close()
      return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
        type: "image/webp",
      })
    }
    scale -= 0.1
  }

  img.close()
  throw new Error("Não foi possível comprimir a imagem para 5MB")
}

function encodeWebP(
  img: ImageBitmap,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, width, height)
    canvas.convertToBlob({ type: "image/webp", quality }).then(resolve)
  })
}
