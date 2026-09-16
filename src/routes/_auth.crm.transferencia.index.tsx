import { createRoute } from "@tanstack/react-router";
import { crmTransferenciaRoute } from "./_auth.crm.transferencia";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { dispararEventoModulo } from "~/core/services/webhooks";
import { EMPRESA_ID } from "~/config/empresa";
export const crmTransferenciaIndexRoute = createRoute({
  getParentRoute: () => crmTransferenciaRoute,
  path: "/",
  component: TransferenciaPage,
});

function TransferenciaPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [origem, setOrigem] = useState<string>("");
  const [destino, setDestino] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const { data: consultores } = useQuery({
    queryKey: ["consultores-transfer"],
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome_completo")
        .eq("role", "consultor")
        .eq("empresa_id", EMPRESA_ID);
      return data ?? [];
    },
  });

  const { data: clientesOrigem } = useQuery({
    queryKey: ["clientes-origem", origem],
    enabled: !!origem,
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("id, nome_doutor, nome_clinica")
        .eq("consultor_atual_id", origem);
      return data ?? [];
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["logs-transfer"],
    queryFn: async () => {
      const { data } = await supabase
        .from("logs_transferencia")
        .select(
          "id, data_transferencia, cliente_id, de_consultor_id, para_consultor_id",
        )
        .eq("empresa_id", EMPRESA_ID)
        .order("data_transferencia", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  async function transferir(clienteId: string) {
    if (!destino || destino === origem) {
      toast.error("Selecione um consultor destino diferente.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("clientes")
      .update({ consultor_atual_id: destino })
      .eq("id", clienteId);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cliente transferido");
    qc.invalidateQueries({ queryKey: ["clientes-origem", origem] });
    qc.invalidateQueries({ queryKey: ["logs-transfer"] });
    dispararEventoModulo("crm", "cliente.transferido", { cliente_id: clienteId, empresa_id: EMPRESA_ID }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Transferência de Carteira</h1>
        <p className="text-sm text-muted-foreground">
          Realoque clientes entre consultores. Cada transferência é registrada
          em log.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Selector
          label="Consultor origem"
          value={origem}
          setValue={setOrigem}
          consultores={consultores ?? []}
        />
        <Selector
          label="Consultor destino"
          value={destino}
          setValue={setDestino}
          consultores={consultores ?? []}
        />
      </div>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Clientes do origem
        </h2>
        <div className="glass rounded-2xl divide-y divide-border">
          {!origem && (
            <p className="p-5 text-sm text-muted-foreground">
              Selecione um consultor origem.
            </p>
          )}
          {origem && !clientesOrigem?.length && (
            <p className="p-5 text-sm text-muted-foreground">
              Sem clientes na carteira.
            </p>
          )}
          {clientesOrigem?.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm">{c.nome_doutor}</p>
                <p className="text-xs text-muted-foreground">
                  {c.nome_clinica ?? "—"}
                </p>
              </div>
              <Button
                size="sm"
                disabled={busy || !destino}
                onClick={() => transferir(c.id)}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="mr-1 h-4 w-4" /> Transferir
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Últimas transferências
        </h2>
        <div className="glass rounded-2xl divide-y divide-border">
          {!logs?.length && (
            <p className="p-5 text-sm text-muted-foreground">
              Nenhuma transferência registrada.
            </p>
          )}
          {logs?.map((l: any) => (
            <div
              key={l.id}
              className="flex items-center justify-between p-4 text-sm"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(l.data_transferencia).toLocaleString("pt-BR")}
              </span>
              <span className="text-xs text-gold">cliente realocado</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Selector({
  label,
  value,
  setValue,
  consultores,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  consultores: any[];
}) {
  return (
    <label className="glass rounded-2xl p-4 block">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm"
      >
        <option value="">— selecione —</option>
        {consultores.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.nome_completo}
          </option>
        ))}
      </select>
    </label>
  );
}
