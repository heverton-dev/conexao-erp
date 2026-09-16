import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { Building2, ArrowRight, Users } from "lucide-react";
import { formatBRL } from "~/features/crm/lib/comercial";
import { RequirePermission } from "~/components/guards";

export const crmDiretoriaIndexRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/diretoria/",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_diretoria"]}>
      <DiretoriaIndex />
    </RequirePermission>
  ),
});

function DiretoriaIndex() {
  const { data } = useQuery({
    queryKey: ["diretoria-gestores"],
    queryFn: async () => {
      const { data: gestores } = await supabase
        .from("usuarios")
        .select("id, nome_completo, email_corporativo")
        .eq("role", "gestor")
        .order("nome_completo");
      const ids = (gestores ?? []).map((g: any) => g.id);
      const { data: consultores } = await supabase
        .from("usuarios")
        .select("id, gestor_id")
        .in(
          "gestor_id",
          ids.length ? ids : ["00000000-0000-0000-0000-000000000000"],
        );
      const consultorIds = (consultores ?? []).map((c: any) => c.id);
      const { data: visitas } = await supabase
        .from("visitas")
        .select("consultor_executor_id, valor_estimado, gerou_pedido")
        .in(
          "consultor_executor_id",
          consultorIds.length
            ? consultorIds
            : ["00000000-0000-0000-0000-000000000000"],
        );
      return (gestores ?? []).map((g: any) => {
        const meus = (consultores ?? [])
          .filter((c: any) => c.gestor_id === g.id)
          .map((c: any) => c.id);
        const vs = (visitas ?? []).filter((v: any) =>
          meus.includes(v.consultor_executor_id),
        );
        const pipeline = vs.reduce(
          (s: number, v: any) => s + (Number(v.valor_estimado) || 0),
          0,
        );
        const fechados = vs.filter((v: any) => v.gerou_pedido).length;
        const conv = vs.length ? Math.round((fechados / vs.length) * 100) : 0;
        return {
          ...g,
          consultores: meus.length,
          visitas: vs.length,
          pipeline,
          conv,
        };
      });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Diretoria</h1>
        <p className="text-sm text-muted-foreground">
          Equipes nacionais. Clique em um gestor para abrir o BI agregado e
          drilldown por consultor.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((g: any) => (
          <Link
            key={g.id}
            to="/crm/diretoria/gestor/$id"
            params={{ id: g.id }}
            className="group glass rounded-2xl p-5 space-y-3 hover:border-primary/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl glass-gold text-gold">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{g.nome_completo}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {g.email_corporativo}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold group-hover:translate-x-0.5" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
              <div>
                <p className="text-lg font-bold">{g.consultores}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Consultores
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">{g.visitas}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Visitas
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gold">{g.conv}%</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Conv.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> Pipeline
              </span>
              <span className="font-bold text-gold">
                {formatBRL(g.pipeline)}
              </span>
            </div>
          </Link>
        ))}
        {!data?.length && (
          <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">
            Nenhum gestor vinculado a você.
          </p>
        )}
      </div>
    </div>
  );
}
