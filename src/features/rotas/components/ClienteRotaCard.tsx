import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  MapPin,
  Navigation,
  Play,
  CheckCircle2,
  Clock,
  Timer,
  Route,
} from "lucide-react";
import { useRotaAtiva } from "../hooks/useRotaAtiva";
import { useAtualizarRota } from "../hooks/useRotas";
import {
  criarTrajeto,
  atualizarTrajeto,
  criarVisita,
  atualizarVisita,
  calcularDistancia,
} from "../services/trajetos.service";
import {
  abrirGoogleMaps,
  abrirWaze,
  formatDuracao,
  formatDistancia,
} from "../lib/geolocation";
import { ROTA_CLIENTE_STATUS_LABEL, ROTA_CLIENTE_STATUS_COLOR } from "../types";
import type { RotaCliente, RotaStatus } from "../types";
import toast from "react-hot-toast";

type Props = {
  cliente: RotaCliente;
  rotaStatus: RotaStatus;
  raioPermitido: number;
  onFinalizarVisita: () => void;
};

export function ClienteRotaCard({
  cliente,
  rotaStatus,
  raioPermitido,
  onFinalizarVisita,
}: Props) {
  const atualizarRota = useAtualizarRota();
  const {
    posicaoAtual,
    dentroRaio,
    loading: geoLoading,
    iniciarMonitoramento,
  } = useRotaAtiva(raioPermitido);

  const [timer, setTimer] = useState(0);
  const [visitando, setVisitando] = useState(false);

  const clienteData = cliente.cliente;
  const destino =
    clienteData?.latitude && clienteData?.longitude
      ? {
          lat: Number(clienteData.latitude),
          lng: Number(clienteData.longitude),
        }
      : null;

  // Timer para contabilizar tempo de visita
  useEffect(() => {
    if (!visitando) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [visitando]);

  // Monitorar posição quando estiver em trajeto
  useEffect(() => {
    if (cliente.status !== "em_trajeto" || !destino) return;
    const stop = iniciarMonitoramento(destino);
    return stop;
  }, [cliente.status, destino, iniciarMonitoramento]);

  const handleIniciarTrajeto = useCallback(async () => {
    if (!posicaoAtual || !destino) {
      toast.error("Obtendo localização...");
      return;
    }

    try {
      // Criar registro de trajeto
      await criarTrajeto({
        empresa_id: cliente.empresa_id,
        rota_id: cliente.rota_id,
        rota_cliente_id: cliente.id,
        origem_lat: posicaoAtual.lat,
        origem_lng: posicaoAtual.lng,
        destino_lat: destino.lat,
        destino_lng: destino.lng,
        data_inicio: new Date().toISOString(),
        distancia_km: null,
        duracao_minutos: null,
        valor_reembolso: null,
        data_fim: null,
      });

      // Atualizar status do cliente
      await atualizarRota.mutateAsync({
        id: cliente.rota_id,
        updates: {},
      });

      // Abrir Google Maps
      abrirGoogleMaps(posicaoAtual, destino);

      toast.success("Trajeto iniciado! Siga o mapa.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [posicaoAtual, destino, cliente, atualizarRota]);

  const handleIniciarVisita = useCallback(async () => {
    if (!dentroRaio) {
      toast.error(
        "Você precisa estar a menos de 300m do destino para iniciar a visita",
      );
      return;
    }

    try {
      // Registrar localização de início
      await criarVisita({
        empresa_id: cliente.empresa_id,
        rota_id: cliente.rota_id,
        rota_cliente_id: cliente.id,
        cliente_base_id: cliente.cliente_base_id,
        consultor_id: "", // Will be filled by the service
        data_inicio: new Date().toISOString(),
        data_fim: null,
        duracao_minutos: null,
        local_inicio: posicaoAtual,
        local_fim: null,
        dentro_raio: true,
        formulario: {},
      });

      setVisitando(true);
      setTimer(0);

      toast.success("Visita iniciada! Timer rodando.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [dentroRaio, posicaoAtual, cliente]);

  const handleFinalizarVisita = useCallback(() => {
    setVisitando(false);
    onFinalizarVisita();
  }, [onFinalizarVisita]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!clienteData) return null;

  return (
    <Card className={cliente.status === "visitado" ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
              {cliente.ordem}
            </div>
            <div>
              <div className="font-medium">{clienteData.nome}</div>
              <div className="text-sm text-muted-foreground">
                {clienteData.cidade && `${clienteData.cidade} - `}
                {clienteData.estado}
              </div>
              {clienteData.endereco_completo && (
                <div className="text-xs text-muted-foreground mt-1">
                  {clienteData.endereco_completo}
                </div>
              )}
            </div>
          </div>

          <Badge className={ROTA_CLIENTE_STATUS_COLOR[cliente.status]}>
            {ROTA_CLIENTE_STATUS_LABEL[cliente.status]}
          </Badge>
        </div>

        {/* Ações baseadas no status */}
        <div className="mt-4 flex flex-wrap gap-2">
          {rotaStatus === "em_execucao" && cliente.status === "pendente" && (
            <Button size="sm" onClick={handleIniciarTrajeto}>
              <Navigation className="h-4 w-4 mr-1" />
              Iniciar Trajeto
            </Button>
          )}

          {rotaStatus === "em_execucao" && cliente.status === "em_trajeto" && (
            <>
              <Button
                size="sm"
                onClick={handleIniciarVisita}
                disabled={!dentroRaio || geoLoading}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {dentroRaio ? "Iniciar Visita" : "Aproxime-se do destino"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (posicaoAtual && destino)
                    abrirGoogleMaps(posicaoAtual, destino);
                }}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Abrir Maps
              </Button>
            </>
          )}

          {rotaStatus === "em_execucao" && cliente.status === "em_visita" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-mono font-bold">
                  {formatTimer(timer)}
                </span>
              </div>
              <Button size="sm" onClick={handleFinalizarVisita}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Finalizar Visita
              </Button>
            </div>
          )}

          {cliente.status === "visitado" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Visita realizada</span>
            </div>
          )}
        </div>

        {/* Info de trajeto */}
        {cliente.trajeto && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Route className="h-3 w-3" />
              {formatDistancia(cliente.trajeto.distancia_km ?? 0)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuracao(cliente.trajeto.duracao_minutos ?? 0)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
