import { useState, useMemo } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { formatBRL } from "~/features/crm/lib/comercial";
import { cn } from "~/lib/utils";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  User,
  Building2,
  Calendar,
  DollarSign,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";

type Estagio = {
  id: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  cor: string;
  icone: string;
};

type ClienteCard = {
  id: string;
  nome_doutor: string;
  nome_clinica: string | null;
  telefone_contato: string | null;
  estagio_id: string | null;
  ultimo_valor: number | null;
  ultima_data: string | null;
  proxima_data: string | null;
  total_visitas: number;
};

type Props = {
  onNovoCliente?: () => void;
  onClienteClick?: (id: string) => void;
};

export function KanbanAvancado({ onNovoCliente, onClienteClick }: Props) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  // Buscar estágios do pipeline
  const { data: estagios } = useQuery({
    queryKey: ["pipeline-estagios"],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("pipeline_estagios")
        .select("*")
        .eq("ativo", true)
        .order("ordem");
      return (data ?? []) as Estagio[];
    },
  });

  // Buscar clientes com estágio
  const { data: clientes, isLoading } = useQuery({
    queryKey: ["kanban-clientes", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data: clientesData } = await supabase
        .from("clientes")
        .select(
          `id, nome_doutor, nome_clinica, telefone_contato, estagio_id, criado_em,
           visitas:visitas(valor_estimado, data_visita, data_proximo_contato)`,
        )
        .eq("consultor_atual_id", profile!.id)
        .order("criado_em", { ascending: false });

      const cards: ClienteCard[] = (clientesData ?? []).map((c: any) => {
        const visitas = c.visitas ?? [];
        const ultima = visitas.sort((a: any, b: any) =>
          a.data_visita < b.data_visita ? 1 : -1,
        )[0];
        return {
          id: c.id,
          nome_doutor: c.nome_doutor,
          nome_clinica: c.nome_clinica,
          telefone_contato: c.telefone_contato,
          estagio_id: c.estagio_id,
          ultimo_valor: ultima?.valor_estimado ?? null,
          ultima_data: ultima?.data_visita ?? null,
          proxima_data: ultima?.data_proximo_contato ?? null,
          total_visitas: visitas.length,
        };
      });
      return cards;
    },
  });

  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    if (!clientes) return [];
    if (!busca.trim()) return clientes;
    const termo = busca.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome_doutor.toLowerCase().includes(termo) ||
        (c.nome_clinica ?? "").toLowerCase().includes(termo),
    );
  }, [clientes, busca]);

  // Agrupar clientes por estágio
  const clientesPorEstagio = useMemo(() => {
    const grupos: Record<string, ClienteCard[]> = {};
    if (estagios) {
      for (const estagio of estagios) {
        grupos[estagio.id] = [];
      }
    }
    // Clientes sem estágio vão para o primeiro estágio (Prospecção)
    const primeiroEstagioId = estagios?.[0]?.id;
    if (clientesFiltrados) {
      for (const cliente of clientesFiltrados) {
        const estagioId = cliente.estagio_id ?? primeiroEstagioId;
        if (estagioId && grupos[estagioId]) {
          grupos[estagioId].push(cliente);
        }
      }
    }
    return grupos;
  }, [clientesFiltrados, estagios]);

  // Calcular totais por estágio
  const totaisPorEstagio = useMemo(() => {
    const totais: Record<string, { count: number; valor: number }> = {};
    if (estagios) {
      for (const estagio of estagios) {
        const clientes = clientesPorEstagio[estagio.id] ?? [];
        totais[estagio.id] = {
          count: clientes.length,
          valor: clientes.reduce((acc, c) => acc + (c.ultimo_valor ?? 0), 0),
        };
      }
    }
    return totais;
  }, [clientesPorEstagio, estagios]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const clienteId = active.id as string;
    const novoEstagioId = over.id as string;

    // Verificar se é um estágio válido
    if (!estagios?.find((e) => e.id === novoEstagioId)) return;

    // Atualizar estágio do cliente
    atualizarEstagioCliente(clienteId, novoEstagioId);
  }

  async function atualizarEstagioCliente(clienteId: string, estagioId: string) {
    try {
      const { error } = await supabase
        .from("clientes")
        .update({ estagio_id: estagioId })
        .eq("id", clienteId);

      if (error) throw error;

      toast.success("Estágio atualizado");
      qc.invalidateQueries({ queryKey: ["kanban-clientes"] });
      qc.invalidateQueries({ queryKey: ["carteira"] });
    } catch (err) {
      toast.error("Erro ao atualizar estágio");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com busca e filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltroAberto(!filtroAberto)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        {onNovoCliente && (
          <Button size="sm" onClick={onNovoCliente}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {estagios?.map((estagio) => (
            <KanbanColuna
              key={estagio.id}
              estagio={estagio}
              clientes={clientesPorEstagio[estagio.id] ?? []}
              total={totaisPorEstagio[estagio.id]}
              onClienteClick={onClienteClick}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function KanbanColuna({
  estagio,
  clientes,
  total,
  onClienteClick,
}: {
  estagio: Estagio;
  clientes: ClienteCard[];
  total: { count: number; valor: number };
  onClienteClick?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: estagio.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col min-w-[300px] w-[300px] bg-muted/50 rounded-xl border",
        isDragging && "opacity-50",
      )}
    >
      {/* Header da coluna */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 border-b cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: estagio.cor }}
          />
          <h3 className="font-semibold text-sm">{estagio.nome}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {total.count}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatBRL(total.valor)}
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        <SortableContext
          items={clientes.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {clientes.map((cliente) => (
            <KanbanCard
              key={cliente.id}
              cliente={cliente}
              onClick={() => onClienteClick?.(cliente.id)}
            />
          ))}
        </SortableContext>

        {clientes.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhum cliente
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  cliente,
  onClick,
}: {
  cliente: ClienteCard;
  onClick?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cliente.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-background rounded-lg border p-3 cursor-pointer hover:border-primary/40 transition",
        isDragging && "opacity-50 shadow-lg",
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <GripVertical
              className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            />
            <p className="font-medium text-sm truncate">
              {cliente.nome_doutor}
            </p>
          </div>
          {cliente.nome_clinica && (
            <p className="text-xs text-muted-foreground truncate ml-6">
              {cliente.nome_clinica}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem>Registrar visita</DropdownMenuItem>
            <DropdownMenuItem>Criar tarefa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        {cliente.ultimo_valor && (
          <span className="flex items-center gap-1 text-primary font-medium">
            <DollarSign className="h-3 w-3" />
            {formatBRL(cliente.ultimo_valor)}
          </span>
        )}
        {cliente.total_visitas > 0 && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {cliente.total_visitas} visita{cliente.total_visitas > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {cliente.proxima_data && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Próx: {new Date(cliente.proxima_data).toLocaleDateString("pt-BR")}
        </div>
      )}
    </div>
  );
}
