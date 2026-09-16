export interface GeoPosition {
  lat: number;
  lng: number;
}

export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada pelo navegador"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Permissão de geolocalização negada"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Localização indisponível"));
            break;
          case error.TIMEOUT:
            reject(new Error("Timeout ao obter localização"));
            break;
          default:
            reject(new Error("Erro ao obter localização"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}

export function watchPosition(
  callback: (position: GeoPosition) => void,
): () => void {
  if (!navigator.geolocation) {
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    () => {},
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    },
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

export function calcularDistanciaHaversine(
  p1: GeoPosition,
  p2: GeoPosition,
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estaDentroRaio(
  posicaoAtual: GeoPosition,
  destino: GeoPosition,
  raioMetros: number = 300,
): boolean {
  const distanciaKm = calcularDistanciaHaversine(posicaoAtual, destino);
  const distanciaMetros = distanciaKm * 1000;
  return distanciaMetros <= raioMetros;
}

export function abrirGoogleMaps(
  origem: GeoPosition,
  destino: GeoPosition,
): void {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origem.lat},${origem.lng}&destination=${destino.lat},${destino.lng}&travelmode=driving`;
  window.open(url, "_blank");
}

export function abrirWaze(destino: GeoPosition): void {
  const url = `https://www.waze.com/ul?ll=${destino.lat},${destino.lng}&navigate=yes`;
  window.open(url, "_blank");
}

export function formatDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos}min`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
}

export function formatDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}
