export type Priority = "low" | "medium" | "high" | "urgent";

export const PRIORITIES: {
  value: Priority;
  label: string;
  dot: string;
  chip: string;
}[] = [
  {
    value: "low",
    label: "Baixa",
    dot: "bg-slate-400",
    chip: "bg-slate-500/15 text-slate-300 border-slate-400/30",
  },
  {
    value: "medium",
    label: "Média",
    dot: "bg-sky-400",
    chip: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  },
  {
    value: "high",
    label: "Alta",
    dot: "bg-amber-400",
    chip: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  },
  {
    value: "urgent",
    label: "Urgente",
    dot: "bg-red-500",
    chip: "bg-red-500/15 text-red-300 border-red-400/40",
  },
];

export const priorityMeta = (p: Priority | null | undefined) =>
  PRIORITIES.find((x) => x.value === (p ?? "medium"))!;

export type DeadlineStatus =
  "completed" | "overdue" | "due-soon" | "on-track" | "no-date";

export function deadlineStatus(t: {
  data_fim: string | null;
  completed_at?: string | null;
}): DeadlineStatus {
  if (t.completed_at) return "completed";
  if (!t.data_fim) return "no-date";
  const end = new Date(t.data_fim).getTime();
  const now = Date.now();
  if (end < now) return "overdue";
  if (end - now < 1000 * 60 * 60 * 24 * 3) return "due-soon";
  return "on-track";
}

export const statusMeta: Record<
  DeadlineStatus,
  { label: string; chip: string; bar: string }
> = {
  completed: {
    label: "Concluído",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    bar: "bg-emerald-500",
  },
  overdue: {
    label: "Atrasado",
    chip: "bg-red-500/15 text-red-300 border-red-400/40",
    bar: "bg-red-500",
  },
  "due-soon": {
    label: "Próximo",
    chip: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    bar: "bg-amber-400",
  },
  "on-track": {
    label: "No prazo",
    chip: "bg-sky-500/15 text-sky-300 border-sky-400/30",
    bar: "bg-sky-400",
  },
  "no-date": {
    label: "Sem prazo",
    chip: "bg-muted text-muted-foreground border-border/40",
    bar: "bg-muted-foreground/40",
  },
};

export type TaskLike = {
  id: string;
  parent_task_id: string | null;
  data_fim: string | null;
  completed_at: string | null;
};

export function funnelProgress(tasks: TaskLike[]) {
  const parents = tasks.filter((t) => !t.parent_task_id);
  const total = parents.length;
  const done = parents.filter((t) => !!t.completed_at).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const anyOverdue = parents.some((t) => deadlineStatus(t) === "overdue");
  const allDone = total > 0 && done === total;
  const status: DeadlineStatus = allDone
    ? "completed"
    : anyOverdue
      ? "overdue"
      : total === 0
        ? "no-date"
        : "on-track";
  const endDates = parents.map((t) => t.data_fim).filter(Boolean) as string[];
  const dueAt = endDates.length ? endDates.sort().slice(-1)[0] : null;
  return { total, done, pct, status, dueAt };
}

export function dateRange(
  tasks: TaskLike[] & { data_inicio?: string | null }[],
) {
  const starts = (tasks as any[])
    .map((t) => t.data_inicio)
    .filter(Boolean) as string[];
  const ends = (tasks as any[])
    .map((t) => t.data_fim)
    .filter(Boolean) as string[];
  return {
    start: starts.length ? starts.sort()[0] : null,
    end: ends.length ? ends.sort().slice(-1)[0] : null,
  };
}

export const fmtDate = (s: string | null | undefined) =>
  s
    ? new Date(s).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : "—";
