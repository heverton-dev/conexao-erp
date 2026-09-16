import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";
import { ImportClientesTrigger } from "~/features/cadastros/import";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users } from "lucide-react";

export const empresaClientesImportRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/clientes-import",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <ClientesImportPage />
    </RequirePermission>
  ),
});

function ClientesImportPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Importar Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Importe uma lista de clientes a partir de um arquivo CSV.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Importacao em Lote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Baixe o template CSV, preencha com os dados dos clientes e importe.
            A coluna "Nome" e obrigatoria. As demais sao opcionais.
          </p>
          <ImportClientesTrigger />
        </CardContent>
      </Card>
    </div>
  );
}
