import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { getAllModules } from "~/registry";
import { Puzzle, Loader2, ChevronRight } from "lucide-react";
import { RequireSuperAdmin } from "~/components/guards";

export const adminSuperModulosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/modulos",
  component: () => (
    <RequireSuperAdmin>
      <AdminSuperModulos />
    </RequireSuperAdmin>
  ),
});

function AdminSuperModulos() {
  const { profile } = useAuth();
  const modulos = getAllModules();

  if (!profile?.is_super_admin) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-text-muted text-sm">
          Acesso restrito ao Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text-main">Módulos</h1>
          <p className="text-xs text-text-muted">
            Módulos registrados no sistema
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {modulos.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.key}
              to="/global/modulos/$key"
              params={{ key: mod.key }}
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border-subtle hover:border-accent/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Icon size={20} />
                </div>
                <div>
                  <span className="text-sm font-medium text-text-main">
                    {mod.nome}
                  </span>
                  <span className="text-xs text-text-muted block">
                    {mod.descricao}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">
                  {mod.ambientes.length} ambientes · {mod.abas.length} abas
                </span>
                <ChevronRight
                  size={16}
                  className="text-text-muted group-hover:text-accent transition-colors"
                />
              </div>
            </Link>
          );
        })}

        {modulos.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">
            Nenhum módulo registrado.
          </p>
        )}
      </div>
    </div>
  );
}
