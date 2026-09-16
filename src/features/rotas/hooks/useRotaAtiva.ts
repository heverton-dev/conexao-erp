import { useState, useEffect, useCallback } from "react";
import {
  getCurrentPosition,
  watchPosition,
  estaDentroRaio,
} from "../lib/geolocation";
import type { GeoPosition } from "../lib/geolocation";

export function useRotaAtiva(raioPermitido: number = 300) {
  const [posicaoAtual, setPosicaoAtual] = useState<GeoPosition | null>(null);
  const [dentroRaio, setDentroRaio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verificarPosicao = useCallback(
    async (destino: GeoPosition) => {
      try {
        const posicao = await getCurrentPosition();
        setPosicaoAtual(posicao);
        setDentroRaio(estaDentroRaio(posicao, destino, raioPermitido));
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setDentroRaio(false);
      } finally {
        setLoading(false);
      }
    },
    [raioPermitido],
  );

  const iniciarMonitoramento = useCallback(
    (destino: GeoPosition) => {
      setLoading(true);
      verificarPosicao(destino);

      const stopWatching = watchPosition((posicao) => {
        setPosicaoAtual(posicao);
        setDentroRaio(estaDentroRaio(posicao, destino, raioPermitido));
      });

      return () => {
        stopWatching();
      };
    },
    [verificarPosicao, raioPermitido],
  );

  return {
    posicaoAtual,
    dentroRaio,
    loading,
    error,
    verificarPosicao,
    iniciarMonitoramento,
  };
}
