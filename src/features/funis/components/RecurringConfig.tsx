import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  useRecorrenciasTarefa,
  useCriarRecorrencia,
  useDeletarRecorrencia,
  useToggleRecorrencia,
} from "../hooks/useRecurring";
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

type RecurringConfigProps = {
  tarefaId: string;
  canEdit?: boolean;
};

export function RecurringConfig({
  tarefaId,
  canEdit = true,
}: RecurringConfigProps) {
  const { data: recorrencias = [] } = useRecorrenciasTarefa(tarefaId);
  const criarRecorrencia = useCriarRecorrencia();
  const deletarRecorrencia = useDeletarRecorrencia();
  const toggleRecorrencia = useToggleRecorrencia();

  const [showForm, setShowForm] = useState(false);
  const [frequencia, setFrequencia] = useState("diaria");
  const [hora, setHora] = useState("09:00");
  const [diaSemana, setDiaSemana] = useState("1");
  const [diaMes, setDiaMes] = useState("1");
  const [intervalo, setIntervalo] = useState("14");
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const existing = recorrencias[0];

  const handleSave = async () => {
    try {
      const config: Record<string, unknown> = { hora };
      if (frequencia === "semanal") config.dia_semana = parseInt(diaSemana);
      if (frequencia === "mensal") config.dia_mes = parseInt(diaMes);
      if (frequencia === "personalizada")
        config.intervalo_dias = parseInt(intervalo);

      await criarRecorrencia.mutateAsync({
        tarefa_id: tarefaId,
        frequencia,
        config,
      });
      toast.success("Recorrência configurada");
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletarRecorrencia.mutateAsync(id);
      toast.success("Recorrência removida");
      setShowDelete(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggle = async (id: string, ativo: boolean) => {
    try {
      await toggleRecorrencia.mutateAsync({ id, ativo });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const freqLabels: Record<string, string> = {
    diaria: "Diária",
    semanal: "Semanal",
    mensal: "Mensal",
    personalizada: "Personalizada",
  };

  return (
    <div className="space-y-3">
      {existing ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-surface/20">
          <button
            onClick={() => handleToggle(existing.id, !existing.ativo)}
            className="shrink-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${existing.ativo ? "text-primary" : "text-muted-foreground"}`}
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {freqLabels[existing.frequencia] ?? existing.frequencia}
              </span>
              <Badge
                variant={existing.ativo ? "default" : "secondary"}
                className="text-[9px]"
              >
                {existing.ativo ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Próxima:{" "}
              {new Date(existing.proxima_exec).toLocaleDateString("pt-BR")} às{" "}
              {new Date(existing.proxima_exec).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {canEdit && (
            <Button
              variant="ghost-destructive"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowDelete(existing.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ) : showForm && canEdit ? (
        <div className="space-y-3 p-3 border border-border/40 rounded-lg bg-surface/10">
          <div className="space-y-2">
            <Label className="text-xs">Frequência</Label>
            <Select value={frequencia} onValueChange={setFrequencia}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diaria">Diária</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="personalizada">Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Horário</Label>
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {frequencia === "semanal" && (
            <div className="space-y-2">
              <Label className="text-xs">Dia da semana</Label>
              <Select value={diaSemana} onValueChange={setDiaSemana}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Segunda</SelectItem>
                  <SelectItem value="2">Terça</SelectItem>
                  <SelectItem value="3">Quarta</SelectItem>
                  <SelectItem value="4">Quinta</SelectItem>
                  <SelectItem value="5">Sexta</SelectItem>
                  <SelectItem value="6">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequencia === "mensal" && (
            <div className="space-y-2">
              <Label className="text-xs">Dia do mês</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={diaMes}
                onChange={(e) => setDiaMes(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          {frequencia === "personalizada" && (
            <div className="space-y-2">
              <Label className="text-xs">Intervalo (dias)</Label>
              <Input
                type="number"
                min={1}
                value={intervalo}
                onChange={(e) => setIntervalo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
              className="flex-1 h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1 h-8 text-xs"
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : canEdit ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-full border-dashed text-xs gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Configurar recorrência
        </Button>
      ) : null}

      <AlertDialog
        open={!!showDelete}
        onOpenChange={(o) => !o && setShowDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover recorrência?</AlertDialogTitle>
            <AlertDialogDescription>
              A tarefa não será mais recriada automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDelete && handleDelete(showDelete)}
              className="bg-destructive"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
