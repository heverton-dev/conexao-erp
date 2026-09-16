import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Zap,
  Trash2,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import {
  useAutomacoes,
  useDeletarAutomacao,
  useToggleAutomacao,
} from "../hooks/useAutomations";
import { AutomationBuilder } from "./AutomationBuilder";

const triggerLabels: Record<string, string> = {
  tarefa_criada: "Tarefa criada",
  tarefa_movida: "Tarefa movida",
  tarefa_concluida: "Tarefa concluída",
  tarefa_atrasada: "Tarefa atrasada",
  data_especifica: "Data específica",
  label_adicionado: "Label adicionado",
  comentario_adicionado: "Comentário adicionado",
};

const actionLabels: Record<string, string> = {
  mover_para_coluna: "Mover para coluna",
  atribuir_usuario: "Atribuir usuário",
  adicionar_label: "Adicionar label",
  remover_label: "Remover label",
  alterar_prioridade: "Alterar prioridade",
  enviar_notificacao: "Enviar notificação",
  criar_tarefa: "Criar tarefa",
  webhook_custom: "Webhook custom",
};

export function AutomationRules() {
  const { funilId } = useParams({ strict: false }) as { funilId: string };
  const navigate = useNavigate();
  const { data: automacoes = [], isLoading } = useAutomacoes(funilId);
  const deletarAutomacao = useDeletarAutomacao();
  const toggleAutomacao = useToggleAutomacao();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deletarAutomacao.mutateAsync(id);
      toast.success("Automação excluída");
      setShowDelete(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (id: string, ativo: boolean) => {
    try {
      await toggleAutomacao.mutateAsync({ id, ativo });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-10 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate({ to: "/funis/funil/$funilId", params: { funilId } })
            }
            className="btn-hover-neutral p-1.5 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display">Automações</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Configure regras automáticas para seu funil
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setShowBuilder(true);
          }}
          className="gradient-gold text-[#0f172a] font-semibold w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova automação
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-10 text-center">
          Carregando...
        </div>
      ) : automacoes.length === 0 ? (
        <Card className="p-10 sm:p-14 text-center bg-surface/50 border-dashed border-border/60">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-xl sm:text-2xl mb-2">
            Nenhuma automação
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Crie regras para automatizar ações no seu funil.
          </p>
          <Button
            onClick={() => {
              setEditingId(null);
              setShowBuilder(true);
            }}
            className="gradient-gold text-[#0f172a] font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar automação
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {automacoes.map((auto) => (
            <Card
              key={auto.id}
              className="p-4 bg-surface/70 border-border/40 flex items-center gap-4"
            >
              <button
                onClick={() => handleToggle(auto.id, !auto.ativo)}
                className="shrink-0"
              >
                {auto.ativo ? (
                  <ToggleRight className="h-6 w-6 text-primary" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{auto.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {triggerLabels[auto.trigger_type] ?? auto.trigger_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">→</span>
                  <Badge variant="outline" className="text-[10px]">
                    {actionLabels[auto.action_type] ?? auto.action_type}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingId(auto.id);
                    setShowBuilder(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost-destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowDelete(auto.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showBuilder && (
        <AutomationBuilder
          funilId={funilId}
          editingId={editingId}
          onClose={() => {
            setShowBuilder(false);
            setEditingId(null);
          }}
        />
      )}

      <AlertDialog
        open={!!showDelete}
        onOpenChange={(o) => !o && setShowDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDelete && handleDelete(showDelete)}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
