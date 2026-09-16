import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Search, User, Loader2 } from "lucide-react";

type Cliente = {
  id: string;
  nome_doutor: string;
  nome_clinica: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  consultorId: string;
  onSelect: (clienteId: string) => void;
};

export function ClientePickerModal({
  open,
  onOpenChange,
  consultorId,
  onSelect,
}: Props) {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["picker-clientes", consultorId],
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("id, nome_doutor, nome_clinica")
        .eq("consultor_atual_id", consultorId)
        .order("nome_doutor", { ascending: true });
      return (data ?? []) as Cliente[];
    },
    enabled: open,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (c) =>
        c.nome_doutor.toLowerCase().includes(term) ||
        (c.nome_clinica ?? "").toLowerCase().includes(term),
    );
  }, [data, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <User className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Selecionar cliente</DialogTitle>
              <DialogDescription>
                Escolha o cliente para registrar a nova visita.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Buscar por doutor ou clínica…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto -mx-2 px-2">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando…
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {q
                ? "Nenhum cliente encontrado."
                : "Você ainda não possui clientes."}
            </p>
          )}
          <ul className="space-y-1">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(c.id);
                  }}
                  className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/50 transition"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-gold shrink-0">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {c.nome_doutor}
                    </span>
                    {c.nome_clinica && (
                      <span className="block text-xs text-muted-foreground truncate">
                        {c.nome_clinica}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
