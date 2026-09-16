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
export const crmTransferenciaConsultoresRoute = createRoute({
  getParentRoute: () => crmTransferenciaRoute,
  path: "consultores",
  component: TransferConsultoresPage,
});

function TransferConsultoresPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [origem, setOrigem] = useState<string>("");
  const [destino, setDestino] = useState<string>("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: gestores } = useQuery({
    queryKey: ["transf-gestores"],
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome_completo")
        .eq("role", "gestor")
        .eq("empresa_id", EMPRESA_ID)
        .order("nome_completo");
      return data ?? [];
    },
  });

  const { data: consultoresOrigem } = useQuery({
    queryKey: ["transf-consultores-origem", origem],
    enabled: !!origem,
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome_completo, email_corporativo")
        .eq("role", "consultor")
        .eq("gestor_id", origem)
        .eq("empresa_id", EMPRESA_ID)
        .order("nome_completo");
      return data ?? [];
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["logs-transfer-consultor"],
    queryFn: async () => {
      const { data } = await supabase
        .from("logs_transferencia_consultor")
        .select(
          "id, data_transferencia, consultor_id, de_gestor_id, para_gestor_id",
        )
        .eq("empresa_id", EMPRESA_ID)
        .order("data_transferencia", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  async function transferir(consultorId: string) {
    if (!destino || destino === origem) {
      toast.error("Selecione um gestor destino diferente.");
      return;
    }
    setBusy(consultorId);
    const { error } = await supabase
      .from("usuarios")
      .update({ gestor_id: destino })
      .eq("id", consultorId);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Consultor transferido");
    qc.invalidateQueries({ queryKey: ["transf-consultores-origem", origem] });
    qc.invalidateQueries({ queryKey: ["logs-transfer-consultor"] });
    dispararEventoModulo("crm", "consultor.transferido", { consultor_id: consultorId, empresa_id: EMPRESA_ID }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Transferência de Consultores</h1>
        <p className="text-sm text-muted-foreground">
          Realoque consultores entre gestores. Cada transferência é registrada
          em log.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Selector
          label="Gestor origem"
          value={origem}
          setValue={setOrigem}
          gestores={gestores ?? []}
        />
        <Selector
          label="Gestor destino"
          value={destino}
          setValue={setDestino}
          gestores={gestores ?? []}
        />
      </div>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Consultores do origem
        </h2>
        <div className="glass rounded-2xl divide-y divide-border">
          {!origem && (
            <p className="p-5 text-sm text-muted-foreground">
              Selecione um gestor origem.
            </p>
          )}
          {origem && !consultoresOrigem?.length && (
            <p className="p-5 text-sm text-muted-foreground">
              Sem consultores nesta equipe.
            </p>
          )}
          {consultoresOrigem?.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm">{c.nome_completo}</p>
                <p className="text-xs text-muted-foreground">
                  {c.email_corporativo ?? "—"}
                </p>
              </div>
              <Button
                size="sm"
                disabled={busy === c.id || !destino}
                onClick={() => transferir(c.id)}
              >
                {busy === c.id ? (
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
              <span className="text-xs text-gold">consultor realocado</span>
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
  gestores,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  gestores: any[];
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
        {gestores.map((g: any) => (
          <option key={g.id} value={g.id}>
            {g.nome_completo}
          </option>
        ))}
      </select>
    </label>
  );
}
