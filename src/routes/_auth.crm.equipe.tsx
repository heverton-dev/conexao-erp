import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { formatBRL } from "~/features/crm/lib/comercial";
import {
  Users,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Target,
  Check,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { RequirePermission } from "~/components/guards";

export const crmEquipeRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/equipe",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_equipe"]}>
      <EquipePage />
    </RequirePermission>
  ),
});

function EquipePage() {
  const { user, profile } = useAuth();
  const isDev = profile?.is_super_admin === true;
  const { data: usuarioAtual } = useQuery({
    queryKey: ["usuario-atual-crm", user?.id],
    enabled: !!user?.id && !isDev,
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const isGestor = usuarioAtual?.role === "gestor";
  const isDiretor = usuarioAtual?.role === "diretor_comercial";
  const canEditMeta = isGestor || isDiretor || isDev;

  const { data } = useQuery({
    queryKey: ["equipe", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: consultores } = await supabase
        .from("usuarios")
        .select(
          "id, nome_completo, email_corporativo, ativo, role, meta_diaria_visitas",
        )
        .eq("role", "consultor");

      const ids = (consultores ?? []).map((c: any) => c.id);
      const { data: clientes } = await supabase
        .from("clientes")
        .select("id, consultor_atual_id")
        .in(
          "consultor_atual_id",
          ids.length ? ids : ["00000000-0000-0000-0000-000000000000"],
        );
      const { data: visitas } = await supabase
        .from("visitas")
        .select(
          "id, consultor_executor_id, valor_estimado, gerou_pedido, temperatura_vendedor",
        )
        .in(
          "consultor_executor_id",
          ids.length ? ids : ["00000000-0000-0000-0000-000000000000"],
        );

      return (consultores ?? []).map((c: any) => {
        const cs = (clientes ?? []).filter(
          (x: any) => x.consultor_atual_id === c.id,
        );
        const vs = (visitas ?? []).filter(
          (x: any) => x.consultor_executor_id === c.id,
        );
        const pipeline = vs.reduce(
          (sum: number, v: any) => sum + (Number(v.valor_estimado) || 0),
          0,
        );
        const fechados = vs.filter((v: any) => v.gerou_pedido).length;
        const quentes = vs.filter(
          (v: any) => v.temperatura_vendedor === "Quente",
        ).length;
        return {
          ...c,
          totalClientes: cs.length,
          totalVisitas: vs.length,
          pipeline,
          fechados,
          quentes,
        };
      });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Performance dos consultores e visão agregada da carteira da equipe.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((c: any) => (
          <div
            key={c.id}
            className="group glass rounded-2xl p-5 space-y-3 hover:border-primary/40 transition"
          >
            <Link
              to="/crm/bi"
              search={{ vendedor: c.id }}
              className="block space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl glass-gold text-gold">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{c.nome_completo}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.email_corporativo}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold group-hover:translate-x-0.5" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                <Stat label="Clientes" value={c.totalClientes} />
                <Stat label="Visitas" value={c.totalVisitas} />
                <Stat label="Quentes" value={c.quentes} accent />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Pipeline
                </span>
                <span className="text-sm font-bold text-gold">
                  {formatBRL(c.pipeline)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pedidos fechados</span>
                <span className="font-medium">{c.fechados}</span>
              </div>
            </Link>
            <MetaEditor
              userId={c.id}
              metaAtual={c.meta_diaria_visitas ?? 0}
              canEdit={canEditMeta}
            />
            <Link
              to="/crm/bi"
              search={{ vendedor: c.id }}
              className="pt-2 border-t border-border flex items-center justify-center gap-2 text-xs text-gold font-medium"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Ver BI individual
            </Link>
          </div>
        ))}
        {!data?.length && (
          <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">
            Nenhum consultor visível para você.
          </p>
        )}
      </div>
    </div>
  );
}

function MetaEditor({
  userId,
  metaAtual,
  canEdit,
}: {
  userId: string;
  metaAtual: number;
  canEdit: boolean;
}) {
  const qc = useQueryClient();
  const [valor, setValor] = useState<string>(String(metaAtual));
  const [editing, setEditing] = useState(false);

  const mutation = useMutation({
    mutationFn: async (meta: number) => {
      const { error } = await supabase.rpc("set_meta_diaria_visitas", {
        _user_id: userId,
        _meta: meta,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Meta diária atualizada");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["equipe"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar meta"),
  });

  return (
    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
        <Target className="h-3 w-3" /> Meta diária
      </span>
      {canEdit && editing ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={1000}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-16 rounded-md bg-background border border-border px-2 py-1 text-sm text-right"
          />
          <button
            onClick={() =>
              mutation.mutate(
                Math.max(0, Math.min(1000, parseInt(valor || "0", 10) || 0)),
              )
            }
            disabled={mutation.isPending}
            className="rounded-md glass-gold text-gold p-1.5 hover:opacity-80"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => canEdit && setEditing(true)}
          disabled={!canEdit}
          className={`text-sm font-bold ${canEdit ? "text-gold hover:underline" : "text-foreground"}`}
        >
          {metaAtual} {metaAtual === 1 ? "visita" : "visitas"}
        </button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${accent ? "text-gold" : ""}`}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
