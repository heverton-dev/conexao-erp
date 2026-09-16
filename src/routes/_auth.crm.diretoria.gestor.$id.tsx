import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { ArrowRight, BarChart3 } from "lucide-react";
import { RequirePermission } from "~/components/guards";

export const crmDiretoriaGestorRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/diretoria/gestor/$id",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_diretoria"]}>
      <DiretoriaGestor />
    </RequirePermission>
  ),
});

function DiretoriaGestor() {
  const { id } = crmDiretoriaGestorRoute.useParams();

  const { data } = useQuery({
    queryKey: ["diretoria-gestor", id],
    queryFn: async () => {
      const { data: gestor } = await supabase
        .from("usuarios")
        .select("id, nome_completo, email_corporativo")
        .eq("id", id)
        .maybeSingle();
      const { data: consultores } = await supabase
        .from("usuarios")
        .select("id, nome_completo, email_corporativo, ativo")
        .eq("gestor_id", id);
      return { gestor, consultores: consultores ?? [] };
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-gold">
          Diretoria · Gestor
        </p>
        <h1 className="text-2xl font-bold mt-1">
          {data?.gestor?.nome_completo ?? "—"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {data?.gestor?.email_corporativo}
        </p>
      </header>

      <Link
        to="/crm/bi"
        search={{ vendedor: id }}
        className="glass rounded-2xl p-4 flex items-center justify-between hover:border-primary/40 transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-gold">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">BI da equipe</p>
            <p className="text-xs text-muted-foreground">
              Visão consolidada com filtros
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Consultores
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data?.consultores.map((c: any) => (
            <Link
              key={c.id}
              to="/crm/bi"
              search={{ vendedor: c.id }}
              className="group glass rounded-2xl p-4 flex items-center justify-between hover:border-primary/40 transition"
            >
              <div>
                <p className="font-semibold text-sm">{c.nome_completo}</p>
                <p className="text-xs text-muted-foreground">
                  {c.email_corporativo}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition" />
            </Link>
          ))}
          {!data?.consultores.length && (
            <p className="glass rounded-2xl p-5 text-sm text-muted-foreground">
              Sem consultores nesta equipe.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
