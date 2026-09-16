import { useState } from "react";
import {
  Bot,
  Plus,
  Loader2,
  MessageCircle,
  Edit3,
  Trash2,
  Power,
  Sparkles,
} from "lucide-react";
import { useAgentes, useDeletarAgente, useToggleAgenteAtivo } from "../hooks/useAgentes";
import { CriarAgenteWizard } from "./CriarAgenteWizard";
import { Playground } from "./Playground";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import type { AgenteIA } from "../types";

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

export function AgentesPage() {
  const { data: agentes = [], isLoading } = useAgentes();
  const deletar = useDeletarAgente();
  const toggleAtivo = useToggleAgenteAtivo();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editando, setEditando] = useState<AgenteIA | null>(null);
  const [playgroundAgente, setPlaygroundAgente] = useState<AgenteIA | null>(null);
  const [deletarAgente, setDeletarAgente] = useState<AgenteIA | null>(null);

  function handleEditar(agente: AgenteIA) {
    setEditando(agente);
    setWizardOpen(true);
  }

  function handleCriar() {
    setEditando(null);
    setWizardOpen(true);
  }

  function handleConfirmarDelete() {
    if (deletarAgente) {
      deletar.mutate(deletarAgente.id);
      setDeletarAgente(null);
    }
  }

  if (playgroundAgente) {
    return (
      <Playground
        agente={playgroundAgente}
        onVoltar={() => setPlaygroundAgente(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Bot size={24} className="text-accent" />
              Agentes IA
            </h1>
            <p className="text-sm text-text-muted">
              Crie agentes inteligentes para seus modulos ativos
            </p>
          </div>
          <button
            onClick={handleCriar}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            Criar Agente
          </button>
        </div>

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
            <p className="text-sm text-text-muted mb-4">
              Crie seu primeiro agente inteligente para automatizar atendimento.
            </p>
            <button
              onClick={handleCriar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              <Sparkles size={16} />
              Criar Primeiro Agente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentes.map((agente) => (
              <div
                key={agente.id}
                className="rounded-xl bg-card border border-border p-4 space-y-3 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Bot size={20} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-main text-sm">
                        {agente.nome}
                      </h3>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                        {MODULO_LABELS[agente.modulo_key] ?? agente.modulo_key}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${agente.ativo ? "bg-green-500" : "bg-gray-500"}`}
                  />
                </div>

                <div className="text-xs text-text-muted space-y-1">
                  <p>Modelo: <span className="text-text-main font-mono">{agente.modelo}</span></p>
                  <p>Render: <span className="text-text-main">{agente.render_mode === "floating" ? "Botao Flutuante" : "Icone no Header"}</span></p>
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                  <button
                    onClick={() => setPlaygroundAgente(agente)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  >
                    <MessageCircle size={12} /> Playground
                  </button>
                  <button
                    onClick={() => handleEditar(agente)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() =>
                      toggleAtivo.mutate({ id: agente.id, ativo: !agente.ativo })
                    }
                    className={`p-1.5 rounded-lg transition-colors ${
                      agente.ativo
                        ? "text-green-400 hover:bg-green-500/10"
                        : "text-text-muted hover:bg-surface-hover"
                    }`}
                    title={agente.ativo ? "Desativar" : "Ativar"}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => setDeletarAgente(agente)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {wizardOpen && (
        <CriarAgenteWizard
          agenteParaEditar={editando}
          onClose={() => {
            setWizardOpen(false);
            setEditando(null);
          }}
        />
      )}

      <AlertDialog open={!!deletarAgente} onOpenChange={(o) => !o && setDeletarAgente(null)}>
        <AlertDialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. O agente "{deletarAgente?.nome}" sera removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
