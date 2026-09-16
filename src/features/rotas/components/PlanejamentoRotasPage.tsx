import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Plus, Route, MapPin, Calendar, Filter } from "lucide-react";
import { useRotas } from "../hooks/useRotas";
import { useContarClientesBase } from "../hooks/useClientesBase";
import { NovaRotaModal } from "./NovaRotaModal";
import {
  ROTA_STATUS_LABEL,
  ROTA_STATUS_COLOR,
  ROTA_TIPO_LABEL,
} from "../types";
import type { RotaStatus } from "../types";
import { formatDate } from "~/lib/utils/format";

export function PlanejamentoRotasPage() {
  const navigate = useNavigate();
  const [filtroStatus, setFiltroStatus] = useState<RotaStatus | "todas">(
    "todas",
  );
  const [showNovaRota, setShowNovaRota] = useState(false);

  const { data: rotas, isLoading } = useRotas(
    filtroStatus !== "todas" ? { status: filtroStatus } : undefined,
  );
  const { data: totalClientes } = useContarClientesBase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rotas de Visitas</h1>
          <p className="text-muted-foreground">
            Planeje e execute suas rotas de visitas
          </p>
        </div>
        <Button onClick={() => setShowNovaRota(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes ?? 0}</div>
            <p className="text-xs text-muted-foreground">na sua base</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rotas Planejadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rotas?.filter((r) => r.status === "planejada").length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rotas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rotas?.filter(
                (r) => r.data_rota === new Date().toISOString().slice(0, 10),
              ).length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">programadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as RotaStatus | "todas")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="planejada">Planejadas</SelectItem>
              <SelectItem value="em_execucao">Em Execução</SelectItem>
              <SelectItem value="realizada">Realizadas</SelectItem>
              <SelectItem value="nao_realizada">Não Realizadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rotas && rotas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rotas.map((rota) => (
            <Card
              key={rota.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() =>
                navigate({ to: "/rotas/$id", params: { id: rota.id } })
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-primary" />
                    <span className="font-medium">{rota.titulo}</span>
                  </div>
                  <Badge className={ROTA_STATUS_COLOR[rota.status]}>
                    {ROTA_STATUS_LABEL[rota.status]}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(rota.data_rota)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{ROTA_TIPO_LABEL[rota.tipo]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Route className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma rota encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              {totalClientes === 0
                ? "Importe sua base de clientes para começar a planejar rotas"
                : "Crie sua primeira rota de visitas"}
            </p>
            <Button onClick={() => setShowNovaRota(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Rota
            </Button>
          </CardContent>
        </Card>
      )}

      <NovaRotaModal open={showNovaRota} onOpenChange={setShowNovaRota} />
    </div>
  );
}
