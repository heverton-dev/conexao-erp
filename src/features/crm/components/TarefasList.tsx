import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { dispararEventoModulo } from "~/core/services/webhooks";
import { cn } from "~/lib/utils";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MoreVertical,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import toast from "react-hot-toast";

type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  prioridade: string;
  status: string;
  data_vencimento: string | null;
  data_conclusao: string | null;
  cliente: { id: string; nome_doutor: string } | null;
  responsavel: { id: string; nome_completo: string } | null;
  criador: { id: string; nome_completo: string } | null;
  criado_em: string;
};

type Props = {
  clienteId?: string;
  onNovaTarefa?: () => void;
  onTarefaClick?: (tarefa: Tarefa) => void;
};

const prioridadeConfig = {
  baixa: { label: "Baixa", color: "bg-muted text-muted-foreground" },
  media: { label: "Média", color: "bg-primary/10 text-primary" },
  alta: { label: "Alta", color: "bg-orange-500/10 text-orange-500" },
  urgente: { label: "Urgente", color: "bg-destructive/10 text-destructive" },
};

const statusConfig = {
  pendente: { label: "Pendente", icon: Circle, color: "text-muted-foreground" },
  em_andamento: { label: "Em andamento", icon: Clock, color: "text-primary" },
  concluida: {
    label: "Concluída",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  cancelada: {
    label: "Cancelada",
    icon: AlertCircle,
    color: "text-destructive",
  },
};

export function TarefasList({ clienteId, onNovaTarefa, onTarefaClick }: Props) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todos");
  const [itemParaDeletar, setItemParaDeletar] = useState<string | null>(null);

  const { data: tarefas, isLoading } = useQuery({
    queryKey: ["tarefas", profile?.id, clienteId],
    enabled: !!profile,
    queryFn: async () => {
      let query = supabase
        .from("tarefas")
        .select(
          `
          *,
          cliente:clientes(id, nome_doutor),
          responsavel:usuarios!tarefas_responsavel_id_fkey(id, nome_completo),
          criador:usuarios!tarefas_criador_id_fkey(id, nome_completo)
        `,
        )
        .order("data_vencimento", { ascending: true, nullsFirst: false })
        .order("prioridade", { ascending: false });

      if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Tarefa[];
    },
  });

  const tarefasFiltradas = useMemo(() => {
    if (!tarefas) return [];
    return tarefas.filter((t) => {
      const matchBusca =
        !busca ||
        t.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        t.descricao?.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === "todos" || t.status === filtroStatus;
      const matchPrioridade =
        filtroPrioridade === "todos" || t.prioridade === filtroPrioridade;
      return matchBusca && matchStatus && matchPrioridade;
    });
  }, [tarefas, busca, filtroStatus, filtroPrioridade]);

  const tarefasPorStatus = useMemo(() => {
    const grupos: Record<string, Tarefa[]> = {
      pendente: [],
      em_andamento: [],
      concluida: [],
      cancelada: [],
    };
    tarefasFiltradas.forEach((t) => {
      if (grupos[t.status]) {
        grupos[t.status].push(t);
      }
    });
    return grupos;
  }, [tarefasFiltradas]);

  async function atualizarStatus(tarefaId: string, novoStatus: string) {
    try {
      const update: any = { status: novoStatus };
      if (novoStatus === "concluida") {
        update.data_conclusao = new Date().toISOString();
      }

      const { error } = await supabase
        .from("tarefas")
        .update(update)
        .eq("id", tarefaId);

      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["tarefas"] });
    } catch (err) {
      toast.error("Erro ao atualizar tarefa");
    }
  }

  async function handleConfirmDelete() {
    if (!itemParaDeletar) return;
    try {
      const { error } = await supabase
        .from("tarefas")
        .delete()
        .eq("id", itemParaDeletar);

      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      dispararEventoModulo("crm", "tarefa.excluida", { tarefa_id: itemParaDeletar }).catch(() => {});
    } catch (err) {
      toast.error("Erro ao deletar tarefa");
    } finally {
      setItemParaDeletar(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {onNovaTarefa && (
          <Button onClick={onNovaTarefa}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        )}
      </div>

      {/* Lista de tarefas */}
      <div className="space-y-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const tarefasDoStatus = tarefasPorStatus[status] ?? [];
          if (tarefasDoStatus.length === 0 && filtroStatus !== "todos")
            return null;

          const Icon = config.icon;
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("h-4 w-4", config.color)} />
                <h3 className="font-semibold text-sm">{config.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {tarefasDoStatus.length}
                </span>
              </div>
              <div className="space-y-2">
                {tarefasDoStatus.map((tarefa) => (
                  <TarefaCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    onStatusChange={(novoStatus) =>
                      atualizarStatus(tarefa.id, novoStatus)
                    }
                    onDelete={() => setItemParaDeletar(tarefa.id)}
                    onClick={() => onTarefaClick?.(tarefa)}
                  />
                ))}
                {tarefasDoStatus.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhuma tarefa {config.label.toLowerCase()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!itemParaDeletar} onOpenChange={(o) => !o && setItemParaDeletar(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TarefaCard({
  tarefa,
  onStatusChange,
  onDelete,
  onClick,
}: {
  tarefa: Tarefa;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const isVencida =
    tarefa.data_vencimento &&
    new Date(tarefa.data_vencimento) < new Date() &&
    tarefa.status !== "concluida";

  const prioridade =
    prioridadeConfig[tarefa.prioridade as keyof typeof prioridadeConfig];
  const status = statusConfig[tarefa.status as keyof typeof statusConfig];

  return (
    <div
      className={cn(
        "bg-background rounded-lg border p-4 cursor-pointer hover:border-primary/40 transition",
        isVencida && "border-destructive/50",
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm">{tarefa.titulo}</h4>
            {prioridade && (
              <Badge
                variant="secondary"
                className={cn("text-xs", prioridade.color)}
              >
                {prioridade.label}
              </Badge>
            )}
            {isVencida && (
              <Badge variant="destructive" className="text-xs">
                Vencida
              </Badge>
            )}
          </div>
          {tarefa.descricao && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {tarefa.descricao}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {tarefa.cliente && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {tarefa.cliente.nome_doutor}
              </span>
            )}
            {tarefa.data_vencimento && (
              <span
                className={cn(
                  "flex items-center gap-1",
                  isVencida && "text-destructive",
                )}
              >
                <Calendar className="h-3 w-3" />
                {new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")}
              </span>
            )}
            {tarefa.responsavel && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {tarefa.responsavel.nome_completo}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {tarefa.status !== "concluida" && (
              <DropdownMenuItem onClick={() => onStatusChange("concluida")}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como concluída
              </DropdownMenuItem>
            )}
            {tarefa.status === "pendente" && (
              <DropdownMenuItem onClick={() => onStatusChange("em_andamento")}>
                <Clock className="h-4 w-4 mr-2" />
                Iniciar
              </DropdownMenuItem>
            )}
            {tarefa.status === "em_andamento" && (
              <DropdownMenuItem onClick={() => onStatusChange("pendente")}>
                <Circle className="h-4 w-4 mr-2" />
                Voltar para pendente
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
