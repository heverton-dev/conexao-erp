import { useState } from "react";
import { Bot, Loader2, Building2, Plus, Cpu, ChevronRight } from "lucide-react";
import { useTodosAgentes } from "../hooks/useAgentes";
import { useEmpresaSuperAdmin } from "~/components/shared/useEmpresaSuperAdmin";
import { CriarAgenteWizard } from "./CriarAgenteWizard";
import { ProvedoresTab } from "./ProvedoresTab";
import type { AgenteIA } from "../types";
import { Button } from "~/components/ui/button";

const MODULO_LABELS: Record<string, string> = {
  cadastros: "Cadastros",
  nps: "NPS",
  hub: "Hub",
  crm: "CRM",
  funis: "Funis",
  despesas: "Despesas",
  rotas: "Rotas",
  linktree: "LinkTree",
  "mapas-interativos": "Mapas",
  "gerador-links": "Links",
  catalogo: "Catalogo",
  marketing: "Marketing",
  "empresas-core": "Empresa",
};

export function GlobalAgentesPage() {
  const {
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
    isSuperAdmin,
  } = useEmpresaSuperAdmin();

  const { data: agentes = [], isLoading } = useTodosAgentes();

  const [showWizard, setShowWizard] = useState(false);
  const [agenteEditar, setAgenteEditar] = useState<AgenteIA | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<"agentes" | "provedores">("agentes");

  const renderTabs = () => (
    <div className="flex gap-2 border-b border-border mb-6">
      <Button
        variant={abaAtiva === "agentes" ? "default" : "ghost"}
        className="gap-2"
        onClick={() => setAbaAtiva("agentes")}
        style={{
          background: abaAtiva === "agentes" ? "linear-gradient(135deg, #c9a655, #e8d48b)" : undefined,
          color: abaAtiva === "agentes" ? "#0f172a" : undefined,
          borderColor: abaAtiva === "agentes" ? "transparent" : undefined,
        }}
      >
        <Bot size={16} />
        Agentes
      </Button>
      <Button
        variant={abaAtiva === "provedores" ? "default" : "ghost"}
        className="gap-2"
        onClick={() => setAbaAtiva("provedores")}
        style={{
          background: abaAtiva === "provedores" ? "linear-gradient(135deg, #c9a655, #e8d48b)" : undefined,
          color: abaAtiva === "provedores" ? "#0f172a" : undefined,
          borderColor: abaAtiva === "provedores" ? "transparent" : undefined,
        }}
      >
        <Cpu size={16} />
        Provedores
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Bot size={24} className="text-accent" />
              Agentes IA (Global)
            </h1>
            <p className="text-sm text-text-muted">
              Visao de todos os agentes IA de todas as empresas
            </p>
          </div>
          {isSuperAdmin && abaAtiva === "agentes" && (
            <button
              onClick={() => {
                setAgenteEditar(null);
                setShowWizard(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
            >
              <Plus size={16} />
              Criar Agente
            </button>
          )}
        </div>

        {renderTabs()}

        {abaAtiva === "agentes" && (
          <>
            {isSuperAdmin && empresas.length > 0 && (
              <div className="max-w-sm">
                <label className="text-sm font-medium text-text-main mb-2 block">
                  Filtrar por empresa
                </label>
                <select
                  value={empresaSelecionada ?? ""}
                  onChange={(e) => setEmpresaSelecionada(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface-hover px-2 text-sm"
                >
                  <option value="">Todas as empresas</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : agentes.length === 0 ? (
              <div className="rounded-xl bg-card border border-border p-8 text-center">
                <Bot size={48} className="mx-auto mb-3 text-text-muted" />
                <h2 className="text-lg font-semibold text-text-main mb-1">
                  Nenhum agente criado
                </h2>
                <p className="text-sm text-text-muted">
                  Nenhuma empresa criou agentes IA ainda.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Agente</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Empresa</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Modulo</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Modelo</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Render</th>
                        <th className="text-center p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                        <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {agentes.map((a) => (
                        <tr key={a.id} className="hover:bg-surface-hover transition-colors">
                          <td className="p-3 text-text-main font-medium">{a.nome}</td>
                          <td className="p-3 text-text-muted">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={12} />
                              <span className="text-xs">Global</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent">
                              {MODULO_LABELS[a.modulo_key] ?? a.modulo_key}
                            </span>
                          </td>
                          <td className="p-3 text-text-main font-mono text-xs">{a.modelo}</td>
                          <td className="p-3 text-text-muted text-xs">
                            {a.render_mode === "floating" ? "Flutuante" : "Header"}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full ${
                                a.ativo ? "bg-green-500" : "bg-gray-500"
                              }`}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setAgenteEditar(a);
                                setShowWizard(true);
                              }}
                              className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-border text-xs text-text-muted">
                  {agentes.length} agente(s)
                </div>
              </div>
            )}
          </>
        )}

        {abaAtiva === "provedores" && <ProvedoresTab />}

        {showWizard && (
          <CriarAgenteWizard
            agenteParaEditar={agenteEditar}
            onClose={() => {
              setShowWizard(false);
              setAgenteEditar(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
