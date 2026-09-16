import type { SeoAuditoriaResultado } from "../types";

export async function auditarUrl(url: string): Promise<SeoAuditoriaResultado> {
  const response = await fetch(url);
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const titulo = doc.querySelector("title")?.textContent || null;
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute("content") || null;
  const h1s = Array.from(doc.querySelectorAll("h1")).map((el) => el.textContent || "");
  const h2s = Array.from(doc.querySelectorAll("h2")).map((el) => el.textContent || "");
  const images = Array.from(doc.querySelectorAll("img"));
  const imgsSemAlt = images.filter((img) => !img.getAttribute("alt")).length;

  const issues: SeoAuditoriaResultado["issues"] = [];

  if (!titulo) issues.push({ tipo: "erro", mensagem: "Pagina sem titulo", tag: "title" });
  if (!metaDescription) issues.push({ tipo: "erro", mensagem: "Meta description ausente", tag: "meta:description" });
  if (h1s.length === 0) issues.push({ tipo: "erro", mensagem: "Nenhum H1 encontrado", tag: "h1" });
  if (h1s.length > 1) issues.push({ tipo: "aviso", mensagem: "Multiplos H1 encontrados", tag: "h1" });
  if (imgsSemAlt > 0) issues.push({ tipo: "aviso", mensagem: `${imgsSemAlt} imagens sem alt`, tag: "img" });

  const score = Math.max(0, 100 - issues.filter((i) => i.tipo === "erro").length * 20 - issues.filter((i) => i.tipo === "aviso").length * 10);

  return {
    url,
    titulo,
    meta_description: metaDescription,
    h1: h1s,
    h2: h2s,
    imagens_sem_alt: imgsSemAlt,
    links_quebrados: 0,
    issues,
    score,
  };
}
