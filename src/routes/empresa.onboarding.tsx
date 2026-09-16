import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";
import { ArrowLeft, Save, RotateCcw, HelpCircle, Map, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MODULOS_ONBOARDING,
  ROTAS_ONBOARDING,
  getAllOnboardingConfig,
  setAllOnboardingConfig,
  type ModuloOnboardingKey,
} from "~/features/empresas/services/onboarding-config";
import toast from "react-hot-toast";

export const empresaOnboardingRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/onboarding",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <EmpresaOnboardingPage />
    </RequirePermission>
  ),
});

function ToggleSwitch({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-accent" : "bg-input-bg border border-border"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function EmpresaOnboardingPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    setConfig(getAllOnboardingConfig());
  }, []);

  function toggle(key: string) {
    setConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setHasChanges(true);
      return next;
    });
  }

  function toggleModule(moduleKey: string) {
    setConfig((prev) => {
      const next = { ...prev, [moduleKey]: !prev[moduleKey] };
      const routes = ROTAS_ONBOARDING.filter((r) => r.modulo === moduleKey);
      for (const route of routes) {
        next[route.key] = !prev[moduleKey];
      }
      setHasChanges(true);
      return next;
    });
  }

  function handleSave() {
    setAllOnboardingConfig(config);
    setHasChanges(false);
    toast.success("Configuração de onboarding salva!");
  }

  function handleResetAll() {
    const allEnabled: Record<string, boolean> = {};
    for (const key of Object.keys(MODULOS_ONBOARDING)) {
      allEnabled[key] = true;
    }
    for (const route of ROTAS_ONBOARDING) {
      allEnabled[route.key] = true;
    }
    setConfig(allEnabled);
    setHasChanges(true);
  }

  function toggleExpand(moduleKey: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) next.delete(moduleKey);
      else next.add(moduleKey);
      return next;
    });
  }

  const modules = Object.entries(MODULOS_ONBOARDING) as [
    ModuloOnboardingKey,
    (typeof MODULOS_ONBOARDING)[ModuloOnboardingKey],
  ][];

  const enabledCount = Object.values(config).filter(Boolean).length;
  const totalCount = Object.keys(config).length;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: "/empresa" })}
          className="p-2 rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft size={18} className="text-text-muted" />
        </button>
        <div className="flex items-center gap-2">
          <HelpCircle size={20} className="text-accent" />
          <h1 className="text-lg font-bold text-text-main">
            Configuração de Onboarding
          </h1>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 border border-border-subtle mb-4">
        <p className="text-sm text-text-muted mb-3">
          Habilite ou desabilite o tour guiado (onboarding) para cada módulo e rota.
          Quando desabilitado, o botão de ajuda e o dialog de boas-vindas não
          serão exibidos.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {enabledCount} de {totalCount} habilitados
          </span>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-surface transition-colors"
          >
            <RotateCcw size={12} /> Habilitar Todos
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {modules.map(([key, info]) => {
          const routes = ROTAS_ONBOARDING.filter((r) => r.modulo === key);
          const hasRoutes = routes.length > 0;
          const isExpanded = expandedModules.has(key);

          return (
            <div key={key} className="rounded-xl bg-card border border-border-subtle overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:border-accent/20 transition-colors">
                <div className="flex items-center gap-3">
                  {hasRoutes && (
                    <button
                      onClick={() => toggleExpand(key)}
                      className="text-text-muted hover:text-text-main transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
                  {!hasRoutes && <div className="w-[14px]" />}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="text-sm font-semibold text-text-main">
                    {info.label}
                  </span>
                  {hasRoutes && (
                    <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded-full">
                      {routes.length} rota(s)
                    </span>
                  )}
                </div>
                <ToggleSwitch checked={!!config[key]} onToggle={() => toggleModule(key)} />
              </div>

              {hasRoutes && isExpanded && (
                <div className="border-t border-border-subtle">
                  {routes.map((route) => (
                    <div
                      key={route.key}
                      className="flex items-center justify-between px-4 py-3 pl-10 hover:bg-surface/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Map size={12} className="text-text-muted" />
                        <span className="text-xs text-text-muted">{route.label}</span>
                      </div>
                      <ToggleSwitch checked={!!config[route.key]} onToggle={() => toggle(route.key)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-fg font-semibold shadow-lg hover:scale-105 transition-all"
          >
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      )}
    </div>
  );
}
