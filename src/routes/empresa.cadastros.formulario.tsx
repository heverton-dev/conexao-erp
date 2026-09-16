import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { FormBuilderTab } from "~/components/admin/FormBuilderTab";
import { ArrowLeft, FormInput } from "lucide-react";
import { RequirePermission } from "~/components/guards";
import { EMPRESA_ID } from "~/config/empresa";

export const empresaCadastrosFormularioRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/cadastros/formulario",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <AdminEmpresaCadastrosFormulario />
    </RequirePermission>
  ),
});

function AdminEmpresaCadastrosFormulario() {
  const navigate = useNavigate();
  const empresaId = EMPRESA_ID;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/empresa" })}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-hover hover:border-accent/30 border border-border transition-all duration-200 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent shrink-0">
              <FormInput size={20} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
                Formulário de Lead
              </h1>
              <p className="text-sm text-text-muted mt-0.5">
                Configure campos e documentos do formulário
              </p>
            </div>
          </div>
        </div>
      </div>

      <FormBuilderTab empresaId={empresaId} isSuper={true} />
    </div>
  );
}
