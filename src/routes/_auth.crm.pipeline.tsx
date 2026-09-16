import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { KanbanAvancado } from "~/features/crm/components/KanbanAvancado";
import { NovaVisitaModal } from "~/features/crm/components/NovaVisitaModal";
import { ClientePickerModal } from "~/components/shared/ClientePickerModal";
import { BuscaGlobal } from "~/features/crm/components/BuscaGlobal";
import { Button } from "~/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { RequirePermission } from "~/components/guards";

export const crmPipelineRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/pipeline",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_pipeline"]}>
      <PipelinePage />
    </RequirePermission>
  ),
});

function PipelinePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(
    null,
  );
  const [buscaAberta, setBuscaAberta] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus clientes por estágio do funil
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBuscaAberta(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <KanbanAvancado
        onNovoCliente={() => setPickerOpen(true)}
        onClienteClick={(id) => navigate({ to: `/crm/cliente/${id}` })}
      />

      {/* Modais */}
      <ClientePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        consultorId={profile?.id ?? ""}
        onSelect={(id) => {
          setPickerOpen(false);
          setClienteSelecionado(id);
        }}
      />

      {clienteSelecionado && (
        <NovaVisitaModal
          clienteId={clienteSelecionado}
          open={!!clienteSelecionado}
          onOpenChange={(v) => !v && setClienteSelecionado(null)}
        />
      )}

      {/* Busca Global */}
      <BuscaGlobal
        aberto={buscaAberta}
        onFechar={() => setBuscaAberta(false)}
      />
    </div>
  );
}
