import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState, useEffect } from "react";
import { useAuth } from "~/lib/auth";
import { listarCadastros } from "~/features/clientes";
import {
  ArrowLeft,
  Search,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { EMPRESA_ID } from "~/config/empresa";
import { RequirePermission } from "~/components/guards";

export const consultorClientesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/consultor/clientes",
  component: () => (
    <RequirePermission modulo="cadastros" permissions={["gerar_links"]}>
      <ConsultorClientes />
    </RequirePermission>
  ),
});

function ConsultorClientes() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.id) carregar();
  }, [user]);

  async function carregar() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await listarCadastros({
        status: "aprovado",
        created_by: user.id,
      });
      setClientes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = clientes.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.nome || "").toLowerCase().includes(q) ||
      (c.codigo_cliente || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/cadastros/consultor" })}
          className="text-text-muted hover:text-text-main"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-text-main">Meus Clientes</h1>
        <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
          {clientes.length}
        </span>
      </div>
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar clientes..."
          className="w-full rounded-xl border border-input-border bg-input-bg py-4 pl-12 pr-4 text-base text-text-main outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 min-h-[56px] transition-all shadow-sm"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">
          Nenhum cliente encontrado
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                navigate({ to: "/cadastros/solicitacoes/$id", params: { id: c.id } })
              }
              className="group flex items-center gap-4 rounded-2xl bg-surface border border-border/60 p-5 transition-all duration-300 active:scale-[0.98] w-full text-left hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-text-main truncate group-hover:text-accent transition-colors">
                  {c.nome}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.codigo_cliente && (
                    <span className="text-xs text-text-muted">
                      #{c.codigo_cliente}
                    </span>
                  )}
                  {c.tipo_pessoa && (
                    <span className="text-xs text-text-muted">
                      {c.tipo_pessoa}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight size={16} className="text-text-muted shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
