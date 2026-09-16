import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { MetricasAvancadas } from "~/features/crm/components/MetricasAvancadas";
import { BuscaGlobal } from "~/features/crm/components/BuscaGlobal";
import { Button } from "~/components/ui/button";
import { Search, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RequirePermission } from "~/components/guards";

export const crmMetricasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/metricas",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_metricas"]}>
      <MetricasPage />
    </RequirePermission>
  ),
});

function MetricasPage() {
  const { profile } = useAuth();
  const [periodo, setPeriodo] = useState<"semana" | "mes" | "trimestre">("mes");
  const [buscaAberta, setBuscaAberta] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Métricas Avançadas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe sua performance e indicadores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última Semana</SelectItem>
              <SelectItem value="mes">Último Mês</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBuscaAberta(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </header>

      {/* Métricas */}
      <MetricasAvancadas periodo={periodo} />

      {/* Busca Global */}
      <BuscaGlobal
        aberto={buscaAberta}
        onFechar={() => setBuscaAberta(false)}
      />
    </div>
  );
}
