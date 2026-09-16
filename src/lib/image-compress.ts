const MAX_DIMENSION = 1920;
const QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const img = await fileToImage(file);
  const { width, height } = img;

  if (
    width <= MAX_DIMENSION &&
    height <= MAX_DIMENSION &&
    file.size < 500_000
  ) {
    return file;
  }

  const { newWidth, newHeight } = calcDimensions(width, height);

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const ext = file.type === "image/png" ? "image/jpeg" : file.type;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, ext, QUALITY),
  );

  if (!blob || blob.size >= file.size) return file;

  const name = file.name.replace(/\.\w+$/, ext === "image/jpeg" ? ".jpg" : "");
  return new File([blob], name, { type: ext });
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function calcDimensions(w: number, h: number) {
  if (w <= MAX_DIMENSION && h <= MAX_DIMENSION)
    return { newWidth: w, newHeight: h };
  const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
  return { newWidth: Math.round(w * ratio), newHeight: Math.round(h * ratio) };
}
