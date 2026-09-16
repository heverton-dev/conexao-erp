import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar, Loader2, User, FileText } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clienteId?: string;
  clienteNome?: string;
};

export function NovaTarefaModal({
  open,
  onOpenChange,
  clienteId,
  clienteNome,
}: Props) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "geral",
    prioridade: "media",
    data_vencimento: "",
    responsavel_id: profile?.id ?? "",
  });

  // Buscar consultores da empresa para selecionar responsável
  const { data: consultores } = useQuery({
    queryKey: ["consultores-empresa"],
    enabled: open && !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nome_completo")
        .in("role", ["consultor", "gestor"])
        .order("nome_completo");
      return data ?? [];
    },
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setBusy(true);
    try {
      const { error } = await supabase.from("tarefas").insert({
        cliente_id: clienteId || null,
        responsavel_id: form.responsavel_id,
        criador_id: profile.id,
        titulo: form.titulo,
        descricao: form.descricao || null,
        tipo: form.tipo,
        prioridade: form.prioridade,
        data_vencimento: form.data_vencimento || null,
      }).select().single();

      if (error) throw error;

      toast.success("Tarefa criada com sucesso!");
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setForm({
      titulo: "",
      descricao: "",
      tipo: "geral",
      prioridade: "media",
      data_vencimento: "",
      responsavel_id: profile?.id ?? "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Nova Tarefa</DialogTitle>
              <DialogDescription>
                {clienteNome ? `Para: ${clienteNome}` : "Crie uma nova tarefa para acompanhamento."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <FileText className="h-3.5 w-3.5" />
              Título *
            </Label>
            <Input
              required
              value={form.titulo}
              onChange={(e) => update("titulo", e.target.value)}
              placeholder="Ex: Enviar proposta comercial"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Descrição
            </Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => update("descricao", e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tipo
              </Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => update("tipo", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="ligação">Ligação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Prioridade
              </Label>
              <Select
                value={form.prioridade}
                onValueChange={(v) => update("prioridade", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5" />
                Data de Vencimento
              </Label>
              <Input
                type="date"
                value={form.data_vencimento}
                onChange={(e) => update("data_vencimento", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <User className="h-3.5 w-3.5" />
                Responsável
              </Label>
              <Select
                value={form.responsavel_id}
                onValueChange={(v) => update("responsavel_id", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {consultores?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <button
              type="submit"
              disabled={busy}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Criar Tarefa"
              )}
            </button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
