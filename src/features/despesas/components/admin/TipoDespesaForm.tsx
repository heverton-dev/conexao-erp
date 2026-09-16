import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText } from "lucide-react";
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
import {
  useCriarTipoDespesa,
  useAtualizarTipoDespesa,
} from "../../hooks/useTiposDespesa";
import type { DespesaTipo } from "../../types";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valor_maximo: z.coerce.number().positive("Valor deve ser positivo"),
});

type FormData = z.infer<typeof schema>;

export function TipoDespesaForm({
  open,
  onOpenChange,
  editando,
  empresaId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editando: DespesaTipo | null;
  empresaId?: string;
}) {
  const criar = useCriarTipoDespesa(empresaId);
  const atualizar = useAtualizarTipoDespesa(empresaId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", valor_maximo: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        editando
          ? { nome: editando.nome, valor_maximo: editando.valor_maximo }
          : { nome: "", valor_maximo: 0 },
      );
    }
  }, [open, editando, reset]);

  async function onSubmit(data: FormData) {
    if (editando) {
      await atualizar.mutateAsync({ id: editando.id, updates: data });
    } else {
      await criar.mutateAsync(data);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><FileText className="h-6 w-6" /></div>
            <div><DialogTitle>
              {editando ? "Editar Tipo de Despesa" : "Novo Tipo de Despesa"}
            </DialogTitle><DialogDescription>Configure o tipo de despesa.</DialogDescription></div>
          </div>
        </DialogHeader>
        <div className="px-6 py-6 flex-1 space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Ex: Jantar, Almoço, Uber..."
              {...register("nome")}
            />
            {errors.nome && (
              <p className="text-xs text-error">{errors.nome.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor_maximo">Valor Máximo de Reembolso (R$)</Label>
            <Input
              id="valor_maximo"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("valor_maximo")}
            />
            {errors.valor_maximo && (
              <p className="text-xs text-error">
                {errors.valor_maximo.message}
              </p>
            )}
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
              disabled={criar.isPending || atualizar.isPending}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              {criar.isPending || atualizar.isPending
                ? "Salvando..."
                : "Salvar"}
            </button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
