import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useGerarPeriodos } from "../../hooks/usePeriodos";
import { FREQUENCIA_LABEL, type Frequencia } from "../../types";
import { cn } from "~/lib/utils";
import { FileText } from "lucide-react";

interface GerarPeriodosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId?: string;
}

function gerarOpcoesMeses(): { value: string; label: string }[] {
  const meses = [];
  const hoje = new Date();
  for (let i = 0; i < 12; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const value = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    const label = data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    meses.push({
      value,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    });
  }
  return meses;
}

export function GerarPeriodosModal({
  open,
  onOpenChange,
  empresaId,
}: GerarPeriodosModalProps) {
  const gerar = useGerarPeriodos(empresaId);
  const [frequencia, setFrequencia] = useState<Frequencia>("mensal");
  const [meses, setMeses] = useState<string[]>([]);

  const opcoesMeses = useMemo(() => gerarOpcoesMeses(), []);

  function toggleMes(mes: string) {
    setMeses((prev) =>
      prev.includes(mes) ? prev.filter((m) => m !== mes) : [...prev, mes],
    );
  }

  function selecionarTodos() {
    setMeses(opcoesMeses.map((m) => m.value));
  }

  function limparSelecao() {
    setMeses([]);
  }

  async function handleGerar() {
    if (meses.length === 0) return;
    await gerar.mutateAsync({ frequencia, meses });
    onOpenChange(false);
    setMeses([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-md max-h-[90dvh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><FileText className="h-6 w-6" /></div>
            <div><DialogTitle>Gerar Períodos</DialogTitle><DialogDescription>Gere períodos de despesas automaticamente.</DialogDescription></div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main">
              Frequência
            </label>
            <Select
              value={frequencia}
              onValueChange={(v) => setFrequencia(v as Frequencia)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(FREQUENCIA_LABEL) as [Frequencia, string][]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-text-muted">
              {frequencia === "semanal" &&
                "Gera períodos de 1 semana para cada mês selecionado."}
              {frequencia === "quinzenal" &&
                "Gera 2 períodos (1-15 e 16-fim) para cada mês selecionado."}
              {frequencia === "mensal" &&
                "Gera 1 período completo para cada mês selecionado."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-main">
                Meses
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selecionarTodos}
                  className="text-xs text-accent hover:underline"
                >
                  Todos
                </button>
                <button
                  onClick={limparSelecao}
                  className="text-xs text-text-muted hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {opcoesMeses.map((mes) => (
                <button
                  key={mes.value}
                  onClick={() => toggleMes(mes.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm text-left transition-colors border",
                    meses.includes(mes.value)
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-surface border-border text-text-muted hover:border-accent/50",
                  )}
                >
                  {mes.label}
                </button>
              ))}
            </div>
            {meses.length > 0 && (
              <p className="text-xs text-text-muted">
                {meses.length} mês(es) selecionado(s) •{" "}
                {frequencia === "semanal" &&
                  `~${meses.length * 4 - 5} períodos`}
                {frequencia === "quinzenal" && `${meses.length * 2} períodos`}
                {frequencia === "mensal" && `${meses.length} períodos`}
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
          <button
            type="button"
            onClick={handleGerar}
            disabled={meses.length === 0 || gerar.isPending}
            className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
          >
            {gerar.isPending ? "Gerando..." : "Gerar Períodos"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
