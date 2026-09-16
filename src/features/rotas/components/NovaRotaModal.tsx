import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2, Plus, X, Search } from "lucide-react";
import { useCriarRota } from "../hooks/useRotas";
import { useClientesBase } from "../hooks/useClientesBase";
import { ROTA_TIPO_LABEL } from "../types";
import type { RotaTipo } from "../types";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export function NovaRotaModal({ open, onOpenChange }: Props) {
  const criarRota = useCriarRota();
  const { data: clientes } = useClientesBase();

  const [form, setForm] = useState({
    titulo: "",
    data_rota: today(),
    tipo: "diaria" as RotaTipo,
  });

  const [clientesSelecionados, setClientesSelecionados] = useState<string[]>(
    [],
  );
  const [busca, setBusca] = useState("");
  const [metodo, setMetodo] = useState<"manual" | "filtros" | "automatico">(
    "manual",
  );

  const clientesFiltrados = (clientes ?? []).filter(
    (c) =>
      !clientesSelecionados.includes(c.id) &&
      (c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
        c.categoria?.toLowerCase().includes(busca.toLowerCase())),
  );

  function toggleCliente(id: string) {
    setClientesSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function selecionarAutomaticamente() {
    if (!clientes) return;

    const clientesOrdenados = [...clientes]
      .sort((a, b) => {
        if (!a.ultima_visita) return -1;
        if (!b.ultima_visita) return 1;
        return (
          new Date(a.ultima_visita).getTime() -
          new Date(b.ultima_visita).getTime()
        );
      })
      .slice(0, 8);

    setClientesSelecionados(clientesOrdenados.map((c) => c.id));
    setMetodo("automatico");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (clientesSelecionados.length === 0) {
      toast.error("Selecione pelo menos um cliente");
      return;
    }

    try {
      await criarRota.mutateAsync({
        titulo: form.titulo,
        data_rota: form.data_rota,
        tipo: form.tipo,
        cliente_ids: clientesSelecionados,
      });
      toast.success("Rota criada com sucesso!");
      onOpenChange(false);
      setForm({ titulo: "", data_rota: today(), tipo: "diaria" });
      setClientesSelecionados([]);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>Nova Rota</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 py-6 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input
                required
                value={form.titulo}
                onChange={(e) =>
                  setForm((s) => ({ ...s, titulo: e.target.value }))
                }
                placeholder="Ex: Rota Centro - Manhã"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                required
                value={form.data_rota}
                onChange={(e) =>
                  setForm((s) => ({ ...s, data_rota: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, tipo: v as RotaTipo }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diaria">Diária</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Clientes ({clientesSelecionados.length} selecionados)
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selecionarAutomaticamente}
                >
                  Auto (por prioridade)
                </Button>
              </div>
            </div>

            {clientesSelecionados.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {clientesSelecionados.map((id) => {
                  const cliente = clientes?.find((c) => c.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {cliente?.nome ?? id}
                      <button
                        type="button"
                        onClick={() => toggleCliente(id)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 border rounded-lg p-2">
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => toggleCliente(cliente.id)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                  >
                    <div>
                      <div className="font-medium text-sm">{cliente.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {cliente.cidade && `${cliente.cidade} - `}
                        {cliente.categoria ?? "Sem categoria"}
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center p-4">
                  Nenhum cliente encontrado
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
            >
              Cancelar
            </button>
            <button type="submit" disabled={criarRota.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              {criarRota.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Criar Rota
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
