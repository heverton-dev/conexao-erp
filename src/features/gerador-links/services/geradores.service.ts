export function gerarWhatsApp(telefone: string, mensagem?: string): string {
  const digits = telefone.replace(/\D/g, "");
  if (!mensagem) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(mensagem)}`;
}

export function gerarUtm(params: {
  url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
}): string {
  const base = params.url.replace(/[?&]+$/, "");
  const separator = base.includes("?") ? "&" : "?";
  const parts = [
    `utm_source=${encodeURIComponent(params.utm_source)}`,
    `utm_medium=${encodeURIComponent(params.utm_medium)}`,
    `utm_campaign=${encodeURIComponent(params.utm_campaign)}`,
  ];
  if (params.utm_term) parts.push(`utm_term=${encodeURIComponent(params.utm_term)}`);
  if (params.utm_content) parts.push(`utm_content=${encodeURIComponent(params.utm_content)}`);
  return `${base}${separator}${parts.join("&")}`;
}

export function gerarGoogleReview(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

export function gerarGoogleMaps(lat: string, lng: string, nome?: string): string {
  const label = nome ? `&destination_place_id=${encodeURIComponent(nome)}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${label}`;
}

export function gerarWaze(lat: string, lng: string): string {
  return `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}
