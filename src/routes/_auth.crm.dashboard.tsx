import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState } from "react";
import { useAuth } from "~/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { Button } from "~/components/ui/button";
import { ClientePickerModal } from "~/components/shared/ClientePickerModal";
import { NovaVisitaModal } from "~/features/crm/components/NovaVisitaModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Briefcase,
  TrendingUp,
  Calendar,
  Users,
  ArrowLeftRight,
  BarChart3,
  ShieldCheck,
  Settings,
  UserPlus,
  ArrowRight,
  Building2,
  UserCog,
  Plus,
  Globe,
} from "lucide-react";
import { RequirePermission } from "~/components/guards";

export const crmDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/dashboard",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_dashboard"]}>
      <Dashboard />
    </RequirePermission>
  ),
});

function Dashboard() {
  const { user, profile } = useAuth();
  const isSuperAdmin = profile?.is_super_admin === true;
  const { data: usuarioAtual } = useQuery({
    queryKey: ["usuario-atual-crm", user?.id],
    enabled: !!user?.id && !isSuperAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const role = usuarioAtual?.role as
    | "consultor"
    | "gestor"
    | "diretor_comercial"
    | undefined;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(
    null,
  );
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("todas");

  const { data: empresas } = useQuery({
    queryKey: ["empresas-crm-list"],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("empresas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      return data ?? [];
    },
  });

  // Painel efetivo: super admin vê DevPanel, demais veem por role
  const painelEfetivo = isSuperAdmin ? "dev" : role;

  const subtitle =
    painelEfetivo === "dev"
      ? "Visão global: métricas, usuários e convites de todas as empresas."
      : painelEfetivo === "diretor_comercial"
        ? "Visão nacional: gestores, consultores e BI agregado."
        : painelEfetivo === "gestor"
          ? "Acompanhe a performance da sua equipe e a carteira agregada."
          : "Sua carteira de clientes e visitas em campo.";

  const tag =
    painelEfetivo === "dev"
      ? "Painel Super Admin"
      : painelEfetivo === "diretor_comercial"
        ? "Painel Diretor Comercial"
        : painelEfetivo === "gestor"
          ? "Painel Gestor"
          : "Painel Consultor";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{tag}</p>
          <h1 className="text-2xl font-bold mt-1">
            Olá, {profile?.nome?.split(" ")[0] ?? "—"}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && empresas && empresas.length > 0 && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={empresaFiltro} onValueChange={setEmpresaFiltro}>
                <SelectTrigger className="w-[220px] h-9">
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as empresas</SelectItem>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {painelEfetivo === "consultor" && (
            <Button
              onClick={() => setPickerOpen(true)}
              className="h-11 px-5 gap-2 shadow-[0_8px_24px_-8px_oklch(0.745_0.115_80/0.5)]"
            >
              <Plus className="h-4 w-4" />
              Nova visita
            </Button>
          )}
        </div>
      </header>

      {painelEfetivo === "consultor" && <ConsultorPanel uid={user!.id} />}
      {painelEfetivo === "gestor" && <GestorPanel />}
      {painelEfetivo === "diretor_comercial" && <DiretorPanel />}
      {painelEfetivo === "dev" && (
        <DevPanel
          empresaId={empresaFiltro === "todas" ? undefined : empresaFiltro}
        />
      )}

      {painelEfetivo === "consultor" && user && (
        <>
          <ClientePickerModal
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            consultorId={user.id}
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
        </>
      )}
    </div>
  );
}

function ConsultorPanel({ uid }: { uid: string }) {
  const { data: stats } = useQuery({
    queryKey: ["dash-consultor", uid],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [vis, cli, prox] = await Promise.all([
        supabase
          .from("visitas")
          .select("id", { count: "exact", head: true })
          .eq("data_visita", today)
          .eq("consultor_executor_id", uid),
        supabase
          .from("clientes")
          .select("id", { count: "exact", head: true })
          .eq("consultor_atual_id", uid),
        supabase
          .from("visitas")
          .select(
            "id, data_proximo_contato, acao_prevista, cliente_id, clientes(nome_doutor)",
          )
          .gte("data_proximo_contato", today)
          .eq("consultor_executor_id", uid)
          .order("data_proximo_contato", { ascending: true })
          .limit(5),
      ]);
      return {
        visitasHoje: vis.count ?? 0,
        totalClientes: cli.count ?? 0,
        followups: prox.data ?? [],
      };
    },
  });

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard
          icon={Calendar}
          label="Visitas hoje"
          value={stats?.visitasHoje ?? "—"}
        />
        <KpiCard
          icon={Briefcase}
          label="Meus clientes"
          value={stats?.totalClientes ?? "—"}
        />
        <KpiCard
          icon={TrendingUp}
          label="Meta diária"
          value="3"
          hint="visitas"
        />
      </section>

      <QuickAction
        to="/crm/carteira"
        icon={Briefcase}
        title="Abrir minha Carteira"
        subtitle="Kanban por temperatura, registrar nova visita"
      />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Próximos follow-ups
        </h2>
        <div className="glass rounded-2xl divide-y divide-border">
          {!stats?.followups?.length && (
            <p className="p-5 text-sm text-muted-foreground">
              Nenhum follow-up agendado.
            </p>
          )}
          {stats?.followups?.map((f: any) => (
            <Link
              key={f.id}
              to="/crm/cliente/$id"
              params={{ id: f.cliente_id }}
              className="flex items-center justify-between p-4 hover:bg-secondary/30 transition"
            >
              <div>
                <p className="font-medium text-sm">{f.clientes?.nome_doutor}</p>
                <p className="text-xs text-muted-foreground">
                  {f.acao_prevista}
                </p>
              </div>
              <span className="text-xs text-gold font-medium">
                {new Date(f.data_proximo_contato).toLocaleDateString("pt-BR")}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function GestorPanel() {
  const { data } = useQuery({
    queryKey: ["dash-gestor"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [vis, cli, consultores] = await Promise.all([
        supabase
          .from("visitas")
          .select("id", { count: "exact", head: true })
          .eq("data_visita", today),
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase
          .from("usuarios")
          .select("id", { count: "exact", head: true })
          .eq("role", "consultor"),
      ]);
      return {
        visitasHoje: vis.count ?? 0,
        totalClientes: cli.count ?? 0,
        consultores: consultores.count ?? 0,
      };
    },
  });

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard
          icon={Users}
          label="Consultores"
          value={data?.consultores ?? "—"}
        />
        <KpiCard
          icon={Briefcase}
          label="Carteira total"
          value={data?.totalClientes ?? "—"}
        />
        <KpiCard
          icon={Calendar}
          label="Visitas hoje"
          value={data?.visitasHoje ?? "—"}
        />
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <QuickAction
          to="/crm/equipe"
          icon={Users}
          title="Equipe"
          subtitle="Performance por consultor"
        />
        <QuickAction
          to="/crm/transferencia"
          icon={ArrowLeftRight}
          title="Transferir clientes"
          subtitle="Reatribuir carteira"
        />
        <QuickAction
          to="/crm/bi"
          icon={BarChart3}
          title="BI da equipe"
          subtitle="Pipeline e conversão"
        />
      </div>
    </>
  );
}

function DiretorPanel() {
  const { data } = useQuery({
    queryKey: ["dash-diretor"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [gestores, consultores, vis, cli] = await Promise.all([
        supabase
          .from("usuarios")
          .select("id", { count: "exact", head: true })
          .eq("role", "gestor"),
        supabase
          .from("usuarios")
          .select("id", { count: "exact", head: true })
          .eq("role", "consultor"),
        supabase
          .from("visitas")
          .select("id", { count: "exact", head: true })
          .eq("data_visita", today),
        supabase.from("clientes").select("id", { count: "exact", head: true }),
      ]);
      return {
        gestores: gestores.count ?? 0,
        consultores: consultores.count ?? 0,
        visitasHoje: vis.count ?? 0,
        carteira: cli.count ?? 0,
      };
    },
  });

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Building2}
          label="Gestores"
          value={data?.gestores ?? "—"}
        />
        <KpiCard
          icon={Users}
          label="Consultores"
          value={data?.consultores ?? "—"}
        />
        <KpiCard
          icon={Calendar}
          label="Visitas hoje"
          value={data?.visitasHoje ?? "—"}
        />
        <KpiCard
          icon={Briefcase}
          label="Carteira"
          value={data?.carteira ?? "—"}
        />
      </section>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          to="/crm/diretoria"
          icon={Building2}
          title="Diretoria"
          subtitle="Gestores e equipes"
        />
        <QuickAction
          to="/crm/transferencia/consultores"
          icon={UserCog}
          title="Transferir consultor"
          subtitle="Mover entre gestores"
        />
        <QuickAction
          to="/crm/transferencia"
          icon={ArrowLeftRight}
          title="Transferir cliente"
          subtitle="Realocar carteiras"
        />
        <QuickAction
          to="/crm/bi"
          icon={BarChart3}
          title="BI nacional"
          subtitle="Filtros e funil"
        />
      </div>
    </>
  );
}

function DevPanel({ empresaId }: { empresaId?: string }) {
  const { data } = useQuery({
    queryKey: ["dash-dev", empresaId],
    queryFn: async () => {
      // If filtering by empresa, get user IDs from that empresa first
      let userIds: string[] | null = null;
      if (empresaId) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("empresa_id", empresaId);
        userIds = (profiles ?? []).map((p) => p.id);
        if (userIds.length === 0) {
          return {
            users: 0,
            consultores: 0,
            gestores: 0,
            clientes: 0,
            visitasHoje: 0,
            visitasTotal: 0,
            convitesPendentes: 0,
          };
        }
      }

      const today = new Date().toISOString().slice(0, 10);

      // Build queries
      let usersQ = supabase
        .from("usuarios")
        .select("id", { count: "exact", head: true });
      let consultoresQ = supabase
        .from("usuarios")
        .select("id", { count: "exact", head: true })
        .eq("role", "consultor");
      let gestoresQ = supabase
        .from("usuarios")
        .select("id", { count: "exact", head: true })
        .eq("role", "gestor");
      let clientesQ = supabase
        .from("clientes")
        .select("id", { count: "exact", head: true });
      let visitasHojeQ = supabase
        .from("visitas")
        .select("id", { count: "exact", head: true })
        .eq("data_visita", today);
      let visitasTotalQ = supabase
        .from("visitas")
        .select("id", { count: "exact", head: true });
      let convitesQ = supabase
        .from("convites_acesso")
        .select("id", { count: "exact", head: true })
        .eq("status", "pendente");

      if (userIds) {
        const inClause = userIds.join(",");
        usersQ = usersQ.in("id", userIds);
        consultoresQ = consultoresQ.in("id", userIds);
        gestoresQ = gestoresQ.in("id", userIds);
        clientesQ = clientesQ.in("consultor_atual_id", userIds);
        visitasHojeQ = visitasHojeQ.in("consultor_executor_id", userIds);
        visitasTotalQ = visitasTotalQ.in("consultor_executor_id", userIds);
      }

      const [
        users,
        consultores,
        gestores,
        clientes,
        visitasHoje,
        visitasTotal,
        convites,
      ] = await Promise.all([
        usersQ,
        consultoresQ,
        gestoresQ,
        clientesQ,
        visitasHojeQ,
        visitasTotalQ,
        convitesQ,
      ]);

      return {
        users: users.count ?? 0,
        consultores: consultores.count ?? 0,
        gestores: gestores.count ?? 0,
        clientes: clientes.count ?? 0,
        visitasHoje: visitasHoje.count ?? 0,
        visitasTotal: visitasTotal.count ?? 0,
        convitesPendentes: convites.count ?? 0,
      };
    },
  });

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Usuários" value={data?.users ?? "—"} />
        <KpiCard
          icon={Briefcase}
          label="Clientes"
          value={data?.clientes ?? "—"}
        />
        <KpiCard
          icon={Calendar}
          label="Visitas hoje"
          value={data?.visitasHoje ?? "—"}
        />
        <KpiCard
          icon={TrendingUp}
          label="Visitas total"
          value={data?.visitasTotal ?? "—"}
        />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={UserCheck}
          label="Consultores"
          value={data?.consultores ?? "—"}
        />
        <KpiCard
          icon={Building2}
          label="Gestores"
          value={data?.gestores ?? "—"}
        />
        <KpiCard
          icon={UserPlus}
          label="Convites pendentes"
          value={data?.convitesPendentes ?? "—"}
        />
        <KpiCard icon={Settings} label="Demo cards" value="4" hint="papéis" />
      </section>
    </>
  );
}

const UserCheck = Users;

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon className="h-4 w-4 text-gold" />
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">
        {label} {hint && <span className="text-gold">· {hint}</span>}
      </p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string;
  icon: typeof Users;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="group glass rounded-2xl p-4 flex items-center justify-between hover:border-primary/40 transition"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-gold">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-gold transition" />
    </Link>
  );
}
