import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooter2,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitle2,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  ListChecks,
} from "lucide-react";

export interface SurveyQuestion {
  id: string;
  key: string;
  order_index: number;
  type: "nps" | "single_choice" | "multi_choice" | "text" | "matrix";
  question_text: string;
  options: string[];
  required: boolean;
  active: boolean;
  is_system: boolean;
}

const TYPE_LABELS: Record<SurveyQuestion["type"], string> = {
  nps: "NPS (0-10)",
  single_choice: "Escolha única",
  multi_choice: "Escolha múltipla",
  text: "Texto livre",
  matrix: "Matriz (1-5)",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);

const emptyDraft = (): Partial<SurveyQuestion> => ({
  key: "",
  type: "single_choice",
  question_text: "",
  options: [],
  required: true,
  active: true,
  is_system: false,
  order_index: 0,
});

const QuestionsManager = () => {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SurveyQuestion> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [optionInput, setOptionInput] = useState("");
  const [questionToDelete, setQuestionToDelete] =
    useState<SurveyQuestion | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("nps_perguntas_pesquisa")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) {
      toast.error(`Erro ao carregar perguntas: ${error.message}`);
    }
    setQuestions((data as SurveyQuestion[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleActive = async (q: SurveyQuestion) => {
    const { data, error } = await supabase
      .from("nps_perguntas_pesquisa")
      .update({ active: !q.active, updated_at: new Date().toISOString() })
      .eq("id", q.id)
      .select();
    if (error) {
      toast.error(`Erro: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      toast.error("Sem permissão (RLS): Nada foi alterado. Reaplique o SQL de policies no Supabase e confirme role super_admin.");
      return;
    }
    fetchAll();
  };

  const move = async (q: SurveyQuestion, dir: -1 | 1) => {
    const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((x) => x.id === q.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await supabase
      .from("nps_perguntas_pesquisa")
      .update({ order_index: swap.order_index })
      .eq("id", q.id);
    await supabase
      .from("nps_perguntas_pesquisa")
      .update({ order_index: q.order_index })
      .eq("id", swap.id);
    fetchAll();
  };

  const remove = async (q: SurveyQuestion) => {
    if (q.is_system) {
      toast.error("Perguntas do sistema não podem ser excluídas. Use o botão Desativar.");
      return;
    }
    setQuestionToDelete(q);
  };

  const confirmRemove = async () => {
    if (!questionToDelete) return;
    const { error } = await supabase
      .from("nps_perguntas_pesquisa")
      .delete()
      .eq("id", questionToDelete.id);
    if (error)
      toast.error(`Erro: ${error.message}`);
    else {
      toast.success("Pergunta excluída");
      fetchAll();
    }
    setQuestionToDelete(null);
  };

  const openNew = () => {
    const maxOrder = Math.max(0, ...questions.map((q) => q.order_index));
    setEditing({ ...emptyDraft(), order_index: maxOrder + 1 });
    setIsNew(true);
  };
  const openEdit = (q: SurveyQuestion) => {
    setEditing({ ...q });
    setIsNew(false);
  };
  const close = () => {
    setEditing(null);
    setOptionInput("");
  };

  const addOption = () => {
    const v = optionInput.trim();
    if (!v) return;
    setEditing((e) => (e ? { ...e, options: [...(e.options || []), v] } : e));
    setOptionInput("");
  };
  const removeOption = (i: number) => {
    setEditing((e) =>
      e
        ? { ...e, options: (e.options || []).filter((_, idx) => idx !== i) }
        : e,
    );
  };

  const save = async () => {
    if (!editing) return;
    const text = (editing.question_text || "").trim();
    if (!text) {
      toast.error("Texto da pergunta é obrigatório");
      return;
    }
    const type = editing.type as SurveyQuestion["type"];
    const needsOptions =
      type === "single_choice" || type === "multi_choice" || type === "matrix";
    const opts = editing.options || [];
    if (needsOptions && opts.length < 2) {
      toast.error("Adicione ao menos 2 opções");
      return;
    }
    const payload: any = {
      question_text: text,
      type,
      options: needsOptions ? opts : [],
      required: !!editing.required,
      active: !!editing.active,
      order_index: editing.order_index ?? 0,
      updated_at: new Date().toISOString(),
    };
    if (isNew) {
      const base = editing.key || slugify(text) || `q_${Date.now()}`;
      payload.key = base;
      payload.is_system = false;
      const { data, error } = await supabase
        .from("nps_perguntas_pesquisa")
        .insert(payload)
        .select();
      if (error) {
        toast.error(`Erro ao criar: ${error.message}`);
        return;
      }
      if (!data || data.length === 0) {
        toast.error("Sem permissão (RLS): Nenhuma linha criada. Aplique o SQL atualizado de policies no Supabase e confirme que seu usuário tem role=super_admin em dashboard_profiles.");
        return;
      }
      toast.success("Pergunta criada!");
    } else {
      const { data, error } = await supabase
        .from("nps_perguntas_pesquisa")
        .update(payload)
        .eq("id", editing.id!)
        .select();
      if (error) {
        toast.error(`Erro ao salvar: ${error.message}`);
        return;
      }
      if (!data || data.length === 0) {
        toast.error("Sem permissão (RLS): A atualização foi silenciosamente bloqueada por RLS. Reaplique o SQL docs/sql/20260615_survey_questions.sql no Supabase e confirme que seu usuário tem role=super_admin.");
        return;
      }
      toast.success("Pergunta atualizada!");
    }
    close();
    fetchAll();
  };

  const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);
  const needsOptions =
    editing?.type === "single_choice" ||
    editing?.type === "multi_choice" ||
    editing?.type === "matrix";

  return (
    <Card className="bg-surface border border-border rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-text-main text-base font-semibold flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-accent" />
          Perguntas da Pesquisa
        </CardTitle>
        <Button onClick={openNew} size="sm" className="btn-gold gap-1.5">
          <Plus className="w-4 h-4" /> Nova pergunta
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <p className="text-sm text-text-muted">Carregando…</p>
        )}
        {!loading && sorted.length === 0 && (
          <p className="text-sm text-text-muted">
            Nenhuma pergunta cadastrada. Execute o SQL{" "}
            <code className="text-accent/80">
              docs/sql/20260615_survey_questions.sql
            </code>{" "}
            no Supabase para popular as 10 iniciais.
          </p>
        )}
        {sorted.map((q, idx) => (
          <div
            key={q.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${q.active ? "bg-border/20 border-border/40" : "bg-border/10 border-border/20 opacity-60"}`}
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => move(q, -1)}
                disabled={idx === 0}
                className="text-text-muted hover:text-text-main disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => move(q, 1)}
                disabled={idx === sorted.length - 1}
                className="text-text-muted hover:text-text-main disabled:opacity-30"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-accent/80">
                  #{idx + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-accent/10 text-accent">
                  {TYPE_LABELS[q.type]}
                </span>
                {q.is_system && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-text-muted">
                    sistema
                  </span>
                )}
                {!q.required && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-text-muted">
                    opcional
                  </span>
                )}
              </div>
              <p className="text-sm text-text-main mt-1 truncate">
                {q.question_text}
              </p>
              <p className="text-xs text-text-muted font-mono truncate">
                key: {q.key}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={q.active}
                  onCheckedChange={() => toggleActive(q)}
                />
                <span className="text-xs text-text-muted hidden md:inline">
                  {q.active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <Button
                variant="ghost-edit"
                size="sm"
                onClick={() => openEdit(q)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost-destructive"
                size="sm"
                onClick={() => remove(q)}
                disabled={q.is_system}
                className="disabled:opacity-30"
                title={
                  q.is_system
                    ? "Pergunta do sistema — não pode ser excluída"
                    : "Excluir"
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg w-[calc(100%-2rem)]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <ListChecks className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>
                  {isNew ? "Nova pergunta" : "Editar pergunta"}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          {editing && (
            <div className="px-6 py-6 flex-1 space-y-4">
              <div>
                <Label className="text-xs text-text-muted">Tipo</Label>
                <Select
                  value={editing.type}
                  onValueChange={(v) =>
                    setEditing({
                      ...editing,
                      type: v as SurveyQuestion["type"],
                    })
                  }
                  disabled={editing.is_system}
                >
                  <SelectTrigger className="h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editing.is_system && (
                  <p className="text-xs text-text-muted mt-1">
                    Tipo de perguntas do sistema não pode ser alterado.
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs text-text-muted">
                  Texto da pergunta
                </Label>
                <Textarea
                  value={editing.question_text || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, question_text: e.target.value })
                  }
                  className="rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                  rows={3}
                />
              </div>

              {isNew && (
                <div>
                  <Label className="text-xs text-text-muted">
                    Identificador (key)
                  </Label>
                  <Input
                    value={editing.key || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, key: slugify(e.target.value) })
                    }
                    placeholder={
                      slugify(editing.question_text || "") ||
                      "identificador_unico"
                    }
                    className="h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Gerado automaticamente se vazio. Usado como chave nas
                    respostas.
                  </p>
                </div>
              )}

              {needsOptions && (
                <div>
                  <Label className="text-xs text-text-muted">
                    {editing.type === "matrix" ? "Itens da matriz" : "Opções"}
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOption();
                        }
                      }}
                      placeholder="Digite e pressione Enter"
                      className="rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                    />
                    <Button
                      type="button"
                      onClick={addOption}
                      variant="outline"
                      size="sm"
                      className="border-border"
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {(editing.options || []).map((opt, i) => (
                      <div
                        key={i}
                        className="group/opt flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 transition-all duration-200 hover:border-accent/30"
                      >
                        <span className="text-sm text-text-main flex-1">
                          {opt}
                        </span>
                        <button
                          onClick={() => removeOption(i)}
                          className="text-text-muted hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 p-0.5 opacity-0 group-hover/opt:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!editing.required}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, required: v })
                    }
                  />
                  <Label className="text-sm text-text-main cursor-pointer">
                    Obrigatória
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!editing.active}
                    onCheckedChange={(v) =>
                      setEditing({ ...editing, active: v })
                    }
                  />
                  <Label className="text-sm text-text-main cursor-pointer">
                    Ativa
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={close}
              className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
            >
              Cancelar
            </button>
            <button type="button" onClick={save} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!questionToDelete}
        onOpenChange={(o) => !o && setQuestionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle2>
              Excluir pergunta?
            </AlertDialogTitle2>
            <AlertDialogDescription>
              Excluir "{questionToDelete?.question_text}"? Esta ação é
              permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter2>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter2>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default QuestionsManager;
