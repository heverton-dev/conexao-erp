import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { TarefasList } from "~/features/crm/components/TarefasList";
import { NovaTarefaModal } from "~/features/crm/components/NovaTarefaModal";
import { BuscaGlobal } from "~/features/crm/components/BuscaGlobal";
import { Button } from "~/components/ui/button";
import { Plus, Search } from "lucide-react";
import { RequirePermission } from "~/components/guards";

export const crmTarefasRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/tarefas",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_tarefas"]}>
      <TarefasPage />
    </RequirePermission>
  ),
});

function TarefasPage() {
  const { profile } = useAuth();
  const [novaTarefaAberta, setNovaTarefaAberta] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas tarefas e follow-ups
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
          <Button size="sm" onClick={() => setNovaTarefaAberta(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </header>

      {/* Lista de Tarefas */}
      <TarefasList
        onNovaTarefa={() => setNovaTarefaAberta(true)}
        onTarefaClick={(tarefa) => {
          // TODO: Abrir modal de detalhes da tarefa
          console.log("Tarefa clicada:", tarefa);
        }}
      />

      {/* Modais */}
      <NovaTarefaModal
        open={novaTarefaAberta}
        onOpenChange={setNovaTarefaAberta}
      />

      {/* Busca Global */}
      <BuscaGlobal
        aberto={buscaAberta}
        onFechar={() => setBuscaAberta(false)}
      />
    </div>
  );
}
