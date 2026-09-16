import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useState } from "react";
import { ArrowLeft, Plus, Phone } from "lucide-react";
import { Button } from "~/components/ui/button";
import { NovaVisitaModal } from "~/features/crm/components/NovaVisitaModal";
import { VisitaDetalheModal } from "~/features/crm/components/VisitaDetalheModal";
import { formatBRL, formatDate } from "~/features/crm/lib/comercial";
import { RequirePermission } from "~/components/guards";

export const crmClienteDetailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/cliente/$id",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_cliente_detalhe"]}>
      <ClientePage />
    </RequirePermission>
  ),
});

function ClientePage() {
  const { id } = crmClienteDetailRoute.useParams();
  const [open, setOpen] = useState(false);
  const [visitaSelecionada, setVisitaSelecionada] = useState<any | null>(null);

  const { data: cliente } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("*, usuarios:consultor_atual_id(nome_completo)")
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: visitas } = useQuery({
    queryKey: ["visitas", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("visitas")
        .select("*, executor:consultor_executor_id(nome_completo)")
        .eq("cliente_id", id)
        .order("data_visita", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <Link
        to="/crm/carteira"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para a carteira
      </Link>

      <header className="glass rounded-2xl p-5">
        <h1 className="text-2xl font-bold">{cliente?.nome_doutor}</h1>
        {cliente?.nome_clinica && (
          <p className="text-sm text-muted-foreground">
            {cliente.nome_clinica}
          </p>
        )}
        {cliente?.telefone_contato && (
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-gold">
            <Phone className="h-3 w-3" /> {cliente.telefone_contato}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Consultor atual: {(cliente as any)?.usuarios?.nome_completo ?? "—"}
        </p>
        <Button className="mt-4 w-full md:w-auto" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Nova visita
        </Button>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Histórico de visitas
        </h2>
        {(!visitas || visitas.length === 0) && (
          <p className="glass rounded-2xl p-5 text-sm text-muted-foreground">
            Nenhuma visita registrada ainda.
          </p>
        )}
        <ol className="relative space-y-4 border-l border-border pl-6 ml-2">
          {visitas?.map((v: any) => (
            <li key={v.id} className="relative">
              <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <button
                type="button"
                onClick={() => setVisitaSelecionada(v)}
                className="block w-full text-left glass rounded-xl p-4 transition-colors hover:border-primary/40 hover:bg-card/60 cursor-pointer"
              >
                <header className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatDate(v.data_visita)}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.tipo_visita} · por {v.executor?.nome_completo ?? "—"}
                    </p>
                  </div>
                  <TempBadge t={v.temperatura_vendedor} />
                </header>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <span>
                    Atendente: <strong>{v.atendente}</strong>
                  </span>
                  <span>
                    Valor:{" "}
                    <strong className="text-gold">
                      {formatBRL(v.valor_estimado)}
                    </strong>
                  </span>
                  <span>Orçamento: {v.gerou_orcamento ? "Sim" : "Não"}</span>
                  <span>Pedido: {v.gerou_pedido ? "Sim" : "Não"}</span>
                </div>
                {v.feedback_cliente && (
                  <p className="mt-2 text-xs">
                    <span className="text-muted-foreground">Feedback:</span>{" "}
                    {v.feedback_cliente}
                  </p>
                )}
                {v.observacoes_vendedor && (
                  <p className="mt-1 text-xs">
                    <span className="text-muted-foreground">Obs:</span>{" "}
                    {v.observacoes_vendedor}
                  </p>
                )}
                {v.data_proximo_contato && (
                  <p className="mt-2 text-xs text-gold">
                    Próximo contato: {formatDate(v.data_proximo_contato)} ·{" "}
                    {v.acao_prevista}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <NovaVisitaModal clienteId={id} open={open} onOpenChange={setOpen} />
      <VisitaDetalheModal
        visita={visitaSelecionada}
        open={!!visitaSelecionada}
        onOpenChange={(v) => !v && setVisitaSelecionada(null)}
      />
    </div>
  );
}

function TempBadge({ t }: { t: string }) {
  const map: Record<string, string> = {
    Frio: "text-[var(--color-frio)] border-[var(--color-frio)]",
    Morno: "text-[var(--color-morno)] border-[var(--color-morno)]",
    Quente: "text-[var(--color-quente)] border-[var(--color-quente)]",
  };
  return (
    <span
      className={`text-xs uppercase font-bold px-2 py-1 rounded-full border ${map[t] ?? ""}`}
    >
      {t}
    </span>
  );
}
