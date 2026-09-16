import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { cn } from "~/lib/utils";
import { Search, User, FileText, Calendar, X, Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import toast from "react-hot-toast";

type ResultadoBusca = {
  tipo: "cliente" | "tarefa" | "visita";
  id: string;
  titulo: string;
  subtitulo: string;
  icone: typeof User;
  link: string;
};

type Props = {
  aberto: boolean;
  onFechar: () => void;
};

export function BuscaGlobal({ aberto, onFechar }: Props) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState(0);

  // Focar no input quando abrir
  useEffect(() => {
    if (aberto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [aberto]);

  // Resetar ao fechar
  useEffect(() => {
    if (!aberto) {
      setTermo("");
      setResultados([]);
      setSelecionado(0);
    }
  }, [aberto]);

  // Buscar resultados com debounce
  const buscarResultados = useCallback(
    async (termo: string) => {
      if (!termo.trim() || !profile) {
        setResultados([]);
        return;
      }

      setCarregando(true);
      try {
        const termoBusca = `%${termo}%`;

        // Buscar clientes
        const { data: clientes } = await supabase
          .from("clientes")
          .select("id, nome_doutor, nome_clinica")
          .eq("consultor_atual_id", profile.id)
          .or(
            `nome_doutor.ilike.${termoBusca},nome_clinica.ilike.${termoBusca}`,
          )
          .limit(5);

        // Buscar tarefas
        const { data: tarefas } = await supabase
          .from("tarefas")
          .select("id, titulo, descricao, cliente:clientes(nome_doutor)")
          .eq("responsavel_id", profile.id)
          .or(`titulo.ilike.${termoBusca},descricao.ilike.${termoBusca}`)
          .limit(5);

        // Buscar visitas
        const { data: visitas } = await supabase
          .from("visitas")
          .select("id, data_visita, tipo_visita, cliente:clientes(nome_doutor)")
          .eq("consultor_executor_id", profile.id)
          .limit(5);

        const resultados: ResultadoBusca[] = [
          ...(clientes ?? []).map((c) => ({
            tipo: "cliente" as const,
            id: c.id,
            titulo: c.nome_doutor,
            subtitulo: c.nome_clinica ?? "",
            icone: User,
            link: `/crm/cliente/${c.id}`,
          })),
          ...(tarefas ?? []).map((t) => ({
            tipo: "tarefa" as const,
            id: t.id,
            titulo: t.titulo,
            subtitulo: (t as any).cliente?.nome_doutor ?? "",
            icone: FileText,
            link: `/crm/tarefas`,
          })),
          ...(visitas ?? []).map((v) => ({
            tipo: "visita" as const,
            id: v.id,
            titulo: `${v.tipo_visita} - ${(v as any).cliente?.nome_doutor}`,
            subtitulo: new Date(v.data_visita).toLocaleDateString("pt-BR"),
            icone: Calendar,
            link: `/crm/cliente/${(v as any).cliente?.id}`,
          })),
        ];

        setResultados(resultados);
      } catch (err) {
        toast.error("Erro ao buscar resultados");
      } finally {
        setCarregando(false);
      }
    },
    [profile],
  );

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarResultados(termo);
    }, 300);

    return () => clearTimeout(timer);
  }, [termo, buscarResultados]);

  // Navegação por teclado
  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelecionado((prev) => Math.min(prev + 1, resultados.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelecionado((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (resultados[selecionado]) {
          navigate({ to: resultados[selecionado].link });
          onFechar();
        }
        break;
      case "Escape":
        e.preventDefault();
        onFechar();
        break;
    }
  }

  // Navegar para resultado
  function navegarParaResultado(resultado: ResultadoBusca) {
    navigate({ to: resultado.link });
    onFechar();
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-popover border rounded-xl shadow-2xl overflow-hidden">
          {/* Campo de busca */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar clientes, tarefas, visitas..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
            />
            {carregando && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <button
              onClick={onFechar}
              className="p-1 hover:bg-muted rounded-lg transition"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Resultados */}
          {resultados.length > 0 && (
            <div className="max-h-[400px] overflow-y-auto p-2">
              {resultados.map((resultado, index) => {
                const Icon = resultado.icone;
                const isSelecionado = index === selecionado;
                return (
                  <button
                    key={`${resultado.tipo}-${resultado.id}`}
                    onClick={() => navegarParaResultado(resultado)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition",
                      isSelecionado
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isSelecionado ? "bg-primary/20" : "bg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {resultado.titulo}
                      </p>
                      {resultado.subtitulo && (
                        <p className="text-xs text-muted-foreground truncate">
                          {resultado.subtitulo}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {resultado.tipo}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}

          {/* Estado vazio */}
          {termo && !carregando && resultados.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum resultado encontrado para "{termo}"
              </p>
            </div>
          )}

          {/* Dicas */}
          {!termo && (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Digite para buscar clientes, tarefas e visitas
              </p>
              <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>↑↓ navegar</span>
                <span>↵ selecionar</span>
                <span>esc fechar</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
